export const MOCK_TOKEN_KEY = 'talentshare.mock.bearerToken'
export const ACTIVE_ADMIN_USER_ID_KEY = 'talentshare.mock.activeAdminUserId'
export const REMEMBER_ME_KEY = 'talentshare.mock.rememberMe'
export const REMEMBERED_IDENTIFIER_KEY = 'talentshare.mock.rememberedIdentifier'

export function getStoredAuth() {
  const sessionToken = sessionStorage.getItem(MOCK_TOKEN_KEY)
  const sessionUserId = sessionStorage.getItem(ACTIVE_ADMIN_USER_ID_KEY)

  if (sessionToken && sessionUserId) {
    return { token: sessionToken, userId: sessionUserId, persistent: false }
  }

  const rememberMe = localStorage.getItem(REMEMBER_ME_KEY) === 'true'
  if (!rememberMe) return null

  const token = localStorage.getItem(MOCK_TOKEN_KEY)
  const userId = localStorage.getItem(ACTIVE_ADMIN_USER_ID_KEY)
  if (!token || !userId) return null

  return { token, userId, persistent: true }
}

export function persistAuth(userId: string, token: string, rememberMe: boolean, identifier?: string) {
  sessionStorage.removeItem(MOCK_TOKEN_KEY)
  sessionStorage.removeItem(ACTIVE_ADMIN_USER_ID_KEY)
  localStorage.removeItem(MOCK_TOKEN_KEY)
  localStorage.removeItem(ACTIVE_ADMIN_USER_ID_KEY)
  localStorage.removeItem(REMEMBER_ME_KEY)
  localStorage.removeItem(REMEMBERED_IDENTIFIER_KEY)

  if (rememberMe) {
    localStorage.setItem(MOCK_TOKEN_KEY, token)
    localStorage.setItem(ACTIVE_ADMIN_USER_ID_KEY, userId)
    localStorage.setItem(REMEMBER_ME_KEY, 'true')
    if (identifier) localStorage.setItem(REMEMBERED_IDENTIFIER_KEY, identifier)
    return
  }

  sessionStorage.setItem(MOCK_TOKEN_KEY, token)
  sessionStorage.setItem(ACTIVE_ADMIN_USER_ID_KEY, userId)
}

export function clearAuth() {
  sessionStorage.removeItem(MOCK_TOKEN_KEY)
  sessionStorage.removeItem(ACTIVE_ADMIN_USER_ID_KEY)
  localStorage.removeItem(MOCK_TOKEN_KEY)
  localStorage.removeItem(ACTIVE_ADMIN_USER_ID_KEY)
  localStorage.removeItem(REMEMBER_ME_KEY)
}

export function getRememberedIdentifier() {
  if (localStorage.getItem(REMEMBER_ME_KEY) !== 'true') return ''
  return localStorage.getItem(REMEMBERED_IDENTIFIER_KEY) ?? ''
}
