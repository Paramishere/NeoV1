"""
NEO — Settings Router
=======================
Application settings management.
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.connection import get_db
from database.models import Setting
from models.schemas import SettingOut, SettingUpdate, SettingsBulkUpdate

router = APIRouter()


@router.get("/", response_model=List[SettingOut])
async def get_all_settings(
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Get all settings, optionally filtered by category."""
    stmt = select(Setting)
    if category:
        stmt = stmt.where(Setting.category == category)
    result = await db.execute(stmt)
    settings_list = result.scalars().all()
    return [
        SettingOut(
            key=s.key,
            value=s.value,
            value_type=s.value_type,
            category=s.category,
            description=s.description,
            updated_at=s.updated_at,
        )
        for s in settings_list
    ]


@router.get("/{key}", response_model=SettingOut)
async def get_setting(key: str, db: AsyncSession = Depends(get_db)):
    """Get a specific setting by key."""
    result = await db.execute(select(Setting).where(Setting.key == key))
    setting = result.scalar_one_or_none()
    if not setting:
        raise HTTPException(status_code=404, detail=f"Setting '{key}' not found")
    return SettingOut(
        key=setting.key,
        value=setting.value,
        value_type=setting.value_type,
        category=setting.category,
        description=setting.description,
        updated_at=setting.updated_at,
    )


@router.put("/{key}")
async def update_setting(key: str, update: SettingUpdate, db: AsyncSession = Depends(get_db)):
    """Update a specific setting."""
    result = await db.execute(select(Setting).where(Setting.key == key))
    setting = result.scalar_one_or_none()
    if not setting:
        raise HTTPException(status_code=404, detail=f"Setting '{key}' not found")
    setting.value = update.value
    return {"key": key, "value": update.value, "updated": True}


@router.put("/bulk/update")
async def bulk_update_settings(bulk: SettingsBulkUpdate, db: AsyncSession = Depends(get_db)):
    """Update multiple settings at once."""
    updated = []
    for key, value in bulk.settings.items():
        result = await db.execute(select(Setting).where(Setting.key == key))
        setting = result.scalar_one_or_none()
        if setting:
            setting.value = value
            updated.append(key)
    return {"updated": updated, "count": len(updated)}
