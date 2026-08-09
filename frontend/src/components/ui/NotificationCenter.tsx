/**
 * NotificationCenter — Toast notifications displayed bottom-right.
 */
import { AnimatePresence, motion } from 'framer-motion'
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react'
import { useUIStore } from '../../store'
import type { Notification } from '../../types'

const ICONS = {
  success: <CheckCircle size={16} />,
  warning: <AlertTriangle size={16} />,
  error: <XCircle size={16} />,
  info: <Info size={16} />,
}

const COLORS = {
  success: { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.25)', text: '#10b981' },
  warning: { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.25)', text: '#f59e0b' },
  error: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.25)', text: '#ef4444' },
  info: { bg: 'rgba(0, 212, 255, 0.08)', border: 'rgba(0, 212, 255, 0.2)', text: '#00d4ff' },
}

function Toast({ notification }: { notification: Notification }) {
  const { removeNotification } = useUIStore()
  const colors = COLORS[notification.type]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.9 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex items-start gap-3 p-4 rounded-neo min-w-72 max-w-80 shadow-panel"
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        backdropFilter: 'blur(20px)',
      }}
    >
      <span style={{ color: colors.text }} className="mt-0.5 flex-shrink-0">
        {ICONS[notification.type]}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: '#e2e8f0' }}>
          {notification.title}
        </p>
        {notification.message && (
          <p className="text-xs mt-0.5" style={{ color: 'rgba(100, 116, 139, 0.8)' }}>
            {notification.message}
          </p>
        )}
      </div>
      <button
        onClick={() => removeNotification(notification.id)}
        className="flex-shrink-0 transition-colors"
        style={{ color: 'rgba(100, 116, 139, 0.5)' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#e2e8f0')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(100, 116, 139, 0.5)')}
      >
        <X size={14} />
      </button>
    </motion.div>
  )
}

export function NotificationCenter() {
  const { notifications } = useUIStore()

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {notifications.map((n) => (
          <Toast key={n.id} notification={n} />
        ))}
      </AnimatePresence>
    </div>
  )
}
