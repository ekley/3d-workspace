import { useMemo, useState } from 'react'
import type { FileCategory, FileItem } from '../data/types'
import { useWorkspace } from '../state/workspace'
import { Icon } from './icons'
import { StateNotice } from './StateNotice'

const CATS: { id: FileCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'documents', label: 'Documents' },
  { id: 'code', label: 'Code' },
  { id: 'design', label: 'Design' },
  { id: 'images', label: 'Images' },
]

const CAT_LABEL: Record<string, string> = {
  documents: 'Documents',
  code: 'Code',
  design: 'Design',
  images: 'Images',
}

const EXT_COLOR: Record<string, string> = {
  md: '#22d3ee',
  ts: '#8b7cf6',
  js: '#fbbf24',
  py: '#34d399',
  yml: '#f472b6',
  json: '#fbbf24',
  svg: '#f472b6',
  fig: '#f472b6',
  png: '#34d399',
  pdf: '#f87171',
  docx: '#6b8af0',
}

export function FilePanel() {
  const activeNav = useWorkspace((s) => s.activeNav)
  const setNav = useWorkspace((s) => s.setNav)
  const files = useWorkspace((s) => s.files)
  const projects = useWorkspace((s) => s.projects)
  const selectedCategory = useWorkspace((s) => s.selectedCategory)
  const selectCategory = useWorkspace((s) => s.selectCategory)
  const selectedFileId = useWorkspace((s) => s.selectedFileId)
  const selectFile = useWorkspace((s) => s.selectFile)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return files.filter(
      (f) =>
        (selectedCategory === 'all' || f.category === selectedCategory) &&
        (!q || f.name.toLowerCase().includes(q) || f.folder.toLowerCase().includes(q)),
    )
  }, [files, selectedCategory, query])

  if (activeNav !== 'files') return null

  const selected = files.find((f) => f.id === selectedFileId)
  const projectOf = (id?: string) => projects.find((p) => p.id === id)

  const groups: { cat: FileCategory; folder: string; items: FileItem[] }[] = []
  for (const f of filtered) {
    const key = `${f.category}/${f.folder}`
    let g = groups.find((x) => `${x.cat}/${x.folder}` === key)
    if (!g) {
      g = { cat: f.category, folder: f.folder, items: [] }
      groups.push(g)
    }
    g.items.push(f)
  }

  return (
    <div className="file-overlay" role="dialog" aria-label="Files">
      <section className="panel file-panel">
        <header className="tp-head">
          <div>
            <div className="tp-title">Files</div>
            <div className="tp-sub">
              {filtered.length} of {files.length} files
            </div>
          </div>
          <button className="icon-btn" onClick={() => setNav('overview')} aria-label="Close">
            <Icon name="close" size={18} />
          </button>
        </header>

        <div className="tp-toolbar">
          <div className="tp-filters">
            {CATS.map((c) => (
              <button
                key={c.id}
                className={`tp-filter${selectedCategory === c.id ? ' active' : ''}`}
                onClick={() => selectCategory(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="file-search">
            <Icon name="search" size={14} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search files…"
            />
          </div>
        </div>

        <div className="tp-body">
          <div className="file-list">
            {groups.map((g) => (
              <div key={`${g.cat}/${g.folder}`} className="file-group">
                <div className="file-group-head">
                  <span className="file-group-cat">{CAT_LABEL[g.cat]}</span>
                  <span className="file-group-folder">/ {g.folder}</span>
                </div>
                {g.items.map((f) => (
                  <div
                    key={f.id}
                    className={`file-row${selectedFileId === f.id ? ' active' : ''}`}
                    onClick={() => selectFile(f.id)}
                  >
                    <span className="file-ext" style={{ color: EXT_COLOR[f.ext] ?? 'var(--text-1)' }}>
                      {f.ext}
                    </span>
                    <div className="file-main">
                      <div className="file-name">{f.name}</div>
                      <div className="file-meta">
                        {f.size} · {f.updatedAt}
                      </div>
                    </div>
                    {f.projectId && <span className="file-proj">{projectOf(f.projectId)?.code}</span>}
                  </div>
                ))}
              </div>
            ))}
            {filtered.length === 0 && <StateNotice title="No files match." sub="Try another category or search term." />}
          </div>

          {selected && (
            <aside className="tp-detail">
              <div className="file-detail-icon">
                <Icon name="file" size={22} />
              </div>
              <div className="tp-detail-title">{selected.name}</div>
              <div className="tp-detail-meta">
                {CAT_LABEL[selected.category]} / {selected.folder}
              </div>
              <div className="tp-detail-grid">
                <div className="tp-detail-cell">
                  <span className="pp-stat-label">Size</span>
                  <span>{selected.size}</span>
                </div>
                <div className="tp-detail-cell">
                  <span className="pp-stat-label">Updated</span>
                  <span>{selected.updatedAt}</span>
                </div>
                <div className="tp-detail-cell">
                  <span className="pp-stat-label">Type</span>
                  <span>.{selected.ext}</span>
                </div>
                <div className="tp-detail-cell">
                  <span className="pp-stat-label">Project</span>
                  <span>{projectOf(selected.projectId)?.name ?? '—'}</span>
                </div>
              </div>
            </aside>
          )}
        </div>
      </section>
    </div>
  )
}
