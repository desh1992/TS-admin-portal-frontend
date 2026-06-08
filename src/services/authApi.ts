import { adminUsers } from './mockData'
import { clearAuth, getStoredAuth, persistAuth } from './authStorage'

export interface MockAdminCredential {
  userId: string
  identifiers: string[]
  password: string
  label: string
}

export const MOCK_ADMIN_CREDENTIALS: MockAdminCredential[] = [
  {
    userId: 'usr_1003',
    identifiers: ['lena@talentshare.local', 'lena-super'],
    password: 'admin123',
    label: 'SUPER_ADMIN',
  },
  {
    userId: 'usr_1004',
    identifiers: ['sam.ops@talentshare.local', 'sam-limited'],
    password: 'admin123',
    label: 'LIMITED_ADMIN',
  },
]

function normalizeIdentifier(value: string) {
  return value.trim().toLowerCase()
}

function findCredential(identifier: string, password: string) {
  const normalized = normalizeIdentifier(identifier)
  return MOCK_ADMIN_CREDENTIALS.find(
    (account) =>
      account.password === password &&
      account.identifiers.some((item) => normalizeIdentifier(item) === normalized),
  )
}

function createSessionToken(userId: string) {
  return `mock-admin-token-${userId}-${Date.now()}`
}

function delay<T>(value: T, latency = 300): Promise<T> {
  return new Promise((resolve) => window.setTimeout(() => resolve(value), latency))
}

export const authApi = {
  async login(identifier: string, password: string, rememberMe: boolean) {
    const account = findCredential(identifier, password)
    if (!account) {
      throw new Error('Invalid email/username or password.')
    }

    const admin = adminUsers.find(
      (item) => item.userId === account.userId && item.status === 'ACTIVE',
    )
    if (!admin) {
      throw new Error('This admin account is disabled.')
    }

    const token = createSessionToken(account.userId)
    persistAuth(account.userId, token, rememberMe, normalizeIdentifier(identifier))
    return delay({ userId: account.userId, token, role: admin.role })
  },

  async logout() {
    clearAuth()
    return delay(null, 120)
  },

  isAuthenticated() {
    return Boolean(getStoredAuth())
  },
}
