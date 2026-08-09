"""
NEO — Tasks Router
====================
Task management and automation endpoints.
"""
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from database.connection import get_db
from database.models import Task
from models.schemas import TaskCreate, TaskOut

router = APIRouter()


@router.post("/", response_model=TaskOut)
async def create_task(task_data: TaskCreate, db: AsyncSession = Depends(get_db)):
    """Create a new task."""
    task = Task(
        title=task_data.title,
        description=task_data.description,
        priority=task_data.priority,
        task_type=task_data.task_type,
        plugin_id=task_data.plugin_id,
        schedule_cron=task_data.schedule_cron,
    )
    db.add(task)
    await db.flush()
    return _task_to_out(task)


@router.get("/", response_model=List[TaskOut])
async def list_tasks(
    status: Optional[str] = None,
    limit: int = Query(50, le=200),
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    """List tasks with optional status filter."""
    stmt = select(Task).order_by(desc(Task.created_at)).limit(limit).offset(offset)
    if status:
        stmt = select(Task).where(Task.status == status).order_by(desc(Task.created_at))
    result = await db.execute(stmt)
    return [_task_to_out(t) for t in result.scalars().all()]


@router.get("/{task_id}", response_model=TaskOut)
async def get_task(task_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific task."""
    task = await db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return _task_to_out(task)


@router.patch("/{task_id}/status")
async def update_task_status(
    task_id: int,
    status: str,
    db: AsyncSession = Depends(get_db),
):
    """Update task status."""
    valid_statuses = {"pending", "running", "completed", "failed", "cancelled"}
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    task = await db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.status = status
    if status == "running":
        task.started_at = datetime.utcnow()
    elif status in {"completed", "failed", "cancelled"}:
        task.completed_at = datetime.utcnow()

    return {"id": task_id, "status": status}


@router.delete("/{task_id}")
async def delete_task(task_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a task."""
    task = await db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    await db.delete(task)
    return {"message": "Task deleted"}


def _task_to_out(task: Task) -> TaskOut:
    return TaskOut(
        id=task.id,
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        task_type=task.task_type,
        plugin_id=task.plugin_id,
        schedule_cron=task.schedule_cron,
        result=task.result,
        error=task.error,
        created_at=task.created_at,
        started_at=task.started_at,
        completed_at=task.completed_at,
    )
