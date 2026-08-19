export type ApiLanguage = "ko" | "ja";

export interface HealthResponse {
  status: string;
}

export interface CategoryResponse {
  id: string;
  label: string;
  description: string;
}

export interface ChatRequest {
  message: string;
  category: string | null;
  session_id: string | null;
  language: ApiLanguage | null;
}

export interface ChatSource {
  parent_id: string;
  category: string;
  heading: string;
  text_snippet: string;
  page_start: number;
  page_end: number;
}

export interface SourceDetail {
  parent_id: string;
  category: string;
  heading: string;
  text: string;
  page_start: number;
  page_end: number;
}

export interface DocumentInfo {
  filename: string;
  updated_at: string;
  download_url: string;
}

export interface FeedbackRequest {
  parent_id: string | null;
  question: string;
  answer: string;
  helpful: boolean;
}

export interface FeedbackResponse {
  status: string;
}
