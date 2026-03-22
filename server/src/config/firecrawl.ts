import FirecrawlApp from '@mendable/firecrawl-js';
import config from './env';

const firecrawl = config.firecrawlApiKey
  ? new FirecrawlApp({ apiKey: config.firecrawlApiKey })
  : null;

export default firecrawl;
