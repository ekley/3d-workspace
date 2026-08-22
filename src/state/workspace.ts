import { create } from 'zustand'
import type { ActivityEvent, CalendarEvent, FileCategory, FileItem, Project, Task, User } from '../data/types'
import { ACTIVITY, EVENTS, FILES, PROJECTS, TASKS, USER } from '../data/mock'
import { taskOrbitPosition } from '../three/layout'
import { playFocusDoneSound, playFocusStartSound, playLevelUpSound, playTaskCompleteSound } from '../sound/audio'

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

let seq = 0
function ev(
  type: string,
  icon: string,
  title: string,
  detail: string,
  severity: ActivityEvent['severity'],
  projectId?: string,
): ActivityEvent {
  return { id: `ev-${Date.now()}-${seq++}`, type, icon, title, detail, time: 'Just now', severity, projectId }
}

export interface NewTaskInput {
  projectId: string
  title: string
  priority?: Task['priority']
  assignee?: string
  dueDate?: string
  estimate?: string
}

export type Quality = 'auto' | 'low' | 'high'

export interface Settings {
  quality: Quality
  disable3D: boolean
  reducedMotion: boolean
  soundEnabled: boolean
}

export interface FocusTimer {
  active: boolean
  running: boolean
  mode: 'work' | 'break'
  durationSec: number
  remainingSec: number
  projectId?: string
}

interface WorkspaceState {
  mode: Mode
  activeNav: string
  user: User
  projects: Project[]
  tasks: Task[]
  activity: ActivityEvent[]
  files: FileItem[]
  events: CalendarEvent[]
  selectedProjectId: string | null
  focusedProjectId: string | null
  selectedTaskId: string | null
  selectedFileId: string | null
  selectedCategory: FileCategory | 'all'
  selectedEventId: string | null
  profileOpen: boolean
  commandOpen: boolean
  terminalOpen: boolean
  // workspace activity signal (0..1): drives core reactivity
  activityLevel: number
  corePulse: number
  // taskId → { from orbit pos, startedAt } for the fly-to-core animation
  completedFx: Record<string, { from: [number, number, number]; at: number }>
  settings: Settings
  settingsOpen: boolean
  levelUp: number | null
  taskFormOpen: boolean
  focusMode: boolean
  focusModalOpen: boolean
  focusTimer: FocusTimer
  setMode: (mode: Mode) => void
  setSettingsOpen: (open: boolean) => void
  updateSettings: (patch: Partial<Settings>) => void
  clearLevelUp: () => void
  setTaskFormOpen: (open: boolean) => void
  toggleFocusMode: () => void
  setFocusModalOpen: (open: boolean) => void
  setTerminalOpen: (open: boolean) => void
  toggleTerminal: () => void
  startFocusTimer: (minutes: number, mode?: 'work' | 'break', projectId?: string) => void
  pauseFocusTimer: () => void
  resumeFocusTimer: () => void
  stopFocusTimer: () => void
  setNav: (id: string) => void
  selectProject: (id: string | null) => void
  focusProject: (id: string | null) => void
  selectTask: (id: string | null) => void
  selectFile: (id: string | null) => void
  selectCategory: (cat: FileCategory | 'all') => void
  selectEvent: (id: string | null) => void
  setProfileOpen: (open: boolean) => void
  setCommandOpen: (open: boolean) => void
  bumpActivity: (amount?: number) => void
  completeTask: (id: string) => void
  createTask: (input: NewTaskInput) => void
  updateTask: (id: string, patch: Partial<Task>) => void
  clearCompletedFx: (id: string) => void
}

