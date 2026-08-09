/**
 * MemoryPage — Long-term memory management UI.
 */
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, Search, Pin, Trash2, Tag } from 'lucide-react'
import { memoryApi } from '../services/api'
import type { MemoryEntry } from '../types'
import { useUIStore } from '../store'

const CATEGORIES = ['All', 'preference', 'fact', 'context', 'pinned', 'general']

export function MemoryPage() {
  const [memories, setMemories] = useState<MemoryEntry[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const { addNotification } = useUIStore()

  const fetchMemory = async () => {
    try {
      setLoading(true)
      const cat = category === 'All' ? undefined : category === 'pinned' ? undefined : category
      const pinnedOnly = category === 'pinned'
      const data = query
        ? await memoryApi.search(query)
        : await memoryApi.getAll(cat, pinnedOnly)
      setMemories(data)
    } catch {
      addNotification({ type: 'error', title: 'Failed to load memory' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMemory() }, [category])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchMemory()
  }

  const handleDelete = async (id: number) => {
    try {
      await memoryApi.delete(id)
      setMemories((m) => m.filter((e) => e.id !== id))
      addNotification({ type: 'success', title: 'Memory deleted' })
    } catch {
      addNotification({ type: 'error', title: 'Failed to delete' })
    }
  }

  const handlePin = async (id: number, pinned: boolean) => {
    try {
      await memoryApi.pin(id, !pinned)
      setMemories((m) => m.map((e) => (e.id === id ? { ...e, isPinned: !pinned } : e)))
    } catch {
      addNotification({ type: 'error', title: 'Failed to pin' })
    }
  }

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div
          className="w-10 h-10 rounded-neo flex items-center justify-center"
          style={{ background: 'rgba(124, 58, 237, 0.15)', color: '#7c3aed' }}
        >
          <Brain size={20} />
        </div>
        <div>
          <h1 className="font-display text-xl font-semibold" style={{ color: '#e2e8f0' }}>
            Memory
          </h1>
          <p className="text-sm" style={{ color: 'rgba(100, 116, 139, 0.6)' }}>
            {memories.length} entries · Long-term knowledge store
          </p>
        </div>
      </motion.div>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: 'rgba(100, 116, 139, 0.5)' }}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search memory..."
          className="neo-input pl-10"
        />
      </form>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
            style={
              category === cat
                ? {
                    background: 'rgba(124, 58, 237, 0.2)',
                    border: '1px solid rgba(124, 58, 237, 0.4)',
                    color: '#7c3aed',
                  }
                : {
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(0, 212, 255, 0.08)',
                    color: 'rgba(100, 116, 139, 0.7)',
                  }
            }
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Memory grid */}
      {loading ? (
        <div className="text-center py-12" style={{ color: 'rgba(100, 116, 139, 0.5)' }}>
          Loading memory...
        </div>
      ) : memories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Brain size={40} style={{ color: 'rgba(100, 116, 139, 0.2)' }} />
          <p className="text-sm" style={{ color: 'rgba(100, 116, 139, 0.5)' }}>
            No memory entries found. NEO will store information as you chat.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {memories.map((entry) => (
            <motion.div
              key={entry.id}
              className="neo-glass p-4 flex items-start gap-4 group"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div
                className="flex-shrink-0 w-2 h-2 rounded-full mt-2"
                style={{
                  background: entry.isPinned ? '#f59e0b' : '#7c3aed',
                  boxShadow: `0 0 6px ${entry.isPinned ? 'rgba(245,158,11,0.5)' : 'rgba(124,58,237,0.5)'}`,
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-xs font-mono px-2 py-0.5 rounded"
                    style={{
                      background: 'rgba(124, 58, 237, 0.1)',
                      color: 'rgba(124, 58, 237, 0.8)',
                    }}
                  >
                    {entry.category}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: '#e2e8f0' }}>
                    {entry.key}
                  </span>
                </div>
                <p className="text-sm" style={{ color: 'rgba(100, 116, 139, 0.8)' }}>
                  {entry.value}
                </p>
                {entry.tags.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-1.5 py-0.5 rounded flex items-center gap-1"
                        style={{
                          background: 'rgba(0, 212, 255, 0.06)',
                          color: 'rgba(0, 212, 255, 0.5)',
                        }}
                      >
                        <Tag size={9} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handlePin(entry.id, entry.isPinned)}
                  className="p-1.5 rounded transition-colors"
                  style={{ color: entry.isPinned ? '#f59e0b' : 'rgba(100, 116, 139, 0.5)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#f59e0b')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = entry.isPinned ? '#f59e0b' : 'rgba(100, 116, 139, 0.5)')}
                >
                  <Pin size={14} />
                </button>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="p-1.5 rounded transition-colors"
                  style={{ color: 'rgba(100, 116, 139, 0.5)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(100, 116, 139, 0.5)')}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
