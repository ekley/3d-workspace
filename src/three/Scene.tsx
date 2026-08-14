import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { WorkspaceScene } from './WorkspaceScene'
import { useWorkspace } from '../state/workspace'
import { isLowPower } from './perf'

export function Scene() {
  const quality = useWorkspace((s) => s.settings.quality)
  const low = quality === 'low' || (quality === 'auto' && isLowPower())

  return (
    <Canvas
      dpr={low ? [1, 1.25] : [1, 2]}
      camera={{ position: [0, 6.5, 15], fov: 45 }}
      gl={{ antialias: !low, alpha: true }}
    >
      <color attach="background" args={['#05060a']} />
      <fog attach="fog" args={['#05060a', 22, 55]} />
      <Suspense fallback={null}>
        <WorkspaceScene />
      </Suspense>
    </Canvas>
  )
}
