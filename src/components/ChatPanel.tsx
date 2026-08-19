import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import ChatMessage from "./ChatMessage";
import SuggestedQuestions from "./SuggestedQuestions";
import ChatInput from "./ChatInput";
import type { ChatMessageType } from "../types";
import type { HealthStatus } from "../hooks/useHealth";

interface ChatPanelProps {
  messages: ChatMessageType[];
  isSending: boolean;
  activeMessageId: string | null;
  healthStatus: HealthStatus;
  suggestedQuestions: string[];
  onSend: (message: string) => void;
  onClear: () => void;
  onSelectMessage: (id: string) => void;
  onRetry: (id: string) => void;
  onFeedback: (id: string, helpful: boolean) => Promise<boolean>;
}

export default function ChatPanel({
  messages,
  isSending,
  activeMessageId,
  healthStatus,
  suggestedQuestions,
  onSend,
  onClear,
  onSelectMessage,
  onRetry,
  onFeedback,
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  return (
    <section className="flex h-[600px] flex-col rounded-3xl border border-line bg-white shadow-sm md:h-[640px] xl:h-full xl:min-h-0">
      <ChatHeader onClear={onClear} healthStatus={healthStatus} />

      <div
        ref={scrollRef}
        className="scroll-thin min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 md:px-6 md:py-5"
      >
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            isActive={message.id === activeMessageId}
            onSelect={() => onSelectMessage(message.id)}
            onRetry={() => onRetry(message.id)}
            onFeedback={(helpful) => onFeedback(message.id, helpful)}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <SuggestedQuestions
        questions={suggestedQuestions}
        onSelect={onSend}
        disabled={isSending}
      />
      <ChatInput onSend={onSend} disabled={isSending} />
    </section>
  );
}
