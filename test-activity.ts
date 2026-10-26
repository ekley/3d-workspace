import { activityStore } from './api/activityStore'
import assert from 'assert'

console.log('--- Testing ActivityStore ---')

// 1. Initial seeded activities
const initial = activityStore.getAllActivities()
console.log(`Initial activities count: ${initial.length}`)
assert(initial.length > 0, 'Should have seeded activities')

// 2. Filter by severity
const criticals = activityStore.getAllActivities({ severity: 'critical' })
console.log(`Critical activities count: ${criticals.length}`)
assert(criticals.every(a => a.severity === 'critical'), 'All should be critical')

// 3. Filter by project
const atlasEvents = activityStore.getAllActivities({ projectId: 'atlas' })
console.log(`Atlas activities count: ${atlasEvents.length}`)
assert(atlasEvents.every(a => a.projectId === 'atlas'), 'All should belong to atlas')

// 4. Limit test
const limited = activityStore.getAllActivities({ limit: 5 })
console.log(`Limited activities count: ${limited.length}`)
assert.strictEqual(limited.length, 5, 'Should limit to 5 items')

// 5. Create new activity
const created = activityStore.createActivity({
  type: 'system-alert',
  icon: 'shield',
  title: 'FIREWALL BREACH ATTEMPT',
  detail: 'Intrusion countermeasure engaged on sector 7',
  severity: 'critical',
  projectId: 'vault'
})
console.log(`Created activity id: ${created.id}, title: ${created.title}`)
assert(created.id.startsWith('ev-'), 'ID should start with ev-')
assert.strictEqual(created.title, 'FIREWALL BREACH ATTEMPT')

// 6. Verify retrieved by id
const fetched = activityStore.getActivityById(created.id)
assert(fetched !== undefined, 'Should retrieve created activity')
assert.strictEqual(fetched?.id, created.id)

// 7. Recent stream
const recent = activityStore.getRecentActivities(3)
console.log(`Recent activities: ${recent.map(r => r.title).join(' | ')}`)
assert.strictEqual(recent[0].id, created.id, 'Newest created activity should be first')

console.log('All ActivityStore unit tests passed successfully!')
