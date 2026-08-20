import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Group, MathUtils } from 'three'
import type { CalendarEvent } from '../data/types'
import { useWorkspace } from '../state/workspace'

const DAYS: { id: string; x: number }[] = [
  { id: 'MON', x: -6 },
  { id: 'TUE', x: -3 },
  { id: 'WED', x: 0 },
  { id: 'THU', x: 3 },
  { id: 'FRI', x: 6 },
]

const Y = 1.45
const Z = -4.5

function EventNode({ ev, index }: { ev: CalendarEvent; index: number }) {
  const group = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)
  const selectEvent = useWorkspace((s) => s.selectEvent)
  const setNav = useWorkspace((s) => s.setNav)
  const x = DAYS.find((d) => d.id === ev.day)?.x ?? 0
  const nodeY = Y + 0.16 + (ev.important ? 0.14 : 0)
  const z = Z - index * 0.5
  const color = ev.important ? '#22d3ee' : '#6b8af0'
  const size = ev.important ? 0.16 : 0.1

  useFrame((_, delta) => {
    if (!group.current) return
    group.current.rotation.y += delta * (ev.important ? 0.9 : 0.4)
    const target = hovered ? 1.6 : 1
    group.current.scale.setScalar(MathUtils.lerp(group.current.scale.x, target, 0.15))
  })

  return (
    <group position={[x, nodeY, z]}>
      <group
        ref={group}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'auto'
        }}
        onClick={(e) => {
          e.stopPropagation()
          selectEvent(ev.id)
          setNav('calendar')
        }}
      >
        <mesh>
          <octahedronGeometry args={[size, 0]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={ev.important ? 1.4 : hovered ? 1.2 : 0.5}
            roughness={0.25}
            metalness={0.4}
          />
        </mesh>
        {ev.important && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[size + 0.06, 0.008, 6, 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.6} />
          </mesh>
        )}
        {hovered && (
          <Html center position={[0, 0.32, 0]} distanceFactor={16} zIndexRange={[5, 0]}>
            <div className="tnode-label">
              {ev.time} · {ev.title}
            </div>
          </Html>
        )}
      </group>
    </group>
  )
}

export function CalendarTimeline() {
  const events = useWorkspace((s) => s.events)
  const byDay: Record<string, CalendarEvent[]> = {}
  for (const e of events) {
    ;(byDay[e.day] ??= []).push(e)
  }

  return (
    <group>
      {/* horizontal timeline rail */}
      <mesh position={[0, Y, Z]}>
        <boxGeometry args={[12.4, 0.02, 0.02]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.4} />
      </mesh>

      {/* day ticks + labels */}
      {DAYS.map((d) => (
        <group key={d.id} position={[d.x, Y, Z]}>
          <mesh position={[0, -0.12, 0]}>
            <boxGeometry args={[0.02, 0.22, 0.02]} />
            <meshBasicMaterial color="#22d3ee" transparent opacity={0.5} />
          </mesh>
          <Html center position={[0, -0.45, 0]} distanceFactor={14} zIndexRange={[5, 0]}>
            <div className="day-label">{d.id}</div>
          </Html>
        </group>
      ))}

      {/* event nodes */}
      {Object.values(byDay).flatMap((list) =>
        list.map((ev, i) => <EventNode key={ev.id} ev={ev} index={i} />),
      )}
    </group>
  )
}
