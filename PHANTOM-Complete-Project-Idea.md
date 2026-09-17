# PHANTOM — Complete Project Idea & Technical Specification

## Smart India Hackathon 2026

> **Problem Statement:** Evidence Driven Dark Web Threat Actor Attribution  
> **Problem Statement ID:** SIH26151  
> **Problem Statement Title:** Dark-Web Threat Actor De-anonymization  
> **Theme:** Blockchain & Cybersecurity  
> **Category:** Software  
> **Team / Repository Name:** TEAM PHANTOM / PHANTOM 

---

# 1. Executive Summary

PHANTOM is an evidence-driven threat intelligence and investigation platform that correlates fragmented digital observations across underground ecosystems into explainable threat-actor attribution hypotheses.

The core challenge is not simply discovering malicious content or crawling the dark web. Investigations may produce many disconnected observations: aliases, cryptocurrency wallets, PGP fingerprints, domains, infrastructure references, forum posts, marketplace activity, leaked-data references, timestamps, behavioural patterns and writing characteristics.

A single observation rarely establishes attribution.

PHANTOM is intended to help an investigator determine:

> **Could these fragmented observations belong to the same persistent threat actor, and what evidence supports or contradicts that hypothesis?**

The system therefore produces a reviewable **attribution hypothesis**, rather than claiming definitive real-world identification.

The central philosophy is:

```text
Evidence
   ↓
Extraction
   ↓
Normalization
   ↓
Correlation
   ↓
Graph + Temporal Analysis
   ↓
Evidence Fusion
   ↓
Supporting Evidence + Contradictions
   ↓
Explainable Attribution Hypothesis
   ↓
Human Investigator Review
```

---

# 2. Problem Statement

Threat actors operating across underground ecosystems can change aliases, migrate between platforms, reuse or abandon identifiers, alter infrastructure, and deliberately create ambiguity.

Investigators may encounter:

- different aliases/usernames
- cryptocurrency wallet addresses
- PGP keys/fingerprints
- email addresses
- domains
- infrastructure indicators
- onion-service references
- forum posts
- marketplace activity
- malware references
- leaked-data references
- behavioural patterns
- temporal activity
- writing/stylometric signals

These observations are often:

- fragmented
- noisy
- incomplete
- duplicated
- reposted
- contradictory
- distributed across multiple sources
- volatile because underground services may disappear or change

The difficult task is therefore not merely collecting indicators.

The difficult task is:

> **Correlating fragmented evidence across sources and time into a persistent, explainable attribution hypothesis while preserving provenance, uncertainty and contradictory evidence.**

---

# 3. Central Research Question

> **How can fragmented observations across underground ecosystems be correlated into an explainable and evidence-backed threat-actor attribution hypothesis?**

The system should help answer:

1. Which observations may be related?
2. Which entities recur across observations?
3. Which relationships are supported by direct evidence?
4. Which relationships are only supporting signals?
5. What evidence contradicts a proposed linkage?
6. How reliable are the underlying sources?
7. How temporally consistent is the proposed relationship?
8. What should an investigator examine next?

---

# 4. What PHANTOM Is

PHANTOM is:

- An evidence-driven attribution and correlation engine.
- An investigator-facing threat-intelligence dashboard.
- A graph-backed system for preserving relationships and provenance.
- A temporal investigation system.
- A decision-support platform.
- A system for generating explainable attribution hypotheses.
- A human-in-the-loop investigation workflow.

The core innovation is:

> **Turning fragmented observations into persistent, explainable threat-actor hypotheses.**

---

# 5. What PHANTOM Is Not

PHANTOM is not primarily:

- a dark-web crawler
- a dark-web search engine
- an AI chatbot
- a generic graph visualization product
- an unrestricted OSINT platform
- an autonomous deanonymization system
- a system that accuses or identifies real people automatically

Collection is an input layer.

The central technical problem is **evidence correlation and explainable attribution**.

---

# 6. Investigator Workflow

A typical investigator workflow should be:

```text
Create Investigation / Case
        ↓
Add or Import Approved Observations
        ↓
Extract Entities
        ↓
Normalize Entities
        ↓
Store Evidence + Provenance
        ↓
Construct Relationship Graph
        ↓
Generate Candidate Relationships
        ↓
Perform Temporal / Behavioural / Infrastructure / Crypto Analysis
        ↓
Fuse Evidence
        ↓
Detect Supporting + Contradictory Evidence
        ↓
Generate Attribution Hypothesis
        ↓
Investigator Reviews Evidence
        ↓
Accept / Reject / Annotate / Keep Unresolved
```

The investigator remains the final decision-maker.

---

# 7. Example Investigation

An investigator may begin with:

```yaml
Observation A:
  alias: ShadowX
  source: Forum A
  timestamp: 2026-01-10
  wallet: wallet_ABC
  text: "..."
```

Another observation:

```yaml
Observation B:
  alias: XShadow
  source: Marketplace B
  timestamp: 2026-04-15
  wallet: wallet_ABC
  text: "..."
```

A third observation may contain:

```yaml
Observation C:
  alias: DarkSeller91
  source: Forum C
  timestamp: 2026-05-02
  infrastructure: infrastructure_X
```

The system should not simply conclude that all three are one actor.

Instead it should identify:

```text
ShadowX ↔ XShadow

Strong evidence:
- Shared wallet reference

Supporting signals:
- Alias similarity
- Temporal continuity
- Behavioural similarity

Contradictions:
- None identified

Hypothesis:
These observations may belong to the same persistent actor.
```

