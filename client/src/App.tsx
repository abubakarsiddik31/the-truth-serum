import React, { useState, useEffect, useRef } from 'react';
import { useConversation } from '@elevenlabs/react';
import { 
  AlertCircle, 
  ChevronRight, 
  Cpu, 
  Database, 
  Flame, 
  Mic, 
  MicOff, 
  Radio, 
  Search, 
  ShieldAlert, 
  Terminal,
  Activity,
  User,
  Zap,
  ExternalLink
} from 'lucide-react';
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

const App: React.FC = () => {
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const [manualQuery, setManualQuery] = useState('');
  const [isScouring, setIsScouring] = useState(false);
  const feedEndRef = useRef<HTMLDivElement>(null);

  const pushFeed = (kind: FeedEntry['kind'], text: string) => {
    setFeed((prev) => {
      const next = [...prev, { id: Date.now() + Math.random(), kind, text }];
      return next.slice(-100);
    });
  };

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [feed]);

  const asRecord = (value: unknown): LooseRecord =>
    value && typeof value === 'object' ? (value as LooseRecord) : {};

  const asText = (value: unknown): string => (typeof value === 'string' ? value : '');

  const conversation = useConversation({
    onStatusChange: (event) => {
      const record = asRecord(event);
      const nextStatus = asText(record.status) || asText(event);
      const map: Record<string, string> = {
        disconnected: 'Offline',
        connecting: 'Establishing Link...',
        connected: 'Agent Live'
      };
      pushFeed('status', map[nextStatus] || `Status: ${nextStatus}`);
    },
    onMessage: (event) => {
      const message = asRecord(event);
      const role = asText(message.source) || asText(message.role) || 'agent';
      const rawText = asText(message.message) || asText(message.text) || asText(message.content);
      const text = rawText.trim();

      if (!text) return;

      if (role === 'user') {
        pushFeed('user', text);
      } else {
        pushFeed('agent', text);
        setIsScouring(false);
      }
    },
    onAgentToolRequest: (event) => {
      const record = asRecord(event);
      const toolName = asText(record.tool_name) || asText(record.toolName) || 'tool';
      pushFeed('tool', `AGENT ACTION: ${toolName.toUpperCase()}`);
      setIsScouring(true);
    },
    onAgentToolResponse: (event) => {
      const record = asRecord(event);
      const toolName = asText(record.tool_name) || asText(record.toolName) || 'tool';
      pushFeed('tool', `RESULT ACQUIRED: ${toolName.toUpperCase()}`);
    },
    onError: (error) => {
      const record = asRecord(error);
      const message = asText(record.message) || asText(error) || 'Unknown error';
      pushFeed('error', `PROTOCOL ERROR: ${message}`);
      setIsScouring(false);
    }
  });

  const getSignedUrl = async (): Promise<string | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/elevenlabs/signed-url`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.signedUrl || null;
    } catch {
      return null;
    }
  };

  const startSession = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      if (PUBLIC_AGENT_ID) {
        await conversation.startSession({ agentId: PUBLIC_AGENT_ID, connectionType: 'webrtc' });
        return;
      }
      const signedUrl = await getSignedUrl();
      if (signedUrl) {
        await conversation.startSession({ signedUrl, connectionType: 'websocket' });
        return;
      }
      pushFeed('error', 'AUTHORIZATION FAILED: Missing API keys or Agent ID.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'MICROPHONE ACCESS DENIED';
      pushFeed('error', message.toUpperCase());
    }
  };

  const stopSession = async () => {
    await conversation.endSession();
    setIsScouring(false);
  };

  const sendManualMessage = async () => {
    const text = manualQuery.trim();
    if (!text) return;
    try {
      await conversation.sendUserMessage(text);
      pushFeed('user', text);
      setManualQuery('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'MESSAGE TRANSMISSION FAILED';
      pushFeed('error', message.toUpperCase());
    }
  };

  const isConnected = conversation.status === 'connected';

  // Get agent replies for dossier display
  const agentFeed = feed.filter(f => f.kind === 'agent');
  const toolFeed = feed.filter(f => f.kind === 'tool');

  return (
    <div className="min-h-screen w-full bg-[#050505] text-zinc-100 flex flex-col font-sans relative overflow-hidden">
      {/* Scan Line */}
      <div 
        className="fixed top-0 left-0 w-full h-[2px] pointer-events-none z-[100]" 
        style={{ 
          background: 'linear-gradient(to right, transparent, rgba(239, 68, 68, 0.2), transparent)',
          animation: 'scan-line 8s linear infinite'
        }} 
      />
      
      {/* Header */}
      <header className="w-full border-b border-white/10 bg-black/80 backdrop-blur-xl px-12 py-6 flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-red-600 flex items-center justify-center rounded-lg shadow-[0_0_30px_rgba(239,68,68,0.3)]">
            <ShieldAlert className="w-7 h-7 text-black" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic leading-none">
              TRUTH <span className="text-red-500 font-black">SERUM</span>
            </h1>
            <span className="text-[10px] font-bold opacity-30 tracking-[0.3em] uppercase mt-1 block tracking-[0.4em]">LIVE INTEL TERMINAL</span>
          </div>
        </div>
        
        <div className="flex items-center gap-10">
          <div className="hidden lg:flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
            <Radio className={cn("w-5 h-5 transition-colors", isConnected ? "text-red-500 animate-pulse" : "text-zinc-800")} />
            {isConnected ? "ENCRYPTED UPLINK ACTIVE" : "SIGNAL STANDBY"}
          </div>
          <div className={cn(
            "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em] border transition-all duration-700",
            isConnected 
              ? "bg-red-500/10 border-red-500/50 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]" 
              : "bg-zinc-900 border-zinc-800 text-zinc-600"
          )}>
            {conversation.status === 'connected' ? "LIVE MONITOR" : "OFFLINE"}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden bg-[radial-gradient(circle_at_50%_50%,_rgba(239,68,68,0.02),_transparent_80%)]">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-[520px] border-r border-white/10 flex flex-col p-10 space-y-10 overflow-y-auto bg-black/30">
          
          <div className="bg-white/[0.03] backdrop-blur-2xl rounded-3xl p-10 border border-white/10 relative group border-white/5 transition-all duration-500 hover:bg-white/[0.05]">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700">
              <Zap className="w-32 h-32 text-red-500" />
            </div>
            
            <div className="flex items-center gap-3 mb-8">
              <Activity className="w-4 h-4 text-red-500" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-red-500">AGENT PROFILE</h3>
            </div>
            
            <div className="flex items-start gap-8 mb-8">
              <div className="relative flex-shrink-0">
                <div className={cn(
                  "w-24 h-24 rounded-full flex items-center justify-center relative transition-all duration-700 overflow-hidden border-2",
                  isConnected ? "border-red-500/50 bg-red-500/5 shadow-[0_0_40px_rgba(239,68,68,0.2)]" : "border-white/10 bg-black/40"
                )}>
                  {isConnected && (
                    <div className="absolute inset-0" style={{ animation: 'pulse-ring 2s infinite' }}>
                      <div className="w-full h-full border border-red-500/30 rounded-full" />
                    </div>
                  )}
                  <Mic className={cn("w-12 h-12 transition-all duration-700", isConnected ? "text-red-500" : "text-zinc-800")} />
                </div>
              </div>
              <div className="flex-1 py-2">
                <h4 className="text-3xl font-black italic tracking-tighter uppercase mb-2">SASSY <span className="text-red-500">AGENT</span></h4>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest bg-red-500/20 text-red-400 px-3 py-1 rounded">OSINT</span>
                  <span className="text-[9px] font-black uppercase tracking-widest bg-zinc-800 text-zinc-400 px-3 py-1 rounded">DEBUNKER</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <button
              onClick={isConnected ? stopSession : startSession}
              className={cn(
                "w-full h-24 rounded-3xl font-black uppercase tracking-[0.5em] transition-all duration-500 transform active:scale-[0.96] flex items-center justify-center gap-5 text-sm",
                isConnected 
                  ? "bg-zinc-100 text-black hover:bg-white" 
                  : "bg-red-600 text-white hover:bg-red-700 shadow-[0_15px_40px_rgba(239,68,68,0.3)]"
              )}
            >
              {isConnected ? <><MicOff className="w-7 h-7" /> KILL SESSION</> : <><Mic className="w-7 h-7" /> ENGAGE SERUM</>}
            </button>
          </div>

          <div className="flex-1 flex flex-col bg-black/60 border border-white/10 rounded-3xl overflow-hidden min-h-[350px]">
            <div className="px-8 py-5 border-b border-white/10 bg-white/[0.03] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Terminal className="w-5 h-5 text-zinc-600" />
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-600">COMMS TRAFFIC</span>
              </div>
              {isScouring && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                  <span className="text-[10px] text-red-600 font-black uppercase tracking-[0.3em]">CRAWLING...</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 p-8 overflow-y-auto space-y-6 scrollbar-hide">
              {feed.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-10 text-center px-6 space-y-6">
                  <Search className="w-16 h-16" />
                  <p className="text-[11px] font-black uppercase tracking-[0.4em]">UPLINK STANDBY... AWAITING SUBJECT</p>
                </div>
              )}
              {feed.map((entry) => (
                <div key={entry.id} className={cn(
                  "flex gap-5 group transition-all duration-700 animate-in fade-in slide-in-from-left-6",
                  entry.kind === 'status' && "opacity-40"
                )}>
                  <div className="mt-1 flex-shrink-0">
                    {entry.kind === 'user' && <User className="w-5 h-5 text-cyan-500" />}
                    {entry.kind === 'agent' && <Cpu className="w-5 h-5 text-red-600" />}
                    {entry.kind === 'tool' && <Database className="w-5 h-5 text-yellow-500 animate-pulse" />}
                    {entry.kind === 'status' && <Activity className="w-5 h-5 text-zinc-700" />}
                    {entry.kind === 'error' && <AlertCircle className="w-5 h-5 text-red-900" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-[13px] leading-relaxed",
                      entry.kind === 'user' && "text-cyan-50 font-black uppercase tracking-tight",
                      entry.kind === 'agent' && "text-zinc-400 block font-sans",
                      entry.kind === 'tool' && "text-yellow-400 font-black tracking-widest",
                      entry.kind === 'error' && "text-red-600 font-bold",
                      entry.kind === 'status' && "text-zinc-700 italic"
                    )}>
                      {entry.text}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={feedEndRef} />
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <section className="flex-1 flex flex-col min-w-0 bg-[#030303]">
          <div className="p-16 xl:p-24 flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto space-y-20">
              
              <div className="space-y-8">
                <h2 className="text-6xl xl:text-8xl font-black italic uppercase tracking-tighter leading-[0.8]">
                  TARGET <span className="text-red-500 font-black underline decoration-red-900/40">ANALYSIS</span>
                </h2>
                <p className="text-xs text-zinc-600 font-bold uppercase tracking-[0.5em] whitespace-nowrap">
                  DECRYPTING UNFILTERED SENTIMENT FROM THE DEPTHS
                </p>
              </div>

              {/* Input */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-red-600/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition duration-1000" />
                <div className="relative flex flex-col md:flex-row gap-6 p-6 bg-white/[0.04] border border-white/10 rounded-[2.5rem] backdrop-blur-3xl focus-within:border-red-500/40 transition-all duration-500">
                  <input
                    value={manualQuery}
                    onChange={(e) => setManualQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') void sendManualMessage(); }}
                    placeholder="ENTER SUBJECT (PRODUCT / BRAND / TREND)..."
                    className="flex-1 h-20 bg-transparent px-8 font-black text-lg uppercase tracking-[0.3em] focus:outline-none placeholder:text-zinc-800"
                  />
                  <button
                    onClick={() => void sendManualMessage()}
                    disabled={!isConnected}
                    className="h-20 px-12 bg-white hover:bg-red-600 hover:text-white text-black font-black uppercase tracking-[0.4em] text-xs rounded-[1.5rem] transition-all duration-500 shadow-2xl disabled:opacity-10 flex items-center justify-center gap-4"
                  >
                    SCAN <Search className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Dossier Section */}
              <div className="space-y-12">
                <div className="flex items-center justify-between border-b border-white/10 pb-10">
                  <div className="flex items-center gap-6">
                    <Database className="w-8 h-8 text-red-600" />
                    <h3 className="text-3xl font-black uppercase tracking-[0.3em] italic text-white">SYSTEM <span className="opacity-40 text-red-500">ARTIFACTS</span></h3>
                  </div>
                  <div className="hidden sm:flex items-center gap-3 text-[11px] font-black text-zinc-500 uppercase tracking-widest bg-white/[0.03] border border-white/5 px-5 py-2 rounded-xl">
                    SOURCE: LIVE WEB SCRAPE
                  </div>
                </div>

                {isScouring ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-48 bg-white/[0.02] border border-white/5 rounded-[2rem] p-10 space-y-6 animate-pulse">
                        <div className="h-4 w-1/4 bg-white/5 rounded-lg" />
                        <div className="h-4 w-3/4 bg-white/5 rounded-lg" />
                        <div className="h-4 w-1/2 bg-white/5 rounded-lg" />
                      </div>
                    ))}
                  </div>
                ) : (agentFeed.length > 0 || toolFeed.length > 0) ? (
                  <div className="group relative">
                    <div className="absolute -inset-4 bg-red-600/5 blur-3xl rounded-[4rem] transition-opacity duration-1000" />
                    <div className="relative p-12 lg:p-16 bg-white/[0.03] border border-white/10 rounded-[3rem] space-y-10 group-hover:border-red-500/30 transition-all duration-700">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="w-3 h-3 bg-red-600 rounded-full shadow-[0_0_15px_rgba(239,68,68,1)] animate-pulse" />
                            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-red-500">
                                {toolFeed.some(f => f.text.includes('ACTION')) ? "ACTIVE TOOL SCAN" : "ANALYSIS COMPLETE"}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-700 uppercase font-black tracking-tighter">REF_ID: {Math.random().toString(16).slice(2, 12).toUpperCase()}</span>
                       </div>
                       
                       <div className="space-y-8">
                         {agentFeed.slice(-1).map((f) => (
                           <p key={f.id} className="text-xl lg:text-3xl font-bold leading-[1.6] text-zinc-100 indent-12 block font-sans">
                              {f.text}
                           </p>
                         ))}
                       </div>
                       
                       <div className="pt-12 flex flex-col xl:flex-row items-center justify-between gap-10 border-t border-white/10">
                          <div className="flex flex-wrap justify-center gap-10">
                             <div className="flex items-center gap-4">
                                <Search className="w-6 h-6 text-zinc-700 hover:text-white transition-colors" />
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">FIRECRAWL_OSINT</span>
                             </div>
                             <div className="flex items-center gap-4">
                                <Flame className="w-6 h-6 text-zinc-700 hover:text-white transition-colors" />
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">GPT_NUCLEUS</span>
                             </div>
                          </div>
                          <button className="group flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.5em] text-red-500 hover:text-white transition-all duration-500">
                            DOWNLOAD_INTEL <ExternalLink className="w-5 h-5 transition-transform duration-500 group-hover:translate-x-2 group-hover:-translate-y-2" />
                          </button>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-40 flex flex-col items-center justify-center bg-white/[0.01] border-4 border-dashed border-white/[0.03] rounded-[4rem] group transition-all duration-700 hover:bg-white/[0.02]">
                    <Activity className="w-16 h-16 mb-8 text-zinc-800 animate-pulse" />
                    <p className="text-xs font-black uppercase tracking-[0.6em] text-zinc-700 group-hover:text-zinc-500 transition-colors">AWAITING SUBJECT DATA...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <footer className="px-16 py-10 border-t border-white/10 bg-black/60 backdrop-blur-2xl flex flex-col lg:flex-row items-center justify-between gap-8 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">
             <div className="flex items-center gap-6">
                <span className="text-red-600">TRUTH_SERUM_PROTOCOL v4.2</span>
                <span className="opacity-20 font-light">|</span>
                <span className="text-zinc-700 italic">SECURE_LINK // OSINT_ENCRYPTED</span>
             </div>
             <div className="flex gap-12">
                <a href="#" className="hover:text-red-500 transition-all">PROJECT_WIKI</a>
                <a href="#" className="hover:text-red-500 transition-all">DECRYPT_KEYS</a>
                <a href="#" className="hover:text-red-500 transition-all">ELEVEN_HACKS</a>
             </div>
          </footer>
        </section>
      </main>
    </div>
  );
};

export default App;
