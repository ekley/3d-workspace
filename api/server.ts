import Fastify from 'fastify'
import cors from '@fastify/cors'
import os from 'os'
import { taskStore, TaskPriority, TaskStatus, WorkspaceSummary } from './taskStore'
import { projectStore, ProjectStatus } from './projectStore'
import { activityStore, ActivitySeverity, ActivityEvent } from './activityStore'

const fastify = Fastify({
  logger: true
})

fastify.register(cors, {
  origin: true
})

// System telemetry endpoints
fastify.get('/api/system', async (request, reply) => {
  return {
    platform: os.platform(),
    arch: os.arch(),
    freemem: os.freemem(),
    totalmem: os.totalmem(),
    uptime: os.uptime(),
    time: Date.now()
  }
})

fastify.get('/api/health', async (request, reply) => {
  return { status: 'ok', timestamp: Date.now() }
})

fastify.get('/api/stats', async (request, reply) => {
  return {
    cpus: os.cpus(),
    loadavg: os.loadavg(),
    network: os.networkInterfaces(),
    timestamp: Date.now()
  }
})

const motdMessages = [
  "SYSTEM NOMINAL. HAVE A PRODUCTIVE DAY.",
  "DO NOT TRUST THE GLITCHES.",
  "THE MATRIX IS LISTENING.",
  "FOCUS PROTOCOL: ONLINE.",
  "NEXUS CORE OPERATING AT PEAK EFFICIENCY."
];

fastify.get('/api/motd', async (request, reply) => {
  const msg = motdMessages[Math.floor(Math.random() * motdMessages.length)];
  return { message: msg, timestamp: Date.now() }
})

fastify.get('/api/sys-logs', async (request, reply) => {
  const sysLogs = [
    "[SYS] Initializing core modules...",
    "[NET] Establishing secure uplink...",
    "[SEC] Firewall protocols engaged.",
    "[OPS] Awaiting commands."
  ];
  return { logs: sysLogs, timestamp: Date.now() }
})

fastify.get('/api/version', async (request, reply) => {
  return { version: '1.0.0', build: 'NEXUS-CORE-V1', timestamp: Date.now() }
})

fastify.get('/api/time', async (request, reply) => {
  return { iso: new Date().toISOString(), timestamp: Date.now() }
})

fastify.get('/api/whoami', async (request, reply) => {
  return {
    userInfo: os.userInfo(),
    hostname: os.hostname(),
    timestamp: Date.now()
  }
})

// ==========================================
// RESTful Task Management API & Persistence
// ==========================================

fastify.get('/api/tasks', async (request, reply) => {
  const query = request.query as { projectId?: string; status?: string; priority?: string }
  const tasks = taskStore.getAllTasks({
    projectId: query.projectId,
    status: query.status as TaskStatus | undefined,
    priority: query.priority as TaskPriority | undefined,
  })
  return {
    tasks,
    count: tasks.length,
    timestamp: Date.now(),
  }
})

fastify.get('/api/tasks/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const task = taskStore.getTaskById(id)
  if (!task) {
    reply.status(404).send({ error: `Task with id '${id}' not found`, timestamp: Date.now() })
    return
  }
  return { task, timestamp: Date.now() }
})

fastify.post('/api/tasks', async (request, reply) => {
  const body = request.body as any
  if (!body || typeof body.title !== 'string' || !body.title.trim() || typeof body.projectId !== 'string') {
    reply.status(400).send({
      error: 'Missing required fields: projectId (string) and title (non-empty string)',
      timestamp: Date.now(),
    })
    return
  }

  const created = taskStore.createTask({
    projectId: body.projectId,
    title: body.title,
    priority: body.priority,
    assignee: body.assignee,
    dueDate: body.dueDate,
    estimate: body.estimate,
    tags: body.tags,
  })

  activityStore.createActivity({
    type: 'task-created',
    icon: 'plus',
    title: 'TASK CREATED',
    detail: `${created.projectId.toUpperCase()} · ${created.title}`,
    severity: 'info',
    projectId: created.projectId,
  })

  reply.status(201).send({
    task: created,
    message: 'Task created successfully',
    timestamp: Date.now(),
  })
})

fastify.patch('/api/tasks/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const body = request.body as any
  if (!body || typeof body !== 'object') {
    reply.status(400).send({ error: 'Invalid patch payload', timestamp: Date.now() })
    return
  }

  const updated = taskStore.updateTask(id, body)
  if (!updated) {
    reply.status(404).send({ error: `Task with id '${id}' not found`, timestamp: Date.now() })
    return
  }

  return {
    task: updated,
    message: 'Task updated successfully',
    timestamp: Date.now(),
  }
})

