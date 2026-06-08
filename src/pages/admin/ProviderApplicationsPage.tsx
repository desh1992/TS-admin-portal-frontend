import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../services/adminApi'
import { formatDate } from '../../lib/format'
import type { ProviderApplication } from '../../types/admin'
import {
  Button,
  Card,
  DataTable,
  ErrorState,
  FilterChip,
  LoadingState,
  PageHeader,
  StatusBadge,
  TextArea,
} from '../../components/ui'

const filters: Array<ProviderApplication['status'] | 'ALL'> = [
  'ALL',
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
]

export function ProviderApplicationsPage() {
  const [status, setStatus] = useState<ProviderApplication['status'] | 'ALL'>('ALL')
  const [selected, setSelected] = useState<ProviderApplication | null>(null)
  const [notes, setNotes] = useState('')
  const queryClient = useQueryClient()

  const applicationsQuery = useQuery({
    queryKey: ['admin', 'provider-applications', status],
    queryFn: () => adminApi.getProviderApplications(status),
  })

  const reviewMutation = useMutation({
    mutationFn: ({ id, decision, reviewNotes }: { id: string; decision: 'APPROVED' | 'REJECTED'; reviewNotes: string }) =>
      adminApi.reviewProviderApplication(id, decision, reviewNotes),
    onSuccess: () => {
      setSelected(null)
      setNotes('')
      void queryClient.invalidateQueries({ queryKey: ['admin', 'provider-applications'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] })
    },
  })

  if (applicationsQuery.isLoading) return <LoadingState />
  if (applicationsQuery.error || !applicationsQuery.data) {
    return <ErrorState message={applicationsQuery.error?.message} />
  }

  return (
    <>
      <PageHeader
        eyebrow="Provider onboarding"
        title="Provider Applications"
        description="Review applications with required notes, Stripe onboarding status, and audit-backed approve/reject decisions."
        action={
          <div className="flex flex-wrap gap-2 rounded-lg bg-cloud p-2">
            {filters.map((filter) => (
              <FilterChip key={filter} active={status === filter} onClick={() => setStatus(filter)}>
                {filter.replace('_', ' ')}
              </FilterChip>
            ))}
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <DataTable headers={['Applicant', 'Status', 'Stripe', 'Category', 'Submitted', 'Action']}>
          {applicationsQuery.data.map((application) => (
            <tr key={application.id}>
              <td className="px-6 py-4">
                <p className="font-medium text-ink">{application.applicantName}</p>
                <p className="text-charcoal">{application.email}</p>
              </td>
              <td className="px-6 py-4">
                <StatusBadge tone={application.status === 'APPROVED' ? 'good' : application.status === 'REJECTED' ? 'bad' : 'warn'}>
                  {application.status}
                </StatusBadge>
              </td>
              <td className="px-6 py-4 text-charcoal">{application.stripeStatus}</td>
              <td className="px-6 py-4 text-charcoal">{application.category}</td>
              <td className="px-6 py-4 text-charcoal">{formatDate(application.submittedAt)}</td>
              <td className="px-6 py-4">
                <Button variant="outline" onClick={() => setSelected(application)}>
                  Open drawer
                </Button>
              </td>
            </tr>
          ))}
        </DataTable>

        <Card className="h-fit">
          {selected ? (
            <div>
              <p className="text-sm font-medium text-primary">Application detail</p>
              <h2 className="mt-2 text-2xl font-medium text-ink">{selected.applicantName}</h2>
              <p className="mt-1 text-sm text-charcoal">{selected.email}</p>
              <div className="mt-5 space-y-4 text-sm">
                <div>
                  <p className="font-medium text-ink">Experience</p>
                  <p className="mt-1 leading-[1.5] text-charcoal">{selected.experience}</p>
                </div>
                <div>
                  <p className="font-medium text-ink">Backend approval behavior</p>
                  <p className="mt-1 leading-[1.5] text-charcoal">
                    The real backend should convert seeker to provider and send notification/email on approval.
                  </p>
                </div>
                <TextArea
                  placeholder="Required review notes or rejection reason..."
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
                {reviewMutation.error ? (
                  <p className="text-sm font-medium text-danger-deep">{reviewMutation.error.message}</p>
                ) : null}
                <div className="flex gap-2">
                  <Button
                    disabled={reviewMutation.isPending}
                    onClick={() => reviewMutation.mutate({ id: selected.id, decision: 'APPROVED', reviewNotes: notes })}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    disabled={reviewMutation.isPending}
                    onClick={() => reviewMutation.mutate({ id: selected.id, decision: 'REJECTED', reviewNotes: notes })}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-medium text-ink">Application drawer</h2>
              <p className="mt-2 text-sm leading-[1.5] text-charcoal">
                Select an application to review details, add required notes, and approve or reject.
              </p>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
