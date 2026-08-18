from typing import Literal

from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str
    category: str | None = None
    session_id: str | None = None
    language: Literal["ko", "ja"] | None = None


class SourceItem(BaseModel):
    parent_id: str
    category: str | None = None
    heading: str
    text_snippet: str
    page_start: int
    page_end: int


class ChatResponse(BaseModel):
    answer: str
    category_used: str | None = None
    sources: list[SourceItem]


class CategoryItem(BaseModel):
    id: str
    label: str
    description: str


class SourceDetail(BaseModel):
    parent_id: str
    category: str | None = None
    heading: str
    text: str
    page_start: int
    page_end: int


class DocumentInfo(BaseModel):
    filename: str
    updated_at: str
    download_url: str


class FeedbackRequest(BaseModel):
    parent_id: str | None = None
    question: str
    answer: str
    helpful: bool


class FeedbackResponse(BaseModel):
    status: str
