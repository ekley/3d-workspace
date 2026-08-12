import type { Project, Task } from '../data/types'

/** Deterministic ring position so the 3D nodes and the camera rig agree. */
export function projectPosition(
  index: number,
  total: number,
  radius = 4.3,
): [number, number, number] {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2
  return [Math.cos(angle) * radius, 0.6, Math.sin(angle) * radius]
}

/** Orbit position of a task around its project. Index derived from the given task list. */
export function taskOrbitPosition(
  tasks: Task[],
  projects: Project[],
  projectId: string,
  taskId: string,
): [number, number, number] {
  let pi = projects.findIndex((p) => p.id === projectId)
  if (pi < 0) pi = 0
  const [px, py, pz] = projectPosition(pi, projects.length)
  const projectTasks = tasks.filter((t) => t.projectId === projectId)
  let ti = projectTasks.findIndex((t) => t.id === taskId)
  if (ti < 0) ti = 0
  const angle = (ti / Math.max(1, projectTasks.length)) * Math.PI * 2
  return [px + Math.cos(angle) * 1.15, py + 0.15, pz + Math.sin(angle) * 1.15]
}
