import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/env';

const genAI = config.geminiApiKey
  ? new GoogleGenerativeAI(config.geminiApiKey)
  : null;

export interface Verdict {
  verdict: 'legit' | 'sketchy' | 'mixed' | 'unknown';
  confidence: number;
  summary: string;
  tldr: string;
  pros: string[];
  cons: string[];
  quotes: Array<{ text: string; source: string; url: string }>;
  marketing_claims: string[];
  reality: string[];
}

export interface ShowdownResult {
  left: Verdict;
  right: Verdict;
  winner: string;
  reason: string;
}

const SYSTEM_PROMPT = `You are The Truth Serum — a brutally honest, skeptical consumer advocate.

You analyze raw web content (scraped from Reddit, forums, reviews) about a product/brand/trend and produce a structured verdict.

RULES:
- Weigh negative signals more heavily than positive ones. Products with mostly positive but a few alarming negatives should get "mixed".
- Extract DIRECT quotes with source attribution when available.
- marketing_claims: what the company/brand SAYS about itself (extracted from the content or inferred from marketing language)
- reality: what REAL USERS actually experience (extracted from user comments/reviews)
- Be specific, factual, and blunt. No corporate speak.
- confidence is 0-100 representing how confident you are in the verdict based on evidence quality.

Return ONLY valid JSON matching this schema:
{
  "verdict": "legit" | "sketchy" | "mixed" | "unknown",
  "confidence": number (0-100),
  "summary": "2-3 sentence summary",
  "tldr": "One punchy sentence",
  "pros": ["pro 1", "pro 2", ...],
  "cons": ["con 1", "con 2", ...],
  "quotes": [{"text": "exact quote", "source": "source name", "url": "url"}],
  "marketing_claims": ["claim 1", "claim 2", ...],
  "reality": ["reality 1", "reality 2", ...]
}`;

const SHOWDOWN_PROMPT = `You are The Truth Serum — a brutally honest, skeptical consumer advocate.

You are given raw web content for TWO products. Analyze both and produce a structured comparison.

RULES:
- Be fair but blunt. Call out BS on both sides.
- The winner is whichever product has genuinely better real-world reception — not better marketing.
- confidence is 0-100 for each product independently.

Return ONLY valid JSON matching this schema:
{
  "left": { "verdict": "legit"|"sketchy"|"mixed"|"unknown", "confidence": number, "summary": "...", "tldr": "...", "pros": [...], "cons": [...], "quotes": [...], "marketing_claims": [...], "reality": [...] },
  "right": { "verdict": "legit"|"sketchy"|"mixed"|"unknown", "confidence": number, "summary": "...", "tldr": "...", "pros": [...], "cons": [...], "quotes": [...], "marketing_claims": [...], "reality": [...] },
  "winner": "left product name or right product name",
  "reason": "One sentence explaining why"
}`;

function fallbackVerdict(): Verdict {
  return {
    verdict: 'unknown',
    confidence: 0,
    summary: 'Could not analyze this product. Try again.',
    tldr: 'Analysis unavailable.',
    pros: [],
    cons: [],
    quotes: [],
    marketing_claims: [],
    reality: [],
  };
}

export async function analyzeVerdict(query: string, rawContent: string): Promise<Verdict> {
  if (!genAI) {
    console.warn('[truth-serum] Gemini not configured, returning fallback');
    return fallbackVerdict();
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const result = await model.generateContent(
      `${SYSTEM_PROMPT}\n\nUser query: "${query}"\n\nRaw web content:\n${rawContent}`,
    );

    const text = result.response.text();
    return JSON.parse(text) as Verdict;
  } catch (error) {
    console.error('[truth-serum] Gemini verdict error:', error instanceof Error ? error.message : error);
    return fallbackVerdict();
  }
}

export async function analyzeShowdown(
  leftQuery: string,
  leftContent: string,
  rightQuery: string,
  rightContent: string,
): Promise<ShowdownResult> {
  if (!genAI) {
    return {
      left: fallbackVerdict(),
      right: fallbackVerdict(),
      winner: 'unknown',
      reason: 'Analysis unavailable.',
    };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `${SHOWDOWN_PROMPT}

Left product: "${leftQuery}"
Raw web content for left:
${leftContent}

---

Right product: "${rightQuery}"
Raw web content for right:
${rightContent}`;

    const result = await model.generateContent(prompt);

    const text = result.response.text();
    return JSON.parse(text) as ShowdownResult;
  } catch (error) {
    console.error('[truth-serum] Gemini showdown error:', error instanceof Error ? error.message : error);
    return {
      left: fallbackVerdict(),
      right: fallbackVerdict(),
      winner: 'unknown',
      reason: 'Analysis failed.',
    };
  }
}