If a contradiction exists:

```text
Contradictions:
- Infrastructure inconsistency during overlapping period
```

the contradiction must remain visible.

---

# 8. Core Differentiators

## 8.1 Evidence-First Attribution

Every important relationship should trace back to specific evidence.

The UI should show:

- source
- observation
- timestamp
- extracted entity
- relationship
- reason for linkage
- reliability context

A prediction without evidence is insufficient.

---

## 8.2 Multi-Signal Correlation

PHANTOM can combine:

- PGP
- cryptocurrency
- infrastructure
- aliases
- behaviour
- stylometry
- semantics
- temporal patterns
- source context

A single weak signal should not automatically determine attribution.

---

## 8.3 Persistent Identity Fingerprint (PIF)

The SIH concept of a **Persistent Identity Fingerprint (PIF)** should represent a composite pattern of recurring actor characteristics.

Potential PIF components:

- recurring handles
- alias patterns
- wallet reuse
- PGP reuse
- recurring templates
- infrastructure reuse
- writing characteristics
- behavioural patterns
- temporal patterns
- platform migration patterns

PIF is not a real-world identity.

It represents an evidence-backed candidate identity pattern.

Every PIF should retain:

- constituent signals
- source evidence
- timestamps
- reliability
- uncertainty
- contradictions

PIF should not be reduced to a single black-box embedding.

---

## 8.4 Persistent and Temporal Identity

The system should track actors across:

- rebrands
- alias changes
- platform migrations
- first-seen activity
- last-seen activity
- reappearance
- activity overlap

Example:

```text
2024
Alias A → Forum X

2025
Alias A disappears

2025
Alias B → Marketplace Y

Shared wallet observed across both periods
```

This creates a temporal supporting signal.

Temporal continuity is not proof of attribution.

---

## 8.5 Explainable Confidence

Confidence should be decomposable.

A result should distinguish:

### Strong / Direct Evidence

Examples:

- exact PGP fingerprint reuse
- exact wallet reuse
- direct infrastructure reuse

### Supporting Signals

Examples:

- alias similarity
- semantic similarity
- stylometric similarity
- behavioural similarity
- temporal continuity

### Contradictions

Examples:

- incompatible timelines
- conflicting identifiers
- infrastructure inconsistency
- mutually exclusive activity

The investigator should be able to understand why the hypothesis received its confidence.

---

## 8.6 Human-in-the-Loop

AI and automated analytics assist investigators.

They do not make final attribution decisions.

The investigator can:

- review evidence
- accept candidate links
- reject candidate links
- annotate relationships
- record conclusions
- keep hypotheses unresolved

Analyst actions should be auditable.

---

# 9. Technical Architecture

Target architecture:

```text
                         INVESTIGATOR
                              |
                              v
                  +------------------------+
                  |   Next.js Dashboard    |
                  | TypeScript + Tailwind  |
                  | Cytoscape.js           |
                  +-----------+------------+
                              |
                         REST / HTTP
                              |
                              v
                  +------------------------+
                  |      FastAPI API       |
                  | Validation + Workflow  |
                  +-----------+------------+
                              |
             +----------------+----------------+
             |                |                |
             v                v                v
      +-------------+   +------------+   +-------------+
      | PostgreSQL  |   |   Neo4j    |   | Job Worker  |
      | Evidence +  |   | Relationship|   | Background |
      | Operations  |   |   Graph    |   | Processing  |
      +-------------+   +------------+   +------+------+
                                                 |
                                                 v
                                  +---------------------------+
                                  | Python Attribution Engine |
                                  +-------------+-------------+
                                                |
             +------------------+---------------+------------------+
             |                  |               |                  |
             v                  v               v                  v
       Extraction        Correlation          PIF            Analysis
                                             /Identity       Modules
                                                               |
                                     +---------+---------+------+------+
                                     |         |         |             |
                                     v         v         v             v
                                  Temporal  Crypto   Infra      Behaviour/
                                  Analysis  Analysis Analysis   Stylometry
                                                               |
                                                               v
                                                     Hugging Face / NLP
```

---

# 10. Technology Stack

## Frontend

- Next.js
- TypeScript
- App Router
- Tailwind CSS
- Cytoscape.js
- Optional TanStack Query for API state
- Optional Zod for client-side validation

Purpose:

- investigator dashboard
- case management
- observation views
- evidence review
- graph exploration
- timeline
- hypothesis review

---

## Backend

- Python
- FastAPI
- Pydantic
- SQLAlchemy
- Alembic
- Neo4j Python driver

Purpose:

- REST API
- request validation
- orchestration
- authentication/authorization boundary
- database access
- investigation workflows
- background job submission

---

## Attribution Engine

- Python
- NumPy
- Pandas
- scikit-learn where appropriate
- NetworkX for experimentation/local graph analysis
- spaCy
- sentence-transformers
- Hugging Face Transformers
- PyTorch where required

Purpose:

- extraction
- normalization
- candidate generation
- entity resolution
- temporal analysis
- semantic similarity
- stylometry
- scoring
- contradiction detection
- attribution hypothesis generation

---

## Databases

### PostgreSQL

System of record for:

- cases
- observations
- sources
- structured metadata
- evidence
- analyst reviews
- audit events
- operational workflows

### Neo4j

Relationship/graph store for:

- entities
- relationships
- graph traversal
- actor-candidate relationships
- temporal graph analysis
- graph visualization data

