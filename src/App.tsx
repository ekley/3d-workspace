import { useEffect } from 'react'
import { TopBar } from './components/TopBar'
import { SideDock } from './components/SideDock'
import { QuickActions } from './components/QuickActions'
import { StatusBar } from './components/StatusBar'
import { ProjectPanel } from './components/ProjectPanel'
import { TaskPanel } from './components/TaskPanel'
import { ActivityPanel } from './components/ActivityPanel'
import { FilePanel } from './components/FilePanel'
import { CalendarPanel } from './components/CalendarPanel'
import { GamificationPanel } from './components/GamificationPanel'
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
          <ActivityPanel />
          <FilePanel />
          <CalendarPanel />
          <GamificationPanel />
        </main>
        <QuickActions />
      </div>
      <StatusBar />
    </div>
  )
}
