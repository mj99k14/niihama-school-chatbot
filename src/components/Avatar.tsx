import { useLanguage } from "../i18n";
import niihama1 from "../img/niihama1.png";
import niihama2 from "../img/niihama2.png";

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
  const base = `flex items-center justify-center rounded-full shrink-0 shadow-sm overflow-hidden ${sizeClasses[size]}`;

  if (type === "ai") {
    return (
      <div
        className={`${base} bg-gradient-to-br from-[#9B6AD6] to-[#B889E6] text-white`}
        aria-hidden="true"
      >
        <img src={niihama1} alt="" className="h-full w-full object-cover" />
      </div>
    );
  }

  if (type === "hero") {
    return (
      <div
        className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-white shadow-sm ring-4 ring-primary-light/60 md:h-20 md:w-20"
        aria-hidden="true"
      >
        <img
          src={niihama1}
          alt={dictionary.avatar.heroAlt}
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className={`${base} bg-accent-blue border border-accent-blue-dark`}
      aria-hidden="true"
    >
      <img
        src={niihama2}
        alt={dictionary.avatar.userAlt}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
