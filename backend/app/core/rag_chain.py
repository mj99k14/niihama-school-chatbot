"""검색된 Parent 원문을 컨텍스트로 조립해 Claude에 전달하고 답변을 받는다."""
from __future__ import annotations

import json
from collections.abc import Iterator

from app.core.vectorstore import search
from app.services.claude_client import stream_claude

SYSTEM_PROMPT_KO = """당신은 니이하마 공업고등전문학교 학생들을 돕는 학생편람 안내 챗봇입니다.
아래 제공되는 [참고 자료]만 근거로 답변하세요.
참고 자료에 근거가 없는 내용은 추측하지 말고, 학생편람에서 관련 내용을 찾지 못했다는 취지로 답한 뒤 학생과 또는 담당 부서에 문의하라고 안내하세요.
답변은 간결하고 명확하게 작성하세요.
최종 답변의 모든 문장은 예외 없이 한국어로만 작성하세요. 다른 언어를 단 한 단어도 섞지 마세요."""

SYSTEM_PROMPT_JA = """あなたは新居浜工業高等専門学校の学生を助ける学生便覧案内チャットボットです。
以下に提供される[参考資料]のみを根拠に回答してください。
参考資料に根拠がない内容は推測せず、学生便覧で関連情報が見つからなかった旨を伝えたうえで、学生課または担当部署に問い合わせるよう案内してください。
回答は簡潔かつ明確に作成してください。
最終回答のすべての文は例外なく日本語のみで書いてください。他の言語を一語たりとも混在させないでください。"""

SYSTEM_PROMPT_AUTO = """당신은 니이하마 공업고등전문학교 학생들을 돕는 학생편람 안내 챗봇입니다.
아래 제공되는 [참고 자료]만 근거로 답변하세요.
참고 자료에 근거가 없는 내용은 추측하지 말고, 학생편람에서 관련 내용을 찾지 못했다는 취지로 답한 뒤 학생과 또는 담당 부서에 문의하라고 안내하세요. 이 안내 문구도 반드시 사용자 질문과 같은 언어로 작성하세요.
답변은 간결하고 명확하게 작성하세요.
최종 답변의 모든 문장은 사용자 질문과 같은 언어로만 작성하세요 (일본어 질문이면 답변 전체를 일본어로만, 한국어 질문이면 한국어로만 — 언어를 섞지 마세요)."""


def _system_prompt_for(language: str | None) -> str:
    if language == "ko":
        return SYSTEM_PROMPT_KO
    if language == "ja":
        return SYSTEM_PROMPT_JA
    return SYSTEM_PROMPT_AUTO


def _build_context(hits: list[dict]) -> str:
    parts = []
    for i, hit in enumerate(hits, 1):
        label = hit.get("category_label") or hit.get("category") or ""
        parts.append(f"[자료 {i}] ({label}) {hit['heading']}\n{hit['text']}")
    return "\n\n".join(parts)


def stream_answer(
    message: str,
    category: str | None = None,
    language: str | None = None,
    k: int = 5,
) -> Iterator[str]:
    """NDJSON 라인 스트림으로 답변을 내보낸다: sources -> delta(들) -> done.

    답변을 다 만든 뒤 한 번에 보내지 않고 생성되는 대로 흘려보내, 실제 처리 시간은
    같아도 사용자가 체감하는 응답 속도를 크게 줄인다.
    """
    hits = search(message, k=k, category=category)
    context = _build_context(hits) if hits else "(no matching reference material found)"
    user_prompt = f"[참고 자료]\n{context}\n\n[질문]\n{message}"
    system_prompt = _system_prompt_for(language)

    sources = [
        {
            "parent_id": hit["parent_id"],
            "category": hit.get("category"),
            "heading": hit["heading"],
            "text_snippet": hit["text"][:200],
            "page_start": hit["page_start"],
            "page_end": hit["page_end"],
        }
        for hit in hits
    ]

    def _line(payload: dict) -> str:
        return json.dumps(payload, ensure_ascii=False) + "\n"

    yield _line({"type": "sources", "sources": sources, "category_used": category})
    try:
        for chunk in stream_claude(system=system_prompt, user_message=user_prompt):
            yield _line({"type": "delta", "text": chunk})
    except Exception as exc:  # noqa: BLE001 - 스트림 중간 오류를 클라이언트에 알려야 함
        yield _line({"type": "error", "message": str(exc)})
        return
    yield _line({"type": "done"})
