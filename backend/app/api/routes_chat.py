from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.core.rag_chain import stream_answer
from app.models.schemas import ChatRequest

router = APIRouter()


@router.post("/chat")
def chat(request: ChatRequest) -> StreamingResponse:
    generator = stream_answer(request.message, category=request.category, language=request.language)
    return StreamingResponse(generator, media_type="application/x-ndjson")
