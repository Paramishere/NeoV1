/**
 * ChatPage — Full chat interface with conversation list and message thread.
 */
import { useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Plus, Pin, MessageSquare } from 'lucide-react'
import { ChatInput } from '../components/chat/ChatInput'
import { ChatBubble, TypingIndicator } from '../components/chat/ChatBubble'
import { AICore } from '../components/chat/AICore'
import { useChat } from '../hooks/useChat'
import { useChatStore } from '../store'
import { chatApi } from '../services/api'
import { format } from 'date-fns'

export function ChatPage() {
  const { messages, sendMessage, isTyping } = useChat()
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    setConversations,
    setMessages,
    clearChat,
  } = useChatStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Load conversations
  useEffect(() => {
    chatApi.getConversations().then(setConversations).catch(console.error)
  }, [setConversations])

  // Load messages when conversation selected
  const selectConversation = async (sessionId: string) => {
    setActiveConversation(sessionId)
    try {
      const msgs = await chatApi.getMessages(sessionId)
      setMessages(msgs)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="flex h-full">
      {/* Conversation List */}
      <div
        className="w-56 border-r flex flex-col flex-shrink-0"
        style={{
          borderColor: 'rgba(0, 212, 255, 0.08)',
          background: 'rgba(2, 8, 16, 0.4)',
        }}
      >
        {/* New Chat button */}
        <div className="p-3 border-b" style={{ borderColor: 'rgba(0, 212, 255, 0.08)' }}>
          <button
            onClick={clearChat}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-neo text-sm font-medium transition-all duration-200"
            style={{
              background: 'rgba(0, 212, 255, 0.08)',
              border: '1px solid rgba(0, 212, 255, 0.15)',
              color: '#00d4ff',
            }}
          >
            <Plus size={15} />
            New Chat
          </button>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 && (
            <div className="p-4 text-center">
              <MessageSquare size={24} className="mx-auto mb-2" style={{ color: 'rgba(100, 116, 139, 0.3)' }} />
              <p className="text-xs" style={{ color: 'rgba(100, 116, 139, 0.5)' }}>
                No conversations yet
              </p>
            </div>
          )}
          {conversations.map((conv) => (
            <button
              key={conv.sessionId}
              onClick={() => selectConversation(conv.sessionId)}
              className="w-full text-left px-3 py-2.5 rounded-neo transition-all duration-200 group"
              style={{
                background:
                  activeConversationId === conv.sessionId
                    ? 'rgba(0, 212, 255, 0.08)'
                    : 'transparent',
                border: `1px solid ${
                  activeConversationId === conv.sessionId
                    ? 'rgba(0, 212, 255, 0.15)'
                    : 'transparent'
                }`,
              }}
            >
              <div className="flex items-start justify-between gap-1">
                <p
                  className="text-xs font-medium truncate flex-1"
                  style={{
                    color:
                      activeConversationId === conv.sessionId
                        ? '#00d4ff'
                        : '#94a3b8',
                  }}
                >
                  {conv.isPinned && <Pin size={10} className="inline mr-1" />}
                  {conv.title}
                </p>
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(100, 116, 139, 0.4)' }}>
                {format(new Date(conv.updatedAt), 'MMM d')} · {conv.messageCount} msgs
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-6">
              <AICore size="md" isThinking={isTyping} />
              <div className="text-center">
                <h2 className="text-lg font-display font-semibold mb-1" style={{ color: '#e2e8f0' }}>
                  How can I help you?
                </h2>
                <p className="text-sm" style={{ color: 'rgba(100, 116, 139, 0.6)' }}>
                  Start typing below to chat with NEO
                </p>
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <ChatBubble
              key={i}
              message={msg}
              isLast={i === messages.length - 1}
            />
          ))}
          <AnimatePresence>
            {isTyping && <TypingIndicator />}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(0, 212, 255, 0.06)' }}>
          <ChatInput
            onSend={sendMessage}
            disabled={isTyping}
            placeholder="Message NEO..."
          />
        </div>
      </div>
    </div>
  )
}
