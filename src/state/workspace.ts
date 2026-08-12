import { create } from 'zustand'

export type Mode = 'immersive' | 'productivity'

export interface User {
  name: string
  handle: string
  initials: string
  level: number
  xp: number
  xpToNext: number
  streak: number
  productivity: number
}

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
  setMode: (mode: Mode) => void
  setNav: (id: string) => void
}

export const useWorkspace = create<WorkspaceState>((set) => ({
  mode: 'immersive',
  activeNav: 'overview',
  user: {
    name: 'Elena Voss',
    handle: 'evoss',
    initials: 'EV',
    level: 27,
    xp: 6820,
    xpToNext: 8000,
    streak: 14,
    productivity: 92,
  },
  setMode: (mode) => set({ mode }),
  setNav: (activeNav) => set({ activeNav }),
}))
