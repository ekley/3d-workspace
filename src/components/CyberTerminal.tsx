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
  const createTask = useWorkspace((s) => s.createTask)
  const deleteTask = useWorkspace((s) => s.deleteTask)
  const syncTasks = useWorkspace((s) => s.syncTasks)
  const apiSyncStatus = useWorkspace((s) => s.apiSyncStatus)
  const notes = useWorkspace((s) => s.notes)
  const createNote = useWorkspace((s) => s.createNote)
  const deleteNote = useWorkspace((s) => s.deleteNote)
  
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

  const executeCommand = async (cmdStr: string) => {
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
        print('health                  - Check backend API health', 'output')
        print('server-info             - Fetch real-time backend API telemetry', 'output')
        print('server-stats            - Check backend system statistics', 'output')
        print('motd                    - Fetch Message of the Day from Server', 'output')
        print('sys-info                - Check system performance & stats', 'output')
        print('sys-logs                - Fetch recent backend system logs', 'output')
        print('version                 - Show backend build version', 'output')
        print('time                    - Server time & clock drift', 'output')
        print('whoami                  - Identify backend host operator', 'output')
        print('ping [count]            - ICMP-style latency probe to Backend API', 'output')
        print('projects                - Database of all projects', 'output')
        print('tasks [proj_code]       - List tasks (e.g. tasks ATL)', 'output')
        print('complete <task_id>      - Set task completed (e.g. complete atl-1)', 'output')
        print('task-create <proj> <txt>- Create task via Backend API (e.g. task-create atl Fix auth)', 'output')
        print('task-delete <task_id>   - Delete task from Backend DB (e.g. task-delete atl-1)', 'output')
        print('task-sync               - Synchronize tasks with Backend Store', 'output')
        print('task-reset              - Reset task database to default seed', 'output')
        print('activity [filter]       - Stream recent backend telemetry events', 'output')
        print('notes [proj_code]       - List all notes shards', 'output')
        print('note-view <note_id>     - Display note content details', 'output')
        print('note-create <title>     - Create general note shard', 'output')
        print('note-delete <note_id>   - Delete note shard', 'output')
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

      case 'server-info':
        print('FETCHING REAL-TIME SERVER TELEMETRY...', 'system')
        try {
          const res = await fetch('/api/system')
          if (!res.ok) throw new Error('API offline')
          const data = await res.json()
          print('------------------------------------------------', 'system')
          print(`OS PLATFORM: ${data.platform.toUpperCase()}`, 'output')
          print(`CPU ARCH: ${data.arch.toUpperCase()}`, 'output')
          print(`TOTAL MEM: ${(data.totalmem / 1024 / 1024 / 1024).toFixed(2)} GB`, 'output')
          print(`FREE MEM: ${(data.freemem / 1024 / 1024 / 1024).toFixed(2)} GB`, 'output')
          print(`SERVER UPTIME: ${Math.floor(data.uptime)} SECONDS`, 'output')
          print(`SYS TIME: ${new Date(data.time).toLocaleTimeString()}`, 'output')
        } catch (err) {
          print('ERROR: UNABLE TO CONTACT BACKEND API', 'error')
          success = false
        }
        break

      case 'server-stats':
        print('FETCHING SERVER STATISTICS...', 'system')
        try {
          const res = await fetch('/api/stats')
          if (!res.ok) throw new Error('API offline')
          const data = await res.json()
          print('------------------------------------------------', 'system')
          print(`CPU CORES: ${data.cpus.length}x ${data.cpus[0]?.model.substring(0, 15) ?? 'UNKNOWN'}...`, 'output')
          print(`LOAD AVERAGE (1/5/15m): ${data.loadavg.map((l: number) => l.toFixed(2)).join(' / ')}`, 'output')
          print('NETWORK INTERFACES:', 'output')
          Object.keys(data.network).forEach((iface) => {
            const addrs = data.network[iface].map((a: any) => a.address).slice(0, 2).join(', ')
            print(`  [${iface}] ${addrs}`, 'output')
          })
        } catch (err) {
          print('ERROR: UNABLE TO CONTACT BACKEND API', 'error')
          success = false
        }
        break

      case 'motd':
        print('FETCHING MESSAGE OF THE DAY...', 'system')
        try {
          const res = await fetch('/api/motd')
          if (!res.ok) throw new Error('API offline')
          const data = await res.json()
          print('------------------------------------------------', 'system')
          print(`>> ${data.message}`, 'output')
        } catch (err) {
          print('ERROR: UNABLE TO CONTACT BACKEND API', 'error')
          success = false
        }
        break

      case 'health':
        print('PINGING BACKEND API...', 'system')
        try {
          const res = await fetch('/api/health')
          if (!res.ok) throw new Error('API offline')
          const data = await res.json()
          print('------------------------------------------------', 'system')
          print(`STATUS: ${data.status.toUpperCase()}`, 'output')
          print(`TIMESTAMP: ${data.timestamp}`, 'output')
        } catch (err) {
          print('ERROR: BACKEND API IS UNREACHABLE', 'error')
          success = false
        }
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

      case 'sys-logs':
        print('FETCHING SYSTEM LOGS...', 'system')
        try {
          const res = await fetch('/api/sys-logs')
          if (!res.ok) throw new Error('API offline')
          const data = await res.json()
          print('------------------------------------------------', 'system')
          data.logs.forEach((log: string) => {
            print(log, 'output')
          })
        } catch (err) {
          print('ERROR: UNABLE TO CONTACT BACKEND API', 'error')
          success = false
        }
        break

      case 'version':
        print('QUERYING CORE BUILD SIGNATURE...', 'system')
        try {
          const res = await fetch('/api/version')
          if (!res.ok) throw new Error('API offline')
          const data = await res.json()
          print('------------------------------------------------', 'system')
          print(`VERSION: v${data.version}`, 'output')
          print(`BUILD: ${data.build}`, 'output')
          print(`QUERIED AT: ${new Date(data.timestamp).toLocaleString()}`, 'output')
        } catch (err) {
          print('ERROR: UNABLE TO CONTACT BACKEND API', 'error')
          success = false
        }
        break

      case 'time':
        print('SYNCHRONISING CHRONOMETERS...', 'system')
        try {
          const t0 = Date.now()
          const res = await fetch('/api/time')
          if (!res.ok) throw new Error('API offline')
          const data = await res.json()
          const t1 = Date.now()
          const rtt = t1 - t0
          const drift = data.timestamp - (t0 + rtt / 2)
          print('------------------------------------------------', 'system')
          print(`SERVER (UTC): ${data.iso}`, 'output')
          print(`CLIENT (LOCAL): ${new Date(t1).toLocaleString()}`, 'output')
          print(`ROUND TRIP: ${rtt} ms`, 'output')
          print(`CLOCK DRIFT: ${drift >= 0 ? '+' : ''}${Math.round(drift)} ms`, Math.abs(drift) > 1000 ? 'error' : 'success')
        } catch (err) {
          print('ERROR: UNABLE TO CONTACT BACKEND API', 'error')
          success = false
        }
        break

      case 'whoami':
        print('RESOLVING OPERATOR IDENTITY...', 'system')
        try {
          const res = await fetch('/api/whoami')
          if (!res.ok) throw new Error('API offline')
          const data = await res.json()
          const info = data.userInfo ?? {}
          print('------------------------------------------------', 'system')
          print(`OPERATOR: ${info.username ?? 'UNKNOWN'}`, 'output')
          print(`HOST: ${data.hostname}`, 'output')
          print(`HOME: ${info.homedir ?? 'N/A'}`, 'output')
          print(`SHELL: ${info.shell ?? 'N/A'}`, 'output')
          print(`WORKSPACE ID: ${user.name} (@${user.handle})`, 'output')
        } catch (err) {
          print('ERROR: UNABLE TO CONTACT BACKEND API', 'error')
          success = false
        }
        break

      case 'ping': {
        const countArg = args[1] ? parseInt(args[1], 10) : 3
        const count = Math.min(Math.max(isNaN(countArg) ? 3 : countArg, 1), 5)
        print(`PROBING BACKEND NETWORK INTERFACE (127.0.0.1)...`, 'system')

        const rtts: number[] = []
        let successCount = 0

        for (let i = 1; i <= count; i++) {
          const t0 = performance.now()
          try {
            const res = await fetch(`/api/ping?t=${Date.now()}&seq=${i}`, { cache: 'no-store' })
            const rtt = Math.max(1, Math.round(performance.now() - t0))
            if (res.ok) {
              const data = await res.json()
              rtts.push(rtt)
              successCount++
              print(`SEQ ${i}: Reply from 127.0.0.1: bytes=32 time=${rtt}ms status=PONG uptime=${data.uptime}s`, 'output')
            } else {
              print(`SEQ ${i}: HTTP Error ${res.status}`, 'error')
            }
          } catch {
            print(`SEQ ${i}: Request timed out (Backend API offline)`, 'error')
          }
          if (i < count) {
            await new Promise((resolve) => setTimeout(resolve, 300))
          }
        }

        print('------------------------------------------------', 'system')
        const lossPercent = Math.round(((count - successCount) / count) * 100)
        print(`--- 127.0.0.1 ping statistics ---`, 'system')
        print(`${count} packets transmitted, ${successCount} received, ${lossPercent}% packet loss`, lossPercent === 0 ? 'success' : 'error')
        if (rtts.length > 0) {
          const min = Math.min(...rtts)
          const max = Math.max(...rtts)
          const avg = (rtts.reduce((a, b) => a + b, 0) / rtts.length).toFixed(1)
          print(`rtt min/avg/max = ${min}/${avg}/${max} ms`, 'output')
        }
        if (successCount === 0) success = false
        break
      }

      case 'projects':
        print('PROJECT DATABASE DUMP //', 'system')
        print('------------------------------------------------', 'system')
        projects.forEach((p) => {
          print(`- ${p.name.toUpperCase()} [${p.code}] : ${p.progress}% | ${p.status.toUpperCase()} (${p.doneCount}/${p.taskCount} tasks)`, 'output')
        })
        break

      case 'tasks': {
        const codeFilter = args[1]?.toLowerCase()
        print(`TASKS REGISTRY // [BACKEND: ${apiSyncStatus.toUpperCase()}]`, 'system')
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
        print(`SUCCESS: Completed task [${task.id}] : "${task.title}"! Persisted to backend.`, 'success')
        break
      }

      case 'task-create': {
        const projCode = args[1]?.toLowerCase()
        const title = args.slice(2).join(' ')
        if (!projCode || !title) {
          print('Usage: task-create <proj_code> <title> (e.g. task-create ATL Refactor parser)', 'error')
          success = false
          break
        }
        const proj = projects.find((p) => p.code.toLowerCase() === projCode)
        if (!proj) {
          print(`Error: Project code "${args[1]}" not found.`, 'error')
          success = false
          break
        }
        createTask({
          projectId: proj.id,
          title,
          priority: 'medium',
        })
        print(`SUCCESS: Created task "${title}" on [${proj.code}]. Dispatched to Backend Store.`, 'success')
        break
      }

      case 'task-delete': {
        const taskId = args[1]
        if (!taskId) {
          print('Usage: task-delete <task_id> (e.g. task-delete atl-1)', 'error')
          success = false
          break
        }
        const task = tasks.find((t) => t.id.toLowerCase() === taskId.toLowerCase())
        if (!task) {
          print(`Error: Task "${taskId}" not found.`, 'error')
          success = false
          break
        }
        await deleteTask(task.id)
        print(`SUCCESS: Deleted task [${task.id}] : "${task.title}" from Backend Store.`, 'success')
        break
      }

      case 'task-sync': {
        print('SYNCHRONIZING WITH BACKEND PERSISTENCE STORE...', 'system')
        try {
          const t0 = Date.now()
          await syncTasks()
          const t1 = Date.now()
          const rtt = t1 - t0
          const currentTasks = useWorkspace.getState().tasks
          const done = currentTasks.filter((t) => t.status === 'completed').length
          print('------------------------------------------------', 'system')
          print(`BACKEND SYNC: OK (${rtt} ms round-trip)`, 'success')
          print(`TASKS INDEXED: ${currentTasks.length} (${done} completed, ${currentTasks.length - done} pending)`, 'output')
        } catch {
          print('ERROR: UNABLE TO SYNCHRONIZE WITH BACKEND API', 'error')
          success = false
        }
        break
      }

      case 'task-reset': {
        print('DISPATCHING RESET TO BACKEND TASK DATABASE...', 'system')
        try {
          const res = await fetch('/api/tasks/reset', { method: 'POST' })
          if (!res.ok) throw new Error('API offline')
          const data = await res.json()
          await syncTasks()
          print('------------------------------------------------', 'system')
          print(`SUCCESS: ${data.message} (${data.count} tasks restored).`, 'success')
        } catch {
          print('ERROR: UNABLE TO RESET TASK STORE ON BACKEND', 'error')
          success = false
        }
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

      case 'notes': {
        const codeFilter = args[1]?.toLowerCase()
        print('NOTES REGISTRY //', 'system')
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

        const list = targetProjId ? notes.filter((n) => n.projectId === targetProjId) : notes
        if (list.length === 0) {
          print('No notes matching search parameters.', 'output')
        } else {
          list.forEach((n) => {
            const proj = projects.find((p) => p.id === n.projectId)
            print(`[${n.id}] (${n.category.toUpperCase()}) : ${n.title} [${proj?.code ?? 'GENERAL'}]`, 'output')
          })
        }
        break
      }

      case 'note-view': {
        const noteId = args[1]
        if (!noteId) {
          print('Usage: note-view <note_id> (e.g. note-view n-1)', 'error')
          success = false
          break
        }
        const note = notes.find((n) => n.id.toLowerCase() === noteId.toLowerCase())
        if (!note) {
          print(`Error: Note "${noteId}" not found.`, 'error')
          success = false
          break
        }
        const proj = projects.find((p) => p.id === note.projectId)
        print(`NOTE: ${note.title} //`, 'system')
        print(`ID: ${note.id} | CATEGORY: ${note.category.toUpperCase()} | PROJECT: ${proj?.name ?? 'GENERAL'}`, 'system')
        print('------------------------------------------------', 'system')
        note.content.split('\n').forEach((line) => print(line, 'output'))
        break
      }

      case 'note-create': {
        const title = args.slice(1).join(' ')
        if (!title) {
          print('Usage: note-create <note title> (e.g. note-create Setup steps)', 'error')
          success = false
          break
        }
        createNote({
          title,
          content: 'Created via CLI console.',
          category: 'general',
        })
        print(`SUCCESS: Created note shard: "${title}"! +10 XP awarded.`, 'success')
        break
      }

      case 'note-delete': {
        const noteId = args[1]
        if (!noteId) {
          print('Usage: note-delete <note_id> (e.g. note-delete n-1)', 'error')
          success = false
          break
        }
        const note = notes.find((n) => n.id.toLowerCase() === noteId.toLowerCase())
        if (!note) {
          print(`Error: Note "${noteId}" not found.`, 'error')
          success = false
          break
        }
        deleteNote(note.id)
        print(`SUCCESS: Deleted note shard [${note.id}] : "${note.title}".`, 'success')
        break
      }

      case 'activity': {
        const filter = args[1]?.toLowerCase()
        print('QUERYING BACKEND ACTIVITY TELEMETRY FEED...', 'system')
        try {
          let url = '/api/activity?limit=15'
          if (filter) {
            if (['info', 'success', 'warning', 'critical'].includes(filter)) {
              url += `&severity=${filter}`
            } else {
              const matchedProj = projects.find((p) => p.code.toLowerCase() === filter || p.id.toLowerCase() === filter)
              if (matchedProj) {
                url += `&projectId=${matchedProj.id}`
              } else {
                url += `&type=${filter}`
              }
            }
          }
          const res = await fetch(url)
          if (!res.ok) throw new Error('API offline')
          const data = await res.json()
          print('------------------------------------------------', 'system')
          if (data.events.length === 0) {
            print('No matching activity events found in stream.', 'output')
          } else {
            data.events.forEach((ev: any) => {
              const type = (ev.severity || 'info').toUpperCase()
              const typeKind: 'success' | 'error' | 'output' =
                ev.severity === 'critical' ? 'error' : ev.severity === 'success' ? 'success' : 'output'
              print(`[${ev.time || 'NOW'}] [${type}] ${ev.title} - ${ev.detail}`, typeKind)
            })
          }
        } catch {
          print('ERROR: UNABLE TO CONTACT BACKEND ACTIVITY SERVICE', 'error')
          success = false
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
    void executeCommand(inputVal)
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
