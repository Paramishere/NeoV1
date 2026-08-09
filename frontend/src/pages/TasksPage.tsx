/**
 * TasksPage — Task management with priority and status tracking.
 */
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckSquare, Plus, Trash2, Circle, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { tasksApi } from '../services/api'
import type { Task } from '../types'
import { useUIStore } from '../store'
import { format } from 'date-fns'

const STATUS_CONFIG = {
  pending: { icon: Circle, color: '#64748b', label: 'Pending' },
  running: { icon: Clock, color: '#f59e0b', label: 'Running' },
  completed: { icon: CheckCircle2, color: '#10b981', label: 'Done' },
  failed: { icon: AlertCircle, color: '#ef4444', label: 'Failed' },
  cancelled: { icon: Circle, color: '#334155', label: 'Cancelled' },
}

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const { addNotification } = useUIStore()

  const fetchTasks = async () => {
    try {
      const data = await tasksApi.getAll()
      setTasks(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTasks() }, [])

  const handleCreate = async () => {
    if (!newTitle.trim()) return
    try {
      await tasksApi.create(newTitle.trim())
      setNewTitle('')
      setShowCreate(false)
      await fetchTasks()
      addNotification({ type: 'success', title: 'Task created' })
    } catch {
      addNotification({ type: 'error', title: 'Failed to create task' })
    }
  }

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await tasksApi.updateStatus(id, status)
      setTasks((t) => t.map((task) => (task.id === id ? { ...task, status: status as Task['status'] } : task)))
    } catch {
      addNotification({ type: 'error', title: 'Failed to update task' })
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await tasksApi.delete(id)
      setTasks((t) => t.filter((task) => task.id !== id))
    } catch {
      addNotification({ type: 'error', title: 'Failed to delete task' })
    }
  }

  const filteredTasks = filterStatus === 'all'
    ? tasks
    : tasks.filter((t) => t.status === filterStatus)

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-neo flex items-center justify-center"
            style={{ background: 'rgba(0, 212, 255, 0.1)', color: '#00d4ff' }}
          >
            <CheckSquare size={20} />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold" style={{ color: '#e2e8f0' }}>
              Tasks
            </h1>
            <p className="text-sm" style={{ color: 'rgba(100, 116, 139, 0.6)' }}>
              {tasks.filter((t) => t.status === 'pending').length} pending · {tasks.filter((t) => t.status === 'completed').length} completed
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="neo-btn flex items-center gap-2"
        >
          <Plus size={14} />
          New Task
        </button>
      </motion.div>

      {/* Create task */}
      {showCreate && (
        <motion.div
          className="neo-glass p-4 flex gap-3"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Task title..."
            autoFocus
            className="neo-input flex-1 text-sm"
          />
          <button onClick={handleCreate} className="neo-btn-primary px-4 text-sm">
            Create
          </button>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'pending', 'running', 'completed', 'failed'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className="px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all duration-200"
            style={
              filterStatus === s
                ? { background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)', color: '#00d4ff' }
                : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,212,255,0.06)', color: 'rgba(100,116,139,0.7)' }
            }
          >
            {s}
          </button>
        ))}
      </div>

      {/* Tasks list */}
      {loading ? (
        <div className="text-center py-12" style={{ color: 'rgba(100, 116, 139, 0.5)' }}>
          Loading tasks...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <CheckSquare size={40} style={{ color: 'rgba(100, 116, 139, 0.2)' }} />
          <p className="text-sm" style={{ color: 'rgba(100, 116, 139, 0.5)' }}>
            No tasks found
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => {
            const cfg = STATUS_CONFIG[task.status]
            const Icon = cfg.icon
            return (
              <motion.div
                key={task.id}
                className="neo-glass p-4 flex items-center gap-4 group"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <button
                  onClick={() =>
                    handleUpdateStatus(task.id, task.status === 'pending' ? 'completed' : 'pending')
                  }
                  className="flex-shrink-0 transition-colors"
                  style={{ color: cfg.color }}
                >
                  <Icon size={18} />
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium"
                    style={{
                      color: task.status === 'completed' ? 'rgba(100,116,139,0.5)' : '#e2e8f0',
                      textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                    }}
                  >
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(100,116,139,0.5)' }}>
                      {task.description}
                    </p>
                  )}
                  <p className="text-xs mt-1" style={{ color: 'rgba(100,116,139,0.35)' }}>
                    {format(new Date(task.createdAt), 'MMM d, HH:mm')} · Priority {task.priority}
                  </p>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{
                    background: `${cfg.color}15`,
                    color: cfg.color,
                    border: `1px solid ${cfg.color}30`,
                  }}
                >
                  {cfg.label}
                </span>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded"
                  style={{ color: 'rgba(100,116,139,0.4)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(100,116,139,0.4)')}
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
