import { apiFetch, buildApiUrl } from "./client";
import type { DocumentInfo } from "../types/api";

export function getDocumentInfo(signal?: AbortSignal): Promise<DocumentInfo> {
  return apiFetch<DocumentInfo>("/document/info", { signal });
}

export function buildDocumentDownloadUrl(downloadUrl: string, page?: number): string {
  const url = buildApiUrl(downloadUrl);
  return page ? `${url}#page=${page}` : url;
}
