import type { AdminRole, Permission } from '../types/admin'

export const ALL_PERMISSIONS: Permission[] = [
  'dashboard.read',
  'users.read',
  'users.manage',
  'providers.read',
  'providerApplications.review',
  'programs.read',
  'programs.moderate',
  'enrollments.read',
  'cancellations.manage',
  'support.manage',
  'finance.read',
  'finance.transfer.run',
  'messages.metadata.read',
  'messages.content.read',
  'notifications.read',
  'adminUsers.manage',
  'auditLogs.read',
  'systemSettings.manage',
]

export const DEFAULT_LIMITED_ADMIN_PERMISSIONS: Permission[] = [
  'dashboard.read',
  'users.read',
  'providers.read',
  'providerApplications.review',
  'programs.read',
  'enrollments.read',
  'support.manage',
  'messages.metadata.read',
  'notifications.read',
]

export function hasPermission(
  role: AdminRole | null,
  permissions: Permission[],
  required?: Permission | Permission[],
) {
  if (!required) return true
  if (role === 'SUPER_ADMIN') return true

  const requiredList = Array.isArray(required) ? required : [required]
  return requiredList.every((permission) => permissions.includes(permission))
}

export function isSuperAdmin(role: AdminRole | null) {
  return role === 'SUPER_ADMIN'
}
