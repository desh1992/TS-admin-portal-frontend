import {
  DEFAULT_LIMITED_ADMIN_PERMISSIONS,
  type ALL_PERMISSIONS,
} from '../lib/permissions'
import type {
  AdminUser,
  AuditLog,
  Cancellation,
  Enrollment,
  FinanceSummary,
  MessageThread,
  NotificationEvent,
  Overview,
  Program,
  Provider,
  ProviderApplication,
  ReviewReport,
  SupportTicket,
  Transaction,
  User,
} from '../types/admin'

type Permission = (typeof ALL_PERMISSIONS)[number]

export const users: User[] = [
  {
    id: 'usr_1001',
    email: 'maya.chen@example.com',
    username: 'maya-chen',
    role: 'seeker',
    status: 'ACTIVE',
    joinedAt: '2026-01-14T10:00:00Z',
    verificationStatus: 'VERIFIED',
    interests: ['Product design', 'Interview prep'],
    enrollmentsCount: 4,
    paymentsTotal: 1260,
    messagesCount: 28,
  },
  {
    id: 'usr_1002',
    email: 'omar@studio.dev',
    username: 'omar-builds',
    role: 'provider',
    status: 'ACTIVE',
    joinedAt: '2025-11-03T16:30:00Z',
    verificationStatus: 'VERIFIED',
    interests: ['Full-stack engineering', 'Career coaching'],
    enrollmentsCount: 21,
    paymentsTotal: 18420,
    messagesCount: 116,
  },
  {
    id: 'usr_1003',
    email: 'lena@talentshare.local',
    username: 'lena-super',
    role: 'admin',
    status: 'ACTIVE',
    joinedAt: '2025-08-20T09:15:00Z',
    verificationStatus: 'VERIFIED',
    interests: ['Operations'],
    enrollmentsCount: 0,
    paymentsTotal: 0,
    messagesCount: 0,
  },
  {
    id: 'usr_1004',
    email: 'sam.ops@talentshare.local',
    username: 'sam-limited',
    role: 'admin',
    status: 'ACTIVE',
    joinedAt: '2025-09-10T11:45:00Z',
    verificationStatus: 'VERIFIED',
    interests: ['Support', 'Provider quality'],
    enrollmentsCount: 0,
    paymentsTotal: 0,
    messagesCount: 0,
  },
  {
    id: 'usr_1005',
    email: 'noah@example.com',
    username: 'noah-learns',
    role: 'seeker',
    status: 'SUSPENDED',
    joinedAt: '2026-03-02T13:20:00Z',
    verificationStatus: 'PENDING',
    interests: ['Data analytics'],
    enrollmentsCount: 2,
    paymentsTotal: 480,
    messagesCount: 9,
  },
]

export const adminUsers: AdminUser[] = [
  {
    id: 'adm_9001',
    userId: 'usr_1003',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    assignedBy: 'system',
    assignedAt: '2025-08-20T09:15:00Z',
    permissions: [],
    user: users[2],
  },
  {
    id: 'adm_9002',
    userId: 'usr_1004',
    role: 'LIMITED_ADMIN',
    status: 'ACTIVE',
    assignedBy: 'usr_1003',
    assignedAt: '2025-09-10T11:45:00Z',
    permissions: DEFAULT_LIMITED_ADMIN_PERMISSIONS,
    user: users[3],
  },
]

export const overview: Overview = {
  metrics: [
    { label: 'Total users', value: '14,284', delta: '+8.4% MoM', tone: 'good' },
    { label: 'Active seekers', value: '9,872', delta: '+612 this month', tone: 'good' },
    { label: 'Active providers', value: '1,206', delta: '+41 this month', tone: 'good' },
    { label: 'Pending applications', value: '37', delta: '12 urgent', tone: 'warn' },
    { label: 'Published programs', value: '2,431', delta: '+112 new', tone: 'good' },
    { label: 'Active enrollments', value: '5,904', delta: '+3.1% WoW', tone: 'good' },
    { label: 'Monthly GMV', value: '$486K', delta: '$62K revenue', tone: 'neutral' },
    { label: 'Pending payouts', value: '$74K', delta: '5 failed retries', tone: 'warn' },
    { label: 'Open support tickets', value: '58', delta: '11 payment related', tone: 'warn' },
  ],
  activity: [
    {
      id: 'act_1',
      action: 'approved provider application',
      actor: 'Lena Patel',
      timestamp: '2026-06-08T16:05:00Z',
      resource: 'app_3001',
    },
    {
      id: 'act_2',
      action: 'flagged review for trust review',
      actor: 'Sam Rivera',
      timestamp: '2026-06-08T15:31:00Z',
      resource: 'rev_7002',
    },
    {
      id: 'act_3',
      action: 'ran provider payout transfer batch',
      actor: 'Lena Patel',
      timestamp: '2026-06-08T14:48:00Z',
      resource: 'trf_batch_21',
    },
  ],
  alerts: [
    {
      id: 'alert_1',
      severity: 'warning',
      title: '12 applications waiting over 48h',
      description: 'Provider onboarding SLA is at risk for design and coding categories.',
    },
    {
      id: 'alert_2',
      severity: 'critical',
      title: '5 payout transfers failed',
      description: 'Stripe returned account capability errors for three providers.',
    },
    {
      id: 'alert_3',
      severity: 'info',
      title: '7 content reports need moderation',
      description: 'Most reports are attached to reviews on high-volume programs.',
    },
  ],
}

