# PHANTOM

PHANTOM is a proposed Smart India Hackathon 2026 project: an evidence-driven threat intelligence and investigation platform for correlating fragmented digital observations into explainable threat-actor attribution hypotheses.

## Status

**Foundation / planning stage.** This repository currently documents the project direction. It does not yet claim to contain a working attribution engine, crawler, AI pipeline, production application, or deployment.

## The idea

Threat investigations often start with disconnected clues—aliases, wallets, emails, domains, indicators, reports, timestamps, or writing patterns. PHANTOM is intended to help an investigator preserve those clues as evidence, discover candidate links, inspect provenance and contradictions, and form reviewable hypotheses.

Its core is attribution and correlation, not collection. It is not primarily a dark-web crawler, search engine, chatbot, or generic graph viewer.

## Planned capabilities

- Case-based investigation workspace
- Evidence and provenance tracking
- Entity extraction and normalization
- Graph-based correlation of entities and observations
- Transparent candidate-link explanations
- Hypothesis, confidence, contradiction, and analyst-review workflows
- Investigation timeline and graph views

## Proposed technology direction

- **Next.js** — investigator-facing web interface
- **FastAPI** — API and workflow services
- **PostgreSQL** — structured operational and case data
- **Neo4j** — evidence graph and relationship analysis
- **Hugging Face / approved ML services** — bounded extraction and similarity assistance

These are architecture targets, not a statement that integrations are already available.

## Guiding principle

PHANTOM does not treat an attribution score as a verdict. Every meaningful candidate relationship should show the evidence that supports it, any contradictions, its provenance, and its uncertainty for human review.

## Documentation

See [idea.md](idea.md) for the full problem framing, scope, conceptual data model, planned architecture, MVP direction, and explicit implementation boundaries.

## Responsible use

PHANTOM is intended only for authorized, lawful threat-intelligence and investigative work. It must not enable unauthorized access, doxxing, harassment, or unsupported accusations.

## License

See [LICENSE](LICENSE).