export const useWorkspace = create<WorkspaceState>((set) => ({
  mode: 'immersive',
  activeNav: 'overview',
  user: USER,
  projects: PROJECTS,
  tasks: TASKS,
  activity: ACTIVITY,
  files: FILES,
  events: EVENTS,
  selectedProjectId: null,
  focusedProjectId: null,
  selectedTaskId: null,
  selectedFileId: null,
  selectedCategory: 'all',
  selectedEventId: null,
  profileOpen: false,
  commandOpen: false,
  terminalOpen: false,
  activityLevel: 0,
  corePulse: 0,
  completedFx: {},
  settings: {
    quality: 'auto',
    disable3D: false,
    soundEnabled: true,
    reducedMotion:
      typeof window !== 'undefined' &&
      !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  },
  settingsOpen: false,
  levelUp: null,
  taskFormOpen: false,
  focusMode: false,
  focusModalOpen: false,
  focusTimer: {
    active: false,
    running: false,
    mode: 'work',
    durationSec: 25 * 60,
    remainingSec: 25 * 60,
  },

  setMode: (mode) => set({ mode }),
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
  updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
  clearLevelUp: () => set({ levelUp: null }),
  setTaskFormOpen: (taskFormOpen) => set({ taskFormOpen }),
  toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode })),
  setFocusModalOpen: (focusModalOpen) => set({ focusModalOpen }),
  setTerminalOpen: (terminalOpen) => set({ terminalOpen }),
  toggleTerminal: () => set((s) => ({ terminalOpen: !s.terminalOpen })),

  startFocusTimer: (minutes, mode = 'work', projectId) => {
    const s = useWorkspace.getState()
    const sec = Math.max(1, Math.round(minutes * 60))
    if (s.settings.soundEnabled) playFocusStartSound()
    set({
      focusTimer: {
        active: true,
        running: true,
        mode,
        durationSec: sec,
        remainingSec: sec,
        projectId,
      },
      activityLevel: 1,
      corePulse: s.corePulse + 1,
    })
  },

  pauseFocusTimer: () =>
    set((st) => ({ focusTimer: { ...st.focusTimer, running: false } })),

  resumeFocusTimer: () =>
    set((st) => ({ focusTimer: { ...st.focusTimer, running: true } })),

  stopFocusTimer: () =>
    set((st) => ({
      focusTimer: {
        ...st.focusTimer,
        active: false,
        running: false,
        remainingSec: st.focusTimer.durationSec,
      },
    })),
  setNav: (activeNav) => set({ activeNav }),
  selectProject: (selectedProjectId) => set({ selectedProjectId }),
  focusProject: (focusedProjectId) =>
    set((s) => ({
      focusedProjectId,
      activityLevel: focusedProjectId ? Math.min(1, s.activityLevel + 0.25) : s.activityLevel,
      corePulse: focusedProjectId ? s.corePulse + 1 : s.corePulse,
    })),
  selectTask: (selectedTaskId) => set({ selectedTaskId }),
  selectFile: (selectedFileId) => set({ selectedFileId }),
  selectCategory: (selectedCategory) => set({ selectedCategory }),
  selectEvent: (selectedEventId) => set({ selectedEventId }),
  setProfileOpen: (profileOpen) => set({ profileOpen }),
  setCommandOpen: (commandOpen) => set({ commandOpen }),
  bumpActivity: (amount = 0.6) =>
    set((s) => ({ activityLevel: Math.min(1, s.activityLevel + amount), corePulse: s.corePulse + 1 })),

  completeTask: (id) => {
    const s = useWorkspace.getState()
    const task = s.tasks.find((t) => t.id === id)
    if (!task || task.status === 'completed') return
    const gain = task.priority === 'high' ? 60 : task.priority === 'medium' ? 40 : 25
    const from = taskOrbitPosition(s.tasks, s.projects, task.projectId, id) ?? [0, 0.6, 0]

    const project = s.projects.find((p) => p.id === task.projectId)
    const ships = !!project && project.doneCount + 1 >= project.taskCount

    let { level, xp, xpToNext } = s.user
    xp += gain
    const events: ActivityEvent[] = []
    const isLevelUp = xp >= xpToNext
    if (isLevelUp) {
      xp -= xpToNext
      level += 1
      xpToNext = Math.round(xpToNext * 1.15)
      events.push(ev('level-up', 'zap', 'LEVEL UP', `Reached level ${level}`, 'success'))
    }
    events.push(ev('task-completed', 'check', 'TASK COMPLETED', `${task.title} · +${gain} XP`, 'success', task.projectId))
    if (ships) {
      events.push(ev('milestone', 'check', 'PROJECT SHIPPED', `${project?.name ?? 'Project'} · all tasks complete`, 'success', task.projectId))
    }

    if (s.settings.soundEnabled) {
      if (isLevelUp) playLevelUpSound()
      else playTaskCompleteSound()
    }

    set((st) => ({
      tasks: st.tasks.map((t) => (t.id === id ? { ...t, status: 'completed' as const } : t)),
      projects: st.projects.map((p) =>
        p.id === task.projectId
          ? {
              ...p,
              doneCount: p.doneCount + 1,
              progress: Math.min(100, Math.round(((p.doneCount + 1) / p.taskCount) * 100)),
              status: p.doneCount + 1 >= p.taskCount ? 'completed' : p.status,
              lastActivity: `Just now · ${task.title} completed`,
            }
          : p,
      ),
      user: { ...st.user, level, xp, xpToNext },
      activity: [...events, ...st.activity],
      activityLevel: 1,
      corePulse: st.corePulse + 1,
      levelUp: level !== st.user.level ? level : st.levelUp,
      completedFx: { ...st.completedFx, [id]: { from, at: performance.now() } },
    }))
  },

  createTask: (input) => {
    const task: Task = {
      id: `t-${Date.now()}`,
      projectId: input.projectId,
      title: input.title,
      status: 'backlog',
      priority: input.priority ?? 'medium',
      assignee: input.assignee ?? 'Elena',
      dueDate: input.dueDate ?? 'TBD',
      estimate: input.estimate ?? '1d',
      tags: [],
    }
    set((st) => ({
      tasks: [...st.tasks, task],
      projects: st.projects.map((p) =>
        p.id === input.projectId
          ? {
              ...p,
              taskCount: p.taskCount + 1,
              progress: Math.min(100, Math.round((p.doneCount / (p.taskCount + 1)) * 100)),
              status: p.status === 'completed' ? 'active' : p.status,
            }
          : p,
      ),
      activity: [ev('task-created', 'plus', 'TASK CREATED', input.title, 'info', input.projectId), ...st.activity],
      activityLevel: Math.min(1, st.activityLevel + 0.3),
      corePulse: st.corePulse + 1,
    }))
  },

  updateTask: (id, patch) =>
    set((st) => ({ tasks: st.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),

  clearCompletedFx: (id) =>
    set((st) => {
      const next = { ...st.completedFx }
      delete next[id]
      return { completedFx: next }
    }),
}))