export const providers: Provider[] = [
  {
    id: 'prv_2001',
    userId: 'usr_1002',
    name: 'Omar Khan',
    status: 'ACTIVE',
    stripeStatus: 'COMPLETE',
    publishedPrograms: 8,
    revenue: 18420,
    rating: 4.9,
    certifications: ['AWS Solutions Architect', 'Career Coach'],
    students: 214,
    reviews: 87,
  },
  {
    id: 'prv_2002',
    userId: 'usr_1010',
    name: 'Priya Raman',
    status: 'UNDER_REVIEW',
    stripeStatus: 'PENDING',
    publishedPrograms: 3,
    revenue: 7200,
    rating: 4.7,
    certifications: ['PMP', 'Scrum Master'],
    students: 88,
    reviews: 34,
  },
  {
    id: 'prv_2003',
    userId: 'usr_1011',
    name: 'Jon Bell',
    status: 'SUSPENDED',
    stripeStatus: 'FAILED',
    publishedPrograms: 1,
    revenue: 980,
    rating: 3.8,
    certifications: ['Portfolio Reviewer'],
    students: 19,
    reviews: 11,
  },
]

export const providerApplications: ProviderApplication[] = [
  {
    id: 'app_3001',
    applicantName: 'Ari Morgan',
    email: 'ari@example.com',
    status: 'SUBMITTED',
    submittedAt: '2026-06-06T12:00:00Z',
    stripeStatus: 'PENDING',
    category: 'UX Research',
    experience: '8 years research lead at B2B SaaS teams.',
    skills: ['User interviews', 'Usability testing', 'Journey mapping'],
  },
  {
    id: 'app_3002',
    applicantName: 'Fatima Noor',
    email: 'fatima@example.com',
    status: 'UNDER_REVIEW',
    submittedAt: '2026-06-04T09:10:00Z',
    stripeStatus: 'COMPLETE',
    category: 'Data Science',
    experience: 'Built ML curriculum and mentored 300+ learners.',
    skills: ['Python', 'Machine learning', 'Statistics'],
  },
  {
    id: 'app_3003',
    applicantName: 'Chris Vale',
    email: 'chris@example.com',
    status: 'REJECTED',
    submittedAt: '2026-05-30T18:20:00Z',
    stripeStatus: 'NOT_STARTED',
    category: 'Music Production',
    experience: 'Insufficient verification materials.',
    skills: ['DAW production', 'Mixing'],
    notes: 'Asked applicant to resubmit credentials.',
  },
]

export const programs: Program[] = [
  {
    id: 'pgm_4001',
    title: 'Portfolio Critique Sprint',
    provider: 'Omar Khan',
    category: 'Career',
    status: 'PUBLISHED',
    deliveryMode: 'ONLINE',
    enrollments: 42,
    rating: 4.8,
    createdAt: '2026-02-12T10:00:00Z',
  },
  {
    id: 'pgm_4002',
    title: 'Applied SQL for Analysts',
    provider: 'Priya Raman',
    category: 'Data',
    status: 'REPORTED',
    deliveryMode: 'HYBRID',
    enrollments: 19,
    rating: 4.2,
    createdAt: '2026-03-17T10:00:00Z',
  },
  {
    id: 'pgm_4003',
    title: 'Hands-on Product Strategy',
    provider: 'Mei Douglas',
    category: 'Product',
    status: 'DRAFT',
    deliveryMode: 'IN_PERSON',
    enrollments: 0,
    rating: 0,
    createdAt: '2026-05-22T10:00:00Z',
  },
]

export const enrollments: Enrollment[] = [
  {
    id: 'enr_5001',
    seeker: 'Maya Chen',
    provider: 'Omar Khan',
    program: 'Portfolio Critique Sprint',
    status: 'ACTIVE',
    deliveryMode: 'ONLINE',
    enrolledAt: '2026-06-01T19:00:00Z',
  },
  {
    id: 'enr_5002',
    seeker: 'Noah Blake',
    provider: 'Priya Raman',
    program: 'Applied SQL for Analysts',
    status: 'DISPUTED',
    deliveryMode: 'HYBRID',
    enrolledAt: '2026-05-20T18:00:00Z',
  },
]

export const cancellations: Cancellation[] = [
  {
    id: 'can_6001',
    requester: 'Noah Blake',
    program: 'Applied SQL for Analysts',
    status: 'OPEN',
    reason: 'Provider missed two scheduled sessions.',
    submittedAt: '2026-06-07T12:30:00Z',
  },
  {
    id: 'can_6002',
    requester: 'Dina Rose',
    program: 'Portfolio Critique Sprint',
    status: 'APPROVED',
    reason: 'Medical emergency.',
    submittedAt: '2026-06-02T15:30:00Z',
  },
]

