import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { useLanguage } from "../i18n";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const { dictionary } = useLanguage();
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  return (
    <div className="shrink-0 border-t border-line p-3 md:p-4">
      <div className="flex items-end gap-2 rounded-2xl border border-line bg-white p-2 shadow-sm transition-shadow focus-within:border-primary-light focus-within:shadow-md md:gap-3 md:p-2.5">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          aria-label={dictionary.chat.inputAria}
          placeholder={dictionary.chat.placeholder}
          className="max-h-[120px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-ink outline-none placeholder:text-subink/70 md:text-[15px]"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          aria-label={dictionary.chat.sendAria}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm transition-all hover:scale-105 hover:bg-primary-dark active:scale-95 disabled:cursor-not-allowed disabled:bg-primary/40 disabled:hover:scale-100"
        >
          <Send className="h-[18px] w-[18px]" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}
