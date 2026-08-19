import { useEffect, useState } from "react";
import { getSuggestedQuestions } from "../api/suggestedQuestions";
import type { ApiLanguage } from "../types/api";

export function useSuggestedQuestions(category: string | null, language: ApiLanguage) {
  const [questions, setQuestions] = useState<string[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    getSuggestedQuestions(category, language, controller.signal)
      .then((res) => setQuestions(res))
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setQuestions([]);
      });

    return () => controller.abort();
  }, [category, language]);

  return questions;
}
