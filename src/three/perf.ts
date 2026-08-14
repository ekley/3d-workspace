/** Coarse low-power detection for graceful degradation. */
export function isLowPower(): boolean {
  if (typeof navigator === 'undefined') return false
  const mem = (navigator as { deviceMemory?: number }).deviceMemory
  const cores = navigator.hardwareConcurrency ?? 8
  return (typeof mem === 'number' && mem <= 4) || cores <= 4
}
