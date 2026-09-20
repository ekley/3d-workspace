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
