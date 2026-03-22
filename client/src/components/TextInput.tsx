import { useState } from 'react';
import { Send, Search } from 'lucide-react';
import type { AppMode } from '../lib/types';

type TextInputProps = {
  mode: AppMode;
  disabled: boolean;
  onSend: (text: string) => void;
};

export function TextInput({ mode, disabled, onSend }: TextInputProps) {
  const [value, setValue] = useState('');

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
  };

  const placeholder = mode === 'text'
    ? 'Search any product, brand, or trend...'
    : 'Type a message...';

  return (
    <div className="flex items-center gap-2 px-4 py-3 border-t border-zinc-200 dark:border-white/5 bg-white/60 dark:bg-black/40">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 bg-zinc-100 dark:bg-white/5 rounded-xl px-4 py-3 text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-red-500/30 border border-zinc-200 dark:border-white/5 disabled:opacity-30"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="w-11 h-11 flex items-center justify-center rounded-xl bg-red-600 text-white disabled:opacity-20 transition-opacity active:scale-95"
      >
        {mode === 'text' ? <Search className="w-4 h-4" /> : <Send className="w-4 h-4" />}
      </button>
    </div>
  );
}
