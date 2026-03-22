import { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check, ExternalLink, Mic } from 'lucide-react';
import { cn } from '../lib/utils';


const AGENT_PROMPT = `# Personality
You are "The Truth Serum," an elite internet researcher with a cynical, brutally honest, and highly intelligent persona. You have a "seen it all" attitude, and your communication style is a blend of a noir detective and a modern tech whistleblower. Your mantra is: "Trust no one, especially the marketing department." You are unimpressed by brands and value raw, unfiltered data from sources like Reddit and forums far more than polished press releases or corporate fluff.

# Environment
You are engaged in a direct, spoken dialogue with a user who is seeking to cut through marketing hype and uncover the real public sentiment about brands, products, or trends. This is a voice-based interaction, so your responses must be clear, articulate, and optimized for speech synthesis.

# Tone
Your tone is sardonic, witty, and unapologetically blunt. You speak with a confident, slightly jaded cadence. You will never apologize for your directness. Your language reflects your skepticism, using phrases like: "The unfiltered truth is...", "Reddit is currently roasting them for...", or "Don't believe the billboard, here's the reality." Adapt your pacing to emphasize key revelations and deliver your verdicts with a decisive, sassy punchline. Use short dramatic pauses naturally through sentence structure — never use bracket notation like [sighs] or [pauses] as the voice engine reads those literally.

# Goal
Your sole purpose is to debunk marketing hype, corporate fluff, and "influencer" lies by uncovering what real people actually think.

## Single Product Queries
When a user asks about ONE product, brand, or trend:
1. **Trigger Tool**: IMMEDIATELY trigger \`get_the_real_deal\` with the product name.
2. **Engage While Searching**: Keep the user engaged with a cynical remark. Example: "Scanning the depths of Reddit... let's see how much they paid for these reviews." or "Alright, let's see what the internet really thinks, beyond the glossy ads."
3. **Deliver The Verdict**: Synthesize the results into a concise spoken report:
   - Lead with your verdict: "Legit", "Sketchy", "Mixed", or "Not enough data"
   - Hit the top 3 complaints or hidden truths from real users
   - Call out if sentiment is overwhelmingly negative, suspiciously positive, or polarized
   - End with a sassy one-liner punchline that sums it up

## Comparison Queries (VS Mode)
When a user asks to COMPARE two things — phrases like "X vs Y", "X or Y", "should I get X or Y", "which is better X or Y", "X compared to Y":
1. **Trigger Tool TWICE**: Call \`get_the_real_deal\` for EACH product separately. Say something like: "Oh, a showdown. Let me dig up the dirt on both of these..."
2. **Structure Your Response as a Face-Off**:
   - First, give a quick 2-3 sentence verdict on Product A — what real users love and hate
   - Then transition: "Now let's talk about the competition..." and give 2-3 sentences on Product B
   - Then declare the winner: "And the winner is..." followed by a clear pick and a one-sentence reason WHY based on real user sentiment, not marketing
   - If both are bad, say so: "Honestly? Both are questionable, but if I had to pick the lesser evil..."
   - If both are good, acknowledge it: "This is actually a close one. But the edge goes to..."
3. **Keep it Punchy**: Comparisons should be faster-paced than single verdicts. Don't repeat yourself. Hit the key differences that matter.

## Follow-Up Questions
When a user asks follow-ups like "tell me more about the cons", "what about the price", "is it worth it":
- Reference what you already found — don't re-trigger the tool unless they ask about a NEW product
- Go deeper on the specific angle they asked about
- Stay in character with your cynical delivery

# Guardrails
- NEVER apologize for being blunt or direct. Your honesty is your primary asset.
- NEVER sound like a customer service bot or use polite, deferential language.
- NEVER use bracket notation like [sighs], [chuckles], [pauses] — the voice engine reads these literally. Express tone through word choice and sentence rhythm instead.
- If the tool finds no data, assume it's either too obscure or its online presence has been scrubbed by corporate. State this with your characteristic cynicism.
- Maintain your persona at all times. Do not break character.
- Focus exclusively on uncovering public sentiment and debunking hype. Do not offer personal recommendations or engage in unrelated small talk.

# Tool Usage
- **Name**: \`get_the_real_deal\`
- **Trigger**: Every time a product, brand name, or company is discussed. For comparisons, trigger once per product.
- **Goal**: Get the "raw filth" from the web by searching forums, social media like Reddit, and review sites for genuine user opinions and experiences.`;

const TOOL_CONFIG = (webhookUrl: string) => `{
  "type": "webhook",
  "name": "get_the_real_deal",
  "description": "Searches the unfiltered web (Reddit/Forums) via Firecrawl for the actual truth about a product or brand.",
  "disable_interruptions": false,
  "force_pre_tool_speech": "auto",
  "execution_mode": "immediate",
  "api_schema": {
    "url": "${webhookUrl}/api/search",
    "method": "POST",
    "request_body_schema": {
      "id": "body",
      "type": "object",
      "description": "Body for Truth Serum search.",
      "properties": [
        {
          "id": "topic",
          "type": "string",
          "value_type": "llm_prompt",
          "description": "The brand, product, or trend to investigate.",
          "required": true
        }
      ]
    },
    "request_headers": [
      { "type": "value", "name": "Content-Type", "value": "application/json" }
    ]
  },
  "response_timeout_secs": 20
}`;

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-white/10 border border-zinc-200 dark:border-white/10 text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/20 transition-colors shrink-0"
    >
      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied!' : label}
    </button>
  );
}

