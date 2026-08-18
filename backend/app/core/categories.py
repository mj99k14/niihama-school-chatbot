"""7개 카테고리 정의 및 Parent chunk 대상 규칙 기반(키워드) 태깅.

Parent에 category를 먼저 채운 뒤 build_child_chunks를 호출하면,
Child는 부모의 metadata(category 포함)를 그대로 상속받는다.
"""
from __future__ import annotations

from app.core.chunking import ParentChunk

CATEGORIES: dict[str, dict[str, object]] = {
    "school_life_rules": {
        "label": "학교생활 규정",
        "keywords": [
            "服装", "身だしなみ", "制服", "通学", "自転車", "アルバイト",
            "喫煙", "飲酒", "車両", "送迎", "登山", "海外渡航", "挨拶", "心得", "自動車", "免許",
        ],
    },
    "id_certificate": {
        "label": "증명서·학생증",
        "keywords": ["学生証", "ＩＣカード", "ICカード", "学生旅客運賃割引証", "学割", "通学証明書", "通学定期"],
    },
    "health_counseling": {
        "label": "보건·상담",
        "keywords": ["保健室", "学生相談室", "相談", "傷害保険", "健康", "カウンセ"],
    },
    "facilities_clubs": {
        "label": "시설·동아리 활동",
        "keywords": ["施設", "学生会", "部活動", "クラブ", "同好会", "課外活動"],
    },
    "scholarship_aid": {
        "label": "장학금·학비지원",
        "keywords": ["就学支援金", "修学支援", "奨学金", "授業料"],
    },
    "library": {
        "label": "도서관 이용",
        "keywords": ["図書館", "貸出", "返却", "開館", "電子資料"],
    },
    "academic_payment": {
        "label": "학사·납부 규정",
        "keywords": ["学則", "学生準則", "諸納金", "単位", "卒業", "退学", "休学"],
    },
}

DEFAULT_CATEGORY = "school_life_rules"


def classify(text: str) -> tuple[str, int]:
    best_id = DEFAULT_CATEGORY
    best_score = 0
    for cat_id, info in CATEGORIES.items():
        score = sum(text.count(kw) for kw in info["keywords"])
        if score > best_score:
            best_score = score
            best_id = cat_id
    return best_id, best_score


def tag_categories(parents: list[ParentChunk]) -> list[str]:
    """각 parent.metadata에 category를 채우고, 키워드 매칭이 0건이라 기본값으로
    떨어진 heading 목록을 반환한다 (검수용)."""
    unmatched: list[str] = []
    for parent in parents:
        category_id, score = classify(f"{parent.heading}\n{parent.text}")
        parent.metadata["category"] = category_id
        parent.metadata["category_label"] = CATEGORIES[category_id]["label"]
        if score == 0:
            unmatched.append(parent.heading)
    return unmatched


def list_categories() -> list[dict[str, str]]:
    return [{"id": cat_id, "label": info["label"]} for cat_id, info in CATEGORIES.items()]
