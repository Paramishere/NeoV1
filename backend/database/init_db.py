"""
NEO — Database Initialization
===============================
Creates all tables and seeds default settings on first launch.
"""
from datetime import datetime

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from core.logger import logger
from database.connection import engine
from database.models import Base, Setting, SystemConfig


DEFAULT_SETTINGS = [
    # Theme
    ("theme", "dark", "string", "appearance", "Application color theme"),
    ("primary_color", "#00d4ff", "string", "appearance", "Primary accent color"),
    ("animations_enabled", "true", "bool", "appearance", "Enable UI animations"),
    # AI
    ("default_model", "llama3.2", "string", "ai", "Default AI model to use"),
    ("max_tokens", "2048", "int", "ai", "Maximum tokens per response"),
    ("temperature", "0.7", "float", "ai", "Model temperature (creativity)"),
    ("system_prompt", "You are NEO, a helpful and intelligent AI assistant.", "string", "ai", "System prompt"),
    # Voice
    ("voice_enabled", "false", "bool", "voice", "Enable voice input/output"),
    ("wake_word_enabled", "false", "bool", "voice", "Enable wake word detection"),
    ("tts_speed", "1.0", "float", "voice", "Text-to-speech speed"),
    ("tts_voice", "default", "string", "voice", "TTS voice selection"),
    # Memory
    ("memory_enabled", "true", "bool", "memory", "Enable long-term memory"),
    ("auto_summarize", "true", "bool", "memory", "Auto-summarize conversations"),
    # Language
    ("language", "en-US", "string", "general", "Interface language"),
    # Developer
    ("dev_mode", "true", "bool", "developer", "Enable developer mode"),
    ("show_token_count", "true", "bool", "developer", "Show token usage"),
    ("log_level", "INFO", "string", "developer", "Logging verbosity"),
]

DEFAULT_SYSTEM_CONFIG = [
    ("neo_initialized", "false"),
    ("last_startup", ""),
    ("total_conversations", "0"),
    ("total_messages", "0"),
    ("db_version", "1"),
]


async def init_database() -> None:
    """Initialize database — create tables and seed defaults."""
    logger.info("Initializing database...")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("✅ Database tables created/verified")

    await _seed_defaults()


async def _seed_defaults() -> None:
    """Seed default settings if not present."""
    from database.connection import AsyncSessionLocal

    async with AsyncSessionLocal() as session:
        # Seed settings
        for key, value, value_type, category, description in DEFAULT_SETTINGS:
            existing = await session.get(Setting, None)
            result = await session.execute(
                text("SELECT id FROM settings WHERE key = :key"), {"key": key}
            )
            if not result.fetchone():
                session.add(Setting(
                    key=key,
                    value=value,
                    value_type=value_type,
                    category=category,
                    description=description,
                ))

        # Seed system config
        for key, value in DEFAULT_SYSTEM_CONFIG:
            result = await session.execute(
                text("SELECT id FROM system_config WHERE key = :key"), {"key": key}
            )
            if not result.fetchone():
                session.add(SystemConfig(key=key, value=value))

        # Update last startup time
        await session.execute(
            text("UPDATE system_config SET value = :v WHERE key = 'last_startup'"),
            {"v": datetime.utcnow().isoformat()},
        )

        await session.commit()
    logger.info("✅ Database defaults seeded")
