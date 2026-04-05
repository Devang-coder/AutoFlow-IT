<p align="center">
  <h1 align="center">AutoFlow IT Ops</h1>
  <p align="center"><strong>Autonomous Kubernetes Remediation Engine — Detect, Decide, Fix, Learn</strong></p>
  <p align="center">
    <img src="https://img.shields.io/badge/React_18-61DAFB?style=flat&logo=react&logoColor=black" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white" />
    <img src="https://img.shields.io/badge/Kubernetes-326CE5?style=flat&logo=kubernetes&logoColor=white" />
    <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white" />
    <img src="https://img.shields.io/badge/n8n-EA4B71?style=flat&logo=n8n&logoColor=white" />
    <img src="https://img.shields.io/badge/Groq_AI-000000?style=flat&logo=groq&logoColor=white" />
  </p>
</p>

---

AutoFlow is a **closed-loop autonomous operations engine** that detects infrastructure anomalies in real time, evaluates them using a **multi-agent AI consensus system**, executes Kubernetes remediation actions, and **learns from every outcome** — all in under 10 seconds, without human intervention.

## The Problem

Cloud-native applications running on Kubernetes generate thousands of telemetry events per hour. Today's incident response is still reactive — engineers get paged at 2 AM, spend 30–90 minutes investigating, and repeat the same fixes manually. Alert fatigue leads to missed critical incidents, and there is zero learning from past resolutions.

**AutoFlow replaces this entire cycle with autonomous, intelligent operations.**

| Metric | Traditional (Reactive) | AutoFlow (Autonomous) |
|---|---|---|
| Mean Time to Resolve | 30–90 minutes | **Under 10 seconds** |
| Human Required | 24/7 on-call engineer | **Zero for known patterns** |
| False Positive Handling | Manual triage | **AI-filtered via multi-agent consensus** |
| Learning | Tribal knowledge | **Adaptive weight optimization** |

---

## Architecture — The DVELE Loop

```
Detect  →  Validate  →  Evaluate  →  Learn  →  Execute
```

AutoFlow operates as a five-stage closed loop:

1. **DETECT** — Prometheus watches Kubernetes metrics (CPU, memory, error rates, latency). Alerts fire to AutoFlow via webhook.
2. **VALIDATE** — Z-Score statistical analysis + threshold checks + spike detection filter noise from real anomalies.
3. **EVALUATE** — Four independent AI agents analyze the incident in parallel and vote on the response.
4. **LEARN** — After every remediation, agent weights adjust based on outcome. The system gets smarter with every incident.
5. **EXECUTE** — Kubernetes API performs real actions: pod restarts, service scaling, traffic rerouting, node isolation.

### Multi-Agent Consensus Engine

AutoFlow's core differentiator. Four specialized AI agents independently evaluate each incident:

| Agent | Evaluates | Default Weight |
|---|---|---|
| **Anomaly Agent** | Statistical severity of the deviation | 30% |
| **Risk Agent** | Blast radius and cascading failure probability | 35% |
| **SLA Agent** | Time-to-breach vs current trajectory | 25% |
| **Context Agent** | Historical patterns and time-of-day context | 10% |

**Decision thresholds:** Score < 0.3 → Ignore | 0.3–0.6 → Alert Only | > 0.6 → Auto-Remediate

Weights are **adaptive** — agents that make correct predictions gain trust, incorrect ones lose trust. After 50+ incidents, measurable accuracy improvement is observable.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Automation Engine** | n8n (5 interconnected workflows) |
| **AI / LLM** | Groq (Llama 3.3 70B) for agent inference |
| **Frontend** | React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui |
| **Backend API** | Node.js + Express 5 + Socket.IO (real-time) |
| **Database** | PostgreSQL (Neon DB — serverless) |
| **Monitoring** | Prometheus + Kubernetes cAdvisor |
| **Infrastructure** | Kubernetes (Minikube) + Docker |
| **Charts** | Recharts for real-time data visualization |

---

## Repository Structure

