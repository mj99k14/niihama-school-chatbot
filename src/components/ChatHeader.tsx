import { Trash2 } from "lucide-react";
import Avatar from "./Avatar";
import { useLanguage } from "../i18n";
import type { HealthStatus } from "../hooks/useHealth";

interface ChatHeaderProps {
  onClear: () => void;
  healthStatus: HealthStatus;
}

const STATUS_DOT_CLASS: Record<HealthStatus, string> = {
  online: "bg-success",
  offline: "bg-red-500",
  checking: "bg-subink",
};

export default function ChatHeader({ onClear, healthStatus }: ChatHeaderProps) {
  const { dictionary } = useLanguage();
  const statusLabel =
    healthStatus === "online"
      ? dictionary.header.onlineLabel
      : healthStatus === "offline"
        ? dictionary.header.offlineLabel
        : dictionary.header.checkingLabel;

  return (
    <div className="flex shrink-0 items-center justify-between border-b border-line px-4 py-3 md:px-6 md:py-4">
      <div className="flex items-center gap-3">
        <Avatar type="ai" size="md" />
        <div>
          <p className="text-sm font-bold text-ink md:text-base">
            {dictionary.chat.headerName}
          </p>
          <div className="flex items-center gap-1.5">
            <span
              className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT_CLASS[healthStatus]} ${
                healthStatus !== "offline" ? "status-dot" : ""
              }`}
            />
            <span
              className={`text-xs ${healthStatus === "offline" ? "text-red-500" : "text-subink"}`}
            >
              {statusLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="group relative">
        <button
          type="button"
          onClick={onClear}
          aria-label={dictionary.header.clearLabel}
          className="flex h-9 w-9 items-center justify-center rounded-full text-subink transition-all hover:scale-105 hover:bg-red-50 hover:text-red-500 focus-visible:outline-2 focus-visible:outline-primary"
        >
          <Trash2 className="h-[18px] w-[18px]" strokeWidth={2.2} />
        </button>
        <span className="pointer-events-none absolute right-1/2 top-full z-10 mt-2 translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
          {dictionary.header.clearLabel}
        </span>
      </div>
    </div>
  );
}
