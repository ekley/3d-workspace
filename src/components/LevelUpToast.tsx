import { useEffect } from 'react'
import { useWorkspace } from '../state/workspace'

export function LevelUpToast() {
  const levelUp = useWorkspace((s) => s.levelUp)
  const clearLevelUp = useWorkspace((s) => s.clearLevelUp)

  useEffect(() => {
    if (levelUp == null) return
    const t = setTimeout(clearLevelUp, 2600)
    return () => clearTimeout(t)
  }, [levelUp, clearLevelUp])

  if (levelUp == null) return null
  return (
    <div className="levelup-toast" role="status" aria-live="polite">
      <div className="levelup-title">LEVEL UP</div>
      <div className="levelup-sub">Reached level {levelUp}</div>
    </div>
  )
}
