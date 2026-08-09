"""
NEO — Plugins Router
======================
Plugin discovery, listing, and management endpoints.
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.connection import get_db
from database.models import Plugin
from models.schemas import PluginOut, PluginToggle
from services.plugin_service import plugin_loader

router = APIRouter()


@router.get("/", response_model=List[PluginOut])
async def list_plugins(db: AsyncSession = Depends(get_db)):
    """List all discovered plugins."""
    # Discover from filesystem
    manifests = await plugin_loader.discover_plugins()

    # Sync with DB
    result = await db.execute(select(Plugin))
    db_plugins = {p.plugin_id: p for p in result.scalars().all()}

    plugins_out = []
    for manifest in manifests:
        pid = manifest.get("plugin_id", "")
        db_plugin = db_plugins.get(pid)

        if not db_plugin:
            # Register new plugin
            db_plugin = Plugin(
                plugin_id=pid,
                name=manifest.get("name", pid),
                version=manifest.get("version", "1.0.0"),
                description=manifest.get("description"),
                author=manifest.get("author"),
                capabilities=manifest.get("capabilities", []),
                is_enabled=manifest.get("enabled", True),
            )
            db.add(db_plugin)
            await db.flush()

        db_plugin.is_loaded = pid in plugin_loader.get_loaded_plugins()

        plugins_out.append(PluginOut(
            plugin_id=db_plugin.plugin_id,
            name=db_plugin.name,
            version=db_plugin.version,
            description=db_plugin.description,
            author=db_plugin.author,
            is_enabled=db_plugin.is_enabled,
            is_loaded=db_plugin.is_loaded,
            capabilities=db_plugin.capabilities or [],
            created_at=db_plugin.created_at,
        ))

    return plugins_out


@router.patch("/{plugin_id}/toggle")
async def toggle_plugin(
    plugin_id: str,
    toggle: PluginToggle,
    db: AsyncSession = Depends(get_db),
):
    """Enable or disable a plugin."""
    result = await db.execute(select(Plugin).where(Plugin.plugin_id == plugin_id))
    plugin = result.scalar_one_or_none()
    if not plugin:
        raise HTTPException(status_code=404, detail="Plugin not found")

    plugin.is_enabled = toggle.is_enabled
    return {"plugin_id": plugin_id, "is_enabled": toggle.is_enabled}


@router.post("/reload")
async def reload_plugins():
    """Reload all plugins from filesystem."""
    count = await plugin_loader.load_all()
    return {"loaded": count, "message": f"Loaded {count} plugins"}
