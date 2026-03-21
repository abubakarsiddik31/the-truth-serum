import React, { useState } from 'react';
import { useConversation } from '@elevenlabs/react';
import { AlertTriangle, Flame, Mic, MicOff, Search, Shield, Terminal } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type FeedEntry = {
  id: number;
  kind: 'status' | 'user' | 'agent' | 'tool' | 'error';
  text: string;
};

type LooseRecord = Record<string, unknown>;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const PUBLIC_AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID;

const WAVE_HEIGHTS = [32, 48, 42, 56, 36];

const App: React.FC = () => {
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const [manualQuery, setManualQuery] = useState('');

  const pushFeed = (kind: FeedEntry['kind'], text: string) => {
    setFeed((prev) => {
      const next = [...prev, { id: Date.now() + Math.random(), kind, text }];
      return next.slice(-40);
    });
  };

  const asRecord = (value: unknown): LooseRecord =>
    value && typeof value === 'object' ? (value as LooseRecord) : {};

  const asText = (value: unknown): string => (typeof value === 'string' ? value : '');

  const conversation = useConversation({
    onStatusChange: (event) => {
      const record = asRecord(event);
      const nextStatus = asText(record.status) || asText(event);
      const map: Record<string, string> = {
        disconnected: 'Agent disconnected.',
        connecting: 'Connecting to ElevenLabs...',
        connected: 'Connected. Speak now.'
      };
      pushFeed('status', map[nextStatus] || `Status changed: ${nextStatus || 'unknown'}`);
    },
    onMessage: (event) => {
      const message = asRecord(event);
      const role = asText(message.source) || asText(message.role) || 'agent';
      const rawText = asText(message.message) || asText(message.text) || asText(message.content);
      const text = rawText.trim();

      if (!text) {
        return;
      }

      if (role === 'user') {
        pushFeed('user', text);
        return;
      }

      pushFeed('agent', text);
    },
    onAgentToolRequest: (event) => {
      const record = asRecord(event);
      const toolName = asText(record.tool_name) || asText(record.toolName) || 'tool';
      pushFeed('tool', `Running tool: ${toolName}`);
    },
    onAgentToolResponse: (event) => {
      const record = asRecord(event);
      const toolName = asText(record.tool_name) || asText(record.toolName) || 'tool';
      pushFeed('tool', `Tool completed: ${toolName}`);
    },
    onError: (error) => {
      const record = asRecord(error);
      const message = asText(record.message) || asText(error) || 'Unknown error';
      pushFeed('error', `Conversation error: ${message}`);
    }
  });

  const getSignedUrl = async (): Promise<string | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/elevenlabs/signed-url`);
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.signedUrl || null;
    } catch {
      return null;
    }
  };

  const startSession = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const signedUrl = await getSignedUrl();
      if (signedUrl) {
        await conversation.startSession({ signedUrl, connectionType: 'websocket' });
        return;
      }

      if (PUBLIC_AGENT_ID) {
        await conversation.startSession({ agentId: PUBLIC_AGENT_ID, connectionType: 'webrtc' });
        return;
      }

      pushFeed(
        'error',
        'No session auth available. Configure backend ELEVENLABS_API_KEY + ELEVENLABS_AGENT_ID, or set VITE_ELEVENLABS_AGENT_ID for a public agent.'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not start voice session.';
      pushFeed('error', message);
    }
  };

  const stopSession = async () => {
    await conversation.endSession();
    pushFeed('status', 'Session ended.');
  };

  const sendManualMessage = async () => {
    const text = manualQuery.trim();
    if (!text) {
      return;
    }

    try {
      await conversation.sendUserMessage(text);
      pushFeed('user', text);
      setManualQuery('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send text message.';
      pushFeed('error', message);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#0a0a0a] text-zinc-100 flex flex-col items-center justify-center px-4 py-8 font-mono">
      <div className="max-w-2xl w-full text-center space-y-4 mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-red-600/20 p-4 rounded-full border border-red-500/50 animate-pulse">
            <Shield className="w-12 h-12 text-red-500" />
          </div>
        </div>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic">
          The Truth <span className="text-red-500">Serum</span>
        </h1>
        <p className="text-zinc-500 text-sm max-w-md mx-auto">
          Speak a product, brand, or trend. The agent hits Reddit/forums and answers with no marketing sugarcoat.
        </p>
      </div>

      <div className="max-w-xl w-full bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl shadow-2xl backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

        <div className="flex flex-col items-center gap-8">
          <div
            className={cn(
              'w-32 h-32 rounded-full flex items-center justify-center border-4 transition-all duration-500',
              conversation.status === 'connected'
                ? 'border-red-500 bg-red-500/10 shadow-[0_0_50px_rgba(239,68,68,0.3)] scale-110'
                : 'border-zinc-800 bg-zinc-900'
            )}
          >
            {conversation.status === 'connected' ? (
              <div className="flex gap-1 items-end h-8">
                {WAVE_HEIGHTS.map((height, i) => (
                  <div
                    key={i}
                    className="w-1 bg-red-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.1}s`, height: `${height}%` }}
                  />
                ))}
              </div>
            ) : (
              <Mic className="w-12 h-12 text-zinc-700" />
            )}
          </div>

          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">
              {conversation.status === 'connected' ? 'Agent Online' : 'Agent Offline'}
            </h2>
            <p className="text-zinc-500 text-sm">
              {conversation.status === 'connected'
                ? 'Ask by voice, or use the text fallback below.'
                : 'Initialize the session to begin investigation.'}
            </p>
          </div>

          <button
            onClick={conversation.status === 'connected' ? stopSession : startSession}
            className={cn(
              'w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2',
              conversation.status === 'connected'
                ? 'bg-zinc-100 text-black hover:bg-zinc-200'
                : 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-900/20'
            )}
          >
            {conversation.status === 'connected' ? (
              <>
                <MicOff className="w-5 h-5" />
                Stop Investigation
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                Initialize Serum
              </>
            )}
          </button>

          <div className="w-full grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
            <input
              value={manualQuery}
              onChange={(e) => setManualQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  void sendManualMessage();
                }
              }}
              placeholder="Text fallback (e.g. Is product X overhyped?)"
              className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-red-500/50"
            />
            <button
              onClick={() => void sendManualMessage()}
              disabled={conversation.status !== 'connected'}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>

          {conversation.status !== 'connected' && !PUBLIC_AGENT_ID && (
            <div className="w-full flex items-start gap-2 rounded-lg bg-yellow-400/10 border border-yellow-700/30 p-3">
              <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
              <p className="text-xs text-yellow-200/80 leading-relaxed">
                This app expects backend-signed ElevenLabs sessions. Set server env vars `ELEVENLABS_API_KEY` and
                `ELEVENLABS_AGENT_ID`.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl w-full mt-8 bg-black/50 border border-zinc-800 rounded-lg p-4 h-64 overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 mb-2 border-b border-zinc-800 pb-2">
          <Terminal className="w-4 h-4 text-zinc-500" />
          <span className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Live Transcript & Tool Feed</span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1">
          {feed.length === 0 && <p className="text-zinc-700 italic text-xs">Waiting for session start...</p>}
          {feed.map((entry) => (
            <p
              key={entry.id}
              className={cn(
                'text-[11px] sm:text-xs font-mono leading-relaxed',
                entry.kind === 'error' && 'text-red-400',
                entry.kind === 'tool' && 'text-yellow-300',
                entry.kind === 'agent' && 'text-zinc-300',
                entry.kind === 'user' && 'text-cyan-300',
                entry.kind === 'status' && 'text-zinc-500'
              )}
            >
              {entry.text}
            </p>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-6 text-zinc-600">
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
