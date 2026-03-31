sass-system/
│
├── services/                         # All microservices
│
│   ├── api-gateway/
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── middleware/
│   │   │   ├── controllers/
│   │   │   └── index.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── auth-service/
│   │   ├── src/
│   │   │   ├── models/              # MongoDB schemas
│   │   │   ├── controllers/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── index.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── detection-service/           # Python (AI)
│   │   ├── app/
│   │   │   ├── core/
│   │   │   ├── models/              # YOLO
│   │   │   ├── utils/
│   │   │   ├── services/
│   │   │   │   ├── detection.py
│   │   │   │   ├── tracking.py
│   │   │   │   └── behavior.py
│   │   │   └── main.py
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   ├── event-service/
│   │   ├── src/
│   │   │   ├── models/
│   │   │   ├── consumers/           # Kafka consumers
│   │   │   ├── producers/
│   │   │   ├── services/
│   │   │   └── index.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── alert-service/
│   │   ├── src/
│   │   │   ├── websocket/
│   │   │   ├── services/
│   │   │   └── index.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── genai-service/
│   │   ├── src/
│   │   │   ├── llm/
│   │   │   ├── prompts/
│   │   │   ├── services/
│   │   │   └── index.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── log-service/
│       ├── src/
│       │   ├── models/
│       │   ├── services/
│       │   └── index.ts
│       ├── Dockerfile
│       └── package.json
│
├── frontend/                        # Next.js app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── services/
│   ├── Dockerfile
│   └── package.json
│
├── shared/                          # Shared configs
│   ├── config/
│   │   ├── db.ts                   # MongoDB connection
│   │   ├── env.ts
│   ├── utils/
│   └── types/
│
├── infra/                           # Deployment configs
│   ├── docker/
│   │   ├── docker-compose.yml      # Local dev
│   │
│   ├── kubernetes/
│   │   ├── api-gateway.yaml
│   │   ├── auth-service.yaml
│   │   ├── detection-service.yaml
│   │   ├── event-service.yaml
│   │   ├── alert-service.yaml
│   │   ├── genai-service.yaml
│   │   ├── mongodb.yaml
│   │   └── ingress.yaml
│
├── .env
├── .gitignore
└── README.md