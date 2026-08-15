export type TaskStatus = 'backlog' | 'in-progress' | 'review' | 'completed'
export type ProjectStatus = 'active' | 'at-risk' | 'paused' | 'completed'
export type Severity = 'info' | 'success' | 'warning' | 'critical'
export type FileCategory = 'documents' | 'code' | 'design' | 'images'

export interface User {
  name: string
  handle: string
  initials: string
  avatar: string
  title: string
  location: string
  level: number
  xp: number
  xpToNext: number
  streak: number
  productivity: number
}

export interface Project {
  id: string
  name: string
  code: string
  description: string
  status: ProjectStatus
  progress: number
  deadline: string
  taskCount: number
  doneCount: number
  lastActivity: string
  color: string
}

export interface Task {
  id: string
  projectId: string
  title: string
  status: TaskStatus
  priority: 'low' | 'medium' | 'high'
  assignee: string
  dueDate: string
  estimate: string
  tags: string[]
}

export interface ActivityEvent {
  id: string
  type: string
  icon: string
  title: string
  detail: string
  time: string
  severity: Severity
  projectId?: string
}

export interface FileItem {
  id: string
  name: string
  category: FileCategory
  folder: string
  ext: string
  size: string
  updatedAt: string
  projectId?: string
}

export interface CalendarEvent {
  id: string
  title: string
  date: string
  day: string
  time: string
  duration: string
  projectId?: string
  participants: string[]
  location: string
  important: boolean
}
