import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../services/adminApi'
import { authApi } from '../services/authApi'
import { hasPermission } from '../lib/permissions'
import { AuthContext, type AuthContextValue } from './authContext'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const sessionQuery = useQuery({
    queryKey: ['admin', 'me'],
    queryFn: adminApi.getMe,
    retry: false,
  })

  const loginMutation = useMutation({
    mutationFn: ({
      identifier,
      password,
      rememberMe,
    }: {
      identifier: string
      password: string
      rememberMe: boolean
    }) => authApi.login(identifier, password, rememberMe).then(() => adminApi.getMe()),
    onSuccess: (session) => {
      queryClient.setQueryData(['admin', 'me'], session)
      void queryClient.invalidateQueries({ queryKey: ['admin'] })
    },
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await authApi.logout()
      return adminApi.getMe()
    },
    onSuccess: (session) => {
      queryClient.setQueryData(['admin', 'me'], session)
      queryClient.removeQueries({ queryKey: ['admin'], exact: false })
    },
  })

  const value = useMemo<AuthContextValue>(
    () => ({
      session: sessionQuery.data,
      isLoading: sessionQuery.isLoading,
      isLoggingIn: loginMutation.isPending,
      isLoggingOut: logoutMutation.isPending,
      error: sessionQuery.error,
      loginError: loginMutation.error,
      can: (permission) =>
        hasPermission(
          sessionQuery.data?.adminRole ?? null,
          sessionQuery.data?.permissions ?? [],
          permission,
        ),
      login: async (identifier, password, rememberMe) =>
        loginMutation.mutateAsync({ identifier, password, rememberMe }),
      logout: async () => {
        await logoutMutation.mutateAsync()
      },
    }),
    [
      sessionQuery.data,
      sessionQuery.error,
      sessionQuery.isLoading,
      loginMutation,
      logoutMutation,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
