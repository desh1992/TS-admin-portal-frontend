import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../services/adminApi'
import { formatDate } from '../../lib/format'
import { DataTable, ErrorState, LoadingState, PageHeader, StatusBadge } from '../../components/ui'

export function AuditLogsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'audit-logs'],
    queryFn: adminApi.getAuditLogs,
  })

  if (isLoading) return <LoadingState />
  if (error || !data) return <ErrorState message={error?.message} />

  return (
    <>
      <PageHeader
        eyebrow="Evidence trail"
        title="Audit Logs"
        description="Every admin mutation should capture actor, role, action, resource, safe before/after context, IP, user agent, and timestamp."
      />
      <DataTable headers={['Action', 'Actor', 'Resource', 'Summary', 'Client', 'Time']}>
        {data.map((log) => (
          <tr key={log.id}>
            <td className="px-6 py-4">
              <p className="font-medium text-ink">{log.action}</p>
              <StatusBadge tone={log.actorRole === 'SUPER_ADMIN' ? 'info' : 'neutral'}>{log.actorRole}</StatusBadge>
            </td>
            <td className="px-6 py-4 text-charcoal">{log.actorUserId}</td>
            <td className="px-6 py-4">
              <p className="text-ink">{log.resourceType}</p>
              <p className="text-sm text-charcoal">{log.resourceId}</p>
            </td>
            <td className="px-6 py-4 text-charcoal">{log.summary}</td>
            <td className="px-6 py-4">
              <p className="text-ink">{log.ipAddress}</p>
              <p className="text-sm text-charcoal">{log.userAgent}</p>
            </td>
            <td className="px-6 py-4 text-charcoal">{formatDate(log.timestamp)}</td>
          </tr>
        ))}
      </DataTable>
    </>
  )
}
