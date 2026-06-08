import { ALL_PERMISSIONS, DEFAULT_LIMITED_ADMIN_PERMISSIONS, hasPermission } from '../lib/permissions'
import type {
  AdminRole,
  AdminSession,
  AdminStatus,
  Permission,
  ProviderApplication,
  TransferRunResult,
  UserStatus,
} from '../types/admin'
import {
  adminUsers,
  auditLogs,
  cancellations,
  enrollments,
  financeSummary,
  messageThreads,
  notificationEvents,
  overview,
  programs,
  providerApplications,
  providers,
  reviewReports,
  supportTickets,
  transactions,
  users,
} from './mockData'

import { getStoredAuth, persistAuth } from './authStorage'

const MOCK_LATENCY = 250

function delay<T>(value: T, latency = MOCK_LATENCY): Promise<T> {
  return new Promise((resolve) => window.setTimeout(() => resolve(value), latency))
}

function getActiveAdmin() {
  const stored = getStoredAuth()
  if (!stored) return null

  return adminUsers.find((admin) => admin.userId === stored.userId && admin.status === 'ACTIVE') ?? null
}

function makeSession(): AdminSession {
  const admin = getActiveAdmin()
  if (!admin) {
    return { isAdmin: false, adminRole: null, permissions: [], user: null }
  }

  return {
    isAdmin: true,
    adminRole: admin.role,
    permissions: admin.role === 'SUPER_ADMIN' ? ALL_PERMISSIONS : (admin.permissions ?? []),
    user: users.find((user) => user.id === admin.userId) ?? null,
  }
}

function requirePermission(required?: Permission | Permission[]) {
  const session = makeSession()
  if (!session.isAdmin || !hasPermission(session.adminRole, session.permissions, required)) {
    throw new Error('FORBIDDEN')
  }
  return session
}

function addAudit(action: string, resourceType: string, resourceId: string, summary: string) {
  const session = makeSession()
  auditLogs.unshift({
    id: `aud_${Date.now()}`,
    actorUserId: session.user?.id ?? 'unknown',
    actorRole: session.adminRole ?? 'LIMITED_ADMIN',
    action,
    resourceType,
    resourceId,
    summary,
    ipAddress: '127.0.0.1',
    userAgent: 'Mock browser',
    timestamp: new Date().toISOString(),
  })
}

