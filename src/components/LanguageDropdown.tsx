import { useEffect, useRef, useState } from "react";
import { Globe2, ChevronDown } from "lucide-react";
import { useLanguage, LANGUAGE_NAMES, LANGUAGE_ORDER } from "../i18n";
import type { Lang } from "../i18n";

export default function LanguageDropdown() {
  const { lang, dictionary, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const selectLang = (next: Lang) => {
    setLang(next);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={dictionary.header.languageAria}
        className="flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-2 text-xs font-semibold text-primary transition-all hover:-translate-y-0.5 hover:bg-primary-light hover:shadow-sm focus-visible:outline-2 focus-visible:outline-primary md:px-3.5 md:text-sm"
      >
        <Globe2 className="h-4 w-4" strokeWidth={2.2} />
        <span>{LANGUAGE_NAMES[lang]}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={2.2}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={dictionary.header.languageAria}
          className="animate-modal-in absolute right-0 top-full z-20 mt-2 w-36 overflow-hidden rounded-2xl border border-line bg-white py-1.5 shadow-lg"
        >
          {LANGUAGE_ORDER.map((code) => (
            <li key={code} role="option" aria-selected={code === lang}>
              <button
                type="button"
                onClick={() => selectLang(code)}
                className={`flex w-full items-center px-4 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
                  code === lang
                    ? "bg-primary-light font-semibold text-primary"
                    : "text-ink hover:bg-primary-light/50"
                }`}
              >
                {LANGUAGE_NAMES[code]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
