"""카테고리별 예상 질문을 Claude로 생성해 storage/suggested_questions.json에 저장한다.

ingest.py로 벡터 인덱스를 새로 만든 뒤, 학생편람 PDF나 카테고리 분류가 바뀌었을 때
이 스크립트를 다시 실행한다. 재인덱싱마다 비용이 들지 않도록 ingest.py와는 분리했다.

실행 (backend/ 디렉터리에서, venv 활성화 후):
    python scripts/generate_suggested_questions.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config import settings
from app.core.suggested_questions import generate_all

OUTPUT_PATH = Path(settings.parent_store_path).parent.parent / "suggested_questions.json"


def main() -> None:
    result = generate_all()
    OUTPUT_PATH.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"저장 완료: {OUTPUT_PATH}")
    for category_id, by_lang in result.items():
        for lang, questions in by_lang.items():
            print(f"  {category_id}/{lang}: {len(questions)}개")


if __name__ == "__main__":
    main()
