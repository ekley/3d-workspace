import { useWorkspace } from '../state/workspace'

export function StatusBar() {
  const mode = useWorkspace((s) => s.mode)
  const streak = useWorkspace((s) => s.user.streak)
  const quality = useWorkspace((s) => s.settings.quality)
  const focusTimer = useWorkspace((s) => s.focusTimer)

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <footer className="status">
      <span className="ok">● SYS ONLINE</span>
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
