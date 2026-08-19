"""카테고리별 예상 질문 생성 (학생편람 원문 근거).

Claude에게 각 카테고리에 속한 Parent chunk 원문만 근거로 질문을 만들게 하여,
PDF에 실제로 없는 내용을 묻는 질문이 생성되지 않도록 한다.
scripts/generate_suggested_questions.py 에서 오프라인으로 실행하고 결과를
storage/suggested_questions.json 에 저장하며, API는 이 캐시만 읽는다
(요청마다 Claude를 호출하지 않기 위함).
"""
from __future__ import annotations

import re

from app.core.categories import CATEGORIES
from app.core.vectorstore import ParentStore
from app.services.claude_client import ask_claude

QUESTIONS_PER_CATEGORY = 4
MAX_CONTEXT_CHARS = 6000

LANGUAGE_NAMES = {"ko": "한국어", "ja": "日本語"}

SYSTEM_PROMPT = """당신은 학생편람 원문을 바탕으로 학생들이 실제로 궁금해할 만한 질문을 만드는 도우미입니다.
아래 [원문 발췌]에 실제로 답이 나와 있는 질문만 만드세요. 원문에 없는 내용을 추측해서 묻지 마세요.
질문은 반드시 지정된 언어로만, 한 줄에 하나씩, 번호·기호·설명 없이 질문 문장만 출력하세요."""


def _category_context(category_id: str) -> str:
    store = ParentStore()
    parts: list[str] = []
    total = 0
    for _, parent in store.items():
        if parent.get("category") != category_id:
            continue
        chunk = f"{parent['heading']}\n{parent['text']}"
        parts.append(chunk)
        total += len(chunk)
        if total >= MAX_CONTEXT_CHARS:
            break
    return "\n\n".join(parts)


def _parse_questions(raw: str, n: int) -> list[str]:
    lines = [re.sub(r"^[\-\*\d.)\s]+", "", line).strip() for line in raw.splitlines()]
    return [line for line in lines if line][:n]


def generate_questions_for_category(
    category_id: str, language: str, n: int = QUESTIONS_PER_CATEGORY
) -> list[str]:
    context = _category_context(category_id)
    if not context:
        return []
    lang_name = LANGUAGE_NAMES.get(language, "한국어")
    user_prompt = (
        f"[원문 발췌]\n{context}\n\n"
        f"위 원문만 근거로 학생이 물어볼 법한 질문을 정확히 {n}개, {lang_name}로 만들어주세요."
    )
    raw = ask_claude(system=SYSTEM_PROMPT, user_message=user_prompt, max_tokens=512)
    return _parse_questions(raw, n)


def generate_all(languages: list[str] | None = None) -> dict[str, dict[str, list[str]]]:
    languages = languages or ["ko", "ja"]
    result: dict[str, dict[str, list[str]]] = {}
    for category_id in CATEGORIES:
        result[category_id] = {
            lang: generate_questions_for_category(category_id, lang) for lang in languages
        }

    # 카테고리 미선택("전체") 상태에서는 각 카테고리 첫 질문을 모아 보여준다.
    default_entry: dict[str, list[str]] = {}
    for lang in languages:
        picked = [
            result[category_id][lang][0]
            for category_id in CATEGORIES
            if result[category_id].get(lang)
        ]
        default_entry[lang] = picked[:QUESTIONS_PER_CATEGORY]
    result["default"] = default_entry
    return result
