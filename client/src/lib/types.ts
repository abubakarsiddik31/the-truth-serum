export type FeedEntry = {
  id: number;
  kind: 'status' | 'user' | 'agent' | 'tool' | 'error';
  text: string;
};

export type LooseRecord = Record<string, unknown>;

export type AppMode = 'voice' | 'text';

export type SearchTier = 'reddit' | 'reviews' | 'web';

export interface SourceMeta {
  title: string;
  url: string;
}

export interface Verdict {
  verdict: 'legit' | 'sketchy' | 'mixed' | 'unknown';
  confidence: number;
  truth_score: number; // 0-100: 0 = pure BS, 100 = fully legit
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
  sources?: SourceMeta[];
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
  sources?: SourceMeta[];
  verdict: Verdict['verdict'];
  confidence: number;
  truth_score: number;
  summary: string;
  tldr: string;
  pros: string[];
  cons: string[];
  quotes: Verdict['quotes'];
  marketing_claims: string[];
  reality: string[];
}

export type ChatResult = VerdictResult | ShowdownResult;
