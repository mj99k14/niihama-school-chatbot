import { BookMarked, ExternalLink } from "lucide-react";
import { useLanguage } from "../i18n";
import type { ChatSource } from "../types/api";

interface SourceCardProps {
  source: ChatSource;
  onViewOriginal: () => void;
}

export default function SourceCard({ source, onViewOriginal }: SourceCardProps) {
  const { dictionary } = useLanguage();

  return (
    <div className="flex items-start gap-2 rounded-xl border border-line bg-white p-2.5">
      <BookMarked className="mt-0.5 h-3.5 w-3.5 shrink-0 text-subink" strokeWidth={2.2} />
      <div className="min-w-0 flex-1">
        <p className="wrap-text text-xs font-bold text-ink md:text-sm">{source.heading}</p>
        <p className="mt-0.5 wrap-text text-[11px] text-subink md:text-xs">
          {source.text_snippet}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="rounded-full bg-primary-light px-2 py-0.5 text-[10px] font-medium text-primary">
            {dictionary.sourcePanel.pageLabel} {source.page_start}
            {source.page_end !== source.page_start ? `-${source.page_end}` : ""}
          </span>
          <button
            type="button"
            onClick={onViewOriginal}
            className="flex items-center gap-1 text-[11px] font-semibold text-primary transition-transform hover:translate-x-0.5 focus-visible:outline-2 focus-visible:outline-primary"
          >
            <ExternalLink className="h-3 w-3" strokeWidth={2.2} />
            {dictionary.sourcePanel.viewOriginalLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
