"""
NEO — Chat Router
==================
Handles conversation creation, messaging, and history.
"""
import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, desc, func
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from core.logger import logger
from database.connection import get_db
from database.models import Conversation, Message
from models.schemas import (
    ChatRequest,
    ChatResponse,
    ChatMessage,
    ConversationSummary,
    MessageOut,
)
from services.llm_service import llm_service

router = APIRouter()


@router.post("/send", response_model=ChatResponse)
async def send_message(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    """Send a message and get AI response."""

    # Get or create conversation
    if request.conversation_id:
        result = await db.execute(
            select(Conversation).where(Conversation.session_id == request.conversation_id)
        )
        conversation = result.scalar_one_or_none()
    else:
        conversation = None

    if not conversation:
        session_id = str(uuid.uuid4())
        conversation = Conversation(
            session_id=session_id,
            title=request.message[:50] + ("..." if len(request.message) > 50 else ""),
            model_used=request.model or settings.OLLAMA_DEFAULT_MODEL,
        )
        db.add(conversation)
        await db.flush()

    # Save user message
    user_msg = Message(
        conversation_id=conversation.id,
        role="user",
        content=request.message,
    )
    db.add(user_msg)

    # Build message history for context
    history_result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation.id)
        .order_by(Message.created_at)
        .limit(20)
    )
    history = history_result.scalars().all()

    messages = [
        ChatMessage(role="system", content=settings.OLLAMA_DEFAULT_MODEL and
            "You are NEO, a helpful and intelligent AI assistant. Be concise, helpful, and thoughtful."),
    ]
    for msg in history:
        messages.append(ChatMessage(role=msg.role, content=msg.content))

    # Get LLM response
    llm_response = await llm_service.chat(
        messages=messages,
        model=request.model or settings.OLLAMA_DEFAULT_MODEL,
    )

    # Save assistant response
    assistant_msg = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=llm_response["content"],
        model=llm_response["model"],
        tokens_used=llm_response.get("tokens"),
    )
    db.add(assistant_msg)

    # Update conversation
    conversation.updated_at = datetime.utcnow()
    if not conversation.model_used:
        conversation.model_used = llm_response["model"]

    await db.flush()
    logger.info(f"Chat: conversation={conversation.session_id}, tokens={llm_response.get('tokens')}")

    return ChatResponse(
        message=llm_response["content"],
        conversation_id=conversation.session_id,
        model=llm_response["model"],
        tokens_used=llm_response.get("tokens"),
    )


@router.get("/conversations", response_model=List[ConversationSummary])
async def list_conversations(
    limit: int = Query(50, le=200),
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    """List all conversations."""
    result = await db.execute(
        select(Conversation).order_by(desc(Conversation.updated_at)).limit(limit).offset(offset)
    )
    conversations = result.scalars().all()

    summaries = []
    for conv in conversations:
        count_result = await db.execute(
            select(func.count(Message.id)).where(Message.conversation_id == conv.id)
        )
        msg_count = count_result.scalar() or 0
        summaries.append(ConversationSummary(
            session_id=conv.session_id,
            title=conv.title,
            model_used=conv.model_used,
            created_at=conv.created_at,
            updated_at=conv.updated_at,
            is_pinned=conv.is_pinned,
            message_count=msg_count,
        ))

    return summaries


@router.get("/conversations/{session_id}/messages", response_model=List[MessageOut])
async def get_conversation_messages(
    session_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get all messages in a conversation."""
    result = await db.execute(
        select(Conversation).where(Conversation.session_id == session_id)
    )
    conversation = result.scalar_one_or_none()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    msgs_result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation.id)
        .order_by(Message.created_at)
    )
    messages = msgs_result.scalars().all()

    return [
        MessageOut(
            id=m.id,
            role=m.role,
            content=m.content,
            model=m.model,
            tokens_used=m.tokens_used,
            created_at=m.created_at,
        )
        for m in messages
    ]


@router.delete("/conversations/{session_id}")
async def delete_conversation(session_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a conversation and all its messages."""
    result = await db.execute(
        select(Conversation).where(Conversation.session_id == session_id)
    )
    conversation = result.scalar_one_or_none()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    await db.delete(conversation)
    return {"message": "Conversation deleted"}


@router.patch("/conversations/{session_id}/pin")
async def pin_conversation(
    session_id: str,
    pinned: bool = True,
    db: AsyncSession = Depends(get_db),
):
    """Pin or unpin a conversation."""
    result = await db.execute(
        select(Conversation).where(Conversation.session_id == session_id)
    )
    conversation = result.scalar_one_or_none()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    conversation.is_pinned = pinned
    return {"session_id": session_id, "is_pinned": pinned}
