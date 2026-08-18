import { apiFetch } from "./client";
import type { ChatRequest, ChatResponse } from "../types/api";

export function postChat(body: ChatRequest, signal?: AbortSignal): Promise<ChatResponse> {
  return apiFetch<ChatResponse>("/chat", {
    method: "POST",
    body: JSON.stringify(body),
    signal,
  });
}
