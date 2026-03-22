import axios from 'axios';
import config from '../config/env';

export async function getSignedUrl(): Promise<string> {
  const { apiKey, agentId } = config.elevenLabs;

  if (!apiKey || !agentId) {
    throw new Error('Missing ELEVENLABS_API_KEY or ELEVENLABS_AGENT_ID.');
  }

  const response = await axios.get(
    `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`,
    { headers: { 'xi-api-key': apiKey }, timeout: 10_000 },
  );

  const signedUrl: string | undefined = response.data?.signed_url;
  if (!signedUrl) {
    throw new Error('ElevenLabs did not return a signed URL.');
  }

  return signedUrl;
}
