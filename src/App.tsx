import { useEffect } from 'react'
import { TopBar } from './components/TopBar'
import { SideDock } from './components/SideDock'
import { QuickActions } from './components/QuickActions'
import { StatusBar } from './components/StatusBar'
import { ProjectPanel } from './components/ProjectPanel'
import { TaskPanel } from './components/TaskPanel'
import { Scene } from './three/Scene'
import { useWorkspace } from './state/workspace'

export default function App() {
  const selectProject = useWorkspace((s) => s.selectProject)
  const focusProject = useWorkspace((s) => s.focusProject)

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
    <div className="app">
      <TopBar />
      <div className="stage">
        <SideDock />
        <main className="viewport" aria-label="3D workspace">
          <Scene />
          <ProjectPanel />
          <TaskPanel />
        </main>
        <QuickActions />
      </div>
      <StatusBar />
    </div>
  )
}
