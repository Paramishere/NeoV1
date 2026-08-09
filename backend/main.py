"""
NEO Backend — Application Entry Point
=====================================
FastAPI application factory with all routers mounted.
"""
import asyncio
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from core.config import settings
from core.logger import logger
from database.init_db import init_database
from middleware.error_handler import global_exception_handler
from api.routers import chat, memory, settings_router, tasks, plugins, system, logs


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — startup and shutdown."""
    logger.info("🚀 NEO Backend starting up...")
    await init_database()
    logger.info(f"✅ NEO v{settings.NEO_VERSION} ready on port {settings.NEO_PORT}")
    yield
    logger.info("🛑 NEO Backend shutting down...")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title="NEO AI Assistant API",
        description="Backend API for NEO — Futuristic AI Desktop Assistant",
        version=settings.NEO_VERSION,
        docs_url="/api/docs" if settings.DEV_MODE else None,
        redoc_url="/api/redoc" if settings.DEV_MODE else None,
        lifespan=lifespan,
    )

    # --- CORS ---
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # --- Global Exception Handler ---
    app.add_exception_handler(Exception, global_exception_handler)

    # --- Mount Routers ---
    app.include_router(system.router, prefix="/api/system", tags=["system"])
    app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
    app.include_router(memory.router, prefix="/api/memory", tags=["memory"])
    app.include_router(settings_router.router, prefix="/api/settings", tags=["settings"])
    app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
    app.include_router(plugins.router, prefix="/api/plugins", tags=["plugins"])
    app.include_router(logs.router, prefix="/api/logs", tags=["logs"])

    @app.get("/api/health")
    async def health_check():
        return {"status": "ok", "version": settings.NEO_VERSION, "name": "NEO"}

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=settings.NEO_PORT,
        reload=settings.DEV_MODE,
        log_level=settings.NEO_LOG_LEVEL.lower(),
    )
