# 🛡️ SASS — GenAI Smart Autonomous Surveillance System

<div align="center">

![SASS Banner](https://img.shields.io/badge/SASS-Surveillance%20AI-00ff88?style=for-the-badge&logo=shield&logoColor=black)
![Status](https://img.shields.io/badge/status-production--ready-00ff88?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![Node](https://img.shields.io/badge/node-20.x-339933?style=flat-square&logo=node.js)
![Python](https://img.shields.io/badge/python-3.11-3776AB?style=flat-square&logo=python)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)

**Real-time AI-powered surveillance with natural language querying**

[Live Demo](#) · [Documentation](#) · [Report Bug](#) · [Request Feature](#)

</div>

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [System Workflow](#system-workflow)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Quick Start (Local)](#quick-start-local)
  - [Docker Setup](#docker-setup)
  - [Kubernetes Setup](#kubernetes-setup)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Camera Access](#camera-access)
- [Contributing](#contributing)
- [Sponsors](#sponsors)
- [License](#license)

---

## 🎯 About

SASS (Smart Autonomous Surveillance System) is a **production-grade, microservices-based AI surveillance platform** that combines:

- **Real-time person detection** using YOLOv8 + ByteTrack
- **Intelligent event generation** (intrusion, loitering, zone entry)
- **Natural language querying** powered by GPT-4o
- **Live dashboard** with WebSocket alerts

Built for security teams who need more than just cameras — they need insights.

> "Ask your surveillance system questions in plain language and get instant answers."

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎥 **Live Detection** | YOLOv8 person detection at 15 FPS with ByteTrack ID assignment |
| 🗺️ **Zone Management** | Define restricted zones, entry zones, monitoring areas |
| 🚨 **Real-time Alerts** | WebSocket-powered instant alerts with severity levels |
| 🤖 **AI Querying** | Ask in Hindi/English: "Last 10 minutes mein kya hua?" |
| 📊 **Event Analytics** | Full event log with filters, pagination, and stats |
| 📄 **Shift Reports** | AI-generated PDF-ready security reports |
| 🔐 **JWT Auth** | Role-based access (admin / operator / viewer) |
| 🐳 **Docker Ready** | One command to start everything |
| ☸️ **K8s Ready** | Production Kubernetes manifests included |
| 📱 **Responsive UI** | Dark military-themed dashboard |

---

## 🛠️ Tech Stack

### Backend Services
| Service | Language | Framework | Port |
|---------|----------|-----------|------|
| API Gateway | TypeScript | Fastify | 3000 |
| Auth Service | TypeScript | Fastify + JWT | 3001 |
| Event Service | TypeScript | Fastify + KafkaJS | 3002 |
| Alert Service | TypeScript | Fastify + Socket.IO | 3003 |
| GenAI Service | TypeScript | Fastify + LangChain | 3004 |
| Detection Service | Python | FastAPI + YOLOv8 | 8001 |

### Infrastructure
| Tool | Purpose |
|------|---------|
| MongoDB Atlas | Primary database |
| Apache Kafka | Event streaming between services |
| Docker Compose | Local development orchestration |
| Kubernetes | Production deployment |

### Frontend
| Tool | Purpose |
|------|---------|
| Next.js 15 | React framework (App Router) |
| HeroUI | UI component library |
| Socket.IO Client | Real-time alert stream |
| TanStack Query | Server state management |
| Zustand | Client state (alerts) |
| Framer Motion | Animations |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│              Next.js 15 Dashboard (Port 3006)                   │
│     Live Feed │ Alert Panel │ AI Chat │ Event Table │ Reports   │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP / WebSocket
┌────────────────────────────▼────────────────────────────────────┐
│                      API GATEWAY (Port 3000)                    │
│         JWT Auth Middleware │ Rate Limiting │ HTTP Proxy         │
└──┬──────────┬──────────┬──────────┬──────────┬─────────────────┘
   │          │          │          │          │
   ▼          ▼          ▼          ▼          ▼
┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────────┐
│ Auth │  │Event │  │Alert │  │GenAI │  │Detection │
│ :3001│  │ :3002│  │ :3003│  │ :3004│  │  :8001   │
└──────┘  └──┬───┘  └──┬───┘  └──┬───┘  └────┬─────┘
             │          │          │           │
             └──────────┼──────────┘           │
                        │ Kafka Topics          │ MJPEG Stream
             ┌──────────▼──────────┐           │
             │  Apache Kafka       │           │
             │  raw.detections     │◄──────────┘
             │  processed.events   │
             │  alerts.triggered   │
             └──────────┬──────────┘
                        │
             ┌──────────▼──────────┐
             │     MongoDB         │
             │  Events │ Alerts    │
             │  Users  │ Zones     │
             │  Convos │ Logs      │
             └─────────────────────┘
```

---

## 🔄 System Workflow

```
                    ┌──────────────┐
                    │   Webcam     │
                    │  (Camera)    │
                    └──────┬───────┘
                           │ Raw video frames
                    ┌──────▼───────┐
                    │  Detection   │  YOLOv8 person detection
                    │  Service     │  ByteTrack ID assignment
                    │  (Python)    │  Behavior analysis
                    └──────┬───────┘
                           │ DetectionResult JSON
                    ┌──────▼───────┐
                    │    Kafka     │  Topic: raw.detections
                    │   Broker     │
                    └──────┬───────┘
                           │ Consumed by Event Service
                    ┌──────▼───────┐
                    │    Event     │  Intrusion detection
                    │   Service    │  Loitering tracking
                    │  (Node.js)   │  Zone entry/exit
                    └──────┬───────┘
                           │ SurveillanceEvent
              ┌────────────┼────────────────────┐
              │            │                    │
     ┌────────▼───┐ ┌──────▼──────┐   ┌────────▼──────┐
     │  MongoDB   │ │    Kafka    │   │   GenAI        │
     │ (Store     │ │  processed  │   │  Service       │
     │  events)   │ │  .events    │   │  (Summarize)   │
     └────────────┘ └──────┬──────┘   └───────────────┘
                           │
                    ┌──────▼───────┐
                    │    Alert     │  Rate limiting
                    │   Service    │  Room broadcasting
                    │  (Node.js)   │
                    └──────┬───────┘
                           │ Socket.IO events
                    ┌──────▼───────┐
                    │  Frontend    │  Live alerts
                    │  Dashboard   │  AI chat responses
                    │  (Next.js)   │  Event table
                    └──────────────┘
```

**Detection Flow Detail:**
```
Frame → YOLOv8 → [person detected] → ByteTrack → [track_id assigned]
     → Behavior Analysis:
          if (time_in_zone > 30s)         → behavior: 'loitering'
          if (zone.type === 'restricted') → behavior: 'zone_intrusion'
          else                            → behavior: 'normal'
     → Kafka Producer → topic: raw.detections
```

**Event Generation Logic:**
```
Detection received:
  ├── behavior === 'zone_intrusion' AND zone === 'restricted'
  │       → CREATE Event(type: intrusion, severity: critical)
  │       → PUBLISH to alerts.triggered
  │
  ├── isLoitering(trackId) === true (>30s in same area)
  │       → CREATE Event(type: loitering, severity: high)
  │       → PUBLISH to alerts.triggered
  │
  └── first_seen_in_zone(trackId, zoneId)
          → CREATE Event(type: zone_entry, severity: low)
```

---

## 📁 Project Structure

```
sass-system/
│
├── services/                          # 🔧 All microservices
│   ├── api-gateway/                   # Entry point, JWT auth, proxy
│   │   └── src/
│   │       ├── middleware/            # auth.ts, rateLimit.ts, logger.ts
│   │       ├── routes/               # proxy.ts — routes to all services
│   │       └── index.ts
│   │
│   ├── auth-service/                  # User auth, JWT tokens
│   │   └── src/
│   │       ├── models/User.ts         # Mongoose user schema
│   │       ├── services/             # authService.ts, tokenService.ts
│   │       └── api/routes.ts         # register, login, refresh, logout, me
│   │
│   ├── detection-service/             # 🐍 Python AI detection
│   │   └── app/
│   │       ├── models/yolo_model.py  # YOLOv8 singleton
│   │       ├── services/             # detection.py, tracking.py, behavior.py
│   │       └── api/routes.py         # /health, /stream, /stats, /config
│   │
│   ├── event-service/                 # Raw detections → meaningful events
│   │   └── src/
│   │       ├── kafka/                # consumer.ts, producer.ts
│   │       ├── models/               # Event.ts, Zone.ts
│   │       ├── services/             # eventEngine.ts, loiteringTracker.ts
│   │       └── api/routes.ts         # /events, /zones
│   │
│   ├── alert-service/                 # WebSocket real-time alerts
│   │   └── src/
│   │       ├── kafka/consumer.ts     # Consumes events → broadcasts alerts
│   │       ├── websocket/            # server.ts, broadcaster.ts
│   │       ├── services/             # rateLimiter.ts, alertHistory.ts
│   │       └── api/routes.ts         # /alerts/history, /acknowledge
│   │
│   └── genai-service/                 # GPT-4o + LangChain AI
│       └── src/
│           ├── llm/openai.ts          # ChatOpenAI singleton
│           ├── prompts/              # query, summary, report prompts
│           ├── services/             # queryService.ts, contextBuilder.ts
│           └── api/routes.ts         # /query, /summarize, /report
│
├── frontend/                          # 🌐 Next.js 15 Dashboard
│   └── src/
│       ├── app/                       # App Router pages
│       │   ├── (auth)/               # login, register
│       │   └── (dashboard)/          # dashboard, events, reports, settings
│       ├── components/               # camera, alerts, ai, events, stats, layout
│       ├── hooks/                     # useCameraPermission, useAlerts, useEvents
│       ├── store/                     # alertStore.ts (Zustand)
│       └── lib/                       # api.ts, socket.ts
│
├── shared/                            # 📦 Shared between Node services
│   ├── config/db.ts                   # MongoDB connection + DNS fix
│   ├── types/events.ts               # TypeScript interfaces
│   └── utils/                         # logger.ts, response.ts
│
├── infra/
│   ├── docker/docker-compose.yml      # Local dev (all services)
│   └── kubernetes/                    # K8s manifests
│       ├── namespace.yaml
│       ├── configmap.yaml
│       ├── secrets.yaml
│       ├── api-gateway.yaml
│       ├── auth-service.yaml
│       ├── event-service.yaml
│       ├── alert-service.yaml
│       ├── genai-service.yaml
│       ├── detection-service.yaml
│       ├── mongodb.yaml
│       ├── kafka.yaml
│       └── ingress.yaml
│
├── scripts/
│   └── seed.ts                        # Database seeder (test data)
│
├── tests/
│   ├── api.http                       # VS Code REST Client tests
│   └── test-runner.sh                # Automated API test suite
│
├── .github/workflows/
│   ├── ci.yml                         # Lint + type check on PR
│   ├── build-and-push.yml            # Build Docker images on merge
│   └── deploy.yml                    # K8s deploy on merge to main
│
├── .env.example                       # All env vars with descriptions
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed:

```bash
# Required
node --version     # >= 20.x
python --version   # >= 3.11
docker --version   # >= 24.x
docker compose version  # >= 2.x
pnpm --version     # >= 9.x  (npm install -g pnpm)

# For Kubernetes (optional)
kubectl version
```

### Environment Setup

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/sass-system.git
cd sass-system

# 2. Copy environment file
cp .env.example .env

# 3. Edit .env and fill in your values:
#    MONGODB_URI=mongodb+srv://...   ← your MongoDB Atlas URI
#    OPENAI_API_KEY=sk-proj-...      ← your OpenAI API key
#    JWT_SECRET=your_secret_min_32_chars

nano .env   # or use your preferred editor
```

---

## 🖥️ Quick Start — Local Development (No Docker)

Run each service manually in separate terminals:

```bash
# ─── Terminal 1: Install shared dependencies ───────────────────
cd sass-system
pnpm install

# ─── Terminal 2: Start MongoDB + Kafka (via Docker for infra only) ─
docker compose -f infra/docker/docker-compose.infra.yml up -d
# This starts ONLY: MongoDB, Kafka, Zookeeper, Kafka UI
# Wait 15 seconds for Kafka to be ready

# ─── Terminal 3: Auth Service ──────────────────────────────────
cd services/auth-service
pnpm install
pnpm dev
# ✅ Running on: http://localhost:3001
# ✅ Health: http://localhost:3001/health

# ─── Terminal 4: Event Service ─────────────────────────────────
cd services/event-service
pnpm install
pnpm dev
# ✅ Running on: http://localhost:3002
# ✅ Health: http://localhost:3002/health

# ─── Terminal 5: Alert Service ─────────────────────────────────
cd services/alert-service
pnpm install
pnpm dev
# ✅ Running on: http://localhost:3003
# ✅ Health: http://localhost:3003/health
# ✅ WebSocket: ws://localhost:3003/alerts

# ─── Terminal 6: GenAI Service ─────────────────────────────────
cd services/genai-service
pnpm install
pnpm dev
# ✅ Running on: http://localhost:3004
# ✅ Health: http://localhost:3004/health

# ─── Terminal 7: API Gateway ───────────────────────────────────
cd services/api-gateway
pnpm install
pnpm dev
# ✅ Running on: http://localhost:3000  ← All traffic goes here

# ─── Terminal 8: Detection Service (Python) ────────────────────
cd services/detection-service
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
# ✅ Running on: http://localhost:8001
# 📷 Camera access will be requested when /stream is opened

# ─── Terminal 9: Frontend ──────────────────────────────────────
cd frontend
pnpm install
pnpm dev
# ✅ Running on: http://localhost:3006

# ─── Terminal 10: Seed Database ────────────────────────────────
cd sass-system
pnpm run seed
# ✅ 5 users, 4 zones, 50 events, 30 alerts seeded

# ─── Open Dashboard ────────────────────────────────────────────
open http://localhost:3006
# Login: admin@sass.local  /  Admin@123
```

**Service startup order matters:**
```
MongoDB + Kafka → Auth → Event → Alert → GenAI → API Gateway → Detection → Frontend
```

---

## 🐳 Docker Setup (Recommended)

Run everything with a single command:

```bash
# ─── Step 1: Setup environment ─────────────────────────────────
cp .env.example .env
# Edit .env: add MONGODB_URI and OPENAI_API_KEY

# ─── Step 2: Build and start ALL services ──────────────────────
docker compose -f infra/docker/docker-compose.yml up --build -d

# ─── Step 3: Watch startup logs ────────────────────────────────
docker compose -f infra/docker/docker-compose.yml logs -f

# ─── Step 4: Wait for healthy status (takes ~30 seconds) ───────
docker compose -f infra/docker/docker-compose.yml ps
# All services should show: "healthy" or "running"

# ─── Step 5: Seed the database ─────────────────────────────────
docker compose -f infra/docker/docker-compose.yml exec api-gateway pnpm run seed

# ─── Step 6: Run API tests ─────────────────────────────────────
bash tests/test-runner.sh

# ─── Open Dashboard ────────────────────────────────────────────
open http://localhost:3006
# Login: admin@sass.local  /  Admin@123
```

**Useful Docker commands:**
```bash
# Stop everything
docker compose -f infra/docker/docker-compose.yml down

# Stop + delete volumes (fresh start)
docker compose -f infra/docker/docker-compose.yml down -v

# Rebuild specific service
docker compose -f infra/docker/docker-compose.yml up --build event-service -d

# View logs for one service
docker compose -f infra/docker/docker-compose.yml logs -f genai-service

# Shell into a service
docker compose -f infra/docker/docker-compose.yml exec event-service sh

# View Kafka topics
open http://localhost:8080   # Kafka UI
```

**Service URLs (Docker):**
| Service | URL |
|---------|-----|
| 🌐 Dashboard | http://localhost:3006 |
| 🔌 API Gateway | http://localhost:3000 |
| 📡 Detection Stream | http://localhost:8001/stream |
| 📊 Kafka UI | http://localhost:8080 |
| 🗄️ MongoDB (direct) | mongodb://localhost:27017 |

---

## ☸️ Kubernetes Setup (Production)

```bash
# ─── Prerequisites ─────────────────────────────────────────────
# kubectl configured to your cluster
# Nginx Ingress Controller installed
# cert-manager installed (for TLS)

# ─── Step 1: Create namespace ──────────────────────────────────
kubectl apply -f infra/kubernetes/namespace.yaml

# ─── Step 2: Create secrets ────────────────────────────────────
# Edit infra/kubernetes/secrets.yaml with base64-encoded values:
echo -n 'your_mongodb_uri' | base64
echo -n 'your_openai_key' | base64
echo -n 'your_jwt_secret' | base64

kubectl apply -f infra/kubernetes/secrets.yaml
kubectl apply -f infra/kubernetes/configmap.yaml

# ─── Step 3: Deploy infrastructure ────────────────────────────
kubectl apply -f infra/kubernetes/mongodb.yaml
kubectl apply -f infra/kubernetes/kafka.yaml

# Wait for MongoDB and Kafka to be ready
kubectl wait --for=condition=ready pod -l app=mongodb -n sass-system --timeout=120s
kubectl wait --for=condition=ready pod -l app=kafka -n sass-system --timeout=120s

# ─── Step 4: Deploy all services ──────────────────────────────
kubectl apply -f infra/kubernetes/auth-service.yaml
kubectl apply -f infra/kubernetes/event-service.yaml
kubectl apply -f infra/kubernetes/alert-service.yaml
kubectl apply -f infra/kubernetes/genai-service.yaml
kubectl apply -f infra/kubernetes/detection-service.yaml
kubectl apply -f infra/kubernetes/api-gateway.yaml
kubectl apply -f infra/kubernetes/ingress.yaml

# ─── Step 5: Check status ─────────────────────────────────────
kubectl get pods -n sass-system
kubectl get services -n sass-system
kubectl get ingress -n sass-system

# ─── Step 6: View logs ────────────────────────────────────────
kubectl logs -f deployment/event-service -n sass-system
kubectl logs -f deployment/genai-service -n sass-system

# ─── Useful K8s commands ──────────────────────────────────────
# Scale a service
kubectl scale deployment event-service --replicas=3 -n sass-system

# Rolling update
kubectl rollout restart deployment/event-service -n sass-system

# Get all resources
kubectl get all -n sass-system

# Delete everything
kubectl delete namespace sass-system
```

---

## 📷 Camera Access

SASS needs camera access for **live person detection**. Here's how it works:

### How Camera Permission Works

```
1. User opens Dashboard
2. CameraPermissionGate component is shown
3. User clicks "Allow Camera Access"
4. Browser shows native permission dialog
5. On GRANT → local webcam feed starts (getUserMedia)
6. On DENY  → instructions shown + option to use remote feed
```

### Two Camera Modes

| Mode | Description | When to Use |
|------|-------------|-------------|
| 📷 **Local Camera** | Uses browser's getUserMedia API | Dev/demo — your laptop camera |
| 📡 **Remote Feed** | MJPEG stream from detection service | Production — connected IP camera |

### Switching Modes

In the dashboard, click the mode toggle above the camera feed:
- 📷 Local Camera → browser requests permission, shows your webcam
- 📡 Detection Service → connects to http://localhost:8001/stream 

### Browser Permissions Guide

**Chrome:** Address bar → Lock icon (🔒) → Camera → Allow → Refresh  
**Firefox:** Address bar → Shield icon → Permissions → Camera → Allow  
**Safari:** Safari menu → Preferences → Websites → Camera → Allow

### Privacy

> 🔒 Camera footage is processed **locally on your device**. No video is uploaded to any cloud server. Detection results (bounding boxes, track IDs) are sent to the backend, but never the raw video stream.

---

## 🔌 API Reference

Base URL: http://localhost:3000/api 

All protected routes require: Authorization: Bearer <accessToken> 

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Create new account |
| POST | /auth/login | Login → get tokens |
| POST | /auth/refresh | Rotate access token |
| GET | /auth/me | Get current user |
| POST | /auth/logout | Revoke refresh token |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /events | List events (filters: type, severity, camera, page) |
| GET | /events/stats | Aggregated counts by type and severity |
| GET | /events/recent?minutes=10 | Events from last N minutes |
| GET | /events/:eventId | Single event detail |
| PUT | /events/:eventId/resolve | Mark event as resolved |
| POST | /zones | Create surveillance zone |
| GET | /zones | List all zones |
| DELETE | /zones/:zoneId | Delete a zone |

### Alerts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /alerts/history | Recent alerts from DB |
| GET | /alerts/unacknowledged | Unread alerts for badge |
| PUT | /alerts/:alertId/acknowledge | Dismiss an alert |
| GET | /alerts/stats/live | Live WebSocket connection stats |

### AI / GenAI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /ai/query | Natural language query |
| POST | /ai/summarize | Summarize a specific event |
| POST | /ai/report | Generate shift report |
| GET | /ai/conversations/:userId | Chat history |
| DELETE | /ai/conversations/:id | Delete conversation |

### Detection (Direct)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | http://localhost:8001/health | Service health |
| GET | http://localhost:8001/stream | MJPEG video stream |
| GET | http://localhost:8001/stats | Detection stats |
| POST | http://localhost:8001/config | Update zone config |

### WebSocket Events

Connect to: ws://localhost:3003/alerts with query ?token=<jwt> 

**Server emits:**
```javascript
socket.on('alert', (alert) => { /* new alert */ })
socket.on('critical_alert', (alert) => { /* severity === critical */ })
socket.on('alert_history', (alerts[]) => { /* last 20 on connect */ })
```

**Client emits:**
```javascript
socket.emit('join_camera', 'CAM-01')    // subscribe to specific camera
socket.emit('join_severity', 'critical') // subscribe to severity level
```

---

## 🌱 Environment Variables

Full list of all required environment variables:

```bash
# ─── Core ──────────────────────────────────────────────────────
NODE_ENV=development                    # development | production | test
LOG_LEVEL=info                          # fatal | error | warn | info | debug | trace

# ─── Database ──────────────────────────────────────────────────
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/sass_db
MONGODB_DB_NAME=sass_db

# ─── Authentication ────────────────────────────────────────────
JWT_SECRET=your_secret_minimum_32_characters_long_random
JWT_ACCESS_EXPIRES=15m                  # Access token lifetime
JWT_REFRESH_EXPIRES=7d                  # Refresh token lifetime

# ─── AI ────────────────────────────────────────────────────────
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxx     # OpenAI API key (GPT-4o)
OPENAI_MODEL=gpt-4o                     # Model to use
OPENAI_MAX_TOKENS=1024                  # Max response tokens
OPENAI_TEMPERATURE=0.3                  # Lower = more factual

# ─── Kafka ─────────────────────────────────────────────────────
KAFKA_BROKERS=localhost:9092            # Comma-separated broker list
KAFKA_CLIENT_ID=sass-system
KAFKA_TOPIC_DETECTIONS=raw.detections
KAFKA_TOPIC_EVENTS=processed.events
KAFKA_TOPIC_ALERTS=alerts.triggered

# ─── Service Ports ─────────────────────────────────────────────
API_GATEWAY_PORT=3000
AUTH_SERVICE_PORT=3001
EVENT_SERVICE_PORT=3002
ALERT_SERVICE_PORT=3003
GENAI_SERVICE_PORT=3004
DETECTION_SERVICE_PORT=8001
FRONTEND_PORT=3006

# ─── Detection ─────────────────────────────────────────────────
CAMERA_INDEX=0                          # 0=default webcam, 1=secondary
YOLO_MODEL=yolov8n.pt                   # nano(fast) | small | medium | large
CONFIDENCE_THRESHOLD=0.45              # Min detection confidence (0-1)
LOITERING_THRESHOLD_SECONDS=30         # Seconds before loitering alert

# ─── Frontend (NEXT_PUBLIC_ vars exposed to browser) ───────────
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_ALERT_WS_URL=http://localhost:3003
NEXT_PUBLIC_STREAM_URL=http://localhost:8001/stream
```

---

## 🧪 Testing

```bash
# VS Code REST Client (install REST Client extension)
# Open: tests/api.http → Run each request

# Automated bash test suite (needs all services running + seed done)
bash tests/test-runner.sh

# Expected output:
# ✅ PASS [200] — API Gateway Health
# ✅ PASS [200] — Auth Service Health
# ✅ PASS [200] — Event Service Health
# ✅ PASS [200] — Alert Service Health
# ✅ PASS [200] — GenAI Service Health
# ✅ PASS [201] — Register User
# ✅ PASS [200] — Login
# ... (33 total tests)
# 🎉 ALL TESTS PASSED!
```

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

### 1. Fork & Clone
```bash
git clone https://github.com/yourusername/sass-system.git
cd sass-system
git checkout -b feature/your-feature-name
```

### 2. Development Setup
```bash
cp .env.example .env
# Fill in test MongoDB URI and OpenAI key
pnpm install
docker compose -f infra/docker/docker-compose.infra.yml up -d  # infra only
```

### 3. Code Standards

| Rule | Detail |
|------|--------|
| **TypeScript** | Strict mode enabled — no any without comment |
| **Linting** | ESLint + Prettier (pnpm lint) |
| **Commit format** | feat:, fix:, docs:, refactor: |
| **Comments** | JSDoc on all public functions and API routes |
| **Tests** | Add API test case for new routes in tests/api.http |

### 4. Pull Request Guidelines
- One feature/fix per PR
- Include description of what changed and why
- Update tests/api.http if adding new routes
- Update README if adding new env vars or services
- Ensure bash tests/test-runner.sh passes (0 failures)

### 5. Good First Issues
- 🔲 Add WebRTC support for lower-latency camera feed
- 🔲 Add email notifications for critical alerts
- 🔲 Add support for multiple camera streams
- 🔲 Add face recognition using InsightFace
- 🔲 Add export to PDF for shift reports
- 🔲 Add Grafana dashboard for Kafka metrics

### Development Guidelines

**Adding a new service:**
1. Create services/my-service/ following existing service structure
2. Add to docker-compose.yml 
3. Add proxy route in api-gateway/src/routes/proxy.ts 
4. Add K8s manifest in infra/kubernetes/ 
5. Add health check to tests/test-runner.sh 

**Adding a new API route:**
1. Add JSDoc comment above the route handler
2. Add to API Reference table in README
3. Add test case to tests/api.http 

---

## 💎 Sponsors

SASS is an open-source project. If it helps you, consider sponsoring:

<div align="center">

### 🌟 Gold Sponsors
*Your logo here — [Become a Gold Sponsor](#)*

### 🥈 Silver Sponsors
*Your logo here — [Become a Silver Sponsor](#)*

### ☕ Individual Supporters

[Support on GitHub Sponsors](#) · [Buy Me a Coffee](#) · [Patreon](#)

</div>

**Why sponsor?**
- Your logo in README (Gold/Silver tiers)
- Priority issue response
- Feature request consideration
- Early access to new features

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for full text.

```
MIT License

Copyright (c) 2024 SASS Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software... (standard MIT text)
```

---

## 🙏 Acknowledgements

| Library | Purpose |
|---------|---------|
| [Ultralytics YOLOv8](https://github.com/ultralytics/ultralytics) | Person detection model |
| [Supervision](https://github.com/roboflow/supervision) | ByteTrack + annotators |
| [LangChain](https://github.com/langchain-ai/langchainjs) | LLM chaining framework |
| [HeroUI](https://heroui.com) | React UI components |
| [Fastify](https://fastify.dev) | Node.js web framework |
| [KafkaJS](https://kafka.js.org) | Kafka client for Node.js |

---

<div align="center">

Built with ❤️ for the security community

⭐ Star this repo if it helped you!

</div>
