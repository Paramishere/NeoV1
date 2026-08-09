"""
NEO — Memory Service
======================
Manages long-term memory storage and retrieval.
"""
from datetime import datetime
from typing import List, Optional

from sqlalchemy import select, desc, or_
from sqlalchemy.ext.asyncio import AsyncSession

from core.logger import logger
from database.models import MemoryEntry
from models.schemas import MemoryCreate, MemoryOut


class MemoryService:
    """Handles long-term memory CRUD and search."""

    async def store(self, db: AsyncSession, entry: MemoryCreate, source: str = "user") -> MemoryEntry:
        """Store a new memory entry."""
        mem = MemoryEntry(
            category=entry.category,
            key=entry.key,
            value=entry.value,
            importance=entry.importance,
            is_pinned=entry.is_pinned,
            source=source,
            tags=entry.tags,
        )
        db.add(mem)
        await db.flush()
        logger.debug(f"Stored memory: {entry.key}")
        return mem

    async def search(
        self,
        db: AsyncSession,
        query: str,
        category: Optional[str] = None,
        limit: int = 20,
    ) -> List[MemoryEntry]:
        """Search memory entries by text."""
        stmt = select(MemoryEntry).where(
            or_(
                MemoryEntry.key.ilike(f"%{query}%"),
                MemoryEntry.value.ilike(f"%{query}%"),
            )
        )
        if category:
            stmt = stmt.where(MemoryEntry.category == category)
        stmt = stmt.order_by(desc(MemoryEntry.importance)).limit(limit)
        result = await db.execute(stmt)
        return result.scalars().all()

    async def get_all(
        self,
        db: AsyncSession,
        category: Optional[str] = None,
        pinned_only: bool = False,
        limit: int = 100,
        offset: int = 0,
    ) -> List[MemoryEntry]:
        """Retrieve memory entries with optional filters."""
        stmt = select(MemoryEntry)
        if category:
            stmt = stmt.where(MemoryEntry.category == category)
        if pinned_only:
            stmt = stmt.where(MemoryEntry.is_pinned == True)
        stmt = stmt.order_by(desc(MemoryEntry.updated_at)).limit(limit).offset(offset)
        result = await db.execute(stmt)
        return result.scalars().all()

    async def delete(self, db: AsyncSession, memory_id: int) -> bool:
        """Delete a memory entry."""
        entry = await db.get(MemoryEntry, memory_id)
        if entry:
            await db.delete(entry)
            return True
        return False

    async def pin(self, db: AsyncSession, memory_id: int, pinned: bool) -> Optional[MemoryEntry]:
        """Toggle pin status of a memory entry."""
        entry = await db.get(MemoryEntry, memory_id)
        if entry:
            entry.is_pinned = pinned
            return entry
        return None


memory_service = MemoryService()
