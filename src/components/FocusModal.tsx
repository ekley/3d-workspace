import { useState } from 'react'
import { useWorkspace } from '../state/workspace'
import { Icon } from './icons'

const PRESETS = [
  { label: 'Sprint', min: 15, mode: 'work' as const, desc: '15m fast burst' },
  { label: 'Deep Work', min: 25, mode: 'work' as const, desc: '25m standard sprint' },
  { label: 'Deep Dive', min: 45, mode: 'work' as const, desc: '45m sustained flow' },
  { label: 'Break', min: 5, mode: 'break' as const, desc: '5m cognitive reset' },
]

export function FocusModal() {
  const open = useWorkspace((s) => s.focusModalOpen)
  const setOpen = useWorkspace((s) => s.setFocusModalOpen)
  const timer = useWorkspace((s) => s.focusTimer)
  const projects = useWorkspace((s) => s.projects)
  const startTimer = useWorkspace((s) => s.startFocusTimer)
  const pauseTimer = useWorkspace((s) => s.pauseFocusTimer)
  const resumeTimer = useWorkspace((s) => s.resumeFocusTimer)
  const stopTimer = useWorkspace((s) => s.stopFocusTimer)

  const [selectedMin, setSelectedMin] = useState(25)
  const [selectedMode, setSelectedMode] = useState<'work' | 'break'>('work')
  const [projectId, setProjectId] = useState<string>('')

  if (!open) return null

  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const linkedProject = timer.projectId ? projects.find((p) => p.id === timer.projectId) : undefined
  const progressPct = timer.durationSec > 0
    ? Math.round(((timer.durationSec - timer.remainingSec) / timer.durationSec) * 100)
    : 0

  return (
    <div className="focus-overlay" onClick={() => setOpen(false)}>
      <section
        className="panel focus-panel"
        role="dialog"
        aria-label="Focus Protocol"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="tp-head">
          <div>
            <div className="tp-title">Focus Protocol</div>
            <div className="tp-sub">
              {timer.active ? (timer.mode === 'work' ? 'Deep work in progress' : 'Break in progress') : 'Deep work & sprint timer'}
            </div>
          </div>
          <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close">
            <Icon name="close" size={18} />
          </button>
        </header>

        {timer.active ? (
          <div className="focus-active-body">
            <div className="focus-display">
              <span className={`badge badge-${timer.mode === 'work' ? 'active' : 'completed'}`}>
                {timer.mode === 'work' ? '● HYPER FOCUS' : '☕ BREAK'}
              </span>
              <div className="focus-digits mono">{formatTime(timer.remainingSec)}</div>
              {linkedProject && (
                <div className="focus-proj-chip">
                  <span className="dot" style={{ background: linkedProject.color }} />
                  {linkedProject.name}
                </div>
              )}
            </div>

            <div className="pp-progress-bar focus-progress">
              <span style={{ width: `${progressPct}%` }} />
            </div>

            <div className="focus-ctrls">
              {timer.running ? (
                <button className="tp-new" onClick={pauseTimer}>
                  <Icon name="pause" size={16} /> Pause
                </button>
              ) : (
                <button className="tp-new" onClick={resumeTimer}>
                  <Icon name="play" size={16} /> Resume
                </button>
              )}
              <button className="icon-btn focus-stop-btn" onClick={stopTimer} aria-label="Stop timer" title="Stop timer">
                <Icon name="rotate" size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="focus-setup-body">
            <div className="setting-label">Select Protocol</div>
            <div className="focus-presets">
              {PRESETS.map((p) => {
                const active = selectedMin === p.min && selectedMode === p.mode
                return (
                  <button
                    key={`${p.mode}-${p.min}`}
                    className={`focus-preset-card${active ? ' active' : ''}`}
                    onClick={() => {
                      setSelectedMin(p.min)
                      setSelectedMode(p.mode)
                    }}
                  >
                    <div className="focus-preset-time mono">{p.min}m</div>
                    <div className="focus-preset-title">{p.label}</div>
                    <div className="focus-preset-desc">{p.desc}</div>
                  </button>
                )
              })}
            </div>

            <div className="focus-form-group">
              <label className="setting-label" htmlFor="focus-project-select">
                Target Project (optional)
              </label>
              <select
                id="focus-project-select"
                className="tp-select"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              >
                <option value="">None / General Focus</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>

            <button
              className="tp-new focus-start-btn"
              onClick={() => {
                startTimer(selectedMin, selectedMode, projectId || undefined)
              }}
            >
              <Icon name="zap" size={16} /> Launch Protocol ({selectedMin}m)
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
