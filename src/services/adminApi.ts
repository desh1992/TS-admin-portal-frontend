import { ALL_PERMISSIONS } from '../lib/permissions'
import type {
  AdminSession,
  AdminUser,
  AuditLog,
  FinanceSummary,
  MessageThread,
  Overview,
  Program,
  Provider,
  ProviderApplication,
  ReportResult,
  ReportType,
  SupportTicket,
  Transaction,
  TransferRunResult,
  User,
  UserDetail,
  UserStatus,
  Enrollment,
} from '../types/admin'
import { apiFetch, ApiError } from './httpClient'
import { getStoredAuth } from './authStorage'
import { cancellations, notificationEvents, reviewReports } from './mockData'

const MOCK_LATENCY = 200

/** Resolves mock data with a small delay for modules the backend lacks. */
function mock<T>(value: T, latency = MOCK_LATENCY): Promise<T> {
  return new Promise((resolve) => window.setTimeout(() => resolve(value), latency))
}

const UNAUTHENTICATED_SESSION: AdminSession = {
  isAdmin: false,
  adminRole: null,
  permissions: [],
  user: null,
}

// ===========================
// Backend response shapes
// ===========================

interface BackendUser {
  id: string
  publicId: string
  email: string
  username: string
  firstName: string
  lastName: string
  role: 'SEEKER' | 'PROVIDER'
  isAdmin: boolean
  isVerified: boolean
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED'
  createdAt: string
}

interface Paginated {
  pagination: { page: number; limit: number; total: number; pages: number }
}

interface BackendApplication {
  id: string
  publicId: string
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'
  headline: string
  skills: string[]
  experience: string
  portfolioUrl?: string | null
  reviewNotes: string | null
  createdAt: string
  user?: { username: string; email: string; firstName: string; lastName: string }
}

interface BackendProgram {
  id: string
  publicId: string
  providerId: string
  title: string
  category: string | null
  description: string | null
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'REPORTED'
  deliveryMode: 'ONLINE' | 'IN_PERSON' | 'HYBRID'
  enrollmentCapacity: number
  createdAt: string
  provider?: { username: string; firstName: string; lastName: string }
  _count?: { enrollments: number }
}

interface BackendEnrollment {
  id: string
  publicId: string
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  enrolledAt: string
  seeker: { username: string; firstName: string; lastName: string }
  program: {
    title: string
    deliveryMode: 'ONLINE' | 'IN_PERSON' | 'HYBRID'
    provider: { username: string; firstName: string; lastName: string }
  }
}

interface BackendMessage {
  id: string
  subject: string
  body: string
  readAt: string | null
  createdAt: string
  fromUser: { username: string; firstName: string; lastName: string }
  toUser: { username: string; firstName: string; lastName: string; email: string }
}

interface BackendUserDetail extends BackendUser {
  bio?: string | null
  providerApplications?: Array<{ id: string; publicId: string; status: string; headline: string; createdAt: string }>
  media?: Array<{ id: string; contentType: string; s3Key: string; createdAt: string }>
  programs?: Array<{ id: string; publicId: string; title: string; status: string }>
  enrollments?: Array<{ id: string; publicId: string; enrolledAt: string; program: { title: string } }>
  supportTickets?: Array<{ id: string; publicId: string; subject: string; status: string }>
}

interface BackendPayout {
  id: string
  publicId: string
  payoutStatus: 'REQUESTED' | 'APPROVED' | 'PROCESSING' | 'PAID' | 'REJECTED'
  amountMinor: number
  currency: string
  createdAt: string
  provider?: { username: string; firstName: string; lastName: string }
}

interface BackendPayment {
  id: string
  publicId: string
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED'
  amountMinor: number
  feeMinor: number
  refundedAmountMinor: number
  createdAt: string
  user?: { username: string; email: string }
}

interface BackendTicket {
  id: string
  publicId: string
  email: string
  name: string | null
  inquiryType: string
  subject: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  adminNotes: string | null
  updatedAt: string
  user?: { username: string } | null
  assignedTo?: { username: string } | null
}

interface BackendAuditLog {
  id: string
  adminId: string
  action: string
  entityType: string
  entityId: string | null
  metadata: unknown
  createdAt: string
  admin?: { publicId: string; username: string }
}

