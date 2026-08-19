import { Headset } from "lucide-react";
import { useLanguage } from "../i18n";

interface ConsultationCardProps {
  onOpen: () => void;
}

export default function ConsultationCard({ onOpen }: ConsultationCardProps) {
  const { dictionary } = useLanguage();
  const { consultation } = dictionary;

  return (
    <div className="shrink-0 rounded-2xl border border-line bg-primary-light/60 p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-primary">
          <Headset className="h-[18px] w-[18px]" strokeWidth={2.2} />
        </div>
        <p className="text-sm font-bold text-ink wrap-text md:text-[15px]">
          {consultation.cardTitle}
        </p>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-subink wrap-text md:text-sm">
        {consultation.cardBodyLines.map((line, i) => (
          <span key={i}>
            {line}
            {i < consultation.cardBodyLines.length - 1 && <br />}
          </span>
        ))}
      </p>
      <button
        type="button"
        onClick={onOpen}
        className="mt-3 w-full rounded-xl bg-primary py-2 text-xs font-semibold text-white shadow-sm transition-all hover:scale-[1.02] hover:bg-primary-dark active:scale-[0.98] md:text-sm"
      >
        {consultation.buttonLabel}
      </button>
    </div>
  );
}
