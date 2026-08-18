"""검색된 Parent 원문을 컨텍스트로 조립해 Claude에 전달하고 답변을 받는다."""
from __future__ import annotations

from app.core.vectorstore import search
from app.services.claude_client import ask_claude

SYSTEM_PROMPT = """당신은 니이하마 공업고등전문학교 학생들을 돕는 학생편람 안내 챗봇입니다.
아래 제공되는 [참고 자료]만 근거로 답변하세요.
참고 자료에 없는 내용은 추측하지 말고, "학생편람에서 관련 내용을 찾지 못했습니다. 학생과 또는 담당 부서에 문의해주세요."라고 답하세요.
답변은 간결하고 명확하게 작성하세요.
반드시 사용자의 질문과 같은 언어로 답변하세요 (질문이 일본어면 일본어로, 한국어면 한국어로)."""


def _build_context(hits: list[dict]) -> str:
    parts = []
    for i, hit in enumerate(hits, 1):
        label = hit.get("category_label") or hit.get("category") or ""
        parts.append(f"[자료 {i}] ({label}) {hit['heading']}\n{hit['text']}")
    return "\n\n".join(parts)


def answer_question(message: str, category: str | None = None, k: int = 5) -> dict:
    hits = search(message, k=k, category=category)
    context = _build_context(hits) if hits else "관련 자료를 찾지 못했습니다."
    user_prompt = f"[참고 자료]\n{context}\n\n[질문]\n{message}"
    answer = ask_claude(system=SYSTEM_PROMPT, user_message=user_prompt)

    return {
        "answer": answer,
        "category_used": category,
        "sources": [
            {
                "parent_id": hit["parent_id"],
                "category": hit.get("category"),
                "heading": hit["heading"],
                "text_snippet": hit["text"][:200],
            }
            for hit in hits
        ],
    }
