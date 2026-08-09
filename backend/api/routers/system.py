"""
NEO — System Router
=====================
System status, health, integrations, and metrics.
"""
import uuid
from typing import List

from fastapi import APIRouter

from core.config import settings
from models.schemas import IntegrationStatus, SystemStatus
from services.llm_service import llm_service
from services.system_service import system_service
from services.voice_service import voice_service

router = APIRouter()


@router.get("/status", response_model=SystemStatus)
async def get_system_status():
    """Get real-time system resource and service status."""
    ram = system_service.get_ram_info()
    disk = system_service.get_disk_info()
    models = await llm_service.get_available_models()

    return SystemStatus(
        cpu_percent=system_service.get_cpu_percent(),
        ram_percent=ram["percent"],
        ram_used_gb=ram["used_gb"],
        ram_total_gb=ram["total_gb"],
        disk_percent=disk["percent"],
        disk_used_gb=disk["used_gb"],
        disk_total_gb=disk["total_gb"],
        ollama_status=llm_service.ollama_status,
        ollama_model=settings.OLLAMA_DEFAULT_MODEL,
        available_models=models,
        voice_status=voice_service.status,
        backend_version=settings.NEO_VERSION,
        uptime_seconds=system_service.uptime_seconds,
    )


@router.get("/integrations", response_model=List[IntegrationStatus])
async def get_integration_status():
    """Get status of all optional integrations."""
    integrations = [
        IntegrationStatus(
            name="Ollama (Local AI)",
            status="active" if llm_service.ollama_status == "online" else "inactive",
            message="Local AI engine running" if llm_service.ollama_status == "online"
            else "Install Ollama from ollama.ai to enable local AI",
        ),
        IntegrationStatus(
            name="OpenAI",
            status="active" if settings.has_openai else "missing_key",
            message="Connected" if settings.has_openai else "Add OPENAI_API_KEY to .env",
        ),
        IntegrationStatus(
            name="Google Gemini",
            status="active" if settings.has_google else "missing_key",
            message="Connected" if settings.has_google else "Add GOOGLE_API_KEY to .env",
        ),
        IntegrationStatus(
            name="Anthropic Claude",
            status="active" if settings.has_anthropic else "missing_key",
            message="Connected" if settings.has_anthropic else "Add ANTHROPIC_API_KEY to .env",
        ),
        IntegrationStatus(
            name="ElevenLabs TTS",
            status="active" if settings.has_elevenlabs else "missing_key",
            message="Connected" if settings.has_elevenlabs else "Add ELEVENLABS_API_KEY to .env",
        ),
        IntegrationStatus(
            name="Voice (Vosk STT)",
            status="ready" if voice_service.capabilities["stt"] else "unavailable",
            message="STT ready" if voice_service.capabilities["stt"]
            else "Download Vosk model to enable speech recognition",
        ),
        IntegrationStatus(
            name="Voice (Piper TTS)",
            status="ready" if voice_service.capabilities["tts"] else "unavailable",
            message="TTS ready" if voice_service.capabilities["tts"]
            else "Download Piper model to enable speech synthesis",
        ),
    ]
    return integrations


@router.get("/info")
async def get_system_info():
    """Get static system information."""
    return system_service.get_system_info()
