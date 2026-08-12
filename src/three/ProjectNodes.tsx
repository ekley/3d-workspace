import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Group, MathUtils } from 'three'
import type { Project } from '../data/types'
import { useWorkspace } from '../state/workspace'

/** Deterministic ring position so the 3D nodes and the camera rig agree. */
export function projectPosition(
  index: number,
  total: number,
  radius = 4.3,
): [number, number, number] {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2
  return [Math.cos(angle) * radius, 0.6, Math.sin(angle) * radius]
}

function ProjectNode({ project, index, total }: { project: Project; index: number; total: number }) {
  const group = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)
  const selectedId = useWorkspace((s) => s.selectedProjectId)
  const focusedId = useWorkspace((s) => s.focusedProjectId)
  const selectProject = useWorkspace((s) => s.selectProject)
  const focusProject = useWorkspace((s) => s.focusProject)
  const selected = selectedId === project.id || focusedId === project.id
  const bob = useRef(Math.random() * Math.PI * 2)

  const prominence = 0.95 + (project.progress / 100) * 0.3
  const idleEmissive =
    project.status === 'completed' ? 0.5 : project.status === 'paused' ? 0.35 : 0.65

  useFrame((_, delta) => {
    if (!group.current) return
    bob.current += delta
    const targetScale = prominence * (hovered || selected ? 1.18 : 1)
    group.current.scale.setScalar(MathUtils.lerp(group.current.scale.x, targetScale, 0.12))
    group.current.position.y = projectPosition(index, total)[1] + Math.sin(bob.current * 0.9) * 0.12
    group.current.rotation.y += delta * (project.status === 'active' ? 0.4 : 0.15)
  })

  return (
    <group
      position={projectPosition(index, total)}
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
        selectProject(project.id)
      }}
      onDoubleClick={(e) => {
        e.stopPropagation()
        focusProject(project.id)
      }}
    >
      <group ref={group}>
        <mesh>
          <octahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial
            color={project.color}
            emissive={project.color}
            emissiveIntensity={hovered || selected ? 1.5 : idleEmissive}
            roughness={0.25}
            metalness={0.5}
          />
        </mesh>
        <mesh>
          <icosahedronGeometry args={[0.78, 0]} />
          <meshBasicMaterial
            color={project.color}
            wireframe
            transparent
            opacity={hovered || selected ? 0.55 : 0.18}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2.4, 0, 0]}>
          <torusGeometry args={[0.85, 0.012, 8, 64]} />
          <meshBasicMaterial color={project.color} transparent opacity={hovered || selected ? 0.7 : 0.25} />
        </mesh>
      </group>

      <Html center position={[0, 1.15, 0]} distanceFactor={11} zIndexRange={[20, 0]}>
        <div className={`pnode-label${selected ? ' selected' : ''}`}>
          <div className="pnode-head">
            <span className="pnode-name">{project.name}</span>
            <span className="pnode-code">{project.code}</span>
          </div>
          <div className="pnode-bar">
            <span style={{ width: `${project.progress}%`, background: project.color }} />
          </div>
          <div className="pnode-meta">
            {project.progress}% · {project.doneCount}/{project.taskCount} tasks
          </div>
        </div>
      </Html>
    </group>
  )
}

export function ProjectNodes() {
  const projects = useWorkspace((s) => s.projects)
  return (
    <group>
      {projects.map((p, i) => (
        <ProjectNode key={p.id} project={p} index={i} total={projects.length} />
      ))}
    </group>
  )
}