PostgreSQL remains important for authoritative evidence metadata and provenance.

---

## Collection

Potential technologies:

- Requests
- BeautifulSoup
- Playwright
- Python

Future controlled collection may support Tor-aware architecture.

Collection is not the first MVP priority.

---

## Background Processing

Use a worker architecture for long-running tasks such as:

- entity extraction
- normalization
- embedding generation
- graph updates
- candidate generation
- correlation
- scoring

A reasonable initial option is:

```text
FastAPI
   ↓
Redis
   ↓
Celery Worker
```

The exact queue implementation can be changed if a simpler approach is appropriate.

---

## Observability

Initial:

- structured logs
- request IDs
- processing job IDs
- errors
- audit events

Future:

- Prometheus
- Grafana

Grafana is optional for the MVP.

---

# 11. Repository Structure

Recommended monorepo:

```text
phantom-threat-attribution/

├── README.md
├── idea.md
├── LICENSE
├── .gitignore
├── .env.example
├── docker-compose.yml
├── Makefile
│
├── frontend/
│   ├── app/
│   ├── components/
│   │   ├── ui/
│   │   ├── investigation/
│   │   ├── evidence/
│   │   ├── graph/
│   │   └── timeline/
│   ├── lib/
│   │   ├── api/
│   │   ├── validation/
│   │   └── utils/
│   ├── types/
│   ├── public/
│   ├── package.json
│   └── tests/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   │   └── v1/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── repositories/
│   │   ├── services/
│   │   ├── dependencies/
│   │   └── workers/
│   ├── tests/
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   └── README.md
│
├── engine/
│   ├── extraction/
│   ├── normalization/
│   ├── candidate_generation/
│   ├── identity_resolution/
│   ├── pif/
│   ├── temporal/
│   ├── stylometry/
│   ├── semantics/
│   ├── cryptocurrency/
│   ├── infrastructure/
│   ├── graph/
│   ├── scoring/
│   ├── contradictions/
│   ├── attribution/
│   └── README.md
│
├── collectors/
│   ├── adapters/
│   ├── parsers/
│   ├── normalizers/
│   ├── safety/
│   └── README.md
│
├── data/
│   ├── schemas/
│   ├── synthetic/
│   ├── samples/
│   └── README.md
│
├── docs/
│   ├── architecture.md
│   ├── methodology.md
│   ├── data-model.md
│   ├── scoring.md
│   ├── api.md
│   ├── development-roadmap.md
│   └── security-and-ethics.md
│
└── tests/
```

---

# 12. Frontend Architecture

The frontend should be an investigator-oriented web application.

## Core future screens

1. Case list
2. Create case
3. Investigation workspace
4. Observation ingestion
5. Entity view
6. Evidence detail
7. Relationship view
8. Graph explorer
9. Timeline
10. Attribution hypothesis
11. Analyst review

## Dashboard principles

The UI should prioritize:

- evidence visibility
- provenance
- relationships
- temporal context
- contradictions
- analyst decisions

Avoid building a visually impressive dashboard before the underlying evidence model works.

---

# 13. Graph Visualization

Use Cytoscape.js.

Possible visualized entities:

```text
Alias
Wallet
PGP Key
Domain
Infrastructure
Platform
Observation
Actor Candidate
```

Example:

```text
        +---------+
        | Alias A |
        +----+----+
             |
           USES
             |
             v
        +---------+
        | Wallet  |
        +----+----+
             |
       ASSOCIATED_WITH
             |
             v
        +---------+
        | Alias B |
        +---------+
```

The graph should distinguish:

- observed relationship
- candidate relationship
- supporting evidence
- contradiction

A graph edge must not automatically imply attribution.

---

# 14. FastAPI Backend

Recommended structure:

```text
backend/app/

├── main.py
├── api/
│   └── v1/
├── core/
│   ├── config.py
│   └── logging.py
├── db/
├── models/
├── schemas/
├── repositories/
├── services/
├── dependencies/
└── workers/
```

Initial endpoints:

```text
GET  /health

GET  /api/v1/cases
POST /api/v1/cases
GET  /api/v1/cases/{case_id}

POST /api/v1/cases/{case_id}/observations
GET  /api/v1/cases/{case_id}/observations

GET /api/v1/entities/{entity_id}

GET /api/v1/cases/{case_id}/graph

GET /api/v1/cases/{case_id}/hypotheses
GET /api/v1/hypotheses/{hypothesis_id}

POST /api/v1/cases/{case_id}/process
GET  /api/v1/jobs/{job_id}
```

These are initial contracts and may evolve.

The health endpoint should work from the beginning.

---

# 15. PostgreSQL Data Model

PostgreSQL should hold authoritative structured metadata.

Initial conceptual tables:

```text
users
cases
observations
sources
entities
evidence_items
relationships
hypotheses
analyst_reviews
audit_events
processing_jobs
```

## Observation

Potential fields:

```text
id
case_id
source_id
observed_at
collected_at
source_reference
raw_content
content_hash
handling_notes
metadata
created_at
```

## Entity

Potential fields:

```text
id
entity_type
original_value
normalized_value
confidence
first_seen
last_seen
metadata
```

## Source

Potential fields:

```text
id
name
source_type
reliability
description
provenance
```

## Evidence Item

Potential fields:

```text
id
observation_id
entity_id
relationship_id
excerpt/reference
evidence_type
strength
source_context
created_at
```

