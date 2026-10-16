import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

export type TaskStatus = 'backlog' | 'in-progress' | 'review' | 'completed'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  projectId: string
  title: string
  status: TaskStatus
  priority: TaskPriority
  assignee: string
  dueDate: string
  estimate: string
  tags: string[]
}

export interface WorkspaceSummary {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  completionRate: number
  byStatus: {
    backlog: number
    inProgress: number
    review: number
    completed: number
  }
  byPriority: {
    low: number
    medium: number
    high: number
  }
  projects: Array<{
    id: string
    taskCount: number
    doneCount: number
    progress: number
  }>
}

export const DEFAULT_TASKS: Task[] = [
  { id: 'atl-1', projectId: 'atlas', title: 'Design query builder UI', status: 'in-progress', priority: 'high', assignee: 'Kira', dueDate: 'Mar 14', estimate: '3d', tags: ['ui'] },
  { id: 'atl-2', projectId: 'atlas', title: 'Implement anomaly detection pipeline', status: 'completed', priority: 'high', assignee: 'Sam', dueDate: 'Mar 10', estimate: '5d', tags: ['ml'] },
  { id: 'atl-3', projectId: 'atlas', title: 'Wire dashboard to telemetry API', status: 'completed', priority: 'medium', assignee: 'Elena', dueDate: 'Mar 09', estimate: '2d', tags: ['api'] },
  { id: 'atl-4', projectId: 'atlas', title: 'Add CSV export for reports', status: 'backlog', priority: 'low', assignee: 'Priya', dueDate: 'Mar 20', estimate: '1d', tags: ['data'] },

  { id: 'hel-1', projectId: 'helios', title: 'Publish v3 token set', status: 'completed', priority: 'high', assignee: 'Mina', dueDate: 'Mar 08', estimate: '1d', tags: ['design'] },
  { id: 'hel-2', projectId: 'helios', title: 'Build data-table component', status: 'in-progress', priority: 'medium', assignee: 'Leo', dueDate: 'Mar 18', estimate: '4d', tags: ['components'] },
  { id: 'hel-3', projectId: 'helios', title: 'Document theming API', status: 'review', priority: 'medium', assignee: 'Elena', dueDate: 'Mar 12', estimate: '1d', tags: ['docs'] },
  { id: 'hel-4', projectId: 'helios', title: 'Dark-mode contrast audit', status: 'backlog', priority: 'low', assignee: 'Mina', dueDate: 'Mar 22', estimate: '2d', tags: ['a11y'] },

  { id: 'vlt-1', projectId: 'vault', title: 'Fix key-rotation race condition', status: 'in-progress', priority: 'high', assignee: 'Sam', dueDate: 'Mar 19', estimate: '3d', tags: ['security'] },
  { id: 'vlt-2', projectId: 'vault', title: 'Implement audit log export', status: 'completed', priority: 'medium', assignee: 'Priya', dueDate: 'Mar 05', estimate: '2d', tags: ['backend'] },
  { id: 'vlt-3', projectId: 'vault', title: 'Zero-trust access review', status: 'review', priority: 'high', assignee: 'Elena', dueDate: 'Mar 15', estimate: '1d', tags: ['security'] },
  { id: 'vlt-4', projectId: 'vault', title: 'Add HSM integration', status: 'backlog', priority: 'high', assignee: 'Sam', dueDate: 'Mar 25', estimate: '5d', tags: ['infra'] },

  { id: 'pls-1', projectId: 'pulse', title: 'Ship v2.0.0', status: 'completed', priority: 'high', assignee: 'Elena', dueDate: 'Feb 27', estimate: '3d', tags: ['release'] },
  { id: 'pls-2', projectId: 'pulse', title: 'Anomaly alert routing', status: 'completed', priority: 'high', assignee: 'Leo', dueDate: 'Feb 24', estimate: '4d', tags: ['alerts'] },
  { id: 'pls-3', projectId: 'pulse', title: 'On-call rotation sync', status: 'completed', priority: 'medium', assignee: 'Mina', dueDate: 'Feb 20', estimate: '1d', tags: ['ops'] },
  { id: 'pls-4', projectId: 'pulse', title: 'P99 latency dashboards', status: 'completed', priority: 'medium', assignee: 'Priya', dueDate: 'Feb 18', estimate: '2d', tags: ['metrics'] },

  { id: 'drf-1', projectId: 'drift', title: 'Define offline sync strategy', status: 'backlog', priority: 'high', assignee: 'Elena', dueDate: 'Apr 01', estimate: '3d', tags: ['mobile'] },
  { id: 'drf-2', projectId: 'drift', title: 'Push notification deep links', status: 'backlog', priority: 'medium', assignee: 'Leo', dueDate: 'Apr 08', estimate: '2d', tags: ['mobile'] },
  { id: 'drf-3', projectId: 'drift', title: 'App store screenshots', status: 'backlog', priority: 'low', assignee: 'Mina', dueDate: 'Apr 15', estimate: '1d', tags: ['design'] },
]

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.join(__dirname, 'data')
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json')

