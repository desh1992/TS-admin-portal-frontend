import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { adminApi } from '../../services/adminApi'
import { useAuth } from '../../context/useAuth'
import { formatCurrency, formatDate } from '../../lib/format'
import {
  Button,
  DataTable,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  StatusBadge,
  TextInput,
} from '../../components/ui'

export function UsersPage() {
  const [query, setQuery] = useState('')
  const { can } = useAuth()
  const queryClient = useQueryClient()
  const usersQuery = useQuery({
    queryKey: ['admin', 'users', query],
    queryFn: () => adminApi.getUsers(query),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'SUSPENDED' }) =>
      adminApi.updateUserStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] })
    },
  })

  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data])

  return (
    <>
      <PageHeader
        eyebrow="Identity"
        title="User Management"
        description="Search, filter, and inspect users by role, verification, status, signup date, email, and username."
        action={
          <label className="relative block w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-graphite" />
            <TextInput
              className="pl-10"
              placeholder="Search users..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        }
      />

      {usersQuery.isLoading ? <LoadingState /> : null}
      {usersQuery.error ? <ErrorState message={usersQuery.error.message} /> : null}
      {!usersQuery.isLoading && users.length === 0 ? (
        <EmptyState title="No users found" description="Try searching by email, username, role, or account status." />
      ) : null}
      {users.length > 0 ? (
        <DataTable headers={['User', 'Role', 'Status', 'Verification', 'Usage', 'Joined', 'Actions']}>
          {users.map((user) => (
            <tr key={user.id} className="align-top">
              <td className="px-6 py-4">
                <p className="font-medium text-ink">{user.username}</p>
                <p className="text-charcoal">{user.email}</p>
                <p className="mt-2 text-xs text-graphite">Interests: {user.interests.join(', ') || 'None'}</p>
              </td>
              <td className="px-6 py-4">
                <StatusBadge tone={user.role === 'admin' ? 'info' : user.role === 'provider' ? 'good' : 'neutral'}>
                  {user.role}
                </StatusBadge>
              </td>
              <td className="px-6 py-4">
                <StatusBadge tone={user.status === 'ACTIVE' ? 'good' : 'bad'}>{user.status}</StatusBadge>
              </td>
              <td className="px-6 py-4 text-charcoal">{user.verificationStatus}</td>
              <td className="px-6 py-4 text-charcoal">
                <p>{user.enrollmentsCount} enrollments</p>
                <p>{formatCurrency(user.paymentsTotal)} paid</p>
                <p>{user.messagesCount} messages</p>
              </td>
              <td className="px-6 py-4 text-charcoal">{formatDate(user.joinedAt)}</td>
              <td className="px-6 py-4">
                {can('users.manage') ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={user.status === 'ACTIVE' ? 'danger' : 'primary'}
                      disabled={statusMutation.isPending}
                      onClick={() =>
                        statusMutation.mutate({
                          id: user.id,
                          status: user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
                        })
                      }
                    >
                      {user.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                    </Button>
                    <Button variant="outline-ink" disabled>
                      Force logout
                    </Button>
                  </div>
                ) : (
                  <span className="text-sm font-medium text-graphite">Read-only</span>
                )}
              </td>
            </tr>
          ))}
        </DataTable>
      ) : null}
    </>
  )
}