## Relationship

Potential fields:

```text
id
entity_a_id
entity_b_id
relationship_type
status
confidence
created_at
updated_at
```

## Hypothesis

Potential fields:

```text
id
case_id
title
description
confidence
status
strong_evidence
supporting_signals
contradictions
created_at
updated_at
```

## Analyst Review

Potential fields:

```text
id
analyst_id
target_type
target_id
decision
comment
created_at
```

Use Alembic for schema migrations.

---

# 16. Neo4j Data Model

Neo4j is the relationship analysis layer.

Potential nodes:

```text
(:Entity)
(:Alias)
(:Wallet)
(:PGPKey)
(:Domain)
(:Infrastructure)
(:Platform)
(:Observation)
(:Source)
(:ActorCandidate)
(:Case)
```

Potential relationships:

```text
OBSERVED_IN
MENTIONS
USES
ASSOCIATED_WITH
REFERENCES
POSSIBLY_SAME_AS
POSTED_ON
LINKED_TO
SUPPORTS
CONTRADICTS
```

Important distinction:

```text
(Alias)-[:USES]->(Wallet)
```

means the relationship was observed.

Whereas:

```text
(AliasA)-[:POSSIBLY_SAME_AS]->(AliasB)
```

is a candidate attribution relationship.

Every attribution candidate must have supporting evidence and provenance.

---

# 17. Evidence Provenance

Provenance is first-class data.

For every important observation/evidence item, preserve where possible:

```text
source
source_reference
observed_at
collected_at
original_value
normalized_value
transformation_method
extractor_version
model_version
reliability_context
content_hash
```

The system should allow an investigator to trace:

```text
Hypothesis
   ↓
Relationship
   ↓
Evidence
   ↓
Observation
   ↓
Source
```

This makes the system auditable and explainable.

---

# 18. Entity Extraction Pipeline

Target:

```text
Raw Observation
      ↓
Parsing
      ↓
Rule-Based Extraction
      +
NLP Extraction
      ↓
Entity Candidate
      ↓
Normalization
      ↓
Entity Confidence
      ↓
Structured Evidence
```

Potential extracted entities:

- aliases
- usernames
- wallets
- PGP fingerprints
- PGP keys
- emails
- domains
- URLs
- onion URLs
- IP addresses where lawfully available
- infrastructure references
- malware families
- hashes
- organizations
- platforms
- timestamps

Use deterministic rules where possible.

Use NLP where it adds value.

Preserve the original evidence.

---

# 19. Entity Normalization

Create a separate normalization layer.

Examples:

## Alias

Apply:

- Unicode normalization
- case normalization
- whitespace normalization

## Domain

Store canonical representation.

## URL

Canonicalize where appropriate.

## Wallet

Normalize according to blockchain/network.

## PGP

Normalize fingerprint representation.

## Timestamp

Store canonical UTC representation while retaining original timezone/context where available.

Always preserve the original value.

Conceptually:

```text
original_value
normalized_value
```

---

# 20. Candidate Generation

Candidate generation is separate from final attribution.

Possible signals:

- exact identifier reuse
- normalized alias similarity
- wallet relationships
- PGP reuse
- infrastructure overlap
- temporal compatibility
- semantic similarity
- behavioural similarity
- stylometric similarity
- source/case co-occurrence

Output:

```text
Candidate Relationship
```

NOT:

```text
Confirmed Attribution
```

Every candidate should record which signals caused it to be generated.

---

# 21. Persistent Identity Fingerprint Implementation

PIF should be represented as a structured composite.

Conceptually:

```text
PIF
├── Alias Features
├── Cryptographic Features
├── Wallet Features
├── Infrastructure Features
├── Behavioural Features
├── Stylometric Features
├── Temporal Features
└── Platform Migration Features
```

Each component should retain evidence references.

PIF should be updateable over time.

Example:

```text
PIF v1
2024:
  Alias = ShadowX
  Wallet = W1
  PGP = P1

PIF v2
2025:
  Alias = XShadow
  Wallet = W1
  PGP = P1
  Platform = Marketplace B
```

This allows persistent identity tracking across rebrands and migrations.

---

# 22. Temporal Actor Graph

The Temporal Actor Graph is a core concept.

Relevant timestamps:

```text
first_seen
last_seen
observed_at
collection_time
source_time
```

Potential temporal analyses:

- first appearance
- disappearance
- reappearance
- platform migration
- activity overlap
- temporal continuity
- impossible timeline
- inconsistent activity

Example:

```text
Forum A
   |
2024
   |
Alias A
   |
Shared wallet
   |
2025
   |
Alias B
   |
Marketplace B
```

Temporal continuity is a supporting signal.

---

# 23. Behaviour Analysis

Potential behavioural signals:

- posting frequency
- activity intervals
- time-of-day activity
- recurring behaviours
- platform usage
- recurring templates
- claimed affiliations
- repeated operational patterns

Behavioural analysis should remain probabilistic and explainable.

---

# 24. Stylometry

Potential textual features:

- vocabulary
- sentence length
- punctuation
- function-word patterns
- repeated phrases/templates
- formatting
- linguistic patterns

Stylometry is a supporting signal.

Limitations include:

- short text
- copied text
- translated text
- shared templates
- AI-assisted writing
- deliberate style changes
- multiple people using one account

The system should reduce the influence of stylometry when the available text is insufficient.

---

# 25. Adversarial-Aware Stylometry

The SIH concept includes adversarial-aware stylometry.

