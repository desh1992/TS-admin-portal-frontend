import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../services/adminApi'
import { useAuth } from '../../context/useAuth'
import { formatDate } from '../../lib/format'
import { Button, DataTable, ErrorState, LoadingState, PageHeader, StatusBadge } from '../../components/ui'

export function ProgramsPage() {
  const { can } = useAuth()
  const queryClient = useQueryClient()
  const programsQuery = useQuery({
    queryKey: ['admin', 'programs'],
    queryFn: adminApi.getPrograms,
  })
  const moderationMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'PUBLISHED' | 'ARCHIVED' | 'REPORTED' }) =>
      adminApi.updateProgramModeration(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'programs'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] })
    },
  })

  if (programsQuery.isLoading) return <LoadingState />
  if (programsQuery.error || !programsQuery.data) return <ErrorState message={programsQuery.error?.message} />

  return (
    <>
      <PageHeader
        eyebrow="Marketplace catalog"
        title="Program Moderation"
        description="List all programs by draft, published, archived, reported, provider, category, and date. Programs are archived or flagged, never silently deleted."
      />
      <DataTable headers={['Program', 'Status', 'Provider', 'Mode', 'Enrollments', 'Quality', 'Actions']}>
        {programsQuery.data.map((program) => (
          <tr key={program.id}>
            <td className="px-6 py-4">
              <p className="font-medium text-ink">{program.title}</p>
              <p className="text-sm text-charcoal">
                {program.category} · created {formatDate(program.createdAt)}
              </p>
            </td>
            <td className="px-6 py-4">
              <StatusBadge tone={program.status === 'PUBLISHED' ? 'good' : program.status === 'REPORTED' ? 'warn' : 'neutral'}>
                {program.status}
              </StatusBadge>
            </td>
            <td className="px-6 py-4 text-charcoal">{program.provider}</td>
            <td className="px-6 py-4 text-charcoal">{program.deliveryMode}</td>
            <td className="px-6 py-4 text-charcoal">{program.enrollments}</td>
            <td className="px-6 py-4 text-charcoal">{program.rating ? `${program.rating.toFixed(1)} rating` : 'No reviews'}</td>
            <td className="px-6 py-4">
              {can('programs.moderate') ? (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    disabled={moderationMutation.isPending}
                    onClick={() => moderationMutation.mutate({ id: program.id, status: 'REPORTED' })}
                  >
                    Flag
                  </Button>
                  <Button
                    variant="danger"
                    disabled={moderationMutation.isPending}
                    onClick={() => moderationMutation.mutate({ id: program.id, status: 'ARCHIVED' })}
                  >
                    Archive
                  </Button>
                </div>
              ) : (
                <span className="text-sm font-medium text-graphite">Read-only</span>
              )}
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  )
}
