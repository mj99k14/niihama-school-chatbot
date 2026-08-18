
# 니이하마 학생편람 RAG 챗봇 — 백엔드 개발 계획

## 0. 개요
- 목표: 니이하마 공업고등전문학교 학생편람(`니이하마.pdf`) 기반 RAG 챗봇 백엔드를 단독으로 완성
- 프론트엔드(React)는 별도 개발 중 → 나중에 REST API로 연동
- 브랜치: `feature/backend`에서 작업

## 1. 기술 스택 결정사항

| 항목 | 선택 | 이유 |
|---|---|---|
| 언어 | Python | 요청사항 |
| 웹 프레임워크 | FastAPI | 요청사항, 비동기 지원 + Pydantic 스키마 자동 문서화 |
| LLM | Claude API (Anthropic) | 요청사항 |
| 벡터 DB | **Chroma** | 메타데이터 필터링(카테고리별 검색)이 기본 내장되어 있고, 로컬 파일 기반 영속성(persist) 설정이 FAISS보다 훨씬 간단함. FAISS는 순수 벡터 인덱스라 메타데이터 필터링/문서 저장을 직접 관리해야 해서 카테고리 태깅 요구사항과 궁합이 안 좋음 |
| PDF 텍스트 추출 | PyMuPDF (`fitz`) | 일본어(CJK) 텍스트 추출 정확도가 pypdf보다 우수, 레이아웃 정보(섹션 구분)도 함께 활용 가능 |
| 임베딩 모델 | `intfloat/multilingual-e5-large` (HuggingFace, 로컬 실행) | Anthropic은 임베딩 API를 제공하지 않음. 학생편람이 일본어 문서이므로 다국어 지원 임베딩이 필요하고, 로컬 실행이라 별도 API 키/비용 없이 사용 가능 |
| Parent-Child 청킹 | LangChain `ParentDocumentRetriever` 패턴 | 요청사항 — child는 벡터 검색용 소단위, parent는 LLM에 전달할 문맥 단위 |

### ✅ Python 버전 이슈 (해결됨)
Python 3.14.3 환경에서 `pip install --dry-run`으로 확인한 결과 `chromadb`, `sentence-transformers`, `torch` 전부 `cp314` wheel이 이미 제공되어 설치 문제 없음. 버전을 낮추지 않고 3.14 그대로 진행함.

## 2. 프로젝트 폴더 구조 (제안)

```
niihama_chatbot/
├── backend/
│   ├── app/
│   │   ├── main.py                   # FastAPI 앱 엔트리포인트
│   │   ├── config.py                 # 환경변수/설정 (API 키 등)
│   │   ├── api/
│   │   │   ├── routes_chat.py        # POST /chat
│   │   │   └── routes_categories.py  # GET /categories
│   │   ├── core/
│   │   │   ├── pdf_loader.py         # PDF 로딩 + 텍스트 추출
│   │   │   ├── chunking.py           # Parent-Child 청킹
│   │   │   ├── categories.py         # 7개 카테고리 정의 + 태깅 로직
│   │   │   ├── embeddings.py         # 임베딩 모델 래퍼
│   │   │   ├── vectorstore.py        # Chroma + ParentDocumentRetriever 구성
│   │   │   └── rag_chain.py          # 검색 → Claude 호출 로직
│   │   ├── models/
│   │   │   └── schemas.py            # Pydantic 요청/응답 모델
│   │   └── services/
│   │       └── claude_client.py      # Anthropic API 래퍼
│   ├── data/
│   │   └── raw/                      # 원본 PDF (니이하마.pdf)
│   ├── storage/
│   │   ├── chroma_db/                # child chunk 벡터 저장 (영속)
│   │   └── docstore/                 # parent chunk 저장 (로컬 파일)
│   ├── scripts/
│   │   └── ingest.py                 # PDF → 청킹 → 임베딩 → 벡터DB 저장 (1회성 실행 스크립트)
│   ├── tests/
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
```

## 3. 카테고리 정의 (9개, 메타데이터 태깅용)

> 최초 설계는 7개였으나, 프론트엔드 디자인(사이드바)에 맞춰 "시설·동아리 활동"을 시설/동아리로, "학사·납부 규정"을 학사/납부로 각각 분리해 9개로 확정함.

| # | id | 카테고리 | description |
|---|---|---|---|
| 1 | `school_life_rules` | 학교생활 규정 안내 | 학생심득 / 학생생활 |
| 2 | `id_certificate` | 증명서·학생증 발급 | 학생생활 (학생증·IC카드·운임할인) |
| 3 | `health_counseling` | 보건·상담 지원 | 보건관리센터 |
| 4 | `facilities` | 시설 이용 안내 | 시설의 사용 |
| 5 | `clubs` | 학생회·동아리 활동 | 학생회·과외활동 / 학생회 관계규칙 |
| 6 | `scholarship_aid` | 장학금·학비지원 제도 | 고등학교 등 취학지원금 / 고등교육 수학지원 신제도 / 장학금 |
| 7 | `library` | 도서관 이용 안내 | 도서관 이용심득 |
| 8 | `academic_procedures` | 학사 절차 안내 | 학칙 / 학생준칙 |
| 9 | `payment` | 납부금 안내 | 제납금 일람 |

