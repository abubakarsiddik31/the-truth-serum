import { Router } from 'express';
import { searchTopic } from '../services/search';
import { analyzeVerdict, analyzeShowdown } from '../services/llm';

const router = Router();

router.post('/', async (req, res) => {
  const { query, compare } = req.body as { query?: string; compare?: string };

  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'Missing query field.' });
  }

  const trimmedQuery = query.trim();

  try {
    // Showdown mode: compare two products
    if (compare && typeof compare === 'string' && compare.trim()) {
      const trimmedCompare = compare.trim();
      console.log(`[truth-serum] showdown: "${trimmedQuery}" vs "${trimmedCompare}"`);

      const [leftSearch, rightSearch] = await Promise.all([
        searchTopic(trimmedQuery),
        searchTopic(trimmedCompare),
      ]);

      const showdown = await analyzeShowdown(
        trimmedQuery,
        leftSearch.result,
        trimmedCompare,
        rightSearch.result,
      );

      return res.json({
        type: 'showdown' as const,
        leftQuery: trimmedQuery,
        rightQuery: trimmedCompare,
        ...showdown,
      });
    }

    // Single verdict mode
    console.log(`[truth-serum] analyzing: "${trimmedQuery}"`);
    const searchResult = await searchTopic(trimmedQuery);
    const verdict = await analyzeVerdict(trimmedQuery, searchResult.result);

    return res.json({
      type: 'verdict' as const,
      query: trimmedQuery,
      ...verdict,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[truth-serum] chat error:', msg);
    return res.status(500).json({ error: 'Analysis failed. Please try again.' });
  }
});

export default router;
