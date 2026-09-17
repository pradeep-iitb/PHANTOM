"""PHANTOM API — Case endpoints."""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.models.models import Case, Observation, Entity, Hypothesis
from app.schemas.schemas import CaseCreate, CaseUpdate, CaseResponse

router = APIRouter(prefix="/api/v1/cases", tags=["cases"])


@router.get("", response_model=list[CaseResponse])
async def list_cases(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Case).order_by(Case.created_at.desc()))
    cases = result.scalars().all()

    responses = []
    for case in cases:
        obs_count = (await db.execute(
            select(func.count()).where(Observation.case_id == case.id)
        )).scalar() or 0
        ent_count = (await db.execute(
            select(func.count()).where(Entity.case_id == case.id)
        )).scalar() or 0
        hyp_count = (await db.execute(
            select(func.count()).where(Hypothesis.case_id == case.id)
        )).scalar() or 0

        responses.append(CaseResponse(
            id=case.id,
            title=case.title,
            description=case.description,
            status=case.status,
            created_at=case.created_at,
            updated_at=case.updated_at,
            observation_count=obs_count,
            entity_count=ent_count,
            hypothesis_count=hyp_count,
        ))
    return responses


@router.post("", response_model=CaseResponse, status_code=201)
async def create_case(data: CaseCreate, db: AsyncSession = Depends(get_db)):
    case = Case(title=data.title, description=data.description)
    db.add(case)
    await db.flush()
    await db.refresh(case)
    return CaseResponse(
        id=case.id,
        title=case.title,
        description=case.description,
        status=case.status,
        created_at=case.created_at,
        updated_at=case.updated_at,
    )


@router.get("/{case_id}", response_model=CaseResponse)
async def get_case(case_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Case).where(Case.id == case_id))
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    obs_count = (await db.execute(
        select(func.count()).where(Observation.case_id == case.id)
    )).scalar() or 0
    ent_count = (await db.execute(
        select(func.count()).where(Entity.case_id == case.id)
    )).scalar() or 0
    hyp_count = (await db.execute(
        select(func.count()).where(Hypothesis.case_id == case.id)
    )).scalar() or 0

    return CaseResponse(
        id=case.id,
        title=case.title,
        description=case.description,
        status=case.status,
        created_at=case.created_at,
        updated_at=case.updated_at,
        observation_count=obs_count,
        entity_count=ent_count,
        hypothesis_count=hyp_count,
    )


@router.patch("/{case_id}", response_model=CaseResponse)
async def update_case(case_id: UUID, data: CaseUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Case).where(Case.id == case_id))
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    if data.title is not None:
        case.title = data.title
    if data.description is not None:
        case.description = data.description
    if data.status is not None:
        case.status = data.status

    await db.flush()
    await db.refresh(case)
    return CaseResponse(
        id=case.id,
        title=case.title,
        description=case.description,
        status=case.status,
        created_at=case.created_at,
        updated_at=case.updated_at,
    )
