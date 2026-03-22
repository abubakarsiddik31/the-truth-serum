import { ShieldAlert, Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';

type HeaderProps = {
  isConnected: boolean;
  dark: boolean;
  onToggleTheme: () => void;
};

export function Header({ isConnected, dark, onToggleTheme }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-zinc-200 dark:border-white/5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-red-600 flex items-center justify-center rounded-lg">
          <ShieldAlert className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-black tracking-tight uppercase leading-none text-zinc-900 dark:text-zinc-100">
            Truth <span className="text-red-500">Serum</span>
          </h1>
          <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium tracking-widest uppercase">
            No-BS Researcher
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onToggleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all',
            isConnected
              ? 'border-red-500/40 text-red-500 bg-red-500/10'
              : 'border-zinc-300 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-900/50'
          )}
        >
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              isConnected ? 'bg-red-500 animate-pulse' : 'bg-zinc-400 dark:bg-zinc-700'
            )}
          />
          {isConnected ? 'Live' : 'Offline'}
        </div>
      </div>
    </header>
  );
}
