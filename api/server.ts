import Fastify from 'fastify'
import cors from '@fastify/cors'
import os from 'os'

const fastify = Fastify({
  logger: true
})

fastify.register(cors, {
  origin: true
})

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
