import { Router } from 'express';
import { getSignedUrl } from '../services/elevenlabs';

const router = Router();

router.get('/signed-url', async (_req, res) => {
  try {
    const signedUrl = await getSignedUrl();
    return res.json({ signedUrl });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[truth-serum] signed-url error:', msg);
    const status = msg.includes('Missing') ? 500 : 502;
    return res.status(status).json({ error: msg });
  }
});

export default router;