interface BackendStats {
  users: { total: number; active: number; providers: number }
  applications: { pending: number }
  tickets: { open: number }
  payouts: { pending: number }
  payments: { succeededCount: number; totalAmountMinor: number }
}

// ===========================
// Mappers
// ===========================

function fullName(parts: { firstName?: string; lastName?: string; username?: string; email?: string }) {
  const name = [parts.firstName, parts.lastName].filter(Boolean).join(' ').trim()
  return name || parts.username || parts.email || 'Unknown'
}

function mapUserStatus(status: BackendUser['status']): UserStatus {
  return status === 'DELETED' ? 'DISABLED' : status
}

function mapUser(user: BackendUser): User {
  return {
    id: user.id,
    publicId: user.publicId,
    email: user.email,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.isAdmin ? 'admin' : user.role === 'PROVIDER' ? 'provider' : 'seeker',
    status: mapUserStatus(user.status),
    joinedAt: user.createdAt,
    verificationStatus: user.isVerified ? 'VERIFIED' : 'UNVERIFIED',
    interests: [],
    enrollmentsCount: 0,
    paymentsTotal: 0,
    messagesCount: 0,
  }
}

function toBackendStatus(status: UserStatus): 'ACTIVE' | 'SUSPENDED' | 'DELETED' {
  if (status === 'DISABLED') return 'DELETED'
  if (status === 'SUSPENDED') return 'SUSPENDED'
  return 'ACTIVE'
}

function mapUserDetail(user: BackendUserDetail): UserDetail {
  const base = mapUser(user)
  return {
    ...base,
    bio: user.bio ?? null,
    enrollmentsCount: user.enrollments?.length ?? 0,
    providerApplications: user.providerApplications ?? [],
    media: user.media ?? [],
    programs: user.programs ?? [],
    enrollments: user.enrollments ?? [],
    supportTickets: user.supportTickets ?? [],
  }
}

function mapApplication(app: BackendApplication): ProviderApplication {
  return {
    id: app.id,
    applicantName: app.user ? fullName(app.user) : 'Unknown applicant',
    email: app.user?.email ?? '',
    status: app.status === 'PENDING' ? 'SUBMITTED' : app.status,
    submittedAt: app.createdAt,
    stripeStatus: 'NOT_STARTED',
    category: app.headline,
    experience: app.experience,
    skills: app.skills ?? [],
    portfolioUrl: app.portfolioUrl ?? undefined,
    notes: app.reviewNotes ?? undefined,
  }
}

function mapProgram(program: BackendProgram): Program {
  const providerName = program.provider ? fullName(program.provider) : 'Unknown'
  return {
    id: program.id,
    title: program.title,
    provider: providerName,
    category: program.category ?? 'General',
    status: program.status,
    deliveryMode: program.deliveryMode,
    enrollments: program._count?.enrollments ?? 0,
    rating: 0,
    createdAt: program.createdAt,
  }
}

function mapEnrollment(enrollment: BackendEnrollment): Enrollment {
  return {
    id: enrollment.id,
    seeker: fullName(enrollment.seeker),
    provider: fullName(enrollment.program.provider),
    program: enrollment.program.title,
    status: enrollment.status === 'CANCELLED' ? 'CANCELLED' : enrollment.status === 'COMPLETED' ? 'COMPLETED' : 'ACTIVE',
    deliveryMode: enrollment.program.deliveryMode,
    enrolledAt: enrollment.enrolledAt,
  }
}

function mapMessage(message: BackendMessage): MessageThread {
  return {
    id: message.id,
    from: fullName(message.fromUser),
    to: fullName(message.toUser),
    toEmail: message.toUser.email,
    subject: message.subject,
    body: message.body,
    readAt: message.readAt,
    sentAt: message.createdAt,
  }
}

function mapTicket(ticket: BackendTicket): SupportTicket {
  return {
    id: ticket.id,
    requester: ticket.name || ticket.user?.username || ticket.email,
    inquiryType: ticket.inquiryType,
    status: ticket.status,
    assignedTo: ticket.assignedTo?.username,
    subject: ticket.subject,
    updatedAt: ticket.updatedAt,
    internalNotes: ticket.adminNotes ? [ticket.adminNotes] : [],
  }
}

