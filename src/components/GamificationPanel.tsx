import { useWorkspace } from '../state/workspace'
import { Icon } from './icons'

export function GamificationPanel() {
  const open = useWorkspace((s) => s.profileOpen)
  const setProfileOpen = useWorkspace((s) => s.setProfileOpen)
  const user = useWorkspace((s) => s.user)
  const tasks = useWorkspace((s) => s.tasks)
  const projects = useWorkspace((s) => s.projects)
  const activity = useWorkspace((s) => s.activity)

  if (!open) return null

  const completed = tasks.filter((t) => t.status === 'completed').length
  const shipped = projects.filter((p) => p.status === 'completed').length
  const atlas = projects.find((p) => p.id === 'atlas')

  const missions = [
    { title: 'Reach level 28', value: user.xp, target: user.xpToNext },
    { title: 'Maintain a 7-day streak', value: Math.min(user.streak, 7), target: 7 },
    { title: 'Complete 15 tasks', value: completed, target: 15 },
    { title: 'Ship a project', value: shipped, target: 1 },
    { title: 'Atlas to 100%', value: atlas?.progress ?? 0, target: 100 },
  ]

  const milestones = [
    ...projects
      .filter((p) => p.status === 'completed')
      .map((p) => ({ title: `${p.name} shipped`, meta: p.deadline, icon: 'check' })),
    ...projects
      .filter((p) => p.status !== 'completed' && p.progress >= 50)
      .map((p) => ({ title: `${p.name} at ${p.progress}%`, meta: `deadline ${p.deadline}`, icon: 'layers' })),
    ...activity
      .filter((a) => a.type === 'milestone')
      .map((a) => ({ title: a.detail, meta: a.time, icon: a.icon })),
  ]

  const xpPct = Math.round((user.xp / user.xpToNext) * 100)

  return (
    <div className="profile-overlay" role="dialog" aria-label="Profile and progress">
      <section className="panel profile-panel">
        <header className="tp-head">
          <div className="prof-head">
            <span className="avatar prof-avatar">{user.initials}</span>
            <div>
              <div className="tp-title">{user.name}</div>
              <div className="tp-sub">
                {user.title} · {user.location}
              </div>
            </div>
          </div>
          <button className="icon-btn" onClick={() => setProfileOpen(false)} aria-label="Close">
            <Icon name="close" size={18} />
          </button>
        </header>

        <div className="prof-level">
          <div className="prof-level-badge">LVL {user.level}</div>
          <div className="prof-level-info">
            <div className="prof-level-row">
              <span>{user.xp.toLocaleString()} XP</span>
              <span className="mono">next at {user.xpToNext.toLocaleString()}</span>
            </div>
            <div className="pp-progress-bar">
              <span style={{ width: `${xpPct}%` }} />
            </div>
          </div>
        </div>

        <div className="prof-stats">
          <div className="pp-stat">
            <span className="pp-stat-label">Streak</span>
            <span className="pp-stat-value">{user.streak} days</span>
          </div>
          <div className="pp-stat">
            <span className="pp-stat-label">Productivity</span>
            <span className="pp-stat-value">{user.productivity}</span>
          </div>
          <div className="pp-stat">
            <span className="pp-stat-label">Tasks done</span>
            <span className="pp-stat-value">
              {completed}/{tasks.length}
            </span>
          </div>
          <div className="pp-stat">
            <span className="pp-stat-label">Projects shipped</span>
            <span className="pp-stat-value">{shipped}</span>
          </div>
        </div>

        <div className="prof-section">
          <div className="prof-section-title">Missions</div>
          {missions.map((m) => {
            const pct = Math.min(100, Math.round((m.value / Math.max(1, m.target)) * 100))
            const done = m.value >= m.target
            return (
              <div key={m.title} className={`mission${done ? ' done' : ''}`}>
                <div className="mission-head">
                  <span className="mission-title">{m.title}</span>
                  <span className="mission-nums mono">
                    {m.value}/{m.target}
                  </span>
                </div>
                <div className="pp-progress-bar">
                  <span style={{ width: `${pct}%`, background: done ? 'var(--ok)' : 'var(--accent)' }} />
                </div>
              </div>
            )
          })}
        </div>

        <div className="prof-section">
          <div className="prof-section-title">Milestones</div>
          {milestones.map((m) => (
            <div key={m.title} className="milestone">
              <span className="milestone-icon">
                <Icon name={m.icon} size={13} />
              </span>
              <span className="milestone-title">{m.title}</span>
              <span className="milestone-meta mono">{m.meta}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
