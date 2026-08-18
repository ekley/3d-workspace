import { useWorkspace } from '../state/workspace'

export function StatusBar() {
  const mode = useWorkspace((s) => s.mode)
  const streak = useWorkspace((s) => s.user.streak)
  const quality = useWorkspace((s) => s.settings.quality)

  return (
    <footer className="status">
      <span className="ok">● SYS ONLINE</span>
      <span>NEXUS CORE v0.1</span>
      <span className="right">
        <span>MODE: {mode === 'immersive' ? 'IMMERSIVE' : 'PRODUCTIVITY'}</span>
        <span className="accent">{streak} DAY STREAK</span>
        <span>PERF {quality.toUpperCase()}</span>
      </span>
    </footer>
  )
}
