import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

export type ActivitySeverity = 'info' | 'success' | 'warning' | 'critical'

export interface ActivityEvent {
  id: string
  type: string
  icon: string
  title: string
  detail: string
  time: string
  severity: ActivitySeverity
  projectId?: string
  timestamp: number
}

export interface CreateActivityInput {
  type?: string
  icon?: string
  title: string
  detail: string
  severity?: ActivitySeverity
  projectId?: string
}

const NOW = Date.now()
const HOUR = 3600 * 1000
const DAY = 24 * HOUR

export const DEFAULT_ACTIVITIES: ActivityEvent[] = [
  { id: 'ev-1', type: 'task-completed', icon: 'check', title: 'TASK COMPLETED', detail: 'Atlas · Anomaly detection pipeline', time: '2h ago', severity: 'success', projectId: 'atlas', timestamp: NOW - 2 * HOUR },
  { id: 'ev-2', type: 'project-updated', icon: 'layers', title: 'PROJECT UPDATED', detail: 'Helios reached 50% progress', time: '5h ago', severity: 'info', projectId: 'helios', timestamp: NOW - 5 * HOUR },
  { id: 'ev-3', type: 'deployment', icon: 'zap', title: 'DEPLOYMENT SUCCESSFUL', detail: 'Pulse v2.0.0 · production', time: '1d ago', severity: 'success', projectId: 'pulse', timestamp: NOW - 1 * DAY },
  { id: 'ev-4', type: 'file-uploaded', icon: 'upload', title: 'NEW FILE UPLOADED', detail: 'Vault · key-rotation-notes.md', time: '3h ago', severity: 'info', projectId: 'vault', timestamp: NOW - 3 * HOUR },
  { id: 'ev-5', type: 'comment', icon: 'bell', title: 'COMMENT RECEIVED', detail: 'Kira on Atlas query builder', time: '4h ago', severity: 'info', projectId: 'atlas', timestamp: NOW - 4 * HOUR },
  { id: 'ev-6', type: 'milestone', icon: 'check', title: 'MILESTONE REACHED', detail: 'Pulse · 4/4 tasks shipped', time: '1d ago', severity: 'success', projectId: 'pulse', timestamp: NOW - 1 * DAY - 2 * HOUR },
  { id: 'ev-7', type: 'review', icon: 'activity', title: 'TASK IN REVIEW', detail: 'Helios · Theming API docs', time: '6h ago', severity: 'warning', projectId: 'helios', timestamp: NOW - 6 * HOUR },
  { id: 'ev-8', type: 'build-failed', icon: 'close', title: 'BUILD FAILED', detail: 'Vault · key rotation test failed CI', time: '1d ago', severity: 'critical', projectId: 'vault', timestamp: NOW - 1 * DAY - 4 * HOUR },
  { id: 'ev-9', type: 'task-created', icon: 'plus', title: 'TASK CREATED', detail: 'Drift · Offline sync strategy', time: '2d ago', severity: 'info', projectId: 'drift', timestamp: NOW - 2 * DAY },
  { id: 'ev-10', type: 'streak', icon: 'zap', title: 'STREAK MAINTAINED', detail: '14 day productivity streak', time: '3d ago', severity: 'success', timestamp: NOW - 3 * DAY },
  { id: 'ev-11', type: 'file-uploaded', icon: 'upload', title: 'NEW FILE UPLOADED', detail: 'Helios · tokens-v3.json', time: '1d ago', severity: 'info', projectId: 'helios', timestamp: NOW - 1 * DAY - 6 * HOUR },
  { id: 'ev-12', type: 'deployment', icon: 'zap', title: 'DEPLOYMENT SUCCESSFUL', detail: 'Atlas · staging · build #482', time: '2d ago', severity: 'success', projectId: 'atlas', timestamp: NOW - 2 * DAY - 1 * HOUR },
  { id: 'ev-13', type: 'comment', icon: 'bell', title: 'COMMENT RECEIVED', detail: 'Sam on Vault HSM integration', time: '5h ago', severity: 'info', projectId: 'vault', timestamp: NOW - 5 * HOUR - 30 * 60 * 1000 },
  { id: 'ev-14', type: 'project-updated', icon: 'layers', title: 'PROJECT UPDATED', detail: 'Atlas reached 75% progress', time: '2h ago', severity: 'info', projectId: 'atlas', timestamp: NOW - 2 * HOUR - 15 * 60 * 1000 },
  { id: 'ev-15', type: 'task-created', icon: 'plus', title: 'TASK CREATED', detail: 'Helios · Dark-mode contrast audit', time: '6h ago', severity: 'info', projectId: 'helios', timestamp: NOW - 6 * HOUR - 45 * 60 * 1000 },
  { id: 'ev-16', type: 'review', icon: 'activity', title: 'TASK IN REVIEW', detail: 'Vault · Zero-trust access review', time: '7h ago', severity: 'warning', projectId: 'vault', timestamp: NOW - 7 * HOUR },
  { id: 'ev-17', type: 'milestone', icon: 'check', title: 'MILESTONE REACHED', detail: 'Helios · v3 token set shipped', time: '2d ago', severity: 'success', projectId: 'helios', timestamp: NOW - 2 * DAY - 4 * HOUR },
  { id: 'ev-18', type: 'build-failed', icon: 'close', title: 'BUILD FAILED', detail: 'Atlas · telemetry test flake', time: '3d ago', severity: 'critical', projectId: 'atlas', timestamp: NOW - 3 * DAY - 2 * HOUR },
]

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.join(__dirname, 'data')
const ACTIVITY_FILE = path.join(DATA_DIR, 'activity.json')

