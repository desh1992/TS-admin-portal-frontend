import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { adminApi } from '../../services/adminApi'
import { useAuth } from '../../context/useAuth'
import { formatDate } from '../../lib/format'
import type { UserDetail, UserRole, UserStatus } from '../../types/admin'
import {
  Button,
  Card,
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
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { can } = useAuth()
  const queryClient = useQueryClient()

  const usersQuery = useQuery({
    queryKey: ['admin', 'users', query, roleFilter],
    queryFn: () =>
      adminApi.getUsers(query, {
        role: roleFilter === 'ALL' ? undefined : roleFilter === 'provider' ? 'PROVIDER' : roleFilter === 'seeker' ? 'SEEKER' : undefined,
      }),
  })

  const detailQuery = useQuery({
    queryKey: ['admin', 'users', selectedId],
    queryFn: () => adminApi.getUserDetail(selectedId!),
    enabled: Boolean(selectedId),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
      adminApi.updateUserStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] })
    },
  })

  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data])
  const filteredUsers =
    roleFilter === 'admin'
      ? users.filter((user) => user.role === 'admin')
      : roleFilter === 'ALL'
        ? users
        : users.filter((user) => user.role === roleFilter)

  return (
    <>
      <PageHeader
        eyebrow="Identity"
        title="User Management"
        description="Search providers and seekers, view complete profiles with portfolio documents, lock/unlock login access, disable profiles, and mark accounts for deletion."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <select
              className="h-11 rounded-md border border-steel bg-canvas px-3 text-sm font-medium"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value as UserRole | 'ALL')}
            >
              <option value="ALL">All roles</option>
              <option value="seeker">Seekers</option>
              <option value="provider">Providers</option>
              <option value="admin">Admins</option>
            </select>
            <label className="relative block w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-graphite" />
              <TextInput
                className="pl-10"
                placeholder="Search by name, email, username..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <div>
          {usersQuery.isLoading ? <LoadingState /> : null}
          {usersQuery.error ? <ErrorState message={usersQuery.error.message} /> : null}
          {!usersQuery.isLoading && filteredUsers.length === 0 ? (
            <EmptyState title="No users found" description="Try adjusting your search or role filter." />
          ) : null}
          {filteredUsers.length > 0 ? (
            <DataTable headers={['User', 'Role', 'Status', 'Verification', 'Joined', 'Actions']}>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="align-top">
                  <td className="px-6 py-4">
                    <p className="font-medium text-ink">
                      {user.firstName} {user.lastName} ({user.username})
                    </p>
                    <p className="text-charcoal">{user.email}</p>
                    <p className="mt-1 text-xs text-graphite">{user.publicId}</p>
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
                  <td className="px-6 py-4 text-charcoal">{formatDate(user.joinedAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" onClick={() => setSelectedId(user.id)}>
                        View profile
                      </Button>
                      {can('users.manage') ? (
                        <>
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
                            {user.status === 'ACTIVE' ? 'Lock' : 'Unlock'}
                          </Button>
                          {user.role === 'provider' && user.status === 'ACTIVE' ? (
                            <Button
                              variant="outline-ink"
                              disabled={statusMutation.isPending}
                              onClick={() => statusMutation.mutate({ id: user.id, status: 'SUSPENDED' })}
                            >
                              Disable
                            </Button>
                          ) : null}
                          <Button
                            variant="danger"
                            disabled={statusMutation.isPending || user.status === 'DISABLED'}
                            onClick={() => {
                              if (window.confirm('Mark this profile for deletion?')) {
                                statusMutation.mutate({ id: user.id, status: 'DISABLED' })
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </DataTable>
          ) : null}
        </div>

        <Card className="h-fit">
          {selectedId && detailQuery.isLoading ? <LoadingState /> : null}
          {selectedId && detailQuery.data ? (
            <UserProfilePanel user={detailQuery.data} onClose={() => setSelectedId(null)} />
          ) : (
            <div>
              <h2 className="text-xl font-medium text-ink">User profile</h2>
              <p className="mt-2 text-sm leading-[1.5] text-charcoal">
                Select a user to view their complete profile, portfolio documents, applications, programs, and
                enrollments.
              </p>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}

function UserProfilePanel({ user, onClose }: { user: UserDetail; onClose: () => void }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Profile</p>
          <h2 className="mt-1 text-2xl font-medium text-ink">
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-charcoal">{user.email}</p>
          <p className="text-xs text-graphite">{user.publicId}</p>
        </div>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      {user.bio ? (
        <div>
          <p className="font-medium text-ink">Bio</p>
          <p className="mt-1 text-charcoal">{user.bio}</p>
        </div>
      ) : null}

      <div>
        <p className="font-medium text-ink">Portfolio & documents</p>
        {user.media.length === 0 ? (
          <p className="mt-1 text-charcoal">No uploaded documents.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-charcoal">
            {user.media.map((file) => (
              <li key={file.id}>
                {file.contentType} · {file.s3Key.split('/').pop()}
              </li>
            ))}
          </ul>
        )}
      </div>

      {user.providerApplications.length > 0 ? (
        <div>
          <p className="font-medium text-ink">Provider applications</p>
          <ul className="mt-2 space-y-1">
            {user.providerApplications.map((app) => (
              <li key={app.id} className="text-charcoal">
                {app.headline} — {app.status}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {user.programs.length > 0 ? (
        <div>
          <p className="font-medium text-ink">Programs</p>
          <ul className="mt-2 space-y-1">
            {user.programs.map((program) => (
              <li key={program.id} className="text-charcoal">
                {program.title} ({program.status})
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {user.enrollments.length > 0 ? (
        <div>
          <p className="font-medium text-ink">Enrollments</p>
          <ul className="mt-2 space-y-1">
            {user.enrollments.map((enrollment) => (
              <li key={enrollment.id} className="text-charcoal">
                {enrollment.program.title} · {formatDate(enrollment.enrolledAt)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
