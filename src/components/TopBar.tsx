import { Icon } from './icons'
import { useWorkspace } from '../state/workspace'

export function TopBar() {
  const user = useWorkspace((s) => s.user)
  const pct = Math.round((user.xp / user.xpToNext) * 100)

  return (
    <header className="hud">
      <div className="identity">
        <div className="logo">
          <Icon name="layers" size={16} />
        </div>
        <div>
          <div className="identity-name">NEXUS</div>
          <div className="identity-sub">Workspace OS</div>
        </div>
      </div>

      <div className="search">
        <Icon name="search" size={16} />
        <input placeholder="Search workspace…" aria-label="Search workspace" />
        <span className="kbd">⌘K</span>
      </div>

      <div className="hud-right">
        <button className="icon-btn" aria-label="Notifications">
          <Icon name="bell" size={18} />
          <span className="dot" />
        </button>
        <button className="icon-btn" aria-label="Settings">
          <Icon name="settings" size={18} />
        </button>
        <button className="user-chip" aria-label="User profile">
          <span className="avatar">{user.initials}</span>
          <span className="user-meta">
            <span className="name">{user.name}</span>
            <span className="xp-pill">
              LVL {user.level}
              <span className="xp-bar">
                <span style={{ width: `${pct}%` }} />
              </span>
              {user.xp.toLocaleString()}
            </span>
          </span>
        </button>
      </div>
    </header>
  )
}
