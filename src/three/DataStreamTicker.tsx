import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { Group } from 'three'
import { useWorkspace } from '../state/workspace'
import { isLowPower } from './perf'

function useTier() {
  const quality = useWorkspace((s) => s.settings.quality)
  return quality === 'low' || (quality === 'auto' && isLowPower())
}

export function DataStreamTicker() {
  const ref = useRef<Group>(null)
  const activity = useWorkspace((s) => s.activity)
  const reduced = useWorkspace((s) => s.settings.reducedMotion)
  const low = useTier()

  // Construct a single long string of recent events
  const textStream = useMemo(() => {
    if (activity.length === 0) return '[SYS.LOG] NO RECENT ACTIVITY  //  '
    return activity
      .slice(0, 12)
      .map((ev) => `[SYS.${ev.severity.toUpperCase()}] ${ev.title.toUpperCase()}`)
      .join('  //  ') + '  //  '
  }, [activity])

  // We duplicate the text multiple times around a circle to form a ring
  const segments = 4
  const radius = 2.4

  useFrame((_, delta) => {
    if (ref.current && !reduced) {
      ref.current.rotation.y += delta * 0.15
    }
  })

  // Disable completely on low power mode to save geometry/texture memory
  if (low) return null

  return (
    <group ref={ref} position={[0, 0.6, 0]}>
      {Array.from({ length: segments }).map((_, i) => {
        const angle = (i / segments) * Math.PI * 2
        return (
          <group key={i} rotation={[0, angle, 0]}>
            <Text
              position={[0, 0, radius]}
              fontSize={0.07}
              color="#22d3ee"
              anchorX="center"
              anchorY="middle"
              fillOpacity={0.65}
              // Using a generic monospace fallback look
              fontStyle="normal"
            >
              {textStream}
            </Text>
          </group>
        )
      })}
    </group>
  )
}
