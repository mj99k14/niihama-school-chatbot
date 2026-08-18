"""PDF에서 제목(heading) 기준 섹션을 추출한다.

폰트 크기가 본문 중간값보다 확연히 크거나 볼드체인 짧은 줄을 제목으로 간주하고,
제목이 나올 때마다 새 섹션을 시작한다. 이 섹션 리스트가 Parent-Child 청킹의
Parent 단위 입력이 된다.
"""
from __future__ import annotations

import statistics
from dataclasses import dataclass

import pymupdf as fitz


@dataclass
class PdfSection:
    heading: str
    text: str
    page_start: int
    page_end: int


def _median_font_size(doc: fitz.Document, sample_pages: int = 10) -> float:
    sizes: list[float] = []
    for page in doc[: min(sample_pages, len(doc))]:
        for block in page.get_text("dict")["blocks"]:
            for line in block.get("lines", []):
                for span in line.get("spans", []):
                    if span["text"].strip():
                        sizes.append(span["size"])
    return statistics.median(sizes) if sizes else 10.0


def _iter_lines(doc: fitz.Document):
    for page_index, page in enumerate(doc):
        for block in page.get_text("dict")["blocks"]:
            for line in block.get("lines", []):
                spans = line.get("spans", [])
                if not spans:
                    continue
                text = "".join(span["text"] for span in spans).strip()
                if not text:
                    continue
                max_size = max(span["size"] for span in spans)
                is_bold = any(
                    "Bold" in span["font"] or (span["flags"] & (1 << 4))
                    for span in spans
                )
                yield page_index, text, max_size, is_bold


def load_sections(pdf_path: str, heading_size_ratio: float = 1.15) -> list[PdfSection]:
    doc = fitz.open(pdf_path)
    base_size = _median_font_size(doc)
    heading_threshold = base_size * heading_size_ratio

    sections: list[PdfSection] = []
    current_heading = "개요"
    current_lines: list[str] = []
    current_page_start = 0
    current_page_end = 0

    def flush(page_end: int) -> None:
        if current_lines:
            sections.append(
                PdfSection(
                    heading=current_heading,
                    text="\n".join(current_lines).strip(),
                    page_start=current_page_start,
                    page_end=page_end,
                )
            )

    for page_index, text, size, is_bold in _iter_lines(doc):
        looks_like_heading = len(text) <= 40 and (
            size >= heading_threshold or (is_bold and size >= base_size)
        )
        if looks_like_heading:
            flush(page_index)
            current_heading = text
            current_lines = []
            current_page_start = page_index
        else:
            current_lines.append(text)
        current_page_end = page_index

    flush(current_page_end)
    doc.close()
    return [s for s in sections if s.text]


def extract_full_text(pdf_path: str) -> str:
    doc = fitz.open(pdf_path)
    text = "\n".join(page.get_text() for page in doc)
    doc.close()
    return text
