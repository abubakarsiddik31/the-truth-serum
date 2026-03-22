import { useState } from 'react';
import { Crown, Share2, RotateCcw, ThumbsUp, ThumbsDown, Quote, ExternalLink, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { TruthMeter } from './TruthMeter';
import { HypeTimeline } from './HypeTimeline';
import type { ShowdownResult, Verdict } from '../lib/types';

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

const verdictStyles = {
  legit: { bg: 'bg-green-50 dark:bg-green-500/10', border: 'border-green-200 dark:border-green-500/30', text: 'text-green-600 dark:text-green-400', label: 'LEGIT' },
  sketchy: { bg: 'bg-red-50 dark:bg-red-500/10', border: 'border-red-200 dark:border-red-500/30', text: 'text-red-600 dark:text-red-400', label: 'SKETCHY' },
  mixed: { bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/30', text: 'text-amber-600 dark:text-amber-400', label: 'MIXED' },
  unknown: { bg: 'bg-zinc-50 dark:bg-zinc-500/10', border: 'border-zinc-200 dark:border-zinc-500/30', text: 'text-zinc-600 dark:text-zinc-400', label: 'UNKNOWN' },
};

// ── Full detail modal (matches VerdictCard layout) ──
function VerdictModal({ name, verdict, onClose }: { name: string; verdict: Verdict; onClose: () => void }) {
  const style = verdictStyles[verdict.verdict];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal content */}
      <div
        className="relative z-10 w-full max-w-lg max-h-[85dvh] overflow-y-auto bg-white dark:bg-zinc-950 rounded-t-3xl sm:rounded-3xl border border-zinc-200 dark:border-white/10 shadow-2xl animate-[fadeSlideUp_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="sticky top-0 right-0 z-20 float-right m-3 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-white/10 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="px-5 pt-5 pb-6 space-y-5">
          {/* Product name */}
          <h2 className="text-lg font-black text-zinc-900 dark:text-white text-center pr-8">
            {name}
          </h2>

          {/* Verdict header */}
          <div className={cn('p-5 rounded-2xl border space-y-4', style.bg, style.border)}>
            <TruthMeter value={verdict.confidence} searching={false} verdict={verdict.verdict} />

            <div className="text-center">
              <span className={cn('text-2xl font-black uppercase tracking-wider', style.text)}>
                {style.label}
              </span>
              <span className={cn('ml-2 text-lg font-bold', style.text)}>
                {verdict.confidence}%
              </span>
            </div>

            <p className="text-center text-sm font-bold text-zinc-700 dark:text-zinc-300">
              {verdict.tldr}
            </p>
          </div>

          {/* Summary */}
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {verdict.summary}
          </p>

          {/* Pros and Cons */}
          {(verdict.pros.length > 0 || verdict.cons.length > 0) && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/10 space-y-2">
                <div className="flex items-center gap-1.5">
                  <ThumbsUp className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400">Pros</span>
                </div>
                {verdict.pros.map((pro, i) => (
                  <p key={i} className="text-xs text-green-700 dark:text-green-300">+ {pro}</p>
                ))}
              </div>
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/10 space-y-2">
                <div className="flex items-center gap-1.5">
                  <ThumbsDown className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">Cons</span>
                </div>
                {verdict.cons.map((con, i) => (
                  <p key={i} className="text-xs text-red-700 dark:text-red-300">- {con}</p>
                ))}
              </div>
            </div>
          )}

          {/* Hype vs Reality */}
          <HypeTimeline marketingClaims={verdict.marketing_claims} reality={verdict.reality} />

          {/* Quotes */}
          {verdict.quotes.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-2">
                <Quote className="w-3.5 h-3.5" /> Real quotes
              </h4>
              {verdict.quotes.slice(0, 5).map((q, i) => (
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
        </div>
      </div>
    </div>
  );
}

// ── Mini card (clickable) ──
function MiniVerdict({ name, verdict, isWinner, onClick }: { name: string; verdict: Verdict; isWinner: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'min-w-0 flex-1 p-3 rounded-2xl border space-y-2 transition-all overflow-hidden text-left cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
        isWinner
          ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 ring-2 ring-amber-400/30'
          : 'bg-zinc-50 dark:bg-white/[0.03] border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20'
      )}
    >
      {isWinner && (
        <div className="flex items-center gap-1 justify-center">
          <Crown className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-amber-500">Winner</span>
        </div>
      )}

      <p className="text-xs font-black text-center text-zinc-900 dark:text-white truncate">{name}</p>

      <div className="flex justify-center scale-75 -my-2">
        <TruthMeter value={verdict.confidence} searching={false} verdict={verdict.verdict} />
      </div>

      <p className={cn('text-center text-[11px] font-black uppercase', verdictColor[verdict.verdict])}>
        {verdict.verdict} ({verdict.confidence}%)
      </p>

      <p className="text-[11px] text-center text-zinc-500 dark:text-zinc-400 line-clamp-2">{verdict.tldr}</p>

      {verdict.pros.length > 0 && (
        <div className="space-y-0.5">
          {verdict.pros.slice(0, 2).map((p, i) => (
            <div key={i} className="flex items-start gap-1 min-w-0">
              <ThumbsUp className="w-3 h-3 mt-0.5 text-green-500 shrink-0" />
              <span className="text-[10px] text-zinc-600 dark:text-zinc-400 truncate">{p}</span>
            </div>
          ))}
        </div>
      )}
      {verdict.cons.length > 0 && (
        <div className="space-y-0.5">
          {verdict.cons.slice(0, 2).map((c, i) => (
            <div key={i} className="flex items-start gap-1 min-w-0">
              <ThumbsDown className="w-3 h-3 mt-0.5 text-red-500 shrink-0" />
              <span className="text-[10px] text-zinc-600 dark:text-zinc-400 truncate">{c}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tap hint */}
      <p className="text-[9px] text-center text-zinc-400 dark:text-zinc-600 font-medium pt-1">
        Tap for details
      </p>
    </button>
  );
}

// ── Main ShowdownCard ──
export function ShowdownCard({ result, onNewSearch }: ShowdownCardProps) {
  const [modalVerdict, setModalVerdict] = useState<{ name: string; verdict: Verdict } | null>(null);

  const winner = result.winner ?? '';
  const leftQuery = result.leftQuery ?? '';
  const rightQuery = result.rightQuery ?? '';
  const leftWins = winner.toLowerCase().includes(leftQuery.toLowerCase());

  const handleShare = async () => {
    const text = `Truth Serum Showdown: ${leftQuery} vs ${rightQuery}\nWinner: ${winner}\n"${result.reason ?? ''}"\n#ElevenHacks @firecrawl @elevenlabs`;
    if (navigator.share) {
      try { await navigator.share({ text }); return; } catch { /* fallback */ }
    }
    await navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <>
      <div className="mx-4 mb-4 space-y-4 animate-[fadeSlideUp_0.6s_ease-out] overflow-hidden">
        <div className="text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
            Product Showdown
          </span>
        </div>

        {/* Side by side — clickable cards */}
        <div className="flex gap-2 min-w-0 overflow-hidden">
          <MiniVerdict
            name={leftQuery}
            verdict={result.left}
            isWinner={leftWins}
            onClick={() => setModalVerdict({ name: leftQuery, verdict: result.left })}
          />
          <div className="flex items-center shrink-0 px-1">
            <span className="text-sm font-black text-red-500">VS</span>
          </div>
          <MiniVerdict
            name={rightQuery}
            verdict={result.right}
            isWinner={!leftWins}
            onClick={() => setModalVerdict({ name: rightQuery, verdict: result.right })}
          />
        </div>

        {/* Winner reason */}
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-center">
          <p className="text-xs font-bold text-amber-700 dark:text-amber-300">
            <Crown className="w-3.5 h-3.5 inline mr-1" />
            {result.reason}
          </p>
        </div>

        {/* Source count */}
        <p className="text-center text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          {result.source_count} sources analyzed via Firecrawl
        </p>

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

      {/* Detail modal */}
      {modalVerdict && (
        <VerdictModal
          name={modalVerdict.name}
          verdict={modalVerdict.verdict}
          onClose={() => setModalVerdict(null)}
        />
      )}
    </>
  );
}
