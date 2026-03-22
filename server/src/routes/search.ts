import { Router } from 'express';
import { searchTopic } from '../services/search';
import { extractTopic } from '../utils/extractTopic';

const router = Router();

router.post('/', async (req, res) => {
  const topic = extractTopic(req.body);

  if (!topic) {
    const fallback = 'No topic found in request. Please retry with a topic like "Cybertruck".';
    return res.json({ topic: '', findings: [], threads: [], summary: fallback, result: fallback });
  }

  try {
    const result = await searchTopic(topic);
    return res.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[truth-serum] search error:', msg);
    return res.json({
      result: 'The Truth Serum is temporarily clogged. Could not retrieve live evidence this turn.',
      topic,
      error: true,
    });
  }
});

export default router;
