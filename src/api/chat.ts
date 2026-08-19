import { ApiError, NetworkError, buildApiUrl } from "./client";
import type { ChatRequest, ChatSource } from "../types/api";

interface ChatStreamHandlers {
  onSources: (sources: ChatSource[], categoryUsed: string | null) => void;
  onDelta: (text: string) => void;
}

function extractDetail(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "detail" in body) {
    const { detail } = body as { detail: unknown };
    if (typeof detail === "string") return detail;
  }
  return fallback;
}

/**
 * /chat 은 NDJSON(줄바꿈으로 구분된 JSON) 라인을 스트리밍한다:
 * {"type":"sources",...} -> {"type":"delta","text":"..."}* -> {"type":"done"} | {"type":"error",...}
 * 답변을 다 만든 뒤 한 번에 받는 대신 생성되는 대로 받아, 체감 응답 속도를 높인다.
 */
export async function postChatStream(
  body: ChatRequest,
  handlers: ChatStreamHandlers,
  signal?: AbortSignal
): Promise<void> {
  let response: Response;
  try {
    response = await fetch(buildApiUrl("/chat"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new NetworkError();
  }

  if (!response.ok || !response.body) {
    let parsedBody: unknown = null;
    try {
      parsedBody = await response.json();
    } catch {
      // no (valid) JSON body
    }
    throw new ApiError(response.status, extractDetail(parsedBody, response.statusText), parsedBody);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);
      if (!line) continue;

      const message = JSON.parse(line) as
        | { type: "sources"; sources: ChatSource[]; category_used: string | null }
        | { type: "delta"; text: string }
        | { type: "done" }
        | { type: "error"; message: string };

      if (message.type === "sources") handlers.onSources(message.sources, message.category_used);
      else if (message.type === "delta") handlers.onDelta(message.text);
      else if (message.type === "error") throw new Error(message.message);
    }
  }
}
