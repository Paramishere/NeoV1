/**
 * ChatInput — Message input with microphone and send buttons.
 */
import { useState, useRef, KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import { Send, Mic, MicOff, Paperclip } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({ onSend, disabled = false, placeholder = 'Message NEO...' }: ChatInputProps) {
  const [input, setInput] = useState('')
  const [isMicOn, setIsMicOn] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setInput('')
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`
    }
  }

  return (
    <div
      className="flex items-end gap-3 p-4 rounded-neo-xl"
      style={{
        background: 'rgba(4, 20, 40, 0.8)',
        border: '1px solid rgba(0, 212, 255, 0.15)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 0 0 1px rgba(0, 212, 255, 0.05), 0 8px 32px rgba(0,0,0,0.3)',
      }}
    >
      {/* Attach button */}
      <button
        className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 mb-0.5"
        style={{ color: 'rgba(100, 116, 139, 0.5)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'rgba(0, 212, 255, 0.7)'
          e.currentTarget.style.background = 'rgba(0, 212, 255, 0.06)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'rgba(100, 116, 139, 0.5)'
          e.currentTarget.style.background = 'transparent'
        }}
      >
        <Paperclip size={16} />
      </button>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="flex-1 bg-transparent text-sm resize-none overflow-hidden focus:outline-none"
        style={{
          color: '#e2e8f0',
          caretColor: '#00d4ff',
          lineHeight: '1.5',
          maxHeight: '160px',
          minHeight: '24px',
        }}
      />

      {/* Mic button */}
      <motion.button
        onClick={() => setIsMicOn(!isMicOn)}
        className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 mb-0.5"
        style={{
          background: isMicOn ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0, 212, 255, 0.06)',
          color: isMicOn ? '#ef4444' : 'rgba(0, 212, 255, 0.6)',
          border: isMicOn ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(0, 212, 255, 0.1)',
        }}
        whileTap={{ scale: 0.9 }}
        animate={isMicOn ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {isMicOn ? <MicOff size={16} /> : <Mic size={16} />}
      </motion.button>

      {/* Send button */}
      <motion.button
        onClick={handleSend}
        disabled={!input.trim() || disabled}
        className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 mb-0.5"
        style={{
          background:
            input.trim() && !disabled
              ? 'linear-gradient(135deg, #00d4ff, #2563eb)'
              : 'rgba(100, 116, 139, 0.1)',
          color:
            input.trim() && !disabled ? '#020810' : 'rgba(100, 116, 139, 0.3)',
          cursor: input.trim() && !disabled ? 'pointer' : 'not-allowed',
        }}
        whileTap={{ scale: 0.9 }}
      >
        <Send size={15} />
      </motion.button>
    </div>
  )
}
