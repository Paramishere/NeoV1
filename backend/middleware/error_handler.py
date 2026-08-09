"""
NEO — Global Error Handler Middleware
=======================================
Catches all unhandled exceptions and returns structured JSON errors.
"""
from fastapi import Request
from fastapi.responses import JSONResponse

from core.logger import logger


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle all unhandled exceptions globally."""
    logger.exception(f"Unhandled exception on {request.method} {request.url}: {exc}")

    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": str(exc),
            "path": str(request.url),
            "method": request.method,
        },
    )
