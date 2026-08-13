import { create } from 'zustand'
import type { ActivityEvent, CalendarEvent, FileCategory, FileItem, Project, Task, User } from '../data/types'
import { ACTIVITY, EVENTS, FILES, PROJECTS, TASKS, USER } from '../data/mock'
import { taskOrbitPosition } from '../three/layout'

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
  // workspace activity signal (0..1) — drives core reactivity
  activityLevel: number
  corePulse: number
  // taskId → { from orbit pos, startedAt } for the fly-to-core animation
  completedFx: Record<string, { from: [number, number, number]; at: number }>
  setMode: (mode: Mode) => void
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
  activityLevel: 0,
  corePulse: 0,
  completedFx: {},

  setMode: (mode) => set({ mode }),
  setNav: (activeNav) => set({ activeNav }),
  selectProject: (selectedProjectId) => set({ selectedProjectId }),
  focusProject: (focusedProjectId) => set({ focusedProjectId }),
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

    let { level, xp, xpToNext } = s.user
    xp += gain
    const events: ActivityEvent[] = []
    if (xp >= xpToNext) {
      xp -= xpToNext
      level += 1
      xpToNext = Math.round(xpToNext * 1.15)
      events.push(ev('level-up', 'zap', 'LEVEL UP', `Reached level ${level}`, 'success'))
    }
    events.push(ev('task-completed', 'check', 'TASK COMPLETED', `${task.title} · +${gain} XP`, 'success', task.projectId))

    set((st) => ({
      tasks: st.tasks.map((t) => (t.id === id ? { ...t, status: 'completed' as const } : t)),
      projects: st.projects.map((p) =>
        p.id === task.projectId
          ? {
              ...p,
              doneCount: p.doneCount + 1,
              progress: Math.min(100, Math.round(((p.doneCount + 1) / p.taskCount) * 100)),
              lastActivity: `Just now · ${task.title} completed`,
            }
          : p,
      ),
      user: { ...st.user, level, xp, xpToNext },
      activity: [...events, ...st.activity],
      activityLevel: 1,
      corePulse: st.corePulse + 1,
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
        p.id === input.projectId ? { ...p, taskCount: p.taskCount + 1 } : p,
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

// ponytail: one module-level timer decays the signal; enough for a single signal,
// swap for a per-signal decay in the 3D loop if more signals appear.
setInterval(() => {
  useWorkspace.setState((s) => ({
    activityLevel: s.activityLevel > 0 ? Math.max(0, s.activityLevel - 0.012) : 0,
  }))
}, 100)
