import { useMemo, useState } from 'react'
import type { NoteCategory } from '../data/types'
import { useWorkspace } from '../state/workspace'
import { Icon } from './icons'
import { StateNotice } from './StateNotice'

const CATEGORIES: { id: string; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'spec', label: 'Specs' },
  { id: 'idea', label: 'Ideas' },
  { id: 'log', label: 'Logs' },
  { id: 'general', label: 'General' },
]

const CATEGORY_LABEL: Record<string, string> = {
  spec: 'Spec',
  idea: 'Idea',
  log: 'Log',
  general: 'General',
}

const CATEGORY_COLOR: Record<string, string> = {
  spec: '#3b82f6',
  idea: '#d946ef',
  log: '#f43f5e',
  general: '#10b981',
}

export function NotePanel() {
  const activeNav = useWorkspace((s) => s.activeNav)
  const setNav = useWorkspace((s) => s.setNav)
  const notes = useWorkspace((s) => s.notes)
  const projects = useWorkspace((s) => s.projects)
  const selectedNoteId = useWorkspace((s) => s.selectedNoteId)
  const selectNote = useWorkspace((s) => s.selectNote)
  const createNote = useWorkspace((s) => s.createNote)
  const updateNote = useWorkspace((s) => s.updateNote)
  const deleteNote = useWorkspace((s) => s.deleteNote)
  
  const showForm = useWorkspace((s) => s.noteFormOpen)
  const setShowForm = useWorkspace((s) => s.setNoteFormOpen)

  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  // New Note fields
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newProjectId, setNewProjectId] = useState('')
  const [newCategory, setNewCategory] = useState<NoteCategory>('general')

  // Edit fields (for selected note)
  const selected = notes.find((n) => n.id === selectedNoteId)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editProjectId, setEditProjectId] = useState('')
  const [editCategory, setEditCategory] = useState<NoteCategory>('general')
  const [editingId, setEditingId] = useState<string | null>(null)

  // Sync edit state when selection changes
  useMemo(() => {
    if (selected) {
      setEditTitle(selected.title)
      setEditContent(selected.content)
      setEditProjectId(selected.projectId ?? '')
      setEditCategory(selected.category)
      setEditingId(selected.id)
    } else {
      setEditingId(null)
    }
  }, [selectedNoteId, selected])

  const filtered = useMemo(() => {
    return notes.filter((n) => {
      const catMatch = filter === 'all' || n.category === filter
      const searchMatch = !search.trim() ||
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase())
      return catMatch && searchMatch
    })
  }, [notes, filter, search])

  if (activeNav !== 'notes') return null

  const projectOf = (id?: string) => projects.find((p) => p.id === id)

  const handleCreate = () => {
    if (!newTitle.trim()) return
    createNote({
      title: newTitle.trim(),
      content: newContent.trim(),
      projectId: newProjectId || undefined,
      category: newCategory,
    })
    setNewTitle('')
    setNewContent('')
    setNewProjectId('')
    setNewCategory('general')
    setShowForm(false)
  }

  const handleSave = () => {
    if (!selected || !editTitle.trim()) return
    updateNote(selected.id, {
      title: editTitle.trim(),
      content: editContent.trim(),
      projectId: editProjectId || undefined,
      category: editCategory,
    })
  }

  const handleDelete = () => {
    if (!selected) return
    if (confirm(`Are you sure you want to delete note "${selected.title}"?`)) {
      deleteNote(selected.id)
    }
  }

  return (
    <div className="notes-overlay" role="dialog" aria-label="Notes">
      <section className="panel note-panel">
        <header className="tp-head">
          <div>
            <div className="tp-title">Workspace Notes</div>
            <div className="tp-sub">
              {filtered.length} of {notes.length} notes shards
            </div>
          </div>
          <button className="icon-btn" aria-label="Close" onClick={() => setNav('overview')}>
            <Icon name="close" size={18} />
          </button>
        </header>

        <div className="tp-toolbar">
          <div className="tp-filters">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`tp-filter${filter === cat.id ? ' active' : ''}`}
                onClick={() => setFilter(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="np-search-container">
            <Icon name="search" size={14} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes content…"
              className="np-search-input"
            />
          </div>
          <button className="tp-new" onClick={() => setShowForm(!showForm)}>
            <Icon name="plus" size={15} /> New Note
          </button>
        </div>

        {showForm && (
          <div className="np-form">
            <div className="np-form-row">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Note title…"
                autoFocus
                className="np-title-input"
              />
              <select value={newCategory} onChange={(e) => setNewCategory(e.target.value as NoteCategory)}>
                <option value="general">Category: General</option>
                <option value="spec">Category: Spec</option>
                <option value="idea">Category: Idea</option>
                <option value="log">Category: Log</option>
              </select>
              <select value={newProjectId} onChange={(e) => setNewProjectId(e.target.value)}>
                <option value="">Project: General</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    Project: {p.name}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Write note content (markdown supported)…"
              className="np-content-textarea"
              rows={4}
            />
            <div className="np-form-actions">
              <button className="tp-submit" onClick={handleCreate} disabled={!newTitle.trim()}>
                Create Shard
              </button>
              <button className="tp-cancel" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="tp-body">
          <div className="tp-list">
            {filtered.map((n) => {
              const p = projectOf(n.projectId)
              const color = CATEGORY_COLOR[n.category] ?? '#d946ef'
              return (
                <div
                  key={n.id}
                  className={`tp-row${selectedNoteId === n.id ? ' active' : ''}`}
                  onClick={() => selectNote(n.id)}
                >
                  <span className="np-bullet" style={{ backgroundColor: color }} />
                  <div className="tp-row-main">
                    <div className="tp-row-title">{n.title}</div>
                    <div className="tp-row-meta">
                      <span className="prio" style={{ color: color, borderColor: color }}>
                        {CATEGORY_LABEL[n.category].toUpperCase()}
                      </span>
                      {p && <span style={{ color: p.color }}>{p.code}</span>}
                      <span>{n.updatedAt}</span>
                    </div>
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <StateNotice
                title="No notes found"
                sub="Write a new note or adjust your filters."
                tone="empty"
              />
            )}
          </div>

          <aside className="tp-detail np-detail">
            {selected && editingId === selected.id ? (
              <div className="np-editor">
                <div className="np-editor-header">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Note title…"
                    className="np-edit-title-input"
                  />
                  <div className="np-meta-dropdowns">
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as NoteCategory)}
                    >
                      <option value="general">General</option>
                      <option value="spec">Spec</option>
                      <option value="idea">Idea</option>
                      <option value="log">Log</option>
                    </select>
                    <select value={editProjectId} onChange={(e) => setEditProjectId(e.target.value)}>
                      <option value="">General Project</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="np-editor-body">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Write content…"
                    className="np-edit-content-textarea"
                  />
                </div>

                <div className="np-editor-actions">
                  <button className="np-btn-save" onClick={handleSave} disabled={!editTitle.trim()}>
                    <Icon name="check" size={14} /> Save Edits
                  </button>
                  <button className="np-btn-delete" onClick={handleDelete}>
                    <Icon name="close" size={14} /> Delete Shard
                  </button>
                </div>
              </div>
            ) : (
              <StateNotice
                title="Select a Shard"
                sub="Choose a spatial data shard from the list or orbit to view/edit."
                tone="empty"
              />
            )}
          </aside>
        </div>
      </section>
    </div>
  )
}
