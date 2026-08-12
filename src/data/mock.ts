import type { ActivityEvent, Project, Task, User } from './types'

export const USER: User = {
  name: 'Elena Voss',
  handle: 'evoss',
  initials: 'EV',
  title: 'Lead Product Engineer',
  location: 'Remote · GMT+1',
  level: 27,
  xp: 6820,
  xpToNext: 8000,
  streak: 14,
  productivity: 92,
}

export const PROJECTS: Project[] = [
  {
    id: 'atlas',
    name: 'Atlas',
    code: 'ATL',
    description:
      'AI analytics platform turning raw product telemetry into live operational insights.',
    status: 'active',
    progress: 75,
    deadline: 'Mar 28',
    taskCount: 4,
    doneCount: 3,
    lastActivity: '2h ago · Kira merged "query builder v2"',
    color: '#22d3ee',
  },
  {
    id: 'helios',
    name: 'Helios',
    code: 'HEL',
    description:
      'Cross-platform design system and component library for all client surfaces.',
    status: 'active',
    progress: 50,
    deadline: 'Apr 10',
    taskCount: 4,
    doneCount: 2,
    lastActivity: '5h ago · Design tokens synced',
    color: '#8b7cf6',
  },
  {
    id: 'vault',
    name: 'Vault',
    code: 'VLT',
    description:
      'Encrypted storage core with zero-trust key rotation and audit logging.',
    status: 'at-risk',
    progress: 25,
    deadline: 'Mar 19',
    taskCount: 4,
    doneCount: 1,
    lastActivity: '1d ago · Key rotation test failed CI',
    color: '#fbbf24',
  },
  {
    id: 'pulse',
    name: 'Pulse',
    code: 'PLS',
    description: 'Realtime infrastructure monitoring with anomaly detection and alerting.',
    status: 'completed',
    progress: 100,
    deadline: 'Feb 27',
    taskCount: 4,
    doneCount: 4,
    lastActivity: '3d ago · v2.0.0 shipped',
    color: '#34d399',
  },
  {
    id: 'drift',
    name: 'Drift',
    code: 'DRF',
    description: 'Mobile companion app for on-the-go approvals and notifications.',
    status: 'paused',
    progress: 0,
    deadline: 'May 02',
    taskCount: 3,
    doneCount: 0,
    lastActivity: '1w ago · Waiting on design sign-off',
    color: '#6b8af0',
  },
]

