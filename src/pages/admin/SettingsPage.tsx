import { Card, PageHeader, StatusBadge } from '../../components/ui'

export function SettingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Platform controls"
        title="System Settings"
        description="SUPER_ADMIN-only placeholder for platform fees, payment settings, Stripe settings, notification settings, and other sensitive configuration."
      />
      <Card variant="hairline">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-medium text-ink">Settings are read-only in the mock app</h2>
            <p className="mt-2 max-w-2xl text-sm leading-[1.5] text-charcoal">
              The real backend should never expose secrets or Stripe private keys here. Mutations should require
              SUPER_ADMIN, confirmation, and audit logging.
            </p>
          </div>
          <StatusBadge tone="warn">Backend required</StatusBadge>
        </div>
      </Card>
    </>
  )
}