// ponytail: module timers for activity decay (100ms) and focus sprint ticking (1s)
setInterval(() => {
  const s = useWorkspace.getState()
  if (s.activityLevel > 0) {
    useWorkspace.setState({ activityLevel: Math.max(0, s.activityLevel - 0.012) })
  }
}, 100)

setInterval(() => {
  const s = useWorkspace.getState()
  const { focusTimer, user, settings } = s
  if (!focusTimer.active || !focusTimer.running) return

  if (focusTimer.remainingSec > 1) {
    useWorkspace.setState({
      focusTimer: { ...focusTimer, remainingSec: focusTimer.remainingSec - 1 },
    })
  } else {
    // Focus sprint / break completed!
    const isWork = focusTimer.mode === 'work'
    const gain = isWork ? 75 : 15
    const proj = focusTimer.projectId ? s.projects.find((p) => p.id === focusTimer.projectId) : undefined
    const durationMin = Math.round(focusTimer.durationSec / 60)
    
    let { level, xp, xpToNext } = user
    xp += gain
    const events: ActivityEvent[] = []
    const isLevelUp = xp >= xpToNext
    if (isLevelUp) {
      xp -= xpToNext
      level += 1
      xpToNext = Math.round(xpToNext * 1.15)
      events.push(ev('level-up', 'zap', 'LEVEL UP', `Reached level ${level}`, 'success'))
    }

    events.push(
      ev(
        'focus-complete',
        'zap',
        isWork ? 'FOCUS SPRINT COMPLETE' : 'BREAK COMPLETE',
        isWork
          ? `${durationMin}m sprint completed${proj ? ` · ${proj.name}` : ''} · +${gain} XP`
          : `${durationMin}m break ended · +${gain} XP`,
        'success',
        focusTimer.projectId,
      ),
    )

    if (settings.soundEnabled) {
      if (isLevelUp) playLevelUpSound()
      else playFocusDoneSound()
    }

    useWorkspace.setState({
      focusTimer: {
        ...focusTimer,
        active: false,
        running: false,
        remainingSec: 0,
      },
      user: { ...user, level, xp, xpToNext },
      activity: [...events, ...s.activity],
      activityLevel: 1,
      corePulse: s.corePulse + 1,
      levelUp: isLevelUp ? level : s.levelUp,
    })
  }
}, 1000)