export const TASKS: Task[] = [
  { id: 'atl-1', projectId: 'atlas', title: 'Design query builder UI', status: 'in-progress', priority: 'high', assignee: 'Kira', dueDate: 'Mar 14', estimate: '3d', tags: ['ui'] },
  { id: 'atl-2', projectId: 'atlas', title: 'Implement anomaly detection pipeline', status: 'completed', priority: 'high', assignee: 'Sam', dueDate: 'Mar 10', estimate: '5d', tags: ['ml'] },
  { id: 'atl-3', projectId: 'atlas', title: 'Wire dashboard to telemetry API', status: 'completed', priority: 'medium', assignee: 'Elena', dueDate: 'Mar 09', estimate: '2d', tags: ['api'] },
  { id: 'atl-4', projectId: 'atlas', title: 'Add CSV export for reports', status: 'backlog', priority: 'low', assignee: 'Priya', dueDate: 'Mar 20', estimate: '1d', tags: ['data'] },

  { id: 'hel-1', projectId: 'helios', title: 'Publish v3 token set', status: 'completed', priority: 'high', assignee: 'Mina', dueDate: 'Mar 08', estimate: '1d', tags: ['design'] },
  { id: 'hel-2', projectId: 'helios', title: 'Build data-table component', status: 'in-progress', priority: 'medium', assignee: 'Leo', dueDate: 'Mar 18', estimate: '4d', tags: ['components'] },
  { id: 'hel-3', projectId: 'helios', title: 'Document theming API', status: 'review', priority: 'medium', assignee: 'Elena', dueDate: 'Mar 12', estimate: '1d', tags: ['docs'] },
  { id: 'hel-4', projectId: 'helios', title: 'Dark-mode contrast audit', status: 'backlog', priority: 'low', assignee: 'Mina', dueDate: 'Mar 22', estimate: '2d', tags: ['a11y'] },

  { id: 'vlt-1', projectId: 'vault', title: 'Fix key-rotation race condition', status: 'in-progress', priority: 'high', assignee: 'Sam', dueDate: 'Mar 19', estimate: '3d', tags: ['security'] },
  { id: 'vlt-2', projectId: 'vault', title: 'Implement audit log export', status: 'completed', priority: 'medium', assignee: 'Priya', dueDate: 'Mar 05', estimate: '2d', tags: ['backend'] },
  { id: 'vlt-3', projectId: 'vault', title: 'Zero-trust access review', status: 'review', priority: 'high', assignee: 'Elena', dueDate: 'Mar 15', estimate: '1d', tags: ['security'] },
  { id: 'vlt-4', projectId: 'vault', title: 'Add HSM integration', status: 'backlog', priority: 'high', assignee: 'Sam', dueDate: 'Mar 25', estimate: '5d', tags: ['infra'] },

  { id: 'pls-1', projectId: 'pulse', title: 'Ship v2.0.0', status: 'completed', priority: 'high', assignee: 'Elena', dueDate: 'Feb 27', estimate: '3d', tags: ['release'] },
  { id: 'pls-2', projectId: 'pulse', title: 'Anomaly alert routing', status: 'completed', priority: 'high', assignee: 'Leo', dueDate: 'Feb 24', estimate: '4d', tags: ['alerts'] },
  { id: 'pls-3', projectId: 'pulse', title: 'On-call rotation sync', status: 'completed', priority: 'medium', assignee: 'Mina', dueDate: 'Feb 20', estimate: '1d', tags: ['ops'] },
  { id: 'pls-4', projectId: 'pulse', title: 'P99 latency dashboards', status: 'completed', priority: 'medium', assignee: 'Priya', dueDate: 'Feb 18', estimate: '2d', tags: ['metrics'] },

  { id: 'drf-1', projectId: 'drift', title: 'Define offline sync strategy', status: 'backlog', priority: 'high', assignee: 'Elena', dueDate: 'Apr 01', estimate: '3d', tags: ['mobile'] },
  { id: 'drf-2', projectId: 'drift', title: 'Push notification deep links', status: 'backlog', priority: 'medium', assignee: 'Leo', dueDate: 'Apr 08', estimate: '2d', tags: ['mobile'] },
  { id: 'drf-3', projectId: 'drift', title: 'App store screenshots', status: 'backlog', priority: 'low', assignee: 'Mina', dueDate: 'Apr 15', estimate: '1d', tags: ['design'] },
]

export const ACTIVITY: ActivityEvent[] = [
  { id: 'ev-1', type: 'task-completed', icon: 'check', title: 'TASK COMPLETED', detail: 'Atlas · Anomaly detection pipeline', time: '2h ago', severity: 'success', projectId: 'atlas' },
  { id: 'ev-2', type: 'project-updated', icon: 'layers', title: 'PROJECT UPDATED', detail: 'Helios reached 50% progress', time: '5h ago', severity: 'info', projectId: 'helios' },
  { id: 'ev-3', type: 'deployment', icon: 'zap', title: 'DEPLOYMENT SUCCESSFUL', detail: 'Pulse v2.0.0 · production', time: '1d ago', severity: 'success', projectId: 'pulse' },
  { id: 'ev-4', type: 'file-uploaded', icon: 'upload', title: 'NEW FILE UPLOADED', detail: 'Vault · key-rotation-notes.md', time: '3h ago', severity: 'info', projectId: 'vault' },
  { id: 'ev-5', type: 'comment', icon: 'bell', title: 'COMMENT RECEIVED', detail: 'Kira on Atlas query builder', time: '4h ago', severity: 'info', projectId: 'atlas' },
  { id: 'ev-6', type: 'milestone', icon: 'check', title: 'MILESTONE REACHED', detail: 'Pulse · 4/4 tasks shipped', time: '1d ago', severity: 'success', projectId: 'pulse' },
  { id: 'ev-7', type: 'review', icon: 'activity', title: 'TASK IN REVIEW', detail: 'Helios · Theming API docs', time: '6h ago', severity: 'warning', projectId: 'helios' },
  { id: 'ev-8', type: 'build-failed', icon: 'close', title: 'BUILD FAILED', detail: 'Vault · key rotation test failed CI', time: '1d ago', severity: 'critical', projectId: 'vault' },
  { id: 'ev-9', type: 'task-created', icon: 'plus', title: 'TASK CREATED', detail: 'Drift · Offline sync strategy', time: '2d ago', severity: 'info', projectId: 'drift' },
  { id: 'ev-10', type: 'streak', icon: 'zap', title: 'STREAK MAINTAINED', detail: '14 day productivity streak', time: '3d ago', severity: 'success' },
]
