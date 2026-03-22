export type FeedEntry = {
  id: number;
  kind: 'status' | 'user' | 'agent' | 'tool' | 'error';
  text: string;
};

export type LooseRecord = Record<string, unknown>;

export type AppMode = 'voice' | 'text';

export type SearchTier = 'reddit' | 'reviews' | 'web';

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
  type: 'showdown';
  leftQuery: string;
  rightQuery: string;
  leftTier: SearchTier;
  rightTier: SearchTier;
  source_count: number;
  left: Verdict;
  right: Verdict;
  winner: string;
  reason: string;
}

export interface VerdictResult {
  type: 'verdict';
  query: string;
  tier: SearchTier;
  source_count: number;
  verdict: Verdict['verdict'];
  confidence: number;
  summary: string;
  tldr: string;
  pros: string[];
  cons: string[];
  quotes: Verdict['quotes'];
  marketing_claims: string[];
  reality: string[];
}

export type ChatResult = VerdictResult | ShowdownResult;
