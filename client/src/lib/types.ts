export type FeedEntry = {
  id: number;
  kind: 'status' | 'user' | 'agent' | 'tool' | 'error';
  text: string;
};

export type LooseRecord = Record<string, unknown>;
