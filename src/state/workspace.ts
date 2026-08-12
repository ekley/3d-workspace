import { create } from 'zustand'
import type { User } from '../data/types'
import { USER } from '../data/mock'

export type Mode = 'immersive' | 'productivity'

export interface NavItem {
  id: string
  label: string
  icon: string
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: 'grid' },
  { id: 'projects', label: 'Projects', icon: 'layers' },
  { id: 'tasks', label: 'Tasks', icon: 'check' },
  { id: 'files', label: 'Files', icon: 'folder' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar' },
  { id: 'activity', label: 'Activity', icon: 'activity' },
]

interface WorkspaceState {
  mode: Mode
  activeNav: string
  user: User
  // workspace activity signal (0..1) — drives core reactivity
  activityLevel: number
  // increments on every activity bump; 3D core reacts to the delta
  corePulse: number
  setMode: (mode: Mode) => void
  setNav: (id: string) => void
  bumpActivity: (amount?: number) => void
}

export const useWorkspace = create<WorkspaceState>((set) => ({
  mode: 'immersive',
  activeNav: 'overview',
  user: USER,
  activityLevel: 0,
  corePulse: 0,
  setMode: (mode) => set({ mode }),
  setNav: (activeNav) => set({ activeNav }),
  bumpActivity: (amount = 0.6) =>
    set((s) => ({
      activityLevel: Math.min(1, s.activityLevel + amount),
      corePulse: s.corePulse + 1,
    })),
}))

// ponytail: one module-level timer decays the signal; enough for a single signal,
// swap for a per-signal decay in the 3D loop if more signals appear.
setInterval(() => {
  useWorkspace.setState((s) => ({
    activityLevel: s.activityLevel > 0 ? Math.max(0, s.activityLevel - 0.012) : 0,
  }))
}, 100)
