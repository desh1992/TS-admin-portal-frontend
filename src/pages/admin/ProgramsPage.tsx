import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../services/adminApi'
import { useAuth } from '../../context/useAuth'
import { formatDate } from '../../lib/format'
import type { Program } from '../../types/admin'
import {
  Button,
  Card,
  DataTable,
  ErrorState,
  LoadingState,
  PageHeader,
  StatusBadge,
  TextArea,
  TextInput,
} from '../../components/ui'

export function ProgramsPage() {
  const { can } = useAuth()
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<Program | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editDescription, setEditDescription] = useState('')

  const programsQuery = useQuery({
    queryKey: ['admin', 'programs'],
    queryFn: adminApi.getPrograms,
  })

  const updateMutation = useMutation({
    mutationFn: (input: { id: string; title?: string; category?: string; description?: string; status?: Program['status'] }) =>
      adminApi.updateProgram(input.id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'programs'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteProgram,
    onSuccess: () => {
      setSelected(null)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'programs'] })
    },
  })

  function openEditor(program: Program) {
    setSelected(program)
    setEditTitle(program.title)
    setEditCategory(program.category)
    setEditDescription('')
  }

  if (programsQuery.isLoading) return <LoadingState />
  if (programsQuery.error || !programsQuery.data) return <ErrorState message={programsQuery.error?.message} />

  return (
    <>
      <PageHeader
        eyebrow="Marketplace catalog"
        title="Program Management"
        description="Edit, update, archive, and delete programs. Programs are archived rather than silently deleted."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <DataTable headers={['Program', 'Status', 'Provider', 'Mode', 'Enrolled', 'Actions']}>
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
              <td className="px-6 py-4">
                {can('programs.moderate') ? (
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => openEditor(program)}>
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      disabled={updateMutation.isPending}
                      onClick={() => updateMutation.mutate({ id: program.id, status: 'REPORTED' })}
                    >
                      Flag
                    </Button>
                    <Button
                      variant="danger"
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        if (window.confirm('Archive this program?')) deleteMutation.mutate(program.id)
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                ) : (
                  <span className="text-sm font-medium text-graphite">Read-only</span>
                )}
              </td>
            </tr>
          ))}
        </DataTable>

        <Card className="h-fit">
          {selected ? (
            <div className="space-y-4">
              <h2 className="text-xl font-medium text-ink">Edit program</h2>
              <label className="grid gap-2 text-sm font-medium text-ink">
                Title
                <TextInput value={editTitle} onChange={(event) => setEditTitle(event.target.value)} />
              </label>
              <label className="grid gap-2 text-sm font-medium text-ink">
                Category
                <TextInput value={editCategory} onChange={(event) => setEditCategory(event.target.value)} />
              </label>
              <label className="grid gap-2 text-sm font-medium text-ink">
                Description
                <TextArea value={editDescription} onChange={(event) => setEditDescription(event.target.value)} />
              </label>
              <div className="flex gap-2">
                <Button
                  disabled={updateMutation.isPending}
                  onClick={() =>
                    updateMutation.mutate({
                      id: selected.id,
                      title: editTitle,
                      category: editCategory,
                      description: editDescription || undefined,
                    })
                  }
                >
                  Save changes
                </Button>
                <Button variant="outline" onClick={() => setSelected(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-medium text-ink">Program editor</h2>
              <p className="mt-2 text-sm text-charcoal">Select a program to edit its details.</p>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
