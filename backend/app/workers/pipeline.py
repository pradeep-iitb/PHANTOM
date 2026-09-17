"""PHANTOM — Full attribution pipeline worker.

Orchestrates the complete processing workflow:
  Observations → Extraction → Normalization → Evidence Store
  → Graph → Candidate Generation → Evidence Fusion
  → Contradiction Detection → Hypothesis Generation

Runs as a FastAPI BackgroundTask.
"""

import sys
import os
import asyncio
import traceback
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

# Add engine to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "engine"))

from app.db.database import async_session, get_neo4j_driver
from app.models.models import (
    Observation, Entity, EvidenceItem, Relationship, Hypothesis, ProcessingJob
)

from extraction.regex_extractor import extract_entities
from normalization.normalizer import normalize_entity
from candidate_generation.generator import (
    generate_candidates, EntityRecord, CandidateRelationship
)
from scoring.evidence_fusion import fuse_evidence
from contradictions.detector import (
    detect_contradictions, EntityForContradiction
)
from attribution.hypothesis import generate_hypotheses


async def _update_job(job_id: str, status: str, progress: float, result: dict = None, error: str = None):
    """Update processing job status."""
    async with async_session() as session:
        job_result = await session.execute(
            select(ProcessingJob).where(ProcessingJob.id == UUID(job_id))
        )
        job = job_result.scalar_one_or_none()
        if job:
            job.status = status
            job.progress = progress
            if result:
                job.result = result
            if error:
                job.error = error
            if status == "running" and not job.started_at:
                job.started_at = datetime.now(timezone.utc)
            if status in ("completed", "failed"):
                job.completed_at = datetime.now(timezone.utc)
            await session.commit()


async def _sync_to_neo4j(case_id: str, entities: list, relationships: list):
    """Sync entities and relationships to Neo4j graph."""
    driver = get_neo4j_driver()
    if not driver:
        return

    try:
        with driver.session() as session:
            # Create entity nodes
            for entity in entities:
                session.run(
                    """
                    MERGE (e:Entity {id: $id})
                    SET e.type = $type,
                        e.original_value = $original_value,
                        e.normalized_value = $normalized_value,
                        e.confidence = $confidence,
                        e.case_id = $case_id
                    WITH e
                    CALL apoc.create.addLabels(e, [$label]) YIELD node
                    RETURN node
                    """,
                    id=str(entity.id),
                    type=entity.entity_type,
                    original_value=entity.original_value,
                    normalized_value=entity.normalized_value,
                    confidence=entity.confidence,
                    case_id=case_id,
                    label=entity.entity_type.capitalize(),
                )

            # Create relationship edges
            for rel in relationships:
                session.run(
                    """
                    MATCH (a:Entity {id: $entity_a_id})
                    MATCH (b:Entity {id: $entity_b_id})
                    MERGE (a)-[r:RELATED_TO {id: $rel_id}]->(b)
                    SET r.type = $rel_type,
                        r.confidence = $confidence,
                        r.reason = $reason,
                        r.status = $status
                    """,
                    entity_a_id=str(rel.entity_a_id),
                    entity_b_id=str(rel.entity_b_id),
                    rel_id=str(rel.id),
                    rel_type=rel.relationship_type,
                    confidence=rel.confidence,
                    reason=rel.reason,
                    status=rel.status,
                )
    except Exception as e:
        print(f"[PHANTOM] Neo4j sync warning: {e}")


def run_pipeline(case_id: str, job_id: str):
    """Entry point for background pipeline execution."""
    asyncio.run(_run_pipeline_async(case_id, job_id))


