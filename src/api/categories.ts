import { apiFetch } from "./client";
import type { CategoryResponse } from "../types/api";

export function getCategories(signal?: AbortSignal): Promise<CategoryResponse[]> {
  return apiFetch<CategoryResponse[]>("/categories", { signal });
}
