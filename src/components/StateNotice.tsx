import { Icon } from './icons'

type Tone = 'empty' | 'error' | 'loading'

const TONE_ICON: Record<Tone, string> = { empty: 'folder', error: 'close', loading: 'activity' }

export function StateNotice({
  tone = 'empty',
  title,
  sub,
}: {
  tone?: Tone
  title: string
  sub?: string
}) {
  return (
    <div className={`state-notice state-${tone}`} role="status">
      {tone === 'loading' ? (
        <span className="spinner" aria-hidden="true" />
      ) : (
        <span className="state-icon">
          <Icon name={TONE_ICON[tone]} size={18} />
        </span>
      )}
      <div className="state-title">{title}</div>
      {sub && <div className="state-sub">{sub}</div>}
    </div>
  )
}
