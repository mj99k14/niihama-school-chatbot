from collections.abc import Iterator

from anthropic import Anthropic

from app.config import settings

_client: Anthropic | None = None


def get_client() -> Anthropic:
    global _client
    if _client is None:
        _client = Anthropic(api_key=settings.anthropic_api_key)
    return _client


def ask_claude(system: str, user_message: str, max_tokens: int = 1024) -> str:
    client = get_client()
    response = client.messages.create(
        model=settings.claude_model,
        max_tokens=max_tokens,
        system=system,
        messages=[{"role": "user", "content": user_message}],
    )
    return "".join(block.text for block in response.content if block.type == "text")


def stream_claude(system: str, user_message: str, max_tokens: int = 1024) -> Iterator[str]:
    """생성되는 텍스트를 토큰 단위로 순차적으로 내보낸다 (체감 응답 속도 개선용)."""
    client = get_client()
    with client.messages.stream(
        model=settings.claude_model,
        max_tokens=max_tokens,
        system=system,
        messages=[{"role": "user", "content": user_message}],
    ) as stream:
        yield from stream.text_stream