type VoiceSetupGuideProps = {
  onSave: (agentId: string, webhookUrl: string) => void;
  savedAgentId: string;
  savedWebhookUrl: string;
};

export function VoiceSetupGuide({ onSave, savedAgentId, savedWebhookUrl }: VoiceSetupGuideProps) {
  const [promptOpen, setPromptOpen] = useState(false);
  const [toolOpen, setToolOpen] = useState(false);
  const [agentId, setAgentId] = useState(savedAgentId);
  const [webhookUrl, setWebhookUrl] = useState(savedWebhookUrl || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!agentId.trim() || !webhookUrl.trim()) return;
    onSave(agentId.trim(), webhookUrl.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const canSave = agentId.trim().length > 0 && webhookUrl.trim().length > 0;

  return (
    // Full-page overlay
    <div className="absolute inset-0 z-50 bg-white dark:bg-[#050505] flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="px-5 pt-8 pb-5 border-b border-zinc-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-500/15 flex items-center justify-center shrink-0">
            <Mic className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-black text-zinc-900 dark:text-white">Set up Voice Mode</h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-500 mt-0.5">
              Bring your own ElevenLabs agent — takes ~2 min
            </p>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
          <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
            We exhausted our ElevenLabs credits while building this during the hackathon.
            Voice mode still works — you just need to connect your own agent below.
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="flex-1 px-5 py-5 space-y-5">

        {/* Step 1 */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">1</span>
            <p className="text-xs font-black text-zinc-900 dark:text-white">Create an ElevenLabs Conversational AI agent</p>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-500 leading-relaxed pl-7">
            Go to{' '}
            <a
              href="https://elevenlabs.io/app/conversational-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-500 hover:underline inline-flex items-center gap-0.5"
            >
              elevenlabs.io/app/conversational-ai
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            , create a new agent, and paste the system prompt below.
          </p>

          <div className="ml-7 rounded-xl border border-zinc-200 dark:border-white/10 overflow-hidden">
            <button
              onClick={() => setPromptOpen((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-zinc-50 dark:bg-white/[0.03] text-left"
            >
              <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">System prompt</span>
              <div className="flex items-center gap-2">
                {promptOpen && <CopyButton text={AGENT_PROMPT} label="Copy" />}
                {promptOpen ? <ChevronUp className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />}
              </div>
            </button>
            {promptOpen && (
              <pre className="px-3 py-2.5 text-[9px] leading-relaxed text-zinc-600 dark:text-zinc-400 max-h-40 overflow-y-auto whitespace-pre-wrap break-words font-mono bg-white dark:bg-black/30 border-t border-zinc-100 dark:border-white/[0.06]">
                {AGENT_PROMPT}
              </pre>
            )}
          </div>
        </div>

        {/* Step 2 */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">2</span>
            <p className="text-xs font-black text-zinc-900 dark:text-white">Add the webhook tool</p>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-500 leading-relaxed pl-7">
            In the agent editor go to <strong className="text-zinc-700 dark:text-zinc-300">Tools → Add Tool → Webhook</strong>.
            Enter your server URL, then copy and paste the tool JSON.
          </p>

          <div className="ml-7 space-y-2">
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-server-url.com"
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-red-400 dark:focus:border-red-500"
            />

            <div className="rounded-xl border border-zinc-200 dark:border-white/10 overflow-hidden">
              <button
                onClick={() => setToolOpen((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-zinc-50 dark:bg-white/[0.03] text-left"
              >
                <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">Tool config (JSON)</span>
                <div className="flex items-center gap-2">
                  {toolOpen && <CopyButton text={TOOL_CONFIG(webhookUrl || 'https://your-server-url.com')} label="Copy" />}
                  {toolOpen ? <ChevronUp className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />}
                </div>
              </button>
              {toolOpen && (
                <pre className="px-3 py-2.5 text-[9px] leading-relaxed text-zinc-600 dark:text-zinc-400 max-h-40 overflow-y-auto whitespace-pre-wrap break-words font-mono bg-white dark:bg-black/30 border-t border-zinc-100 dark:border-white/[0.06]">
                  {TOOL_CONFIG(webhookUrl || 'https://your-server-url.com')}
                </pre>
              )}
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">3</span>
            <p className="text-xs font-black text-zinc-900 dark:text-white">Paste your Agent ID</p>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-500 leading-relaxed pl-7">
            Find it in the agent settings or URL bar. Looks like{' '}
            <code className="text-[10px] bg-zinc-100 dark:bg-white/10 px-1 rounded font-mono">agent_xxxxxxxx</code>
          </p>

          <div className="ml-7 flex gap-2">
            <input
              type="text"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              placeholder="agent_xxxxxxxxxxxxxxxx"
              className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-red-400 dark:focus:border-red-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="sticky bottom-0 px-5 py-4 bg-white dark:bg-[#050505] border-t border-zinc-100 dark:border-white/[0.06]">
        <button
          onClick={handleSave}
          disabled={!canSave}
          className={cn(
            'w-full py-3.5 rounded-2xl text-sm font-black transition-all',
            canSave
              ? 'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] shadow-lg shadow-red-500/20'
              : 'bg-zinc-100 dark:bg-white/5 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
          )}
        >
          {saved ? (
            <span className="flex items-center justify-center gap-2">
              <Check className="w-4 h-4" /> Agent saved — voice mode unlocked
            </span>
          ) : (
            'Enable Voice Mode'
          )}
        </button>
      </div>
    </div>
  );
}
