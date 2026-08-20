import { Icon } from './icons'
import { useWorkspace } from '../state/workspace'

export function TopBar() {
  const user = useWorkspace((s) => s.user)
  const mode = useWorkspace((s) => s.mode)
  const disable3D = useWorkspace((s) => s.settings.disable3D)
  const soundEnabled = useWorkspace((s) => s.settings.soundEnabled)
  const focusTimer = useWorkspace((s) => s.focusTimer)
  const setFocusModalOpen = useWorkspace((s) => s.setFocusModalOpen)
  const setMode = useWorkspace((s) => s.setMode)
  const updateSettings = useWorkspace((s) => s.updateSettings)
  const setProfileOpen = useWorkspace((s) => s.setProfileOpen)
  const setCommandOpen = useWorkspace((s) => s.setCommandOpen)
  const setSettingsOpen = useWorkspace((s) => s.setSettingsOpen)
  const setNav = useWorkspace((s) => s.setNav)
  const pct = Math.round((user.xp / user.xpToNext) * 100)
  const productivity = mode === 'productivity' || disable3D

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

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

      <div
        className="search"
        onClick={() => setCommandOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setCommandOpen(true)
          }
        }}
      >
        <Icon name="search" size={16} />
        <input placeholder="Search workspace…" aria-label="Search workspace" readOnly />
        <span className="kbd">⌘K</span>
      </div>

      <div className="hud-right">
        {focusTimer.active && (
          <button
            className="hud-focus-pill mono"
            onClick={() => setFocusModalOpen(true)}
            aria-label="Focus timer status"
            title="Open focus protocol"
          >
            <span className={`focus-pulse-dot${focusTimer.running ? ' running' : ''}`} />
            {focusTimer.mode === 'work' ? 'FOCUS' : 'BREAK'} {formatTimer(focusTimer.remainingSec)}
          </button>
        )}
        <button
          className="icon-btn"
          aria-label={soundEnabled ? 'Mute audio' : 'Unmute audio'}
          title={soundEnabled ? 'Mute audio' : 'Unmute audio'}
          onClick={() => updateSettings({ soundEnabled: !soundEnabled })}
        >
          <Icon name={soundEnabled ? 'volume' : 'volume-x'} size={18} />
        </button>
        <button
          className="icon-btn"
          aria-label={productivity ? 'Switch to 3D immersive mode' : 'Switch to 2D productivity mode'}
          title={productivity ? 'Switch to 3D immersive mode' : 'Switch to 2D productivity mode'}
          onClick={() => {
            if (productivity) {
              setMode('immersive')
              updateSettings({ disable3D: false })
            } else {
              setMode('productivity')
            }
          }}
        >
          <Icon name={productivity ? 'layers' : 'monitor'} size={18} />
        </button>
        <button className="icon-btn" aria-label="Notifications" onClick={() => setNav('activity')}>
          <Icon name="bell" size={18} />
          <span className="dot" />
        </button>
        <button className="icon-btn" aria-label="Settings" onClick={() => setSettingsOpen(true)}>
          <Icon name="settings" size={18} />
        </button>
        <button className="user-chip" aria-label="User profile" onClick={() => setProfileOpen(true)}>
          <span className="avatar"><img src={user.avatar} alt={`${user.name} avatar`} /></span>
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
