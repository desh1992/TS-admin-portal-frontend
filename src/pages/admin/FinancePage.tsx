import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle } from 'lucide-react'
import { adminApi } from '../../services/adminApi'
import { useAuth } from '../../context/useAuth'
import { formatCurrency, formatDate } from '../../lib/format'
import {
  AlertBanner,
  Button,
  Card,
  DataTable,
  ErrorState,
  LoadingState,
  PageHeader,
  StatusBadge,
} from '../../components/ui'

export function FinancePage() {
  const { can, session } = useAuth()
  const [result, setResult] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const summaryQuery = useQuery({
    queryKey: ['admin', 'finance', 'summary'],
    queryFn: adminApi.getFinanceSummary,
  })
  const transactionsQuery = useQuery({
    queryKey: ['admin', 'finance', 'transactions'],
    queryFn: adminApi.getTransactions,
  })
  const transferMutation = useMutation({
    mutationFn: adminApi.runTransfers,
    onSuccess: (transferResult) => {
      setResult(
        `${transferResult.processed} processed, ${transferResult.succeeded} succeeded, ${transferResult.failed} failed. Transfers: ${transferResult.transferIds.join(', ')}`,
      )
      void queryClient.invalidateQueries({ queryKey: ['admin', 'finance'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] })
    },
  })

  if (summaryQuery.isLoading || transactionsQuery.isLoading) return <LoadingState />
  if (summaryQuery.error || transactionsQuery.error || !summaryQuery.data || !transactionsQuery.data) {
    return <ErrorState message={summaryQuery.error?.message ?? transactionsQuery.error?.message} />
  }

  const canRunTransfers = can('finance.transfer.run') && session?.adminRole === 'SUPER_ADMIN'

  return (
    <>
      <PageHeader
        eyebrow="Money movement"
        title="Payments, Payouts & Transfers"
        description="SUPER_ADMIN finance tools for GMV, platform fees, Stripe fees, refunds, provider payouts, pending transfers, and confirmed transfer execution."
        action={
          <Button
            variant="danger"
            disabled={!canRunTransfers || transferMutation.isPending}
            onClick={() => {
              if (window.confirm('Run provider payout transfers? This action must be audited.')) {
                transferMutation.mutate()
              }
            }}
          >
            Run transfers
          </Button>
        }
      />

      {!canRunTransfers ? (
        <AlertBanner tone="warn">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0" />
            <p className="text-sm font-medium">
              This session can view finance only if granted finance.read. Transfer execution is locked to
              SUPER_ADMIN in the mock portal.
            </p>
          </div>
        </AlertBanner>
      ) : null}

      {result ? (
        <AlertBanner tone="success">
          <p className="font-medium">Transfer batch result</p>
          <p className="mt-1 text-sm">{result}</p>
        </AlertBanner>
      ) : null}

      <div className="mb-8 grid gap-6 md:grid-cols-3 xl:grid-cols-6">
        {Object.entries(summaryQuery.data).map(([key, value]) => (
          <Card key={key}>
            <p className="text-xs font-semibold uppercase tracking-[0.05em] text-graphite">{key}</p>
            <p className="mt-2 text-2xl font-medium text-ink">{formatCurrency(value)}</p>
          </Card>
        ))}
      </div>

      <DataTable headers={['Transaction', 'Provider', 'Type', 'Amount', 'Status', 'Created']}>
        {transactionsQuery.data.map((transaction) => (
          <tr key={transaction.id}>
            <td className="px-6 py-4 font-medium text-ink">{transaction.id}</td>
            <td className="px-6 py-4 text-charcoal">{transaction.provider}</td>
            <td className="px-6 py-4 text-charcoal">{transaction.type}</td>
            <td className="px-6 py-4 text-charcoal">{formatCurrency(transaction.amount)}</td>
            <td className="px-6 py-4">
              <StatusBadge tone={transaction.status === 'SUCCEEDED' ? 'good' : transaction.status === 'PENDING' ? 'warn' : 'bad'}>
                {transaction.status}
              </StatusBadge>
            </td>
            <td className="px-6 py-4 text-charcoal">{formatDate(transaction.createdAt)}</td>
          </tr>
        ))}
      </DataTable>
    </>
  )
}
