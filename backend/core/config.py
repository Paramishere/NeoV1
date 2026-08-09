"""
NEO — Application Configuration
=================================
All settings loaded from environment variables via pydantic-settings.
"""
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="../.env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    NEO_VERSION: str = "1.0.0"
    NEO_ENV: str = "development"
    NEO_LOG_LEVEL: str = "INFO"
    NEO_PORT: int = 8765
    DEV_MODE: bool = True

    # Database
    DATABASE_URL: str = "sqlite:///./neo.db"

    # Ollama
    OLLAMA_URL: str = "http://localhost:11434"
    OLLAMA_DEFAULT_MODEL: str = "llama3.2"

    # Optional API keys (blank = feature disabled)
    OPENAI_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""
    SERPAPI_KEY: str = ""
    ELEVENLABS_API_KEY: str = ""
    ASSEMBLYAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""

    # Voice
    VOSK_MODEL_PATH: str = "./voice/vosk-model"
    PIPER_MODEL_PATH: str = "./voice/piper-model"
    WAKE_WORD_MODEL_PATH: str = "./voice/wakeword-model"

    # Memory
    MEMORY_MAX_ENTRIES: int = 10000
    MEMORY_SEARCH_LIMIT: int = 20

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    @property
    def is_production(self) -> bool:
        return self.NEO_ENV == "production"

    @property
    def has_openai(self) -> bool:
        return bool(self.OPENAI_API_KEY)

    @property
    def has_google(self) -> bool:
        return bool(self.GOOGLE_API_KEY)

    @property
    def has_elevenlabs(self) -> bool:
        return bool(self.ELEVENLABS_API_KEY)

    @property
    def has_anthropic(self) -> bool:
        return bool(self.ANTHROPIC_API_KEY)


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
