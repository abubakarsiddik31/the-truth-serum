require('dotenv').config();
const express = require('express');
const cors = require('cors');
const FirecrawlApp = require('@mendable/firecrawl-js').default;

const app = express();
const port = process.env.PORT || 3001;

// Initialize Firecrawl
const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY
});

app.use(cors());
app.use(express.json());

/**
 * ElevenLabs Tool: get_the_real_deal
 * This endpoint is called by the ElevenLabs Conversational Agent.
 * It searches Reddit for unfiltered opinions on a topic.
 */
app.post('/api/search', async (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Missing topic in request body.' });
  }

  console.log(`[Truth Serum] Scouring the depths for: ${topic}...`);

  try {
    // Search Reddit using Firecrawl
    const searchResponse = await firecrawl.search(`${topic} site:reddit.com`, {
      limit: 3,
      scrapeOptions: {
        formats: ['markdown'],
        onlyMainContent: true
      }
    });

    if (!searchResponse.success || !searchResponse.data || searchResponse.data.length === 0) {
      return res.json({
        summary: "I couldn't find any real talk on this. Either it's too obscure or everyone's already been silenced by the marketing department."
      });
    }

    // Extract key sentiments from the search results
    const results = searchResponse.data.map(item => {
      const title = item.metadata?.title || 'Unknown Thread';
      const content = item.markdown?.substring(0, 500) || 'No content found.';
      return `--- THREAD: ${title} ---\n${content}`;
    }).join('\n\n');

    // Return the "Raw Truth" to the ElevenLabs Agent
    res.json({
      summary: `Here's what the real humans are saying about "${topic}":\n\n${results}\n\nNow go ahead and give the user your brutally honest take based on this filth.`
    });

  } catch (error) {
    console.error('[Error] Firecrawl Search failed:', error.message);
    res.status(500).json({ error: 'The Truth Serum is temporarily clogged. Try again later.' });
  }
});

app.listen(port, () => {
  console.log(`[Truth Serum] Backend bridge running on http://localhost:${port}`);
});
