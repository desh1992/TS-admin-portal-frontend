import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../services/adminApi'
import { formatDate } from '../../lib/format'
import {
  Button,
  Card,
  DataTable,
  ErrorState,
  LoadingState,
  PageHeader,
  SectionTitle,
  StatusBadge,
} from '../../components/ui'

export function SupportPage() {
  const queryClient = useQueryClient()
  const ticketsQuery = useQuery({
    queryKey: ['admin', 'support-tickets'],
    queryFn: adminApi.getSupportTickets,
  })
  const cancellationsQuery = useQuery({
    queryKey: ['admin', 'cancellations'],
    queryFn: adminApi.getCancellations,
  })
  const ticketMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' }) =>
      adminApi.updateSupportTicket(id, status),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin'] }),
  })
  const cancellationMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'APPROVED' | 'REJECTED' }) =>
      adminApi.reviewCancellation(id, status),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin'] }),
  })

  if (ticketsQuery.isLoading || cancellationsQuery.isLoading) return <LoadingState />
  if (ticketsQuery.error || cancellationsQuery.error || !ticketsQuery.data || !cancellationsQuery.data) {
    return <ErrorState message={ticketsQuery.error?.message ?? cancellationsQuery.error?.message} />
  }

  return (
    <>
      <PageHeader
        eyebrow="Customer operations"
        title="Support & Cancellations"
        description="Manage support tickets by inquiry type and status, with assignment, internal notes, response history, and cancellation request review."
      />

      <Card className="mb-8">
        <SectionTitle title="Support Tickets" />
        <DataTable headers={['Ticket', 'Type', 'Status', 'Assigned', 'Updated', 'Action']}>
          {ticketsQuery.data.map((ticket) => (
            <tr key={ticket.id}>
              <td className="px-6 py-4">
                <p className="font-medium text-ink">{ticket.subject}</p>
                <p className="text-sm text-charcoal">{ticket.requester}</p>
                <p className="mt-2 text-xs text-graphite">{ticket.internalNotes.join(' ')}</p>
              </td>
              <td className="px-6 py-4 text-charcoal">{ticket.inquiryType}</td>
              <td className="px-6 py-4">
                <StatusBadge tone={ticket.status === 'OPEN' ? 'warn' : ticket.status === 'RESOLVED' ? 'good' : 'neutral'}>
                  {ticket.status}
                </StatusBadge>
              </td>
              <td className="px-6 py-4 text-charcoal">{ticket.assignedTo ?? 'Unassigned'}</td>
              <td className="px-6 py-4 text-charcoal">{formatDate(ticket.updatedAt)}</td>
              <td className="px-6 py-4">
                <Button
                  variant="outline"
                  disabled={ticketMutation.isPending}
                  onClick={() => ticketMutation.mutate({ id: ticket.id, status: 'RESOLVED' })}
                >
                  Resolve
                </Button>
              </td>
            </tr>
          ))}
        </DataTable>
      </Card>

      <Card>
        <SectionTitle title="Cancellation Requests" />
        <DataTable headers={['Request', 'Status', 'Submitted', 'Actions']}>
          {cancellationsQuery.data.map((request) => (
            <tr key={request.id}>
              <td className="px-6 py-4">
                <p className="font-medium text-ink">{request.program}</p>
                <p className="text-sm text-charcoal">
                  {request.requester}: {request.reason}
                </p>
              </td>
              <td className="px-6 py-4">
                <StatusBadge tone={request.status === 'OPEN' ? 'warn' : request.status === 'APPROVED' ? 'good' : 'bad'}>
                  {request.status}
                </StatusBadge>
              </td>
              <td className="px-6 py-4 text-charcoal">{formatDate(request.submittedAt)}</td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <Button
                    disabled={cancellationMutation.isPending}
                    onClick={() => cancellationMutation.mutate({ id: request.id, status: 'APPROVED' })}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    disabled={cancellationMutation.isPending}
                    onClick={() => cancellationMutation.mutate({ id: request.id, status: 'REJECTED' })}
                  >
                    Reject
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      </Card>
    </>
  )
}
