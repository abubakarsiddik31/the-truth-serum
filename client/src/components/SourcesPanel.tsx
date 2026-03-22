import { useState } from 'react';
import { X, ExternalLink, FileText, ChevronRight } from 'lucide-react';
import type { SourceMeta } from '../lib/types';

type Quote = { text: string; source: string; url: string };

type SourcesPanelProps = {
  quotes: Quote[];
  sources?: SourceMeta[];
  sourceCount: number;
};

export function SourcesPanel({ quotes, sources = [], sourceCount }: SourcesPanelProps) {
  const [open, setOpen] = useState(false);

  if (!sourceCount) return null;

  // Build a map of url → quotes for that source
  const quotesByUrl = new Map<string, string[]>();
  for (const q of quotes) {
    const key = q.url || q.source;
    if (!quotesByUrl.has(key)) quotesByUrl.set(key, []);
    quotesByUrl.get(key)!.push(q.text);
  }

  // Merge: use full source list if available, fall back to quote-only sources
  const allSources: Array<{ title: string; url: string; quotes: string[] }> = [];

  if (sources.length > 0) {
    for (const src of sources) {
      const matchedQuotes = quotesByUrl.get(src.url) ?? [];
      allSources.push({ title: src.title, url: src.url, quotes: matchedQuotes });
    }
  } else {
    // Fallback: derive from quotes only
    const seen = new Set<string>();
    for (const q of quotes) {
      const key = q.url || q.source;
      if (seen.has(key)) continue;
      seen.add(key);
      allSources.push({ title: q.source, url: q.url, quotes: quotesByUrl.get(key) ?? [] });
    }
  }

  // Sort: sources with quotes first
  allSources.sort((a, b) => b.quotes.length - a.quotes.length);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors active:scale-95"
      >
        <FileText className="w-3.5 h-3.5" />
        {sourceCount} Sources
        <ChevronRight className="w-3 h-3" />
      </button>

      {/* Slide-out panel */}
      {open && (
        <div className="fixed inset-0 z-[100]" onClick={() => setOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Panel */}
          <div
            className="absolute top-0 right-0 bottom-0 w-full max-w-sm bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-white/10 shadow-2xl animate-[slideInRight_0.25s_ease-out] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                  Sources ({allSources.length})
                </h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Source list */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {allSources.map((src, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 space-y-2"
                >
                  {/* Source header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 line-clamp-2">
                        {src.title}
                      </p>
                      {src.url && (
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-600 truncate mt-0.5">
                          {src.url.replace(/^https?:\/\//, '').split('/')[0]}
                        </p>
                      )}
                    </div>
                    {src.url && (
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {/* Quotes from this source */}
                  {src.quotes.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {src.quotes.map((qt, j) => (
                        <div key={j} className="pl-3 border-l-2 border-red-300 dark:border-red-500/30">
                          <p className="text-[11px] italic text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            &ldquo;{qt}&rdquo;
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-zinc-200 dark:border-white/10">
              <p className="text-[10px] text-center text-zinc-400 dark:text-zinc-600 font-medium">
                Scraped via Firecrawl &middot; Analyzed by Gemini
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
