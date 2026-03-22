import { useEffect, useState } from 'react';

const SEARCH_PHASES = [
  'Scanning Reddit...',
  'Crawling review sites...',
  'Analyzing user opinions...',
  'Cross-referencing claims...',
  'Extracting the truth...',
];

const URL_PHASES = [
  'Scraping product page...',
  'Extracting product details...',
  'Searching for real opinions...',
  'Crawling Reddit & forums...',
  'Cross-referencing with reviews...',
  'Analyzing everything...',
];

export function SearchAnimation({ query }: { query: string }) {
  const [phase, setPhase] = useState(0);
  const isUrl = /^https?:\/\//i.test(query);
  const phases = isUrl ? URL_PHASES : SEARCH_PHASES;

  useEffect(() => {
    setPhase(0);
    const interval = setInterval(() => {
      setPhase((p) => (p + 1) % phases.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [query, phases.length]);

  const displayQuery = isUrl
    ? (() => { try { return new URL(query).hostname; } catch { return query; } })()
    : query;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      {/* Radar effect */}
      <div className="relative w-32 h-32 mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-red-500/20 animate-ping" />
        <div className="absolute inset-3 rounded-full border-2 border-red-500/30 animate-ping [animation-delay:0.5s]" />
        <div className="absolute inset-6 rounded-full border-2 border-red-500/40 animate-ping [animation-delay:1s]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]" />
        </div>
      </div>

      <p className="text-sm font-bold text-zinc-900 dark:text-white mb-2">
        {isUrl ? <>Analyzing {displayQuery}</> : <>Investigating &ldquo;{displayQuery}&rdquo;</>}
      </p>

      <p className="text-xs text-red-500 dark:text-red-400 font-mono animate-pulse min-h-[1.25rem]">
        {phases[phase]}
      </p>
    </div>
  );
}
