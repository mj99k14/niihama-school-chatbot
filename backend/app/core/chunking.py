"""Parent-Child 청킹.

Parent: PDF 섹션(제목+본문) 단위. 너무 짧은 섹션은 다음 섹션과 병합해 크기를 확보한다.
Child: Parent를 문장 단위로 다시 쪼갠 작은 조각. 벡터 검색은 Child 기준으로 하고,
       검색 결과에서 parent_id로 원래 섹션 전체를 되찾아 LLM 컨텍스트로 사용한다.
"""
from __future__ import annotations

import uuid
from dataclasses import dataclass, field

from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.core.pdf_loader import PdfSection

PARENT_MIN_CHARS = 300
CHILD_CHUNK_SIZE = 350
CHILD_CHUNK_OVERLAP = 50
JAPANESE_SEPARATORS = ["\n\n", "\n", "。", "、", " ", ""]


@dataclass
class ParentChunk:
    id: str
    heading: str
    text: str
    page_start: int
    page_end: int
    metadata: dict = field(default_factory=dict)


@dataclass
class ChildChunk:
    id: str
    parent_id: str
    text: str
    metadata: dict = field(default_factory=dict)


def _merge_short_sections(sections: list[PdfSection]) -> list[PdfSection]:
    merged: list[PdfSection] = []
    buffer: PdfSection | None = None

    for section in sections:
        if buffer is None:
            buffer = section
            continue
        if len(buffer.text) < PARENT_MIN_CHARS:
            buffer = PdfSection(
                heading=f"{buffer.heading} / {section.heading}",
                text=f"{buffer.text}\n{section.heading}\n{section.text}",
                page_start=buffer.page_start,
                page_end=section.page_end,
            )
        else:
            merged.append(buffer)
            buffer = section
    if buffer is not None:
        merged.append(buffer)
    return merged


def build_parent_chunks(sections: list[PdfSection]) -> list[ParentChunk]:
    merged = _merge_short_sections(sections)
    return [
        ParentChunk(
            id=str(uuid.uuid4()),
            heading=section.heading,
            text=section.text,
            page_start=section.page_start,
            page_end=section.page_end,
            metadata={
                "heading": section.heading,
                "page_start": section.page_start,
                "page_end": section.page_end,
            },
        )
        for section in merged
    ]


def build_child_chunks(parents: list[ParentChunk]) -> list[ChildChunk]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHILD_CHUNK_SIZE,
        chunk_overlap=CHILD_CHUNK_OVERLAP,
        separators=JAPANESE_SEPARATORS,
    )
    children: list[ChildChunk] = []
    for parent in parents:
        for piece in splitter.split_text(parent.text):
            children.append(
                ChildChunk(
                    id=str(uuid.uuid4()),
                    parent_id=parent.id,
                    text=piece,
                    metadata={**parent.metadata, "parent_id": parent.id},
                )
            )
    return children
