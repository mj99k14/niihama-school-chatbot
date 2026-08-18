"""Child chunk는 Chroma(벡터 검색), Parent chunk는 로컬 JSON(원문 조회)에 저장한다.

검색 흐름: 질문 임베딩 -> Child 벡터 top-k 검색 -> 매칭된 child의 parent_id로
Parent 원문을 조회 -> 중복 제거 후 반환. (ParentDocumentRetriever 패턴을
제목 기반 커스텀 청킹 구조에 맞게 재구현한 것)
"""
from __future__ import annotations

import json
from pathlib import Path

from langchain_chroma import Chroma
from langchain_core.documents import Document

from app.config import settings
from app.core.chunking import ChildChunk, ParentChunk
from app.core.embeddings import get_embeddings

COLLECTION_NAME = "niihama_child_chunks"


class ParentStore:
    def __init__(self, path: str | None = None):
        self.path = Path(path or settings.parent_store_path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._data: dict[str, dict] = {}
        if self.path.exists():
            self._data = json.loads(self.path.read_text(encoding="utf-8"))

    def save(self, parents: list[ParentChunk]) -> None:
        self._data = {
            parent.id: {
                "heading": parent.heading,
                "text": parent.text,
                "page_start": parent.page_start,
                "page_end": parent.page_end,
                "category": parent.metadata.get("category"),
            }
            for parent in parents
        }
        self.path.write_text(
            json.dumps(self._data, ensure_ascii=False, indent=2), encoding="utf-8"
        )

    def get(self, parent_id: str) -> dict | None:
        return self._data.get(parent_id)

    def all_categories(self) -> list[str]:
        return sorted({p["category"] for p in self._data.values() if p.get("category")})

    def items(self) -> list[tuple[str, dict]]:
        return list(self._data.items())


def get_vectorstore(embeddings=None) -> Chroma:
    return Chroma(
        collection_name=COLLECTION_NAME,
        embedding_function=embeddings or get_embeddings(),
        persist_directory=settings.chroma_persist_dir,
    )


def index_chunks(
    parents: list[ParentChunk],
    children: list[ChildChunk],
    embeddings=None,
) -> None:
    ParentStore().save(parents)

    vectorstore = get_vectorstore(embeddings)
    documents = [Document(page_content=child.text, metadata=child.metadata) for child in children]
    ids = [child.id for child in children]
    vectorstore.add_documents(documents, ids=ids)


def search(
    query: str,
    k: int = 5,
    category: str | None = None,
    embeddings=None,
) -> list[dict]:
    vectorstore = get_vectorstore(embeddings)
    store = ParentStore()

    filter_ = {"category": category} if category else None
    results = vectorstore.similarity_search_with_score(query, k=k, filter=filter_)

    seen_parents: set[str] = set()
    hits: list[dict] = []
    for doc, score in results:
        parent_id = doc.metadata.get("parent_id")
        if not parent_id or parent_id in seen_parents:
            continue
        seen_parents.add(parent_id)
        parent = store.get(parent_id)
        if parent:
            hits.append({"parent_id": parent_id, "score": float(score), **parent})
    return hits
