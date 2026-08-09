/**
 * PluginsPage — Plugin management UI.
 */
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Puzzle, RefreshCw, Power, PowerOff, CheckCircle } from 'lucide-react'
import { pluginsApi } from '../services/api'
import type { Plugin } from '../types'
import { useUIStore } from '../store'

export function PluginsPage() {
  const [plugins, setPlugins] = useState<Plugin[]>([])
  const [loading, setLoading] = useState(true)
  const [reloading, setReloading] = useState(false)
  const { addNotification } = useUIStore()

  const fetchPlugins = async () => {
    try {
      setLoading(true)
      const data = await pluginsApi.getAll()
      setPlugins(data)
    } catch {
      addNotification({ type: 'warning', title: 'Could not load plugins', message: 'Backend may not be running' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPlugins() }, [])

  const handleToggle = async (pluginId: string, isEnabled: boolean) => {
    try {
      await pluginsApi.toggle(pluginId, !isEnabled)
      setPlugins((p) =>
        p.map((pl) => (pl.pluginId === pluginId ? { ...pl, isEnabled: !isEnabled } : pl))
      )
    } catch {
      addNotification({ type: 'error', title: 'Failed to toggle plugin' })
    }
  }

  const handleReload = async () => {
    setReloading(true)
    try {
      const result = await pluginsApi.reload()
      await fetchPlugins()
      addNotification({
        type: 'success',
        title: `Reloaded ${result.loaded} plugin${result.loaded !== 1 ? 's' : ''}`,
      })
    } catch {
      addNotification({ type: 'error', title: 'Failed to reload plugins' })
    } finally {
      setReloading(false)
    }
  }

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-neo flex items-center justify-center"
            style={{ background: 'rgba(37, 99, 235, 0.15)', color: '#2563eb' }}
          >
            <Puzzle size={20} />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold" style={{ color: '#e2e8f0' }}>
              Plugins
            </h1>
            <p className="text-sm" style={{ color: 'rgba(100, 116, 139, 0.6)' }}>
              {plugins.length} discovered · Drop plugins into /plugins/
            </p>
          </div>
        </div>
        <button
          onClick={handleReload}
          disabled={reloading}
          className="neo-btn flex items-center gap-2"
        >
          <RefreshCw size={14} className={reloading ? 'animate-spin' : ''} />
          Reload
        </button>
      </motion.div>

      {/* How to add plugins */}
      <div
        className="neo-glass p-4 space-y-2"
        style={{ borderColor: 'rgba(37, 99, 235, 0.15)' }}
      >
        <p className="text-sm font-semibold" style={{ color: '#2563eb' }}>
          📦 How to add plugins
        </p>
        <p className="text-xs" style={{ color: 'rgba(100, 116, 139, 0.7)' }}>
          Create a folder inside <code className="font-mono px-1 py-0.5 rounded" style={{ background: 'rgba(0,212,255,0.08)', color: '#00d4ff' }}>/plugins/</code> with a{' '}
          <code className="font-mono px-1 py-0.5 rounded" style={{ background: 'rgba(0,212,255,0.08)', color: '#00d4ff' }}>manifest.json</code> and a{' '}
          <code className="font-mono px-1 py-0.5 rounded" style={{ background: 'rgba(0,212,255,0.08)', color: '#00d4ff' }}>plugin.py</code> file.
          NEO will automatically discover and load it on next reload.
        </p>
      </div>

      {/* Plugin list */}
      {loading ? (
        <div className="text-center py-12" style={{ color: 'rgba(100, 116, 139, 0.5)' }}>
          Loading plugins...
        </div>
      ) : plugins.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Puzzle size={40} style={{ color: 'rgba(100, 116, 139, 0.2)' }} />
          <div className="text-center">
            <p className="text-sm font-medium" style={{ color: 'rgba(100, 116, 139, 0.5)' }}>
              No plugins installed
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(100, 116, 139, 0.3)' }}>
              Add plugins to the /plugins/ folder and click Reload
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {plugins.map((plugin) => (
            <motion.div
              key={plugin.pluginId}
              className="neo-glass p-4 flex items-center justify-between"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-neo flex items-center justify-center"
                  style={{
                    background: plugin.isLoaded
                      ? 'rgba(16, 185, 129, 0.1)'
                      : 'rgba(100, 116, 139, 0.1)',
                    color: plugin.isLoaded ? '#10b981' : '#64748b',
                  }}
                >
                  {plugin.isLoaded ? <CheckCircle size={18} /> : <Puzzle size={18} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>
                      {plugin.name}
                    </p>
                    <span
                      className="text-xs font-mono px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(0,212,255,0.06)', color: 'rgba(0,212,255,0.5)' }}
                    >
                      v{plugin.version}
                    </span>
                  </div>
                  {plugin.description && (
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(100, 116, 139, 0.6)' }}>
                      {plugin.description}
                    </p>
                  )}
                  <div className="flex gap-1 mt-1">
                    {plugin.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(37,99,235,0.1)', color: 'rgba(37,99,235,0.7)' }}
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleToggle(plugin.pluginId, plugin.isEnabled)}
                className="p-2 rounded-neo transition-all duration-200"
                style={{
                  color: plugin.isEnabled ? '#10b981' : 'rgba(100, 116, 139, 0.4)',
                  background: plugin.isEnabled
                    ? 'rgba(16, 185, 129, 0.08)'
                    : 'rgba(100, 116, 139, 0.05)',
                }}
              >
                {plugin.isEnabled ? <Power size={16} /> : <PowerOff size={16} />}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
