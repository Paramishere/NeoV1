"""
NEO — Logging Configuration
=============================
Structured logging using loguru with file rotation and rich console output.
"""
import sys
from pathlib import Path

from loguru import logger

# Ensure logs directory exists
LOGS_DIR = Path(__file__).parent.parent.parent / "logs"
LOGS_DIR.mkdir(parents=True, exist_ok=True)

# Remove default loguru handler
logger.remove()

# Console handler — colorized
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

logger.add(
    sys.stdout,
    format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{line}</cyan> — <level>{message}</level>",
    level="DEBUG",
    colorize=True,
)

# Main log file — rotating
logger.add(
    LOGS_DIR / "neo.log",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{line} — {message}",
    level="INFO",
    rotation="10 MB",
    retention="30 days",
    compression="zip",
    encoding="utf-8",
)

# Error log file — errors only
logger.add(
    LOGS_DIR / "neo_errors.log",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{line} — {message}\n{exception}",
    level="ERROR",
    rotation="5 MB",
    retention="90 days",
    compression="zip",
    encoding="utf-8",
)

# Startup log
logger.add(
    LOGS_DIR / "neo_startup.log",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {message}",
    level="INFO",
    rotation="1 day",
    retention="7 days",
    filter=lambda record: "startup" in record["extra"],
)

__all__ = ["logger"]