The intended approach is:

```text
Reliable / rich text
       ↓
Stylometric analysis has greater utility

Short / copied / AI-assisted / manipulated text
       ↓
Stylometric reliability decreases
       ↓
Shift weight toward stronger behavioural,
temporal, cryptographic and infrastructure evidence
```

Do not claim to reliably detect AI-generated writing unless such detection has actually been validated.

---

# 26. Semantic Similarity

Hugging Face / sentence-transformers can provide embeddings for:

- semantic similarity
- content similarity
- related descriptions
- recurring templates

Potential pipeline:

```text
Text
 ↓
Preprocessing
 ↓
Embedding Model
 ↓
Embedding
 ↓
Similarity
 ↓
Supporting Signal
```

Semantic similarity must not be directly treated as attribution confidence.

Store model metadata:

```text
model_name
model_version
embedding_version
processing_timestamp
```

---

# 27. Cryptocurrency Analysis

Pipeline:

```text
Wallet Extraction
      ↓
Normalization
      ↓
Blockchain / Network Identification
      ↓
Permitted Transaction Data
      ↓
Relationship Analysis
      ↓
Candidate Clustering
```

Potential signals:

- exact wallet reuse
- transaction relationships
- recurring counterparties
- temporal transaction patterns
- permitted cluster relationships

Important limitations:

- mixers
- privacy coins
- exchanges/custodial wallets
- shared wallets
- transaction obfuscation

Blockchain relationships should be treated as evidence, not automatic proof of real-world identity.

---

# 28. Infrastructure Analysis

Potential infrastructure signals:

- domains
- IPs where lawfully available
- HTTP headers
- server responses
- TLS/certificate information
- exposed status pages
- hosting metadata
- onion-service metadata

The pipeline may be:

```text
Infrastructure Observation
       ↓
Normalize
       ↓
Compare
       ↓
Generate Candidate Relationship
       ↓
Evidence + Reliability
```

Infrastructure overlap does not automatically prove common ownership or operation.

---

# 29. Dark-Web / Underground Collection

The SIH technical approach includes a future controlled collection architecture:

```text
Tor-aware Python collectors
        ↓
Playwright for dynamic pages
        ↓
Controlled / isolated collection
        ↓
Scheduled re-crawling
        ↓
Raw page + onion URL + timestamp + source + cryptographic hash
```

However, this is not the first MVP priority.

The system must be able to work with:

- manually entered observations
- curated datasets
- synthetic observations
- authorized public data
- permitted research datasets
- historical/authorized intelligence

Do not require complete dark-web coverage.

Do not implement unrestricted or unauthorized collection.

---

# 30. Evidence Fusion

The initial SIH methodology describes a signal contribution concept based on:

```text
Evidence Strength
×
Source Reliability
×
Temporal Consistency
```

This should be treated as an initial conceptual framework, not a scientifically calibrated final formula.

The implementation should eventually consider:

```text
signal_strength
source_reliability
temporal_compatibility
signal_weight
evidence_independence
contradiction_penalty
```

Avoid double-counting correlated evidence.

For example:

```text
Shared wallet
+
Transaction relationship
```

may be related observations rather than two completely independent signals.

The scoring architecture should make this explicit.

---

# 31. Contradiction Detection

Contradictory evidence is a first-class feature.

Potential contradictions:

- incompatible timestamps
- conflicting PGP identifiers
- conflicting wallet evidence
- infrastructure inconsistency
- mutually exclusive activity
- impossible migration sequence
- contradictory source claims

Store:

```text
contradiction
reason
source
timestamp
severity
affected_relationship
affected_hypothesis
```

Do not silently discard contradictory evidence.

Do not simply subtract an arbitrary number without documenting why.

---

# 32. Explainable Attribution Hypothesis

The final result should look conceptually like:

```text
ATTRIBUTION HYPOTHESIS

Entities:
ShadowX
XShadow

Confidence:
78%

Strong Evidence:
✓ Shared wallet reference
✓ Reused PGP fingerprint

Supporting Signals:
✓ Alias similarity
✓ Temporal continuity
✓ Behavioural similarity

Contradictions:
⚠ Infrastructure inconsistency during one period

Sources:
Source A
Source B
Source C

Status:
Under analyst review
```

The language should remain:

> “These observations may belong to the same persistent actor.”

or:

> “Attribution hypothesis.”

Never:

> “AI has identified this person.”

---

# 33. AI Architecture

AI is an internal analytical component.

Potential AI-assisted tasks:

- entity extraction
- classification
- semantic similarity
- stylometric similarity
- candidate ranking

AI should not:

- act as a chatbot
- make final attribution decisions
- generate unsupported conclusions
- hide evidence behind a score

The architecture should store AI outputs as analytical signals with provenance.

---

# 34. Background Processing

Long-running processing should be asynchronous where useful.

Example:

```text
POST /cases/{id}/process
        ↓
Create Job
        ↓
Worker
        ↓
Extraction
        ↓
Normalization
        ↓
Entity Resolution
        ↓
Graph Update
        ↓
Correlation
        ↓
Scoring
        ↓
Hypothesis Updated
```

The frontend can poll or subscribe to job status.

---

# 35. Docker Development Environment

Local development should use Docker Compose.

Core services:

```text
frontend
backend
postgres
neo4j
redis
```

Optional future services:

```text
prometheus
grafana
```

Databases should use persistent volumes.

No secrets should be hard-coded.

---

