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

const firecrawl = process.env.FIRECRAWL_API_KEY
  ? new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY })
  : null;

app.use(cors());
app.use(express.json());

const SKEPTIC_KEYWORDS = [
  'bug', 'broken', 'issue', 'problem', 'refund', 'scam',
  'overpriced', 'bait', 'hype', 'disappoint', 'defect',
  'fail', 'awful', 'terrible',
];

function getTopicFromBody(body = {}) {
  const candidateKeys = ['topic', 'query', 'product', 'trend'];
  const wrapperKeys = ['parameters', 'body', 'payload', 'request_body', 'data', 'input', 'args'];

  const findTopic = (value, depth = 0) => {
    if (depth > 6 || value == null) return '';

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return '';
      if (depth > 0) return trimmed;
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try { return findTopic(JSON.parse(trimmed), depth + 1); } catch { return ''; }
      }
      return '';
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (!item || typeof item !== 'object') continue;
        const keyName = [item.name, item.id, item.key, item.field].find((v) => typeof v === 'string');
        const valCandidate = [item.value, item.constant_value, item.text].find((v) => typeof v === 'string' && v.trim());
        if (typeof keyName === 'string' && candidateKeys.includes(keyName) && typeof valCandidate === 'string') {
          return valCandidate.trim();
        }
      }
      for (const item of value) {
        const found = findTopic(item, depth + 1);
        if (found) return found;
      }
      return '';
    }

    if (typeof value !== 'object') return '';

    for (const key of candidateKeys) {
      const field = value[key];
      if (typeof field === 'string' && field.trim()) return field.trim();
    }
    for (const key of wrapperKeys) {
      const found = findTopic(value[key], depth + 1);
      if (found) return found;
    }
    for (const nestedValue of Object.values(value)) {
      const found = findTopic(nestedValue, depth + 1);
      if (found) return found;
    }
    return '';
  };

  return findTopic(body);
}

function scoreLine(line) {
  const lowered = line.toLowerCase();
  let score = 0;
  for (const keyword of SKEPTIC_KEYWORDS) {
    if (lowered.includes(keyword)) score += 2;
  }
  if (/\b\d+\s*(upvotes?|points?)\b/i.test(line)) score += 1;
  if (line.length > 220) score -= 1;
  return score;
}

function extractFindings(markdown = '') {
  const lines = markdown
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length >= 35 && !l.startsWith('#'));

  return lines
    .map((line) => ({ line, score: scoreLine(line) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => item.line);
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'truth-serum',
    firecrawlConfigured: Boolean(process.env.FIRECRAWL_API_KEY),
    elevenLabsConfigured: Boolean(elevenLabsApiKey && elevenLabsAgentId),
  });
});

app.get('/api/elevenlabs/signed-url', async (_req, res) => {
  if (!elevenLabsApiKey || !elevenLabsAgentId) {
    return res.status(500).json({ error: 'Missing ELEVENLABS_API_KEY or ELEVENLABS_AGENT_ID.' });
  }

  try {
    const response = await axios.get(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(elevenLabsAgentId)}`,
      { headers: { 'xi-api-key': elevenLabsApiKey }, timeout: 10_000 }
    );
    const signedUrl = response.data?.signed_url;
    if (!signedUrl) {
      return res.status(502).json({ error: 'ElevenLabs did not return a signed URL.' });
    }
    return res.json({ signedUrl });
  } catch (error) {
    console.error('[truth-serum] signed-url error:', error.response?.data || error.message);
    return res.status(502).json({ error: 'Failed to get signed URL from ElevenLabs.' });
  }
});

app.post('/api/search', async (req, res) => {
  const topic = getTopicFromBody(req.body);

  if (!topic) {
    const fallback = 'No topic found in request. Please retry with a topic like "Cybertruck".';
    return res.json({ topic: '', findings: [], threads: [], summary: fallback, result: fallback });
  }

  if (!firecrawl) {
    return res.status(500).json({ error: 'Firecrawl is not configured.' });
  }

  console.log(`[truth-serum] searching: "${topic}"`);
  const query = `${topic} (site:reddit.com OR site:forum.com)`;

  try {
    const searchResponse = await firecrawl.search(query, {
      limit: 10,
      scrapeOptions: { formats: ['markdown'], onlyMainContent: true },
    });

    const searchData = searchResponse.web || searchResponse.data || [];

    if (!searchData.length) {
      const summary = "Couldn't find any real talk on this. Either it's too obscure or everyone's been silenced.";
      return res.json({ topic, findings: [], threads: [], result: summary });
    }

    console.log(`[truth-serum] found ${searchData.length} results`);

    const threads = searchData.map((item) => {
      const title = item.title || item.metadata?.title || 'Unknown Thread';
      const url = item.url || item.metadata?.sourceURL || '';
      const markdown = item.markdown || item.description || '';
      const findings = extractFindings(markdown);
      return {
        title,
        url,
        findings: findings.length > 0 ? findings : [item.description].filter(Boolean),
        excerpt: markdown.slice(0, 600),
      };
    });

    const topFindings = threads.flatMap((t) => t.findings).slice(0, 10);
    const findingsSection = topFindings.length > 0
      ? topFindings.map((line, i) => `${i + 1}. ${line}`).join('\n')
      : '1. Evidence was thin; mostly generic opinions with low detail.';

    const threadsSection = threads
      .map((t) => `- ${t.title}${t.url ? ` (${t.url})` : ''}`)
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
      'Respond with blunt honesty, but stay factual and avoid claims not present in this evidence.',
    ].join('\n');

    return res.json({
      result: summary,
      topic,
      found_count: topFindings.length,
      debug: {
        raw_results_count: searchData.length,
        threads_scanned: threads.map((t) => t.title),
      },
    });
  } catch (error) {
    console.error('[truth-serum] search error:', error.response?.data || error.message);
    return res.json({
      result: 'The Truth Serum is temporarily clogged. Could not retrieve live evidence this turn.',
      topic,
      error: true,
    });
  }
});

app.use((err, _req, res, _next) => {
  console.error('[truth-serum] unhandled error:', err);
  res.status(500).json({ error: 'Unexpected server failure.' });
});

app.listen(port, () => {
  console.log(`[truth-serum] running on http://localhost:${port}`);
});
