import { useEffect, useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars, Sparkles, ContactShadows } from '@react-three/drei'
import { Group, Mesh, MathUtils, PointLight, type MeshStandardMaterial } from 'three'
import { useWorkspace } from '../state/workspace'
import { CameraRig } from './CameraRig'
import { ProjectNodes } from './ProjectNodes'

function Parallax({ children }: { children: ReactNode }) {
  const ref = useRef<Group>(null)
  useFrame((state) => {
    if (!ref.current) return
    const { x, y } = state.pointer
    ref.current.rotation.y = MathUtils.lerp(ref.current.rotation.y, x * 0.1, 0.04)
    ref.current.rotation.x = MathUtils.lerp(ref.current.rotation.x, -y * 0.05, 0.04)
  })
  return <group ref={ref}>{children}</group>
}

function CoreHub() {
  const core = useRef<Mesh>(null)
  const shell = useRef<Mesh>(null)
  const group = useRef<Group>(null)
  const glow = useRef<MeshStandardMaterial>(null)
  const light = useRef<PointLight>(null)
  const idle = useRef(0)
  const reaction = useRef(0)
  const corePulse = useWorkspace((s) => s.corePulse)

  useEffect(() => {
    reaction.current = 1
  }, [corePulse])

  useFrame((_, delta) => {
    const activity = useWorkspace.getState().activityLevel
    idle.current = (idle.current + delta) % (Math.PI * 2)
    reaction.current = Math.max(0, reaction.current - delta * 2.2)

    const speed = 0.3 + activity * 0.8 + reaction.current * 1.5
    if (core.current) {
      core.current.rotation.y += delta * speed
      core.current.rotation.x += delta * (0.12 + activity * 0.18)
    }
    if (shell.current) shell.current.rotation.y -= delta * (0.14 + activity * 0.1)

    if (glow.current) {
      glow.current.emissiveIntensity =
        1.2 + Math.sin(idle.current * 1.5) * 0.3 + activity * 1.2 + reaction.current * 2.6
    }
    if (group.current) {
      const s = 1 + activity * 0.06 + reaction.current * 0.16
      group.current.scale.setScalar(s)
    }
    if (light.current) {
      light.current.intensity = 7 + activity * 8 + reaction.current * 20
    }
  })

  return (
    <group ref={group} position={[0, 0.6, 0]}>
      <mesh ref={core}>
        <octahedronGeometry args={[1.1, 0]} />
        <meshStandardMaterial ref={glow} color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.3} roughness={0.2} metalness={0.5} />
      </mesh>
      <mesh ref={shell}>
        <icosahedronGeometry args={[1.9, 1]} />
        <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.16} />
      </mesh>
      <pointLight ref={light} color="#22d3ee" intensity={7} distance={14} decay={2} />
      <Sparkles count={90} scale={5.5} size={2.2} speed={0.35} color="#22d3ee" opacity={0.55} />
    </group>
  )
}

function ZoneRing({ radius, tilt = 0, speed = 0.1, color = '#22d3ee', opacity = 0.25 }: {
  radius: number
  tilt?: number
  speed?: number
  color?: string
  opacity?: number
}) {
  const ref = useRef<Mesh>(null)
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * speed
  })
  return (
    <mesh ref={ref} rotation={[Math.PI / 2 + tilt, 0, 0]} position={[0, 0.4, 0]}>
      <torusGeometry args={[radius, 0.012, 8, 128]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  )
}

function Platform() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <ringGeometry args={[1.6, 4.6, 96]} />
        <meshStandardMaterial color="#0a0f1a" roughness={0.6} metalness={0.6} transparent opacity={0.85} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]}>
        <ringGeometry args={[4.6, 4.66, 96]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.35} />
      </mesh>
      <ContactShadows position={[0, 0.01, 0]} opacity={0.5} scale={14} blur={2.4} far={6} color="#000000" />
    </group>
  )
}

export function WorkspaceScene() {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[10, 18, 8]} intensity={1.1} color="#bfd6ff" />
      <pointLight position={[-8, 4, -6]} intensity={30} color="#8b7cf6" distance={30} decay={2} />

      <Parallax>
        <CoreHub />
        <ZoneRing radius={3.1} speed={0.08} />
        <ZoneRing radius={4.3} tilt={0.5} speed={-0.05} color="#8b7cf6" opacity={0.18} />
        <ZoneRing radius={5.4} tilt={-0.45} speed={0.06} opacity={0.14} />
        <Platform />
        <ProjectNodes />
      </Parallax>

      <Stars radius={60} depth={40} count={900} factor={3.2} saturation={0} fade speed={0.4} />
      <Sparkles count={140} scale={16} size={1.6} speed={0.2} color="#9aa4b8" opacity={0.4} />

      <CameraRig />
    </>
  )
}
