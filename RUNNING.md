---

# ⚡ SASS — Quick Running Guide

## TL;DR (Fastest way to run)

```bash
cp .env.example .env && nano .env  # add MONGODB_URI + OPENAI_API_KEY
docker compose -f infra/docker/docker-compose.yml up -d
sleep 30 && pnpm run seed
open http://localhost:3006
# Login: admin@sass.local / Admin@123
```

---

## 🗺️ Port Map

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3006 | Main dashboard |
| API Gateway | http://localhost:3000 | All API calls go here |
| Auth | http://localhost:3001 | Auth service (direct) |
| Events | http://localhost:3002 | Event service (direct) |
| Alerts | http://localhost:3003 | Alert + WebSocket |
| GenAI | http://localhost:3004 | AI query service |
| Detection | http://localhost:8001 | Python + YOLO |
| Kafka UI | http://localhost:8080 | Kafka browser |

---

## 🔧 Local Dev (No Docker)

### Infrastructure Only via Docker
```bash
docker compose -f infra/docker/docker-compose.infra.yml up -d
# Starts: MongoDB, Kafka, Zookeeper, Kafka UI only
```

### Each Service (separate terminals)
```bash
# Auth Service
cd services/auth-service && pnpm dev          # → :3001

# Event Service
cd services/event-service && pnpm dev         # → :3002

# Alert Service
cd services/alert-service && pnpm dev         # → :3003

# GenAI Service
cd services/genai-service && pnpm dev         # → :3004

# API Gateway (start this LAST of Node services)
cd services/api-gateway && pnpm dev           # → :3000

# Detection Service (Python)
cd services/detection-service
source venv/bin/activate
uvicorn app.main:app --reload --port 8001     # → :8001
# 📷 Camera permission popup appears when /stream is accessed

# Frontend
cd frontend && pnpm dev                        # → :3006

# Seed DB (run once after all services up)
cd sass-system && pnpm run seed
```

---

## 🐳 Docker (All Services)

```bash
# Start everything
docker compose -f infra/docker/docker-compose.yml up -d

# Start fresh (delete data)
docker compose -f infra/docker/docker-compose.yml down -v
docker compose -f infra/docker/docker-compose.yml up -d

# Seed
docker compose -f infra/docker/docker-compose.yml exec api-gateway pnpm run seed

# Logs
docker compose -f infra/docker/docker-compose.yml logs -f [service-name]

# Stop
docker compose -f infra/docker/docker-compose.yml down
```

---

## ☸️ Kubernetes

```bash
# Deploy
kubectl apply -f infra/kubernetes/namespace.yaml
kubectl apply -f infra/kubernetes/secrets.yaml
kubectl apply -f infra/kubernetes/configmap.yaml
kubectl apply -f infra/kubernetes/

# Status
kubectl get pods -n sass-system

# Logs
kubectl logs -f deployment/event-service -n sass-system

# Delete all
kubectl delete namespace sass-system
```

---

## 📷 Camera Setup

**Browser warning:** When you open the dashboard and click "Allow Camera Access",
your browser will show a permission popup. Click **Allow**.

**Camera not working?**
1. Check browser address bar → click 🔒 → set Camera to Allow
2. Or switch to "Detection Service" mode (uses remote MJPEG stream)
3. Or set CAMERA_INDEX=1 in .env if you have multiple cameras

**No physical camera?**
- Use "Detection Service" mode — it shows the remote feed from the Python service
- Or run ffmpeg virtual camera for testing

---

## 🧪 Test Everything

```bash
# All 33 API tests
bash tests/test-runner.sh

# Single service health
curl http://localhost:3000/health
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3004/health
curl http://localhost:8001/health
```

---

## 🔑 Default Test Users

| Email | Password | Role |
|-------|----------|------|
| admin@sass.local | Admin@123 | admin |
| operator1@sass.local | Operator@123 | operator |
| viewer1@sass.local | Viewer@123 | viewer |

---

## ❓ Common Issues

| Problem | Fix |
|---------|-----|
| MongoDB connection fails | Check DNS: add dns.setServers(['8.8.8.8','8.8.4.4']) |
| Kafka not starting | Wait 20s more, or restart: docker compose restart kafka |
| Camera permission denied | Browser settings → allow camera for localhost |
| OpenAI rate limit | Reduce queries or upgrade OpenAI plan |
| Port already in use | lsof -i :3002 then kill -9 <PID> |