export const adminApi = {
  async getMe() {
    return delay(makeSession())
  },

  async switchMockAdmin(userId: string) {
    const stored = getStoredAuth()
    if (!stored) throw new Error('Not authenticated.')

    persistAuth(userId, stored.token, stored.persistent)
    return delay(makeSession(), 120)
  },

  async getOverview() {
    requirePermission('dashboard.read')
    return delay(overview)
  },

  async getUsers(query = '') {
    requirePermission('users.read')
    const normalized = query.toLowerCase()
    return delay(
      users.filter((user) =>
        [user.email, user.username, user.role, user.status].some((value) =>
          value.toLowerCase().includes(normalized),
        ),
      ),
    )
  },

  async getUser(id: string) {
    requirePermission('users.read')
    return delay(users.find((user) => user.id === id) ?? null)
  },

  async updateUserStatus(id: string, status: UserStatus) {
    requirePermission('users.manage')
    const user = users.find((item) => item.id === id)
    if (user) user.status = status
    addAudit('users.manage', 'User', id, `Updated user status to ${status}.`)
    return delay(user ?? null)
  },

  async getProviders() {
    requirePermission('providers.read')
    return delay(providers)
  },

  async getProvider(id: string) {
    requirePermission('providers.read')
    return delay(providers.find((provider) => provider.id === id) ?? null)
  },

  async getProviderApplications(status?: ProviderApplication['status'] | 'ALL') {
    requirePermission('providerApplications.review')
    return delay(
      status && status !== 'ALL'
        ? providerApplications.filter((application) => application.status === status)
        : providerApplications,
    )
  },

  async reviewProviderApplication(id: string, status: 'APPROVED' | 'REJECTED', notes: string) {
    requirePermission('providerApplications.review')
    if (!notes.trim()) throw new Error('Review notes are required.')

    const application = providerApplications.find((item) => item.id === id)
    if (application) {
      application.status = status
      application.notes = notes
    }
    addAudit(
      'providerApplications.review',
      'ProviderApplication',
      id,
      `${status === 'APPROVED' ? 'Approved' : 'Rejected'} provider application.`,
    )
    return delay(application ?? null)
  },

  async getPrograms() {
    requirePermission('programs.read')
    return delay(programs)
  },

  async updateProgramModeration(id: string, status: 'PUBLISHED' | 'ARCHIVED' | 'REPORTED') {
    requirePermission('programs.moderate')
    const program = programs.find((item) => item.id === id)
    if (program) program.status = status
    addAudit('programs.moderate', 'Program', id, `Updated moderation status to ${status}.`)
    return delay(program ?? null)
  },

  async getEnrollments() {
    requirePermission('enrollments.read')
    return delay(enrollments)
  },

  async getCancellations() {
    requirePermission('cancellations.manage')
    return delay(cancellations)
  },

  async reviewCancellation(id: string, status: 'APPROVED' | 'REJECTED') {
    requirePermission('cancellations.manage')
    const cancellation = cancellations.find((item) => item.id === id)
    if (cancellation) cancellation.status = status
    addAudit('cancellations.manage', 'Cancellation', id, `Marked cancellation ${status}.`)
    return delay(cancellation ?? null)
  },

  async getFinanceSummary() {
    requirePermission('finance.read')
    return delay(financeSummary)
  },

  async getTransactions() {
    requirePermission('finance.read')
    return delay(transactions)
  },

  async runTransfers(): Promise<TransferRunResult> {
    const session = requirePermission('finance.transfer.run')
    if (session.adminRole !== 'SUPER_ADMIN') {
      throw new Error('Only SUPER_ADMIN can run payout transfers in the mock portal.')
    }

    transactions.forEach((transaction) => {
      if (transaction.status === 'PENDING' && transaction.type === 'PAYOUT') {
        transaction.status = 'SUCCEEDED'
      }
    })
    addAudit('finance.transfer.run', 'TransferBatch', 'mock_batch', 'Ran mocked payout transfer batch.')
    return delay({
      processed: 3,
      succeeded: 2,
      failed: 1,
      errors: ['acct_991 requires Stripe capability update'],
      transferIds: ['tr_mock_001', 'tr_mock_002'],
    })
  },

  async getSupportTickets() {
    requirePermission('support.manage')
    return delay(supportTickets)
  },

  async updateSupportTicket(id: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED') {
    requirePermission('support.manage')
    const ticket = supportTickets.find((item) => item.id === id)
    if (ticket) ticket.status = status
    addAudit('support.manage', 'SupportTicket', id, `Updated ticket status to ${status}.`)
    return delay(ticket ?? null)
  },

  async getReviewReports() {
    requirePermission('programs.moderate')
    return delay(reviewReports)
  },

  async getMessages() {
    requirePermission('messages.metadata.read')
    return delay(messageThreads)
  },

  async getNotifications() {
    requirePermission('notifications.read')
    return delay(notificationEvents)
  },

  async getAuditLogs() {
    const session = makeSession()
    requirePermission()
    if (hasPermission(session.adminRole, session.permissions, 'auditLogs.read')) {
      return delay(auditLogs)
    }
    return delay(auditLogs.filter((log) => log.actorUserId === session.user?.id))
  },

  async getAdminUsers() {
    requirePermission('adminUsers.manage')
    return delay(adminUsers)
  },

  async createAdminUser(input: {
    userId: string
    role: AdminRole
    permissions?: Permission[]
  }) {
    const session = requirePermission('adminUsers.manage')
    const user = users.find((item) => item.id === input.userId)
    if (!user) throw new Error('User not found.')

    user.role = 'admin'
    const adminUser = {
      id: `adm_${Date.now()}`,
      userId: input.userId,
      role: input.role,
      status: 'ACTIVE' as AdminStatus,
      assignedBy: session.user?.id ?? 'unknown',
      assignedAt: new Date().toISOString(),
      permissions: input.role === 'SUPER_ADMIN' ? [] : (input.permissions ?? DEFAULT_LIMITED_ADMIN_PERMISSIONS),
      user,
    }
    adminUsers.unshift(adminUser)
    addAudit('adminUsers.manage', 'AdminUser', adminUser.id, `Assigned ${input.role} access.`)
    return delay(adminUser)
  },

  async updateAdminUser(id: string, input: { status?: AdminStatus; permissions?: Permission[] }) {
    requirePermission('adminUsers.manage')
    const adminUser = adminUsers.find((item) => item.id === id)
    if (adminUser) {
      adminUser.status = input.status ?? adminUser.status
      adminUser.permissions = input.permissions ?? adminUser.permissions
    }
    addAudit('adminUsers.manage', 'AdminUser', id, 'Updated admin membership.')
    return delay(adminUser ?? null)
  },
}
