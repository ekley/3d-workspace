import { taskStore, Task } from './taskStore'

export type ProjectStatus = 'active' | 'at-risk' | 'paused' | 'completed'

export interface Project {
  id: string
  name: string
  code: string
  description: string
  status: ProjectStatus
  deadline: string
  color: string
  lastActivity: string
}

export interface ProjectWithStats extends Project {
  taskCount: number
  doneCount: number
  progress: number
}

export interface ProjectDetail extends ProjectWithStats {
  tasks: Task[]
}

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'atlas',
    name: 'Atlas',
    code: 'ATL',
    description: 'AI analytics platform turning raw product telemetry into live operational insights.',
    status: 'active',
    deadline: 'Mar 28',
    color: '#22d3ee',
    lastActivity: '2h ago · Kira merged "query builder v2"',
  },
  {
    id: 'helios',
    name: 'Helios',
    code: 'HEL',
    description: 'Cross-platform design system and component library for all client surfaces.',
    status: 'active',
    deadline: 'Apr 10',
    color: '#8b7cf6',
    lastActivity: '5h ago · Design tokens synced',
  },
  {
    id: 'vault',
    name: 'Vault',
    code: 'VLT',
    description: 'Encrypted storage core with zero-trust key rotation and audit logging.',
    status: 'at-risk',
    deadline: 'Mar 19',
    color: '#fbbf24',
    lastActivity: '1d ago · Key rotation test failed CI',
  },
  {
    id: 'pulse',
    name: 'Pulse',
    code: 'PLS',
    description: 'Realtime infrastructure monitoring with anomaly detection and alerting.',
    status: 'completed',
    deadline: 'Feb 27',
    color: '#34d399',
    lastActivity: '3d ago · v2.0.0 shipped',
  },
  {
    id: 'drift',
    name: 'Drift',
    code: 'DRF',
    description: 'Mobile companion app for on-the-go approvals and notifications.',
    status: 'paused',
    deadline: 'May 02',
    color: '#6b8af0',
    lastActivity: '1w ago · Waiting on design sign-off',
  },
]

class ProjectStore {
  private projects: Project[] = [...DEFAULT_PROJECTS]

  public getAllProjects(filter?: { status?: ProjectStatus }): ProjectWithStats[] {
    let list = this.projects
    if (filter?.status) {
      list = list.filter((p) => p.status.toLowerCase() === filter.status!.toLowerCase())
    }

    return list.map((p) => {
      const tasks = taskStore.getAllTasks({ projectId: p.id })
      const taskCount = tasks.length
      const doneCount = tasks.filter((t) => t.status === 'completed').length
      const progress = taskCount > 0 ? Math.round((doneCount / taskCount) * 100) : 0

      return {
        ...p,
        taskCount,
        doneCount,
        progress,
      }
    })
  }

  public getProjectById(idOrCode: string): ProjectDetail | null {
    const target = idOrCode.trim().toLowerCase()
    const project = this.projects.find(
      (p) => p.id.toLowerCase() === target || p.code.toLowerCase() === target
    )
    if (!project) return null

    const tasks = taskStore.getAllTasks({ projectId: project.id })
    const taskCount = tasks.length
    const doneCount = tasks.filter((t) => t.status === 'completed').length
    const progress = taskCount > 0 ? Math.round((doneCount / taskCount) * 100) : 0

    return {
      ...project,
      taskCount,
      doneCount,
      progress,
      tasks,
    }
  }
}

export const projectStore = new ProjectStore()
