import type { ChatSource } from "./api";

export type ChatRole = "user" | "assistant";
export type MessageStatus = "sending" | "streaming" | "success" | "error";

export interface ChatMessageType {
  id: string;
  role: ChatRole;
  content: string;
  question?: string;
  sources?: ChatSource[];
  createdAt: Date;
  status?: MessageStatus;
  feedback?: "helpful" | "not_helpful" | null;
  /** 이 메시지가 전송될 때 선택되어 있던 카테고리. null이면 "전체"에서 보낸 메시지. */
  category?: string | null;
}
