"""PHANTOM API — Entity, Graph, Hypothesis, Processing, and Health endpoints."""

from uuid import UUID
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.models.models import (
    Case, Entity, Relationship, Hypothesis, AnalystReview, ProcessingJob
)
from app.schemas.schemas import (
    EntityResponse, GraphResponse, GraphNode, GraphEdge,
    HypothesisResponse, HypothesisReview, JobResponse,
)

# ── Health ───────────────────────────────────────────────
health_router = APIRouter(tags=["health"])


@health_router.get("/health")
async def health_check():
    return {"status": "ok", "service": "phantom-api"}


# ── Entities ─────────────────────────────────────────────
entity_router = APIRouter(prefix="/api/v1", tags=["entities"])


@entity_router.get("/cases/{case_id}/entities", response_model=list[EntityResponse])
async def list_entities(case_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Entity).where(Entity.case_id == case_id).order_by(Entity.entity_type)
    )
    return result.scalars().all()


@entity_router.get("/entities/{entity_id}", response_model=EntityResponse)
async def get_entity(entity_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Entity).where(Entity.id == entity_id))
    entity = result.scalar_one_or_none()
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
    return entity


# ── Graph ────────────────────────────────────────────────
graph_router = APIRouter(prefix="/api/v1", tags=["graph"])


@graph_router.get("/cases/{case_id}/graph", response_model=GraphResponse)
async def get_graph(case_id: UUID, db: AsyncSession = Depends(get_db)):
    """Return graph data in Cytoscape-compatible format."""
    # Get all entities for this case
    entities_result = await db.execute(
        select(Entity).where(Entity.case_id == case_id)
    )
    entities = entities_result.scalars().all()

    # Get all relationships for this case
    rels_result = await db.execute(
        select(Relationship).where(Relationship.case_id == case_id)
    )
    relationships = rels_result.scalars().all()

    nodes = [
        GraphNode(
            id=str(e.id),
            label=e.original_value,
            type=e.entity_type,
            properties={
                "normalized_value": e.normalized_value,
                "confidence": e.confidence,
                "first_seen": e.first_seen.isoformat() if e.first_seen else None,
                "last_seen": e.last_seen.isoformat() if e.last_seen else None,
            }
        )
        for e in entities
    ]

    edges = [
        GraphEdge(
            id=str(r.id),
            source=str(r.entity_a_id),
            target=str(r.entity_b_id),
            label=r.relationship_type,
            type=r.status,
            confidence=r.confidence,
            properties={"reason": r.reason},
        )
        for r in relationships
    ]

    return GraphResponse(nodes=nodes, edges=edges)


# ── Hypotheses ───────────────────────────────────────────
hypothesis_router = APIRouter(prefix="/api/v1", tags=["hypotheses"])


@hypothesis_router.get("/cases/{case_id}/hypotheses", response_model=list[HypothesisResponse])
async def list_hypotheses(case_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Hypothesis).where(Hypothesis.case_id == case_id).order_by(Hypothesis.confidence.desc())
    )
    return result.scalars().all()


@hypothesis_router.get("/hypotheses/{hypothesis_id}", response_model=HypothesisResponse)
async def get_hypothesis(hypothesis_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Hypothesis).where(Hypothesis.id == hypothesis_id))
    hyp = result.scalar_one_or_none()
    if not hyp:
        raise HTTPException(status_code=404, detail="Hypothesis not found")
    return hyp


@hypothesis_router.post("/hypotheses/{hypothesis_id}/review", response_model=HypothesisResponse)
async def review_hypothesis(
    hypothesis_id: UUID,
    review: HypothesisReview,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Hypothesis).where(Hypothesis.id == hypothesis_id))
    hyp = result.scalar_one_or_none()
    if not hyp:
        raise HTTPException(status_code=404, detail="Hypothesis not found")

    # Create analyst review record
    analyst_review = AnalystReview(
        hypothesis_id=hypothesis_id,
        decision=review.decision,
        comment=review.comment,
    )
    db.add(analyst_review)

    # Update hypothesis status
    hyp.status = review.decision
    await db.flush()
    await db.refresh(hyp)
    return hyp


# ── Processing ───────────────────────────────────────────
processing_router = APIRouter(prefix="/api/v1", tags=["processing"])


@processing_router.post("/cases/{case_id}/process", response_model=JobResponse, status_code=202)
async def trigger_processing(
    case_id: UUID,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Trigger the full attribution pipeline for a case."""
    result = await db.execute(select(Case).where(Case.id == case_id))
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    # Create processing job
    job = ProcessingJob(case_id=case_id, job_type="full_pipeline", status="pending")
    db.add(job)
    await db.flush()
    await db.refresh(job)

    # Schedule background processing
    from app.workers.pipeline import run_pipeline
    background_tasks.add_task(run_pipeline, str(case_id), str(job.id))

    return job


@processing_router.get("/jobs/{job_id}", response_model=JobResponse)
async def get_job(job_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ProcessingJob).where(ProcessingJob.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
