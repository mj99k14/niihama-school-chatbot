import { Bot } from "lucide-react";
import { useLanguage } from "../i18n";

type AvatarType = "ai" | "user" | "hero";

interface AvatarProps {
  type: AvatarType;
  size?: "sm" | "md" | "lg";
}

const sizeClasses: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "w-8 h-8 text-base",
  md: "w-10 h-10 text-xl",
  lg: "w-20 h-20 text-4xl",
};

export default function Avatar({ type, size = "md" }: AvatarProps) {
  const { dictionary } = useLanguage();
  const base = `flex items-center justify-center rounded-full shrink-0 shadow-sm ${sizeClasses[size]}`;

  if (type === "ai") {
    return (
      <div
        className={`${base} bg-gradient-to-br from-[#9B6AD6] to-[#B889E6] text-white`}
        aria-hidden="true"
      >
        <Bot className="w-1/2 h-1/2" strokeWidth={2.2} />
      </div>
    );
  }

  if (type === "hero") {
    return (
      <div
        className={`${base} bg-white border border-line ring-4 ring-primary-light/60`}
        aria-hidden="true"
      >
        <span role="img" aria-label={dictionary.avatar.heroAlt}>
          🐧
        </span>
      </div>
    );
  }

  return (
    <div
      className={`${base} bg-accent-blue border border-accent-blue-dark`}
      aria-hidden="true"
    >
      <span role="img" aria-label={dictionary.avatar.userAlt}>
        🐧
      </span>
    </div>
  );
}
