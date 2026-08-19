from __future__ import annotations

import json
from pathlib import Path

from fastapi import APIRouter, Query

from app.config import settings

router = APIRouter()

_CACHE_PATH = Path(settings.parent_store_path).parent.parent / "suggested_questions.json"


def _load_cache() -> dict[str, dict[str, list[str]]]:
    if not _CACHE_PATH.exists():
        return {}
    return json.loads(_CACHE_PATH.read_text(encoding="utf-8"))


@router.get("/suggested-questions", response_model=list[str])
def get_suggested_questions(
    category: str | None = Query(default=None),
    language: str = Query(default="ko"),
) -> list[str]:
    cache = _load_cache()
    entry = cache.get(category or "default") or cache.get("default") or {}
    return entry.get(language) or entry.get("ko") or []
