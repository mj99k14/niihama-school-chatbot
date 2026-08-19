# 新居浜学生便覧 RAG チャットボット

[한국어](README.md) | [日本語](README.ja.md)

新居浜工業高等専門学校の学生便覧(PDF)を根拠に回答する RAG(Retrieval-Augmented Generation)チャットボットです。学生がカテゴリーを選択するか自由に質問すると、学生便覧から関連する根拠を探し、その内容のみに基づいて韓国語/日本語で回答します。

**デモ**: http://35.79.216.241

## 主な機能

- 学生便覧 PDF に基づく RAG 回答(根拠のない内容は推測せず、担当部署への問い合わせを案内)
- 9つのカテゴリー別の質問/回答とカテゴリー別の会話履歴の分離、「すべて」ではすべての履歴を閲覧
- 韓国語/日本語の自動判定回答 + 言語の手動指定
- 回答根拠(原文閲覧)パネル、いいね/よくないねフィードバック
- カテゴリー別のおすすめ質問の自動生成
- ストリーミング応答(NDJSON)、埋め込みモデルのキャッシュによる体感応答速度の改善

## 技術スタック

**フロントエンド**
- React 19 + TypeScript + Vite
- Tailwind CSS 4

**バックエンド**
- FastAPI + Uvicorn
- Anthropic Claude API(回答生成)
- Chroma(ベクトル DB)+ `intfloat/multilingual-e5-large`(ローカル埋め込み)
- PyMuPDF(PDF 解析)

**インフラ**
- AWS EC2(Ubuntu)1台に nginx + systemd でフロント(静的ファイル)・バックエンド(API)を同居させて配信

## プロジェクト構成

```
niihama-school-chatbot/
├── src/                    # フロントエンド (React)
│   ├── api/                 # バックエンド API 呼び出し
│   ├── components/          # UI コンポーネント
│   ├── hooks/                # useChat など状態管理フック
│   ├── i18n/                 # 韓国語/日本語の多言語テキスト
│   └── types/                 # 共通型定義
├── backend/                # バックエンド (FastAPI) — 詳細は backend/README.md 参照
│   ├── app/                  # API ルーター、RAG パイプライン、Claude 連携
│   ├── data/raw/               # 元の学生便覧 PDF
│   ├── scripts/ingest.py        # PDF -> チャンク分割 -> 埋め込み -> インデックス化
│   └── requirements.txt
├── deploy/                 # AWS EC2 デプロイガイド/設定テンプレート
│   ├── DEPLOY.md              # デプロイ手順全体
│   ├── nginx.conf.example
│   └── niihama-backend.service
└── BACKEND_PLAN.md         # バックエンド設計の背景
```

## ローカル開発環境の構築

### バックエンド

```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate   # Windows Git Bash。PowerShell の場合は .venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

`backend/.env.example` を参考に `backend/.env` を作成:

```
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-sonnet-5
```

ベクトルインデックスの生成(初回のみ + PDF/チャンク分割ロジック変更時):

```bash
python scripts/ingest.py
python scripts/generate_suggested_questions.py
```

サーバー起動:

```bash
uvicorn app.main:app --reload --port 8000
```

API エンドポイント、リクエスト/レスポンスのスキーマなど詳細は [`backend/README.md`](backend/README.md) 参照。

### フロントエンド

```bash
npm install
npm run dev
```

`.env.example` を参考にルートに `.env` を作成(ローカルバックエンドのアドレス):

```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

### コマンド

```bash
npm run dev       # 開発サーバー
npm run build     # 本番ビルド (tsc -b && vite build)
npm run lint       # oxlint
npm run preview    # ビルド結果のプレビュー
```

## デプロイ

AWS EC2 1台に nginx でフロント/バックエンドを同居させてデプロイする手順は [`deploy/DEPLOY.md`](deploy/DEPLOY.md) にまとめてあります。コードやデータを更新した後の再デプロイ方法も、同じドキュメントの一番下「更新デプロイ」セクションにあります。
