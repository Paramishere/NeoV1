"""
NEO — Database Connection & Session Management
================================================
Async SQLAlchemy session with aiosqlite.
Ensures database parent directory exists and resolves absolute path.
"""
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from core.config import settings
from core.logger import logger

# Resolve SQLite URL and create parent directory
_db_url = settings.DATABASE_URL
if "sqlite" in _db_url:
    raw_path = _db_url.split("///")[-1] if "///" in _db_url else "neo.db"
    abs_path = Path(raw_path).resolve()
    abs_path.parent.mkdir(parents=True, exist_ok=True)
    _db_url = f"sqlite+aiosqlite:///{abs_path.as_posix()}"

engine = create_async_engine(
    _db_url,
    echo=False,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


async def get_db() -> AsyncSession:
    """FastAPI dependency for database sessions."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
