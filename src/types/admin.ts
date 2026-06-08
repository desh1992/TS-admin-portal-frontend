export type AdminRole = 'SUPER_ADMIN' | 'LIMITED_ADMIN'

export type AdminStatus = 'ACTIVE' | 'DISABLED'

export type Permission =
  | 'dashboard.read'
  | 'users.read'
  | 'users.manage'
  | 'providers.read'
  | 'providerApplications.review'
  | 'programs.read'
  | 'programs.moderate'
  | 'enrollments.read'
  | 'cancellations.manage'
  | 'support.manage'
  | 'finance.read'
  | 'finance.transfer.run'
  | 'messages.metadata.read'
  | 'messages.content.read'
  | 'notifications.read'
  | 'adminUsers.manage'
  | 'auditLogs.read'
  | 'systemSettings.manage'

export type UserRole = 'seeker' | 'provider' | 'admin'

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'DISABLED'

export interface User {
  id: string
  email: string
  username: string
  role: UserRole
  status: UserStatus
  joinedAt: string
  verificationStatus: 'VERIFIED' | 'UNVERIFIED' | 'PENDING'
  interests: string[]
  enrollmentsCount: number
  paymentsTotal: number
  messagesCount: number
}

export interface AdminUser {
  id: string
  userId: string
  role: AdminRole
  status: AdminStatus
  assignedBy: string
  assignedAt: string
  permissions?: Permission[]
  user: Pick<User, 'id' | 'email' | 'username' | 'status'>
}

export interface AdminSession {
  isAdmin: boolean
  adminRole: AdminRole | null
  permissions: Permission[]
  user: User | null
}

export interface Overview {
  metrics: Array<{
    label: string
    value: string
    delta: string
    tone: 'good' | 'warn' | 'neutral'
  }>
  activity: Array<{
    id: string
    action: string
    actor: string
    timestamp: string
    resource: string
  }>
  alerts: Array<{
    id: string
    severity: 'critical' | 'warning' | 'info'
    title: string
    description: string
  }>
}

export interface Provider {
  id: string
  userId: string
  name: string
  status: 'ACTIVE' | 'UNDER_REVIEW' | 'SUSPENDED'
  stripeStatus: 'COMPLETE' | 'PENDING' | 'FAILED'
  publishedPrograms: number
  revenue: number
  rating: number
  certifications: string[]
  students: number
  reviews: number
}

export interface ProviderApplication {
  id: string
  applicantName: string
  email: string
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'
  submittedAt: string
  stripeStatus: 'NOT_STARTED' | 'PENDING' | 'COMPLETE'
  category: string
  experience: string
  notes?: string
}

export interface Program {
  id: string
  title: string
  provider: string
  category: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'REPORTED'
  deliveryMode: 'ONLINE' | 'IN_PERSON' | 'HYBRID'
  enrollments: number
  rating: number
  createdAt: string
}

export interface Enrollment {
  id: string
  seeker: string
  provider: string
  program: string
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED'
  deliveryMode: 'ONLINE' | 'IN_PERSON' | 'HYBRID'
  nextSession: string
  checkIns: number
}

export interface Cancellation {
  id: string
  requester: string
  program: string
  status: 'OPEN' | 'APPROVED' | 'REJECTED'
  reason: string
  submittedAt: string
}

export interface FinanceSummary {
  gmv: number
  revenue: number
  stripeFees: number
  refunds: number
  pendingPayouts: number
  providerPayouts: number
}

export interface Transaction {
  id: string
  provider: string
  amount: number
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED'
  type: 'PAYOUT' | 'REFUND' | 'PLATFORM_FEE'
  createdAt: string
}

export interface TransferRunResult {
  processed: number
  succeeded: number
  failed: number
  errors: string[]
  transferIds: string[]
}

export interface SupportTicket {
  id: string
  requester: string
  inquiryType: 'LOGIN' | 'PROFILE' | 'PROVIDER' | 'SEEKER' | 'PAYMENT' | 'PROGRAM' | 'OTHER'
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  assignedTo?: string
  subject: string
  updatedAt: string
  internalNotes: string[]
}

export interface ReviewReport {
  id: string
  program: string
  reviewer: string
  provider: string
  rating: number
  status: 'VISIBLE' | 'FLAGGED' | 'HIDDEN'
  reason: string
  createdAt: string
}

export interface MessageThread {
  id: string
  participants: string[]
  program: string
  unreadCount: number
  reports: number
  lastMessageAt: string
  contentAccessReason?: string
}

export interface NotificationEvent {
  id: string
  recipient: string
  channel: 'EMAIL' | 'SMS' | 'PUSH'
  template: string
  status: 'DELIVERED' | 'FAILED' | 'QUEUED'
  sentAt: string
}

export interface AuditLog {
  id: string
  actorUserId: string
  actorRole: AdminRole
  action: string
  resourceType: string
  resourceId: string
  summary: string
  ipAddress: string
  userAgent: string
  timestamp: string
}
