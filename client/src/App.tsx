import React, { useState, useEffect } from 'react';
import { useConversation } from '@elevenlabs/react';
import { Shield, Search, Flame, MessageSquare, Mic, MicOff, Terminal } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const conversation = useConversation();

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`].slice(-10));
  };

  const startSession = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Note: In a real app, agentId would come from an env var
      const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID || 'your_agent_id';
      
      await conversation.startSession({
        agentId,
      });
      addLog('Connection established. Ready to expose the truth.');
    } catch (error) {
      console.error('Failed to start conversation:', error);
      addLog('Error: Failed to access microphone or connect to agent.');
    }
  };

  const stopSession = async () => {
    await conversation.endSession();
    addLog('Session terminated. The truth remains out there.');
  };

  useEffect(() => {
    if (conversation.status === 'connected') {
      addLog('Agent is listening...');
    }
  }, [conversation.status]);

  return (
    <div className="min-h-screen w-screen bg-[#0a0a0a] text-zinc-100 flex flex-col items-center justify-center p-4 font-mono">
      {/* Header */}
      <div className="max-w-2xl w-full text-center space-y-4 mb-12">
        <div className="flex justify-center mb-6">
          <div className="bg-red-600/20 p-4 rounded-full border border-red-500/50 animate-pulse">
            <Shield className="w-12 h-12 text-red-500" />
          </div>
        </div>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic">
          The Truth <span className="text-red-500">Serum</span>
        </h1>
        <p className="text-zinc-500 text-sm max-w-md mx-auto">
          Scouring the unfiltered corners of the web to debunk marketing fluff. 
          Powered by Firecrawl & ElevenLabs.
        </p>
      </div>

      {/* Main Action Area */}
      <div className="max-w-xl w-full bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl shadow-2xl backdrop-blur-sm relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
        
        <div className="flex flex-col items-center gap-8">
          <div 
            className={cn(
              "w-32 h-32 rounded-full flex items-center justify-center border-4 transition-all duration-500",
              conversation.status === 'connected' 
                ? "border-red-500 bg-red-500/10 shadow-[0_0_50px_rgba(239,68,68,0.3)] scale-110" 
                : "border-zinc-800 bg-zinc-900"
            )}
          >
            {conversation.status === 'connected' ? (
              <div className="flex gap-1 items-end h-8">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div 
                    key={i} 
                    className="w-1 bg-red-500 rounded-full animate-bounce" 
                    style={{ animationDelay: `${i * 0.1}s`, height: `${20 + Math.random() * 60}%` }} 
                  />
                ))}
              </div>
            ) : (
              <Mic className="w-12 h-12 text-zinc-700" />
            )}
          </div>

          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">
              {conversation.status === 'connected' ? 'Agent is Online' : 'Agent Offline'}
            </h2>
            <p className="text-zinc-500 text-sm">
              {conversation.status === 'connected' 
                ? 'Tell me a product or brand to investigate.' 
                : 'Click below to wake the researcher.'}
            </p>
          </div>

          <button
            onClick={conversation.status === 'connected' ? stopSession : startSession}
            className={cn(
              "w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2",
              conversation.status === 'connected'
                ? "bg-zinc-100 text-black hover:bg-zinc-200"
                : "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-900/20"
            )}
          >
            {conversation.status === 'connected' ? (
              <><MicOff className="w-5 h-5" /> Stop Investigation</>
            ) : (
              <><Mic className="w-5 h-5" /> Initialize Serum</>
            )}
          </button>
        </div>
      </div>

      {/* Real-time Logs / Terminal */}
      <div className="max-w-2xl w-full mt-12 bg-black/50 border border-zinc-800 rounded-lg p-4 h-48 overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 mb-2 border-b border-zinc-800 pb-2">
          <Terminal className="w-4 h-4 text-zinc-500" />
          <span className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Live Feed</span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1 scrollbar-hide">
          {logs.length === 0 && <p className="text-zinc-700 italic text-xs">Waiting for initialization...</p>}
          {logs.map((log, i) => (
            <p key={i} className="text-[10px] sm:text-xs text-zinc-400 font-mono leading-relaxed">
              {log}
            </p>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 flex items-center gap-6 text-zinc-600">
        <div className="flex items-center gap-1.5 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
          <Search className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-tighter">Firecrawl</span>
        </div>
        <div className="flex items-center gap-1.5 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
          <Flame className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-tighter">ElevenLabs</span>
        </div>
      </div>
    </div>
  );
};

export default App;
