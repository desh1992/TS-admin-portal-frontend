import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../services/adminApi'
import { ALL_PERMISSIONS, DEFAULT_LIMITED_ADMIN_PERMISSIONS } from '../../lib/permissions'
import { formatDate } from '../../lib/format'
import type { AdminRole, Permission } from '../../types/admin'
import {
  Button,
  Card,
  DataTable,
  ErrorState,
  LoadingState,
  PageHeader,
  StatusBadge,
  TextInput,
} from '../../components/ui'

export function AdminUsersPage() {
  const [userId, setUserId] = useState('usr_1001')
  const [role, setRole] = useState<AdminRole>('LIMITED_ADMIN')
  const [permissions, setPermissions] = useState<Permission[]>(DEFAULT_LIMITED_ADMIN_PERMISSIONS)
  const queryClient = useQueryClient()
  const adminUsersQuery = useQuery({
    queryKey: ['admin', 'admin-users'],
    queryFn: adminApi.getAdminUsers,
  })
  const createMutation = useMutation({
    mutationFn: () => adminApi.createAdminUser({ userId, role, permissions }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin'] }),
  })
  const disableMutation = useMutation({
    mutationFn: (id: string) => adminApi.updateAdminUser(id, { status: 'DISABLED' }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin'] }),
  })

  function togglePermission(permission: Permission) {
    setPermissions((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission],
    )
  }

  if (adminUsersQuery.isLoading) return <LoadingState />
  if (adminUsersQuery.error || !adminUsersQuery.data) return <ErrorState message={adminUsersQuery.error?.message} />

  return (
    <>
      <PageHeader
        eyebrow="Access control"
        title="Admin Users & RBAC"
        description="Assign existing users as SUPER_ADMIN or LIMITED_ADMIN, disable access, and manage the LIMITED_ADMIN permission matrix."
      />

      <div className="mb-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <h2 className="text-xl font-medium text-ink">Invite existing user</h2>
          <div className="mt-4 grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-ink">
              User ID
              <TextInput value={userId} onChange={(event) => setUserId(event.target.value)} />
            </label>
            <label className="grid gap-2 text-sm font-medium text-ink">
              Role
              <select
                className="h-11 rounded-md border border-steel bg-canvas px-4 text-base text-ink outline-none focus:border-ink"
                value={role}
                onChange={(event) => setRole(event.target.value as AdminRole)}
              >
                <option value="LIMITED_ADMIN">LIMITED_ADMIN</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              </select>
            </label>
            <Button disabled={createMutation.isPending} onClick={() => createMutation.mutate()}>
              Add admin membership
            </Button>
            {createMutation.error ? (
              <p className="text-sm font-medium text-danger-deep">{createMutation.error.message}</p>
            ) : null}
          </div>
        </Card>

        <Card variant="feature">
          <h2 className="text-xl font-medium text-ink">LIMITED_ADMIN Permission Matrix</h2>
          <p className="mt-2 text-sm text-charcoal">SUPER_ADMIN implicitly receives every permission.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {ALL_PERMISSIONS.map((permission) => (
              <label key={permission} className="flex items-center gap-2 rounded-lg bg-canvas p-3 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={permissions.includes(permission)}
                  onChange={() => togglePermission(permission)}
                />
                {permission}
              </label>
            ))}
          </div>
        </Card>
      </div>

      <DataTable headers={['Admin', 'Role', 'Status', 'Assigned', 'Permissions', 'Actions']}>
        {adminUsersQuery.data.map((adminUser) => (
          <tr key={adminUser.id}>
            <td className="px-6 py-4">
              <p className="font-medium text-ink">{adminUser.user.username}</p>
              <p className="text-sm text-charcoal">{adminUser.user.email}</p>
            </td>
            <td className="px-6 py-4">
              <StatusBadge tone={adminUser.role === 'SUPER_ADMIN' ? 'info' : 'neutral'}>{adminUser.role}</StatusBadge>
            </td>
            <td className="px-6 py-4">
              <StatusBadge tone={adminUser.status === 'ACTIVE' ? 'good' : 'bad'}>{adminUser.status}</StatusBadge>
            </td>
            <td className="px-6 py-4 text-charcoal">{formatDate(adminUser.assignedAt)}</td>
            <td className="px-6 py-4 text-sm text-charcoal">
              {adminUser.role === 'SUPER_ADMIN' ? 'All permissions' : adminUser.permissions?.join(', ')}
            </td>
            <td className="px-6 py-4">
              <Button variant="danger" disabled={disableMutation.isPending} onClick={() => disableMutation.mutate(adminUser.id)}>
                Disable
              </Button>
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  )
}
