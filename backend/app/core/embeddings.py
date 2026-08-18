"""임베딩 모델 래퍼.

Anthropic은 임베딩 API를 제공하지 않으므로, 일본어 문서에 적합한 다국어 임베딩
모델을 로컬에서 실행한다. multilingual-e5 계열은 검색 품질을 위해 문서에는
"passage: ", 질문에는 "query: " 접두사를 붙이는 것을 권장하므로 여기서 처리한다.
"""
from __future__ import annotations

from langchain_huggingface import HuggingFaceEmbeddings

EMBEDDING_MODEL_NAME = "intfloat/multilingual-e5-large"


class E5Embeddings(HuggingFaceEmbeddings):
    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return super().embed_documents([f"passage: {text}" for text in texts])

    def embed_query(self, text: str) -> list[float]:
        return super().embed_query(f"query: {text}")


def get_embeddings() -> E5Embeddings:
    return E5Embeddings(
        model_name=EMBEDDING_MODEL_NAME,
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True},
    )