```
AutoFlow-IT/
├── backend/                        # Node.js API server
│   ├── db/
│   │   └── connection.js           # PostgreSQL (Neon DB) connection pool
│   ├── routes/
│   │   ├── incidentRoutes.js       # GET  /incidents — full event lifecycle
│   │   ├── metricsRoutes.js        # GET  /metrics   — MTTR, success rate
│   │   ├── weightsRoutes.js        # GET  /weights   — agent weight distribution
│   │   ├── simulateRoutes.js       # POST /simulate  — trigger demo incident
│   │   ├── eventRoutes.js          # POST /event     — n8n → save raw event
│   │   ├── decisionRoutes.js       # POST /decision  — n8n → save agent decision
│   │   └── actionRoutes.js         # POST /action    — n8n → save remediation result
│   ├── mockData.js                 # Fallback mock data (demo always works)
│   ├── socket.js                   # Socket.IO real-time event emitter
│   ├── index.js                    # Express server entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/                       # React dashboard (Vite + TypeScript)
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/          # Core dashboard components
│   │   │   │   ├── HeaderMetrics.tsx
│   │   │   │   ├── IncidentCard.tsx
│   │   │   │   ├── IncidentDetailPanel.tsx
│   │   │   │   ├── IncidentStream.tsx
│   │   │   │   ├── LearningPanel.tsx
│   │   │   │   ├── SimulationTrigger.tsx
│   │   │   │   ├── TimelineFlow.tsx
│   │   │   │   ├── ActivityLog.tsx
│   │   │   │   ├── AnimatedCounter.tsx
│   │   │   │   ├── CinematicEntry.tsx
│   │   │   │   └── GridBackground.tsx
│   │   │   └── ui/                 # shadcn/ui component library
│   │   ├── hooks/
│   │   │   └── useRealTimeData.ts  # Socket.IO live data hook
│   │   ├── lib/
│   │   │   ├── api.ts              # Axios API client
│   │   │   ├── mock-data.ts        # Mock data for development
│   │   │   └── utils.ts
│   │   ├── pages/
│   │   └── App.tsx
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   └── .env.example
│
├── n8n-workflows/                  # Automation pipeline (import into n8n)
│   ├── AutoFlow_AI_Workflows_1_2.json   # Workflows 1-2: Telemetry → AI Agents
│   └── AutoFlow_AI_Workflows_3_4_5.json # Workflows 3-5: Remediation → Learning
│
├── kubernetes/                     # K8s manifests for monitoring & testing
│   ├── our-system.yaml             # Full monitoring stack deployment
│   ├── prometheus-config.yaml      # Prometheus server ConfigMap
│   ├── stress-test.yaml            # CPU stress test pod (demo)
│   └── values.yaml                 # Helm values for Prometheus alerts
│
├── .gitignore
└── README.md
```

---

## Setup & Installation

### Prerequisites

