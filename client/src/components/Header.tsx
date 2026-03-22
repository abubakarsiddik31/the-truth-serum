import { ShieldAlert, Sun, Moon, Mic, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import type { AppMode } from '../lib/types';

type HeaderProps = {
  isConnected: boolean;
  dark: boolean;
  mode: AppMode;
  onToggleTheme: () => void;
  onToggleMode: () => void;
};

export function Header({ isConnected, dark, mode, onToggleTheme, onToggleMode }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-zinc-200 dark:border-white/5">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-red-600 flex items-center justify-center rounded-lg">
          <ShieldAlert className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-sm font-black tracking-tight uppercase text-zinc-900 dark:text-zinc-100">
          Truth <span className="text-red-500">Serum</span>
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Mode toggle */}
        <button
          onClick={onToggleMode}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all',
            mode === 'voice'
              ? 'border-red-500/40 text-red-500 bg-red-500/10'
              : 'border-blue-500/40 text-blue-500 bg-blue-500/10'
          )}
        >
          {mode === 'voice' ? <Mic className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
          {mode === 'voice' ? 'Voice' : 'Text'}
        </button>

        {/* Connection status (voice mode only) */}
        {mode === 'voice' && (
          <div className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border',
            isConnected
              ? 'border-green-500/40 text-green-500 bg-green-500/10'
              : 'border-zinc-300 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-900/50'
          )}>
            <span className={cn('w-1.5 h-1.5 rounded-full', isConnected ? 'bg-green-500 animate-pulse' : 'bg-zinc-400 dark:bg-zinc-700')} />
            {isConnected ? 'Live' : 'Off'}
          </div>
        )}

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          {dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
      </div>
    </header>
  );
}
