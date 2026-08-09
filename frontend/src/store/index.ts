/**
 * NEO — Global App Store (Zustand)
 * Central state management for the entire application.
 */
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type {
  AppPage,
  Notification,
  SystemStatus,
  Conversation,
  ChatMessage,
} from '../types'

// ─── UI Store ─────────────────────────────────────────────────────────────────

interface UIState {
  currentPage: AppPage
  isSplashDone: boolean
  isLoading: boolean
  notifications: Notification[]
  sidebarCollapsed: boolean

  setPage: (page: AppPage) => void
  setSplashDone: (done: boolean) => void
  setLoading: (loading: boolean) => void
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      currentPage: 'home',
      isSplashDone: false,
      isLoading: false,
      notifications: [],
      sidebarCollapsed: false,

      setPage: (page) => set({ currentPage: page }),
      setSplashDone: (done) => set({ isSplashDone: done }),
      setLoading: (loading) => set({ isLoading: loading }),
      addNotification: (notification) => {
        const id = Math.random().toString(36).substr(2, 9)
        const fullNotification: Notification = { ...notification, id }
        set((state) => ({
          notifications: [...state.notifications, fullNotification],
        }))
        // Auto remove after duration
        const duration = notification.duration ?? 4000
        if (duration > 0) {
          setTimeout(() => get().removeNotification(id), duration)
        }
      },
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    { name: 'neo-ui' }
  )
)

// ─── System Store ─────────────────────────────────────────────────────────────

interface SystemState {
  status: SystemStatus | null
  backendOnline: boolean
  lastUpdated: number | null

  setStatus: (status: SystemStatus) => void
  setBackendOnline: (online: boolean) => void
}

export const useSystemStore = create<SystemState>()(
  devtools(
    (set) => ({
      status: null,
      backendOnline: false,
      lastUpdated: null,

      setStatus: (status) =>
        set({ status, backendOnline: true, lastUpdated: Date.now() }),
      setBackendOnline: (online) => set({ backendOnline: online }),
    }),
    { name: 'neo-system' }
  )
)

// ─── Chat Store ───────────────────────────────────────────────────────────────

interface ChatState {
  conversations: Conversation[]
  activeConversationId: string | null
  messages: ChatMessage[]
  isTyping: boolean
  selectedModel: string

  setConversations: (convs: Conversation[]) => void
  setActiveConversation: (id: string | null) => void
  setMessages: (messages: ChatMessage[]) => void
  addMessage: (message: ChatMessage) => void
  setTyping: (typing: boolean) => void
  setModel: (model: string) => void
  clearChat: () => void
}

export const useChatStore = create<ChatState>()(
  devtools(
    (set) => ({
      conversations: [],
      activeConversationId: null,
      messages: [],
      isTyping: false,
      selectedModel: 'llama3.2',

      setConversations: (conversations) => set({ conversations }),
      setActiveConversation: (id) =>
        set({ activeConversationId: id, messages: [] }),
      setMessages: (messages) => set({ messages }),
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      setTyping: (isTyping) => set({ isTyping }),
      setModel: (selectedModel) => set({ selectedModel }),
      clearChat: () =>
        set({ messages: [], activeConversationId: null }),
    }),
    { name: 'neo-chat' }
  )
)