- **Node.js 18+** and npm
- **Docker Desktop** with Kubernetes enabled (or Minikube)
- **n8n** (self-hosted or cloud instance)
- **Neon DB** account ([neon.tech](https://neon.tech) — free tier works)
- **Groq** API key ([console.groq.com](https://console.groq.com) — free tier)

### 1. Clone the Repository

```bash
git clone https://github.com/Devang-coder/AutoFlow-IT.git
cd AutoFlow-IT
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env → add your Neon DB password and n8n webhook URL
npm install
npm run dev
# Server runs at http://localhost:3001
```

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
# Dashboard opens at http://localhost:5173
```

### 4. n8n Workflow Import

1. Open your n8n instance (self-hosted or cloud).
2. Import **`n8n-workflows/AutoFlow_AI_Workflows_1_2.json`** → Contains Workflow 1 (Telemetry Ingestion + Anomaly Detection) and Workflow 2 (Multi-Agent AI Evaluation).
3. Import **`n8n-workflows/AutoFlow_AI_Workflows_3_4_5.json`** → Contains Workflow 3 (Remediation Execution), Workflow 4 (Outcome Monitoring), and Workflow 5 (Adaptive Learning).
4. Configure credentials in n8n:
   - **PostgreSQL** → Neon DB connection (host, database, user, password, SSL: require)
   - **Groq API** → HTTP Header Auth with your API key
5. Activate all workflows.

### 5. Kubernetes Setup (for Live Demo)

```bash
# Start Minikube (if not using Docker Desktop K8s)
minikube start

# Deploy the monitoring stack
kubectl apply -f kubernetes/our-system.yaml

# Deploy Prometheus config
kubectl apply -f kubernetes/prometheus-config.yaml

# Deploy stress test pod (for demo)
kubectl apply -f kubernetes/stress-test.yaml

# Verify pods are running
kubectl get pods -A
```

---

## API Reference

### Frontend-Facing Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check + endpoint listing |
| `GET` | `/incidents` | Last 50 anomaly incidents with full lifecycle (event + decision + action) |
| `GET` | `/metrics` | Aggregated KPIs: MTTR, success rate, incident count |
| `GET` | `/weights` | Current AI agent weight distribution |
| `POST` | `/simulate` | Trigger a simulated incident (supports `cpu`, `disk`, `pod` types) |

### n8n Ingest Endpoints

| Method | Endpoint | Called By | Description |
|---|---|---|---|
| `POST` | `/event` | Workflow 1 | Store normalized event after anomaly detection |
| `POST` | `/decision` | Workflow 2 | Store multi-agent consensus decision |
| `POST` | `/action` | Workflow 4 | Store Kubernetes remediation outcome |

### Real-Time Events (Socket.IO)

| Event | Direction | Payload |
|---|---|---|
| `incident_update` | Server → Client | Full incident state (flat object) |
| `metrics_update` | Server → Client | Updated dashboard KPIs |
| `weights_update` | Server → Client | Updated agent weights |
| `simulation_triggered` | Server → Client | Simulation status + payload |

---

## Database Schema

AutoFlow uses **5 tables** and **3 views** in PostgreSQL (Neon DB):

| Table | Purpose |
|---|---|
| `autoflow_events` | Raw telemetry events with anomaly detection results (Z-score, severity, confidence) |
| `autoflow_decisions` | Multi-agent consensus scores, individual agent scores, reasoning, and final decision |
| `autoflow_actions` | Remediation actions with MTTR tracking, outcome, and recovery metrics |
| `autoflow_agent_weights` | Current adaptive weights per agent (updated after every remediation) |
| `autoflow_learning_log` | Weight change history — proves the system learns over time |

---

## How It Works — End to End

```
CPU Spike on Kubernetes Pod
        │
        ▼
Prometheus detects anomaly → webhook fires
        │
        ▼
n8n Workflow 1: Normalize → Z-Score Analysis → Save event to DB
        │
        ▼
n8n Workflow 2: 4 AI Agents evaluate in parallel → Weighted consensus score
        │
        ▼
Score > 0.6 → n8n Workflow 3: Execute Kubernetes remediation (scale/restart)
        │
        ▼
n8n Workflow 4: Monitor recovery → Verify metrics returned to baseline
        │
        ▼
n8n Workflow 5: Update agent weights based on success/failure
        │
        ▼
React Dashboard shows entire lifecycle in real time via WebSocket
```

---

## Demo Script

1. Open the AutoFlow dashboard at `http://localhost:5173`
2. Click **"Simulate Incident"** → Choose CPU / Disk / Pod failure
3. Watch the incident card appear in real-time:
   - **Detected** → anomaly identified with severity badge
   - **Evaluating** → four AI agents score the incident independently
   - **Remediating** → Kubernetes action executing
   - **Resolved** → recovery confirmed, MTTR displayed
4. Check the **Learning Panel** → agent weights adjust after each resolution
5. MTTR shows **under 10 seconds** — zero human intervention required

---

## The n8n Workflow Architecture

| Workflow | Name | Purpose |
|---|---|---|
| **1** | Telemetry Ingestion & Anomaly Detection | Receives metrics via webhook, computes Z-scores against historical baseline, classifies severity, saves to DB |
| **2** | Multi-Agent AI Evaluation | Runs 4 Groq LLM calls in parallel (Anomaly, Risk, SLA, Context agents), computes weighted consensus, decides action |
| **3** | Remediation Execution | Executes Kubernetes API calls (pod restart, service scaling), alerts for sub-threshold incidents |
| **4** | Outcome Monitoring | Polls recovery metrics, determines success/failure, updates event status |
| **5** | Adaptive Learning Engine | Adjusts agent weights using reinforcement learning (5% learning rate), normalizes to sum = 1.0, logs changes |

---

## Team

| Member | Role |
|---|---|
| **Devang** | N8N Automation Architect |
| **Omkar** | Frontend Lead — React dashboard, real-time visualization, UI/UX |
| **Bhavesh** | Frontend Support + API Bridge — Reusable UI components, data layer |
| **Heet** | Backend Engineer — Node.js API, Socket.IO |
| **Parth** | Infrastructure & DevOps — Kubernetes cluster, Prometheus, stress testing |
| **Sakshi** |N8N Assistant Architect |

---

## License

Built for a hackathon. Available for educational and demonstration purposes.
