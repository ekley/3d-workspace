import { useEffect, useState } from 'react'
import { useWorkspace } from '../state/workspace'

const startTime = Date.now()

export function StatusBar() {
  const mode = useWorkspace((s) => s.mode)
  const streak = useWorkspace((s) => s.user.streak)
  const quality = useWorkspace((s) => s.settings.quality)
  const focusTimer = useWorkspace((s) => s.focusTimer)

  const [time, setTime] = useState(new Date())
  const [uptime, setUptime] = useState(0)
  const [ping, setPing] = useState(14)

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
      setUptime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const pingTimer = setInterval(() => {
      setPing(Math.floor(Math.random() * 34) + 12)
    }, 2000)
    return () => clearInterval(pingTimer)
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
      <span>PING {ping}MS</span>
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
