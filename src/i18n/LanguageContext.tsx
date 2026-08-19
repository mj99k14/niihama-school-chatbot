import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Dictionary, Lang } from "./types";
import { ja } from "./ja";
import { ko } from "./ko";

const dictionaries: Record<Lang, Dictionary> = { ja, ko };

const STORAGE_KEY = "gsc-lang";

function readInitialLang(): Lang {
  if (typeof window === "undefined") return "ja";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === "ko" || saved === "ja" ? saved : "ja";
}

interface LanguageContextValue {
  lang: Lang;
  dictionary: Dictionary;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitialLang);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const setLang = useCallback((next: Lang) => setLangState(next), []);
  const toggleLang = useCallback(
    () => setLangState((prev) => (prev === "ja" ? "ko" : "ja")),
    []
  );

  const value = useMemo(
    () => ({ lang, dictionary: dictionaries[lang], setLang, toggleLang }),
    [lang, setLang, toggleLang]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