fastify.post('/api/tasks/:id/complete', async (request, reply) => {
  const { id } = request.params as { id: string }
  const result = taskStore.completeTask(id)
  if (!result) {
    reply.status(404).send({ error: `Task with id '${id}' not found`, timestamp: Date.now() })
    return
  }

  activityStore.createActivity({
    type: 'task-completed',
    icon: 'check',
    title: 'TASK COMPLETED',
    detail: `${result.task.projectId.toUpperCase()} · ${result.task.title} (+${result.xpGain} XP)`,
    severity: 'success',
    projectId: result.task.projectId,
  })

  return {
    task: result.task,
    xpGain: result.xpGain,
    message: 'Task completed successfully',
    timestamp: Date.now(),
  }
})

fastify.delete('/api/tasks/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const deleted = taskStore.deleteTask(id)
  if (!deleted) {
    reply.status(404).send({ error: `Task with id '${id}' not found`, timestamp: Date.now() })
    return
  }

  activityStore.createActivity({
    type: 'task-deleted',
    icon: 'close',
    title: 'TASK DELETED',
    detail: `Task [${id}] removed from database`,
    severity: 'warning',
  })

  return {
    success: true,
    id,
    message: 'Task deleted successfully',
    timestamp: Date.now(),
  }
})

fastify.post('/api/tasks/reset', async (request, reply) => {
  const tasks = taskStore.resetTasks()
  return {
    success: true,
    count: tasks.length,
    message: 'Task registry reset to default seed',
    timestamp: Date.now(),
  }
})

// ==========================================
// Workspace Summary & Metrics Telemetry API
// ==========================================

fastify.get('/api/workspace/summary', async (request, reply) => {
  const summary = taskStore.getWorkspaceSummary()
  return {
    summary,
    timestamp: Date.now(),
  }
})

fastify.get('/api/summary', async (request, reply) => {
  const summary = taskStore.getWorkspaceSummary()
  return {
    summary,
    timestamp: Date.now(),
  }
})

// ==========================================
// Projects Telemetry & Linked Tasks API
// ==========================================

fastify.get('/api/projects', async (request, reply) => {
  const query = request.query as { status?: string }
  const projects = projectStore.getAllProjects({
    status: query.status as ProjectStatus | undefined,
  })
  return {
    projects,
    count: projects.length,
    timestamp: Date.now(),
  }
})

fastify.get('/api/projects/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const project = projectStore.getProjectById(id)
  if (!project) {
    reply.status(404).send({
      error: `Project with id or code '${id}' not found`,
      timestamp: Date.now(),
    })
    return
  }
  return {
    project,
    timestamp: Date.now(),
  }
})

// ==========================================
// Activity Feed & Event Stream API
// ==========================================

fastify.get('/api/activity', async (request, reply) => {
  const query = request.query as {
    severity?: string
    type?: string
    projectId?: string
    limit?: string
  }
  const limit = query.limit ? parseInt(query.limit, 10) : undefined
  const events = activityStore.getAllActivities({
    severity: query.severity as ActivitySeverity | undefined,
    type: query.type,
    projectId: query.projectId,
    limit: isNaN(limit!) ? undefined : limit,
  })
  return {
    events,
    count: events.length,
    timestamp: Date.now(),
  }
})

fastify.get('/api/activity/recent', async (request, reply) => {
  const query = request.query as { limit?: string }
  const limit = query.limit ? parseInt(query.limit, 10) : 10
  const events = activityStore.getRecentActivities(isNaN(limit) ? 10 : limit)
  return {
    events,
    count: events.length,
    timestamp: Date.now(),
  }
})

fastify.get('/api/activity/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const event = activityStore.getActivityById(id)
  if (!event) {
    reply.status(404).send({
      error: `Activity event with id '${id}' not found`,
      timestamp: Date.now(),
    })
    return
  }
  return {
    event,
    timestamp: Date.now(),
  }
})

fastify.post('/api/activity', async (request, reply) => {
  const body = request.body as any
  if (!body || typeof body.title !== 'string' || !body.title.trim() || typeof body.detail !== 'string' || !body.detail.trim()) {
    reply.status(400).send({
      error: 'Missing required fields: title (non-empty string) and detail (non-empty string)',
      timestamp: Date.now(),
    })
    return
  }

  const created = activityStore.createActivity({
    type: body.type,
    icon: body.icon,
    title: body.title,
    detail: body.detail,
    severity: body.severity,
    projectId: body.projectId,
  })

  reply.status(201).send({
    event: created,
    message: 'Activity event logged successfully',
    timestamp: Date.now(),
  })
})

fastify.post('/api/activity/reset', async (request, reply) => {
  const activities = activityStore.resetActivities()
  return {
    success: true,
    count: activities.length,
    message: 'Activity feed reset to default seed',
    timestamp: Date.now(),
  }
})

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' })
    console.log('Backend server running on http://localhost:3001')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
