from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_categories import router as categories_router
from app.api.routes_chat import router as chat_router
from app.api.routes_document import router as document_router
from app.api.routes_feedback import router as feedback_router
from app.api.routes_sources import router as sources_router
from app.api.routes_suggested_questions import router as suggested_questions_router
from app.core.vectorstore import get_vectorstore

app = FastAPI(title="니이하마 학생편람 챗봇 API")


@app.on_event("startup")
def warm_up() -> None:
    # 임베딩 모델을 요청 시점이 아니라 서버 시작 시점에 로드해,
    # 첫 /chat 요청이 모델 로딩 때문에 느려지지 않게 한다.
    get_vectorstore()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(categories_router)
app.include_router(sources_router)
app.include_router(document_router)
app.include_router(feedback_router)
app.include_router(suggested_questions_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