class ActivityStore {
  private activities: ActivityEvent[] = []

  constructor() {
    this.init()
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true })
      }

      if (fs.existsSync(ACTIVITY_FILE)) {
        const raw = fs.readFileSync(ACTIVITY_FILE, 'utf-8')
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.activities = parsed
          return
        }
      }

      // Initialize with default activities if not present or empty
      this.activities = [...DEFAULT_ACTIVITIES]
      this.save()
    } catch (err) {
      console.error('[ActivityStore] Error initializing activity database:', err)
      this.activities = [...DEFAULT_ACTIVITIES]
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true })
      }
      fs.writeFileSync(ACTIVITY_FILE, JSON.stringify(this.activities, null, 2), 'utf-8')
    } catch (err) {
      console.error('[ActivityStore] Error persisting activities to disk:', err)
    }
  }

  public getAllActivities(filter?: {
    severity?: ActivitySeverity
    type?: string
    projectId?: string
    limit?: number
  }): ActivityEvent[] {
    let result = [...this.activities]

    if (filter?.severity) {
      const targetSev = filter.severity.toLowerCase()
      result = result.filter((a) => a.severity.toLowerCase() === targetSev)
    }

    if (filter?.type) {
      const targetType = filter.type.toLowerCase()
      result = result.filter((a) => a.type.toLowerCase() === targetType)
    }

    if (filter?.projectId) {
      const targetProj = filter.projectId.toLowerCase()
      result = result.filter((a) => a.projectId?.toLowerCase() === targetProj)
    }

    // Sort descending by timestamp (newest first)
    result.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))

    if (filter?.limit && filter.limit > 0) {
      result = result.slice(0, filter.limit)
    }

    return result
  }

  public getActivityById(id: string): ActivityEvent | undefined {
    return this.activities.find((a) => a.id.toLowerCase() === id.trim().toLowerCase())
  }

  public createActivity(input: CreateActivityInput): ActivityEvent {
    const now = Date.now()
    const rand = Math.floor(100 + Math.random() * 900)
    const id = `ev-${now}-${rand}`

    const newEvent: ActivityEvent = {
      id,
      type: input.type?.trim().toLowerCase() || 'system',
      icon: input.icon?.trim() || 'activity',
      title: input.title.trim(),
      detail: input.detail.trim(),
      time: 'Just now',
      severity: input.severity || 'info',
      projectId: input.projectId?.trim().toLowerCase(),
      timestamp: now,
    }

    this.activities.unshift(newEvent)
    this.save()
    return newEvent
  }

  public getRecentActivities(limit = 10): ActivityEvent[] {
    return this.getAllActivities({ limit })
  }

  public resetActivities(): ActivityEvent[] {
    this.activities = JSON.parse(JSON.stringify(DEFAULT_ACTIVITIES))
    this.save()
    return this.activities
  }
}

export const activityStore = new ActivityStore()
