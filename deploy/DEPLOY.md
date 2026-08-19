# AWS EC2 배포 가이드

프론트(Vite/React 빌드)+백엔드(FastAPI, 로컬 임베딩 모델+ChromaDB)를 EC2 인스턴스 한 대에
nginx로 같이 띄우는 가장 단순한 구성. 임베딩 모델을 상시 메모리에 올려두므로 최소
**t3.medium(2vCPU/4GB)** 이상을 권장한다.

## 0. EC2 인스턴스

- AMI: Ubuntu 22.04 LTS
- 인스턴스 타입: t3.medium 이상
- 스토리지: 20GB gp3면 충분
- 보안 그룹 인바운드:
  - 22 (SSH) — 내 IP만
  - 80 (HTTP) — 0.0.0.0/0
  - 443 (HTTPS) — 0.0.0.0/0 (도메인 연결 후 certbot 발급용)
  - 8000은 열지 않는다 (nginx가 localhost로만 백엔드에 접근, 외부 직접 노출 불필요)
- 학교에서 받은 도메인의 DNS A 레코드를 이 인스턴스의 퍼블릭 IP로 연결해둔다.

## 1. 서버 기본 세팅

```bash
sudo apt update && sudo apt install -y python3.12 python3.12-venv git nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo snap install certbot --classic   # HTTPS용
```

## 2. 레포 클론 + 백엔드 세팅

```bash
git clone https://github.com/mj99k14/niihama-school-chatbot.git ~/niihama_chatbot
cd ~/niihama_chatbot/backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

`.env` 파일을 서버에 직접 생성한다 (git에는 안 올라가 있음, 로컬 `.env` 내용을 그대로 옮기면 됨):

```bash
cat > .env <<'EOF'
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-sonnet-5
EOF
```

벡터 인덱스/예상질문 캐시 생성 (PDF는 이미 레포에 포함돼 있음):

```bash
python scripts/ingest.py
python scripts/generate_suggested_questions.py
```

> 참고: 로컬에서 이미 만든 `backend/storage/`를 `scp -r`로 그대로 올리면 재생성 없이 바로 쓸 수 있어 더 빠르다.

## 3. 백엔드를 systemd 서비스로 등록

`deploy/niihama-backend.service`의 경로(`/home/ubuntu/...`)를 실제 사용자/경로에 맞게 확인한 뒤:

```bash
sudo cp ~/niihama_chatbot/deploy/niihama-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now niihama-backend
sudo systemctl status niihama-backend   # active (running) 확인
curl http://127.0.0.1:8000/health       # {"status":"ok"} 확인
```

## 4. 프론트 빌드

같은 오리진에서 nginx가 API를 프록시하도록 base URL을 빈 값으로 빌드한다:

```bash
cd ~/niihama_chatbot
echo "VITE_API_BASE_URL=" > .env
npm install
npm run build   # dist/ 생성
```

## 5. nginx 설정

```bash
sudo cp ~/niihama_chatbot/deploy/nginx.conf.example /etc/nginx/sites-available/niihama-chatbot
sudo sed -i 's/YOUR_DOMAIN/실제도메인/' /etc/nginx/sites-available/niihama-chatbot
sudo ln -s /etc/nginx/sites-available/niihama-chatbot /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

이 시점에 `http://실제도메인`으로 접속해서 동작 확인.

## 6. HTTPS

```bash
sudo certbot --nginx -d 실제도메인
```

certbot이 nginx 설정을 자동으로 443/리다이렉트까지 확장해준다. 이후 `https://실제도메인`으로 접속.

## 업데이트 배포 (재배포 시)

```bash
cd ~/niihama_chatbot
git pull origin main

# 백엔드 변경 시
cd backend && source .venv/bin/activate && pip install -r requirements.txt
sudo systemctl restart niihama-backend

# 프론트 변경 시
cd ~/niihama_chatbot && npm install && npm run build
# nginx는 dist/ 파일을 바로 서빙하므로 재시작 불필요
```
