import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../services/adminApi'
import { formatDate } from '../../lib/format'
import { DataTable, ErrorState, LoadingState, PageHeader, StatusBadge } from '../../components/ui'

export function NotificationsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'notifications'],
    queryFn: adminApi.getNotifications,
  })

  if (isLoading) return <LoadingState />
  if (error || !data) return <ErrorState message={error?.message} />

  return (
    <>
      <PageHeader
        eyebrow="Delivery telemetry"
        title="Notifications Oversight"
        description="Inspect notification delivery metadata and failed notification events without exposing tokens, secrets, or private auth data."
      />
      <DataTable headers={['Recipient', 'Channel', 'Template', 'Status', 'Sent']}>
        {data.map((event) => (
          <tr key={event.id}>
            <td className="px-6 py-4 font-medium text-ink">{event.recipient}</td>
            <td className="px-6 py-4 text-charcoal">{event.channel}</td>
            <td className="px-6 py-4 text-charcoal">{event.template}</td>
            <td className="px-6 py-4">
              <StatusBadge tone={event.status === 'DELIVERED' ? 'good' : event.status === 'FAILED' ? 'bad' : 'warn'}>
                {event.status}
              </StatusBadge>
            </td>
            <td className="px-6 py-4 text-charcoal">{formatDate(event.sentAt)}</td>
          </tr>
        ))}
      </DataTable>
    </>
  )
}
