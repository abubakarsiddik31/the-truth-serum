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

## SCORING RUBRIC (follow strictly)

### Verdict categories:
- "legit" = Overwhelmingly positive real-user sentiment. Few or minor complaints. Product delivers on promises.
- "mixed" = Significant positives AND negatives. Marketing overpromises in some areas. Polarizing opinions.
- "sketchy" = Majority negative sentiment, serious complaints, misleading marketing, or pattern of deception.
- "unknown" = Not enough evidence to judge. Fewer than 3 meaningful data points.

### Confidence score (0-100) — measures EVIDENCE QUALITY, not product quality:
- 85-100: 8+ independent sources with detailed firsthand experiences, consistent patterns
- 70-84: 5-7 sources with some firsthand accounts, mostly consistent
- 50-69: 3-4 sources or mostly secondhand/brief mentions, some contradictions
- 30-49: 1-2 sources or very shallow content, hard to draw conclusions
- 0-29: Almost no real user data, mostly marketing or speculation

### Verdict-confidence alignment:
- "legit" requires confidence >= 50 (need enough evidence to vouch for something)
- "sketchy" requires confidence >= 40 (even a few strong negatives can justify this)
- "mixed" can be any confidence >= 40
- "unknown" should have confidence < 50 (if you had strong evidence, you'd pick a side)

## QUOTE EXTRACTION (critical)
The raw content contains blocks formatted as:
### Title
Source: URL

Content here...

You MUST extract 3-5 direct quotes. For each quote:
- "text": Copy an EXACT sentence or phrase from the content — real user words, not your summary
- "source": The title of the source block the quote came from
- "url": The URL from the "Source:" line of that same block
- If a block has no quotable text, skip it. Never fabricate quotes.
- Prefer quotes that are opinionated, specific, and from real users (Reddit, forums, reviews)

## OTHER RULES:
- Weigh negative signals more heavily than positive. Products with mostly positive but alarming negatives = "mixed".
- marketing_claims: what the company/brand SAYS (from marketing language in the content)
- reality: what REAL USERS actually experience (from user comments/reviews)
- pros/cons: 3-5 each, specific and factual
- Be blunt. No corporate speak.

Return ONLY valid JSON:
{
  "verdict": "legit" | "sketchy" | "mixed" | "unknown",
  "confidence": number (0-100),
  "summary": "2-3 sentence summary",
  "tldr": "One punchy sentence",
  "pros": ["pro 1", "pro 2", ...],
  "cons": ["con 1", "con 2", ...],
  "quotes": [{"text": "exact verbatim quote from content", "source": "source title", "url": "source url"}],
  "marketing_claims": ["claim 1", "claim 2", ...],
  "reality": ["reality 1", "reality 2", ...]
}`;

const SHOWDOWN_PROMPT = `You are The Truth Serum — a brutally honest, skeptical consumer advocate.

You are given raw web content for TWO products. Analyze both independently and produce a structured comparison.

## SCORING RUBRIC (apply to EACH product independently)

### Verdict categories:
- "legit" = Overwhelmingly positive real-user sentiment. Few or minor complaints. Delivers on promises.
- "mixed" = Significant positives AND negatives. Marketing overpromises in some areas.
- "sketchy" = Majority negative sentiment, serious complaints, misleading marketing.
- "unknown" = Not enough evidence. Fewer than 3 meaningful data points.

### Confidence score (0-100) — measures EVIDENCE QUALITY, not product quality:
- 85-100: 8+ independent sources with detailed firsthand experiences
- 70-84: 5-7 sources with firsthand accounts, mostly consistent
- 50-69: 3-4 sources or mostly brief mentions
- 30-49: 1-2 sources or very shallow content
- 0-29: Almost no real user data

### Verdict-confidence alignment:
- "legit" requires confidence >= 50
- "sketchy" requires confidence >= 40
- "mixed" requires confidence >= 40
- "unknown" should have confidence < 50

## QUOTE EXTRACTION (critical — do this for BOTH products)
The raw content contains blocks formatted as:
### Title
Source: URL

Content here...

For EACH product, extract 3-5 direct quotes:
- "text": EXACT sentence or phrase from the content — real user words, not your summary
- "source": The title of the source block
- "url": The URL from the "Source:" line of that block
- Never fabricate quotes. Prefer opinionated, specific user quotes.

## WINNER SELECTION:
- The winner has genuinely better REAL-WORLD reception — not better marketing
- If both are sketchy, pick the less sketchy one and explain why
- If evidence is equal, say so in the reason

## OTHER RULES:
- Be fair but blunt. Call out BS on both sides.
- marketing_claims: what the company SAYS (from marketing language)
- reality: what REAL USERS experience (from comments/reviews)
- pros/cons: 3-5 each per product, specific and factual

Return ONLY valid JSON:
{
  "left": { "verdict": "legit"|"sketchy"|"mixed"|"unknown", "confidence": number, "summary": "...", "tldr": "...", "pros": [...], "cons": [...], "quotes": [{"text": "exact quote", "source": "title", "url": "url"}], "marketing_claims": [...], "reality": [...] },
  "right": { "verdict": "legit"|"sketchy"|"mixed"|"unknown", "confidence": number, "summary": "...", "tldr": "...", "pros": [...], "cons": [...], "quotes": [{"text": "exact quote", "source": "title", "url": "url"}], "marketing_claims": [...], "reality": [...] },
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
      model: 'gemini-flash-latest',
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
      model: 'gemini-flash-latest',
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