# 36. Environment Variables

Create:

```text
.env.example
```

Potential variables:

```text
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
DATABASE_URL=

NEO4J_URI=
NEO4J_USERNAME=
NEO4J_PASSWORD=

REDIS_URL=

NEXT_PUBLIC_API_URL=

HF_TOKEN=

MODEL_NAME=
```

Actual credentials must never be committed.

Hugging Face authentication should remain optional unless a selected model requires it.

---

# 37. API Contracts

Initial API structure:

## Cases

```text
GET  /api/v1/cases
POST /api/v1/cases
GET  /api/v1/cases/{case_id}
```

## Observations

```text
POST /api/v1/cases/{case_id}/observations
GET  /api/v1/cases/{case_id}/observations
```

## Entities

```text
GET /api/v1/entities/{entity_id}
```

## Graph

```text
GET /api/v1/cases/{case_id}/graph
```

## Hypotheses

```text
GET /api/v1/cases/{case_id}/hypotheses
GET /api/v1/hypotheses/{hypothesis_id}
```

## Processing

```text
POST /api/v1/cases/{case_id}/process
GET  /api/v1/jobs/{job_id}
```

## Health

```text
GET /health
```

API contracts should evolve as implementation develops.

---

# 38. Initial Data Schemas

Create JSON schemas under:

```text
data/schemas/
```

Recommended:

```text
observation.schema.json
entity.schema.json
evidence_item.schema.json
relationship.schema.json
hypothesis.schema.json
source.schema.json
```

A hypothesis should conceptually contain:

```text
hypothesis_id
entities_involved
confidence_score
confidence_level
strong_evidence
supporting_signals
contradictions
provenance_references
review_status
created_at
updated_at
```

---

# 39. MVP

The strongest realistic MVP is one complete vertical slice.

```text
Create Case
    ↓
Add Controlled Observations
    ↓
Extract Entities
    ↓
Normalize Entities
    ↓
Store Evidence
    ↓
Construct Neo4j Graph
    ↓
Generate Candidate Relationships
    ↓
Calculate Transparent Signal Contributions
    ↓
Detect Contradictions
    ↓
Generate Attribution Hypothesis
    ↓
Display Graph
    ↓
Display Timeline
    ↓
Investigator Review
```

The MVP does not require:

- full dark-web coverage
- production crawling
- huge datasets
- complex blockchain graph analysis
- a fully trained ML model
- multi-agency deployment

A narrow working vertical slice is preferable to a broad fake demonstration.

---

# 40. Suggested MVP Synthetic Cases

The system should eventually be tested with controlled synthetic observations.

## Case A — Strong Correlation

Two aliases share:

- exact wallet
- same PGP
- compatible timeline

Expected:

Strong attribution hypothesis with clear supporting evidence.

---

## Case B — Alias Collision

Two different actors use similar aliases.

They have:

- no shared wallet
- different PGP
- incompatible timelines

Expected:

Weak candidate or no meaningful attribution.

---

## Case C — Contradiction

Two entities have several supporting signals but:

- conflicting infrastructure
- incompatible activity period

Expected:

Hypothesis weakened and contradiction explicitly displayed.

---

## Case D — Rebrand

Actor changes:

```text
Alias A → Alias B
Forum A → Marketplace B
```

but retains:

- wallet
- PGP
- behavioural pattern

Expected:

PIF/temporal analysis identifies a candidate continuity.

---

## Case E — Weak Stylometry

Only very short text is available.

Expected:

Stylometric signal receives low reliability/influence.

---

## Case F — Adversarial / Manipulated Text

Text is copied or AI-assisted.

Expected:

Stylometry is treated cautiously and stronger signals receive more importance.

---

# 41. Evaluation

Do not claim metrics before measuring them.

Potential evaluation metrics:

- entity extraction precision/recall
- candidate-link precision/recall
- false attribution rate
- contradiction detection
- evidence traceability
- provenance completeness
- analyst review usefulness
- processing latency
- graph query performance

The evaluation dataset should have known relationships so that attribution methodology can be tested.

---

# 42. Security Architecture

Required principles:

- no secrets in Git
- environment-based configuration
- input validation
- authentication boundary
- authorization boundary
- audit logging
- least privilege
- database access controls
- rate limiting where required
- safe error handling

For future collection:

- isolated environments
- sandboxed execution
- controlled network access
- do not execute downloaded files
- do not automatically open unknown files
- scan untrusted content where appropriate
- authorized sources only

---

# 43. Data and Ethical Considerations

PHANTOM should use:

- synthetic observations
- authorized public data
- permitted research datasets
- controlled samples

The system should:

- preserve provenance
- minimize unnecessary personal data
- avoid unsupported accusations
- avoid doxxing
- avoid harassment
- respect applicable law
- respect institutional policies
- keep human investigators responsible for final decisions

---

# 44. Feasibility

The SIH architecture is modular.

The intended development sequence is:

```text
Collection
   ↓
Evidence Store
   ↓
Extraction
   ↓
Graph
   ↓
Analytics
   ↓
Attribution
   ↓
Dashboard
```

The MVP can operate with lightweight collectors, asynchronous processing and incremental graph growth.

Complete dark-web coverage and large-scale blockchain graph analysis are not prerequisites for demonstrating the core innovation.

Data can grow incrementally because raw evidence, timestamps, source and provenance are retained.

---

# 45. Known Challenges and Mitigations

## Incomplete and Volatile Underground Coverage