function mapAuditLog(log: BackendAuditLog): AuditLog {
  let summary = ''
  if (log.metadata && typeof log.metadata === 'object') {
    try {
      summary = JSON.stringify(log.metadata)
    } catch {
      summary = ''
    }
  }
  return {
    id: log.id,
    actorUserId: log.admin?.username ?? log.adminId,
    actorRole: 'SUPER_ADMIN',
    action: log.action,
    resourceType: log.entityType,
    resourceId: log.entityId ?? '—',
    summary,
    ipAddress: '—',
    userAgent: '—',
    timestamp: log.createdAt,
  }
}

// ===========================
// API
// ===========================

export const adminApi = {
  async getMe(): Promise<AdminSession> {
    if (!getStoredAuth()) return UNAUTHENTICATED_SESSION

    try {
      const user = await apiFetch<BackendUser>('/api/auth/me')
      if (!user.isAdmin) return UNAUTHENTICATED_SESSION

      return {
        isAdmin: true,
        // The backend models admin access as a single flag, so every admin
        // maps to SUPER_ADMIN with the full permission set.
        adminRole: 'SUPER_ADMIN',
        permissions: ALL_PERMISSIONS,
        user: mapUser(user),
      }
    } catch {
      return UNAUTHENTICATED_SESSION
    }
  },

  async getOverview(): Promise<Overview> {
    const stats = await apiFetch<BackendStats>('/api/admin/stats')
    let logs: BackendAuditLog[]
    try {
      const res = await apiFetch<{ logs: BackendAuditLog[] } & Paginated>(
        '/api/admin/audit-logs?limit=5',
      )
      logs = res.logs
    } catch {
      logs = []
    }

    const metrics: Overview['metrics'] = [
      { label: 'Total users', value: String(stats.users.total), delta: 'All accounts', tone: 'neutral' },
      { label: 'Active users', value: String(stats.users.active), delta: 'Status ACTIVE', tone: 'good' },
      { label: 'Active providers', value: String(stats.users.providers), delta: 'Role PROVIDER', tone: 'good' },
      {
        label: 'Pending applications',
        value: String(stats.applications.pending),
        delta: 'Awaiting review',
        tone: stats.applications.pending > 0 ? 'warn' : 'good',
      },
      {
        label: 'Open support tickets',
        value: String(stats.tickets.open),
        delta: 'OPEN or IN_PROGRESS',
        tone: stats.tickets.open > 0 ? 'warn' : 'good',
      },
      {
        label: 'Pending payouts',
        value: String(stats.payouts.pending),
        delta: 'Awaiting transfer',
        tone: stats.payouts.pending > 0 ? 'warn' : 'good',
      },
      {
        label: 'Succeeded payments',
        value: String(stats.payments.succeededCount),
        delta: 'Lifetime',
        tone: 'neutral',
      },
      {
        label: 'Gross volume',
        value: formatUsd(stats.payments.totalAmountMinor),
        delta: 'Succeeded payments',
        tone: 'neutral',
      },
    ]

    const activity: Overview['activity'] = logs.map((log) => ({
      id: log.id,
      action: log.action,
      actor: log.admin?.username ?? log.adminId,
      timestamp: log.createdAt,
      resource: `${log.entityType}${log.entityId ? ` · ${log.entityId}` : ''}`,
    }))

    const alerts: Overview['alerts'] = []
    if (stats.applications.pending > 0) {
      alerts.push({
        id: 'alert-applications',
        severity: 'warning',
        title: `${stats.applications.pending} provider application(s) pending`,
        description: 'Review the Applications queue to keep onboarding on track.',
      })
    }
    if (stats.payouts.pending > 0) {
      alerts.push({
        id: 'alert-payouts',
        severity: 'warning',
        title: `${stats.payouts.pending} payout(s) awaiting action`,
        description: 'Advance payout requests from the Finance module.',
      })
    }
    if (stats.tickets.open > 0) {
      alerts.push({
        id: 'alert-tickets',
        severity: 'info',
        title: `${stats.tickets.open} open support ticket(s)`,
        description: 'Unresolved tickets are visible in Support & Cancellations.',
      })
    }
    if (alerts.length === 0) {
      alerts.push({
        id: 'alert-clear',
        severity: 'info',
        title: 'No outstanding alerts',
        description: 'Applications, payouts, and support queues are all clear.',
      })
    }

    return { metrics, activity, alerts }
  },

  async getUsers(query = '', filters?: { role?: string; status?: string }): Promise<User[]> {
    const params = new URLSearchParams({ limit: '100' })
    if (query.trim()) params.set('search', query.trim())
    if (filters?.role) params.set('role', filters.role.toUpperCase())
    if (filters?.status) params.set('status', filters.status)
    const res = await apiFetch<{ users: BackendUser[] } & Paginated>(`/api/admin/users?${params}`)
    return res.users.map(mapUser)
  },

  async getUserDetail(id: string): Promise<UserDetail | null> {
    const user = await apiFetch<BackendUserDetail>(`/api/admin/users/${id}`)
    return user ? mapUserDetail(user) : null
  },

  async getUser(id: string): Promise<User | null> {
    const detail = await this.getUserDetail(id)
    return detail
  },

  async updateUserStatus(id: string, status: UserStatus): Promise<User | null> {
    const user = await apiFetch<BackendUser>(`/api/admin/users/${id}`, {
      method: 'PATCH',
      body: { status: toBackendStatus(status) },
    })
    return user ? mapUser(user) : null
  },

  async getProviders(): Promise<Provider[]> {
    const [usersRes, programsRes] = await Promise.all([
      apiFetch<{ users: BackendUser[] } & Paginated>('/api/admin/users?role=PROVIDER&limit=100'),
      apiFetch<{ programs: BackendProgram[] } & Paginated>('/api/admin/programs?limit=200'),
    ])
    const countsByProvider = programsRes.programs.reduce<Record<string, number>>((acc, program) => {
      acc[program.providerId] = (acc[program.providerId] ?? 0) + 1
      return acc
    }, {})

    return usersRes.users.map((user) => ({
      id: user.id,
      userId: user.id,
      name: fullName(user),
      status: user.status === 'ACTIVE' ? 'ACTIVE' : user.status === 'SUSPENDED' ? 'SUSPENDED' : 'UNDER_REVIEW',
      stripeStatus: 'PENDING',
      publishedPrograms: countsByProvider[user.id] ?? 0,
      revenue: 0,
      rating: 0,
      certifications: [],
      students: 0,
      reviews: 0,
    }))
  },

  async getProviderApplications(
    status?: ProviderApplication['status'] | 'ALL',
  ): Promise<ProviderApplication[]> {
    const res = await apiFetch<{ applications: BackendApplication[] } & Paginated>(
      '/api/admin/provider-applications?limit=100',
    )
    const mapped = res.applications.map(mapApplication)
    if (!status || status === 'ALL') return mapped
    return mapped.filter((application) => application.status === status)
  },

  async reviewProviderApplication(
    id: string,
    status: 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED',
    notes: string,
  ): Promise<ProviderApplication | null> {
    if (!notes.trim() && status !== 'UNDER_REVIEW') throw new Error('Review notes are required.')
    const app = await apiFetch<BackendApplication>(
      `/api/admin/provider-applications/${id}/review`,
      { method: 'PATCH', body: { status, reviewNotes: notes } },
    )
    return app ? mapApplication(app) : null
  },

  async getFinanceSummary(): Promise<FinanceSummary> {
    const [stats, payments, payouts] = await Promise.all([
      apiFetch<BackendStats>('/api/admin/stats'),
      apiFetch<{ payments: BackendPayment[] } & Paginated>(
        '/api/admin/payments?limit=100',
      ),
      apiFetch<{ payouts: BackendPayout[] } & Paginated>(
        '/api/admin/payouts?limit=100',
      ),
    ])

    const revenueMinor = payments.payments.reduce((sum, p) => sum + p.feeMinor, 0)
    const refundsMinor = payments.payments.reduce((sum, p) => sum + p.refundedAmountMinor, 0)
    const pendingPayoutsMinor = payouts.payouts
      .filter((p) => ['REQUESTED', 'APPROVED', 'PROCESSING'].includes(p.payoutStatus))
      .reduce((sum, p) => sum + p.amountMinor, 0)
    const providerPayoutsMinor = payouts.payouts
      .filter((p) => p.payoutStatus === 'PAID')
      .reduce((sum, p) => sum + p.amountMinor, 0)

    return {
      gmv: toUsd(stats.payments.totalAmountMinor),
      revenue: toUsd(revenueMinor),
      stripeFees: 0,
      refunds: toUsd(refundsMinor),
      pendingPayouts: toUsd(pendingPayoutsMinor),
      providerPayouts: toUsd(providerPayoutsMinor),
    }
  },

  async getTransactions(): Promise<Transaction[]> {
    const [payments, payouts] = await Promise.all([
      apiFetch<{ payments: BackendPayment[] } & Paginated>(
        '/api/admin/payments?limit=100',
      ),
      apiFetch<{ payouts: BackendPayout[] } & Paginated>(
        '/api/admin/payouts?limit=100',
      ),
    ])

    const payoutRows: Transaction[] = payouts.payouts.map((payout) => ({
      id: payout.publicId,
      provider: payout.provider ? fullName(payout.provider) : '—',
      amount: toUsd(payout.amountMinor),
      status:
        payout.payoutStatus === 'PAID'
          ? 'SUCCEEDED'
          : payout.payoutStatus === 'REJECTED'
            ? 'FAILED'
            : 'PENDING',
      type: 'PAYOUT',
      createdAt: payout.createdAt,
    }))

    const paymentRows: Transaction[] = payments.payments.map((payment) => ({
      id: payment.publicId,
      provider: payment.user?.username ?? '—',
      amount: toUsd(payment.refundedAmountMinor > 0 ? payment.refundedAmountMinor : payment.amountMinor),
      status:
        payment.status === 'SUCCEEDED'
          ? 'SUCCEEDED'
          : payment.status === 'FAILED'
            ? 'FAILED'
            : 'PENDING',
      type: payment.refundedAmountMinor > 0 ? 'REFUND' : 'PLATFORM_FEE',
      createdAt: payment.createdAt,
    }))

    return [...payoutRows, ...paymentRows].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  },

  async runTransfers(): Promise<TransferRunResult> {
    // The connected backend advances payouts individually via
    // PATCH /api/admin/payouts/:id/review and has no batch transfer runner.
    throw new ApiError(
      'Batch payout transfers are not available on the connected backend. Advance individual payout requests instead.',
      501,
    )
  },

  async getSupportTickets(): Promise<SupportTicket[]> {
    const res = await apiFetch<{ tickets: BackendTicket[] } & Paginated>(
      '/api/admin/support-tickets?limit=100',
    )
    return res.tickets.map(mapTicket)
  },

  async updateSupportTicket(
    id: string,
    input: {
      status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
      adminNotes?: string
      assignedToId?: string | null
    },
  ): Promise<SupportTicket | null> {
    const ticket = await apiFetch<BackendTicket>(`/api/admin/support-tickets/${id}`, {
      method: 'PATCH',
      body: input,
    })
    return ticket ? mapTicket(ticket) : null
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await apiFetch<{ logs: BackendAuditLog[] } & Paginated>(
      '/api/admin/audit-logs?limit=100',
    )
    return res.logs.map(mapAuditLog)
  },

  async getAdminUsers(): Promise<AdminUser[]> {
    const res = await apiFetch<{ users: BackendUser[] } & Paginated>(
      '/api/admin/users?isAdmin=true&limit=100',
    )
    return res.users.map((user) => ({
      id: user.id,
      userId: user.id,
      role: 'SUPER_ADMIN',
      status: user.status === 'ACTIVE' ? 'ACTIVE' : 'DISABLED',
      assignedBy: '—',
      assignedAt: user.createdAt,
      permissions: [],
      user: { id: user.id, email: user.email, username: user.username, status: mapUserStatus(user.status) },
    }))
  },

  async createAdminUser(input: {
    userId: string
    role?: string
    permissions?: string[]
  }): Promise<AdminUser> {
    // The backend models admin access as a single flag, so role/permissions
    // are accepted for API compatibility but not sent.
    const user = await apiFetch<BackendUser>(`/api/admin/users/${input.userId}`, {
      method: 'PATCH',
      body: { isAdmin: true },
    })
    return {
      id: user.id,
      userId: user.id,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      assignedBy: '—',
      assignedAt: user.createdAt,
      permissions: [],
      user: { id: user.id, email: user.email, username: user.username, status: mapUserStatus(user.status) },
    }
  },

  async updateAdminUser(
    id: string,
    input: { status?: 'ACTIVE' | 'DISABLED'; lock?: boolean },
  ): Promise<AdminUser | null> {
    if (input.status === 'DISABLED') {
      const user = await apiFetch<BackendUser>(`/api/admin/users/${id}`, {
        method: 'PATCH',
        body: { isAdmin: false },
      })
      return {
        id: user.id,
        userId: user.id,
        role: 'SUPER_ADMIN',
        status: 'DISABLED',
        assignedBy: '—',
        assignedAt: user.createdAt,
        permissions: [],
        user: { id: user.id, email: user.email, username: user.username, status: mapUserStatus(user.status) },
      }
    }
    if (input.lock) {
      const user = await apiFetch<BackendUser>(`/api/admin/users/${id}`, {
        method: 'PATCH',
        body: { status: 'SUSPENDED' },
      })
      return {
        id: user.id,
        userId: user.id,
        role: 'SUPER_ADMIN',
        status: 'DISABLED',
        assignedBy: '—',
        assignedAt: user.createdAt,
        permissions: [],
        user: { id: user.id, email: user.email, username: user.username, status: mapUserStatus(user.status) },
      }
    }
    if (input.status === 'ACTIVE') {
      const user = await apiFetch<BackendUser>(`/api/admin/users/${id}`, {
        method: 'PATCH',
        body: { status: 'ACTIVE', isAdmin: true },
      })
      return {
        id: user.id,
        userId: user.id,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        assignedBy: '—',
        assignedAt: user.createdAt,
        permissions: [],
        user: { id: user.id, email: user.email, username: user.username, status: mapUserStatus(user.status) },
      }
    }
    return null
  },

  async getPrograms(): Promise<Program[]> {
    const res = await apiFetch<{ programs: BackendProgram[] } & Paginated>('/api/admin/programs?limit=100')
    return res.programs.map(mapProgram)
  },

  async updateProgram(
    id: string,
    input: Partial<{
      title: string
      category: string
      description: string
      status: Program['status']
      deliveryMode: Program['deliveryMode']
      enrollmentCapacity: number
    }>,
  ): Promise<Program | null> {
    const program = await apiFetch<BackendProgram>(`/api/admin/programs/${id}`, {
      method: 'PATCH',
      body: input,
    })
    return program ? mapProgram(program) : null
  },

  async updateProgramModeration(id: string, status: 'PUBLISHED' | 'ARCHIVED' | 'REPORTED') {
    return this.updateProgram(id, { status })
  },

  async deleteProgram(id: string): Promise<void> {
    await apiFetch(`/api/admin/programs/${id}`, { method: 'DELETE' })
  },

  async getEnrollments(): Promise<Enrollment[]> {
    const res = await apiFetch<{ enrollments: BackendEnrollment[] } & Paginated>(
      '/api/admin/enrollments?limit=100',
    )
    return res.enrollments.map(mapEnrollment)
  },

  async getReport<T = Record<string, unknown>>(
    type: ReportType,
    from: string,
    to: string,
  ): Promise<ReportResult<T>> {
    const params = new URLSearchParams({ from, to })
    return apiFetch<ReportResult<T>>(`/api/admin/reports/${type}?${params}`)
  },

  async getMessages(): Promise<MessageThread[]> {
    const res = await apiFetch<{ messages: BackendMessage[] } & Paginated>('/api/admin/messages?limit=100')
    return res.messages.map(mapMessage)
  },

  async sendMessage(input: {
    toUserId: string
    subject: string
    body: string
    sendEmailCopy?: boolean
  }): Promise<MessageThread> {
    const message = await apiFetch<BackendMessage>('/api/admin/messages', {
      method: 'POST',
      body: input,
    })
    return mapMessage(message)
  },

  async sendSupportEmail(input: { toEmail: string; subject: string; body: string }): Promise<void> {
    await apiFetch('/api/admin/email/send', { method: 'POST', body: input })
  },

  // Cancellations, review reports, and notification telemetry are not yet on the backend.
  async getCancellations() {
    return mock(cancellations)
  },

  async reviewCancellation(id: string, status: 'APPROVED' | 'REJECTED') {
    const cancellation = cancellations.find((item) => item.id === id)
    if (cancellation) cancellation.status = status
    return mock(cancellation ?? null)
  },

  async getReviewReports() {
    return mock(reviewReports)
  },

  async getNotifications() {
    return mock(notificationEvents)
  },
}

function toUsd(amountMinor: number) {
  return amountMinor / 100
}

function formatUsd(amountMinor: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(toUsd(amountMinor))
}
