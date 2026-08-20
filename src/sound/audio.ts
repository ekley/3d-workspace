// ponytail: zero-asset procedural Web Audio synthesizer. No audio files or libs needed.
let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioCtx) audioCtx = new AudioCtx()
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

export function playUiClick() {
  const ctx = getAudioContext()
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const now = ctx.currentTime

  osc.type = 'sine'
  osc.frequency.setValueAtTime(800, now)
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.04)

  gain.gain.setValueAtTime(0.04, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.04)
}

export function playTaskCompleteSound() {
  const ctx = getAudioContext()
  if (!ctx) return
  const now = ctx.currentTime
  const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const startTime = now + idx * 0.07

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, startTime)

    gain.gain.setValueAtTime(0.001, startTime)
    gain.gain.linearRampToValueAtTime(0.08, startTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.28)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(startTime)
    osc.stop(startTime + 0.3)
  })
}

export function playLevelUpSound() {
  const ctx = getAudioContext()
  if (!ctx) return
  const now = ctx.currentTime
  const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51] // A4, C#5, E5, A5, C#6, E6

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

export function playFocusStartSound() {
  const ctx = getAudioContext()
  if (!ctx) return
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(220, now)
  osc.frequency.exponentialRampToValueAtTime(587.33, now + 0.22) // D5

  gain.gain.setValueAtTime(0.001, now)
  gain.gain.linearRampToValueAtTime(0.08, now + 0.04)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.35)
}

export function playFocusDoneSound() {
  const ctx = getAudioContext()
  if (!ctx) return
  const now = ctx.currentTime
  const notes = [587.33, 880, 1174.66] // D5, A5, D6

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const startTime = now + idx * 0.12

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, startTime)

    gain.gain.setValueAtTime(0.001, startTime)
    gain.gain.linearRampToValueAtTime(0.1, startTime + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.4)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(startTime)
    osc.stop(startTime + 0.45)
  })
}
