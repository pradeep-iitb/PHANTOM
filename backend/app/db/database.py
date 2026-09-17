"""Database connections — PostgreSQL (async SQLAlchemy) and Neo4j."""

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from neo4j import GraphDatabase, AsyncGraphDatabase
from app.core.config import get_settings

settings = get_settings()

# ---------- PostgreSQL ----------
engine = create_async_engine(settings.database_url, echo=settings.debug, future=True)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db() -> AsyncSession:
    """FastAPI dependency — yields an async DB session."""
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


# ---------- Neo4j ----------
neo4j_driver = None


def get_neo4j_driver():
    global neo4j_driver
    if neo4j_driver is None:
        neo4j_driver = GraphDatabase.driver(
            settings.neo4j_uri,
            auth=(settings.neo4j_username, settings.neo4j_password),
        )
    return neo4j_driver


def close_neo4j_driver():
    global neo4j_driver
    if neo4j_driver:
        neo4j_driver.close()
        neo4j_driver = None
