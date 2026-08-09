"""
NEO — Voice Service Interface
===============================
Interface for Vosk (STT), Piper (TTS), and openWakeWord.
Services gracefully disabled if models are not installed.
"""
from pathlib import Path
from typing import Optional

from core.config import settings
from core.logger import logger


class VoiceService:
    """
    Voice service interface.
    Actual voice engines (Vosk, Piper, openWakeWord) are loaded
    only if their model files are present.
    """

    def __init__(self):
        self._stt_available = False
        self._tts_available = False
        self._wake_word_available = False
        self._check_models()

    def _check_models(self):
        """Check which voice models are installed."""
        vosk_path = Path(settings.VOSK_MODEL_PATH)
        piper_path = Path(settings.PIPER_MODEL_PATH)
        wake_path = Path(settings.WAKE_WORD_MODEL_PATH)

        self._stt_available = vosk_path.exists()
        self._tts_available = piper_path.exists()
        self._wake_word_available = wake_path.exists()

        if self._stt_available:
            logger.info("✅ Vosk STT model found")
        else:
            logger.info("ℹ️ Vosk STT model not found — voice input disabled")

        if self._tts_available:
            logger.info("✅ Piper TTS model found")
        else:
            logger.info("ℹ️ Piper TTS model not found — voice output disabled")

    async def transcribe(self, audio_data: bytes) -> Optional[str]:
        """Transcribe audio to text using Vosk."""
        if not self._stt_available:
            return None
        # Vosk integration — implement when model is installed
        logger.warning("Vosk transcription not yet implemented")
        return None

    async def synthesize(self, text: str) -> Optional[bytes]:
        """Synthesize text to audio using Piper."""
        if not self._tts_available:
            return None
        # Piper TTS integration — implement when model is installed
        logger.warning("Piper TTS not yet implemented")
        return None

    @property
    def status(self) -> str:
        if self._stt_available or self._tts_available:
            return "ready"
        return "unavailable"

    @property
    def capabilities(self) -> dict:
        return {
            "stt": self._stt_available,
            "tts": self._tts_available,
            "wake_word": self._wake_word_available,
        }


# Singleton
voice_service = VoiceService()
