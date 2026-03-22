import { useState } from 'react';
import { Send } from 'lucide-react';

type TextInputProps = {
  disabled: boolean;
  onSend: (text: string) => void;
};

export function TextInput({ disabled, onSend }: TextInputProps) {
  const [value, setValue] = useState('');

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
  };

  return (
    <div className="flex items-center gap-2 px-4 py-3 border-t border-white/5 bg-black/40">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSend();
        }}
        placeholder="Or type a question..."
        disabled={disabled}
        className="flex-1 bg-white/5 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-red-500/30 border border-white/5 disabled:opacity-30"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="w-11 h-11 flex items-center justify-center rounded-xl bg-red-600 text-white disabled:opacity-20 transition-opacity active:scale-95"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
}
