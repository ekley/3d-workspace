import { useEffect, useRef } from 'react'
import { CameraControls } from '@react-three/drei'
import type CameraControlsImpl from 'camera-controls'
import { useWorkspace } from '../state/workspace'
import { PROJECTS } from '../data/mock'
import { projectPosition } from './layout'

const HOME_POS: [number, number, number] = [0, 6.5, 15]
const HOME_TARGET: [number, number, number] = [0, 0.6, 0]

export function CameraRig() {
  const ref = useRef<CameraControlsImpl | null>(null)
  const selectedId = useWorkspace((s) => s.selectedProjectId)
  const focusedId = useWorkspace((s) => s.focusedProjectId)
  const reduced = useWorkspace((s) => s.settings.reducedMotion)

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const active = focusedId ?? selectedId
    let pos: [number, number, number] = HOME_POS
    let target: [number, number, number] = HOME_TARGET
    if (active) {
      const i = PROJECTS.findIndex((p) => p.id === active)
      const [px, py, pz] = projectPosition(i, PROJECTS.length)
      const len = Math.hypot(px, pz) || 1
      const dist = focusedId ? 3.6 : 6.5
      target = [px, py, pz]
      pos = [px + (px / len) * dist, py + 1.3, pz + (pz / len) * dist]
    }
    c.setLookAt(pos[0], pos[1], pos[2], target[0], target[1], target[2], !reduced)
  }, [selectedId, focusedId, reduced])

  return (
    <CameraControls
      ref={ref}
      makeDefault
      minDistance={3}
      maxDistance={30}
      minPolarAngle={Math.PI * 0.15}
      maxPolarAngle={Math.PI * 0.55}
      mouseButtons={{ left: 1, middle: 16, right: 0, wheel: 16 }}
    />
  )
}
