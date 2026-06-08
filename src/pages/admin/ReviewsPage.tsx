import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../services/adminApi'
import { formatDate } from '../../lib/format'
import { Button, DataTable, ErrorState, LoadingState, PageHeader, StatusBadge } from '../../components/ui'

export function ReviewsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'review-reports'],
    queryFn: adminApi.getReviewReports,
  })

  if (isLoading) return <LoadingState />
  if (error || !data) return <ErrorState message={error?.message} />

  return (
    <>
      <PageHeader
        eyebrow="Trust and safety"
        title="Reviews & Content Reports"
        description="Review flagged content, provider replies, moderation reasons, and audit-backed hide/unhide decisions."
      />
      <DataTable headers={['Review', 'Provider', 'Rating', 'Status', 'Reason', 'Actions']}>
        {data.map((review) => (
          <tr key={review.id}>
            <td className="px-6 py-4">
              <p className="font-medium text-ink">{review.program}</p>
              <p className="text-sm text-charcoal">
                {review.reviewer} · {formatDate(review.createdAt)}
              </p>
            </td>
            <td className="px-6 py-4 text-charcoal">{review.provider}</td>
            <td className="px-6 py-4 text-charcoal">{review.rating}/5</td>
            <td className="px-6 py-4">
              <StatusBadge tone={review.status === 'VISIBLE' ? 'good' : review.status === 'FLAGGED' ? 'warn' : 'bad'}>
                {review.status}
              </StatusBadge>
            </td>
            <td className="px-6 py-4 text-charcoal">{review.reason}</td>
            <td className="px-6 py-4">
              <div className="flex gap-2">
                <Button variant="outline">Flag</Button>
                <Button variant="danger">Hide</Button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  )
}
