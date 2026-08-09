"""
NEO — SQLAlchemy Database Models
==================================
All ORM models for SQLite database.
"""
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    JSON,
)
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


class Conversation(Base):
    """Stores conversation sessions."""
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(64), unique=True, index=True, nullable=False)
    title = Column(String(255), default="New Conversation")
    model_used = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_pinned = Column(Boolean, default=False)
    metadata_ = Column("metadata", JSON, default=dict)

    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")


class Message(Base):
    """Individual messages within a conversation."""
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    role = Column(String(20), nullable=False)  # user | assistant | system
    content = Column(Text, nullable=False)
    tokens_used = Column(Integer, nullable=True)
    model = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    metadata_ = Column("metadata", JSON, default=dict)

    conversation = relationship("Conversation", back_populates="messages")


class MemoryEntry(Base):
    """Long-term memory storage."""
    __tablename__ = "memory"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(50), default="general")  # preference | fact | context | pinned
    key = Column(String(255), index=True, nullable=False)
    value = Column(Text, nullable=False)
    importance = Column(Float, default=0.5)
    is_pinned = Column(Boolean, default=False)
    source = Column(String(100), nullable=True)  # conversation_id | user | system
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    tags = Column(JSON, default=list)


class Setting(Base):
    """Application settings key-value store."""
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, index=True, nullable=False)
    value = Column(Text, nullable=False)
    value_type = Column(String(20), default="string")  # string | int | float | bool | json
    category = Column(String(50), default="general")
    description = Column(String(500), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Task(Base):
    """Automation and task management."""
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(20), default="pending")  # pending | running | completed | failed | cancelled
    priority = Column(Integer, default=5)  # 1-10
    task_type = Column(String(50), default="manual")  # manual | scheduled | automated
    plugin_id = Column(String(100), nullable=True)
    schedule_cron = Column(String(100), nullable=True)
    result = Column(JSON, nullable=True)
    error = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    metadata_ = Column("metadata", JSON, default=dict)


class Plugin(Base):
    """Registered plugins."""
    __tablename__ = "plugins"

    id = Column(Integer, primary_key=True, index=True)
    plugin_id = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    version = Column(String(20), default="1.0.0")
    description = Column(Text, nullable=True)
    author = Column(String(100), nullable=True)
    is_enabled = Column(Boolean, default=True)
    is_loaded = Column(Boolean, default=False)
    config = Column(JSON, default=dict)
    capabilities = Column(JSON, default=list)  # ["chat", "voice", "automation", etc.]
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class LogEntry(Base):
    """Application log entries stored in DB for UI display."""
    __tablename__ = "log_entries"

    id = Column(Integer, primary_key=True, index=True)
    level = Column(String(10), nullable=False)  # DEBUG | INFO | WARNING | ERROR | CRITICAL
    source = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class SystemConfig(Base):
    """System-level configuration and state."""
    __tablename__ = "system_config"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, index=True, nullable=False)
    value = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
