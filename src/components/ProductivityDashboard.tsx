import { useWorkspace } from '../state/workspace'
import { Icon } from './icons'
import { StateNotice } from './StateNotice'

const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  'at-risk': 'At risk',
  paused: 'Paused',
  completed: 'Completed',
}

const DAY_ORDER = ['MON', 'TUE', 'WED', 'THU', 'FRI']
const DAY_LABEL: Record<string, string> = {
  MON: 'Monday',
  TUE: 'Tuesday',
  WED: 'Wednesday',
  THU: 'Thursday',
  FRI: 'Friday',
}

const EXT_COLOR: Record<string, string> = {
  md: '#22d3ee',
  ts: '#8b7cf6',
  py: '#34d399',
  yml: '#f472b6',
  json: '#fbbf24',
  fig: '#f472b6',
  svg: '#f472b6',
  png: '#34d399',
  pdf: '#f87171',
  docx: '#6b8af0',
}

export function ProductivityDashboard() {
  const user = useWorkspace((s) => s.user)
  const projects = useWorkspace((s) => s.projects)
  const tasks = useWorkspace((s) => s.tasks)
  const events = useWorkspace((s) => s.events)
  const activity = useWorkspace((s) => s.activity)
  const files = useWorkspace((s) => s.files)
  const selectProject = useWorkspace((s) => s.selectProject)
  const selectTask = useWorkspace((s) => s.selectTask)
  const selectEvent = useWorkspace((s) => s.selectEvent)
  const selectFile = useWorkspace((s) => s.selectFile)
  const selectCategory = useWorkspace((s) => s.selectCategory)
  const setNav = useWorkspace((s) => s.setNav)
  const completeTask = useWorkspace((s) => s.completeTask)

  const projectOf = (id?: string) => projects.find((p) => p.id === id)

  const openTasks = tasks
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5)

  const upcoming = [...events]
    .sort(
      (a, b) =>
        DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day) ||
        a.time.localeCompare(b.time),
    )
    .slice(0, 4)

  const recentActivity = activity.slice(0, 5)
  const recentFiles = files.slice(0, 5)
  const doneCount = tasks.filter((t) => t.status === 'completed').length

  return (
    <div className="dash">
      <header className="dash-head">
        <div>
          <div className="dash-title">Overview</div>
          <div className="dash-sub">Productivity workspace · {user.name}</div>
        </div>
        <div className="dash-stats">
          <div className="dash-stat">
            <span>Level</span>
            <b>{user.level}</b>
          </div>
          <div className="dash-stat">
            <span>Streak</span>
            <b>{user.streak}d</b>
          </div>
          <div className="dash-stat">
            <span>Tasks done</span>
            <b>
              {doneCount}/{tasks.length}
            </b>
          </div>
          <div className="dash-stat">
            <span>Productivity</span>
            <b>{user.productivity}</b>
          </div>
        </div>
      </header>

      <section className="dash-grid">
        <div className="dash-card dash-projects">
          <div className="dash-card-head">
            <h2>Projects</h2>
            <button className="dash-link" onClick={() => setNav('projects')}>
              View all
            </button>
          </div>
          <div className="project-grid">
            {projects.map((p) => (
              <button key={p.id} className="project-card" onClick={() => selectProject(p.id)}>
                <span className="pc-top">
                  <span className="pc-name">{p.name}</span>
                  <span className={`badge badge-${p.status}`}>{STATUS_LABEL[p.status]}</span>
                </span>
                <span className="pc-desc">{p.description}</span>
                <span className="pp-progress-bar">
                  <span style={{ width: `${p.progress}%`, background: p.color }} />
                </span>
                <span className="pc-meta">
                  {p.progress}% · {p.doneCount}/{p.taskCount} tasks · due {p.deadline}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-head">
            <h2>Tasks</h2>
            <button className="dash-link" onClick={() => setNav('tasks')}>
              Open
            </button>
          </div>
          <div className="dash-list">
            {openTasks.map((t) => (
              <div
                key={t.id}
                className="dash-row"
                onClick={() => {
                  selectTask(t.id)
                  setNav('tasks')
                }}
              >
                <button
                  className="tp-check"
                  aria-label="Complete task"
                  onClick={(e) => {
                    e.stopPropagation()
                    completeTask(t.id)
                  }}
                />
                <div className="dash-row-main">
                  <div className="dash-row-title">{t.title}</div>
                  <div className="dash-row-meta">
                    {projectOf(t.projectId)?.code} · due {t.dueDate}
                  </div>
                </div>
                <span className={`prio prio-${t.priority}`}>{t.priority}</span>
              </div>
            ))}
            {openTasks.length === 0 && <StateNotice title="No open tasks." sub="Tasks you can pick up appear here." />}
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-head">
            <h2>Calendar</h2>
            <button className="dash-link" onClick={() => setNav('calendar')}>
              Open
            </button>
          </div>
          <div className="dash-list">
            {upcoming.map((e) => (
              <div
                key={e.id}
                className="dash-row"
                onClick={() => {
                  selectEvent(e.id)
                  setNav('calendar')
                }}
              >
                <span className="cal-time">{e.time}</span>
                <div className="dash-row-main">
                  <div className="dash-row-title">{e.title}</div>
                  <div className="dash-row-meta">
                    {DAY_LABEL[e.day]} · {e.location}
                  </div>
                </div>
                {e.important && <span className="cal-dot" />}
              </div>
            ))}
            {upcoming.length === 0 && <StateNotice title="No upcoming events." sub="Your next 5 days are clear." />}
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-head">
            <h2>Activity</h2>
            <button className="dash-link" onClick={() => setNav('activity')}>
              Open
            </button>
          </div>
          <div className="dash-list">
            {recentActivity.map((a) => (
              <div key={a.id} className="dash-row">
                <span className={`activity-icon sev-${a.severity}`}>
                  <Icon name={a.icon} size={13} />
                </span>
                <div className="dash-row-main">
                  <div className="dash-row-title">{a.title}</div>
                  <div className="dash-row-meta">{a.detail}</div>
                </div>
                <span className="activity-time">{a.time}</span>
              </div>
            ))}
            {recentActivity.length === 0 && <StateNotice title="No activity." sub="Workspace events will appear here." />}
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-head">
            <h2>Files</h2>
            <button className="dash-link" onClick={() => setNav('files')}>
              Open
            </button>
          </div>
          <div className="dash-list">
            {recentFiles.map((f) => (
              <div
                key={f.id}
                className="dash-row"
                onClick={() => {
                  selectCategory('all')
                  selectFile(f.id)
                  setNav('files')
                }}
              >
                <span className="file-ext" style={{ color: EXT_COLOR[f.ext] ?? 'var(--text-1)' }}>
                  {f.ext}
                </span>
                <div className="dash-row-main">
                  <div className="dash-row-title">{f.name}</div>
                  <div className="dash-row-meta">
                    {f.folder} · {f.size}
                  </div>
                </div>
                {f.projectId && <span className="file-proj">{projectOf(f.projectId)?.code}</span>}
              </div>
            ))}
            {recentFiles.length === 0 && <StateNotice title="No files." sub="Uploaded files will appear here." />}
          </div>
        </div>
      </section>
    </div>
  )
}
