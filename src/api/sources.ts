import { apiFetch } from "./client";
import type { SourceDetail } from "../types/api";

export function getSourceDetail(
  parentId: string,
  signal?: AbortSignal
): Promise<SourceDetail> {
  return apiFetch<SourceDetail>(`/sources/${encodeURIComponent(parentId)}`, { signal });
}
