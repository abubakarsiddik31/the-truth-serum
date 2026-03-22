import { ShieldAlert, Zap, Link } from 'lucide-react';

const EXAMPLES = [
  'Cybertruck',
  'AirPods Pro',
  'Huel',
  'Temu',
  'ChatGPT Pro',
  'Cybertruck vs Rivian',
];

type HeroLandingProps = {
  onSearch: (query: string) => void;
};

export function HeroLanding({ onSearch }: HeroLandingProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_60px_rgba(239,68,68,0.3)]">
        <ShieldAlert className="w-9 h-9 text-white" />
      </div>

      <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white mb-2">
        The Truth Serum
      </h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mb-8">
        Search any product, paste a link, or compare two products. Get the unfiltered truth.
      </p>

      <div className="flex flex-wrap justify-center gap-2 max-w-sm mb-10">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            onClick={() => onSearch(example)}
            className="px-4 py-2 rounded-full text-xs font-semibold border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-300 dark:hover:border-red-500/30 hover:text-red-600 dark:hover:text-red-400 transition-all active:scale-95"
          >
            {example.includes('vs') && <Zap className="w-3 h-3 inline mr-1" />}
            {example.startsWith('http') && <Link className="w-3 h-3 inline mr-1" />}
            {example.startsWith('http') ? new URL(example).hostname : example}
          </button>
        ))}
      </div>

      <p className="text-[10px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
        Powered by Firecrawl + ElevenLabs
      </p>
    </div>
  );
}