class TaskStore {
  private tasks: Task[] = []

  constructor() {
    this.init()
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true })
      }

      if (fs.existsSync(TASKS_FILE)) {
        const raw = fs.readFileSync(TASKS_FILE, 'utf-8')
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.tasks = parsed
          return
        }
      }

      // Initialize with default tasks if not present or empty
      this.tasks = [...DEFAULT_TASKS]
      this.save()
    } catch (err) {
      console.error('[TaskStore] Error initializing task database:', err)
      this.tasks = [...DEFAULT_TASKS]
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true })
      }
      fs.writeFileSync(TASKS_FILE, JSON.stringify(this.tasks, null, 2), 'utf-8')
    } catch (err) {
      console.error('[TaskStore] Error persisting tasks to disk:', err)
    }
  }

  public getAllTasks(filter?: { projectId?: string; status?: TaskStatus; priority?: TaskPriority }): Task[] {
    let result = [...this.tasks]
    if (filter?.projectId) {
      result = result.filter((t) => t.projectId.toLowerCase() === filter.projectId!.toLowerCase())
    }
    if (filter?.status) {
      result = result.filter((t) => t.status.toLowerCase() === filter.status!.toLowerCase())
    }
    if (filter?.priority) {
      result = result.filter((t) => t.priority.toLowerCase() === filter.priority!.toLowerCase())
    }
    return result
  }

  public getTaskById(id: string): Task | undefined {
    return this.tasks.find((t) => t.id.toLowerCase() === id.toLowerCase())
  }

  public createTask(input: {
    projectId: string
    title: string
    priority?: TaskPriority
    assignee?: string
    dueDate?: string
    estimate?: string
    tags?: string[]
  }): Task {
    const prefix = input.projectId.substring(0, 3).toLowerCase()
    const id = `${prefix}-${Date.now().toString().slice(-4)}`
    
    const newTask: Task = {
      id,
      projectId: input.projectId.toLowerCase(),
      title: input.title.trim(),
      status: 'backlog',
      priority: input.priority || 'medium',
      assignee: input.assignee || 'Elena',
      dueDate: input.dueDate || 'TBD',
      estimate: input.estimate || '1d',
      tags: input.tags || [],
    }

    this.tasks.push(newTask)
    this.save()
    return newTask
  }

  public updateTask(id: string, patch: Partial<Omit<Task, 'id'>>): Task | null {
    const idx = this.tasks.findIndex((t) => t.id.toLowerCase() === id.toLowerCase())
    if (idx === -1) return null

    const existing = this.tasks[idx]
    const updated: Task = {
      ...existing,
      ...patch,
      id: existing.id, // prevent ID change
    }

    this.tasks[idx] = updated
    this.save()
    return updated
  }

  public completeTask(id: string): { task: Task; xpGain: number } | null {
    const task = this.getTaskById(id)
    if (!task) return null

    const xpGain = task.priority === 'high' ? 60 : task.priority === 'medium' ? 40 : 25
    task.status = 'completed'
    this.save()

    return { task, xpGain }
  }

  public deleteTask(id: string): boolean {
    const idx = this.tasks.findIndex((t) => t.id.toLowerCase() === id.toLowerCase())
    if (idx === -1) return false

    this.tasks.splice(idx, 1)
    this.save()
    return true
  }

  public resetTasks(): Task[] {
    this.tasks = JSON.parse(JSON.stringify(DEFAULT_TASKS))
    this.save()
    return this.tasks
  }

  public getWorkspaceSummary(): WorkspaceSummary {
    const totalTasks = this.tasks.length
    let completedTasks = 0
    let pendingTasks = 0
    const byStatus = { backlog: 0, inProgress: 0, review: 0, completed: 0 }
    const byPriority = { low: 0, medium: 0, high: 0 }

    const projectMap = new Map<string, { taskCount: number; doneCount: number }>()

    for (const t of this.tasks) {
      if (t.status === 'completed') {
        completedTasks++
        byStatus.completed++
      } else {
        pendingTasks++
        if (t.status === 'in-progress') byStatus.inProgress++
        else if (t.status === 'review') byStatus.review++
        else if (t.status === 'backlog') byStatus.backlog++
      }

      if (t.priority === 'high') byPriority.high++
      else if (t.priority === 'medium') byPriority.medium++
      else if (t.priority === 'low') byPriority.low++

      const pId = t.projectId.toLowerCase()
      const pData = projectMap.get(pId) || { taskCount: 0, doneCount: 0 }
      pData.taskCount++
      if (t.status === 'completed') {
        pData.doneCount++
      }
      projectMap.set(pId, pData)
    }

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 1000) / 10 : 0

    const projects = Array.from(projectMap.entries()).map(([id, stats]) => ({
      id,
      taskCount: stats.taskCount,
      doneCount: stats.doneCount,
      progress: stats.taskCount > 0 ? Math.round((stats.doneCount / stats.taskCount) * 100) : 0,
    }))

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate,
      byStatus,
      byPriority,
      projects,
    }
  }
}

export const taskStore = new TaskStore()
