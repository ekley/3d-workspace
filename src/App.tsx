import { TopBar } from './components/TopBar'
import { SideDock } from './components/SideDock'
import { QuickActions } from './components/QuickActions'
import { StatusBar } from './components/StatusBar'
import { Scene } from './three/Scene'

export default function App() {
  return (
    <div className="app">
      <TopBar />
      <div className="stage">
        <SideDock />
        <main className="viewport" aria-label="3D workspace">
          <Scene />
        </main>
        <QuickActions />
      </div>
      <StatusBar />
    </div>
  )
}
