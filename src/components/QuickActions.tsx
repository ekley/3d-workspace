import { Icon } from './icons'
import { useWorkspace } from '../state/workspace'

export function QuickActions() {
  const setNav = useWorkspace((s) => s.setNav)
  const setTaskFormOpen = useWorkspace((s) => s.setTaskFormOpen)
  const focusMode = useWorkspace((s) => s.focusMode)
  const toggleFocusMode = useWorkspace((s) => s.toggleFocusMode)

  return (
    <div className="actions" aria-label="Quick actions">
      <button
        className="action-btn primary"
        aria-label="New task"
        title="New task"
        onClick={() => {
          setTaskFormOpen(true)
          setNav('tasks')
        }}
      >
        <Icon name="plus" size={20} />
      </button>
      <button className="action-btn" aria-label="Files" title="Files" onClick={() => setNav('files')}>
        <Icon name="folder" size={19} />
      </button>
      <button
        className={`action-btn${focusMode ? ' active' : ''}`}
        aria-label={focusMode ? 'Exit focus mode' : 'Focus mode'}
        aria-pressed={focusMode}
        title={focusMode ? 'Exit focus mode' : 'Focus mode'}
        onClick={toggleFocusMode}
      >
        <Icon name="zap" size={19} />
      </button>
    </div>
  )
}
