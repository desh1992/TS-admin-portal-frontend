import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../services/adminApi'
import { formatCurrency } from '../../lib/format'
import { Card, DataTable, ErrorState, LoadingState, PageHeader, StatusBadge } from '../../components/ui'

export function ProvidersPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'providers'],
    queryFn: adminApi.getProviders,
  })

  if (isLoading) return <LoadingState />
  if (error || !data) return <ErrorState message={error?.message} />

  return (
    <>
      <PageHeader
        eyebrow="Marketplace supply"
        title="Provider Management"
        description="Monitor provider status, Stripe onboarding, published programs, revenue, ratings, media, certifications, students, and application history."
      />

      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <Card>
          <p className="text-sm font-medium text-charcoal">Active providers</p>
          <p className="mt-2 text-[32px] font-medium leading-none text-ink">
            {data.filter((provider) => provider.status === 'ACTIVE').length}
          </p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-charcoal">Pending Stripe onboarding</p>
          <p className="mt-2 text-[32px] font-medium leading-none text-ink">
            {data.filter((provider) => provider.stripeStatus !== 'COMPLETE').length}
          </p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-charcoal">Provider revenue</p>
          <p className="mt-2 text-[32px] font-medium leading-none text-ink">
            {formatCurrency(data.reduce((sum, provider) => sum + provider.revenue, 0))}
          </p>
        </Card>
      </div>

      <DataTable headers={['Provider', 'Status', 'Stripe', 'Programs', 'Finance', 'Quality']}>
        {data.map((provider) => (
          <tr key={provider.id}>
            <td className="px-6 py-4">
              <p className="font-medium text-ink">{provider.name}</p>
              <p className="text-sm text-charcoal">Certifications: {provider.certifications.join(', ')}</p>
            </td>
            <td className="px-6 py-4">
              <StatusBadge tone={provider.status === 'ACTIVE' ? 'good' : provider.status === 'UNDER_REVIEW' ? 'warn' : 'bad'}>
                {provider.status}
              </StatusBadge>
            </td>
            <td className="px-6 py-4">
              <StatusBadge tone={provider.stripeStatus === 'COMPLETE' ? 'good' : provider.stripeStatus === 'PENDING' ? 'warn' : 'bad'}>
                {provider.stripeStatus}
              </StatusBadge>
            </td>
            <td className="px-6 py-4 text-charcoal">{provider.publishedPrograms} published</td>
            <td className="px-6 py-4 text-charcoal">{formatCurrency(provider.revenue)}</td>
            <td className="px-6 py-4 text-charcoal">
              <p>{provider.rating.toFixed(1)} rating</p>
              <p>
                {provider.students} students, {provider.reviews} reviews
              </p>
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  )
}