async def _run_pipeline_async(case_id: str, job_id: str):
    """Full attribution pipeline — async implementation."""
    try:
        await _update_job(job_id, "running", 0.0)

        async with async_session() as session:
            # ── Step 1: Fetch observations ───────────────
            obs_result = await session.execute(
                select(Observation).where(Observation.case_id == UUID(case_id))
            )
            observations = obs_result.scalars().all()

            if not observations:
                await _update_job(job_id, "completed", 1.0,
                                  result={"message": "No observations to process"})
                return

            await _update_job(job_id, "running", 0.1)

            # ── Step 2: Extract entities ─────────────────
            all_extracted = []
            for obs in observations:
                extracted = extract_entities(obs.raw_content)
                for ext in extracted:
                    normalized = normalize_entity(ext.entity_type, ext.original_value)
                    entity = Entity(
                        case_id=UUID(case_id),
                        observation_id=obs.id,
                        entity_type=ext.entity_type,
                        original_value=ext.original_value,
                        normalized_value=normalized,
                        confidence=ext.confidence,
                        first_seen=obs.observed_at,
                        last_seen=obs.observed_at,
                    )
                    session.add(entity)
                    all_extracted.append((entity, obs, ext))

            await session.flush()
            await _update_job(job_id, "running", 0.3)

            # ── Step 3: Create evidence items ────────────
            for entity, obs, ext in all_extracted:
                evidence = EvidenceItem(
                    observation_id=obs.id,
                    entity_id=entity.id,
                    evidence_type="extraction",
                    strength="supporting",
                    excerpt=ext.context,
                    source_context=f"Extracted from observation via regex pattern",
                )
                session.add(evidence)

            await session.flush()
            await _update_job(job_id, "running", 0.4)

            # ── Step 4: Generate candidates ──────────────
            entity_records = [
                EntityRecord(
                    id=str(entity.id),
                    entity_type=entity.entity_type,
                    original_value=entity.original_value,
                    normalized_value=entity.normalized_value,
                    observation_id=str(entity.observation_id) if entity.observation_id else "",
                    observed_at=obs.observed_at.isoformat() if obs.observed_at else "",
                )
                for entity, obs, ext in all_extracted
            ]

            candidates = generate_candidates(entity_records)
            await _update_job(job_id, "running", 0.5)

            # ── Step 5: Store relationships ──────────────
            db_relationships = []
            for candidate in candidates:
                # Aggregate signals for reason text
                reason_parts = [s.description for s in candidate.signals]
                rel = Relationship(
                    case_id=UUID(case_id),
                    entity_a_id=UUID(candidate.entity_a_id),
                    entity_b_id=UUID(candidate.entity_b_id),
                    relationship_type=candidate.relationship_type,
                    status="candidate",
                    confidence=candidate.confidence,
                    reason=" | ".join(reason_parts),
                )
                session.add(rel)
                db_relationships.append(rel)

                # Create evidence items for each signal
                for signal in candidate.signals:
                    await session.flush()
                    ev = EvidenceItem(
                        entity_id=UUID(candidate.entity_a_id),
                        relationship_id=rel.id,
                        evidence_type=signal.signal_type,
                        strength=signal.strength,
                        excerpt=signal.description,
                    )
                    session.add(ev)

            await session.flush()
            await _update_job(job_id, "running", 0.6)

            # ── Step 6: Contradiction detection ──────────
            entity_for_contradiction = [
                EntityForContradiction(
                    id=str(entity.id),
                    entity_type=entity.entity_type,
                    original_value=entity.original_value,
                    normalized_value=entity.normalized_value,
                    observation_id=str(entity.observation_id) if entity.observation_id else "",
                    first_seen=entity.first_seen,
                    last_seen=entity.last_seen,
                )
                for entity, obs, ext in all_extracted
            ]

            candidate_pairs = [
                (c.entity_a_id, c.entity_b_id) for c in candidates
                if c.relationship_type == "POSSIBLY_SAME_AS"
            ]
            contradictions = detect_contradictions(entity_for_contradiction, candidate_pairs)

            await _update_job(job_id, "running", 0.7)

            # ── Step 7: Evidence fusion + hypotheses ─────
            # Group candidates by connected components
            # Simple approach: group by shared entities
            groups = _group_candidates(candidates, [e for e, _, _ in all_extracted])

            hypothesis_inputs = []
            for group_entities, group_signals in groups:
                all_signals = []
                for signal in group_signals:
                    all_signals.append({
                        "signal_type": signal.signal_type,
                        "strength": signal.strength,
                        "description": signal.description,
                        "score": signal.score,
                    })

                group_contradictions = [
                    {"contradiction_type": c.contradiction_type,
                     "severity": c.severity,
                     "description": c.description}
                    for c in contradictions
                    if c.entity_a_id in [str(e.id) for e in group_entities]
                    or c.entity_b_id in [str(e.id) for e in group_entities]
                ]

                fusion = fuse_evidence(
                    all_signals,
                    source_reliability=0.7,
                    contradiction_count=len(group_contradictions),
                )

                hypothesis_inputs.append({
                    "entities": [
                        {"id": str(e.id), "entity_type": e.entity_type,
                         "original_value": e.original_value}
                        for e in group_entities
                    ],
                    "signals": all_signals,
                    "contradictions": group_contradictions,
                    "fusion_result": {
                        "confidence": fusion.confidence,
                        "confidence_level": fusion.confidence_level,
                    },
                })

            hypotheses = generate_hypotheses(hypothesis_inputs)
            await _update_job(job_id, "running", 0.8)

            # ── Step 8: Store hypotheses ─────────────────
            for hyp in hypotheses:
                db_hyp = Hypothesis(
                    case_id=UUID(case_id),
                    title=hyp.title,
                    description=hyp.description,
                    confidence=hyp.confidence,
                    confidence_level=hyp.confidence_level,
                    status="generated",
                    entities_involved=hyp.entities_involved,
                    strong_evidence=hyp.strong_evidence,
                    supporting_signals=hyp.supporting_signals,
                    contradictions=hyp.contradictions,
                )
                session.add(db_hyp)

            await session.flush()
            await _update_job(job_id, "running", 0.9)

            # ── Step 9: Sync to Neo4j ────────────────────
            all_entities_for_neo4j = [e for e, _, _ in all_extracted]
            await _sync_to_neo4j(case_id, all_entities_for_neo4j, db_relationships)

            await session.commit()

            # ── Done ─────────────────────────────────────
            await _update_job(job_id, "completed", 1.0, result={
                "entities_extracted": len(all_extracted),
                "candidates_generated": len(candidates),
                "contradictions_found": len(contradictions),
                "hypotheses_generated": len(hypotheses),
            })

    except Exception as e:
        traceback.print_exc()
        await _update_job(job_id, "failed", 0.0, error=str(e))


