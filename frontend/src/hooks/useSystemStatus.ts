/**
 * useSystemStatus — polls backend system status every 3 seconds.
 */
import { useEffect, useCallback } from 'react'
import { systemApi } from '../services/api'
import { useSystemStore } from '../store'

export function useSystemStatus(intervalMs = 3000) {
  const { setStatus, setBackendOnline } = useSystemStore()

  const fetchStatus = useCallback(async () => {
    try {
      const status = await systemApi.getStatus()
      setStatus(status)
      setBackendOnline(true)
    } catch {
      setBackendOnline(false)
    }
  }, [setStatus, setBackendOnline])

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, intervalMs)
    return () => clearInterval(interval)
  }, [fetchStatus, intervalMs])
}
