import firecrawl from '../config/firecrawl';
import { extractFindings } from '../utils/extractFindings';

interface SearchResult {
  result: string;
  topic: string;
  findings?: string[];
  threads?: { title: string; url: string }[];
  found_count?: number;
  debug?: {
    raw_results_count: number;
    threads_scanned: string[];
  };
}

export async function searchTopic(topic: string): Promise<SearchResult> {
  if (!firecrawl) {
    throw new Error('Firecrawl is not configured.');
  }

  const query = `${topic} (site:reddit.com OR site:forum.com)`;
  console.log(`[truth-serum] searching: "${topic}"`);

  const searchResponse = await firecrawl.search(query, {
    limit: 10,
    scrapeOptions: { formats: ['markdown'], onlyMainContent: true },
  });

  const raw = searchResponse as Record<string, unknown>;
  const searchData = (raw.web ?? raw.data ?? []) as Array<Record<string, unknown>>;

  if (!searchData.length) {
    return {
      result: "Couldn't find any real talk on this. Either it's too obscure or everyone's been silenced.",
      topic,
      findings: [],
      threads: [],
    };
  }

  console.log(`[truth-serum] found ${searchData.length} results`);

  const threads = searchData.map((item) => {
    const meta = (item.metadata ?? {}) as Record<string, unknown>;
    const title = (item.title ?? meta.title ?? 'Unknown Thread') as string;
    const url = (item.url ?? meta.sourceURL ?? '') as string;
    const markdown = (item.markdown ?? item.description ?? '') as string;
    const findings = extractFindings(markdown);
    return {
      title,
      url,
      findings: findings.length > 0 ? findings : [item.description as string].filter(Boolean),
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

  return {
    result: summary,
    topic,
    found_count: topFindings.length,
    debug: {
      raw_results_count: searchData.length,
      threads_scanned: threads.map((t) => t.title),
    },
  };
}
