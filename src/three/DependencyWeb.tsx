import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { QuadraticBezierLine } from '@react-three/drei'
import { Vector3 } from 'three'
import { useWorkspace } from '../state/workspace'
import { projectPosition, notePosition } from './layout'
import type { FileCategory } from '../data/types'

const FILE_CATEGORIES: { id: FileCategory; angle: number }[] = [
  { id: 'documents', angle: Math.PI * 0.25 },
  { id: 'code', angle: Math.PI * 0.75 },
  { id: 'design', angle: Math.PI * 1.25 },
  { id: 'images', angle: Math.PI * 1.75 },
]

const CALENDAR_DAYS: { id: string; x: number }[] = [
  { id: 'MON', x: -6 },
  { id: 'TUE', x: -3 },
  { id: 'WED', x: 0 },
  { id: 'THU', x: 3 },
  { id: 'FRI', x: 6 },
]
const CAL_Y = 1.45
const CAL_Z = -4.5

function DependencyBeam({ start, end, color }: { start: Vector3; end: Vector3; color: string }) {
  const lineRef = useRef<any>(null)

  // Midpoint for the bezier curve to arc upwards
  const mid = useMemo(() => {
    const v = new Vector3().addVectors(start, end).multiplyScalar(0.5)
    v.y += Math.max(1, start.distanceTo(end) * 0.25)
    return v
  }, [start, end])

  useFrame((_, delta) => {
    if (lineRef.current && lineRef.current.material) {
      lineRef.current.material.dashOffset -= delta * 2
    }
  })

  return (
    <QuadraticBezierLine
      ref={lineRef}
      start={start}
      end={end}
      mid={mid}
      color={color}
      lineWidth={1.5}
      dashed
      dashScale={20}
      dashSize={0.5}
      dashOffset={0}
      transparent
      opacity={0.6}
    />
  )
}

export function DependencyWeb() {
  const selectedProjectId = useWorkspace((s) => s.selectedProjectId)
  const focusedProjectId = useWorkspace((s) => s.focusedProjectId)
  const activeId = focusedProjectId || selectedProjectId

  const projects = useWorkspace((s) => s.projects)
  const files = useWorkspace((s) => s.files)
  const events = useWorkspace((s) => s.events)
  const notes = useWorkspace((s) => s.notes)
  const reducedMotion = useWorkspace((s) => s.settings.reducedMotion)

  if (!activeId || reducedMotion) return null

  const projectIndex = projects.findIndex((p) => p.id === activeId)
  if (projectIndex === -1) return null

  const project = projects[projectIndex]
  const [px, py, pz] = projectPosition(projectIndex, projects.length)
  const pVec = new Vector3(px, py, pz)
  const color = project.color

  // We want to avoid too many lines.
  // Connect to Notes
  const projectNotes = notes.filter((n) => n.projectId === activeId)
  const noteBeams = projectNotes.map((note) => {
    const ni = notes.findIndex((n) => n.id === note.id)
    const [nx, ny, nz] = notePosition(ni, notes.length)
    return <DependencyBeam key={`note-${note.id}`} start={pVec} end={new Vector3(nx, ny, nz)} color={color} />
  })

  // Connect to File Clusters
  const projectFiles = files.filter((f) => f.projectId === activeId)
  const activeCategories = Array.from(new Set(projectFiles.map((f) => f.category)))
  const fileBeams = activeCategories.map((catId) => {
    const cat = FILE_CATEGORIES.find((c) => c.id === catId)
    if (!cat) return null
    const fx = Math.cos(cat.angle) * 6
    const fz = Math.sin(cat.angle) * 6
    return <DependencyBeam key={`file-${catId}`} start={pVec} end={new Vector3(fx, 0.5, fz)} color={color} />
  })

  // Connect to Calendar Events
  const projectEvents = events.filter((e) => e.projectId === activeId)
  const eventBeams = projectEvents.map((ev) => {
    const x = CALENDAR_DAYS.find((d) => d.id === ev.day)?.x ?? 0
    const byDay = events.filter((e) => e.day === ev.day)
    const evIndex = byDay.findIndex((e) => e.id === ev.id)
    const y = CAL_Y + 0.16 + (ev.important ? 0.14 : 0)
    const z = CAL_Z - evIndex * 0.5
    return <DependencyBeam key={`evt-${ev.id}`} start={pVec} end={new Vector3(x, y, z)} color={color} />
  })

  // Group all beams. Fade them in.
  return (
    <group>
      {noteBeams}
      {fileBeams}
      {eventBeams}
    </group>
  )
}
