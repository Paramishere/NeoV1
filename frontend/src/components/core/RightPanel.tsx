/**
 * RightPanel — System status, integrations, and live metrics.
 */
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Cpu, MemoryStick, HardDrive, Wifi, Mic, Activity } from 'lucide-react'
import { useSystemStore } from '../../store'
import { systemApi } from '../../services/api'
import type { IntegrationStatus } from '../../types'

export function RightPanel() {
  const { status, backendOnline } = useSystemStore()
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([])

  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        const data = await systemApi.getIntegrations()
        setIntegrations(data)
      } catch {
        // Backend not ready
      }
    }
    if (backendOnline) fetchIntegrations()
  }, [backendOnline])

  return (
    <div
      className="w-64 flex flex-col border-l flex-shrink-0 overflow-y-auto"
      style={{
        borderColor: 'rgba(0, 212, 255, 0.08)',
        background: 'rgba(2, 8, 16, 0.6)',
      }}
    >
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: 'rgba(0, 212, 255, 0.08)' }}>
        <div className="flex items-center gap-2">
          <Activity size={14} style={{ color: '#00d4ff' }} />
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(0, 212, 255, 0.7)' }}>
            System Status
          </span>
        </div>
      </div>

      <div className="p-4 space-y-6 flex-1">
        {/* Backend Status */}
        <StatusItem
          icon={<Wifi size={13} />}
          label="Backend"
          status={backendOnline ? 'online' : 'offline'}
          value={backendOnline ? 'Connected' : 'Offline'}
        />

        {/* CPU */}
        <MetricItem
          icon={<Cpu size={13} />}
          label="CPU"
          value={status?.cpuPercent ?? 0}
          unit="%"
          color={status?.cpuPercent ?? 0 > 80 ? '#ef4444' : '#00d4ff'}
        />

        {/* RAM */}
        <MetricItem
          icon={<MemoryStick size={13} />}
          label="RAM"
          value={status?.ramPercent ?? 0}
          unit="%"
          subtext={status ? `${status.ramUsedGb}/${status.ramTotalGb} GB` : undefined}
          color={status?.ramPercent ?? 0 > 85 ? '#ef4444' : '#7c3aed'}
        />

        {/* Disk */}
        <MetricItem
          icon={<HardDrive size={13} />}
          label="Disk"
          value={status?.diskPercent ?? 0}
          unit="%"
          subtext={status ? `${status.diskUsedGb}/${status.diskTotalGb} GB` : undefined}
          color="#2563eb"
        />

        {/* Divider */}
        <div className="neo-divider" />

        {/* AI Status */}
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(100, 116, 139, 0.5)' }}>
            AI Engine
          </p>
          <StatusItem
            icon={<Cpu size={13} />}
            label="Ollama"
            status={status?.ollamaStatus === 'online' ? 'online' : 'offline'}
            value={status?.ollamaStatus === 'online' ? status.ollamaModel ?? 'Online' : 'Offline'}
          />
          {status?.availableModels && status.availableModels.length > 0 && (
            <div className="space-y-1">
              {status.availableModels.slice(0, 3).map((model) => (
                <div
                  key={model}
                  className="flex items-center gap-2 px-2 py-1 rounded text-xs font-mono"
                  style={{
                    background: 'rgba(0, 212, 255, 0.04)',
                    color: 'rgba(100, 116, 139, 0.7)',
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: '#00d4ff' }}
                  />
                  <span className="truncate">{model}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Voice Status */}
        <StatusItem
          icon={<Mic size={13} />}
          label="Voice"
          status={status?.voiceStatus === 'ready' ? 'online' : 'warning'}
          value={status?.voiceStatus === 'ready' ? 'Ready' : 'Unavailable'}
        />

        {/* Divider */}
        <div className="neo-divider" />

        {/* Integrations */}
        {integrations.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(100, 116, 139, 0.5)' }}>
              Integrations
            </p>
            <div className="space-y-1.5">
              {integrations.map((integration) => (
                <div key={integration.name} className="flex items-center justify-between gap-2">
                  <span
                    className="text-xs truncate"
                    style={{ color: 'rgba(100, 116, 139, 0.7)' }}
                  >
                    {integration.name.split(' ')[0]}
                  </span>
                  <IntegrationBadge status={integration.status} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Uptime */}
      {status && (
        <div
          className="p-3 border-t text-center"
          style={{ borderColor: 'rgba(0, 212, 255, 0.08)' }}
        >
          <span className="text-xs font-mono" style={{ color: 'rgba(100, 116, 139, 0.4)' }}>
            uptime {formatUptime(status.uptimeSeconds)}
          </span>
        </div>
      )}
    </div>
  )
}

function MetricItem({
  icon,
  label,
  value,
  unit,
  subtext,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: number
  unit: string
  subtext?: string
  color: string
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5" style={{ color: 'rgba(100, 116, 139, 0.7)' }}>
          {icon}
          <span className="text-xs">{label}</span>
        </div>
        <span className="text-xs font-mono font-medium" style={{ color }}>
          {value.toFixed(1)}{unit}
        </span>
      </div>
      <div
        className="w-full h-1 rounded-full overflow-hidden"
        style={{ background: 'rgba(255, 255, 255, 0.06)' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {subtext && (
        <p className="text-xs" style={{ color: 'rgba(100, 116, 139, 0.4)' }}>
          {subtext}
        </p>
      )}
    </div>
  )
}

function StatusItem({
  icon,
  label,
  status,
  value,
}: {
  icon: React.ReactNode
  label: string
  status: 'online' | 'offline' | 'warning'
  value: string
}) {
  const color =
    status === 'online' ? '#10b981' : status === 'warning' ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5" style={{ color: 'rgba(100, 116, 139, 0.7)' }}>
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <motion.span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: color }}
          animate={status === 'online' ? { opacity: [1, 0.4, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="text-xs font-mono" style={{ color }}>
          {value}
        </span>
      </div>
    </div>
  )
}

function IntegrationBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; label: string }> = {
    active: { color: '#10b981', label: '●' },
    ready: { color: '#10b981', label: '●' },
    inactive: { color: '#334155', label: '○' },
    missing_key: { color: '#f59e0b', label: '⚠' },
    unavailable: { color: '#334155', label: '○' },
    error: { color: '#ef4444', label: '✕' },
  }
  const cfg = config[status] ?? config.inactive
  return (
    <span className="text-xs" style={{ color: cfg.color }}>
      {cfg.label}
    </span>
  )
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}
