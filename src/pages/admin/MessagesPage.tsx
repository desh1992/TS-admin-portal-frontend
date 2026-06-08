import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../services/adminApi'
import { useAuth } from '../../context/useAuth'
import { AlertBanner, DataTable, ErrorState, LoadingState, PageHeader, StatusBadge } from '../../components/ui'

export function MessagesPage() {
  const { can } = useAuth()
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'messages'],
    queryFn: adminApi.getMessages,
  })

  if (isLoading) return <LoadingState />
  if (error || !data) return <ErrorState message={error?.message} />

  return (
    <>
      <PageHeader
        eyebrow="Privacy aware oversight"
        title="Messages Metadata"
        description="Shows conversation participants, program context, timestamps, unread counts, and reports. Full message content is not exposed by default."
      />
      <AlertBanner tone="info">
        <p className="font-medium">Content access policy</p>
        <p className="mt-1 text-sm">
          SUPER_ADMIN can access message content only for trust/safety cases and the action must be audited. This mock UI only shows whether content access could be requested.
        </p>
      </AlertBanner>
      <DataTable headers={['Conversation', 'Program', 'Unread', 'Reports', 'Last Activity', 'Content Access']}>
        {data.map((thread) => (
          <tr key={thread.id}>
            <td className="px-6 py-4 font-medium text-ink">{thread.participants.join(' <-> ')}</td>
            <td className="px-6 py-4 text-charcoal">{thread.program}</td>
            <td className="px-6 py-4 text-charcoal">{thread.unreadCount}</td>
            <td className="px-6 py-4">
              <StatusBadge tone={thread.reports > 0 ? 'warn' : 'good'}>{thread.reports}</StatusBadge>
            </td>
            <td className="px-6 py-4 text-charcoal">{new Date(thread.lastMessageAt).toLocaleString()}</td>
            <td className="px-6 py-4">
              {can('messages.content.read') && thread.contentAccessReason ? (
                <StatusBadge tone="info">Eligible: {thread.contentAccessReason}</StatusBadge>
              ) : (
                <span className="text-sm font-medium text-graphite">Metadata only</span>
              )}
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  )
}
