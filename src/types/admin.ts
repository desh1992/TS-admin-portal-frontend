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
  publicId?: string
  email: string
  username: string
  firstName?: string
  lastName?: string
  role: UserRole
  status: UserStatus
  joinedAt: string
  verificationStatus: 'VERIFIED' | 'UNVERIFIED' | 'PENDING'
  interests: string[]
  enrollmentsCount: number
  paymentsTotal: number
  messagesCount: number
  bio?: string | null
  avatar?: string | null
  phone?: string | null
  location?: string | null
  professionalTitle?: string | null
  lastLoginAt?: string | null
  loginLocked?: boolean
  providerProfileEnabled?: boolean
  deletionRequestedAt?: string | null
}

export interface UserDetail extends User {
  providerApplications: Array<{
    id: string
    publicId: string
    status: string
    headline: string
    skills?: string[]
    experience?: string
    portfolioUrl?: string | null
    createdAt: string
  }>
  media: Array<{
    id: string
    contentType: string
    s3Key: string
    fileName?: string | null
    createdAt: string
  }>
  programs: Array<{ id: string; publicId: string; title: string; status: string }>
  enrollments: Array<{ id: string; publicId: string; program: { title: string }; enrolledAt: string }>
  supportTickets: Array<{ id: string; publicId: string; subject: string; status: string }>
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
  skills: string[]
  portfolioUrl?: string
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
  enrolledAt: string
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
  // Backend inquiry categories are open-ended (GENERAL, BILLING, TECHNICAL, ...).
  inquiryType: string
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
  from: string
  to: string
  toEmail: string
  subject: string
  body: string
  readAt: string | null
  sentAt: string
}

export interface ReportResult<T = Record<string, unknown>> {
  count: number
  rows: T[]
}

export type ReportType =
  | 'seekers-joined'
  | 'provider-upgrades'
  | 'providers-new-programs'
  | 'programs-created'
  | 'seeker-enrollments'

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
