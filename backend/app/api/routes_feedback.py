import json
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter

from app.config import settings
from app.models.schemas import FeedbackRequest, FeedbackResponse

router = APIRouter()

FEEDBACK_LOG_PATH = Path(settings.chroma_persist_dir).parent / "feedback.jsonl"


@router.post("/feedback", response_model=FeedbackResponse)
def submit_feedback(request: FeedbackRequest) -> FeedbackResponse:
    FEEDBACK_LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    record = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        **request.model_dump(),
    }
    with FEEDBACK_LOG_PATH.open("a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")
    return FeedbackResponse(status="ok")
