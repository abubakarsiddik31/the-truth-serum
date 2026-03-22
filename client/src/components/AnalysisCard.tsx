import { Search, Flame } from 'lucide-react';
import type { FeedEntry } from '../lib/types';

type AnalysisCardProps = {
  agentFeed: FeedEntry[];
  isScouring: boolean;
};

export function AnalysisCard({ agentFeed, isScouring }: AnalysisCardProps) {
  const lastAgent = agentFeed[agentFeed.length - 1];

  if (isScouring) {
    return (
      <div className="mx-4 mb-4 p-6 bg-zinc-50 dark:bg-white/3 border border-zinc-200 dark:border-white/5 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-500 dark:text-red-400">
            Analyzing...
          </span>
        </div>
        <div className="space-y-3 animate-pulse">
          <div className="h-3 w-3/4 bg-zinc-200 dark:bg-white/5 rounded" />
          <div className="h-3 w-1/2 bg-zinc-200 dark:bg-white/5 rounded" />
          <div className="h-3 w-2/3 bg-zinc-200 dark:bg-white/5 rounded" />
        </div>
      </div>
    );
  }

  if (!lastAgent) return null;

  return (
    <div className="mx-4 mb-4 p-5 bg-zinc-50 dark:bg-white/3 border border-zinc-200 dark:border-white/5 rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 dark:text-red-400">
          Latest Finding
        </span>
        <div className="flex items-center gap-3">
          <Search className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600" />
          <Flame className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600" />
        </div>
      </div>
      <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{lastAgent.text}</p>
    </div>
  );
}
