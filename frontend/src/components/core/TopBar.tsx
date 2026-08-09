/**
 * TopBar — Window title bar with controls, time, and model info.
 * Draggable region for frameless window.
 */
import { useState, useEffect } from 'react'
import { Settings, Minimize2, Maximize2, X, Cpu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSystemStore } from '../../store'
import { format } from 'date-fns'

export function TopBar() {
  const [time, setTime] = useState(new Date())
  const { status } = useSystemStore()
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleMinimize = () => window.neo?.window.minimize()
  const handleMaximize = () => window.neo?.window.maximize()
  const handleClose = () => window.neo?.window.close()

  return (
    <div
      className="flex items-center justify-between h-12 px-4 border-b flex-shrink-0 drag"
      style={{
        borderColor: 'rgba(0, 212, 255, 0.08)',
        background: 'rgba(2, 8, 16, 0.8)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Left — NEO Logo */}
      <div className="flex items-center gap-3 no-drag">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle, rgba(0,212,255,0.3), rgba(2,8,16,0.9))',
            boxShadow: '0 0 12px rgba(0, 212, 255, 0.4)',
          }}
        >
          <span
            className="font-display font-bold text-xs"
            style={{ color: '#00d4ff' }}
          >
            N
          </span>
        </div>
        <span
          className="font-display font-semibold text-sm tracking-widest uppercase"
          style={{ color: '#00d4ff' }}
        >
          NEO
        </span>
        {status?.ollamaStatus === 'online' && (
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs"
            style={{
              background: 'rgba(0, 212, 255, 0.06)',
              border: '1px solid rgba(0, 212, 255, 0.15)',
              color: 'rgba(0, 212, 255, 0.7)',
            }}
          >
            <Cpu size={10} />
            <span className="font-mono">{status?.ollamaModel}</span>
          </div>
        )}
      </div>

      {/* Center — Time */}
      <div className="absolute left-1/2 -translate-x-1/2 text-center">
        <p
          className="font-mono text-sm font-medium"
          style={{ color: 'rgba(0, 212, 255, 0.8)' }}
        >
          {format(time, 'HH:mm:ss')}
        </p>
        <p className="font-mono text-xs" style={{ color: 'rgba(100, 116, 139, 0.6)' }}>
          {format(time, 'EEE, MMM d')}
        </p>
      </div>

      {/* Right — Controls */}
      <div className="flex items-center gap-2 no-drag">
        <button
          onClick={() => navigate('/settings')}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
          style={{ color: 'rgba(100, 116, 139, 0.7)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#00d4ff'
            e.currentTarget.style.background = 'rgba(0, 212, 255, 0.08)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(100, 116, 139, 0.7)'
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <Settings size={15} />
        </button>

        {/* Window controls */}
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={handleMinimize}
            className="w-7 h-7 rounded-md flex items-center justify-center transition-all duration-150"
            style={{ color: 'rgba(100, 116, 139, 0.5)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(245, 158, 11, 0.15)'
              e.currentTarget.style.color = '#f59e0b'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'rgba(100, 116, 139, 0.5)'
            }}
          >
            <Minimize2 size={12} />
          </button>
          <button
            onClick={handleMaximize}
            className="w-7 h-7 rounded-md flex items-center justify-center transition-all duration-150"
            style={{ color: 'rgba(100, 116, 139, 0.5)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)'
              e.currentTarget.style.color = '#00d4ff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'rgba(100, 116, 139, 0.5)'
            }}
          >
            <Maximize2 size={12} />
          </button>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-md flex items-center justify-center transition-all duration-150"
            style={{ color: 'rgba(100, 116, 139, 0.5)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'
              e.currentTarget.style.color = '#ef4444'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'rgba(100, 116, 139, 0.5)'
            }}
          >
            <X size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}
