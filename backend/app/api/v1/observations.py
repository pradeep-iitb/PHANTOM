"""PHANTOM API — Observation endpoints."""

import hashlib
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.models.models import Case, Source, Observation
from app.schemas.schemas import ObservationCreate, ObservationResponse

router = APIRouter(prefix="/api/v1/cases/{case_id}/observations", tags=["observations"])


@router.get("", response_model=list[ObservationResponse])
async def list_observations(case_id: UUID, db: AsyncSession = Depends(get_db)):
    # Verify case exists
    result = await db.execute(select(Case).where(Case.id == case_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Case not found")

    result = await db.execute(
        select(Observation)
        .where(Observation.case_id == case_id)
        .order_by(Observation.created_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=ObservationResponse, status_code=201)
async def add_observation(case_id: UUID, data: ObservationCreate, db: AsyncSession = Depends(get_db)):
    # Verify case exists
    result = await db.execute(select(Case).where(Case.id == case_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Case not found")

    # Find or create source
    source_result = await db.execute(
        select(Source).where(Source.name == data.source_name)
    )
    source = source_result.scalar_one_or_none()
    if not source:
        source = Source(
            name=data.source_name,
            source_type=data.source_type,
            reliability=data.source_reliability,
        )
        db.add(source)
        await db.flush()

    # Create observation
    content_hash = hashlib.sha256(data.raw_content.encode()).hexdigest()
    observation = Observation(
        case_id=case_id,
        source_id=source.id,
        observed_at=data.observed_at,
        raw_content=data.raw_content,
        content_hash=content_hash,
        source_reference=data.source_reference,
        handling_notes=data.handling_notes,
        metadata_json=data.metadata,
    )
    db.add(observation)
    await db.flush()
    await db.refresh(observation)
    return observation


@router.post("/bulk", response_model=list[ObservationResponse], status_code=201)
async def bulk_add_observations(
    case_id: UUID,
    observations: list[ObservationCreate],
    db: AsyncSession = Depends(get_db),
):
    # Verify case exists
    result = await db.execute(select(Case).where(Case.id == case_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Case not found")

    created = []
    for data in observations:
        # Find or create source
        source_result = await db.execute(
            select(Source).where(Source.name == data.source_name)
        )
        source = source_result.scalar_one_or_none()
        if not source:
            source = Source(
                name=data.source_name,
                source_type=data.source_type,
                reliability=data.source_reliability,
            )
            db.add(source)
            await db.flush()

        content_hash = hashlib.sha256(data.raw_content.encode()).hexdigest()
        observation = Observation(
            case_id=case_id,
            source_id=source.id,
            observed_at=data.observed_at,
            raw_content=data.raw_content,
            content_hash=content_hash,
            source_reference=data.source_reference,
            handling_notes=data.handling_notes,
            metadata_json=data.metadata,
        )
        db.add(observation)
        await db.flush()
        await db.refresh(observation)
        created.append(observation)

    return created
