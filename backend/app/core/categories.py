"""7개 카테고리 정의 및 Parent chunk 대상 규칙 기반(키워드) 태깅.

Parent에 category를 먼저 채운 뒤 build_child_chunks를 호출하면,
Child는 부모의 metadata(category 포함)를 그대로 상속받는다.
"""
from __future__ import annotations

from app.core.chunking import ParentChunk

CATEGORIES: dict[str, dict[str, object]] = {
    "school_life_rules": {
        "label": "학교생활 규정 안내",
        "description": "학생심득 / 학생생활",
        "keywords": [
            "服装", "身だしなみ", "制服", "通学", "自転車", "アルバイト",
            "喫煙", "飲酒", "車両", "送迎", "登山", "海外渡航", "挨拶", "心得", "自動車", "免許",
        ],
    },
    "id_certificate": {
        "label": "증명서·학생증 발급",
        "description": "학생생활 (학생증·IC카드·운임할인)",
        "keywords": ["学生証", "ＩＣカード", "ICカード", "学生旅客運賃割引証", "学割", "通学証明書", "通学定期"],
    },
    "health_counseling": {
        "label": "보건·상담 지원",
        "description": "보건관리센터",
        "keywords": ["保健室", "学生相談室", "相談", "傷害保険", "健康", "カウンセ", "特別支援教育", "メンタルヘルス"],
    },
    "facilities": {
        "label": "시설 이용 안내",
        "description": "시설의 사용",
        "keywords": [
            "尚友会館", "教室", "実験室", "クラブハウス", "更衣室", "鍵の管理", "忘れ物",
            "施設・設備使用許可", "時間外使用", "学生食堂", "売店", "合宿研修所",
        ],
    },
    "clubs": {
        "label": "학생회·동아리 활동",
        "description": "학생회·과외활동 / 학생회 관계규칙",
        "keywords": [
            "学生会", "部活動", "クラブ", "同好会", "課外活動", "学生大会", "中央委員会",
            "学級会", "選挙管理委員会", "代議員会", "監査委員会", "会計局", "文化局", "体育局",
            "学生会準則", "解職要求", "専門委員会",
        ],
    },
    "scholarship_aid": {
        "label": "장학금·학비지원 제도",
        "description": "고등학교 등 취학지원금 / 고등교육 수학지원 신제도 / 장학금",
        "keywords": ["就学支援金", "修学支援", "奨学金"],
    },
    "library": {
        "label": "도서관 이용 안내",
        "description": "도서관 이용심득",
        "keywords": ["図書館", "貸出", "返却", "開館", "電子資料", "利用資格", "蔵書"],
    },
    "academic_procedures": {
        "label": "학사 절차 안내",
        "description": "학칙 / 학생준칙",
        "keywords": [
            "学則", "学生準則", "入学", "転科", "転学", "留学", "卒業", "単位", "専攻科",
            "学年", "学期", "研究生", "聴講生", "外国人留学生", "自己評価",
        ],
    },
    "payment": {
        "label": "납부금 안내",
        "description": "제납금 일람",
        "keywords": ["諸納金", "検定料", "入学料", "授業料", "寄宿料", "納期", "納入", "除籍"],
    },
}

DEFAULT_CATEGORY = "school_life_rules"

# 키워드 점수만으로는 우연한 단어 겹침(예: 도난방지 안내문에 "교실"·"更衣室"이 언급되어
# "시설 이용"으로 잘못 분류되는 경우) 때문에 오분류가 나는 항목들을 검수 후 직접 지정한다.
# heading 앞부분이 key와 일치하면 키워드 점수와 무관하게 이 category로 확정한다.
MANUAL_OVERRIDES: dict[str, str] = {
    "学生の自主的な取り組みを支援する": "school_life_rules",
    "１ 成績通知": "school_life_rules",
    "第８章 集会": "school_life_rules",
    "第10章 掲示": "school_life_rules",
    "第1 0章 掲示": "school_life_rules",
}


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
    """각 parent.metadata에 category를 채우고, 수동 예외에도 없고 키워드 매칭도
    0건이라 기본값으로 떨어진 heading 목록을 반환한다 (검수용)."""
    unmatched: list[str] = []
    for parent in parents:
        override_id = next(
            (cat_id for prefix, cat_id in MANUAL_OVERRIDES.items() if parent.heading.startswith(prefix)),
            None,
        )
        if override_id:
            category_id, score = override_id, 1
        else:
            category_id, score = classify(f"{parent.heading}\n{parent.text}")

        parent.metadata["category"] = category_id
        parent.metadata["category_label"] = CATEGORIES[category_id]["label"]
        if score == 0:
            unmatched.append(parent.heading)
    return unmatched


def list_categories() -> list[dict[str, str]]:
    return [
        {"id": cat_id, "label": info["label"], "description": info["description"]}
        for cat_id, info in CATEGORIES.items()
    ]
