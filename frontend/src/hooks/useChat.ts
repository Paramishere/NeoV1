/**
 * useChat — handles sending messages and managing conversation state.
 */
import { useCallback } from 'react'
import { chatApi } from '../services/api'
import { useChatStore } from '../store'
import { useUIStore } from '../store'

export function useChat() {
  const { messages, addMessage, setTyping, activeConversationId, setActiveConversation, selectedModel } =
    useChatStore()
  const { addNotification } = useUIStore()

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return

      // Add user message immediately
      addMessage({ role: 'user', content, createdAt: new Date().toISOString() })
      setTyping(true)

      try {
        const response = await chatApi.send(content, activeConversationId ?? undefined, selectedModel)

        // Set conversation ID from first response
        if (!activeConversationId) {
          setActiveConversation(response.conversationId)
        }

        // Add assistant response
        addMessage({
          role: 'assistant',
          content: response.message,
          model: response.model,
          tokensUsed: response.tokensUsed,
          createdAt: response.createdAt,
        })
      } catch (error) {
        addMessage({
          role: 'assistant',
          content: '⚠️ Failed to connect to NEO backend. Make sure the server is running.',
          createdAt: new Date().toISOString(),
        })
        addNotification({
          type: 'error',
          title: 'Connection Error',
          message: 'Could not reach NEO backend',
        })
      } finally {
        setTyping(false)
      }
    },
    [addMessage, setTyping, activeConversationId, setActiveConversation, selectedModel, addNotification]
  )

  return { messages, sendMessage, isTyping: useChatStore((s) => s.isTyping) }
}
