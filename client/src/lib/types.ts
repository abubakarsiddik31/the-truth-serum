export type FeedEntry = {
  id: number;
  kind: 'status' | 'user' | 'agent' | 'tool' | 'error';
  text: string;
};

export type LooseRecord = Record<string, unknown>;

export type AppMode = 'voice' | 'text';

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
  left: Verdict;
  right: Verdict;
  winner: string;
  reason: string;
}

export interface VerdictResult {
  type: 'verdict';
  query: string;
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
