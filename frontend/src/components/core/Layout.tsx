/**
 * Layout — Main application shell.
 * Includes TopBar, Sidebar, content area, and RightPanel.
 * Also starts system status polling.
 */
import { motion } from 'framer-motion'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'
import { RightPanel } from './RightPanel'
import { useSystemStatus } from '../../hooks/useSystemStatus'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  // Start polling system status
  useSystemStatus(3000)

  return (
    <motion.div
      className="flex flex-col w-full h-screen overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 20% 80%, rgba(124,58,237,0.04) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(0,212,255,0.04) 0%, transparent 50%), #020810' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Top Bar */}
      <TopBar />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Page Content */}
        <main className="flex-1 overflow-hidden relative">
          <motion.div
            className="w-full h-full overflow-y-auto"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>

        {/* Right Panel */}
        <RightPanel />
      </div>
    </motion.div>
  )
}
