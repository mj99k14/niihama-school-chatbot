# 니이하마 학생편람 RAG 챗봇 — 백엔드

니이하마 공업고등전문학교 학생편람(PDF) 기반 RAG 챗봇 API. 프론트엔드(React)는 별도 저장소/폴더에서 개발되며, 이 백엔드는 REST API(`/chat`, `/categories`)로 연동됩니다.

전체 설계 배경은 [`../BACKEND_PLAN.md`](../BACKEND_PLAN.md) 참고.

## 기술 스택

- FastAPI (웹 프레임워크)
- Anthropic Claude API (답변 생성)
- Chroma (벡터 DB, child chunk 검색)
- `intfloat/multilingual-e5-large` (임베딩, 로컬 실행 — Anthropic은 임베딩 API 미제공)
- PyMuPDF (PDF 텍스트/폰트 정보 추출)

## 최초 설정

```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate   # Windows(Git Bash). PowerShell은 .venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

`.env` 파일 생성 (`.env.example` 참고):

```
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-sonnet-5
```

## 인덱스 생성 (최초 1회 + PDF/청킹 로직 변경 시마다)

```bash
python scripts/ingest.py
```

`data/raw/`의 PDF를 읽어 섹션 추출 → Parent/Child 청킹 → 카테고리 태깅 → 임베딩 → `storage/chroma_db`(벡터), `storage/docstore`(Parent 원문)에 저장합니다. 실행 후 `data/processed/chunking_review.json`에서 카테고리별 청크 목록을 검수할 수 있습니다.

이 단계는 매번 저장소를 비우고 처음부터 다시 만듭니다 (증분 업데이트 아님).

## 서버 실행

```bash
uvicorn app.main:app --reload --port 8000
```

- `GET /health` — 헬스체크
- `GET /categories` — 카테고리 목록 (id, label, description)
- `POST /chat` — 질문 → RAG 검색 → Claude 답변

```json
// POST /chat 요청
{
  "message": "アルバイトはしてもいいですか？",
  "category": null,        // optional, 카테고리 id로 필터링
  "session_id": null        // optional, 아직 미사용 (대화 히스토리용으로 예약)
}
```

```json
// 응답
{
  "answer": "...",
  "category_used": null,
  "sources": [
    {"parent_id": "...", "category": "school_life_rules", "heading": "...", "text_snippet": "..."}
  ]
}
```

답변 언어는 질문 언어를 따라갑니다 (일본어로 물으면 일본어로, 한국어로 물으면 한국어로).

## 프로젝트 구조

```
backend/
├── app/
│   ├── main.py                   # FastAPI 앱 진입점
│   ├── config.py                 # 환경변수 설정
│   ├── api/                      # 라우터 (chat, categories)
│   ├── core/
│   │   ├── pdf_loader.py         # PDF -> 폰트 기반 heading 섹션 추출
│   │   ├── chunking.py           # Parent-Child 청킹
│   │   ├── categories.py         # 9개 카테고리 정의 + 키워드/수동예외 태깅
│   │   ├── embeddings.py         # multilingual-e5 임베딩 래퍼
│   │   ├── vectorstore.py        # Chroma(child) + JSON(parent) 저장/검색
│   │   └── rag_chain.py          # 검색 결과 조립 + Claude 호출
│   ├── models/schemas.py         # Pydantic 요청/응답 모델
│   └── services/claude_client.py # Anthropic API 래퍼
├── data/
│   ├── raw/                      # 원본 PDF
│   └── processed/                # 청킹 검수용 JSON (ingest 시 생성)
├── storage/
│   ├── chroma_db/                # 벡터 인덱스 (ingest 시 생성, git 미포함)
│   └── docstore/                 # Parent 원문 JSON (ingest 시 생성, git 미포함)
├── scripts/ingest.py              # 전체 재인덱싱 스크립트
└── requirements.txt               # pip freeze로 고정된 전체 의존성
```

## 카테고리 태깅 방식과 한계

Parent chunk의 제목+본문에서 카테고리별 키워드를 카운트해 가장 많이 매칭된 카테고리를 부여하는 규칙 기반 방식입니다. 우연히 다른 카테고리 키워드가 섞여 오분류되는 경우를 발견하면 `app/core/categories.py`의 `MANUAL_OVERRIDES`에 `heading 앞부분 -> category_id`를 추가해 바로잡을 수 있습니다.

PDF의 heading 감지는 폰트 크기/볼드 기반 휴리스틱이라 목차 페이지처럼 레이아웃이 특이한 곳은 텍스트가 부자연스럽게 추출될 수 있습니다 (예: 글자별 줄바꿈). 현재는 그대로 두었고, 콘텐츠 가치가 낮아 검색 품질에 미치는 영향은 적습니다.

## 남은 작업 / TODO

- [ ] 프론트엔드 연동 후 CORS `allow_origins`를 `*`에서 실제 도메인으로 제한
- [ ] `session_id` 기반 대화 히스토리 지원 여부 결정
- [ ] `tests/` 디렉터리에 pytest 테스트 추가
