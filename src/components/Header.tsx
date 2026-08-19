import { RotateCcw, History } from "lucide-react";
import Avatar from "./Avatar";
import LanguageDropdown from "./LanguageDropdown";
import { useLanguage } from "../i18n";
import type { HealthStatus } from "../hooks/useHealth";

interface HeaderProps {
  healthStatus: HealthStatus;
  onNewChat: () => void;
  onOpenHistory: () => void;
}

const STATUS_DOT_CLASS: Record<HealthStatus, string> = {
  online: "bg-success",
  offline: "bg-red-500",
  checking: "bg-subink",
};

export default function Header({ healthStatus, onNewChat, onOpenHistory }: HeaderProps) {
  const { dictionary } = useLanguage();
  const statusLabel =
    healthStatus === "online"
      ? dictionary.header.onlineLabel
      : healthStatus === "offline"
        ? dictionary.header.offlineLabel
        : dictionary.header.checkingLabel;

  return (
    <header className="w-full border-b border-line bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-[72px] w-full max-w-[1600px] items-center justify-between gap-3 px-4 md:h-[88px] md:px-6 xl:px-8">
        <div className="flex min-w-0 items-center gap-2.5 md:gap-3">
          <Avatar type="hero" size="md" />
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold leading-tight text-ink md:text-lg">
              {dictionary.header.schoolName}
            </p>
            <div className="flex items-center gap-1.5">
              <p className="truncate text-xs text-subink md:text-sm">
                {dictionary.header.serviceName}
              </p>
              <span className="hidden items-center gap-1 sm:flex">
                <span className="text-subink/50">·</span>
                <span
                  className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT_CLASS[healthStatus]} ${
                    healthStatus !== "offline" ? "status-dot" : ""
                  }`}
                />
                <span
                  className={`text-xs ${healthStatus === "offline" ? "font-medium text-red-500" : "text-subink"}`}
                >
                  {statusLabel}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
          <button
            type="button"
            onClick={onNewChat}
            className="flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-2 text-xs font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-primary-light hover:bg-primary-light hover:text-primary hover:shadow-sm focus-visible:outline-2 focus-visible:outline-primary md:px-3.5 md:text-sm"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={2.2} />
            <span className="hidden sm:inline">{dictionary.header.newChatLabel}</span>
          </button>

          <button
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-2 text-xs font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-primary-light hover:bg-primary-light hover:text-primary hover:shadow-sm focus-visible:outline-2 focus-visible:outline-primary md:px-3.5 md:text-sm"
          >
            <History className="h-4 w-4" strokeWidth={2.2} />
            <span className="hidden sm:inline">{dictionary.header.historyLabel}</span>
          </button>

          <LanguageDropdown />
        </div>
      </div>
    </header>
  );
}
