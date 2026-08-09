"""
NEO — Logs Router
==================
Application log retrieval for the UI.
"""
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Query
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from database.connection import get_db
from database.models import LogEntry
from models.schemas import LogEntryOut

router = APIRouter()

LOGS_DIR = Path(__file__).parent.parent.parent.parent / "logs"


@router.get("/", response_model=List[LogEntryOut])
async def get_logs(
    level: Optional[str] = None,
    limit: int = Query(100, le=500),
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    """Get log entries from database."""
    stmt = select(LogEntry).order_by(desc(LogEntry.created_at)).limit(limit).offset(offset)
    if level:
        stmt = select(LogEntry).where(LogEntry.level == level.upper()).order_by(
            desc(LogEntry.created_at)
        ).limit(limit).offset(offset)

    result = await db.execute(stmt)
    entries = result.scalars().all()

    return [
        LogEntryOut(
            id=e.id,
            level=e.level,
            source=e.source,
            message=e.message,
            details=e.details,
            created_at=e.created_at,
        )
        for e in entries
    ]


@router.get("/file")
async def get_log_file(lines: int = Query(100, le=1000)):
    """Read last N lines from the main log file."""
    log_file = LOGS_DIR / "neo.log"
    if not log_file.exists():
        return {"lines": [], "file": str(log_file)}

    with open(log_file, "r", encoding="utf-8", errors="replace") as f:
        all_lines = f.readlines()

    return {
        "lines": all_lines[-lines:],
        "total_lines": len(all_lines),
        "file": str(log_file),
    }


@router.delete("/clear")
async def clear_logs(db: AsyncSession = Depends(get_db)):
    """Clear all log entries from database."""
    result = await db.execute(select(LogEntry))
    entries = result.scalars().all()
    for entry in entries:
        await db.delete(entry)
    return {"cleared": len(entries)}
