"""
NEO — Pydantic Schemas (Request/Response Models)
=================================================
All API data transfer objects.
"""
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# ─── Chat ────────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str = Field(..., min_length=1)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=32000)
    conversation_id: Optional[str] = None
    model: Optional[str] = None
    stream: bool = False
    context_messages: Optional[List[ChatMessage]] = None


class ChatResponse(BaseModel):
    message: str
    role: str = "assistant"
    conversation_id: str
    model: str
    tokens_used: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ConversationSummary(BaseModel):
    session_id: str
    title: str
    model_used: Optional[str]
    created_at: datetime
    updated_at: datetime
    is_pinned: bool
    message_count: int = 0


class MessageOut(BaseModel):
    id: int
    role: str
    content: str
    model: Optional[str]
    tokens_used: Optional[int]
    created_at: datetime


# ─── Memory ──────────────────────────────────────────────────────────────────

class MemoryCreate(BaseModel):
    category: str = "general"
    key: str = Field(..., min_length=1, max_length=255)
    value: str = Field(..., min_length=1)
    importance: float = Field(0.5, ge=0.0, le=1.0)
    is_pinned: bool = False
    tags: List[str] = []


class MemoryOut(BaseModel):
    id: int
    category: str
    key: str
    value: str
    importance: float
    is_pinned: bool
    source: Optional[str]
    created_at: datetime
    tags: List[str] = []


# ─── Settings ────────────────────────────────────────────────────────────────

class SettingUpdate(BaseModel):
    value: str


class SettingOut(BaseModel):
    key: str
    value: str
    value_type: str
    category: str
    description: Optional[str]
    updated_at: datetime


class SettingsBulkUpdate(BaseModel):
    settings: Dict[str, str]


# ─── Tasks ───────────────────────────────────────────────────────────────────

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    priority: int = Field(5, ge=1, le=10)
    task_type: str = "manual"
    plugin_id: Optional[str] = None
    schedule_cron: Optional[str] = None


class TaskOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: str
    priority: int
    task_type: str
    plugin_id: Optional[str]
    schedule_cron: Optional[str]
    result: Optional[Any]
    error: Optional[str]
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]


# ─── Plugins ─────────────────────────────────────────────────────────────────

class PluginOut(BaseModel):
    plugin_id: str
    name: str
    version: str
    description: Optional[str]
    author: Optional[str]
    is_enabled: bool
    is_loaded: bool
    capabilities: List[str]
    created_at: datetime


class PluginToggle(BaseModel):
    is_enabled: bool


# ─── System ──────────────────────────────────────────────────────────────────

class SystemStatus(BaseModel):
    cpu_percent: float
    ram_percent: float
    ram_used_gb: float
    ram_total_gb: float
    disk_percent: float
    disk_used_gb: float
    disk_total_gb: float
    ollama_status: str  # online | offline | checking
    ollama_model: Optional[str]
    available_models: List[str]
    voice_status: str  # ready | unavailable | loading
    backend_version: str
    uptime_seconds: float


class IntegrationStatus(BaseModel):
    name: str
    status: str  # active | inactive | missing_key | error
    message: str


# ─── Logs ────────────────────────────────────────────────────────────────────

class LogEntryOut(BaseModel):
    id: int
    level: str
    source: str
    message: str
    details: Optional[Any]
    created_at: datetime


# ─── Common ──────────────────────────────────────────────────────────────────

class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    page_size: int
    has_next: bool


class ApiError(BaseModel):
    error: str
    detail: Optional[str] = None
    code: Optional[str] = None
