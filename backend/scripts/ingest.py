"""PDF -> 청킹 -> 카테고리 태깅 -> 임베딩 -> Chroma 인덱싱까지 한 번에 실행한다.

기존 벡터 저장소/parent 저장소를 비우고 처음부터 다시 만드는 전체 재인덱싱 스크립트다.
PDF나 청킹/카테고리 로직을 바꾼 뒤에는 이 스크립트를 다시 실행해야 반영된다.

실행 (backend/ 디렉터리에서, venv 활성화 후):
    python scripts/ingest.py
"""
from __future__ import annotations

import json
import shutil
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config import settings
from app.core.categories import CATEGORIES, tag_categories
from app.core.chunking import build_child_chunks, build_parent_chunks
from app.core.pdf_loader import load_sections
from app.core.vectorstore import ParentStore, index_chunks

REVIEW_PATH = Path(__file__).resolve().parent.parent / "data" / "processed" / "chunking_review.json"


def _clear_storage() -> None:
    chroma_dir = Path(settings.chroma_persist_dir)
    docstore_dir = Path(settings.parent_store_path).parent
    for path in (chroma_dir, docstore_dir):
        if path.exists():
            shutil.rmtree(path)
        path.mkdir(parents=True, exist_ok=True)


def _write_review(store: ParentStore) -> None:
    by_category = {
        cat_id: {"label": info["label"], "description": info["description"], "parent_count": 0, "parents": []}
        for cat_id, info in CATEGORIES.items()
    }
    for parent_id, parent in store.items():
        category = parent.get("category") or "uncategorized"
        by_category.setdefault(
            category, {"label": category, "description": "", "parent_count": 0, "parents": []}
        )
        entry = by_category[category]
        entry["parent_count"] += 1
        entry["parents"].append(
            {
                "parent_id": parent_id,
                "heading": parent["heading"],
                "page_start": parent["page_start"],
                "page_end": parent["page_end"],
                "char_length": len(parent["text"]),
                "preview": parent["text"][:150].replace("\n", " "),
            }
        )
    REVIEW_PATH.parent.mkdir(parents=True, exist_ok=True)
    REVIEW_PATH.write_text(json.dumps(by_category, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    t0 = time.time()
    _clear_storage()

    sections = load_sections(settings.pdf_path)
    parents = build_parent_chunks(sections)
    unmatched = tag_categories(parents)
    children = build_child_chunks(parents)
    index_chunks(parents, children)

    store = ParentStore()
    _write_review(store)

    counts: dict[str, int] = {}
    for _, parent in store.items():
        counts[parent["category"]] = counts.get(parent["category"], 0) + 1

    print(f"인덱싱 완료: parent={len(parents)}, child={len(children)}, 소요={time.time() - t0:.1f}s")
    print("카테고리별 개수:")
    for cat_id, info in CATEGORIES.items():
        print(f"  {cat_id} ({info['label']}): {counts.get(cat_id, 0)}개")
    if unmatched:
        print(f"키워드/수동예외 매칭 없이 기본값 처리된 섹션 {len(unmatched)}개:")
        for heading in unmatched:
            print(f"  - {heading}")
    print(f"검토용 JSON: {REVIEW_PATH}")


if __name__ == "__main__":
    main()
