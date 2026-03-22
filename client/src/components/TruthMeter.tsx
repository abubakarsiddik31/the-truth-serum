import { useEffect, useState } from 'react';
import { cn } from '../lib/utils';

type TruthMeterProps = {
  value: number; // 0-100, 0 = sketchy, 100 = legit
  searching: boolean;
  verdict?: 'legit' | 'sketchy' | 'mixed' | 'unknown';
};

export function TruthMeter({ value, searching, verdict }: TruthMeterProps) {
  const [displayValue, setDisplayValue] = useState(50);

  useEffect(() => {
    if (searching) {
      // Wobble randomly during search
      const interval = setInterval(() => {
        setDisplayValue(30 + Math.random() * 40);
      }, 400);
      return () => clearInterval(interval);
    }
    setDisplayValue(value);
  }, [value, searching]);

  // Needle rotation: -90deg (left/sketchy) to +90deg (right/legit)
  const rotation = -90 + (displayValue / 100) * 180;

  const verdictColor = verdict === 'legit'
    ? 'text-green-500'
    : verdict === 'sketchy'
      ? 'text-red-500'
      : verdict === 'mixed'
        ? 'text-amber-500'
        : 'text-zinc-500';

  return (
    <div className="flex flex-col items-center py-4">
      <div className="relative w-48 h-24 overflow-hidden">
        {/* Gauge background */}
        <div className="absolute bottom-0 left-0 right-0 h-24 rounded-t-full overflow-hidden"
          style={{
            background: 'conic-gradient(from 180deg at 50% 100%, #ef4444 0deg, #f59e0b 90deg, #22c55e 180deg)',
            opacity: 0.15,
          }}
        />

        {/* Gauge border */}
        <div className="absolute bottom-0 left-0 right-0 h-24 rounded-t-full border-2 border-zinc-200 dark:border-white/10 border-b-0" />

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const angle = -90 + (tick / 100) * 180;
          return (
            <div
              key={tick}
              className="absolute bottom-0 left-1/2 origin-bottom w-0.5 h-3 bg-zinc-300 dark:bg-zinc-700"
              style={{ transform: `translateX(-50%) rotate(${angle}deg)`, height: '20px' }}
            />
          );
        })}

        {/* Needle */}
        <div
          className="absolute bottom-0 left-1/2 origin-bottom w-1 h-20 rounded-t-full bg-zinc-900 dark:bg-white transition-transform"
          style={{
            transform: `translateX(-50%) rotate(${rotation}deg)`,
            transitionDuration: searching ? '400ms' : '1500ms',
            transitionTimingFunction: searching ? 'linear' : 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />

        {/* Center dot */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 rounded-full bg-zinc-900 dark:bg-white border-2 border-zinc-100 dark:border-zinc-900" />
      </div>

      {/* Labels */}
      <div className="flex justify-between w-48 mt-2 px-1">
        <span className="text-[9px] font-bold uppercase text-red-500/60">BS</span>
        <span className={cn('text-xs font-black uppercase', verdictColor)}>
          {searching ? '...' : verdict ?? ''}
        </span>
        <span className="text-[9px] font-bold uppercase text-green-500/60">Legit</span>
      </div>
    </div>
  );
}
