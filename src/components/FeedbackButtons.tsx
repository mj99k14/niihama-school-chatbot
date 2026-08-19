import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useLanguage } from "../i18n";

interface FeedbackButtonsProps {
  feedback: "helpful" | "not_helpful" | null | undefined;
  onSubmit: (helpful: boolean) => Promise<boolean>;
  size?: "sm" | "md";
}

export default function FeedbackButtons({
  feedback,
  onSubmit,
  size = "sm",
}: FeedbackButtonsProps) {
  const { dictionary } = useLanguage();
  const [pending, setPending] = useState<"helpful" | "not_helpful" | null>(null);
  const [error, setError] = useState(false);

  const disabled = feedback != null || pending != null;
  const pad = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-xs";
  const iconSize = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";

  const handleClick = async (helpful: boolean) => {
    if (disabled) return;
    setError(false);
    setPending(helpful ? "helpful" : "not_helpful");
    const ok = await onSubmit(helpful);
    setPending(null);
    if (!ok) setError(true);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => handleClick(true)}
        disabled={disabled}
        aria-pressed={feedback === "helpful"}
        className={`flex items-center gap-1 rounded-full border font-medium transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed ${pad} ${
          feedback === "helpful"
            ? "border-primary bg-primary-light text-primary"
            : "border-line bg-white text-subink hover:border-primary-light"
        }`}
      >
        <ThumbsUp className={iconSize} strokeWidth={2.2} />
        {dictionary.chat.helpfulLabel}
      </button>
      <button
        type="button"
        onClick={() => handleClick(false)}
        disabled={disabled}
        aria-pressed={feedback === "not_helpful"}
        className={`flex items-center gap-1 rounded-full border font-medium transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed ${pad} ${
          feedback === "not_helpful"
            ? "border-primary bg-primary-light text-primary"
            : "border-line bg-white text-subink hover:border-primary-light"
        }`}
      >
        <ThumbsDown className={iconSize} strokeWidth={2.2} />
        {dictionary.chat.notHelpfulLabel}
      </button>
      {feedback && <span className="text-xs text-primary">{dictionary.chat.feedbackThanks}</span>}
      {error && <span className="text-xs text-red-500">{dictionary.chat.feedbackError}</span>}
    </div>
  );
}
