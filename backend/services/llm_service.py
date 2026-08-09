"""
NEO — LLM Service
==================
Handles communication with Ollama and optional cloud LLM providers.
Graceful fallback if Ollama is not available.
"""
import time
from typing import AsyncGenerator, List, Optional

import httpx

from core.config import settings
from core.logger import logger
from models.schemas import ChatMessage


class LLMService:
    """Manages LLM connections and inference."""

    def __init__(self):
        self.ollama_url = settings.OLLAMA_URL
        self.default_model = settings.OLLAMA_DEFAULT_MODEL
        self._ollama_available: Optional[bool] = None
        self._available_models: List[str] = []
        self._start_time = time.time()

    async def check_ollama(self) -> bool:
        """Check if Ollama server is accessible."""
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                resp = await client.get(f"{self.ollama_url}/api/tags")
                if resp.status_code == 200:
                    data = resp.json()
                    self._available_models = [m["name"] for m in data.get("models", [])]
                    self._ollama_available = True
                    logger.debug(f"Ollama online. Models: {self._available_models}")
                    return True
        except Exception as e:
            logger.warning(f"Ollama not reachable: {e}")
        self._ollama_available = False
        return False

    async def get_available_models(self) -> List[str]:
        """Return list of locally available Ollama models."""
        await self.check_ollama()
        return self._available_models

    async def chat(
        self,
        messages: List[ChatMessage],
        model: Optional[str] = None,
        stream: bool = False,
    ) -> dict:
        """Send chat request to Ollama. Returns response dict."""
        model = model or self.default_model

        if not await self.check_ollama():
            return {
                "content": "⚠️ NEO's AI engine (Ollama) is currently offline. Please install Ollama from ollama.ai and pull a model to start chatting.",
                "model": model,
                "tokens": None,
                "error": "ollama_offline",
            }

        payload = {
            "model": model,
            "messages": [{"role": m.role, "content": m.content} for m in messages],
            "stream": False,
            "options": {
                "temperature": float(settings.OLLAMA_DEFAULT_MODEL and 0.7),
            },
        }

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                resp = await client.post(
                    f"{self.ollama_url}/api/chat",
                    json=payload,
                )
                resp.raise_for_status()
                data = resp.json()
                return {
                    "content": data["message"]["content"],
                    "model": data.get("model", model),
                    "tokens": data.get("eval_count"),
                    "error": None,
                }
        except httpx.TimeoutException:
            logger.error("Ollama request timed out")
            return {
                "content": "⚠️ Request timed out. The model may be loading — please try again in a moment.",
                "model": model,
                "tokens": None,
                "error": "timeout",
            }
        except Exception as e:
            logger.error(f"Ollama chat error: {e}")
            return {
                "content": f"⚠️ Error communicating with AI engine: {str(e)}",
                "model": model,
                "tokens": None,
                "error": str(e),
            }

    @property
    def ollama_status(self) -> str:
        if self._ollama_available is None:
            return "checking"
        return "online" if self._ollama_available else "offline"

    @property
    def uptime(self) -> float:
        return time.time() - self._start_time


# Singleton
llm_service = LLMService()
