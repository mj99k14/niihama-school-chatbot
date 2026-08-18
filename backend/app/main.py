from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_categories import router as categories_router
from app.api.routes_chat import router as chat_router

app = FastAPI(title="니이하마 학생편람 챗봇 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(categories_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