Problem:

Services may disappear, change addresses or go offline.

Mitigation:

- seed-based discovery
- link expansion
- scheduled re-crawling
- historical snapshots where permitted

---

## Actor Evasion and Counter-Forensics

Problem:

Actors may use:

- mixers
- VPNs
- fake personas
- AI-assisted writing
- burner wallets
- infrastructure hopping

Mitigation:

- multi-signal correlation
- adversarial-aware analysis
- stronger evidence weighting
- temporal and behavioural signals

---

## Malicious Websites and Malware Exposure

Problem:

Suspicious websites may contain:

- malicious downloads
- exploit content
- ransomware
- malicious links

Mitigation:

- isolated/sandboxed collection
- controlled network environment
- strict content handling
- safe scanning

---

## False Attribution

Problem:

Shared PGP keys, wallets, servers or aliases may create coincidental overlaps.

Mitigation:

- evidence fusion
- source reliability
- contradiction visibility
- human review

---

## Data Quality and Noise

Problem:

Underground content may contain:

- spam
- duplicates
- reposts
- false claims
- irrelevant mentions

Mitigation:

- normalization
- deduplication
- relevance filtering
- cross-source validation
- rule-based + NLP extraction

---

## Legal / Ethical Compliance

Problem:

Sensitive content and privacy concerns may create legal and institutional risk.

Mitigation:

- authorized/permitted sources
- provenance
- audit logs
- responsible data handling
- restricted collection workflows

---

# 46. Development Phases

## Phase 0 — Foundation

Build:

- repository
- Next.js
- FastAPI
- PostgreSQL
- Neo4j
- Docker
- environment configuration
- CI/testing foundation
- documentation

---

## Phase 1 — Data Layer

Build:

- PostgreSQL schema
- Alembic migrations
- evidence models
- provenance
- synthetic data schemas

---

## Phase 2 — Observation Ingestion

Build:

- create case
- add observation
- import curated sample
- validation
- raw evidence preservation

---

## Phase 3 — Entity Extraction

Build:

- regex extraction
- basic NLP extraction
- normalization
- entity persistence

---

## Phase 4 — Graph

Build:

- Neo4j nodes
- relationships
- graph synchronization
- graph API

---

## Phase 5 — Candidate Generation

Build:

- exact identifier matching
- alias similarity
- wallet relationships
- PGP reuse
- infrastructure overlap
- temporal compatibility

---

## Phase 6 — PIF + Temporal Analysis

Build:

- PIF structure
- first-seen/last-seen tracking
- activity overlap
- migration analysis
- reappearance

---

## Phase 7 — Evidence Fusion

Build:

- signal reliability
- source reliability
- temporal consistency
- contradiction representation
- transparent scoring

---

## Phase 8 — ML/NLP Supporting Signals

Add:

- sentence-transformers
- semantic similarity
- stylometry
- bounded Hugging Face models

Only after the deterministic evidence pipeline works.

---

## Phase 9 — Investigator Dashboard

Build:

- graph
- timeline
- evidence cards
- hypothesis page
- contradictions
- analyst review

---

## Phase 10 — Evaluation

Build controlled evaluation datasets.

Measure actual performance.

Document failure cases.

---

## Phase 11 — Deployment

Only after MVP stability:

- container deployment
- secure configuration
- monitoring
- access control
- performance optimization

---

# 47. Implementation Priority

The recommended priority is:

```text
1. Data model
2. Evidence/provenance
3. Basic extraction
4. PostgreSQL
5. Neo4j
6. Correlation baseline
7. Contradiction model
8. PIF
9. Temporal analysis
10. Dashboard
11. ML supporting signals
12. Collection expansion
13. Production hardening
```

Do not reverse this order simply to create a visually impressive demo.

---

# 48. Coding-Agent Rules

When implementing PHANTOM, coding agents must:

1. Read `idea.md` before making architecture decisions.
2. Inspect the existing repository before modifying it.
3. Preserve useful existing work.
4. Avoid unnecessary dependencies.
5. Use typed interfaces.
6. Keep modules separated.
7. Write meaningful tests.
8. Never hard-code fake intelligence.
9. Never invent real threat actors.
10. Never generate fake confidence values and present them as validated.
11. Clearly label synthetic data.
12. Preserve evidence provenance.
13. Keep secrets out of Git.
14. Document assumptions.
15. Keep attribution methodology replaceable.
16. Never silently turn a weak signal into a definitive conclusion.
17. Keep human review in the workflow.
18. Distinguish implemented functionality from planned functionality.

If an important attribution methodology decision is unspecified:

- do not silently invent a scientifically authoritative solution;
- create a replaceable baseline;
- document the assumption;
- make the implementation easy to improve later.

---

# 49. Initial Repository Setup vs Actual Implementation

The initial repository setup should establish:

- Next.js
- TypeScript
- Tailwind
- FastAPI
- Python environment
- PostgreSQL
- Neo4j
- Docker Compose
- environment configuration
- basic API health endpoint
- basic frontend shell
- database connection structure
- graph connection structure
- engine modules
- schemas
- documentation
- tests

It should NOT claim to already implement:

- production attribution
- real-world actor identification
- full crawling
- complete ML
- calibrated confidence
- large-scale ingestion
- production security
- live sensitive-data deployment

---

# 50. Suggested Current Frontend State

Before the MVP exists, the homepage can simply communicate:

