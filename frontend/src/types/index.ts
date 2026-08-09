// ─── Core Types ───────────────────────────────────────────────────────────────

export interface ChatMessage {
  id?: number
  role: 'user' | 'assistant' | 'system'
  content: string
  model?: string
  tokensUsed?: number
  createdAt?: string
}

export interface Conversation {
  sessionId: string
  title: string
  modelUsed?: string
  createdAt: string
  updatedAt: string
  isPinned: boolean
  messageCount: number
}

export interface ChatResponse {
  message: string
  role: string
  conversationId: string
  model: string
  tokensUsed?: number
  createdAt: string
}

// ─── System ───────────────────────────────────────────────────────────────────

export interface SystemStatus {
  cpuPercent: number
  ramPercent: number
  ramUsedGb: number
  ramTotalGb: number
  diskPercent: number
  diskUsedGb: number
  diskTotalGb: number
  ollamaStatus: 'online' | 'offline' | 'checking'
  ollamaModel?: string
  availableModels: string[]
  voiceStatus: 'ready' | 'unavailable' | 'loading'
  backendVersion: string
  uptimeSeconds: number
}

export interface IntegrationStatus {
  name: string
  status: 'active' | 'inactive' | 'missing_key' | 'error' | 'ready' | 'unavailable'
  message: string
}

// ─── Memory ───────────────────────────────────────────────────────────────────

export interface MemoryEntry {
  id: number
  category: string
  key: string
  value: string
  importance: number
  isPinned: boolean
  source?: string
  createdAt: string
  tags: string[]
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export interface Setting {
  key: string
  value: string
  valueType: 'string' | 'int' | 'float' | 'bool' | 'json'
  category: string
  description?: string
  updatedAt: string
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export interface Task {
  id: number
  title: string
  description?: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  priority: number
  taskType: string
  pluginId?: string
  scheduleCron?: string
  result?: unknown
  error?: string
  createdAt: string
  startedAt?: string
  completedAt?: string
}

// ─── Plugins ──────────────────────────────────────────────────────────────────

export interface Plugin {
  pluginId: string
  name: string
  version: string
  description?: string
  author?: string
  isEnabled: boolean
  isLoaded: boolean
  capabilities: string[]
  createdAt: string
}

// ─── Logs ────────────────────────────────────────────────────────────────────

export interface LogEntry {
  id: number
  level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
  source: string
  message: string
  details?: unknown
  createdAt: string
}

// ─── UI State ─────────────────────────────────────────────────────────────────

export type AppPage =
  | 'home'
  | 'chat'
  | 'memory'
  | 'plugins'
  | 'automation'
  | 'tasks'
  | 'settings'
  | 'logs'

export type NeoTheme = 'dark' | 'light'

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message?: string
  duration?: number
}

// ─── Electron Bridge ─────────────────────────────────────────────────────────

export interface NeoElectronBridge {
  window: {
    minimize: () => void
    maximize: () => void
    close: () => void
    isMaximized: () => Promise<boolean>
  }
  backend: {
    isRunning: () => Promise<boolean>
    port: () => Promise<number>
  }
  app: {
    version: () => Promise<string>
    path: () => Promise<string>
    platform: () => Promise<string>
  }
}

declare global {
  interface Window {
    neo?: NeoElectronBridge
  }
}
