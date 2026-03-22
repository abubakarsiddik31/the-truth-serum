import { Router } from 'express';
import config from '../config/env';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'truth-serum',
    firecrawlConfigured: Boolean(config.firecrawlApiKey),
    elevenLabsConfigured: Boolean(config.elevenLabs.apiKey && config.elevenLabs.agentId),
  });
});

export default router;
