import { useWorkspace } from '../state/workspace'
import { Icon } from './icons'

const DAY_ORDER = ['MON', 'TUE', 'WED', 'THU', 'FRI']
const DAY_LABEL: Record<string, string> = {
  MON: 'Monday',
  TUE: 'Tuesday',
  WED: 'Wednesday',
  THU: 'Thursday',
  FRI: 'Friday',
}

export function CalendarPanel() {
  const activeNav = useWorkspace((s) => s.activeNav)
  const setNav = useWorkspace((s) => s.setNav)
  const events = useWorkspace((s) => s.events)
  const projects = useWorkspace((s) => s.projects)
  const selectedEventId = useWorkspace((s) => s.selectedEventId)
  const selectEvent = useWorkspace((s) => s.selectEvent)

  if (activeNav !== 'calendar') return null

  const selected = events.find((e) => e.id === selectedEventId)
  const projectOf = (id?: string) => projects.find((p) => p.id === id)

  return (
    <div className="cal-overlay" role="dialog" aria-label="Calendar">
      <section className="panel cal-panel">
        <header className="tp-head">
          <div>
            <div className="tp-title">Calendar</div>
            <div className="tp-sub">Next 5 days · {events.length} events</div>
          </div>
          <button className="icon-btn" onClick={() => setNav('overview')} aria-label="Close">
            <Icon name="close" size={18} />
          </button>
        </header>

        <div className="tp-body">
          <div className="cal-list">
            {DAY_ORDER.map((day) => {
              const list = events.filter((e) => e.day === day)
              if (list.length === 0) return null
              return (
                <div key={day} className="cal-day">
                  <div className="cal-day-head">{DAY_LABEL[day]}</div>
                  {list.map((e) => (
                    <div
                      key={e.id}
                      className={`cal-row${selectedEventId === e.id ? ' active' : ''}${e.important ? ' important' : ''}`}
                      onClick={() => selectEvent(e.id)}
                    >
                      <span className="cal-time">{e.time}</span>
                      <div className="cal-main">
                        <div className="cal-title">{e.title}</div>
                        <div className="cal-meta">
                          {e.projectId && (
                            <span style={{ color: projectOf(e.projectId)?.color }}>
                              {projectOf(e.projectId)?.code}
                            </span>
                          )}
                          <span>{e.location}</span>
                        </div>
                      </div>
                      {e.important && <span className="cal-dot" />}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>

          {selected && (
            <aside className="tp-detail">
              <div className="tp-detail-title">{selected.title}</div>
              <div className="tp-detail-meta">
                {selected.date} · {selected.time}
                {selected.duration !== '-' ? ` · ${selected.duration}` : ''}
              </div>
              <div className="tp-detail-grid">
                <div className="tp-detail-cell">
                  <span className="pp-stat-label">Project</span>
                  <span>{projectOf(selected.projectId)?.name ?? '-'}</span>
                </div>
                <div className="tp-detail-cell">
                  <span className="pp-stat-label">Location</span>
                  <span>{selected.location}</span>
                </div>
                <div className="tp-detail-cell" style={{ gridColumn: '1 / -1' }}>
                  <span className="pp-stat-label">Participants</span>
                  <span>{selected.participants.length ? selected.participants.join(', ') : '-'}</span>
                </div>
              </div>
              {selected.important && (
                <div className="cal-important">
                  <Icon name="zap" size={14} /> Important
                </div>
              )}
            </aside>
          )}
        </div>
      </section>
    </div>
  )
}
