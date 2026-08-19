import { apiFetch } from "./client";
import type { FeedbackRequest, FeedbackResponse } from "../types/api";

export function postFeedback(
  body: FeedbackRequest,
  signal?: AbortSignal
): Promise<FeedbackResponse> {
  return apiFetch<FeedbackResponse>("/feedback", {
    method: "POST",
    body: JSON.stringify(body),
    signal,
  });
}
