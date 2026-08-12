import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Group, MathUtils, Mesh, MeshBasicMaterial } from 'three'
import type { Task } from '../data/types'
import { useWorkspace } from '../state/workspace'
import { taskOrbitPosition } from './layout'

const STATUS_COLOR: Record<string, string> = {
  backlog: '#5d6678',
  'in-progress': '#22d3ee',
  review: '#fbbf24',
  completed: '#34d399',
}

function TaskNode({ task }: { task: Task }) {
  const group = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)
  const tasks = useWorkspace((s) => s.tasks)
  const projects = useWorkspace((s) => s.projects)
  const selected = useWorkspace((s) => s.selectedTaskId === task.id)
  const selectTask = useWorkspace((s) => s.selectTask)
  const setNav = useWorkspace((s) => s.setNav)
  const pos = taskOrbitPosition(tasks, projects, task.projectId, task.id)
  const color = STATUS_COLOR[task.status] ?? STATUS_COLOR.backlog

  useFrame((_, delta) => {
    if (!group.current) return
    group.current.rotation.y += delta * 0.8
    const target = hovered || selected ? 1.6 : 1
    group.current.scale.setScalar(MathUtils.lerp(group.current.scale.x, target, 0.15))
  })

  return (
    <group position={pos}>
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
          selectTask(task.id)
          setNav('tasks')
        }}
      >
        <mesh>
          <octahedronGeometry args={[0.13, 0]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={hovered || selected ? 1.4 : 0.55}
            roughness={0.3}
            metalness={0.4}
          />
        </mesh>
        {hovered && (
          <Html center position={[0, 0.35, 0]} distanceFactor={22} zIndexRange={[20, 0]}>
            <div className="tnode-label">{task.title}</div>
          </Html>
        )}
      </group>
    </group>
  )
}

function FlyParticle({ id, from }: { id: string; from: [number, number, number] }) {
  const ref = useRef<Mesh>(null)
  const mat = useRef<MeshBasicMaterial>(null)
  const clearFx = useWorkspace((s) => s.clearCompletedFx)
  const start = useRef(performance.now())
  const done = useRef(false)

  useFrame(() => {
    if (!ref.current) return
    const t = Math.min(1, (performance.now() - start.current) / 1100)
    const e = t * t
    ref.current.position.set(
      MathUtils.lerp(from[0], 0, e),
      MathUtils.lerp(from[1], 0.6, e),
      MathUtils.lerp(from[2], 0, e),
    )
    ref.current.scale.setScalar(1 - t * 0.7)
    if (mat.current) mat.current.opacity = 1 - t
    if (t >= 1 && !done.current) {
      done.current = true
      clearFx(id)
    }
  })

  return (
    <mesh ref={ref} position={from}>
      <octahedronGeometry args={[0.14, 0]} />
      <meshBasicMaterial ref={mat} color="#34d399" transparent />
    </mesh>
  )
}

function TaskFx() {
  const fx = useWorkspace((s) => s.completedFx)
  return (
    <group>
      {Object.entries(fx).map(([id, v]) => (
        <FlyParticle key={id} id={id} from={v.from} />
      ))}
    </group>
  )
}

export function TaskNodes() {
  const tasks = useWorkspace((s) => s.tasks)
  const active = tasks.filter((t) => t.status !== 'completed')
  return (
    <group>
      {active.map((t) => (
        <TaskNode key={t.id} task={t} />
      ))}
      <TaskFx />
    </group>
  )
}
