require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const FirecrawlApp = require('@mendable/firecrawl-js').default;

const app = express();
const port = process.env.PORT || 3001;
const elevenLabsAgentId = process.env.ELEVENLABS_AGENT_ID;
const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;

// Initialize Firecrawl
const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY
});

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
  const rawTopic = body.topic || body.query || body.product || body.trend;
  if (typeof rawTopic !== 'string') {
    return '';
  }

  return rawTopic.trim();
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
    return res.status(400).json({
      error: 'Missing topic in request body.',
      hint: 'Send one of: topic, query, product, trend'
    });
  }

  if (!process.env.FIRECRAWL_API_KEY) {
    return res.status(500).json({ error: 'FIRECRAWL_API_KEY is not configured.' });
  }

  console.log(`[Truth Serum] Scouring the depths for: ${topic}...`);

  try {
    // Search Reddit using Firecrawl
    const searchResponse = await firecrawl.search(
      `${topic} (site:reddit.com OR site:forum.com)`,
      {
        limit: 5,
        scrapeOptions: {
          formats: ['markdown'],
          onlyMainContent: true
        }
      }
    );

    if (!searchResponse.success || !searchResponse.data || searchResponse.data.length === 0) {
      return res.json({
        topic,
        findings: [],
        threads: [],
        summary:
          "I couldn't find any real talk on this. Either it's too obscure or everyone's already been silenced by the marketing department."
      });
    }

    const threads = searchResponse.data.map((item) => {
      const title = item.metadata?.title || 'Unknown Thread';
      const url = item.url || item.metadata?.sourceURL || '';
      const markdown = item.markdown || '';
      const findings = extractFindings(markdown);

      return {
        title,
        url,
        findings,
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

    return res.json({
      topic,
      findings: topFindings,
      threads,
      summary
    });
  } catch (error) {
    const message = error.response?.data || error.message;
    console.error('[Error] Firecrawl Search failed:', message);
    return res.status(500).json({ error: 'The Truth Serum is temporarily clogged. Try again later.' });
  }
});

app.use((err, _req, res, _next) => {
  console.error('[Error] Unhandled server error:', err);
  res.status(500).json({ error: 'Unexpected server failure.' });
});

app.listen(port, () => {
  console.log(`[Truth Serum] Backend bridge running on http://localhost:${port}`);
});
