import { useWorkspace } from '../state/workspace'
import { Icon } from './icons'

const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  'at-risk': 'At risk',
  paused: 'Paused',
  completed: 'Completed',
}

export function ProjectPanel() {
  const projects = useWorkspace((s) => s.projects)
  const selectedId = useWorkspace((s) => s.selectedProjectId)
  const focusedId = useWorkspace((s) => s.focusedProjectId)
  const selectProject = useWorkspace((s) => s.selectProject)
  const focusProject = useWorkspace((s) => s.focusProject)

  const project = projects.find((p) => p.id === (focusedId ?? selectedId))
  if (!project) return null
  const expanded = !!focusedId

  const close = () => {
    selectProject(null)
    focusProject(null)
  }

  return (
    <div className={expanded ? 'workspace-overlay' : 'project-panel-wrap'}>
      <aside
        className={`panel ${expanded ? 'workspace' : 'project-panel'}`}
        role="dialog"
        aria-label={project.name}
      >
        <header className="pp-head">
          <div className="pp-title">
            {expanded && (
              <button className="icon-btn" aria-label="Back" onClick={() => focusProject(null)}>
                <Icon name="chevron" size={18} />
              </button>
            )}
            <div>
              <div className="pp-name">
                {project.name}
                <span className="pp-code">{project.code}</span>
              </div>
              {expanded && <div className="pp-sub">{project.description}</div>}
            </div>
          </div>
          <div className="pp-head-right">
            <span className={`badge badge-${project.status}`}>{STATUS_LABEL[project.status]}</span>
            <button className="icon-btn" aria-label="Close" onClick={close}>
              <Icon name="close" size={18} />
            </button>
          </div>
        </header>

        {!expanded && <p className="pp-desc">{project.description}</p>}

        <div className="pp-progress">
          <div className="pp-progress-head">
            <span>Progress</span>
            <span className="mono">{project.progress}%</span>
          </div>
          <div className="pp-progress-bar">
            <span style={{ width: `${project.progress}%`, background: project.color }} />
          </div>
        </div>

        <div className="pp-stats">
          <div className="pp-stat">
            <span className="pp-stat-label">Deadline</span>
            <span className="pp-stat-value">{project.deadline}</span>
          </div>
          <div className="pp-stat">
            <span className="pp-stat-label">Tasks</span>
            <span className="pp-stat-value">
              {project.doneCount}/{project.taskCount} done
            </span>
          </div>
        </div>

        <div className="pp-activity">
          <span className="pp-stat-label">Recent activity</span>
          <span className="pp-activity-text">{project.lastActivity}</span>
        </div>

        {!expanded && (
          <button className="pp-enter" onClick={() => focusProject(project.id)}>
            <Icon name="maximize" size={16} />
            Open workspace
          </button>
        )}
      </aside>
    </div>
  )
}
