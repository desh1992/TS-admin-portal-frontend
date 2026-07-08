import { AlertTriangle, ArrowUpRight, Clock, ShieldCheck } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../services/adminApi'
import {
  Card,
  ErrorState,
  ListRow,
  LoadingState,
  MetricCard,
  PageHeader,
  StatusBadge,
} from '../../components/ui'

export function AdminOverview() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: adminApi.getOverview,
  })

  if (isLoading) return <LoadingState />
  if (error || !data) return <ErrorState message={error?.message} />

  return (
    <>
      <PageHeader
        eyebrow="Command center"
        title="Admin Overview"
        description="Operational pulse for users, providers, revenue, support, content risk, and provider application queues."
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {data.metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            delta={metric.delta}
            tone={metric.tone}
            icon={ArrowUpRight}
          />
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <div className="mb-4 flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-lg bg-cloud text-primary">
              <Clock className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-ink">Recent Activity</h2>
              <p className="text-sm text-charcoal">Every admin mutation should create an audit event.</p>
            </div>
          </div>
          <div className="space-y-3">
            {data.activity.map((item) => (
              <ListRow
                key={item.id}
                title={item.actor}
                subtitle={
                  <>
                    {item.action} <span className="font-medium text-ink">{item.resource}</span>
                  </>
                }
                meta={new Date(item.timestamp).toLocaleString()}
              />
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-lg bg-warn-soft text-warn-deep">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-ink">Alerts</h2>
              <p className="text-sm text-charcoal">Work that needs admin attention.</p>
            </div>
          </div>
          <div className="space-y-3">
            {data.alerts.map((alert) => (
              <ListRow
                key={alert.id}
                title={alert.title}
                subtitle={alert.description}
                meta={alert.severity}
              >
                <StatusBadge tone={alert.severity === 'critical' ? 'bad' : alert.severity === 'warning' ? 'warn' : 'info'}>
                  {alert.severity}
                </StatusBadge>
              </ListRow>
            ))}
          </div>
        </Card>
      </div>

      <Card variant="dark" className="mt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-lg bg-primary text-on-primary">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-medium">Connected to TalentShare API</h2>
              <p className="mt-2 text-sm text-on-ink/80">
                User management, applications, programs, reports, support tickets, and messaging are backed by the live backend with audit logging.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </>
  )
}
