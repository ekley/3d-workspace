import { Icon } from './icons'
import { NAV_ITEMS, useWorkspace } from '../state/workspace'

export function SideDock() {
  const active = useWorkspace((s) => s.activeNav)
  const setNav = useWorkspace((s) => s.setNav)

  return (
    <nav className="dock left" aria-label="Primary navigation">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          className={`dock-item${active === item.id ? ' active' : ''}`}
          onClick={() => setNav(item.id)}
          aria-label={item.label}
          aria-current={active === item.id ? 'page' : undefined}
        >
          <Icon name={item.icon} size={20} />
          <span className="tip">{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
