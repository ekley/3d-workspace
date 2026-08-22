import { useEffect, useRef, useState } from 'react'
import { useWorkspace } from '../state/workspace'
import { Icon } from './icons'
import {
  playTerminalKeypress,
  playTerminalSuccess,
  playTerminalError,
} from '../sound/audio'

interface LogLine {
  text: string
  type: 'input' | 'output' | 'error' | 'success' | 'system'
}

export function CyberTerminal() {
  const open = useWorkspace((s) => s.terminalOpen)
  const setOpen = useWorkspace((s) => s.setTerminalOpen)
  
  const user = useWorkspace((s) => s.user)
  const projects = useWorkspace((s) => s.projects)
  const tasks = useWorkspace((s) => s.tasks)
  const focusTimer = useWorkspace((s) => s.focusTimer)
  const startFocusTimer = useWorkspace((s) => s.startFocusTimer)
  const completeTask = useWorkspace((s) => s.completeTask)
  
  const soundEnabled = useWorkspace((s) => s.settings.soundEnabled)
  const updateSettings = useWorkspace((s) => s.updateSettings)
  const quality = useWorkspace((s) => s.settings.quality)
  
  const [inputVal, setInputVal] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const [matrixActive, setMatrixActive] = useState(false)
  
  const [lines, setLines] = useState<LogLine[]>([
    { text: 'NEXUS CYBERNETIC SHELL v0.1.0', type: 'system' },
    { text: 'ENTER "help" TO SEE LIST OF AVAILABLE COMMANDS', type: 'system' },
    { text: '------------------------------------------------', type: 'system' },
  ])
  
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Scroll to bottom on lines change
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [lines])

  // Matrix Rain Canvas animation
  useEffect(() => {
    if (!open || !matrixActive) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let frameId: number
    
    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 800
      canvas.height = canvas.parentElement?.clientHeight || 500
    }
    
    resize()
    window.addEventListener('resize', resize)

    const cols = Math.floor(canvas.width / 14) + 1
    const ypos = Array(cols).fill(0).map(() => Math.random() * -100)

    const draw = () => {
      ctx.fillStyle = 'rgba(5, 6, 10, 0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = 'rgba(34, 211, 238, 0.28)' // accent color with alpha
      ctx.font = '11px ui-monospace, monospace'

      for (let i = 0; i < cols; i++) {
        const text = String.fromCharCode(33 + Math.floor(Math.random() * 93))
        const x = i * 14
        const y = ypos[i]

        ctx.fillText(text, x, y)

        if (y > canvas.height && Math.random() > 0.975) {
          ypos[i] = 0
        } else {
          ypos[i] = y + 14
        }
      }

      frameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
    }
  }, [open, matrixActive])

  if (!open) return null

  const print = (text: string, type: LogLine['type'] = 'output') => {
    setLines((prev) => [...prev, { text, type }])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (soundEnabled && e.key.length === 1) {
      playTerminalKeypress()
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length === 0) return
      const nextIdx = histIdx + 1
      if (nextIdx < history.length) {
        setHistIdx(nextIdx)
        setInputVal(history[history.length - 1 - nextIdx])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const nextIdx = histIdx - 1
      if (nextIdx >= 0) {
        setHistIdx(nextIdx)
        setInputVal(history[history.length - 1 - nextIdx])
      } else {
        setHistIdx(-1)
        setInputVal('')
      }
    }
  }

  const executeCommand = (cmdStr: string) => {
    const raw = cmdStr.trim()
    if (!raw) return

    setHistory((prev) => [...prev, raw])
    setHistIdx(-1)
    
    print(`nexus://shell> ${raw}`, 'input')
    setInputVal('')

    const args = raw.split(/\s+/)
    const cmd = args[0].toLowerCase()

    let success = true

    switch (cmd) {
      case 'help':
        print('NEXUS CORE TERMINAL HELPDESK //', 'system')
        print('------------------------------------------------', 'system')
        print('help                    - Display command list', 'output')
        print('clear                   - Clear screen buffers', 'output')
        print('sys-info                - Check system performance & stats', 'output')
        print('projects                - Database of all projects', 'output')
        print('tasks [proj_code]       - List tasks (e.g. tasks ATL)', 'output')
        print('complete <task_id>      - Set task completed (e.g. complete atl-1)', 'output')
        print('focus <mins> [proj]     - Initiate focus timer (e.g. focus 25 atl)', 'output')
        print('xp <amount>             - Award debugging level XP', 'output')
        print('sound <on|off>          - Toggle synthesizers', 'output')
        print('matrix                  - Toggle Matrix neon stream overlay', 'output')
        print('exit / close            - Close terminal console', 'output')
        break

      case 'clear':
        setLines([])
        break

      case 'exit':
      case 'close':
        setOpen(false)
        break

      case 'sound': {
        const flag = args[1]?.toLowerCase()
        if (flag === 'on' || flag === 'off') {
          const enabled = flag === 'on'
          updateSettings({ soundEnabled: enabled })
          print(`SOUND AUDIO FX: ${enabled ? 'ENABLED' : 'DISABLED'}`, 'success')
        } else {
          print(`SOUND STATE IS CURRENTLY: ${soundEnabled ? 'ON' : 'OFF'} (Usage: sound <on|off>)`, 'error')
          success = false
        }
        break
      }

      case 'matrix':
        setMatrixActive((prev) => {
          const next = !prev
          print(`MATRIX CODE STREAM: ${next ? 'ACTIVATED' : 'DEACTIVATED'}`, next ? 'success' : 'system')
          return next
        })
        break

      case 'sys-info':
        print('NEXUS COMMAND DIAGNOSTICS //', 'system')
        print('------------------------------------------------', 'system')
        print(`USER: ${user.name} (@${user.handle})`, 'output')
        print(`RPG LEVEL: ${user.level} (XP: ${user.xp}/${user.xpToNext})`, 'output')
        print(`PRODUCTIVITY SCORE: ${user.productivity}%`, 'output')
        print(`STREAK COUNTER: ${user.streak} DAYS`, 'output')
        print(`FOCUS TIMER STATE: ${focusTimer.active ? `ACTIVE (${Math.floor(focusTimer.remainingSec / 60)}m left)` : 'INACTIVE'}`, 'output')
        print(`AUDIO ENGINE STATE: ${soundEnabled ? 'ON' : 'OFF'}`, 'output')
        print(`HARDWARE CONCURRENCY: ${window.navigator.hardwareConcurrency || 'UNKNOWN'} CORES`, 'output')
        print(`QUALITY TIER: ${quality.toUpperCase()}`, 'output')
        break

      case 'projects':
        print('PROJECT DATABASE DUMP //', 'system')
        print('------------------------------------------------', 'system')
        projects.forEach((p) => {
          print(`- ${p.name.toUpperCase()} [${p.code}] : ${p.progress}% | ${p.status.toUpperCase()} (${p.doneCount}/${p.taskCount} tasks)`, 'output')
        })
        break

      case 'tasks': {
        const codeFilter = args[1]?.toLowerCase()
        print('TASKS REGISTRY //', 'system')
        print('------------------------------------------------', 'system')
        
        let targetProjId: string | undefined = undefined
        if (codeFilter) {
          const target = projects.find((p) => p.code.toLowerCase() === codeFilter)
          if (!target) {
            print(`Error: project code "${args[1]}" not found.`, 'error')
            success = false
            break
          }
          targetProjId = target.id
        }

        const list = targetProjId ? tasks.filter((t) => t.projectId === targetProjId) : tasks
        if (list.length === 0) {
          print('No tasks matching search parameters.', 'output')
        } else {
          list.forEach((t) => {
            const proj = projects.find((p) => p.id === t.projectId)
            print(`[${t.id}] (${t.priority.toUpperCase()}) ${t.status.toUpperCase()} : ${t.title} [${proj?.code ?? ''}]`, 'output')
          })
        }
        break
      }

      case 'complete': {
        const taskId = args[1]
        if (!taskId) {
          print('Usage: complete <task_id> (e.g. complete atl-1)', 'error')
          success = false
          break
        }
        const task = tasks.find((t) => t.id.toLowerCase() === taskId.toLowerCase())
        if (!task) {
          print(`Error: Task "${taskId}" not found.`, 'error')
          success = false
          break
        }
        if (task.status === 'completed') {
          print(`Task "${taskId}" is already completed.`, 'error')
          success = false
          break
        }
        
        completeTask(task.id)
        print(`SUCCESS: Completed task [${task.id}] : "${task.title}"! XP awarded.`, 'success')
        break
      }

      case 'focus': {
        const mins = parseInt(args[1], 10)
        if (isNaN(mins) || mins <= 0) {
          print('Usage: focus <minutes> [proj_code] (e.g. focus 25 atl)', 'error')
          success = false
          break
        }
        let projId: string | undefined = undefined
        if (args[2]) {
          const code = args[2].toLowerCase()
          const p = projects.find((proj) => proj.code.toLowerCase() === code)
          if (!p) {
            print(`Warning: Project code "${args[2]}" not recognized. Starting general focus timer.`, 'error')
          } else {
            projId = p.id
          }
        }
        
        startFocusTimer(mins, 'work', projId)
        print(`SUCCESS: Started focus sprint for ${mins} minutes. Core reactive pulse triggered.`, 'success')
        break
      }

      case 'xp': {
        const amount = parseInt(args[1], 10)
        if (isNaN(amount) || amount <= 0) {
          print('Usage: xp <amount> (e.g. xp 500)', 'error')
          success = false
          break
        }
        
        const s = useWorkspace.getState()
        let { level, xp, xpToNext } = s.user
        xp += amount
        const events = []
        const isLevelUp = xp >= xpToNext
        if (isLevelUp) {
          xp -= xpToNext
          level += 1
          xpToNext = Math.round(xpToNext * 1.15)
          events.push({
            id: `ev-lvlup-${Date.now()}`,
            type: 'level-up',
            icon: 'zap',
            title: 'LEVEL UP',
            detail: `Reached level ${level}`,
            time: 'Just now',
            severity: 'success' as const
          })
          
          if (soundEnabled) {
            const getAudioCtx = (window.AudioContext || (window as any).webkitAudioContext)
            if (getAudioCtx) {
              const ctx = new getAudioCtx()
              const now = ctx.currentTime
              const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51]
              notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator()
                const gain = ctx.createGain()
                const startTime = now + idx * 0.06
                osc.type = 'sine'
                osc.frequency.setValueAtTime(freq, startTime)
                gain.gain.setValueAtTime(0.001, startTime)
                gain.gain.linearRampToValueAtTime(0.1, startTime + 0.02)
                gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.45)
                osc.connect(gain)
                gain.connect(ctx.destination)
                osc.start(startTime)
                osc.stop(startTime + 0.5)
              })
            }
          }
        }
        
        useWorkspace.setState({
          user: { ...s.user, level, xp, xpToNext },
          activity: [...events, ...s.activity],
          levelUp: level !== s.user.level ? level : s.levelUp
        })
        
        print(`SUCCESS: Awarded ${amount} debug XP to console user Elena.`, 'success')
        if (isLevelUp) {
          print(`LEVEL UP: Promoted to Level ${level}!`, 'success')
        }
        break
      }

      default:
        print(`bash: command not found: ${cmd}. Enter "help" for list of valid options.`, 'error')
        success = false
    }

    if (soundEnabled) {
      if (success && cmd !== 'clear') {
        playTerminalSuccess()
      } else if (!success) {
        playTerminalError()
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    executeCommand(inputVal)
  }

  return (
    <div className="terminal-overlay" onClick={() => setOpen(false)}>
      <section
        ref={terminalRef}
        className="panel terminal-panel"
        role="dialog"
        aria-label="Cyber Terminal"
        onClick={(e) => e.stopPropagation()}
      >
        <canvas ref={canvasRef} className="terminal-matrix-canvas" />
        <div className="terminal-crt-scanline" />
        
        <header className="tp-head terminal-head">
          <div className="terminal-title-container">
            <Icon name="terminal" size={16} />
            <span className="terminal-title">NEXUS_TERMINAL // SHELL_INTEGRATED</span>
          </div>
          <button className="icon-btn" aria-label="Close" onClick={() => setOpen(false)}>
            <Icon name="close" size={16} />
          </button>
        </header>

        <div ref={listRef} className="terminal-body">
          {lines.map((line, idx) => (
            <div key={idx} className={`terminal-line ${line.type}`}>
              {line.text}
            </div>
          ))}
        </div>

        <form className="terminal-input-form" onSubmit={handleSubmit}>
          <span className="terminal-prompt">nexus://shell&gt;</span>
          <input
            ref={inputRef}
            type="text"
            className="terminal-input"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            aria-label="Terminal input"
            maxLength={100}
          />
        </form>
      </section>
    </div>
  )
}
