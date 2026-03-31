# GenAI Smart Autonomous Surveillance System (SASS)

A production-grade, event-driven microservices architecture for intelligent autonomous surveillance processing using computer vision and Generative AI.

## Architecture

This project is structured as a monorepo utilizing `pnpm workspaces`. It breaks down into the following distinct components:

### Technology Stack
| Layer | Tech |
|---|---|
| **API Gateway** | Node.js, Express, TypeScript |
| **Backend Services** | Node.js, Express, TypeScript, Kafka.js |
| **Detection Service** | Python, FastAPI, OpenCV, PyTorch, Pydantic |
| **Frontend** | React, Next.js, TailwindCSS |
| **Event Bus** | Apache Kafka |
| **Database** | MongoDB |
| **Containerization** | Docker, Docker Compose |
| **Validation** | Zod (Node), Pydantic (Python) |

### Core Services

| Service | Port | Description |
|---|---|---|
| **API Gateway** | `4000` | Central entry point for frontend components |
| **Auth Service** | `4001` | JWT authentication and identity |
| **Event Service** | `4002` | Processing zone entry/exit and intrusion events |
| **Alert Service** | `4003` | Real-time WebSocket alerts and severity grouping |
| **GenAI Service** | `4004` | NLP queries acting as context analysis bot |
| **Log Service** | `4005` | Auditing events and system actions |
| **Detection Service** | `5000` | Python vision service dropping raw bounding boxes into Kafka |
| **Frontend** | `3000` | Next.js Dashboard UI |

## Quick Start
1. Ensure `docker` and `docker-compose` are installed.
2. Initialize environment:
   ```bash
   cp .env.example .env
   ```
3. Run the development environment:
   ```bash
   docker-compose -f infra/docker/docker-compose.yml up -d
   ```
