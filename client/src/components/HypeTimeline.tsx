import { Megaphone, Users } from 'lucide-react';

type HypeTimelineProps = {
  marketingClaims: string[];
  reality: string[];
};

export function HypeTimeline({ marketingClaims, reality }: HypeTimelineProps) {
  if (!marketingClaims.length && !reality.length) return null;

  return (
    <div className="space-y-4">
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        Hype vs Reality
      </h4>

      <div className="space-y-3">
        {/* Marketing claims */}
        {marketingClaims.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Megaphone className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                What they say
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              {marketingClaims.map((claim, i) => (
                <div
                  key={i}
                  className="shrink-0 max-w-[200px] px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-xs text-blue-700 dark:text-blue-300"
                >
                  &ldquo;{claim}&rdquo;
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Divider with gap indicator */}
        <div className="flex items-center gap-2 px-4">
          <div className="flex-1 border-t border-dashed border-red-300 dark:border-red-500/30" />
          <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest">reality gap</span>
          <div className="flex-1 border-t border-dashed border-red-300 dark:border-red-500/30" />
        </div>

        {/* Reality */}
        {reality.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-3.5 h-3.5 text-red-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
                What users say
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              {reality.map((item, i) => (
                <div
                  key={i}
                  className="shrink-0 max-w-[200px] px-3 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-xs text-red-700 dark:text-red-300"
                >
                  &ldquo;{item}&rdquo;
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
