import { useEffect, useState } from 'react';
import { cn } from '../lib/utils';

type WaveformProps = {
  active: boolean;
  speaking: boolean;
};

const BAR_COUNT = 5;

export function Waveform({ active, speaking }: WaveformProps) {
  const [heights, setHeights] = useState<number[]>(Array(BAR_COUNT).fill(0.15));

  useEffect(() => {
    if (!active) {
      setHeights(Array(BAR_COUNT).fill(0.15));
      return;
    }

    const interval = setInterval(() => {
      setHeights(
        Array.from({ length: BAR_COUNT }, () =>
          speaking ? 0.3 + Math.random() * 0.7 : 0.1 + Math.random() * 0.2,
        ),
      );
    }, speaking ? 120 : 500);

    return () => clearInterval(interval);
  }, [active, speaking]);

  return (
    <div className="flex items-end justify-center gap-1 h-10">
      {heights.map((h, i) => (
        <div
          key={i}
          className={cn(
            'w-1.5 rounded-full transition-all',
            speaking ? 'bg-red-500' : active ? 'bg-zinc-400 dark:bg-zinc-500' : 'bg-zinc-300 dark:bg-zinc-700',
          )}
          style={{
            height: `${h * 100}%`,
            transitionDuration: speaking ? '100ms' : '400ms',
          }}
        />
      ))}
    </div>
  );
}
