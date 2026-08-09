/**
 * Sidebar — Left navigation panel.
 */
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home,
  MessageSquare,
  Brain,
  Puzzle,
  Zap,
  CheckSquare,
  Settings,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useUIStore } from '../../store'
import { clsx } from 'clsx'

const NAV_ITEMS = [
  { icon: Home, label: 'Home', path: '/home' },
  { icon: MessageSquare, label: 'Chat', path: '/chat' },
  { icon: Brain, label: 'Memory', path: '/memory' },
  { icon: Puzzle, label: 'Plugins', path: '/plugins' },
  { icon: Zap, label: 'Automation', path: '/automation' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
] as const

const BOTTOM_ITEMS = [
  { icon: FileText, label: 'Logs', path: '/logs' },
  { icon: Settings, label: 'Settings', path: '/settings' },
] as const

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  const isActive = (path: string) => location.pathname === path

  return (
    <motion.div
      className="flex flex-col border-r flex-shrink-0 relative"
      style={{
        borderColor: 'rgba(0, 212, 255, 0.08)',
        background: 'rgba(2, 8, 16, 0.6)',
        backdropFilter: 'blur(20px)',
      }}
      animate={{ width: sidebarCollapsed ? 64 : 200 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full flex items-center justify-center z-10 transition-all duration-200"
        style={{
          background: '#020810',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          color: 'rgba(0, 212, 255, 0.5)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#00d4ff'
          e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.5)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'rgba(0, 212, 255, 0.5)'
          e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.2)'
        }}
      >
        {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Main nav */}
      <nav className="flex-1 p-3 space-y-1 pt-6">
        {NAV_ITEMS.map(({ icon: Icon, label, path }) => (
          <NavItem
            key={path}
            icon={<Icon size={17} />}
            label={label}
            active={isActive(path)}
            collapsed={sidebarCollapsed}
            onClick={() => navigate(path)}
          />
        ))}
      </nav>

      {/* Divider */}
      <div className="neo-divider mx-3" />

      {/* Bottom nav */}
      <nav className="p-3 space-y-1 pb-4">
        {BOTTOM_ITEMS.map(({ icon: Icon, label, path }) => (
          <NavItem
            key={path}
            icon={<Icon size={17} />}
            label={label}
            active={isActive(path)}
            collapsed={sidebarCollapsed}
            onClick={() => navigate(path)}
          />
        ))}
      </nav>

      {/* NEO version */}
      {!sidebarCollapsed && (
        <motion.div
          className="px-4 pb-3 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <span className="text-xs font-mono" style={{ color: 'rgba(100, 116, 139, 0.3)' }}>
            v1.0.0
          </span>
        </motion.div>
      )}
    </motion.div>
  )
}

interface NavItemProps {
  icon: React.ReactNode
  label: string
  active: boolean
  collapsed: boolean
  onClick: () => void
}

function NavItem({ icon, label, active, collapsed, onClick }: NavItemProps) {
  return (
    <motion.button
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-3 px-2.5 py-2.5 rounded-neo text-sm font-medium transition-colors duration-200 overflow-hidden',
        active ? 'text-[#00d4ff]' : 'text-[#64748b] hover:text-[#94a3b8]'
      )}
      style={
        active
          ? {
              background: 'rgba(0, 212, 255, 0.08)',
              border: '1px solid rgba(0, 212, 255, 0.15)',
            }
          : {
              border: '1px solid transparent',
            }
      }
      whileHover={!active ? { backgroundColor: 'rgba(0, 212, 255, 0.04)' } : {}}
      whileTap={{ scale: 0.97 }}
    >
      <span className="flex-shrink-0">{icon}</span>
      {!collapsed && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          className="truncate"
        >
          {label}
        </motion.span>
      )}
      {active && !collapsed && (
        <motion.div
          className="ml-auto w-1 h-4 rounded-full"
          style={{ background: '#00d4ff', boxShadow: '0 0 6px rgba(0, 212, 255, 0.8)' }}
          layoutId="nav-indicator"
        />
      )}
    </motion.button>
  )
}
