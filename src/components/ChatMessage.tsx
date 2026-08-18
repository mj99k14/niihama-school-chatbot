import { AlertCircle, RotateCcw, BookMarked } from "lucide-react";
import Avatar from "./Avatar";
import FeedbackButtons from "./FeedbackButtons";
import { useLanguage } from "../i18n";
import type { ChatMessageType } from "../types";

interface ChatMessageProps {
  message: ChatMessageType;
  isActive: boolean;
  onSelect: () => void;
  onRetry: () => void;
  onFeedback: (helpful: boolean) => Promise<boolean>;
}

export default function ChatMessage({
  message,
  isActive,
  onSelect,
  onRetry,
  onFeedback,
}: ChatMessageProps) {
  const { dictionary } = useLanguage();
  const isUser = message.role === "user";
  const isSending = message.status === "sending";
  const isError = message.status === "error";
  const isSuccess = !isUser && message.status === "success";
  const hasSources = isSuccess && (message.sources?.length ?? 0) > 0;

  return (
    <div
      className={`animate-slide-up flex items-start gap-2.5 md:gap-3 ${
        isUser ? "flex-row-reverse" : ""
      }`}
    >
      <Avatar type={isUser ? "user" : "ai"} size="sm" />
      <div
        className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed md:text-[15px] ${
          isUser
            ? "rounded-tr-sm bg-bubble-user text-ink"
            : isError
              ? "rounded-tl-sm border border-red-200 bg-red-50 text-ink"
              : "rounded-tl-sm bg-accent-blue text-ink"
        }`}
      >
        {isSending ? (
          <div className="flex items-center gap-2">
            <span className="wrap-text text-subink">{dictionary.chat.thinkingLabel}</span>
            <span className="flex items-center gap-1">
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary [animation-delay:0ms]" />
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary [animation-delay:150ms]" />
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary [animation-delay:300ms]" />
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-2">
              {isError && (
                <AlertCircle
                  className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
                  strokeWidth={2.2}
                />
              )}
              <p className="whitespace-pre-line break-words wrap-text">{message.content}</p>
            </div>

            {isError && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-2 flex items-center gap-1 rounded-full border border-red-300 bg-white px-2.5 py-1 text-xs font-semibold text-red-500 transition-all hover:-translate-y-0.5 hover:bg-red-50"
              >
                <RotateCcw className="h-3 w-3" strokeWidth={2.2} />
                {dictionary.chat.retryLabel}
              </button>
            )}

            {hasSources && (
              <button
                type="button"
                onClick={onSelect}
                aria-pressed={isActive}
                className={`mt-3 flex w-full items-start gap-2 rounded-xl border p-2.5 text-left transition-all hover:-translate-y-0.5 ${
                  isActive
                    ? "border-primary bg-primary-light/40"
                    : "border-accent-blue-dark/60 bg-white/60 hover:border-primary-light"
                }`}
              >
                <BookMarked
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                  strokeWidth={2.2}
                />
                <span className="wrap-text text-xs leading-relaxed text-subink">
                  <span className="font-bold text-ink">{dictionary.chat.regulationHeading}</span>
                  <br />
                  {message.sources?.[0].heading}
                </span>
              </button>
            )}

            {isSuccess && (
              <div className="mt-3 border-t border-accent-blue-dark/60 pt-2.5">
                <FeedbackButtons feedback={message.feedback} onSubmit={onFeedback} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
