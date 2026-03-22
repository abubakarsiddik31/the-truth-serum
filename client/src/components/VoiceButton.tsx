import { Mic, MicOff } from 'lucide-react';
import { cn } from '../lib/utils';

type VoiceButtonProps = {
  isConnected: boolean;
  isSpeaking: boolean;
  onStart: () => void;
  onStop: () => void;
};

export function VoiceButton({ isConnected, isSpeaking, onStart, onStop }: VoiceButtonProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <button
        onClick={isConnected ? onStop : onStart}
        className={cn(
          'relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 active:scale-95',
          isConnected
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
          <MicOff className="w-10 h-10 relative z-10" />
        ) : (
          <Mic className="w-10 h-10 relative z-10" />
        )}
      </button>

      <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        {isConnected
          ? isSpeaking
            ? 'Listening...'
            : 'Tap to end'
          : 'Tap to speak'}
      </p>
    </div>
  );
}
