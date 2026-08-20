import { useMemo, useState } from 'react'
import type { Task, TaskStatus } from '../data/types'
import { useWorkspace } from '../state/workspace'
import { Icon } from './icons'
import { StateNotice } from './StateNotice'

const FILTERS: { id: string; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'backlog', label: 'Backlog' },
  { id: 'in-progress', label: 'In progress' },
  { id: 'review', label: 'Review' },
  { id: 'completed', label: 'Completed' },
]

const STATUS_LABEL: Record<string, string> = {
  backlog: 'Backlog',
  'in-progress': 'In progress',
  review: 'Review',
  completed: 'Completed',
}

export function TaskPanel() {
  const activeNav = useWorkspace((s) => s.activeNav)
  const setNav = useWorkspace((s) => s.setNav)
  const tasks = useWorkspace((s) => s.tasks)
  const projects = useWorkspace((s) => s.projects)
  const selectedTaskId = useWorkspace((s) => s.selectedTaskId)
  const selectTask = useWorkspace((s) => s.selectTask)
  const completeTask = useWorkspace((s) => s.completeTask)
  const updateTask = useWorkspace((s) => s.updateTask)
  const createTask = useWorkspace((s) => s.createTask)
  const showForm = useWorkspace((s) => s.taskFormOpen)
  const setShowForm = useWorkspace((s) => s.setTaskFormOpen)

  const [filter, setFilter] = useState('all')
  const [title, setTitle] = useState('')
  const [projectId, setProjectId] = useState(projects[0]?.id ?? '')
  const [priority, setPriority] = useState<Task['priority']>('medium')

  const filtered = useMemo(() => {
    const list = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter)
    return [...list].sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  }, [tasks, filter])

  if (activeNav !== 'tasks') return null

  const selected = tasks.find((t) => t.id === selectedTaskId)
  const projectOf = (id: string) => projects.find((p) => p.id === id)

  const submit = () => {
    if (!title.trim()) return
    createTask({ projectId, title: title.trim(), priority })
    setTitle('')
    setShowForm(false)
  }

  return (
    <div className="task-overlay" role="dialog" aria-label="Tasks">
      <section className="panel task-panel">
        <header className="tp-head">
          <div>
            <div className="tp-title">Tasks</div>
            <div className="tp-sub">
              {filtered.length} of {tasks.length} tasks
            </div>
          </div>
          <button className="icon-btn" aria-label="Close" onClick={() => setNav('overview')}>
            <Icon name="close" size={18} />
          </button>
        </header>

        <div className="tp-toolbar">
          <div className="tp-filters">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                className={`tp-filter${filter === f.id ? ' active' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button className="tp-new" onClick={() => setShowForm(!showForm)}>
            <Icon name="plus" size={15} /> New task
          </button>
        </div>

        {showForm && (
          <div className="tp-form">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title…"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && submit()}
            />
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Task['priority'])}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button className="tp-submit" onClick={submit}>
              Add
            </button>
          </div>
        )}

        <div className="tp-body">
          <div className="tp-list">
            {filtered.map((t) => {
              const p = projectOf(t.projectId)
              return (
                <div
                  key={t.id}
                  className={`tp-row${selectedTaskId === t.id ? ' active' : ''}`}
                  onClick={() => selectTask(t.id)}
                >
                  <button
                    className={`tp-check${t.status === 'completed' ? ' done' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      completeTask(t.id)
                    }}
                    aria-label="Complete task"
                  >
                    {t.status === 'completed' ? <Icon name="check" size={12} /> : null}
                  </button>
                  <div className="tp-row-main">
                    <div className="tp-row-title">{t.title}</div>
                    <div className="tp-row-meta">
                      <span style={{ color: p?.color }}>{p?.code}</span>
                      <span className={`prio prio-${t.priority}`}>{t.priority}</span>
                      <span>{t.assignee}</span>
                      <span>due {t.dueDate}</span>
                    </div>
                  </div>
                  <span className={`tp-status tp-${t.status}`}>{STATUS_LABEL[t.status]}</span>
                </div>
              )
            })}
            {filtered.length === 0 && <StateNotice title="No tasks in this view." sub="Change the filter or create a task." />}
          </div>

          {selected && (
            <aside className="tp-detail">
              <div className="tp-detail-title">{selected.title}</div>
              <div className="tp-detail-meta">
                <span>{projectOf(selected.projectId)?.name}</span>
                <span className={`prio prio-${selected.priority}`}>{selected.priority}</span>
                <span>{selected.assignee}</span>
              </div>
              <div className="tp-detail-grid">
                <div className="tp-detail-cell">
                  <span className="pp-stat-label">Status</span>
                  <span>{STATUS_LABEL[selected.status]}</span>
                </div>
                <div className="tp-detail-cell">
                  <span className="pp-stat-label">Due</span>
                  <span>{selected.dueDate}</span>
                </div>
                <div className="tp-detail-cell">
                  <span className="pp-stat-label">Estimate</span>
                  <span>{selected.estimate}</span>
                </div>
                <div className="tp-detail-cell">
                  <span className="pp-stat-label">Tags</span>
                  <span>{selected.tags.join(', ') || '-'}</span>
                </div>
              </div>
              <div className="tp-detail-actions">
                <span className="pp-stat-label">Set status</span>
                <div className="tp-status-btns">
                  {(['backlog', 'in-progress', 'review', 'completed'] as TaskStatus[]).map((st) => (
                    <button
                      key={st}
                      className={`tp-status-btn${selected.status === st ? ' active' : ''}`}
                      onClick={() =>
                        st === 'completed'
                          ? completeTask(selected.id)
                          : updateTask(selected.id, { status: st })
                      }
                    >
                      {STATUS_LABEL[st]}
                    </button>
                  ))}
                </div>
                <button
                  className="tp-complete"
                  onClick={() => completeTask(selected.id)}
                  disabled={selected.status === 'completed'}
                >
                  <Icon name="check" size={15} /> Complete task
                </button>
              </div>
            </aside>
          )}
        </div>
      </section>
    </div>
  )
}
