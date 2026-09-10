import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Mesh } from 'three'
import { Sparkles } from '@react-three/drei'
import { useWorkspace } from '../state/workspace'
import { isLowPower } from './perf'

export function CompanionDrone() {
  const groupRef = useRef<Group>(null)
  const meshRef = useRef<Mesh>(null)
  const orbitAngle = useRef(0)
  
  const quality = useWorkspace((s) => s.settings.quality)
  const low = quality === 'low' || (quality === 'auto' && isLowPower())
  const reduced = useWorkspace((s) => s.settings.reducedMotion)
  const focusActive = useWorkspace((s) => s.focusTimer.active)
  const color = focusActive ? '#f59e0b' : '#38bdf8'

  useFrame((state, delta) => {
    const activity = useWorkspace.getState().activityLevel
    const time = state.clock.getElapsedTime()

    if (groupRef.current) {
      if (!reduced) {
        // Orbit around the core
        const speed = 0.4 + activity * 1.5 + (focusActive ? 0.5 : 0)
        orbitAngle.current += delta * speed
        
        const radius = 2.8 + Math.sin(time * 0.5) * 0.2
        groupRef.current.position.x = Math.cos(orbitAngle.current) * radius
        groupRef.current.position.z = Math.sin(orbitAngle.current) * radius
        // Bob up and down
        groupRef.current.position.y = Math.sin(time * 2.2) * 0.3 + 0.8
      } else {
        groupRef.current.position.set(2.8, 0.8, 0)
      }
    }

    if (meshRef.current) {
      if (!reduced) {
        const spinSpeed = 1 + activity * 4
        meshRef.current.rotation.x += delta * spinSpeed
        meshRef.current.rotation.y += delta * spinSpeed
      }
      const scale = 1 + activity * 0.5 + Math.sin(time * 5) * 0.05
      meshRef.current.scale.setScalar(scale)
    }
  })

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.15, 0]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={1.8} 
          roughness={0.2} 
          metalness={0.8} 
        />
      </mesh>
      {!reduced && (
        <Sparkles 
          count={low ? 5 : 15} 
          scale={0.5} 
          size={1.2} 
          speed={0.5} 
          color={color} 
          opacity={0.7} 
        />
      )}
    </group>
  )
}
