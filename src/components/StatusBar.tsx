import { useEffect, useState } from 'react'
import { useWorkspace } from '../state/workspace'

const startTime = Date.now()

export function StatusBar() {
  const mode = useWorkspace((s) => s.mode)
  const streak = useWorkspace((s) => s.user.streak)
  const quality = useWorkspace((s) => s.settings.quality)
  const focusTimer = useWorkspace((s) => s.focusTimer)
  const apiSyncStatus = useWorkspace((s) => s.apiSyncStatus)

  const [time, setTime] = useState(new Date())
  const [uptime, setUptime] = useState(0)
  const [ping, setPing] = useState<number | null>(12)

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
      setUptime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    let mounted = true
    const probePing = async () => {
      const t0 = performance.now()
      try {
        const res = await fetch(`/api/ping?t=${Date.now()}`, { cache: 'no-store' })
        if (res.ok && mounted) {
          const rtt = Math.max(1, Math.round(performance.now() - t0))
          setPing(rtt)
        }
      } catch {
        // Backend offline or unreachable - keep last state
      }
    }
    probePing()
    const pingTimer = setInterval(probePing, 3000)
    return () => {
      mounted = false
      clearInterval(pingTimer)
    }
  }, [])

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const formatUptime = (sec: number) => {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })

  return (
    <footer className="status">
      <span className="ok">● SYS ONLINE</span>
      {apiSyncStatus === 'synced' ? (
        <span className="ok" title="Backend database synced & persistent">● API SYNCED</span>
      ) : apiSyncStatus === 'syncing' ? (
        <span className="accent" title="Synchronizing with backend store...">◌ API SYNCING</span>
      ) : (
        <span style={{ color: 'var(--text-3)' }} title="Operating in local memory mode">○ API LOCAL</span>
      )}
      <span>PING {ping !== null ? `${ping}MS` : '--MS'}</span>
      <span>{timeStr}</span>
      <span>UPTIME {formatUptime(uptime)}</span>
      <span>NEXUS CORE v0.1</span>
      {focusTimer.active && (
        <span className="accent">
          {focusTimer.mode === 'work' ? 'FOCUS' : 'BREAK'}: {formatTimer(focusTimer.remainingSec)}
        </span>
      )}
      <span className="right">
        <span>MODE: {mode === 'immersive' ? 'IMMERSIVE' : 'PRODUCTIVITY'}</span>
        <span className="accent">{streak} DAY STREAK</span>
        <span>PERF {quality.toUpperCase()}</span>
      </span>
    </footer>
  )
}
