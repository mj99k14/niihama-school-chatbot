import { apiFetch } from "./client";
import type { ApiLanguage } from "../types/api";

export function getSuggestedQuestions(
  category: string | null,
  language: ApiLanguage,
  signal?: AbortSignal
): Promise<string[]> {
  const params = new URLSearchParams({ language });
  if (category) params.set("category", category);
  return apiFetch<string[]>(`/suggested-questions?${params.toString()}`, { signal });
}
