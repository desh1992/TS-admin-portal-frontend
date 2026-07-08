import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../services/adminApi'
import { formatDate } from '../../lib/format'
import { DataTable, ErrorState, LoadingState, PageHeader, StatusBadge } from '../../components/ui'

export function EnrollmentsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'enrollments'],
    queryFn: adminApi.getEnrollments,
  })

  if (isLoading) return <LoadingState />
  if (error || !data) return <ErrorState message={error?.message} />

  return (
    <>
      <PageHeader
        eyebrow="Learning operations"
        title="Enrollment & Session Oversight"
        description="Monitor enrollments by seeker, provider, program, status, check-ins, sessions, cancellations, and delivery mode."
      />
      <DataTable headers={['Enrollment', 'Status', 'Delivery', 'Enrolled']}>
        {data.map((enrollment) => (
          <tr key={enrollment.id}>
            <td className="px-6 py-4">
              <p className="font-medium text-ink">{enrollment.program}</p>
              <p className="text-sm text-charcoal">
                {enrollment.seeker} with {enrollment.provider}
              </p>
            </td>
            <td className="px-6 py-4">
              <StatusBadge tone={enrollment.status === 'ACTIVE' ? 'good' : enrollment.status === 'DISPUTED' ? 'warn' : 'neutral'}>
                {enrollment.status}
              </StatusBadge>
            </td>
            <td className="px-6 py-4 text-charcoal">{enrollment.deliveryMode}</td>
            <td className="px-6 py-4 text-charcoal">{formatDate(enrollment.enrolledAt)}</td>
          </tr>
        ))}
      </DataTable>
    </>
  )
}
