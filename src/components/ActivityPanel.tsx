import { useWorkspace } from '../state/workspace'
import { Icon } from './icons'

export function ActivityPanel() {
  const activeNav = useWorkspace((s) => s.activeNav)
  const setNav = useWorkspace((s) => s.setNav)
  const activity = useWorkspace((s) => s.activity)

  if (activeNav !== 'activity') return null

  return (
    <div className="activity-overlay" role="dialog" aria-label="Activity log">
      <section className="panel activity-panel">
        <header className="tp-head">
          <div>
            <div className="tp-title">Activity Log</div>
            <div className="tp-sub">{activity.length} events</div>
          </div>
          <button className="icon-btn" onClick={() => setNav('overview')} aria-label="Close">
            <Icon name="close" size={18} />
          </button>
        </header>

        <div className="activity-list">
          {activity.map((ev) => (
            <div
              key={ev.id}
              className={`activity-row sev-${ev.severity}${ev.time === 'Just now' ? ' fresh' : ''}`}
            >
              <div className="activity-icon">
                <Icon name={ev.icon} size={15} />
              </div>
              <div className="activity-main">
                <div className="activity-title">{ev.title}</div>
                <div className="activity-detail">{ev.detail}</div>
              </div>
              <span className="activity-time">{ev.time}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
