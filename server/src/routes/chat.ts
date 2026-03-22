import { Router } from 'express';
import { searchTopic } from '../services/search';
import { scrapeAndSearch } from '../services/scrape';
import { analyzeVerdict, analyzeShowdown } from '../services/llm';

const router = Router();

const URL_REGEX = /^https?:\/\//i;

function isUrl(input: string): boolean {
  return URL_REGEX.test(input);
}

router.post('/', async (req, res) => {
  const { query, compare } = req.body as { query?: string; compare?: string };

  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'Missing query field.' });
  }

  const trimmedQuery = query.trim();

  try {
    // Showdown mode
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
        leftTier: leftSearch.tier,
        rightTier: rightSearch.tier,
        source_count: leftSearch.source_count + rightSearch.source_count,
        sources: [...leftSearch.sources, ...rightSearch.sources],
        ...showdown,
      });
    }

    // URL mode: scrape the product page + search for opinions
    if (isUrl(trimmedQuery)) {
      console.log(`[truth-serum] URL detected, scraping: ${trimmedQuery}`);
      const scrapeResult = await scrapeAndSearch(trimmedQuery);
      const verdict = await analyzeVerdict(scrapeResult.product_name, scrapeResult.product_content);

      return res.json({
        type: 'verdict' as const,
        query: scrapeResult.product_name,
        url: scrapeResult.url,
        tier: 'reddit' as const,
        source_count: scrapeResult.source_count,
        ...verdict,
      });
    }

    // Standard text query
    console.log(`[truth-serum] analyzing: "${trimmedQuery}"`);
    const searchResult = await searchTopic(trimmedQuery);
    const verdict = await analyzeVerdict(trimmedQuery, searchResult.result);

    return res.json({
      type: 'verdict' as const,
      query: trimmedQuery,
      tier: searchResult.tier,
      source_count: searchResult.source_count,
      sources: searchResult.sources,
      ...verdict,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[truth-serum] chat error:', msg);
    return res.status(500).json({ error: 'Analysis failed. Please try again.' });
  }
});

export default router;
