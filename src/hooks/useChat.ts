import { useEffect, useMemo, useRef, useState } from "react";
import { postChat } from "../api/chat";
import { postFeedback } from "../api/feedback";
import { ApiError, NetworkError } from "../api/client";
import type { Dictionary, Lang } from "../i18n/types";
import type { ChatMessageType } from "../types";

const HISTORY_KEY = "chat-history";
const HISTORY_LIMIT = 50;

function loadHistory(): string[] {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function saveHistory(history: string[]) {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-HISTORY_LIMIT)));
  } catch {
    // localStorage unavailable (private mode, quota, etc.) - history just won't persist
  }
}

function createId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createGreeting(greeting: string): ChatMessageType {
  return {
    id: createId(),
    role: "assistant",
    content: greeting,
    createdAt: new Date(),
  };
}

function describeError(err: unknown, dictionary: Dictionary): string {
  if (err instanceof NetworkError) return dictionary.errors.network;
  if (err instanceof ApiError) {
    if (err.status === 422) return dictionary.errors.validation;
    if (err.status === 404) return dictionary.errors.notFound;
    if (err.status >= 500) return dictionary.errors.server;
    return err.detail || dictionary.errors.generic;
  }
  return dictionary.errors.generic;
}

export function useChat(dictionary: Dictionary, lang: Lang, category: string | null) {
  const [messages, setMessages] = useState<ChatMessageType[]>(() => [
    createGreeting(dictionary.chat.greeting),
  ]);
  const [isSending, setIsSending] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [questionHistory, setQuestionHistory] = useState<string[]>(() => loadHistory());
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setMessages([createGreeting(dictionary.chat.greeting)]);
    setActiveMessageId(null);
    abortRef.current?.abort();
    setIsSending(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const runChatRequest = async (pendingId: string, question: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await postChat(
        { message: question, category, session_id: null, language: lang },
        controller.signal
      );
      setMessages((prev) =>
        prev.map((m) =>
          m.id === pendingId
            ? { ...m, content: res.answer, sources: res.sources, status: "success", feedback: null }
            : m
        )
      );
      setActiveMessageId(pendingId);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === pendingId
            ? { ...m, content: describeError(err, dictionary), status: "error" }
            : m
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  const sendMessage = (text: string) => {
    if (isSending) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: ChatMessageType = {
      id: createId(),
      role: "user",
      content: trimmed,
      createdAt: new Date(),
    };
    const pendingId = createId();
    const pendingMessage: ChatMessageType = {
      id: pendingId,
      role: "assistant",
      content: "",
      question: trimmed,
      createdAt: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, userMessage, pendingMessage]);
    setIsSending(true);
    setQuestionHistory((prev) => {
      const next = [...prev, trimmed];
      saveHistory(next);
      return next;
    });

    void runChatRequest(pendingId, trimmed);
  };

  const retryMessage = (messageId: string) => {
    const target = messages.find((m) => m.id === messageId);
    if (!target || !target.question || isSending) return;

    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, status: "sending", content: "" } : m))
    );
    setIsSending(true);
    void runChatRequest(messageId, target.question);
  };

  const submitFeedback = async (messageId: string, helpful: boolean): Promise<boolean> => {
    const target = messages.find((m) => m.id === messageId);
    if (!target || target.feedback) return false;

    try {
      await postFeedback({
        parent_id: target.sources?.[0]?.parent_id ?? null,
        question: target.question ?? "",
        answer: target.content,
        helpful,
      });
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, feedback: helpful ? "helpful" : "not_helpful" } : m
        )
      );
      return true;
    } catch {
      return false;
    }
  };

  const resetChat = () => {
    abortRef.current?.abort();
    setMessages([createGreeting(dictionary.chat.greeting)]);
    setActiveMessageId(null);
    setIsSending(false);
  };

  const clearChat = () => {
    abortRef.current?.abort();
    setMessages([]);
    setActiveMessageId(null);
    setIsSending(false);
  };

  const activeMessage = useMemo(
    () => messages.find((m) => m.id === activeMessageId) ?? null,
    [messages, activeMessageId]
  );

  return {
    messages,
    isSending,
    sendMessage,
    retryMessage,
    submitFeedback,
    resetChat,
    clearChat,
    questionHistory,
    activeMessage,
    selectMessage: setActiveMessageId,
  };
}
