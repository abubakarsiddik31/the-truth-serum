const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const FirecrawlApp = require('@mendable/firecrawl-js').default;

const app = express();
const port = process.env.PORT || 3001;
const elevenLabsAgentId = process.env.ELEVENLABS_AGENT_ID;
const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;

// Initialize Firecrawl only when API key exists (prevents startup crash).
const firecrawl = process.env.FIRECRAWL_API_KEY
  ? new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY })
  : null;

app.use(cors());
app.use(express.json());

const SKEPTIC_KEYWORDS = [
  'bug',
  'broken',
  'issue',
  'problem',
  'refund',
  'scam',
  'overpriced',
  'bait',
  'hype',
  'disappoint',
  'defect',
  'fail',
  'awful',
  'terrible'
];

function getTopicFromBody(body = {}) {
  const candidateKeys = ['topic', 'query', 'product', 'trend'];
  const wrapperKeys = ['parameters', 'body', 'payload', 'request_body', 'data', 'input', 'args'];

  const findTopic = (value, depth = 0) => {
    if (depth > 6 || value == null) {
      return '';
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) {
        return '';
      }
      // Nested strings are treated as direct values.
      if (depth > 0) {
        return trimmed;
      }
      // Top-level raw JSON string body fallback.
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try {
          return findTopic(JSON.parse(trimmed), depth + 1);
        } catch {
          return '';
        }
      }
      return '';
    }

    if (Array.isArray(value)) {
      // Handle array-style tool parameter payloads.
      for (const item of value) {
        if (!item || typeof item !== 'object') {
          continue;
        }
        const keyName = [item.name, item.id, item.key, item.field]
          .find((v) => typeof v === 'string');
        const valCandidate = [item.value, item.constant_value, item.text]
          .find((v) => typeof v === 'string' && v.trim());
        if (typeof keyName === 'string' && candidateKeys.includes(keyName) && typeof valCandidate === 'string') {
          return valCandidate.trim();
        }
      }

      for (const item of value) {
        const found = findTopic(item, depth + 1);
        if (found) {
          return found;
        }
      }

      return '';
    }

    if (typeof value !== 'object') {
      return '';
    }

    for (const key of candidateKeys) {
      const field = value[key];
      if (typeof field === 'string' && field.trim()) {
        return field.trim();
      }
    }

    for (const key of wrapperKeys) {
      const nested = value[key];
      const found = findTopic(nested, depth + 1);
      if (found) {
        return found;
      }
    }

    for (const nestedValue of Object.values(value)) {
      const found = findTopic(nestedValue, depth + 1);
      if (found) {
        return found;
      }
    }

    return '';
  };

  return findTopic(body);
}

function scoreLine(line) {
  const lowered = line.toLowerCase();
  let score = 0;

  for (const keyword of SKEPTIC_KEYWORDS) {
    if (lowered.includes(keyword)) {
      score += 2;
    }
  }

  if (/\b\d+\s*(upvotes?|points?)\b/i.test(line)) {
    score += 1;
  }

  if (line.length > 220) {
    score -= 1;
  }

  return score;
}

function extractFindings(markdown = '') {
  const lines = markdown
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length >= 35 && !line.startsWith('#'));

  return lines
    .map((line) => ({ line, score: scoreLine(line) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => item.line);
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'truth-serum-backend',
    firecrawlConfigured: Boolean(process.env.FIRECRAWL_API_KEY),
    elevenLabsConfigured: Boolean(elevenLabsApiKey && elevenLabsAgentId)
  });
});

