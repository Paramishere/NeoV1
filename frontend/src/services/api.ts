/**
 * NEO API Client
 * Centralized Axios instance with interceptors for all backend communication.
 */
import axios, { AxiosInstance, AxiosResponse } from 'axios'
import type {
  ChatResponse,
  Conversation,
  ChatMessage,
  SystemStatus,
  IntegrationStatus,
  MemoryEntry,
  Setting,
  Task,
  Plugin,
  LogEntry,
} from '../types'

const BACKEND_PORT = 8765
const BASE_URL = `http://127.0.0.1:${BACKEND_PORT}/api`

// Create Axios instance
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — normalize snake_case to camelCase
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.error ||
      error.message ||
      'Unknown error'
    console.error(`[NEO API] Error: ${message}`)
    return Promise.reject(new Error(message))
  }
)

// ─── Chat API ─────────────────────────────────────────────────────────────────

export const chatApi = {
  send: async (message: string, conversationId?: string, model?: string): Promise<ChatResponse> => {
    const { data } = await api.post('/chat/send', {
      message,
      conversation_id: conversationId,
      model,
    })
    return {
      message: data.message,
      role: data.role,
      conversationId: data.conversation_id,
      model: data.model,
      tokensUsed: data.tokens_used,
      createdAt: data.created_at,
    }
  },

  getConversations: async (): Promise<Conversation[]> => {
    const { data } = await api.get('/chat/conversations')
    return data.map((c: Record<string, unknown>) => ({
      sessionId: c.session_id,
      title: c.title,
      modelUsed: c.model_used,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
      isPinned: c.is_pinned,
      messageCount: c.message_count,
    }))
  },

  getMessages: async (sessionId: string): Promise<ChatMessage[]> => {
    const { data } = await api.get(`/chat/conversations/${sessionId}/messages`)
    return data.map((m: Record<string, unknown>) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      model: m.model,
      tokensUsed: m.tokens_used,
      createdAt: m.created_at,
    }))
  },

  deleteConversation: async (sessionId: string): Promise<void> => {
    await api.delete(`/chat/conversations/${sessionId}`)
  },

  pinConversation: async (sessionId: string, pinned: boolean): Promise<void> => {
    await api.patch(`/chat/conversations/${sessionId}/pin`, null, {
      params: { pinned },
    })
  },
}

// ─── System API ───────────────────────────────────────────────────────────────

export const systemApi = {
  getStatus: async (): Promise<SystemStatus> => {
    const { data } = await api.get('/system/status')
    return {
      cpuPercent: data.cpu_percent,
      ramPercent: data.ram_percent,
      ramUsedGb: data.ram_used_gb,
      ramTotalGb: data.ram_total_gb,
      diskPercent: data.disk_percent,
      diskUsedGb: data.disk_used_gb,
      diskTotalGb: data.disk_total_gb,
      ollamaStatus: data.ollama_status,
      ollamaModel: data.ollama_model,
      availableModels: data.available_models,
      voiceStatus: data.voice_status,
      backendVersion: data.backend_version,
      uptimeSeconds: data.uptime_seconds,
    }
  },

  getIntegrations: async (): Promise<IntegrationStatus[]> => {
    const { data } = await api.get('/system/integrations')
    return data
  },

  health: async (): Promise<{ status: string; version: string }> => {
    const { data } = await api.get('/health')
    return data
  },
}

// ─── Memory API ───────────────────────────────────────────────────────────────

