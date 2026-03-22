import firecrawl from '../config/firecrawl';
import { searchTopic } from './search';

const MAX_SCRAPED_CONTENT = 5000;

export interface ScrapeResult {
  product_name: string;
  product_content: string;
  search_content: string;
  source_count: number;
  url: string;
}

export async function scrapeAndSearch(url: string): Promise<ScrapeResult> {
  if (!firecrawl) {
    throw new Error('Firecrawl is not configured.');
  }

  console.log(`[truth-serum] scraping URL: ${url}`);

  // 1. Scrape the product page directly
  const scrapeResponse = await firecrawl.scrape(url, {
    formats: ['markdown'],
    onlyMainContent: true,
  });

  const scraped = scrapeResponse as Record<string, unknown>;
  const markdown = (scraped.markdown ?? '') as string;
  const meta = (scraped.metadata ?? {}) as Record<string, unknown>;
  const title = (meta.title ?? meta.ogTitle ?? '') as string;

  // Extract a product name from the page title or URL
  const productName = title
    ? title.replace(/[-|–—].*$/, '').replace(/\s*(Buy|Shop|Order|Price|Sale|Amazon\.com).*$/i, '').trim()
    : new URL(url).hostname;

  const productContent = markdown.slice(0, MAX_SCRAPED_CONTENT);

  console.log(`[truth-serum] scraped product: "${productName}" (${productContent.length} chars)`);

  // 2. Search for real opinions about this product
  const searchResult = await searchTopic(productName);

  // 3. Combine scraped product page + search results
  const combined = [
    '=== PRODUCT PAGE (scraped directly) ===',
    `URL: ${url}`,
    `Title: ${title}`,
    '',
    productContent,
    '',
    '=== REAL USER OPINIONS (from web search) ===',
    '',
    searchResult.result,
  ].join('\n');

  return {
    product_name: productName,
    product_content: combined,
    search_content: searchResult.result,
    source_count: searchResult.source_count + 1, // +1 for the scraped page
    url,
  };
}
