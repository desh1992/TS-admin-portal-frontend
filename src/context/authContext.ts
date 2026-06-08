import { createContext } from 'react'
import type { AdminSession, Permission } from '../types/admin'

export interface AuthContextValue {
  session: AdminSession | undefined
  isLoading: boolean
  isLoggingIn: boolean
  isLoggingOut: boolean
  error: Error | null
  loginError: Error | null
  can: (permission?: Permission | Permission[]) => boolean
  login: (identifier: string, password: string, rememberMe: boolean) => Promise<AdminSession>
  logout: () => Promise<void>
  switchMockAdmin: (userId: string) => Promise<AdminSession>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
