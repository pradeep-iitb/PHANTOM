# PHANTOM

### Evidence-Driven Threat Actor Attribution Platform

[![Smart India Hackathon 2026](https://img.shields.io/badge/SIH-2026-orange.svg)](https://www.sih.gov.in/)
[![Problem Statement](https://img.shields.io/badge/Problem%20Statement-SIH26151-blue.svg)](https://www.sih.gov.in/)
[![Theme](https://img.shields.io/badge/Theme-Blockchain%20%26%20Cybersecurity-purple.svg)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**PHANTOM** is an evidence-driven threat intelligence and investigation platform that correlates fragmented digital observations across underground ecosystems to generate **transparent, explainable threat-actor attribution hypotheses**.

---

## 📌 Smart India Hackathon 2026 Details

- **Problem Statement ID:** `SIH26151`
- **Problem Statement Title:** Dark-Web Threat Actor De-anonymization
- **Theme:** Blockchain & Cybersecurity
- **Category:** Software
- **Team Name:** TEAM PHANTOM

---

## 🎯 The Core Problem & Philosophy

Threat actor investigations often begin with disjointed, noisy clues across dark web forums, paste sites, marketplace listings, chat channels, and blockchain ledgers:
- Fragmented handles and pseudonyms
- Cryptocurrency wallet addresses
- PGP key fingerprints
- Infrastructure identifiers (IPs, server headers, domains)
- Stylometric markers and behavioural patterns
- Temporal activity schedules across timezones

### Attribution, Not Unchecked Identification

PHANTOM does **not** treat an attribution score as an automated verdict or claim to unmask real-world identities without verification. Instead, PHANTOM builds an **Explainable Attribution Hypothesis** backed by verifiable evidence, transparent signal weights, and explicit contradiction alerts.

```text
Observations / Traces
        ↓
Entity Extraction & Normalization
        ↓
Evidence & Provenance Tracking
        ↓
Dual-Database Layer (PostgreSQL + Neo4j Graph)
        ↓
Multi-Signal Correlation Engine (PIF + Stylometry + Temporal + Crypto)
        ↓
Contradiction & Anomaly Detection
        ↓
Explainable Attribution Hypothesis (Strong Evidence + Supporting Signals + Contradictions)
        ↓
Human-in-the-Loop Investigator Review & Annotation
```

---

## 🏗️ Architecture & Technology Stack

```text
                 Investigator / Analyst
                          │
                          ▼
            Next.js 16 + React 19 Frontend
            (Cytoscape.js Graph Visualizer)
                          │
                          ▼  HTTP / REST
               FastAPI Backend (Python)
                          │
         ┌────────────────┴────────────────┐
         ▼                                 ▼
   PostgreSQL 16                      Neo4j 5 (APOC)
(Cases, Raw Evidence,              (Entity-Relationship Graph,
 Provenance, Audit Trails)          Graph Algorithms, Link Analysis)
         │                                 │
         └────────────────┬────────────────┘
                          │
                          ▼
             Python Attribution Engine
    ┌─────────────────────────────────────────────┐
    │ • Regex & NLP Entity Extraction             │
    │ • Cryptographic & Canonical Normalization   │
    │ • Multi-Signal Correlation & Confidence     │
    │ • Persistent Identity Fingerprint (PIF)     │
    │ • Temporal Alignment & Activity Heatmaps    │
    │ • Contradiction & Sybil Detection           │
    └─────────────────────────────────────────────┘
```

| Component | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS, Cytoscape.js | Case management UI, interactive evidence graph, hypothesis review |
| **Backend API** | FastAPI, Python 3.11+, SQLAlchemy (Async), Pydantic v2 | High-performance asynchronous REST API, orchestration |
| **Relational Store** | PostgreSQL 16 (Alpine) | Structured case data, raw observations, audit logs, metadata |
| **Graph Store** | Neo4j 5 Community (APOC plugin) | Multi-hop relationship graphs, entity linking, subgraphs |
| **Cache & Broker** | Redis 7 (Alpine) | Temporary scoring cache, task queues |
| **Engine / ML** | Python, NumPy, Pandas, scikit-learn, spaCy, NetworkX | Deterministic & heuristic signal correlation, stylometry, graph analysis |
| **DevOps** | Docker, Docker Compose, Make | Containerized reproducible local & production environments |

---

## 🚀 Getting Started & Setup Guide

Follow these step-by-step instructions to set up and run PHANTOM locally.

### 1. Prerequisites

Ensure you have the following installed on your machine:
- **Docker & Docker Compose** (Docker Desktop for Windows/macOS, or Docker Engine on Linux)
- **Python 3.11+**
- **Node.js 18+ / 20+** and **npm**
- **Git**

---

### 2. Clone the Repository

```bash
git clone https://github.com/pradeep-iitb/PHANTOM.git
cd PHANTOM
```

---

### 3. Environment Configuration

Copy the example environment configuration file to `.env`:

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**Linux / macOS (Bash):**
```bash
cp .env.example .env
```

The default values in `.env` are pre-configured for local development:
```dotenv
# PostgreSQL
POSTGRES_USER=phantom
POSTGRES_PASSWORD=phantom_dev_password
POSTGRES_DB=phantom
DATABASE_URL=postgresql+asyncpg://phantom:phantom_dev_password@localhost:5432/phantom

# Neo4j Graph Database
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=phantom_neo4j_dev

# Redis
REDIS_URL=redis://localhost:6379/0

# Backend & Frontend Ports
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
CORS_ORIGINS=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

### 4. Start Infrastructure with Docker

Launch the PostgreSQL, Neo4j, and Redis containers in the background:

```bash
docker compose up -d
```
*(Or run `make docker-up`)*

Verify that all three services are running:
```bash
docker compose ps
```

| Service | Host Port | Purpose | Health URL / Interface |
|---|---|---|---|
| **PostgreSQL** | `5432` | Relational & Case Store | `localhost:5432` |
| **Neo4j** | `7474`, `7687` | Evidence Graph Database | Neo4j Browser: `http://localhost:7474` |
| **Redis** | `6379` | Fast Cache & Session Store | `localhost:6379` |

> **Neo4j Browser Login:** Open [http://localhost:7474](http://localhost:7474), connect with username `neo4j` and password `phantom_neo4j_dev`.

---

### 5. Backend Setup & API Launch

Open a terminal window and start the FastAPI service:

#### On Windows (PowerShell):
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### On Linux / macOS (Bash):
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Once started:
- **API Base URL:** `http://localhost:8000`
- **Interactive Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Documentation:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### 6. Frontend Setup & Web Dashboard

Open a separate terminal window and start the Next.js development server:

```bash
cd frontend
npm install
npm run dev
```

The web dashboard will be accessible at:
👉 **[http://localhost:3000](http://localhost:3000)**

---

### 7. Makefile Shortcuts (Optional)

If `make` is installed on your system, you can use convenient shortcuts:

```bash
make docker-up      # Start Docker containers (PostgreSQL, Neo4j, Redis)
make docker-down    # Stop Docker containers
make dev-backend    # Launch backend uvicorn server
make dev-frontend   # Launch frontend Next.js dev server
```

---

## 🧪 Synthetic Test Cases & Attribution Engine

PHANTOM includes structured JSON schemas and synthetic benchmark cases for evaluating multi-signal correlation without compromising sensitive data:

- **Schemas:** `data/schemas/observation.schema.json`
- **Benchmark Cases:** `data/synthetic/`
  - `case_a_strong_correlation.json` (Cryptographic + Wallet + Temporal overlap)
  - `case_b_contradiction.json` (Conflicting infrastructure & timezone patterns)
  - `case_c_stylometry_match.json` (Linguistic & dialect similarity)

---

## 📡 Core API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health status check |
| `GET` | `/api/v1/cases/` | List all investigation cases |
| `POST` | `/api/v1/cases/` | Create a new investigation case |
| `POST` | `/api/v1/observations/` | Ingest new digital observations/evidence |
| `GET` | `/api/v1/entities/` | Retrieve extracted & normalized entities |
| `GET` | `/api/v1/graph/{case_id}` | Fetch Cytoscape-formatted relationship graph |
| `GET` | `/api/v1/hypotheses/{case_id}` | Retrieve generated attribution hypotheses with explanations |
| `POST` | `/api/v1/process/{case_id}` | Trigger multi-signal correlation pipeline |

---

## 📂 Repository Structure

```text
PHANTOM/
├── .env.example                     # Environment template
├── docker-compose.yml               # Container definitions (Postgres, Neo4j, Redis)
├── Makefile                         # Dev workflow automation
├── PHANTOM-Complete-Project-Idea.md # Comprehensive problem framing & architecture
├── SIH2026-Presentation-99.99.pdf   # SIH 2026 Presentation
│
├── backend/                         # FastAPI Application
│   ├── requirements.txt             # Python dependencies
│   └── app/
│       ├── main.py                  # App entry point & lifecycle
│       ├── api/v1/                  # REST endpoints (cases, graph, hypotheses)
│       ├── core/                    # App settings & config
│       ├── db/                      # SQLAlchemy & Neo4j async database drivers
│       ├── models/                  # Relational database models
│       └── schemas/                 # Pydantic validation schemas
│
├── engine/                          # Attribution & Correlation Engine
│   ├── extraction/                  # Regex & NLP entity extraction
│   ├── normalization/               # Crypto & canonical normalization
│   ├── candidate_generation/        # Entity candidate pairing
│   ├── scoring/                     # Multi-signal weight calculation
│   ├── pif/                         # Persistent Identity Fingerprinting
│   ├── temporal/                    # Timeline & activity matrix analysis
│   ├── contradictions/              # Conflict & anomaly detection
│   └── attribution/                 # Hypothesis generation & explanation builder
│
├── frontend/                        # Next.js 16 Web Dashboard
│   ├── package.json                 # Node dependencies
│   ├── src/                         # React components & Cytoscape graph views
│   └── public/                      # Static assets
│
└── data/                            # Schemas and Evaluation Data
    ├── schemas/                     # JSON Schema definitions
    └── synthetic/                   # Test datasets & ground truth scenarios
```

---

## ⚖️ Responsible Use & Ethical Guidelines

PHANTOM is developed strictly for **authorized cybersecurity research, threat intelligence analysis, and law enforcement investigations**. 

1. **Non-Autonomous:** The platform does not execute automated punitive actions. It delivers evidence-backed hypotheses for human analysts.
2. **Provenance-Preserving:** Every link is accompanied by its chain of custody and source observation.
3. **Privacy & Lawful Scope:** The platform must not be used for unauthorized doxxing, mass surveillance, or illegal harassment.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
