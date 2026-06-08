import { classNames } from '../lib/format'

export function ChevronDecoration({
  side,
  className,
}: {
  side: 'left' | 'right'
  className?: string
}) {
  return (
    <div
      aria-hidden
      className={classNames(
        'pointer-events-none absolute top-1/2 hidden h-[72%] w-10 -translate-y-1/2 bg-primary md:block lg:w-14',
        side === 'left' && 'left-0 -translate-x-[38%] -skew-x-[26deg]',
        side === 'right' && 'right-0 translate-x-[38%] skew-x-[26deg]',
        className,
      )}
    />
  )
}
