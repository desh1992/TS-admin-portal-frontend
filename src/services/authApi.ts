import { apiFetch } from './httpClient'
import { clearAuth, getStoredAuth, persistAuth } from './authStorage'

/** Shape returned by the backend `/api/auth/login` endpoint. */
interface LoginResponse {
  user: { id: string; isAdmin: boolean; username: string; email: string }
  token: string
}

/** Demo credentials surfaced on the login screen for local testing. */
export interface DemoCredential {
  label: string
  identifier: string
  password: string
}

export const DEMO_CREDENTIALS: DemoCredential[] = [
  {
    label: 'ADMIN',
    identifier: 'admin@talentshare.com',
    password: 'admin12345',
  },
]

export const authApi = {
  async login(identifier: string, password: string, rememberMe: boolean) {
    const trimmed = identifier.trim()
    const data = await apiFetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      auth: false,
      body: { identifier: trimmed.toLowerCase(), password },
    })

    if (!data.user.isAdmin) {
      // Non-admins authenticate fine but have no portal access — don't
      // persist a session that the guard will immediately reject.
      throw new Error('This account does not have admin access to the portal.')
    }

    persistAuth(data.user.id, data.token, rememberMe, trimmed)
    return data
  },

  async logout() {
    // JWTs are stateless; there is no server-side logout to call.
    clearAuth()
  },

  isAuthenticated() {
    return Boolean(getStoredAuth())
  },
}
