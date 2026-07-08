import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../services/adminApi'
import { formatDate } from '../../lib/format'
import type { SupportTicket } from '../../types/admin'
import {
  Button,
  Card,
  DataTable,
  ErrorState,
  LoadingState,
  PageHeader,
  SectionTitle,
  StatusBadge,
  TextArea,
  TextInput,
} from '../../components/ui'

export function SupportPage() {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<SupportTicket | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [emailTo, setEmailTo] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')

  const ticketsQuery = useQuery({
    queryKey: ['admin', 'support-tickets'],
    queryFn: adminApi.getSupportTickets,
  })
  const cancellationsQuery = useQuery({
    queryKey: ['admin', 'cancellations'],
    queryFn: adminApi.getCancellations,
  })

  const ticketMutation = useMutation({
    mutationFn: (input: { id: string; status?: SupportTicket['status']; adminNotes?: string }) =>
      adminApi.updateSupportTicket(input.id, input),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin'] }),
  })

  const emailMutation = useMutation({
    mutationFn: () => adminApi.sendSupportEmail({ toEmail: emailTo, subject: emailSubject, body: emailBody }),
    onSuccess: () => {
      setEmailTo('')
      setEmailSubject('')
      setEmailBody('')
    },
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
        title="Support & Email"
        description="Manage support tickets, add internal notes, resolve inquiries, and email providers or seekers from the support account."
      />

      <div className="mb-8 grid gap-6 xl:grid-cols-[1fr_24rem]">
        <Card>
          <SectionTitle title="Support Tickets" />
          <DataTable headers={['Ticket', 'Type', 'Status', 'Assigned', 'Updated', 'Action']}>
            {ticketsQuery.data.map((ticket) => (
              <tr key={ticket.id}>
                <td className="px-6 py-4">
                  <p className="font-medium text-ink">{ticket.subject}</p>
                  <p className="text-sm text-charcoal">{ticket.requester}</p>
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
                  <Button variant="outline" onClick={() => { setSelected(ticket); setAdminNotes(ticket.internalNotes[0] ?? '') }}>
                    Manage
                  </Button>
                </td>
              </tr>
            ))}
          </DataTable>
        </Card>

        <Card className="h-fit">
          {selected ? (
            <div className="space-y-4">
              <h2 className="text-xl font-medium text-ink">{selected.subject}</h2>
              <TextArea value={adminNotes} onChange={(event) => setAdminNotes(event.target.value)} placeholder="Internal notes..." />
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  disabled={ticketMutation.isPending}
                  onClick={() => ticketMutation.mutate({ id: selected.id, status: 'IN_PROGRESS', adminNotes })}
                >
                  In progress
                </Button>
                <Button
                  disabled={ticketMutation.isPending}
                  onClick={() => ticketMutation.mutate({ id: selected.id, status: 'RESOLVED', adminNotes })}
                >
                  Resolve
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-medium text-ink">Ticket detail</h2>
              <p className="mt-2 text-sm text-charcoal">Select a ticket to add notes and update status.</p>
            </div>
          )}
        </Card>
      </div>

      <Card className="mb-8">
        <SectionTitle title="Email Support" />
        <p className="mb-4 text-sm text-charcoal">
          Send email to any provider or seeker from the support account (support@talent-share.com).
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-ink">
            To email
            <TextInput value={emailTo} onChange={(event) => setEmailTo(event.target.value)} placeholder="user@example.com" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-ink">
            Subject
            <TextInput value={emailSubject} onChange={(event) => setEmailSubject(event.target.value)} />
          </label>
        </div>
        <label className="mt-4 grid gap-2 text-sm font-medium text-ink">
          Message
          <TextArea value={emailBody} onChange={(event) => setEmailBody(event.target.value)} />
        </label>
        <Button
          className="mt-4"
          disabled={emailMutation.isPending || !emailTo || !emailSubject || !emailBody}
          onClick={() => emailMutation.mutate()}
        >
          Send email
        </Button>
        {emailMutation.isSuccess ? (
          <p className="mt-2 text-sm font-medium text-primary">Email sent successfully.</p>
        ) : null}
        {emailMutation.error ? (
          <p className="mt-2 text-sm font-medium text-danger-deep">{emailMutation.error.message}</p>
        ) : null}
      </Card>

      <Card>
        <SectionTitle title="Cancellation Requests" />
        <p className="mb-4 text-sm text-charcoal">Cancellation workflow pending backend implementation.</p>
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
                  <Button disabled={cancellationMutation.isPending} onClick={() => cancellationMutation.mutate({ id: request.id, status: 'APPROVED' })}>
                    Approve
                  </Button>
                  <Button variant="danger" disabled={cancellationMutation.isPending} onClick={() => cancellationMutation.mutate({ id: request.id, status: 'REJECTED' })}>
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
