import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../services/adminApi'
import { formatDate } from '../../lib/format'
import type { ReportType } from '../../types/admin'
import {
  Button,
  Card,
  DataTable,
  EmptyState,
  ErrorState,
  FilterChip,
  LoadingState,
  PageHeader,
  TextInput,
} from '../../components/ui'

const REPORTS: Array<{ id: ReportType; label: string; description: string }> = [
  {
    id: 'seekers-joined',
    label: 'Seekers joined',
    description: 'Seekers who joined the portal between two dates.',
  },
  {
    id: 'provider-upgrades',
    label: 'Provider upgrades',
    description: 'Users upgraded from seeker to provider in a date range.',
  },
  {
    id: 'providers-new-programs',
    label: 'Providers with new programs',
    description: 'Providers who published new programs between two dates.',
  },
  {
    id: 'programs-created',
    label: 'Programs created',
    description: 'Programs created in a date range with enrollment counts.',
  },
  {
    id: 'seeker-enrollments',
    label: 'Seeker enrollments',
    description: 'Seekers who enrolled into programs between two dates.',
  },
]

function defaultFromDate() {
  const date = new Date()
  date.setMonth(date.getMonth() - 1)
  return date.toISOString().slice(0, 10)
}

function defaultToDate() {
  return new Date().toISOString().slice(0, 10)
}

export function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('seekers-joined')
  const [from, setFrom] = useState(defaultFromDate)
  const [to, setTo] = useState(defaultToDate)
  const [runKey, setRunKey] = useState(0)

  const reportQuery = useQuery({
    queryKey: ['admin', 'reports', reportType, from, to, runKey],
    queryFn: () => adminApi.getReport(reportType, from, to),
    enabled: runKey > 0,
  })

  const activeReport = REPORTS.find((report) => report.id === reportType)

  return (
    <>
      <PageHeader
        eyebrow="Queries & reports"
        title="Reports"
        description="Run date-range reports for seekers, provider upgrades, new programs, and enrollments as specified in the admin console requirements."
      />

      <Card className="mb-6">
        <div className="flex flex-wrap gap-2">
          {REPORTS.map((report) => (
            <FilterChip key={report.id} active={reportType === report.id} onClick={() => setReportType(report.id)}>
              {report.label}
            </FilterChip>
          ))}
        </div>
        <p className="mt-4 text-sm text-charcoal">{activeReport?.description}</p>

        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
          <label className="grid gap-2 text-sm font-medium text-ink">
            From
            <TextInput type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
          </label>
          <label className="grid gap-2 text-sm font-medium text-ink">
            To
            <TextInput type="date" value={to} onChange={(event) => setTo(event.target.value)} />
          </label>
          <div className="flex items-end">
            <Button onClick={() => setRunKey((current) => current + 1)}>Run report</Button>
          </div>
        </div>
      </Card>

      {runKey === 0 ? (
        <EmptyState title="Select a date range" description="Choose dates and click Run report to generate results." />
      ) : null}
      {reportQuery.isLoading ? <LoadingState /> : null}
      {reportQuery.error ? <ErrorState message={reportQuery.error.message} /> : null}

      {reportQuery.data ? (
        <Card>
          <p className="text-sm font-medium text-charcoal">
            Total count: <span className="text-ink">{reportQuery.data.count}</span>
          </p>
          <div className="mt-4 overflow-x-auto">
            <ReportTable type={reportType} rows={reportQuery.data.rows} />
          </div>
        </Card>
      ) : null}
    </>
  )
}

function ReportTable({ type, rows }: { type: ReportType; rows: Record<string, unknown>[] }) {
  if (rows.length === 0) {
    return <EmptyState title="No results" description="No records matched this date range." />
  }

  if (type === 'seekers-joined') {
    return (
      <DataTable headers={['First name', 'Last name', 'User ID', 'Email', 'Joining date']}>
        {rows.map((row, index) => (
          <tr key={index}>
            <td className="px-6 py-4">{String(row.firstName)}</td>
            <td className="px-6 py-4">{String(row.lastName)}</td>
            <td className="px-6 py-4 font-medium text-ink">{String(row.userId)}</td>
            <td className="px-6 py-4">{String(row.email)}</td>
            <td className="px-6 py-4">{formatDate(String(row.joiningDate))}</td>
          </tr>
        ))}
      </DataTable>
    )
  }

  if (type === 'provider-upgrades') {
    return (
      <DataTable headers={['First name', 'Last name', 'User ID', 'Email', 'Joined', 'Upgraded']}>
        {rows.map((row, index) => (
          <tr key={index}>
            <td className="px-6 py-4">{String(row.firstName)}</td>
            <td className="px-6 py-4">{String(row.lastName)}</td>
            <td className="px-6 py-4 font-medium text-ink">{String(row.userId)}</td>
            <td className="px-6 py-4">{String(row.email)}</td>
            <td className="px-6 py-4">{formatDate(String(row.joiningDate))}</td>
            <td className="px-6 py-4">{row.upgradedDate ? formatDate(String(row.upgradedDate)) : '—'}</td>
          </tr>
        ))}
      </DataTable>
    )
  }

  if (type === 'providers-new-programs') {
    return (
      <DataTable headers={['First name', 'Last name', 'User ID', 'Email', 'Programs created']}>
        {rows.map((row, index) => (
          <tr key={index}>
            <td className="px-6 py-4">{String(row.firstName)}</td>
            <td className="px-6 py-4">{String(row.lastName)}</td>
            <td className="px-6 py-4 font-medium text-ink">{String(row.userId)}</td>
            <td className="px-6 py-4">{String(row.email)}</td>
            <td className="px-6 py-4">{String(row.programCount)}</td>
          </tr>
        ))}
      </DataTable>
    )
  }

  if (type === 'programs-created') {
    return (
      <DataTable headers={['Provider', 'Program ID', 'Program', 'Capacity', 'Enrolled', 'Created']}>
        {rows.map((row, index) => (
          <tr key={index}>
            <td className="px-6 py-4">
              {String(row.providerFirstName)} {String(row.providerLastName)}
            </td>
            <td className="px-6 py-4 font-medium text-ink">{String(row.programId)}</td>
            <td className="px-6 py-4">{String(row.programName)}</td>
            <td className="px-6 py-4">{String(row.enrollmentSize)}</td>
            <td className="px-6 py-4">{String(row.enrolledCount)}</td>
            <td className="px-6 py-4">{formatDate(String(row.createdAt))}</td>
          </tr>
        ))}
      </DataTable>
    )
  }

  return (
    <DataTable headers={['Seeker', 'Email', 'Program', 'Enrolled', 'Status']}>
      {rows.map((row, index) => (
        <tr key={index}>
          <td className="px-6 py-4">
            {String(row.firstName)} {String(row.lastName)}
          </td>
          <td className="px-6 py-4">{String(row.email)}</td>
          <td className="px-6 py-4">{String(row.programName)}</td>
          <td className="px-6 py-4">{formatDate(String(row.enrolledAt))}</td>
          <td className="px-6 py-4">{String(row.status)}</td>
        </tr>
      ))}
    </DataTable>
  )
}
