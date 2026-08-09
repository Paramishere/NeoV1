"""
NEO — Memory Router
=====================
Long-term memory CRUD and search endpoints.
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from database.connection import get_db
from models.schemas import MemoryCreate, MemoryOut
from services.memory_service import memory_service

router = APIRouter()


@router.post("/", response_model=MemoryOut)
async def create_memory(entry: MemoryCreate, db: AsyncSession = Depends(get_db)):
    """Store a new memory entry."""
    mem = await memory_service.store(db, entry)
    return MemoryOut(
        id=mem.id,
        category=mem.category,
        key=mem.key,
        value=mem.value,
        importance=mem.importance,
        is_pinned=mem.is_pinned,
        source=mem.source,
        created_at=mem.created_at,
        tags=mem.tags or [],
    )


@router.get("/search", response_model=List[MemoryOut])
async def search_memory(
    q: str = Query(..., min_length=1),
    category: Optional[str] = None,
    limit: int = Query(20, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Search memory entries."""
    entries = await memory_service.search(db, q, category, limit)
    return [
        MemoryOut(
            id=e.id,
            category=e.category,
            key=e.key,
            value=e.value,
            importance=e.importance,
            is_pinned=e.is_pinned,
            source=e.source,
            created_at=e.created_at,
            tags=e.tags or [],
        )
        for e in entries
    ]


@router.get("/", response_model=List[MemoryOut])
async def list_memory(
    category: Optional[str] = None,
    pinned_only: bool = False,
    limit: int = Query(100, le=500),
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    """List memory entries with optional filters."""
    entries = await memory_service.get_all(db, category, pinned_only, limit, offset)
    return [
        MemoryOut(
            id=e.id,
            category=e.category,
            key=e.key,
            value=e.value,
            importance=e.importance,
            is_pinned=e.is_pinned,
            source=e.source,
            created_at=e.created_at,
            tags=e.tags or [],
        )
        for e in entries
    ]


@router.delete("/{memory_id}")
async def delete_memory(memory_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a memory entry."""
    deleted = await memory_service.delete(db, memory_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Memory entry not found")
    return {"message": "Memory deleted"}


@router.patch("/{memory_id}/pin")
async def pin_memory(
    memory_id: int,
    pinned: bool = True,
    db: AsyncSession = Depends(get_db),
):
    """Pin or unpin a memory entry."""
    entry = await memory_service.pin(db, memory_id, pinned)
    if not entry:
        raise HTTPException(status_code=404, detail="Memory entry not found")
    return {"id": memory_id, "is_pinned": pinned}