def _group_candidates(candidates, entities):
    """Group candidates into connected components using Union-Find."""
    from candidate_generation.generator import Signal

    entity_map = {str(e.id): e for e in entities}
    parent = {}

    def find(x):
        if x not in parent:
            parent[x] = x
        if parent[x] != x:
            parent[x] = find(parent[x])
        return parent[x]

    def union(x, y):
        px, py = find(x), find(y)
        if px != py:
            parent[px] = py

    # Initialize all entities
    for eid in entity_map:
        find(eid)

    # Union based on candidates
    signals_by_group: dict[str, list] = {}
    for candidate in candidates:
        union(candidate.entity_a_id, candidate.entity_b_id)

    # Group entities by their root
    groups_map: dict[str, list] = {}
    for eid in entity_map:
        root = find(eid)
        groups_map.setdefault(root, []).append(entity_map[eid])

    # Attach signals to groups
    result = []
    for root, group_entities in groups_map.items():
        if len(group_entities) < 2:
            continue
        group_entity_ids = {str(e.id) for e in group_entities}
        group_signals = []
        for candidate in candidates:
            if candidate.entity_a_id in group_entity_ids or candidate.entity_b_id in group_entity_ids:
                group_signals.extend(candidate.signals)
        result.append((group_entities, group_signals))

    return result
