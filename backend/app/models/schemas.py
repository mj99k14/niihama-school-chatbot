from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str
    category: str | None = None
    session_id: str | None = None


class SourceItem(BaseModel):
    parent_id: str
    category: str | None = None
    heading: str
    text_snippet: str


class ChatResponse(BaseModel):
    answer: str
    category_used: str | None = None
    sources: list[SourceItem]


class CategoryItem(BaseModel):
    id: str
    label: str
    description: str
