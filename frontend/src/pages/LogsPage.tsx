/**
 * LogsPage — Live application log viewer.
 */
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { FileText, RefreshCw, Trash2 } from 'lucide-react'
import { logsApi } from '../services/api'
import { useUIStore } from '../store'

const LEVELS = ['ALL', 'DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']

const LEVEL_COLORS: Record<string, string> = {
  DEBUG: '#64748b',
  INFO: '#00d4ff',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  CRITICAL: '#dc2626',
}

export function LogsPage() {
  const [logLines, setLogLines] = useState<string[]>([])
  const [level, setLevel] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const { addNotification } = useUIStore()

  const fetchLogs = async () => {
    try {
      const data = await logsApi.getFile(200)
      setLogLines(data.lines.map((l) => l.trim()).filter(Boolean))
    } catch {
      // Backend may not be ready
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(fetchLogs, 3000)
    return () => clearInterval(interval)
  }, [autoRefresh])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logLines])

  const handleClear = async () => {
    try {
      await logsApi.clear()
      setLogLines([])
      addNotification({ type: 'success', title: 'Logs cleared' })
    } catch {
      addNotification({ type: 'error', title: 'Failed to clear logs' })
    }
  }

  const filteredLines =
    level === 'ALL'
      ? logLines
      : logLines.filter((line) => line.includes(level))

  const getLevelFromLine = (line: string): string => {
    for (const l of ['CRITICAL', 'ERROR', 'WARNING', 'INFO', 'DEBUG']) {
      if (line.includes(l)) return l
    }
    return 'INFO'
  }

  return (
    <div className="flex flex-col h-full p-6 gap-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-shrink-0"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-neo flex items-center justify-center"
            style={{ background: 'rgba(0, 212, 255, 0.08)', color: '#64748b' }}
          >
            <FileText size={20} />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold" style={{ color: '#e2e8f0' }}>
              Logs
            </h1>
            <p className="text-sm" style={{ color: 'rgba(100, 116, 139, 0.6)' }}>
              {filteredLines.length} entries · {autoRefresh ? 'Live' : 'Paused'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="neo-btn flex items-center gap-2 text-xs"
            style={{ color: autoRefresh ? '#10b981' : 'rgba(100, 116, 139, 0.6)' }}
          >
            <RefreshCw size={12} className={autoRefresh ? 'animate-spin' : ''} />
            {autoRefresh ? 'Live' : 'Resume'}
          </button>
          <button
            onClick={fetchLogs}
            className="neo-btn flex items-center gap-2 text-xs"
          >
            <RefreshCw size={12} />
            Refresh
          </button>
          <button
            onClick={handleClear}
            className="neo-btn flex items-center gap-2 text-xs"
            style={{ color: 'rgba(239, 68, 68, 0.7)' }}
          >
            <Trash2 size={12} />
            Clear
          </button>
        </div>
      </motion.div>

      {/* Level filters */}
      <div className="flex gap-2 flex-shrink-0">
        {LEVELS.map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className="px-3 py-1 rounded text-xs font-mono transition-all duration-200"
            style={
              level === l
                ? {
                    background: `${LEVEL_COLORS[l] || '#00d4ff'}20`,
                    color: LEVEL_COLORS[l] || '#00d4ff',
                    border: `1px solid ${LEVEL_COLORS[l] || '#00d4ff'}40`,
                  }
                : {
                    background: 'rgba(255,255,255,0.03)',
                    color: 'rgba(100,116,139,0.5)',
                    border: '1px solid rgba(0,212,255,0.06)',
                  }
            }
          >
            {l}
          </button>
        ))}
      </div>

      {/* Log output */}
      <div
        className="flex-1 overflow-y-auto rounded-neo font-mono text-xs leading-relaxed p-4 space-y-0.5"
        style={{
          background: 'rgba(2, 8, 16, 0.9)',
          border: '1px solid rgba(0, 212, 255, 0.06)',
        }}
      >
        {loading ? (
          <p style={{ color: 'rgba(100, 116, 139, 0.5)' }}>Loading logs...</p>
        ) : filteredLines.length === 0 ? (
          <p style={{ color: 'rgba(100, 116, 139, 0.4)' }}>
            No log entries. Logs appear here when NEO is running.
          </p>
        ) : (
          filteredLines.map((line, i) => {
            const lvl = getLevelFromLine(line)
            const color = LEVEL_COLORS[lvl] || '#64748b'
            return (
              <div key={i} className="flex gap-3 hover:bg-white/[0.02] px-1 rounded">
                <span className="flex-shrink-0" style={{ color }}>
                  {lvl.padEnd(8)}
                </span>
                <span style={{ color: 'rgba(226, 232, 240, 0.7)', wordBreak: 'break-all' }}>
                  {line}
                </span>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