app.get('/api/elevenlabs/signed-url', async (_req, res) => {
  if (!elevenLabsApiKey || !elevenLabsAgentId) {
    return res.status(500).json({
      error: 'Missing ELEVENLABS_API_KEY or ELEVENLABS_AGENT_ID on the server.'
    });
  }

  try {
    const response = await axios.get(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(elevenLabsAgentId)}`,
      {
        headers: {
          'xi-api-key': elevenLabsApiKey
        },
        timeout: 10_000
      }
    );

    const signedUrl = response.data?.signed_url;
    if (!signedUrl) {
      return res.status(502).json({ error: 'ElevenLabs did not return a signed URL.' });
    }

    return res.json({ signedUrl });
  } catch (error) {
    const message = error.response?.data || error.message;
    console.error('[Error] Failed to get ElevenLabs signed URL:', message);
    return res.status(502).json({ error: 'Failed to get signed URL from ElevenLabs.' });
  }
});

/**
 * ElevenLabs Tool: get_the_real_deal
 * This endpoint is called by the ElevenLabs Conversational Agent.
 * It searches Reddit for unfiltered opinions on a topic.
 */
app.post('/api/search', async (req, res) => {
  const topic = getTopicFromBody(req.body);

  if (!topic) {
    console.warn('[Truth Serum] Missing topic in payload:', JSON.stringify(req.body || {}).slice(0, 1000));
    const fallback = 'I could not find a topic in the tool payload. Please retry and include a topic like "Cybertruck".';
    return res.json({
      topic: '',
      findings: [],
      threads: [],
      summary: fallback,
      result: fallback
    });
  }

  if (!process.env.FIRECRAWL_API_KEY) {
    return res.status(500).json({ error: 'FIRECRAWL_API_KEY is not configured.' });
  }
  if (!firecrawl) {
    return res.status(500).json({ error: 'Firecrawl client is not initialized.' });
  }

  console.log(`[Truth Serum] Scouring the depths for: "${topic}"...`);
  const query = `${topic} (site:reddit.com OR site:forum.com)`;
  console.log(`[Truth Serum] Firecrawl Query: ${query}`);

  try {
    // Optimized search: limit to 3 results and use a shorter timeout if possible.
    const searchResponse = await firecrawl.search(
      query,
      {
        limit: 3,
        scrapeOptions: {
          formats: ['markdown'],
          onlyMainContent: true
        }
      }
    );

    console.log(`[Truth Serum] Firecrawl Search complete.`);
    
    // In Firecrawl v4+, results are often under the 'web' property
    const searchData = searchResponse.web || searchResponse.data || [];
    
    if (!searchData || searchData.length === 0) {
      console.warn(`[Truth Serum] No results found. Raw response:`, JSON.stringify(searchResponse).slice(0, 500));
      const summary =
        "I couldn't find any real talk on this. Either it's too obscure or everyone's already been silenced by the marketing department.";
      return res.status(200).json({
        topic,
        findings: [],
        threads: [],
        result: summary,
        debug: { status: 'no_results', raw: searchResponse }
      });
    }

    console.log(`[Truth Serum] Results Found: ${searchData.length}`);

    const threads = searchData.map((item) => {
      const title = item.title || item.metadata?.title || 'Unknown Thread';
      const url = item.url || item.metadata?.sourceURL || '';
      const markdown = item.markdown || item.description || '';
      const findings = extractFindings(markdown);

      return {
        title,
        url,
        findings: findings.length > 0 ? findings : [item.description].filter(Boolean),
        excerpt: markdown.slice(0, 600)
      };
    });

    const topFindings = threads
      .flatMap((thread) => thread.findings)
      .slice(0, 8);

    const findingsSection =
      topFindings.length > 0
        ? topFindings.map((line, index) => `${index + 1}. ${line}`).join('\n')
        : '1. Evidence was thin; mostly generic opinions with low detail.';

    const threadsSection = threads
      .map((thread) => `- ${thread.title}${thread.url ? ` (${thread.url})` : ''}`)
      .join('\n');

    const summary = [
      `Topic: ${topic}`,
      '',
      'Raw findings from real users:',
      findingsSection,
      '',
      'Sources scanned:',
      threadsSection,
      '',
      'Respond with blunt honesty, but stay factual and avoid claims not present in this evidence.'
    ].join('\n');

    // Return a clean response. ElevenLabs tools work best when the main
    // answer is in the "result" field or returned as a string.
    return res.status(200).json({
      result: summary,
      topic,
      found_count: topFindings.length,
      debug: {
        raw_results_count: searchResponse.data?.length || 0,
        threads_scanned: threads.map(t => t.title)
      }
    });
  } catch (error) {
    const message = error.response?.data || error.message;
    console.error('[Error] Firecrawl Search failed:', message);
    const fallback = 'The Truth Serum is temporarily clogged. I could not retrieve live Reddit/forum evidence this turn.';
    return res.status(200).json({
      result: fallback,
      topic,
      error: true
    });
  }
});

app.use((err, _req, res, _next) => {
  console.error('[Error] Unhandled server error:', err);
  res.status(500).json({ error: 'Unexpected server failure.' });
});

app.listen(port, () => {
  console.log(`[Truth Serum] Backend bridge running on http://localhost:${port}`);
});
