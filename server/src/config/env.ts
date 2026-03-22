import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
  port: Number(process.env.PORT) || 3001,
  firecrawlApiKey: process.env.FIRECRAWL_API_KEY ?? '',
  geminiApiKey: process.env.GEMINI_API_KEY ?? '',
  elevenLabs: {
    apiKey: process.env.ELEVENLABS_API_KEY ?? '',
    agentId: process.env.ELEVENLABS_AGENT_ID ?? '',
  },
} as const;

export default config;
