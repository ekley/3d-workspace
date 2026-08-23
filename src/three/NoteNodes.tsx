import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Group, MathUtils } from 'three'
import type { Note } from '../data/types'
import { useWorkspace } from '../state/workspace'
import { notePosition } from './layout'

const CATEGORY_COLOR: Record<string, string> = {
  spec: '#3b82f6',
  idea: '#d946ef',
  log: '#f43f5e',
  general: '#10b981',
}

function NoteNode({ note, index, total }: { note: Note; index: number; total: number }) {
  const group = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)
  const selectedNoteId = useWorkspace((s) => s.selectedNoteId)
  const selectNote = useWorkspace((s) => s.selectNote)
  const setNav = useWorkspace((s) => s.setNav)
  const focusProject = useWorkspace((s) => s.focusProject)
  const reduced = useWorkspace((s) => s.settings.reducedMotion)
  
  const selected = selectedNoteId === note.id
  const pos = notePosition(index, total)
  const color = CATEGORY_COLOR[note.category] ?? '#d946ef'
  const timeRef = useRef(Math.random() * 100)

  useFrame((_, delta) => {
    if (!group.current) return
    if (!reduced) {
      timeRef.current += delta * 1.3
      group.current.position.y = pos[1] + Math.sin(timeRef.current) * 0.1
      group.current.rotation.y += delta * 0.4
      group.current.rotation.x += delta * 0.15
    } else {
      group.current.position.y = pos[1]
    }
    
    const targetScale = hovered || selected ? 1.4 : 1.0
    group.current.scale.setScalar(MathUtils.lerp(group.current.scale.x, targetScale, 0.12))
  })

  const handleClick = (e: any) => {
    e.stopPropagation()
    selectNote(note.id)
    if (note.projectId) {
      focusProject(note.projectId)
    }
    setNav('notes')
  }

  return (
    <group
      ref={group}
      position={[pos[0], pos[1], pos[2]]}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'auto'
      }}
      onClick={handleClick}
    >
      <mesh>
        <dodecahedronGeometry args={[0.16, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered || selected ? 1.6 : 0.6}
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>
      
      <mesh>
        <dodecahedronGeometry args={[0.22, 0]} />
        <meshBasicMaterial
          color={color}
          wireframe
          transparent
          opacity={hovered || selected ? 0.35 : 0.12}
        />
      </mesh>

      {hovered && (
        <Html center position={[0, 0.45, 0]} distanceFactor={22} zIndexRange={[5, 0]}>
          <div className="tnode-label">
            <span className={`note-cat-badge note-cat-${note.category}`}>{note.category.toUpperCase()}</span>
            {note.title}
          </div>
        </Html>
      )}
    </group>
  )
}

export function NoteNodes() {
  const notes = useWorkspace((s) => s.notes)
  const disable3D = useWorkspace((s) => s.settings.disable3D)

  if (disable3D) return null

  return (
    <group>
      {notes.map((note, index) => (
        <NoteNode
          key={note.id}
          note={note}
          index={index}
          total={notes.length}
        />
      ))}
    </group>
  )
}
