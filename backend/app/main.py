"""PHANTOM API — FastAPI application entry point."""

import os
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.db.database import engine, close_neo4j_driver
from app.models.models import Base

# Add engine to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "engine"))

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle."""
    # Startup: create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("[PHANTOM] Database tables created/verified.")

    yield

    # Shutdown: cleanup
    close_neo4j_driver()
    await engine.dispose()
    print("[PHANTOM] Connections closed.")


app = FastAPI(
    title="PHANTOM API",
    description="Evidence-Driven Threat Actor Attribution — API",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
from app.api.v1.cases import router as cases_router
from app.api.v1.observations import router as observations_router
from app.api.v1.endpoints import (
    health_router,
    entity_router,
    graph_router,
    hypothesis_router,
    processing_router,
)

app.include_router(health_router)
app.include_router(cases_router)
app.include_router(observations_router)
app.include_router(entity_router)
app.include_router(graph_router)
app.include_router(hypothesis_router)
app.include_router(processing_router)
