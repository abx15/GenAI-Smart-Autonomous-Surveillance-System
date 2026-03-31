# GenAI Smart Autonomous Surveillance System (SASS)

A production-grade, event-driven microservices architecture for intelligent autonomous surveillance processing using computer vision and Generative AI.

## 🚀 Overview

SASS is a comprehensive surveillance system that combines real-time computer vision detection with AI-powered analysis. The system processes video feeds, detects security events, generates intelligent alerts, and provides natural language querying capabilities for surveillance data.

## 🏗️ Architecture

This project is structured as a monorepo utilizing `pnpm workspaces`. It breaks down into the following distinct components:

### Technology Stack
| Layer | Tech |
|---|---|
| **API Gateway** | Node.js, Fastify, TypeScript |
| **Backend Services** | Node.js, Fastify, TypeScript, KafkaJS |
| **Detection Service** | Python, FastAPI, OpenCV, PyTorch, Pydantic |
| **Frontend** | React, Next.js 15, HeroUI, TailwindCSS |
| **Event Bus** | Apache Kafka |
| **Database** | MongoDB |
| **Containerization** | Docker, Docker Compose |
| **AI/ML** | LangChain, OpenAI GPT-4o |
| **State Management** | Zustand, TanStack Query |
| **Authentication** | JWT, bcrypt |

### 📡 Core Services

| Service | Port | Description |
|---|---|---|
| **API Gateway** | `3000` | Central entry point for frontend components |
| **Auth Service** | `3001` | JWT authentication and user management |
| **Event Service** | `3002` | Processing zone events and loitering detection |
| **Alert Service** | `3003` | Real-time WebSocket alerts with rate limiting |
| **GenAI Service** | `3004` | AI-powered queries and report generation |
| **Detection Service** | `8001` | Python vision service for object detection |
| **Frontend** | `3006` | Next.js Dashboard UI |

## ✨ Key Features

- **🎥 Real-time Video Processing**: Computer vision detection with bounding boxes
- **🤖 AI-Powered Analysis**: Natural language queries using LangChain + OpenAI
- **📡 Real-time Alerts**: WebSocket-based instant notifications
- **🔐 Secure Authentication**: JWT-based auth with refresh tokens
- **📊 Event Management**: Comprehensive event logging and filtering
- **🎯 Zone Management**: Configurable surveillance zones
- **📱 Responsive UI**: Modern interface with HeroUI components
- **🔄 Event Streaming**: Kafka-based real-time data flow
- **📈 Report Generation**: AI-powered shift reports
- **📹 Camera Integration**: getUserMedia permission handling

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- MongoDB
- Kafka (or use the provided Docker setup)

### 1. Clone and Setup
```bash
git clone https://github.com/abx15/GenAI-Smart-Autonomous-Surveillance-System.git sass-system
cd sass-system
pnpm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start Development Environment
```bash
# Start all services with Docker Compose
docker-compose -f infra/docker/docker-compose.yml up -d

# Or run services individually
pnpm run dev:gateway
pnpm run dev:auth
pnpm run dev:events
pnpm run dev:alerts
pnpm run dev:genai
pnpm run dev:frontend
```

### 4. Access the Application
- **Frontend Dashboard**: http://localhost:3006
- **API Gateway**: http://localhost:3000
- **API Health Check**: http://localhost:3000/health

## 📁 Project Structure

```
sass-system/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── lib/            # Utilities and API client
│   │   └── store/           # Zustand state management
├── services/                # Microservices
│   ├── api-gateway/        # API gateway and proxy
│   ├── auth-service/       # Authentication service
│   ├── event-service/      # Event processing service
│   ├── alert-service/      # Alert and notification service
│   ├── genai-service/      # AI and NLP service
│   └── detection-service/  # Python detection service
├── shared/                  # Shared utilities and types
│   ├── config/             # Database and environment configs
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Common utilities
└── infra/                  # Infrastructure as Code
    ├── docker/             # Docker configurations
    └── kubernetes/         # K8s manifests
```

## 🔧 Configuration

### Environment Variables

Key environment variables to configure:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/sass

# Kafka
KAFKA_BROKERS=localhost:9092

# Services
AUTH_SERVICE_URL=http://localhost:3001
EVENT_SERVICE_URL=http://localhost:3002
ALERT_SERVICE_URL=http://localhost:3003
GENAI_SERVICE_URL=http://localhost:3004

# AI/ML
OPENAI_API_KEY=your_openai_api_key_here

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 📖 API Documentation

### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Token refresh
- `GET /auth/me` - Get user profile

### Event Endpoints
- `GET /events` - List events with filtering
- `PUT /events/:id/resolve` - Mark event as resolved
- `GET /events/stats` - Event statistics

### Alert Endpoints
- `GET /alerts/history` - Alert history
- `GET /alerts/unacknowledged` - Unacknowledged alerts
- `PUT /alerts/:id/acknowledge` - Acknowledge alert

### AI Endpoints
- `POST /ai/query` - Natural language query
- `POST /ai/summarize` - Event summarization
- `POST /ai/report` - Generate report

## 🎛️ Development

### Running Tests
```bash
# Run all tests
pnpm test

# Run tests for specific service
pnpm test:auth
pnpm test:events
pnpm test:alerts
pnpm test:genai
```

### Code Quality
```bash
# Linting
pnpm lint

# Type checking
pnpm type-check

# Formatting
pnpm format
```

## 🐳 Docker Deployment

### Production Build
```bash
# Build all services
pnpm build

# Deploy with Docker Compose
docker-compose -f infra/docker/docker-compose.prod.yml up -d
```

### Kubernetes Deployment
```bash
# Apply Kubernetes manifests
kubectl apply -f infra/kubernetes/
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth with refresh tokens
- **Rate Limiting**: Prevent abuse with configurable limits
- **Input Validation**: Zod schema validation for all inputs
- **CORS Protection**: Configurable cross-origin policies
- **Camera Permissions**: getUserMedia consent flow
- **Data Encryption**: Secure data transmission

## 📊 Monitoring & Logging

- **Structured Logging**: Pino logger with consistent format
- **Health Checks**: Service health endpoints
- **Event Auditing**: Complete audit trail
- **Performance Metrics**: Request timing and system stats

## 🤖 AI Features

The GenAI Service provides:
- **Natural Language Queries**: Ask questions about surveillance data
- **Event Summarization**: AI-powered event descriptions
- **Report Generation**: Automated shift reports
- **Context-Aware Responses**: RAG with MongoDB events

Example queries:
- "Show me all critical events from the last hour"
- "How many intrusion events occurred today?"
- "Generate a security report for the night shift"

## 🎯 Use Cases

- **Commercial Security**: Monitor business premises
- **Residential Surveillance**: Home security monitoring
- **Industrial Safety**: Workplace safety compliance
- **Public Spaces**: Area monitoring and crowd control
- **Critical Infrastructure**: Facility protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the [Wiki](https://github.com/abx15/GenAI-Smart-Autonomous-Surveillance-System/wiki)
- Review the [documentation](docs/)

---

**Built with ❤️ for intelligent surveillance** 🎥🤖
