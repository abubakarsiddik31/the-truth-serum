import { ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';

type HeaderProps = {
  isConnected: boolean;
};

export function Header({ isConnected }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4 bg-black/80 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-red-600 flex items-center justify-center rounded-lg">
          <ShieldAlert className="w-5 h-5 text-black" />
        </div>
        <div>
          <h1 className="text-base font-black tracking-tight uppercase leading-none">
            Truth <span className="text-red-500">Serum</span>
          </h1>
          <p className="text-[9px] text-zinc-500 font-medium tracking-widest uppercase">
            No-BS Researcher
          </p>
        </div>
      </div>

      <div
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all',
          isConnected
            ? 'border-red-500/40 text-red-400 bg-red-500/10'
            : 'border-zinc-800 text-zinc-600 bg-zinc-900/50'
        )}
      >
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            isConnected ? 'bg-red-500 animate-pulse' : 'bg-zinc-700'
          )}
        />
        {isConnected ? 'Live' : 'Offline'}
      </div>
    </header>
  );
}
