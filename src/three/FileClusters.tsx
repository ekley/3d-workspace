import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Group, MathUtils } from 'three'
import type { FileCategory } from '../data/types'
import { useWorkspace } from '../state/workspace'

const CATEGORIES: { id: FileCategory; label: string; color: string; angle: number }[] = [
  { id: 'documents', label: 'Documents', color: '#22d3ee', angle: Math.PI * 0.25 },
  { id: 'code', label: 'Code', color: '#8b7cf6', angle: Math.PI * 0.75 },
  { id: 'design', label: 'Design', color: '#f472b6', angle: Math.PI * 1.25 },
  { id: 'images', label: 'Images', color: '#fbbf24', angle: Math.PI * 1.75 },
]

const CUBES: { pos: [number, number, number]; size: number }[] = [
  { pos: [0, -0.06, 0], size: 0.34 },
  { pos: [0.05, 0.08, -0.02], size: 0.26 },
  { pos: [-0.03, 0.22, 0.02], size: 0.18 },
]

function Cluster({ cat }: { cat: (typeof CATEGORIES)[number] }) {
  const group = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)
  const files = useWorkspace((s) => s.files)
  const selectCategory = useWorkspace((s) => s.selectCategory)
  const setNav = useWorkspace((s) => s.setNav)
  const count = files.filter((f) => f.category === cat.id).length
  const pos: [number, number, number] = [Math.cos(cat.angle) * 6, 0.5, Math.sin(cat.angle) * 6]

  useFrame((_, delta) => {
    if (!group.current) return
    group.current.rotation.y += delta * 0.25
    const target = hovered ? 1.2 : 1
    group.current.scale.setScalar(MathUtils.lerp(group.current.scale.x, target, 0.12))
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
          selectCategory(cat.id)
          setNav('files')
        }}
      >
        {CUBES.map((c, i) => (
          <mesh key={i} position={c.pos}>
            <boxGeometry args={[c.size, c.size * 0.7, c.size]} />
            <meshStandardMaterial
              color={cat.color}
              emissive={cat.color}
              emissiveIntensity={hovered ? 0.8 : 0.35}
              roughness={0.4}
              metalness={0.4}
            />
          </mesh>
        ))}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.42, 0.012, 8, 48]} />
          <meshBasicMaterial color={cat.color} transparent opacity={hovered ? 0.7 : 0.3} />
        </mesh>
      </group>

      <Html center position={[0, 0.72, 0]} distanceFactor={10} zIndexRange={[5, 0]}>
        <div className="fcluster-label">
          <div className="fcluster-name">{cat.label}</div>
          <div className="fcluster-count">{count} files</div>
        </div>
      </Html>
    </group>
  )
}

export function FileClusters() {
  return (
    <group>
      {CATEGORIES.map((c) => (
        <Cluster key={c.id} cat={c} />
      ))}
    </group>
  )
}
