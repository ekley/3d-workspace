import { Icon } from './icons'

export function QuickActions() {
  return (
    <div className="actions" aria-label="Quick actions">
      <button className="action-btn primary" aria-label="New task" title="New task">
        <Icon name="plus" size={20} />
      </button>
      <button className="action-btn" aria-label="Upload file" title="Upload file">
        <Icon name="upload" size={19} />
      </button>
      <button className="action-btn" aria-label="Focus mode" title="Focus mode">
        <Icon name="zap" size={19} />
      </button>
    </div>
  )
}
