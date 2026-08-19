import { useEffect } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { useLanguage } from "../i18n";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ title, onClose, children }: ModalProps) {
  const { dictionary } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="animate-overlay-in fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
        className="animate-modal-in scroll-thin max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-xl md:p-7"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3
            id="modal-title"
            className="text-lg font-bold text-ink wrap-text md:text-xl"
          >
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={dictionary.modal.closeAria}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-subink transition-all hover:scale-105 hover:bg-primary-light hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
          >
            <X className="h-5 w-5" strokeWidth={2.2} />
          </button>
        </div>
        <div className="whitespace-pre-line text-sm leading-relaxed text-ink wrap-text md:text-[15px]">
          {children}
        </div>
      </div>
    </div>
  );
}
