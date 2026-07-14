import type { LucideIcon } from 'lucide-react'
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { classNames } from '../lib/format'

export function Card({
  children,
  className,
  variant = 'product',
}: {
  children: ReactNode
  className?: string
  variant?: 'product' | 'feature' | 'dark' | 'hairline'
}) {
  return (
    <section
      className={classNames(
        'rounded-xl p-6',
        variant === 'product' && 'bg-paper shadow-[var(--shadow-soft-lift)]',
        variant === 'feature' && 'bg-cloud p-8',
        variant === 'dark' && 'bg-ink-slab p-8 text-on-ink',
        variant === 'hairline' && 'border border-hairline bg-paper',
        className,
      )}
    >
      {children}
    </section>
  )
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow ? (
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-primary">{eyebrow}</p>
        ) : null}
        <h1 className="text-3xl font-medium tracking-tight text-ink md:text-5xl">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-charcoal md:text-base">{description}</p>
      </div>
      {action}
    </div>
  )
}

export function SectionTitle({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-medium text-ink">{title}</h2>
      {description ? <p className="mt-2 text-sm leading-6 text-charcoal">{description}</p> : null}
    </div>
  )
}

type BadgeTone = 'good' | 'warn' | 'bad' | 'neutral' | 'info'

export function StatusBadge({ children, tone = 'neutral' }: { children: ReactNode; tone?: BadgeTone }) {
  return <span className={badgeClass(tone)}>{children}</span>
}

function badgeClass(tone: BadgeTone) {
  return classNames(
    'inline-flex rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wide',
    tone === 'good' && 'bg-success-soft text-success-deep',
    tone === 'warn' && 'bg-warn-soft text-warn-deep',
    tone === 'bad' && 'bg-danger-soft text-danger-deep',
    tone === 'info' && 'bg-info-soft text-info-deep',
    tone === 'neutral' && 'bg-cloud text-charcoal',
  )
}

export function IconTile({ icon: Icon, tone = 'neutral' }: { icon: LucideIcon; tone?: BadgeTone }) {
  return (
    <div
      className={classNames(
        'grid size-11 place-items-center rounded-lg',
        tone === 'good' && 'bg-success-soft text-success-deep',
        tone === 'warn' && 'bg-warn-soft text-warn-deep',
        tone === 'bad' && 'bg-danger-soft text-danger-deep',
        tone === 'info' && 'bg-info-soft text-info-deep',
        tone === 'neutral' && 'bg-cloud text-primary',
      )}
    >
      <Icon className="size-5" />
    </div>
  )
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card variant="hairline" className="border-dashed py-12 text-center">
      <h3 className="text-lg font-medium text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-charcoal">{description}</p>
    </Card>
  )
}

export function ErrorState({ message = 'Something went wrong.' }: { message?: string }) {
  return (
    <Card className="border-danger/30 bg-danger-soft text-danger-deep">
      <h3 className="font-medium">Unable to load this module</h3>
      <p className="mt-1 text-sm">{message}</p>
    </Card>
  )
}

export function ForbiddenState({ message }: { message?: string }) {
  return (
    <Card className="border-primary/20 bg-primary-soft text-primary-deep">
      <h3 className="font-medium">Forbidden</h3>
      <p className="mt-1 text-sm">
        {message ?? 'Your admin membership does not include permission for this module.'}
      </p>
    </Card>
  )
}

export function LoadingState() {
  return (
    <div className="grid gap-4">
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-24 animate-pulse rounded-xl bg-cloud" />
      ))}
    </div>
  )
}

export function DataTable({
  headers,
  children,
}: {
  headers: string[]
  children: ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-xl bg-paper shadow-[var(--shadow-soft-lift)]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-hairline text-left text-sm">
          <thead className="bg-cloud text-xs font-bold uppercase tracking-wider text-graphite">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-5 py-3">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">{children}</tbody>
        </table>
      </div>
    </div>
  )
}

export function Button({
  children,
  variant = 'primary',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ink' | 'outline' | 'outline-ink' | 'danger' | 'outline-danger'
}) {
  return (
    <button
      className={classNames(
        'inline-flex h-11 items-center justify-center gap-2 rounded-md px-6 text-sm font-semibold uppercase tracking-[0.07em] transition disabled:cursor-not-allowed disabled:bg-steel disabled:text-on-primary',
        variant === 'primary' && 'bg-primary text-on-primary active:bg-primary-deep',
        variant === 'ink' && 'bg-ink-slab text-on-primary',
        variant === 'outline' && 'border border-primary bg-canvas text-primary',
        variant === 'outline-ink' && 'border border-ink bg-canvas text-ink',
        variant === 'danger' && 'bg-danger-deep text-on-primary',
        variant === 'outline-danger' && 'border border-danger-deep bg-canvas text-danger-deep',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function TextInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={classNames(
        'h-11 w-full rounded-md border border-steel bg-canvas px-4 text-base text-ink outline-none focus:border-ink',
        className,
      )}
      {...props}
    />
  )
}

export function TextArea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={classNames(
        'min-h-32 w-full rounded-md border border-steel bg-canvas px-4 py-3 text-base text-ink outline-none focus:border-ink',
        className,
      )}
      {...props}
    />
  )
}

export function FilterChip({
  children,
  active = false,
  onClick,
}: {
  children: ReactNode
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        'rounded-full px-5 py-2 text-sm font-medium transition',
        active ? 'bg-ink-slab text-on-ink' : 'bg-canvas text-ink',
      )}
    >
      {children}
    </button>
  )
}

export function AlertBanner({
  children,
  tone = 'info',
}: {
  children: ReactNode
  tone?: 'info' | 'warn' | 'success'
}) {
  return (
    <Card
      variant="hairline"
      className={classNames(
        'mb-6',
        tone === 'info' && 'border-info/20 bg-info-soft text-info-deep',
        tone === 'warn' && 'border-warn-deep/20 bg-warn-soft text-warn-deep',
        tone === 'success' && 'border-success-deep/20 bg-success-soft text-success-deep',
      )}
    >
      {children}
    </Card>
  )
}

export function MetricCard({
  label,
  value,
  delta,
  tone = 'neutral',
  icon: Icon,
}: {
  label: string
  value: string
  delta: string
  tone?: BadgeTone
  icon: LucideIcon
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-charcoal">{label}</p>
          <p className="mt-3 text-3xl font-medium tracking-tight text-ink">{value}</p>
        </div>
        <IconTile icon={Icon} tone={tone} />
      </div>
      <p className="mt-4 text-sm font-medium text-charcoal">{delta}</p>
    </Card>
  )
}

export function ListRow({
  title,
  subtitle,
  meta,
  children,
}: {
  title: string
  subtitle?: ReactNode
  meta?: string
  children?: ReactNode
}) {
  return (
    <div className="rounded-lg border border-hairline bg-cloud p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-ink">{title}</p>
          {subtitle ? <p className="mt-1 text-sm leading-6 text-charcoal">{subtitle}</p> : null}
          {meta ? (
            <p className="mt-2 text-xs font-bold uppercase tracking-wide text-graphite">{meta}</p>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  )
}
