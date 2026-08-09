/**
 * HomePage — NEO dashboard with animated AI Core and quick stats.
 */
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, Brain, Puzzle, Zap, ArrowRight } from 'lucide-react'
import { AICore } from '../components/chat/AICore'
import { useSystemStore } from '../store'
import { useChatStore } from '../store'
import { format } from 'date-fns'

const QUICK_ACTIONS = [
  { icon: MessageSquare, label: 'New Chat', desc: 'Start a conversation', path: '/chat', color: '#00d4ff' },
  { icon: Brain, label: 'Memory', desc: 'View stored knowledge', path: '/memory', color: '#7c3aed' },
  { icon: Puzzle, label: 'Plugins', desc: 'Extend NEO capabilities', path: '/plugins', color: '#2563eb' },
  { icon: Zap, label: 'Automation', desc: 'Create workflows', path: '/automation', color: '#f59e0b' },
]

export function HomePage() {
  const navigate = useNavigate()
  const { status, backendOnline } = useSystemStore()
  const { conversations } = useChatStore()
  const now = new Date()

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-8 gap-12">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, rgba(0,212,255,0.04) 0%, transparent 60%)',
        }}
      />

      {/* Greeting */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <p className="text-sm font-mono mb-1" style={{ color: 'rgba(100, 116, 139, 0.6)' }}>
          {format(now, 'EEEE, MMMM d · HH:mm')}
        </p>
        <h1
          className="font-display text-4xl font-bold tracking-tight"
          style={{ color: '#e2e8f0' }}
        >
          Good {getGreeting()},{' '}
          <span className="neo-text-gradient">NEO</span>
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'rgba(100, 116, 139, 0.7)' }}>
          {backendOnline
            ? status?.ollamaStatus === 'online'
              ? `🟢 Connected to ${status.ollamaModel} · All systems operational`
              : '🟡 Backend running · AI model offline — launch Ollama to chat'
            : '🔴 Backend offline — run npm run dev to start'}
        </p>
      </motion.div>

      {/* AI Core */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
      >
        <AICore size="lg" onClick={() => navigate('/chat')} />
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        className="grid grid-cols-2 gap-4 w-full max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        {QUICK_ACTIONS.map(({ icon: Icon, label, desc, path, color }) => (
          <motion.button
            key={path}
            onClick={() => navigate(path)}
            className="neo-glass p-4 text-left group transition-all duration-200"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            style={{ cursor: 'pointer' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${color}30`
              e.currentTarget.style.boxShadow = `0 0 20px ${color}10`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.1)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${color}15`, color }}
              >
                <Icon size={16} />
              </div>
              <ArrowRight
                size={14}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color }}
              />
            </div>
            <p className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>
              {label}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(100, 116, 139, 0.6)' }}>
              {desc}
            </p>
          </motion.button>
        ))}
      </motion.div>

      {/* Stats row */}
      <motion.div
        className="flex items-center gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Stat label="Conversations" value={conversations.length.toString()} />
        <div className="w-px h-8" style={{ background: 'rgba(0, 212, 255, 0.1)' }} />
        <Stat label="CPU" value={`${status?.cpuPercent.toFixed(0) ?? '—'}%`} />
        <div className="w-px h-8" style={{ background: 'rgba(0, 212, 255, 0.1)' }} />
        <Stat label="RAM" value={`${status?.ramPercent.toFixed(0) ?? '—'}%`} />
        <div className="w-px h-8" style={{ background: 'rgba(0, 212, 255, 0.1)' }} />
        <Stat
          label="Models"
          value={(status?.availableModels.length ?? 0).toString()}
        />
      </motion.div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="font-mono text-lg font-semibold" style={{ color: '#00d4ff' }}>
        {value}
      </p>
      <p className="text-xs" style={{ color: 'rgba(100, 116, 139, 0.5)' }}>
        {label}
      </p>
    </div>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Morning'
  if (hour < 17) return 'Afternoon'
  return 'Evening'
}
