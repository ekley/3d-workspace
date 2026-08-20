import { useWorkspace } from '../state/workspace'
import { Icon } from './icons'

const QUALITY_OPTIONS = ['auto', 'low', 'high'] as const

export function SettingsPanel() {
  const open = useWorkspace((s) => s.settingsOpen)
  const setOpen = useWorkspace((s) => s.setSettingsOpen)
  const settings = useWorkspace((s) => s.settings)
  const update = useWorkspace((s) => s.updateSettings)

  if (!open) return null

  return (
    <div className="settings-overlay" onClick={() => setOpen(false)}>
      <section
        className="panel settings-panel"
        role="dialog"
        aria-label="Settings"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="tp-head">
          <div>
            <div className="tp-title">Settings</div>
            <div className="tp-sub">Workspace preferences</div>
          </div>
          <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close">
            <Icon name="close" size={18} />
          </button>
        </header>

        <div className="settings-body">
          <button
            className="setting-row"
            role="switch"
            aria-checked={settings.disable3D}
            onClick={() => update({ disable3D: !settings.disable3D })}
          >
            <span className="setting-text">
              <span className="setting-label">Disable 3D</span>
              <span className="setting-desc">Use the 2D productivity workspace only.</span>
            </span>
            <span className={`switch${settings.disable3D ? ' on' : ''}`}>
              <span className="knob" />
            </span>
          </button>

          <button
            className="setting-row"
            role="switch"
            aria-checked={settings.soundEnabled}
            onClick={() => update({ soundEnabled: !settings.soundEnabled })}
          >
            <span className="setting-text">
              <span className="setting-label">Sound FX</span>
              <span className="setting-desc">Procedural Web Audio cyber feedback for tasks, XP and timer.</span>
            </span>
            <span className={`switch${settings.soundEnabled ? ' on' : ''}`}>
              <span className="knob" />
            </span>
          </button>

          <button
            className="setting-row"
            role="switch"
            aria-checked={settings.reducedMotion}
            onClick={() => update({ reducedMotion: !settings.reducedMotion })}
          >
            <span className="setting-text">
              <span className="setting-label">Reduced motion</span>
              <span className="setting-desc">Replace movement with fades and simple state changes.</span>
            </span>
            <span className={`switch${settings.reducedMotion ? ' on' : ''}`}>
              <span className="knob" />
            </span>
          </button>

          <div className="setting-block">
            <div className="setting-label">Performance</div>
            <div className="seg" role="group" aria-label="Performance quality">
              {QUALITY_OPTIONS.map((q) => (
                <button
                  key={q}
                  className={`seg-btn${settings.quality === q ? ' active' : ''}`}
                  onClick={() => update({ quality: q })}
                  aria-pressed={settings.quality === q}
                >
                  {q}
                </button>
              ))}
            </div>
            <div className="setting-desc">
              Low reduces particles, shadows and resolution for weaker devices.
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
