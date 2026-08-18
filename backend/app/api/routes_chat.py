from fastapi import APIRouter

from app.core.rag_chain import answer_question
from app.models.schemas import ChatRequest, ChatResponse

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    result = answer_question(request.message, category=request.category)
    return ChatResponse(**result)
