import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

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

export interface CreateEventInput {
  title: string
  date?: string
  day?: string
  time?: string
  duration?: string
  projectId?: string
  participants?: string[]
  location?: string
  important?: boolean
}

export const DEFAULT_EVENTS: CalendarEvent[] = [
  { id: 'evt-1', title: 'Atlas sprint planning', date: 'Mar 17', day: 'MON', time: '09:30', duration: '1h', projectId: 'atlas', participants: ['Elena', 'Kira', 'Sam'], location: 'Atlas room', important: true },
  { id: 'evt-2', title: 'Design critique: query builder', date: 'Mar 17', day: 'MON', time: '14:00', duration: '45m', projectId: 'atlas', participants: ['Kira', 'Mina'], location: 'FigJam', important: false },
  { id: 'evt-3', title: 'Helios tokens review', date: 'Mar 18', day: 'TUE', time: '11:00', duration: '30m', projectId: 'helios', participants: ['Mina', 'Elena'], location: 'Meet', important: true },
  { id: 'evt-4', title: '1:1 with Sam', date: 'Mar 18', day: 'TUE', time: '16:00', duration: '30m', participants: ['Elena', 'Sam'], location: 'Zoom', important: false },
  { id: 'evt-5', title: 'Vault security sync', date: 'Mar 19', day: 'WED', time: '10:00', duration: '1h', projectId: 'vault', participants: ['Sam', 'Priya', 'Elena'], location: 'Meet', important: true },
  { id: 'evt-6', title: 'Pulse retro', date: 'Mar 19', day: 'WED', time: '15:30', duration: '1h', projectId: 'pulse', participants: ['Elena', 'Leo', 'Mina', 'Priya'], location: 'Meet', important: false },
  { id: 'evt-7', title: 'Vault release deadline', date: 'Mar 20', day: 'THU', time: '17:00', duration: '-', projectId: 'vault', participants: [], location: 'Deadline', important: true },
  { id: 'evt-8', title: 'Company all-hands', date: 'Mar 20', day: 'THU', time: '12:00', duration: '45m', participants: ['Everyone'], location: 'Town hall', important: false },
  { id: 'evt-9', title: 'Drift design sign-off', date: 'Mar 21', day: 'FRI', time: '10:30', duration: '1h', projectId: 'drift', participants: ['Mina', 'Elena'], location: 'Meet', important: true },
  { id: 'evt-10', title: 'Atlas demo prep', date: 'Mar 21', day: 'FRI', time: '14:00', duration: '1h', projectId: 'atlas', participants: ['Kira', 'Elena'], location: 'Studio', important: false },
  { id: 'evt-11', title: 'Week review', date: 'Mar 21', day: 'FRI', time: '16:00', duration: '30m', participants: ['Elena'], location: 'Focus', important: false },
  { id: 'evt-12', title: 'Vault key rotation (prod)', date: 'Mar 24', day: 'MON', time: '09:00', duration: '2h', projectId: 'vault', participants: ['Sam'], location: 'Ops bridge', important: true },
]

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.join(__dirname, 'data')
const EVENTS_FILE = path.join(DATA_DIR, 'events.json')

class EventStore {
  private events: CalendarEvent[] = []

  constructor() {
    this.init()
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true })
      }

      if (fs.existsSync(EVENTS_FILE)) {
        const raw = fs.readFileSync(EVENTS_FILE, 'utf-8')
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.events = parsed
          return
        }
      }

      this.events = [...DEFAULT_EVENTS]
      this.save()
    } catch (err) {
      console.error('[EventStore] Error initializing events database:', err)
      this.events = [...DEFAULT_EVENTS]
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true })
      }
      fs.writeFileSync(EVENTS_FILE, JSON.stringify(this.events, null, 2), 'utf-8')
    } catch (err) {
      console.error('[EventStore] Error saving events database:', err)
    }
  }

  public getAllEvents(filter?: {
    day?: string
    projectId?: string
    important?: boolean
  }): CalendarEvent[] {
    let result = [...this.events]

    if (filter?.day) {
      const targetDay = filter.day.toUpperCase()
      result = result.filter((e) => e.day.toUpperCase() === targetDay)
    }

    if (filter?.projectId) {
      const targetProj = filter.projectId.toLowerCase()
      result = result.filter((e) => e.projectId?.toLowerCase() === targetProj)
    }

    if (filter?.important !== undefined) {
      result = result.filter((e) => e.important === filter.important)
    }

    return result
  }

  public getEventById(id: string): CalendarEvent | undefined {
    return this.events.find((e) => e.id.toLowerCase() === id.toLowerCase())
  }

  public createEvent(input: CreateEventInput): CalendarEvent {
    const newEvent: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title: input.title.trim(),
      date: input.date?.trim() || 'Mar 21',
      day: (input.day?.trim() || 'FRI').toUpperCase(),
      time: input.time?.trim() || '12:00',
      duration: input.duration?.trim() || '30m',
      projectId: input.projectId?.trim() || undefined,
      participants: Array.isArray(input.participants) ? input.participants : ['Elena'],
      location: input.location?.trim() || 'Meet',
      important: Boolean(input.important),
    }

    this.events.push(newEvent)
    this.save()
    return newEvent
  }

  public deleteEvent(id: string): boolean {
    const initialLen = this.events.length
    this.events = this.events.filter((e) => e.id.toLowerCase() !== id.toLowerCase())
    if (this.events.length !== initialLen) {
      this.save()
      return true
    }
    return false
  }

  public resetEvents(): CalendarEvent[] {
    this.events = [...DEFAULT_EVENTS]
    this.save()
    return [...this.events]
  }
}

export const eventStore = new EventStore()

