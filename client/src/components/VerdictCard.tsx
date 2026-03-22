import { ThumbsUp, ThumbsDown, Quote, Share2, RotateCcw, ExternalLink, Globe, MessageCircle, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import { TruthMeter } from './TruthMeter';
import { HypeTimeline } from './HypeTimeline';
import type { VerdictResult, SearchTier } from '../lib/types';

const tierInfo: Record<SearchTier, { icon: typeof Globe; label: string; color: string }> = {
  reddit: { icon: MessageCircle, label: 'Reddit & Forums', color: 'text-orange-500' },
  reviews: { icon: Star, label: 'Review Sites', color: 'text-blue-500' },
  web: { icon: Globe, label: 'Broad Web', color: 'text-zinc-500' },
};

type VerdictCardProps = {
  result: VerdictResult;
  onNewSearch: () => void;
};

const verdictStyles = {
  legit: { bg: 'bg-green-50 dark:bg-green-500/10', border: 'border-green-200 dark:border-green-500/30', text: 'text-green-600 dark:text-green-400', label: 'LEGIT' },
  sketchy: { bg: 'bg-red-50 dark:bg-red-500/10', border: 'border-red-200 dark:border-red-500/30', text: 'text-red-600 dark:text-red-400', label: 'SKETCHY' },
  mixed: { bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/30', text: 'text-amber-600 dark:text-amber-400', label: 'MIXED' },
  unknown: { bg: 'bg-zinc-50 dark:bg-zinc-500/10', border: 'border-zinc-200 dark:border-zinc-500/30', text: 'text-zinc-600 dark:text-zinc-400', label: 'UNKNOWN' },
};

export function VerdictCard({ result, onNewSearch }: VerdictCardProps) {
  const style = verdictStyles[result.verdict];

  const handleShare = async () => {
    const bestQuote = result.quotes[0]?.text || result.tldr;
    const text = `Truth Serum says ${result.query} is: ${style.label} (${result.confidence}%)\n"${bestQuote}"\n#ElevenHacks @firecrawl @elevenlabs`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch { /* fallback to clipboard */ }
    }
    await navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="mx-4 mb-4 space-y-5 animate-[fadeSlideUp_0.6s_ease-out]">
      {/* Verdict header */}
      <div className={cn('p-5 rounded-2xl border space-y-4', style.bg, style.border)}>
        <TruthMeter value={result.confidence} searching={false} verdict={result.verdict} />

        <div className="text-center">
          <span className={cn('text-2xl font-black uppercase tracking-wider', style.text)}>
            {style.label}
          </span>
          <span className={cn('ml-2 text-lg font-bold', style.text)}>
            {result.confidence}%
          </span>
        </div>

        <p className="text-center text-sm font-bold text-zinc-700 dark:text-zinc-300">
          {result.tldr}
        </p>

        {/* Source badge */}
        {result.tier && (() => {
          const info = tierInfo[result.tier];
          const Icon = info.icon;
          return (
            <div className="flex items-center justify-center gap-1.5">
              <Icon className={cn('w-3.5 h-3.5', info.color)} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {info.label} &middot; {result.source_count} sources scraped
              </span>
            </div>
          );
        })()}
      </div>

      {/* Summary */}
      <div className="px-1">
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {result.summary}
        </p>
      </div>

      {/* Pros and Cons */}
      {(result.pros.length > 0 || result.cons.length > 0) && (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/10 space-y-2">
            <div className="flex items-center gap-1.5">
              <ThumbsUp className="w-3.5 h-3.5 text-green-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400">Pros</span>
            </div>
            {result.pros.map((pro, i) => (
              <p key={i} className="text-xs text-green-700 dark:text-green-300">+ {pro}</p>
            ))}
          </div>
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/10 space-y-2">
            <div className="flex items-center gap-1.5">
              <ThumbsDown className="w-3.5 h-3.5 text-red-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">Cons</span>
            </div>
            {result.cons.map((con, i) => (
              <p key={i} className="text-xs text-red-700 dark:text-red-300">- {con}</p>
            ))}
          </div>
        </div>
      )}

      {/* Hype vs Reality */}
      <HypeTimeline marketingClaims={result.marketing_claims} reality={result.reality} />

      {/* Quotes */}
      {result.quotes.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-2">
            <Quote className="w-3.5 h-3.5" /> Real quotes
          </h4>
          {result.quotes.slice(0, 3).map((q, i) => (
            <div key={i} className="pl-4 border-l-2 border-zinc-200 dark:border-white/10">
              <p className="text-xs italic text-zinc-600 dark:text-zinc-400">&ldquo;{q.text}&rdquo;</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[10px] text-zinc-400 dark:text-zinc-600">{q.source}</span>
                {q.url && (
                  <a href={q.url} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-500">
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

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
