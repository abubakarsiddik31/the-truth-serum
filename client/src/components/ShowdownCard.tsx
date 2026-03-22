import { Crown, Share2, RotateCcw, ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { TruthMeter } from './TruthMeter';
import type { ShowdownResult } from '../lib/types';

type ShowdownCardProps = {
  result: ShowdownResult;
  onNewSearch: () => void;
};

const verdictColor = {
  legit: 'text-green-500',
  sketchy: 'text-red-500',
  mixed: 'text-amber-500',
  unknown: 'text-zinc-500',
};

function MiniVerdict({ name, verdict, isWinner }: { name: string; verdict: ShowdownResult['left']; isWinner: boolean }) {
  return (
    <div className={cn(
      'flex-1 p-4 rounded-2xl border space-y-3 transition-all',
      isWinner
        ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 ring-2 ring-amber-400/30'
        : 'bg-zinc-50 dark:bg-white/[0.03] border-zinc-200 dark:border-white/10'
    )}>
      {isWinner && (
        <div className="flex items-center gap-1 justify-center">
          <Crown className="w-4 h-4 text-amber-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Winner</span>
        </div>
      )}

      <p className="text-sm font-black text-center text-zinc-900 dark:text-white truncate">{name}</p>

      <TruthMeter value={verdict.confidence} searching={false} verdict={verdict.verdict} />

      <p className={cn('text-center text-xs font-black uppercase', verdictColor[verdict.verdict])}>
        {verdict.verdict} ({verdict.confidence}%)
      </p>

      <p className="text-xs text-center text-zinc-500 dark:text-zinc-400">{verdict.tldr}</p>

      {verdict.pros.length > 0 && (
        <div className="space-y-1">
          {verdict.pros.slice(0, 2).map((p, i) => (
            <div key={i} className="flex items-start gap-1">
              <ThumbsUp className="w-3 h-3 mt-0.5 text-green-500 shrink-0" />
              <span className="text-[11px] text-zinc-600 dark:text-zinc-400">{p}</span>
            </div>
          ))}
        </div>
      )}
      {verdict.cons.length > 0 && (
        <div className="space-y-1">
          {verdict.cons.slice(0, 2).map((c, i) => (
            <div key={i} className="flex items-start gap-1">
              <ThumbsDown className="w-3 h-3 mt-0.5 text-red-500 shrink-0" />
              <span className="text-[11px] text-zinc-600 dark:text-zinc-400">{c}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ShowdownCard({ result, onNewSearch }: ShowdownCardProps) {
  const leftWins = result.winner.toLowerCase().includes(result.leftQuery.toLowerCase());

  const handleShare = async () => {
    const text = `Truth Serum Showdown: ${result.leftQuery} vs ${result.rightQuery}\nWinner: ${result.winner}\n"${result.reason}"\n#ElevenHacks @firecrawl @elevenlabs`;
    if (navigator.share) {
      try { await navigator.share({ text }); return; } catch { /* fallback */ }
    }
    await navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="mx-4 mb-4 space-y-4 animate-[fadeSlideUp_0.6s_ease-out]">
      {/* VS Header */}
      <div className="text-center">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
          Product Showdown
        </span>
      </div>

      {/* Side by side */}
      <div className="flex gap-3">
        <MiniVerdict name={result.leftQuery} verdict={result.left} isWinner={leftWins} />
        <div className="flex items-center">
          <span className="text-lg font-black text-red-500">VS</span>
        </div>
        <MiniVerdict name={result.rightQuery} verdict={result.right} isWinner={!leftWins} />
      </div>

      {/* Winner reason */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-center">
        <p className="text-xs font-bold text-amber-700 dark:text-amber-300">
          <Crown className="w-4 h-4 inline mr-1" />
          {result.reason}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors active:scale-95"
        >
          <Share2 className="w-4 h-4" /> Share
        </button>
        <button
          onClick={onNewSearch}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors active:scale-95"
        >
          <RotateCcw className="w-4 h-4" /> New Search
        </button>
      </div>
    </div>
  );
}
