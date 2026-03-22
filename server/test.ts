import { extractTopic } from './src/utils/extractTopic';
import { searchTopic } from './src/services/search';

let passed = 0;
let failed = 0;

function assert(condition: boolean, name: string) {
  if (condition) {
    console.log(`  PASS  ${name}`);
    passed++;
  } else {
    console.error(`  FAIL  ${name}`);
    failed++;
  }
}

function section(name: string) {
  console.log(`\n--- ${name} ---`);
}

// ============================================================
// Unit tests (no network)
// ============================================================

section('extractTopic');

assert(extractTopic({ topic: 'Cybertruck' }) === 'Cybertruck', 'simple top-level topic');
assert(extractTopic({ query: 'AirPods Pro' }) === 'AirPods Pro', 'query key');
assert(extractTopic({ product: 'Tesla' }) === 'Tesla', 'product key');
assert(extractTopic({ parameters: { topic: 'Mac Neo' } }) === 'Mac Neo', 'nested in parameters');
assert(extractTopic({ body: { data: { query: 'iPhone 16' } } }) === 'iPhone 16', 'deeply nested');
assert(extractTopic({ payload: { trend: 'AI Wearables' } }) === 'AI Wearables', 'trend in payload');
assert(extractTopic({}) === '', 'empty object returns empty');
assert(extractTopic({ foo: 'bar' }) === 'bar', 'non-candidate key still finds nested string value');
assert(extractTopic('{"topic":"FromJSON"}') === 'FromJSON', 'JSON string body');
assert(
  extractTopic([{ name: 'topic', value: 'ArrayStyle' }]) === 'ArrayStyle',
  'array-style tool params',
);
assert(extractTopic({ topic: '  spaced  ' }) === 'spaced', 'trims whitespace');
assert(extractTopic(null) === '', 'null body');
assert(extractTopic(undefined) === '', 'undefined body');

// ============================================================
// Integration tests (hits Firecrawl API)
// ============================================================

section('searchTopic (live API)');

async function testSearch() {
  const topics = ['Cybertruck', 'Mac Neo', 'iPhone 16'];

  for (const topic of topics) {
    try {
      console.log(`\n  Testing "${topic}"...`);
      const result = await searchTopic(topic);

      assert(result.topic === topic, `${topic}: topic field matches`);
      assert(typeof result.result === 'string' && result.result.length > 0, `${topic}: result is non-empty`);
      assert(result.source_count > 0, `${topic}: found sources (count: ${result.source_count})`);
      assert(result.result.includes('RAW WEB CONTENT'), `${topic}: contains raw content section`);
      assert(result.result.includes('Source:'), `${topic}: contains source URLs`);

      console.log(`    -> ${result.source_count} sources, ${result.result.length} chars total`);
      // Show a snippet of what the LLM will receive
      const preview = result.result.slice(0, 200).replace(/\n/g, ' ');
      console.log(`    -> Preview: ${preview}...`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('not configured')) {
        console.log(`  SKIP  ${topic}: Firecrawl not configured (no API key)`);
      } else {
        assert(false, `${topic}: unexpected error - ${msg}`);
      }
    }
  }
}

async function main() {
  await testSearch();

  console.log(`\n=============================`);
  console.log(`  ${passed} passed, ${failed} failed`);
  console.log(`=============================\n`);

  process.exit(failed > 0 ? 1 : 0);
}

main();
