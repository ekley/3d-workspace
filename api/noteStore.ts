import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

export type NoteCategory = 'spec' | 'idea' | 'log' | 'general'

export interface Note {
  id: string
  title: string
  content: string
  category: NoteCategory
  updatedAt: string
  projectId?: string
}

export interface CreateNoteInput {
  title: string
  content: string
  category?: NoteCategory
  projectId?: string
}

export interface UpdateNoteInput {
  title?: string
  content?: string
  category?: NoteCategory
  projectId?: string
}

export const DEFAULT_NOTES: Note[] = [
  {
    id: 'n-1',
    projectId: 'atlas',
    title: 'Telemetry Query Builder Specs',
    category: 'spec',
    content: 'Implement query compilation to target the ClickHouse dialect.\nEnsure all queries have an explicit time-range boundary to prevent full-table scans.\nCache compiled query execution plans for 5 minutes in memory.',
    updatedAt: '2h ago',
  },
  {
    id: 'n-2',
    projectId: 'helios',
    title: 'Design Token Contrast Audit Checklist',
    category: 'idea',
    content: 'Review all semantic color mappings against WCAG 2.1 AA requirements.\n- High-contrast text should meet a minimum of 4.5:1 ratio.\n- Interactive element boundaries need at least a 3:1 contrast ratio.\n- Test in simulated deuteranopia/protanopia color space.',
    updatedAt: '5h ago',
  },
  {
    id: 'n-3',
    projectId: 'vault',
    title: 'CI Key Rotation Race Condition Log',
    category: 'log',
    content: 'Spikes in concurrent runner initialization trigger DB locks on secret keys.\nTemporary mitigation: added backoff retry policy (5 attempts, exponentially increasing delay).\nLong-term fix: rewrite key locking with transaction advisory locks.',
    updatedAt: '1d ago',
  },
  {
    id: 'n-4',
    projectId: 'pulse',
    title: 'v2.0.0 Post-Deployment Verification',
    category: 'general',
    content: '1. Verify target group health checks are passing.\n2. Confirm anomaly alarms are routed to the on-call pager system.\n3. Check CPU/Memory telemetry trends to ensure no regressions.',
    updatedAt: '3d ago',
  },
  {
    id: 'n-5',
    title: 'Holographic Deck Concept Ideas',
    category: 'idea',
    content: 'Idea to represent notes as glowing floating shards orbiting above projects.\nSelecting a shard should focus the spatial camera, rendering a neon projection editor overlay.\nAward XP (+10 XP) to encourage code documentation hygiene.',
    updatedAt: 'Just now',
  },
]

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.join(__dirname, 'data')
const NOTES_FILE = path.join(DATA_DIR, 'notes.json')

class NoteStore {
  private notes: Note[] = []

  constructor() {
    this.init()
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true })
      }

      if (fs.existsSync(NOTES_FILE)) {
        const raw = fs.readFileSync(NOTES_FILE, 'utf-8')
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.notes = parsed
          return
        }
      }

      this.notes = [...DEFAULT_NOTES]
      this.save()
    } catch (err) {
      console.error('[NoteStore] Error initializing notes database:', err)
      this.notes = [...DEFAULT_NOTES]
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true })
      }
      fs.writeFileSync(NOTES_FILE, JSON.stringify(this.notes, null, 2), 'utf-8')
    } catch (err) {
      console.error('[NoteStore] Error saving notes database:', err)
    }
  }

  public getAllNotes(filter?: {
    category?: NoteCategory
    projectId?: string
    search?: string
  }): Note[] {
    let result = [...this.notes]

    if (filter?.category) {
      result = result.filter((n) => n.category === filter.category)
    }

    if (filter?.projectId) {
      result = result.filter((n) => n.projectId === filter.projectId)
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase()
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q)
      )
    }

    return result
  }

  public getNoteById(id: string): Note | undefined {
    return this.notes.find((n) => n.id.toLowerCase() === id.toLowerCase())
  }

  public createNote(input: CreateNoteInput): Note {
    const newNote: Note = {
      id: `n-${Date.now()}`,
      title: input.title.trim(),
      content: input.content.trim(),
      category: input.category ?? 'general',
      projectId: input.projectId?.trim() || undefined,
      updatedAt: 'Just now',
    }

    this.notes.unshift(newNote)
    this.save()
    return newNote
  }

  public updateNote(id: string, patch: UpdateNoteInput): Note | null {
    const index = this.notes.findIndex((n) => n.id.toLowerCase() === id.toLowerCase())
    if (index === -1) return null

    const existing = this.notes[index]
    const updated: Note = {
      ...existing,
      title: patch.title !== undefined ? patch.title.trim() : existing.title,
      content: patch.content !== undefined ? patch.content : existing.content,
      category: patch.category !== undefined ? patch.category : existing.category,
      projectId: patch.projectId !== undefined ? (patch.projectId.trim() || undefined) : existing.projectId,
      updatedAt: 'Just now',
    }

    this.notes[index] = updated
    this.save()
    return updated
  }

  public deleteNote(id: string): boolean {
    const initialLen = this.notes.length
    this.notes = this.notes.filter((n) => n.id.toLowerCase() !== id.toLowerCase())
    if (this.notes.length !== initialLen) {
      this.save()
      return true
    }
    return false
  }

  public resetNotes(): Note[] {
    this.notes = [...DEFAULT_NOTES]
    this.save()
    return [...this.notes]
  }
}

export const noteStore = new NoteStore()