export const financeSummary: FinanceSummary = {
  gmv: 486200,
  revenue: 62840,
  stripeFees: 13960,
  refunds: 18400,
  pendingPayouts: 74120,
  providerPayouts: 392800,
}

export const transactions: Transaction[] = [
  {
    id: 'txn_8001',
    provider: 'Omar Khan',
    amount: 6200,
    status: 'PENDING',
    type: 'PAYOUT',
    createdAt: '2026-06-08T13:10:00Z',
  },
  {
    id: 'txn_8002',
    provider: 'Priya Raman',
    amount: 840,
    status: 'FAILED',
    type: 'PAYOUT',
    createdAt: '2026-06-08T12:20:00Z',
  },
  {
    id: 'txn_8003',
    provider: 'TalentShare',
    amount: 412,
    status: 'SUCCEEDED',
    type: 'PLATFORM_FEE',
    createdAt: '2026-06-08T10:05:00Z',
  },
]

export const supportTickets: SupportTicket[] = [
  {
    id: 'sup_1101',
    requester: 'Maya Chen',
    inquiryType: 'PAYMENT',
    status: 'OPEN',
    assignedTo: 'Sam Rivera',
    subject: 'Refund has not reached my card',
    updatedAt: '2026-06-08T16:40:00Z',
    internalNotes: ['Stripe refund pending, check again after settlement window.'],
  },
  {
    id: 'sup_1102',
    requester: 'Ari Morgan',
    inquiryType: 'PROVIDER',
    status: 'IN_PROGRESS',
    assignedTo: 'Sam Rivera',
    subject: 'Provider application verification question',
    updatedAt: '2026-06-08T15:18:00Z',
    internalNotes: ['Waiting on certification upload.'],
  },
]

export const reviewReports: ReviewReport[] = [
  {
    id: 'rev_7001',
    program: 'Applied SQL for Analysts',
    reviewer: 'Noah Blake',
    provider: 'Priya Raman',
    rating: 2,
    status: 'FLAGGED',
    reason: 'Contains disputed factual claims.',
    createdAt: '2026-06-07T14:10:00Z',
  },
  {
    id: 'rev_7002',
    program: 'Portfolio Critique Sprint',
    reviewer: 'Maya Chen',
    provider: 'Omar Khan',
    rating: 5,
    status: 'VISIBLE',
    reason: 'Provider reply requested.',
    createdAt: '2026-06-06T11:50:00Z',
  },
]

export const messageThreads: MessageThread[] = [
  {
    id: 'msg_1201',
    from: 'Support Team',
    to: 'Maya Chen',
    toEmail: 'maya@example.com',
    subject: 'Portfolio Critique Sprint',
    body: 'We received your inquiry about session scheduling.',
    readAt: null,
    sentAt: '2026-06-08T15:55:00Z',
  },
  {
    id: 'msg_1202',
    from: 'Support Team',
    to: 'Noah Blake',
    toEmail: 'noah@example.com',
    subject: 'Applied SQL for Analysts',
    body: 'Trust and safety dispute review in progress.',
    readAt: '2026-06-08T12:10:00Z',
    sentAt: '2026-06-08T12:05:00Z',
  },
]

export const notificationEvents: NotificationEvent[] = [
  {
    id: 'not_1301',
    recipient: 'ari@example.com',
    channel: 'EMAIL',
    template: 'provider_application_received',
    status: 'DELIVERED',
    sentAt: '2026-06-06T12:02:00Z',
  },
  {
    id: 'not_1302',
    recipient: 'noah@example.com',
    channel: 'PUSH',
    template: 'session_reminder',
    status: 'FAILED',
    sentAt: '2026-06-08T09:00:00Z',
  },
]

export const auditLogs: AuditLog[] = [
  {
    id: 'aud_1401',
    actorUserId: 'usr_1003',
    actorRole: 'SUPER_ADMIN',
    action: 'finance.transfer.run',
    resourceType: 'TransferBatch',
    resourceId: 'trf_batch_21',
    summary: 'Ran payout batch for 19 providers; 17 succeeded, 2 failed.',
    ipAddress: '203.0.113.24',
    userAgent: 'Chrome macOS',
    timestamp: '2026-06-08T14:48:00Z',
  },
  {
    id: 'aud_1402',
    actorUserId: 'usr_1004',
    actorRole: 'LIMITED_ADMIN',
    action: 'providerApplications.review',
    resourceType: 'ProviderApplication',
    resourceId: 'app_3002',
    summary: 'Moved application to under review with internal notes.',
    ipAddress: '203.0.113.52',
    userAgent: 'Safari macOS',
    timestamp: '2026-06-08T13:08:00Z',
  },
]

export const limitedAdminPermissionOptions = DEFAULT_LIMITED_ADMIN_PERMISSIONS as Permission[]
