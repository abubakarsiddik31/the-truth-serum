import firecrawl from '../config/firecrawl';

export type SearchTier = 'reddit' | 'reviews' | 'web';

export interface SearchResult {
  result: string;
  topic: string;
  source_count: number;
  tier: SearchTier;
}

async function firecrawlSearch(query: string, limit: number) {
  const response = await firecrawl!.search(query, {
    limit,
    scrapeOptions: { formats: ['markdown'], onlyMainContent: true },
  });
  const raw = response as Record<string, unknown>;
  return (raw.web ?? raw.data ?? []) as Array<Record<string, unknown>>;
}

const MAX_CONTENT_PER_SOURCE = 3000;
const MAX_TOTAL_CONTENT = 30000;

export async function searchTopic(topic: string): Promise<SearchResult> {
  if (!firecrawl) {
    throw new Error('Firecrawl is not configured.');
  }

  console.log(`[truth-serum] searching: "${topic}"`);

  let tier: SearchTier = 'reddit';

  // 1. Try Reddit/forums first for authentic user opinions
  let searchData = await firecrawlSearch(
    `${topic} (site:reddit.com OR site:forum.com)`,
    15,
  );

  // 2. If nothing on Reddit, broaden to review sites
  if (!searchData.length) {
    tier = 'reviews';
    console.log(`[truth-serum] no Reddit results, trying review sites`);
    searchData = await firecrawlSearch(
      `${topic} review OR opinions OR complaints OR experience`,
      15,
    );
  }

  // 3. Last resort: broad web search
  if (!searchData.length) {
    tier = 'web';
    console.log(`[truth-serum] no review results, trying broad search`);
    searchData = await firecrawlSearch(topic, 15);
  }

  if (!searchData.length) {
    return {
      result: `No results found for "${topic}". Either it's too obscure or there's no public discussion yet.`,
      topic,
      source_count: 0,
      tier,
    };
  }

  console.log(`[truth-serum] found ${searchData.length} results`);

  // Pass raw content to the LLM — let it decide what matters
  let totalLength = 0;
  const sources: string[] = [];

  for (const item of searchData) {
    const meta = (item.metadata ?? {}) as Record<string, unknown>;
    const title = (item.title ?? meta.title ?? 'Untitled') as string;
    const url = (item.url ?? meta.sourceURL ?? '') as string;
    const content = (item.markdown ?? item.description ?? '') as string;
    const trimmed = content.slice(0, MAX_CONTENT_PER_SOURCE);

    const block = `### ${title}\nSource: ${url}\n\n${trimmed}`;

    if (totalLength + block.length > MAX_TOTAL_CONTENT) break;
    sources.push(block);
    totalLength += block.length;
  }

  const result = [
    `Topic: ${topic}`,
    `Sources found: ${searchData.length}`,
    '',
    '--- RAW WEB CONTENT ---',
    '',
    sources.join('\n\n---\n\n'),
  ].join('\n');

  return {
    result,
    topic,
    source_count: sources.length,
    tier,
  };
}
