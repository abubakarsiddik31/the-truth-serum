const SKEPTIC_KEYWORDS = [
  'bug', 'broken', 'issue', 'problem', 'refund', 'scam',
  'overpriced', 'bait', 'hype', 'disappoint', 'defect',
  'fail', 'awful', 'terrible',
];

export function scoreLine(line: string): number {
  const lowered = line.toLowerCase();
  let score = 0;
  for (const keyword of SKEPTIC_KEYWORDS) {
    if (lowered.includes(keyword)) score += 2;
  }
  if (/\b\d+\s*(upvotes?|points?)\b/i.test(line)) score += 1;
  if (line.length > 220) score -= 1;
  return score;
}

export function extractFindings(markdown = ''): string[] {
  const lines = markdown
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length >= 35 && !l.startsWith('#'));

  return lines
    .map((line) => ({ line, score: scoreLine(line) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => item.line);
}
