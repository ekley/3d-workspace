import { lazy, Suspense, useEffect } from 'react'
import { TopBar } from './components/TopBar'
import { SideDock } from './components/SideDock'
import { QuickActions } from './components/QuickActions'
import { StatusBar } from './components/StatusBar'
import { ProjectPanel } from './components/ProjectPanel'
import { ProjectsPanel } from './components/ProjectsPanel'
import { ProductivityDashboard } from './components/ProductivityDashboard'
import { SettingsPanel } from './components/SettingsPanel'
import { TaskPanel } from './components/TaskPanel'
import { ActivityPanel } from './components/ActivityPanel'
import { FilePanel } from './components/FilePanel'
import { CalendarPanel } from './components/CalendarPanel'
import { GamificationPanel } from './components/GamificationPanel'
import { CommandPalette } from './components/CommandPalette'
import { useWorkspace } from './state/workspace'

const Scene = lazy(() => import('./three/Scene').then((m) => ({ default: m.Scene })))

export default function App() {
  const selectProject = useWorkspace((s) => s.selectProject)
  const focusProject = useWorkspace((s) => s.focusProject)
  const mode = useWorkspace((s) => s.mode)
  const disable3D = useWorkspace((s) => s.settings.disable3D)
  const reducedMotion = useWorkspace((s) => s.settings.reducedMotion)
  const immersive = mode === 'immersive' && !disable3D

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        selectProject(null)
        focusProject(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectProject, focusProject])

  return (
    <div className={`app${reducedMotion ? ' reduce-motion' : ''}`}>
      <TopBar />
      <div className="stage">
        <SideDock />
        <main className="viewport" aria-label={immersive ? '3D workspace' : '2D workspace'}>
          {immersive ? (
            <Suspense fallback={null}>
              <Scene />
            </Suspense>
          ) : (
            <ProductivityDashboard />
          )}
          <ProjectPanel />
          <ProjectsPanel />
          <TaskPanel />
          <ActivityPanel />
          <FilePanel />
          <CalendarPanel />
          <GamificationPanel />
        </main>
        <QuickActions />
      </div>
      <StatusBar />
      <CommandPalette />
      <SettingsPanel />
    </div>
  )
}
