import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

import { SplashScreen } from './components/core/SplashScreen'
import { Layout } from './components/core/Layout'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { NotificationCenter } from './components/ui/NotificationCenter'

// Pages
import { HomePage } from './pages/HomePage'
import { ChatPage } from './pages/ChatPage'
import { MemoryPage } from './pages/MemoryPage'
import { PluginsPage } from './pages/PluginsPage'
import { TasksPage } from './pages/TasksPage'
import { SettingsPage } from './pages/SettingsPage'
import { LogsPage } from './pages/LogsPage'
import { AutomationPage } from './pages/AutomationPage'

export default function App() {
  const [splashDone, setSplashDone] = useState(false)

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AnimatePresence mode="wait">
          {!splashDone ? (
            <SplashScreen key="splash" onComplete={() => setSplashDone(true)} />
          ) : (
            <Layout key="app">
              <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/memory" element={<MemoryPage />} />
                <Route path="/plugins" element={<PluginsPage />} />
                <Route path="/automation" element={<AutomationPage />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/logs" element={<LogsPage />} />
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Routes>
            </Layout>
          )}
        </AnimatePresence>
        <NotificationCenter />
      </BrowserRouter>
    </ErrorBoundary>
  )
}
