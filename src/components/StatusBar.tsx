import { useWorkspace } from '../state/workspace'

export function StatusBar() {
  const mode = useWorkspace((s) => s.mode)

  return (
    <footer className="status">
      <span className="ok">● SYS ONLINE</span>
      <span>NEXUS CORE v0.1</span>
      <span className="right">
        <span>MODE: {mode === 'immersive' ? 'IMMERSIVE' : 'PRODUCTIVITY'}</span>
        <span className="accent">14 DAY STREAK</span>
        <span>RENDER 60 FPS</span>
      </span>
    </footer>
  )
}
