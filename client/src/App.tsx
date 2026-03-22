import { useState, useCallback } from "react";
import { useConversation } from "@elevenlabs/react";
import { Header } from "./components/Header";
import { VoiceButton } from "./components/VoiceButton";
import { ConversationFeed } from "./components/ConversationFeed";
import { TextInput } from "./components/TextInput";
import { HeroLanding } from "./components/HeroLanding";
import { SearchAnimation } from "./components/SearchAnimation";
import { TruthMeter } from "./components/TruthMeter";
import { VerdictCard } from "./components/VerdictCard";
import { ShowdownCard } from "./components/ShowdownCard";
import { useTheme } from "./lib/useTheme";
import { Mic } from "lucide-react";
import type {
  FeedEntry,
  LooseRecord,
  AppMode,
  ChatResult,
  VerdictResult,
  ShowdownResult,
} from "./lib/types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
const PUBLIC_AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID;

export default function App() {
  const { dark, toggle: toggleTheme } = useTheme();
  const [mode, setMode] = useState<AppMode>("text");
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const [isScouring, setIsScouring] = useState(false);

  // Text mode state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [chatResult, setChatResult] = useState<ChatResult | null>(null);

  const pushFeed = useCallback((kind: FeedEntry["kind"], text: string) => {
    setFeed((prev) =>
      [...prev, { id: Date.now() + Math.random(), kind, text }].slice(-100),
    );
  }, []);

  const asRecord = (v: unknown): LooseRecord =>
    v && typeof v === "object" ? (v as LooseRecord) : {};
  const asText = (v: unknown): string => (typeof v === "string" ? v : "");

  // ── Voice mode (ElevenLabs) ──
  const conversation = useConversation({
    onStatusChange: (event) => {
      const record = asRecord(event);
      const status = asText(record.status) || asText(event);
      const labels: Record<string, string> = {
        disconnected: "Disconnected",
        connecting: "Connecting...",
        connected: "Connected",
      };
      pushFeed("status", labels[status] || `Status: ${status}`);
    },
    onMessage: (event) => {
      const msg = asRecord(event);
      const role = asText(msg.source) || asText(msg.role) || "agent";
      const text = (
        asText(msg.message) ||
        asText(msg.text) ||
        asText(msg.content)
      ).trim();
      if (!text) return;
      if (role === "user") {
        pushFeed("user", text);
      } else {
        pushFeed("agent", text);
        setIsScouring(false);
      }
    },
    onAgentToolRequest: (event) => {
      const name =
        asText(asRecord(event).tool_name) ||
        asText(asRecord(event).toolName) ||
        "tool";
      pushFeed("tool", `Searching: ${name}`);
      setIsScouring(true);
    },
    onAgentToolResponse: (event) => {
      const name =
        asText(asRecord(event).tool_name) ||
        asText(asRecord(event).toolName) ||
        "tool";
      pushFeed("tool", `Result: ${name}`);
    },
    onError: (error) => {
      const msg =
        asText(asRecord(error).message) || asText(error) || "Unknown error";
      pushFeed("error", msg);
      setIsScouring(false);
    },
  });

  const getSignedUrl = async (): Promise<string | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/elevenlabs/signed-url`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.signedUrl || null;
    } catch {
      return null;
    }
  };

  const startSession = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      if (PUBLIC_AGENT_ID) {
        await conversation.startSession({
          agentId: PUBLIC_AGENT_ID,
          connectionType: "webrtc",
        });
        return;
      }
      const signedUrl = await getSignedUrl();
      if (signedUrl) {
        await conversation.startSession({
          signedUrl,
          connectionType: "websocket",
        });
        return;
      }
      pushFeed("error", "Missing API keys or Agent ID.");
    } catch (err) {
      pushFeed(
        "error",
        err instanceof Error ? err.message : "Microphone access denied",
      );
    }
  };

  const stopSession = async () => {
    await conversation.endSession();
    setIsScouring(false);
  };

  const sendVoiceMessage = async (text: string) => {
    try {
      await conversation.sendUserMessage(text);
      pushFeed("user", text);
    } catch (err) {
      pushFeed(
        "error",
        err instanceof Error ? err.message : "Failed to send message",
      );
    }
  };

  // ── Text mode (direct API) ──
  const sendTextQuery = async (input: string) => {
    setChatResult(null);
    setIsSearching(true);

    // Detect showdown: "X vs Y" or "X versus Y"
    const vsMatch = input.match(/^(.+?)\s+(?:vs\.?|versus)\s+(.+)$/i);
    const query = vsMatch ? vsMatch[1].trim() : input;
    const compare = vsMatch ? vsMatch[2].trim() : undefined;

    setSearchQuery(vsMatch ? `${query} vs ${compare}` : query);

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, compare }),
      });
      if (!res.ok) throw new Error("Search failed");
      const data = (await res.json()) as ChatResult;
      setChatResult(data);
    } catch {
      setChatResult({
        type: "verdict",
        query,
        verdict: "unknown",
        confidence: 0,
        summary: "Something went wrong. Please try again.",
        tldr: "Analysis failed.",
        pros: [],
        cons: [],
        quotes: [],
        marketing_claims: [],
        reality: [],
      });
    } finally {
      setIsSearching(false);
    }
  };

  const resetSearch = () => {
    setChatResult(null);
    setSearchQuery("");
  };

  const isConnected = conversation.status === "connected";
  const isSpeaking = conversation.isSpeaking;
  const hasSearched = isSearching || chatResult !== null;

  return (
    <div className="h-dvh w-full bg-white dark:bg-[#050505] text-zinc-900 dark:text-zinc-100 flex flex-col overflow-hidden">
      <Header
        isConnected={isConnected}
        dark={dark}
        mode={mode}
        onToggleTheme={toggleTheme}
        onToggleMode={() => setMode((m) => (m === "voice" ? "text" : "voice"))}
      />

      <main className="flex-1 flex flex-col pt-14 overflow-hidden max-w-lg mx-auto w-full">
        {mode === "voice" ? (
          // ── Voice Mode ──
          <>
            <div className="shrink-0 flex flex-col items-center justify-center py-6 px-4">
              <VoiceButton
                isConnected={isConnected}
                isSpeaking={isSpeaking}
                onStart={startSession}
                onStop={stopSession}
              />
            </div>
            <ConversationFeed feed={feed} isScouring={isScouring} />
            <TextInput
              mode="voice"
              disabled={!isConnected}
              onSend={sendVoiceMessage}
            />
          </>
        ) : (
          // ── Text Mode ──
          <>
            <div className="flex-1 overflow-y-auto">
              {!hasSearched ? (
                <HeroLanding onSearch={sendTextQuery} />
              ) : isSearching ? (
                <div>
                  <SearchAnimation query={searchQuery} />
                  <TruthMeter value={50} searching={true} />
                </div>
              ) : chatResult?.type === "showdown" ? (
                <ShowdownCard
                  result={chatResult as ShowdownResult}
                  onNewSearch={resetSearch}
                />
              ) : chatResult?.type === "verdict" ? (
                <VerdictCard
                  result={chatResult as VerdictResult}
                  onNewSearch={resetSearch}
                />
              ) : null}
            </div>

            {/* Voice CTA banner in text mode */}
            {!isSearching && (
              <button
                onClick={() => setMode("voice")}
                className="mx-4 mb-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors active:scale-[0.98]"
              >
                <Mic className="w-3.5 h-3.5" />
                Want the verbal breakdown? Switch to voice
              </button>
            )}

            <TextInput mode="text" disabled={isSearching} onSend={sendTextQuery} />
          </>
        )}
      </main>
    </div>
  );
}
