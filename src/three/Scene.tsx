import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { WorkspaceScene } from './WorkspaceScene'

export function Scene() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 6.5, 15], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={['#05060a']} />
      <fog attach="fog" args={['#05060a', 22, 55]} />
      <Suspense fallback={null}>
        <WorkspaceScene />
      </Suspense>
    </Canvas>
  )
}
