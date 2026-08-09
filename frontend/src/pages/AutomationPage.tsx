/**
 * AutomationPage — Workflow and automation rules (architecture ready).
 */
import { motion } from 'framer-motion'
import { Zap, Plus } from 'lucide-react'

export function AutomationPage() {
  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-neo flex items-center justify-center"
            style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}
          >
            <Zap size={20} />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold" style={{ color: '#e2e8f0' }}>
              Automation
            </h1>
            <p className="text-sm" style={{ color: 'rgba(100, 116, 139, 0.6)' }}>
              Create automated workflows and triggers
            </p>
          </div>
        </div>
        <button className="neo-btn flex items-center gap-2 opacity-50 cursor-not-allowed">
          <Plus size={14} />
          New Workflow
        </button>
      </motion.div>

      {/* Coming soon panel */}
      <div className="flex flex-col items-center justify-center py-24 gap-6">
        <motion.div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(245, 158, 11, 0.06)',
            border: '1px solid rgba(245, 158, 11, 0.15)',
          }}
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Zap size={36} style={{ color: 'rgba(245, 158, 11, 0.5)' }} />
        </motion.div>
        <div className="text-center max-w-md">
          <h2 className="text-lg font-display font-semibold mb-2" style={{ color: '#e2e8f0' }}>
            Automation Engine — Coming Soon
          </h2>
          <p className="text-sm" style={{ color: 'rgba(100, 116, 139, 0.6)' }}>
            The automation module is architected and ready to be built. It will support
            trigger-based workflows, scheduled tasks, plugin chaining, and event-driven automations.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {['Triggers', 'Actions', 'Conditions'].map((item) => (
            <div
              key={item}
              className="neo-glass p-4 text-center"
              style={{ borderColor: 'rgba(245, 158, 11, 0.1)' }}
            >
              <p className="text-sm font-medium" style={{ color: '#e2e8f0' }}>
                {item}
              </p>
              <p className="text-xs mt-1" style={{ color: 'rgba(100, 116, 139, 0.4)' }}>
                Planned
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