태깅 방식: **Parent chunk(섹션 단위) 기준으로 키워드 매칭 → 카테고리 부여**, 이후 child chunk는 소속된 parent의 카테고리를 그대로 상속. 우연한 키워드 겹침으로 오분류되는 경우를 대비해 `app/core/categories.py`에 `MANUAL_OVERRIDES`(heading 기반 수동 예외)를 키워드 매칭보다 먼저 적용하도록 구성함.

## 4. Parent-Child 청킹 설계

- Parent 분할: 섹션/조항 단위 (예: 큰 제목 기준, 500~1500자)
- Child 분할: Parent 내부를 다시 작은 단위로 분할 (예: 200~400자), 벡터 임베딩 대상
- 검색 흐름: 사용자 질문 → child 벡터 검색(top-k) → 매칭된 child가 속한 parent_id 추출 → 중복 제거 → 해당 parent 원문을 LLM 컨텍스트로 전달
- 저장 구조:
  - Chroma: child chunk + 임베딩 + metadata(`category`, `parent_id`, `chunk_id`)
  - 로컬 docstore: `parent_id → parent 원문 텍스트` 매핑 (LangChain `LocalFileStore` 또는 자체 JSON 저장)

## 5. FastAPI 엔드포인트 설계

### `POST /chat`
```json
// Request
{
  "message": "장학금 신청은 어떻게 하나요?",
  "category": "장학금·학비지원",   // optional, 카테고리 필터
  "session_id": "abc123"           // optional, 추후 대화 히스토리용
}
```
```json
// Response
{
  "answer": "...",
  "category_used": "장학금·학비지원",
  "sources": [
    {"parent_id": "sec_12", "category": "장학금·학비지원", "text_snippet": "..."}
  ]
}
```

### `GET /categories`
```json
[
  {"id": "school_life_rules", "label": "학교생활 규정 안내", "description": "학생심득 / 학생생활"},
  {"id": "id_certificate", "label": "증명서·학생증 발급", "description": "학생생활 (학생증·IC카드·운임할인)"},
  ...
]
```

### 그 외 구현된 엔드포인트 (진행하면서 추가됨)
- `GET /health` — 헬스체크
- `GET /sources/{parent_id}` — 특정 근거의 전체 원문 조회 ("원문 보기"용)
- `GET /document/info`, `GET /document/download` — 원본 PDF 메타정보/다운로드
- `POST /feedback` — 답변 좋아요/싫어요 기록

상세 요청/응답 스키마는 [`backend/README.md`](backend/README.md)와 프론트엔드 전달용 API 문서 참고.

## 6. RAG 검색 → Claude 호출 흐름

1. 사용자 질문 수신
2. (선택) 카테고리 필터 있으면 Chroma metadata filter 적용
3. 질문 임베딩 → child 벡터 top-k 검색
4. 검색된 child → 소속 parent 조회 → 중복 제거 → context 조립
5. 시스템 프롬프트(학교 챗봇 페르소나) + context + 사용자 질문으로 Claude API 호출
6. 응답 + 근거(sources) 반환

## 7. 작업 순서 (진행 체크리스트)

- [x] 0. 가상환경 구성 (Python 3.14 그대로 사용) + 라이브러리 설치 확인
- [x] 1. 프로젝트 폴더 구조 생성
- [x] 2. PDF 로더 + 텍스트 추출 (`니이하마.pdf` 기준, 폰트 크기 기반 heading 감지)
- [x] 3. Parent-Child 청킹 구현 (섹션 64개 → child 175개)
- [x] 4. 임베딩 생성 + Chroma 저장 (`multilingual-e5-large`)
- [x] 5. 카테고리 메타데이터 태깅 (9개, 수동 예외로 오분류 보정)
- [x] 6. FastAPI 엔드포인트 구현 (7개 전부)
- [x] 7. RAG 검색 → Claude 호출 로직 연결 + 통합 테스트 (Postman 컬렉션 포함)

## 8. 확인 필요 사항 (전부 해결됨)
- [x] `니이하마.pdf`가 실제 학생편람 문서 맞음 (일본어 원문)
- [x] Anthropic API 키 발급 및 `backend/.env` 등록 완료
- [x] Python 버전은 3.14 그대로 사용하기로 결정 (3.11/3.12로 낮출 필요 없음)

## 9. 남은 작업 (프론트 연동 이후)
- [ ] 프론트엔드 도메인 확정 후 CORS `allow_origins` 제한
- [ ] `session_id` 기반 대화 히스토리 지원 여부 결정
- [ ] `tests/`에 pytest 테스트 추가
- [ ] main 브랜치와의 병합 시점/방식 결정