```text
PHANTOM

Evidence-Driven Threat Actor Attribution

An evidence-driven threat intelligence and investigation platform
for correlating fragmented digital observations into explainable
threat-actor attribution hypotheses.

Status:
Initial system architecture and development environment established.
Core prototype development in progress.
```

Do not populate the interface with fabricated intelligence.

---

# 51. Suggested Current Backend State

Minimum:

```http
GET /health
```

Response:

```json
{
  "status": "ok",
  "service": "phantom-api"
}
```

The application should be able to start cleanly before the attribution engine is implemented.

---

# 52. README Expectations

The repository README should contain:

1. Project overview
2. Problem
3. Central research question
4. Solution
5. Architecture
6. Technology stack
7. Evidence model
8. MVP
9. Current status
10. Repository structure
11. Development setup
12. Roadmap
13. Security/ethics
14. Disclaimer

The README should never imply that planned functionality is already operational.

---

# 53. Research Context From the SIH Presentation

The SIH presentation frames several challenges:

- Tor conceals server location and limits direct IP attribution.
- Actors constantly change identities across platforms.
- Evidence remains fragmented across multiple sources.
- Wallet and stylometry signals can weaken under modern evasion.
- Underground content is volatile and services may change or disappear.

The presentation proposes:

- multi-source evidence collection
- Persistent Identity Fingerprint
- evidence-fusion attribution
- adversarial-aware stylometry
- Temporal Actor Graph
- explainable confidence scoring

These concepts should remain aligned with the implementation.

---

# 54. Indian Cybersecurity Context

The SIH presentation uses Indian cybercrime context to establish scale and investigation relevance.

The context should not be interpreted as:

> All Indian cybercrime originates from the dark web.

The underground ecosystem is an important threat-intelligence source and investigation environment, while broader cybercrime statistics establish overall workload and scale.

Any statistical claim used in future documentation should retain its original source and population/context.

---

# 55. Competitive Differentiation

The intended differentiation is:

```text
Existing / Conventional Approach
        vs
PHANTOM
```

Conventional limitations described in the presentation include:

- detection rather than attribution
- individual/single-signal matching
- snapshot-based investigation
- black-box similarity scores
- static indicator databases

PHANTOM aims to provide:

- attribution hypotheses
- multi-signal fusion
- persistent identity tracking
- explainable evidence
- investigation timeline
- graph-backed relationships
- visible contradictions
- analyst review

Do not claim that all existing products lack these capabilities unless independently verified.

---

# 56. Intended Benefits

## Investigative Agencies

Potential benefits:

- reduced manual investigation effort
- easier discovery of relationships
- cross-market continuity
- evidence-backed investigation
- preservation of provenance and timestamps

## Cybersecurity Ecosystem

Potential benefits:

- structured intelligence sharing
- earlier discovery of relationships
- reusable investigation knowledge
- reduced false attribution
- cross-case intelligence continuity

These are intended benefits, not guaranteed outcomes.

---

# 57. Success Criteria

PHANTOM succeeds when an investigator can answer:

> **What evidence connects these observations?**

> **How strong is that evidence?**

> **What contradicts the proposed relationship?**

> **Where did the evidence come from?**

> **What remains uncertain?**

The quality and defensibility of the explanation matter more than producing a visually impressive percentage.

---

# 58. Final Product Definition

The intended product is:

> **A web-based investigator workspace backed by an evidence-driven attribution and correlation engine.**

The core architecture is:

```text
Investigator
     ↓
Next.js Dashboard
     ↓
FastAPI
     ↓
Python Attribution Engine
     ↓
PostgreSQL + Neo4j
     ↓
Evidence / Correlation / Analysis
     ↓
Explainable Attribution Hypothesis
     ↓
Human Review
```

---

# 59. Final Core Philosophy

PHANTOM should always follow:

```text
FRAGMENTED OBSERVATIONS
          ↓
      EVIDENCE
          ↓
     EXTRACTION
          ↓
    NORMALIZATION
          ↓
     CORRELATION
          ↓
   TEMPORAL + GRAPH
       ANALYSIS
          ↓
   EVIDENCE FUSION
          ↓
SUPPORTING + CONTRADICTING
        EVIDENCE
          ↓
 EXPLAINABLE ATTRIBUTION
      HYPOTHESIS
          ↓
   HUMAN INVESTIGATOR
       REVIEW
```

The goal is not:

> “Find a person.”

The goal is:

> **“Build a defensible, evidence-backed hypothesis about whether fragmented observations may belong to the same persistent threat actor, while making the reasoning inspectable.”**

---

# 60. Responsible-Use Disclaimer

PHANTOM is intended for authorized threat-intelligence research and investigation.

It must respect:

- applicable law
- institutional policy
- privacy
- data-handling requirements
- source authorization
- responsible disclosure principles

It must not be designed to facilitate:

- unauthorized access
- malicious collection
- harassment
- doxxing
- unsupported accusations
- harmful cyber activity

---

# 61. Current Project Status

Current status:

> **Initial project architecture and technical specification established. Core prototype development is in progress / planned.**

The system should not be described as fully operational until the corresponding functionality has actually been implemented, tested and evaluated.

The first implementation target should be the controlled MVP vertical slice:

```text
Observation
→ Extraction
→ Normalization
→ Evidence Store
→ Graph
→ Candidate Correlation
→ Evidence Fusion
→ Contradiction Detection
→ Explainable Attribution Hypothesis
→ Investigator Dashboard
```

This document is the project blueprint for future implementation.
