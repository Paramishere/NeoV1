/**
 * SettingsPage — Full settings panel with categorized sections.
 */
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Palette, Cpu, Mic, Brain, Globe, Code, Save } from 'lucide-react'
import { settingsApi, systemApi } from '../services/api'
import type { Setting, IntegrationStatus } from '../types'
import { useUIStore } from '../store'

const CATEGORIES = [
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'ai', label: 'AI Engine', icon: Cpu },
  { id: 'voice', label: 'Voice', icon: Mic },
  { id: 'memory', label: 'Memory', icon: Brain },
  { id: 'general', label: 'General', icon: Globe },
  { id: 'developer', label: 'Developer', icon: Code },
]

export function SettingsPage() {
  const [selectedCategory, setSelectedCategory] = useState('ai')
  const [settings, setSettings] = useState<Setting[]>([])
  const [edited, setEdited] = useState<Record<string, string>>({})
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([])
  const [loading, setLoading] = useState(true)
  const { addNotification } = useUIStore()

  useEffect(() => {
    const load = async () => {
      try {
        const [settingsData, intData] = await Promise.all([
          settingsApi.getAll(),
          systemApi.getIntegrations(),
        ])
        setSettings(settingsData)
        setIntegrations(intData)
      } catch {
        // Backend may be starting
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const categorySettings = settings.filter((s) => s.category === selectedCategory)

  const handleChange = (key: string, value: string) => {
    setEdited((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    try {
      await settingsApi.bulkUpdate(edited)
      setSettings((prev) =>
        prev.map((s) => (edited[s.key] !== undefined ? { ...s, value: edited[s.key] } : s))
      )
      setEdited({})
      addNotification({ type: 'success', title: 'Settings saved' })
    } catch {
      addNotification({ type: 'error', title: 'Failed to save settings' })
    }
  }

  const hasChanges = Object.keys(edited).length > 0

  return (
    <div className="flex h-full">
      {/* Categories sidebar */}
      <div
        className="w-48 border-r flex-shrink-0 p-3 space-y-1"
        style={{
          borderColor: 'rgba(0, 212, 255, 0.08)',
          background: 'rgba(2, 8, 16, 0.4)',
        }}
      >
        <p
          className="text-xs font-semibold tracking-widest uppercase px-2 py-2"
          style={{ color: 'rgba(100, 116, 139, 0.4)' }}
        >
          Settings
        </p>
        {CATEGORIES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSelectedCategory(id)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-neo text-sm transition-all duration-200"
            style={
              selectedCategory === id
                ? {
                    background: 'rgba(0, 212, 255, 0.08)',
                    border: '1px solid rgba(0, 212, 255, 0.15)',
                    color: '#00d4ff',
                  }
                : {
                    border: '1px solid transparent',
                    color: 'rgba(100, 116, 139, 0.7)',
                  }
            }
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Settings content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold" style={{ color: '#e2e8f0' }}>
              {CATEGORIES.find((c) => c.id === selectedCategory)?.label}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(100, 116, 139, 0.5)' }}>
              Configure {selectedCategory} settings
            </p>
          </div>
          {hasChanges && (
            <motion.button
              onClick={handleSave}
              className="neo-btn-primary flex items-center gap-2"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileTap={{ scale: 0.97 }}
            >
              <Save size={14} />
              Save Changes
            </motion.button>
          )}
        </div>

        {/* AI Integration status (shown on AI page) */}
        {selectedCategory === 'ai' && (
          <div className="neo-glass p-4 space-y-3">
            <p className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>
              Integration Status
            </p>
            <div className="grid grid-cols-2 gap-2">
              {integrations.map((integration) => (
                <div
                  key={integration.name}
                  className="flex items-center justify-between p-3 rounded-neo"
                  style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(0, 212, 255, 0.06)' }}
                >
                  <div>
                    <p className="text-xs font-medium" style={{ color: '#e2e8f0' }}>
                      {integration.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(100, 116, 139, 0.5)' }}>
                      {integration.message}
                    </p>
                  </div>
                  <StatusDot status={integration.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings fields */}
        {loading ? (
          <div className="text-center py-8" style={{ color: 'rgba(100, 116, 139, 0.5)' }}>
            Loading settings...
          </div>
        ) : (
          <div className="space-y-4">
            {categorySettings.map((setting) => (
              <SettingField
                key={setting.key}
                setting={setting}
                value={edited[setting.key] ?? setting.value}
                onChange={(value) => handleChange(setting.key, value)}
              />
            ))}
            {categorySettings.length === 0 && (
              <p className="text-sm" style={{ color: 'rgba(100, 116, 139, 0.5)' }}>
                No settings in this category.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

interface SettingFieldProps {
  setting: Setting
  value: string
  onChange: (value: string) => void
}

function SettingField({ setting, value, onChange }: SettingFieldProps) {
  if (setting.valueType === 'bool') {
    return (
      <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'rgba(0, 212, 255, 0.06)' }}>
        <div>
          <p className="text-sm font-medium" style={{ color: '#e2e8f0' }}>
            {formatKey(setting.key)}
          </p>
          {setting.description && (
            <p className="text-xs mt-0.5" style={{ color: 'rgba(100, 116, 139, 0.5)' }}>
              {setting.description}
            </p>
          )}
        </div>
        <button
          onClick={() => onChange(value === 'true' ? 'false' : 'true')}
          className="relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0"
          style={{
            background: value === 'true' ? '#00d4ff' : 'rgba(100, 116, 139, 0.2)',
          }}
        >
          <motion.div
            className="absolute top-0.5 w-4 h-4 rounded-full"
            style={{ background: '#020810' }}
            animate={{ left: value === 'true' ? '22px' : '2px' }}
            transition={{ duration: 0.2 }}
          />
        </button>
      </div>
    )
  }

  return (
    <div className="py-3 border-b" style={{ borderColor: 'rgba(0, 212, 255, 0.06)' }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium mb-1" style={{ color: '#e2e8f0' }}>
            {formatKey(setting.key)}
          </p>
          {setting.description && (
            <p className="text-xs mb-2" style={{ color: 'rgba(100, 116, 139, 0.5)' }}>
              {setting.description}
            </p>
          )}
          <input
            type={setting.valueType === 'int' || setting.valueType === 'float' ? 'number' : 'text'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="neo-input text-xs w-full max-w-xs"
          />
        </div>
      </div>
    </div>
  )
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === 'active' || status === 'ready'
      ? '#10b981'
      : status === 'missing_key'
      ? '#f59e0b'
      : '#ef4444'

  return (
    <motion.div
      className="w-2 h-2 rounded-full flex-shrink-0"
      style={{ background: color, boxShadow: `0 0 6px ${color}` }}
      animate={status === 'active' ? { opacity: [1, 0.4, 1] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    />
  )
}

function formatKey(key: string): string {
  return key
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
