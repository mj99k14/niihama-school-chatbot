import type { Lang } from "./types";

interface CategoryText {
  label: string;
  description: string;
}

const CATEGORY_TRANSLATIONS: Record<string, Record<Lang, CategoryText>> = {
  school_life_rules: {
    ja: { label: "学校生活規則案内", description: "学生心得 / 学生生活" },
    ko: { label: "학교생활 규정 안내", description: "학생심득 / 학생생활" },
  },
  id_certificate: {
    ja: {
      label: "証明書・学生証発行",
      description: "学生生活（学生証・ICカード・運賃割引）",
    },
    ko: {
      label: "증명서・학생증 발급",
      description: "학생생활(학생증・IC카드・운임할인)",
    },
  },
  health_counseling: {
    ja: { label: "保健・相談支援", description: "保健管理センター" },
    ko: { label: "보건・상담 지원", description: "보건관리센터" },
  },
  facilities: {
    ja: { label: "施設利用案内", description: "施設の使用" },
    ko: { label: "시설 이용 안내", description: "시설의 사용" },
  },
  clubs: {
    ja: { label: "学生会・クラブ活動", description: "学生会・課外活動 / 学生会関係規則" },
    ko: { label: "학생회・동아리 활동", description: "학생회・과외활동 / 학생회 관계규칙" },
  },
  scholarship_aid: {
    ja: {
      label: "奨学金・学費支援制度",
      description: "高等学校等就学支援金 / 高等教育の修学支援新制度 / 奨学金",
    },
    ko: {
      label: "장학금・학비지원 제도",
      description: "고등학교 등 취학지원금 / 고등교육 수학지원 신제도 / 장학금",
    },
  },
  library: {
    ja: { label: "図書館利用案内", description: "図書館利用心得" },
    ko: { label: "도서관 이용 안내", description: "도서관 이용심득" },
  },
  academic_procedures: {
    ja: { label: "学事手続案内", description: "学籍 / 学生準則" },
    ko: { label: "학사 절차 안내", description: "학적 / 학생준칙" },
  },
  payment: {
    ja: { label: "納付金案内", description: "諸納金一覧" },
    ko: { label: "납부금 안내", description: "제납금 일람" },
  },
};

export function translateCategory(
  id: string,
  lang: Lang,
  fallback: { label: string; description: string }
): CategoryText {
  return CATEGORY_TRANSLATIONS[id]?.[lang] ?? fallback;
}
