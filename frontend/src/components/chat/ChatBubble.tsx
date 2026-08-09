/**
 * ChatBubble — Individual message bubble.
 */
import { motion } from 'framer-motion'
import type { ChatMessage } from '../../types'
import { format } from 'date-fns'

interface ChatBubbleProps {
  message: ChatMessage
  isLast?: boolean
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {/* Avatar */}
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mt-1"
        style={
          isUser
            ? {
                background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                color: '#fff',
              }
            : {
                background: 'radial-gradient(circle, rgba(0,212,255,0.3), rgba(2,8,16,0.9))',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                color: '#00d4ff',
                boxShadow: '0 0 12px rgba(0, 212, 255, 0.2)',
              }
        }
      >
        {isUser ? 'U' : 'N'}
      </div>

      {/* Bubble */}
      <div className={`flex flex-col gap-1 max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className="px-4 py-3 rounded-neo text-sm leading-relaxed"
          style={
            isUser
              ? {
                  background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(37,99,235,0.2))',
                  border: '1px solid rgba(124, 58, 237, 0.25)',
                  color: '#e2e8f0',
                }
              : {
                  background: 'rgba(4, 20, 40, 0.7)',
                  border: '1px solid rgba(0, 212, 255, 0.1)',
                  color: '#e2e8f0',
                }
          }
        >
          <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {message.content}
          </p>
        </div>
        {/* Metadata */}
        <div className="flex items-center gap-2 px-1">
          {message.createdAt && (
            <span className="text-xs" style={{ color: 'rgba(100, 116, 139, 0.4)' }}>
              {format(new Date(message.createdAt), 'HH:mm')}
            </span>
          )}
          {message.tokensUsed && (
            <span className="text-xs font-mono" style={{ color: 'rgba(100, 116, 139, 0.3)' }}>
              {message.tokensUsed} tokens
            </span>
          )}
          {message.model && (
            <span className="text-xs font-mono" style={{ color: 'rgba(0, 212, 255, 0.3)' }}>
              {message.model}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/**
 * TypingIndicator — Animated dots shown when NEO is thinking.
 */
export function TypingIndicator() {
  return (
    <motion.div
      className="flex gap-3"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
        style={{
          background: 'radial-gradient(circle, rgba(0,212,255,0.3), rgba(2,8,16,0.9))',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          color: '#00d4ff',
          boxShadow: '0 0 12px rgba(0, 212, 255, 0.2)',
        }}
      >
        N
      </div>
      <div
        className="flex items-center gap-1.5 px-4 py-3 rounded-neo"
        style={{
          background: 'rgba(4, 20, 40, 0.7)',
          border: '1px solid rgba(0, 212, 255, 0.1)',
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#00d4ff' }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}
