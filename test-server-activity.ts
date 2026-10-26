import Fastify from 'fastify'
import cors from '@fastify/cors'
import { taskStore } from './api/taskStore'
import { activityStore, ActivitySeverity } from './api/activityStore'
import assert from 'assert'

async function runTests() {
  const app = Fastify({ logger: false })
  await app.register(cors, { origin: true })

  // Register endpoints
  app.get('/api/activity', async (request, reply) => {
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

  app.get('/api/activity/recent', async (request, reply) => {
    const query = request.query as { limit?: string }
    const limit = query.limit ? parseInt(query.limit, 10) : 10
    const events = activityStore.getRecentActivities(isNaN(limit) ? 10 : limit)
    return {
      events,
      count: events.length,
      timestamp: Date.now(),
    }
  })

  app.get('/api/activity/:id', async (request, reply) => {
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

  app.post('/api/activity', async (request, reply) => {
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

  // 1. Test GET /api/activity
  console.log('Testing GET /api/activity...')
  const res1 = await app.inject({ method: 'GET', url: '/api/activity' })
  assert.strictEqual(res1.statusCode, 200)
  const data1 = JSON.parse(res1.payload)
  assert(Array.isArray(data1.events))
  assert(data1.count > 0)
  console.log(`✓ GET /api/activity returned ${data1.count} events`)

  // 2. Test GET /api/activity?severity=critical
  console.log('Testing GET /api/activity?severity=critical...')
  const res2 = await app.inject({ method: 'GET', url: '/api/activity?severity=critical' })
  assert.strictEqual(res2.statusCode, 200)
  const data2 = JSON.parse(res2.payload)
  assert(data2.events.every((e: any) => e.severity === 'critical'))
  console.log(`✓ Critical filter returned ${data2.count} items`)

  // 3. Test POST /api/activity
  console.log('Testing POST /api/activity...')
  const res3 = await app.inject({
    method: 'POST',
    url: '/api/activity',
    payload: {
      type: 'security-scan',
      icon: 'shield',
      title: 'VULNERABILITY SCAN COMPLETE',
      detail: 'Core perimeter integrity verified: 100%',
      severity: 'success',
      projectId: 'vault',
    },
  })
  assert.strictEqual(res3.statusCode, 201)
  const data3 = JSON.parse(res3.payload)
  assert.strictEqual(data3.event.title, 'VULNERABILITY SCAN COMPLETE')
  console.log(`✓ POST /api/activity created event ${data3.event.id}`)

  // 4. Test GET /api/activity/:id
  console.log(`Testing GET /api/activity/${data3.event.id}...`)
  const res4 = await app.inject({ method: 'GET', url: `/api/activity/${data3.event.id}` })
  assert.strictEqual(res4.statusCode, 200)
  const data4 = JSON.parse(res4.payload)
  assert.strictEqual(data4.event.id, data3.event.id)
  console.log('✓ Successfully retrieved activity by id')

  // 5. Test 404 for unknown activity id
  console.log('Testing GET /api/activity/non-existent-id...')
  const res5 = await app.inject({ method: 'GET', url: '/api/activity/non-existent-id' })
  assert.strictEqual(res5.statusCode, 404)
  console.log('✓ 404 returned correctly for missing activity id')

  // 6. Test Recent endpoint
  console.log('Testing GET /api/activity/recent?limit=3...')
  const res6 = await app.inject({ method: 'GET', url: '/api/activity/recent?limit=3' })
  assert.strictEqual(res6.statusCode, 200)
  const data6 = JSON.parse(res6.payload)
  assert.strictEqual(data6.events.length, 3)
  console.log('✓ Recent endpoint returned 3 latest events')

  console.log('\nAll Fastify Activity Endpoint tests passed cleanly!')
}

runTests().catch((err) => {
  console.error('Test failed:', err)
  process.exit(1)
})
