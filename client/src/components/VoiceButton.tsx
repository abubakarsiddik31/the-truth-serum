import { Mic, MicOff } from 'lucide-react';
import { cn } from '../lib/utils';
import { Waveform } from './Waveform';

type VoiceButtonProps = {
  isConnected: boolean;
  isSpeaking: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
};

export function VoiceButton({ isConnected, isSpeaking, onStart, onStop, disabled }: VoiceButtonProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={isConnected ? onStop : onStart}
        disabled={disabled && !isConnected}
        className={cn(
          'relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 active:scale-95',
          disabled && !isConnected
            ? 'bg-zinc-200 dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-700 text-zinc-400 dark:text-zinc-600 cursor-not-allowed opacity-50'
            : isConnected
              ? 'bg-zinc-200 dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-white'
              : 'bg-red-600 border-2 border-red-500 text-white shadow-[0_0_60px_rgba(239,68,68,0.25)]'
        )}
      >
        {isConnected && isSpeaking && (
          <>
            <span className="absolute inset-0 rounded-full border-2 border-red-500/40 animate-ping" />
            <span className="absolute -inset-3 rounded-full border border-red-500/20 animate-[pulse_2s_ease-in-out_infinite]" />
          </>
        )}
        {isConnected && !isSpeaking && (
          <span className="absolute inset-0 rounded-full border-2 border-zinc-400/30 dark:border-zinc-500/30 animate-[pulse_3s_ease-in-out_infinite]" />
        )}
        {isConnected ? (
          <MicOff className="w-9 h-9 relative z-10" />
        ) : (
          <Mic className="w-9 h-9 relative z-10" />
        )}
      </button>

      {/* Waveform visualizer */}
      <Waveform active={isConnected} speaking={isSpeaking} />

      <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        {isConnected
          ? isSpeaking
            ? 'Agent speaking...'
            : 'Listening to you...'
          : disabled
            ? 'Configure agent below'
            : 'Tap to start'}
      </p>
    </div>
  );
}
