import type { ChatSource } from "./api";

export type ChatRole = "user" | "assistant";
export type MessageStatus = "sending" | "success" | "error";

export interface ChatMessageType {
  id: string;
  role: ChatRole;
  content: string;
  question?: string;
  sources?: ChatSource[];
  createdAt: Date;
  status?: MessageStatus;
  feedback?: "helpful" | "not_helpful" | null;
}
