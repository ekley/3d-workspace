import { useWorkspace } from '../state/workspace'
import { Icon } from './icons'

const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  'at-risk': 'At risk',
  paused: 'Paused',
  completed: 'Completed',
}

export function ProjectsPanel() {
  const activeNav = useWorkspace((s) => s.activeNav)
  const setNav = useWorkspace((s) => s.setNav)
  const projects = useWorkspace((s) => s.projects)
  const selectProject = useWorkspace((s) => s.selectProject)

  if (activeNav !== 'projects') return null

  return (
    <div className="projects-overlay" role="dialog" aria-label="Projects">
      <section className="panel projects-panel">
        <header className="tp-head">
          <div>
            <div className="tp-title">Projects</div>
            <div className="tp-sub">{projects.length} workspaces</div>
          </div>
          <button className="icon-btn" onClick={() => setNav('overview')} aria-label="Close">
            <Icon name="close" size={18} />
          </button>
        </header>

        <div className="projects-grid">
          {projects.map((p) => (
            <button
              key={p.id}
              className="project-card"
              onClick={() => {
                selectProject(p.id)
                setNav('overview')
              }}
            >
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
      </section>
    </div>
  )
}