export const memoryApi = {
  getAll: async (category?: string, pinnedOnly?: boolean): Promise<MemoryEntry[]> => {
    const { data } = await api.get('/memory/', { params: { category, pinned_only: pinnedOnly } })
    return data.map((e: Record<string, unknown>) => ({
      id: e.id,
      category: e.category,
      key: e.key,
      value: e.value,
      importance: e.importance,
      isPinned: e.is_pinned,
      source: e.source,
      createdAt: e.created_at,
      tags: e.tags || [],
    }))
  },

  search: async (query: string): Promise<MemoryEntry[]> => {
    const { data } = await api.get('/memory/search', { params: { q: query } })
    return data.map((e: Record<string, unknown>) => ({
      id: e.id,
      category: e.category,
      key: e.key,
      value: e.value,
      importance: e.importance,
      isPinned: e.is_pinned,
      source: e.source,
      createdAt: e.created_at,
      tags: e.tags || [],
    }))
  },

  create: async (key: string, value: string, category: string): Promise<MemoryEntry> => {
    const { data } = await api.post('/memory/', { key, value, category })
    return data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/memory/${id}`)
  },

  pin: async (id: number, pinned: boolean): Promise<void> => {
    await api.patch(`/memory/${id}/pin`, null, { params: { pinned } })
  },
}

// ─── Settings API ─────────────────────────────────────────────────────────────

export const settingsApi = {
  getAll: async (category?: string): Promise<Setting[]> => {
    const { data } = await api.get('/settings/', { params: { category } })
    return data.map((s: Record<string, unknown>) => ({
      key: s.key,
      value: s.value,
      valueType: s.value_type,
      category: s.category,
      description: s.description,
      updatedAt: s.updated_at,
    }))
  },

  update: async (key: string, value: string): Promise<void> => {
    await api.put(`/settings/${key}`, { value })
  },

  bulkUpdate: async (settings: Record<string, string>): Promise<void> => {
    await api.put('/settings/bulk/update', { settings })
  },
}

// ─── Tasks API ────────────────────────────────────────────────────────────────

export const tasksApi = {
  getAll: async (status?: string): Promise<Task[]> => {
    const { data } = await api.get('/tasks/', { params: { status } })
    return data.map((t: Record<string, unknown>) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      taskType: t.task_type,
      pluginId: t.plugin_id,
      scheduleCron: t.schedule_cron,
      result: t.result,
      error: t.error,
      createdAt: t.created_at,
      startedAt: t.started_at,
      completedAt: t.completed_at,
    }))
  },

  create: async (title: string, description?: string, priority?: number): Promise<Task> => {
    const { data } = await api.post('/tasks/', { title, description, priority })
    return data
  },

  updateStatus: async (id: number, status: string): Promise<void> => {
    await api.patch(`/tasks/${id}/status`, null, { params: { status } })
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`)
  },
}

// ─── Plugins API ──────────────────────────────────────────────────────────────

export const pluginsApi = {
  getAll: async (): Promise<Plugin[]> => {
    const { data } = await api.get('/plugins/')
    return data.map((p: Record<string, unknown>) => ({
      pluginId: p.plugin_id,
      name: p.name,
      version: p.version,
      description: p.description,
      author: p.author,
      isEnabled: p.is_enabled,
      isLoaded: p.is_loaded,
      capabilities: p.capabilities || [],
      createdAt: p.created_at,
    }))
  },

  toggle: async (pluginId: string, isEnabled: boolean): Promise<void> => {
    await api.patch(`/plugins/${pluginId}/toggle`, { is_enabled: isEnabled })
  },

  reload: async (): Promise<{ loaded: number }> => {
    const { data } = await api.post('/plugins/reload')
    return data
  },
}

// ─── Logs API ─────────────────────────────────────────────────────────────────

export const logsApi = {
  getAll: async (level?: string, limit?: number): Promise<LogEntry[]> => {
    const { data } = await api.get('/logs/', { params: { level, limit } })
    return data.map((l: Record<string, unknown>) => ({
      id: l.id,
      level: l.level,
      source: l.source,
      message: l.message,
      details: l.details,
      createdAt: l.created_at,
    }))
  },

  getFile: async (lines?: number): Promise<{ lines: string[]; totalLines: number }> => {
    const { data } = await api.get('/logs/file', { params: { lines } })
    return { lines: data.lines, totalLines: data.total_lines }
  },

  clear: async (): Promise<void> => {
    await api.delete('/logs/clear')
  },
}

export default api
