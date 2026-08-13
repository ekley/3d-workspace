import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useWorkspace } from '../state/workspace'
import { Icon } from './icons'

interface Item {
  group: string
  label: string
  sub: string
  icon: string
  run: () => void
}

export function CommandPalette() {
  const open = useWorkspace((s) => s.commandOpen)
  const setOpen = useWorkspace((s) => s.setCommandOpen)
  const projects = useWorkspace((s) => s.projects)
  const tasks = useWorkspace((s) => s.tasks)
  const files = useWorkspace((s) => s.files)
  const setNav = useWorkspace((s) => s.setNav)
  const selectProject = useWorkspace((s) => s.selectProject)
  const selectTask = useWorkspace((s) => s.selectTask)
  const selectFile = useWorkspace((s) => s.selectFile)
  const selectCategory = useWorkspace((s) => s.selectCategory)
  const setProfileOpen = useWorkspace((s) => s.setProfileOpen)

  const [query, setQuery] = useState('')
  const [sel, setSel] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(!useWorkspace.getState().commandOpen)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setOpen])

  useEffect(() => {
    if (open) {
      setQuery('')
      setSel(0)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  const close = () => setOpen(false)
  const projectOf = (id: string) => projects.find((p) => p.id === id)

  const items = useMemo<Item[]>(() => {
    const q = query.trim().toLowerCase()
    const out: Item[] = []
    if (!q) {
      out.push(
        { group: 'Navigate', label: 'Tasks', sub: '2D task board', icon: 'check', run: () => { setNav('tasks'); close() } },
        { group: 'Navigate', label: 'Files', sub: 'File browser', icon: 'folder', run: () => { setNav('files'); close() } },
        { group: 'Navigate', label: 'Calendar', sub: 'Upcoming events', icon: 'calendar', run: () => { setNav('calendar'); close() } },
        { group: 'Navigate', label: 'Activity', sub: 'Event log', icon: 'activity', run: () => { setNav('activity'); close() } },
        { group: 'Actions', label: 'Create task', sub: 'Open task board', icon: 'plus', run: () => { setNav('tasks'); close() } },
        { group: 'Actions', label: 'Open profile', sub: 'XP · missions · milestones', icon: 'zap', run: () => { setProfileOpen(true); close() } },
      )
      return out
    }
    const hit = (s: string) => s.toLowerCase().includes(q)
    for (const p of projects) {
      if (hit(p.name) || hit(p.code)) {
        out.push({
          group: 'Projects',
          label: p.name,
          sub: `${p.code} · ${p.progress}% · ${p.status}`,
          icon: 'layers',
          run: () => { selectProject(p.id); close() },
        })
      }
    }
    for (const t of tasks) {
      if (hit(t.title)) {
        out.push({
          group: 'Tasks',
          label: t.title,
          sub: `${projectOf(t.projectId)?.name ?? ''} · ${t.status}`,
          icon: 'check',
          run: () => { selectTask(t.id); setNav('tasks'); close() },
        })
      }
    }
    for (const f of files) {
      if (hit(f.name)) {
        out.push({
          group: 'Files',
          label: f.name,
          sub: `${f.category} / ${f.folder}`,
          icon: 'folder',
          run: () => { selectFile(f.id); selectCategory('all'); setNav('files'); close() },
        })
      }
    }
    if (out.length === 0) {
      out.push({
        group: 'Actions',
        label: `Create task "${query.trim()}"`,
        sub: 'Adds a backlog task',
        icon: 'plus',
        run: () => { setNav('tasks'); close() },
      })
    }
    return out.slice(0, 14)
  }, [query, projects, tasks, files])

  if (!open) return null

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSel((s) => Math.min(items.length - 1, s + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSel((s) => Math.max(0, s - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      items[sel]?.run()
    } else if (e.key === 'Escape') {
      close()
    }
  }

  let lastGroup = ''
  return (
    <div className="pal-overlay" onClick={close}>
      <div className="panel pal" onClick={(e) => e.stopPropagation()}>
        <div className="pal-input">
          <Icon name="search" size={16} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSel(0)
            }}
            onKeyDown={onKey}
            placeholder="Search workspace…"
          />
          <span className="kbd">ESC</span>
        </div>
        <div className="pal-list">
          {items.map((item, i) => {
            const header = item.group !== lastGroup
            lastGroup = item.group
            return (
              <Fragment key={i}>
                {header && <div className="pal-group">{item.group}</div>}
                <div
                  className={`pal-item${i === sel ? ' active' : ''}`}
                  onMouseEnter={() => setSel(i)}
                  onClick={() => item.run()}
                >
                  <span className="pal-item-icon">
                    <Icon name={item.icon} size={15} />
                  </span>
                  <span className="pal-item-label">{item.label}</span>
                  <span className="pal-item-sub">{item.sub}</span>
                </div>
              </Fragment>
            )
          })}
        </div>
        <footer className="pal-foot">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>ESC Close</span>
        </footer>
      </div>
    </div>
  )
}
