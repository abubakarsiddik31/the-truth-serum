import { useEffect, useRef } from 'react';
import { User, Cpu, Database, Activity, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import type { FeedEntry } from '../lib/types';

type ConversationFeedProps = {
  feed: FeedEntry[];
  isScouring: boolean;
};

const icons = {
  user: <User className="w-4 h-4 text-blue-400" />,
  agent: <Cpu className="w-4 h-4 text-red-500" />,
  tool: <Database className="w-4 h-4 text-amber-500" />,
  status: <Activity className="w-4 h-4 text-zinc-600" />,
  error: <AlertCircle className="w-4 h-4 text-red-700" />,
};

export function ConversationFeed({ feed, isScouring }: ConversationFeedProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [feed]);

  if (feed.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-zinc-700 px-8 py-12">
        <Activity className="w-10 h-10 mb-4 opacity-30" />
        <p className="text-xs font-bold uppercase tracking-widest text-center opacity-40">
          Ask about any product, brand, or trend
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
      {isScouring && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider">
            Scouring the web...
          </span>
        </div>
      )}

      {feed.map((entry) => (
        <div
          key={entry.id}
          className={cn(
            'flex gap-3 py-2',
            entry.kind === 'user' && 'justify-end',
            entry.kind === 'status' && 'opacity-40'
          )}
        >
          {entry.kind !== 'user' && (
            <div className="mt-0.5 flex-shrink-0">{icons[entry.kind]}</div>
          )}
          <div
            className={cn(
              'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
              entry.kind === 'user' &&
                'bg-blue-600/20 text-blue-100 border border-blue-500/20 rounded-br-md',
              entry.kind === 'agent' &&
                'bg-white/5 text-zinc-300 border border-white/5 rounded-bl-md',
              entry.kind === 'tool' &&
                'bg-amber-500/10 text-amber-300 border border-amber-500/10 text-xs font-mono',
              entry.kind === 'error' &&
                'bg-red-500/10 text-red-400 border border-red-500/10 text-xs',
              entry.kind === 'status' &&
                'text-zinc-600 text-xs italic'
            )}
          >
            {entry.text}
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
