import { useState, useCallback } from "react";
import { useConversation } from "@elevenlabs/react";
import { Header } from "./components/Header";
import { VoiceButton } from "./components/VoiceButton";
import { ConversationFeed } from "./components/ConversationFeed";
import { TextInput } from "./components/TextInput";
import { AnalysisCard } from "./components/AnalysisCard";
import type { FeedEntry, LooseRecord } from "./lib/types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
const PUBLIC_AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID;

export default function App() {
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const [isScouring, setIsScouring] = useState(false);

  const pushFeed = useCallback((kind: FeedEntry["kind"], text: string) => {
    setFeed((prev) =>
      [...prev, { id: Date.now() + Math.random(), kind, text }].slice(-100),
    );
  }, []);

  const asRecord = (v: unknown): LooseRecord =>
    v && typeof v === "object" ? (v as LooseRecord) : {};
  const asText = (v: unknown): string => (typeof v === "string" ? v : "");

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

  const sendMessage = async (text: string) => {
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

  const isConnected = conversation.status === "connected";
  const isSpeaking = conversation.isSpeaking;
  const agentFeed = feed.filter((f) => f.kind === "agent");

  return (
    <div className="h-dvh w-full bg-[#050505] text-zinc-100 flex flex-col overflow-hidden">
      <Header isConnected={isConnected} />

      <main className="flex-1 flex flex-col pt-15 overflow-hidden max-w-lg mx-auto w-full">
        <div className="shrink-0 flex flex-col items-center justify-center py-8 px-4">
          <VoiceButton
            isConnected={isConnected}
            isSpeaking={isSpeaking}
            onStart={startSession}
            onStop={stopSession}
          />
        </div>

        <AnalysisCard agentFeed={agentFeed} isScouring={isScouring} />
        <ConversationFeed feed={feed} isScouring={isScouring} />
        <TextInput disabled={!isConnected} onSend={sendMessage} />
      </main>
    </div>
  );
}
