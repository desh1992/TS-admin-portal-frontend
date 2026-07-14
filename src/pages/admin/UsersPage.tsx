import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ExternalLink,
  FileText,
  LockKeyhole,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldOff,
  Trash2,
  UserRound,
} from 'lucide-react'
import { adminApi } from '../../services/adminApi'
import { useAuth } from '../../context/useAuth'
import { formatDate } from '../../lib/format'
import type { User, UserDetail, UserRole, UserStatus } from '../../types/admin'
import {
  AlertBanner,
  Button,
  Card,
  DataTable,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  StatusBadge,
  TextInput,
} from '../../components/ui'

type RoleFilter = Extract<UserRole, 'seeker' | 'provider'> | 'ALL'
type StatusFilter = Extract<UserStatus, 'ACTIVE' | 'SUSPENDED' | 'DISABLED'> | 'ALL'

type UserAction =
  | { type: 'login'; user: User; locked: boolean }
  | { type: 'providerProfile'; user: User; enabled: boolean }
  | { type: 'deletion'; user: User }

export function UsersPage() {
  const [searchInput, setSearchInput] = useState('')
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const { can } = useAuth()
  const queryClient = useQueryClient()

  const usersQuery = useQuery({
    queryKey: ['admin', 'users', query, roleFilter, statusFilter],
    queryFn: () =>
      adminApi.getUsers(query, {
        role: roleFilter === 'ALL' ? undefined : roleFilter.toUpperCase(),
        status:
          statusFilter === 'ALL'
            ? undefined
            : statusFilter === 'DISABLED'
              ? 'DELETED'
              : statusFilter,
      }),
  })

  const detailQuery = useQuery({
    queryKey: ['admin', 'users', selectedId],
    queryFn: () => adminApi.getUserDetail(selectedId!),
    enabled: Boolean(selectedId),
  })

  const actionMutation = useMutation({
    mutationFn: async (action: UserAction) => {
      if (action.type === 'login') {
        return adminApi.setUserLoginAccess(action.user.id, action.locked)
      }
      if (action.type === 'providerProfile') {
        return adminApi.setProviderProfileEnabled(action.user.id, action.enabled)
      }
      return adminApi.markUserForDeletion(action.user.id)
    },
    onSuccess: (_, action) => {
      setNotice(actionSuccessMessage(action))
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })

  const users = usersQuery.data?.filter((user) => user.role !== 'admin') ?? []

  function runSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setQuery(searchInput.trim())
    setSelectedId(null)
    setNotice(null)
  }

  function confirmAction(action: UserAction) {
    if (!window.confirm(actionConfirmation(action))) return
    setNotice(null)
    actionMutation.mutate(action)
  }

  return (
    <>
      <PageHeader
        eyebrow="User operations"
        title="User profiles"
        description="Find seekers and providers, review their complete profile and documents, control login access, manage provider visibility, and mark accounts for deletion."
        action={
          <Button
            variant="outline-ink"
            disabled={usersQuery.isFetching}
            onClick={() => void usersQuery.refetch()}
          >
            <RefreshCw className={usersQuery.isFetching ? 'size-4 animate-spin' : 'size-4'} />
            Refresh
          </Button>
        }
      />

      <Card variant="hairline" className="mb-6">
        <form className="grid gap-4 lg:grid-cols-[1fr_12rem_12rem_auto]" onSubmit={runSearch}>
          <label className="grid gap-2 text-sm font-medium text-ink">
            Search users
            <span className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-graphite" />
              <TextInput
                className="pl-10"
                placeholder="Name, email, username, or user ID"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </span>
          </label>
          <label className="grid gap-2 text-sm font-medium text-ink">
            Profile type
            <select
              className="h-11 rounded-md border border-steel bg-canvas px-3 text-sm text-ink outline-none focus:border-ink"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}
            >
              <option value="ALL">Seekers & providers</option>
              <option value="seeker">Seekers</option>
              <option value="provider">Providers</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-ink">
            Account state
            <select
              className="h-11 rounded-md border border-steel bg-canvas px-3 text-sm text-ink outline-none focus:border-ink"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            >
              <option value="ALL">All states</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Login locked</option>
              <option value="DISABLED">Marked for deletion</option>
            </select>
          </label>
          <Button type="submit" className="self-end">
            Search
          </Button>
        </form>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-hairline pt-4 text-sm text-charcoal">
          <span>
            {usersQuery.isLoading ? 'Loading users…' : `${users.length} user${users.length === 1 ? '' : 's'} found`}
          </span>
          {query ? (
            <button
              type="button"
              className="font-medium text-primary underline-offset-4 hover:underline"
              onClick={() => {
                setSearchInput('')
                setQuery('')
              }}
            >
              Clear search
            </button>
          ) : null}
        </div>
      </Card>

      {notice ? <AlertBanner tone="success">{notice}</AlertBanner> : null}
      {actionMutation.error ? <ErrorState message={actionMutation.error.message} /> : null}

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)]">
        <div className="min-w-0">
          {usersQuery.isLoading ? <LoadingState /> : null}
          {usersQuery.error ? <ErrorState message={usersQuery.error.message} /> : null}
          {!usersQuery.isLoading && !usersQuery.error && users.length === 0 ? (
            <EmptyState
              title="No matching users"
              description="Try a different name, email, user ID, profile type, or account state."
            />
          ) : null}
          {users.length > 0 ? (
            <DataTable headers={['User', 'Profile', 'Access', 'Joined', 'Actions']}>
              {users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  canManage={can('users.manage')}
                  isPending={actionMutation.isPending}
                  isSelected={selectedId === user.id}
                  onSelect={() => setSelectedId(user.id)}
                  onAction={confirmAction}
                />
              ))}
            </DataTable>
          ) : null}
        </div>

        <Card className="h-fit min-w-0 overflow-hidden xl:sticky xl:top-20">
          {selectedId && detailQuery.isLoading ? <LoadingState /> : null}
          {selectedId && detailQuery.error ? <ErrorState message={detailQuery.error.message} /> : null}
          {selectedId && detailQuery.data ? (
            <UserProfilePanel user={detailQuery.data} onClose={() => setSelectedId(null)} />
          ) : null}
          {!selectedId ? (
            <div className="py-8 text-center">
              <div className="mx-auto grid size-14 place-items-center rounded-full bg-primary-soft text-primary">
                <UserRound className="size-6" />
              </div>
              <h2 className="mt-4 text-xl font-medium text-ink">Select a user</h2>
              <p className="mt-2 text-sm leading-6 text-charcoal">
                Open a profile to review identity details, portfolio links, supporting documents, and account activity.
              </p>
            </div>
          ) : null}
        </Card>
      </div>
    </>
  )
}

function UserRow({
  user,
  canManage,
  isPending,
  isSelected,
  onSelect,
  onAction,
}: {
  user: User
  canManage: boolean
  isPending: boolean
  isSelected: boolean
  onSelect: () => void
  onAction: (action: UserAction) => void
}) {
  const markedForDeletion = user.status === 'DISABLED' || Boolean(user.deletionRequestedAt)
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username

  return (
    <tr className={isSelected ? 'align-top bg-primary-soft/40' : 'align-top'}>
      <td className="max-w-64 px-5 py-4">
        <p className="break-words font-medium text-ink">{displayName}</p>
        <p className="break-all text-charcoal">{user.email}</p>
        <p className="mt-1 break-all text-xs text-graphite">{user.publicId ?? user.id}</p>
      </td>
      <td className="px-5 py-4">
        <StatusBadge tone={user.role === 'provider' ? 'info' : 'neutral'}>{user.role}</StatusBadge>
        {user.role === 'provider' ? (
          <p className="mt-2 text-xs text-charcoal">
            Profile {user.providerProfileEnabled === false ? 'disabled' : 'enabled'}
          </p>
        ) : null}
      </td>
      <td className="px-5 py-4">
        <StatusBadge tone={markedForDeletion ? 'bad' : user.loginLocked ? 'warn' : 'good'}>
          {markedForDeletion ? 'Deletion marked' : user.loginLocked ? 'Login locked' : 'Active'}
        </StatusBadge>
        <p className="mt-2 text-xs text-charcoal">{user.verificationStatus.toLowerCase()}</p>
      </td>
      <td className="px-5 py-4 text-charcoal">{formatDate(user.joinedAt)}</td>
      <td className="px-5 py-4">
        <div className="flex min-w-52 flex-wrap gap-2">
          <Button
            variant="primary"
            className="h-9 rounded-full px-4 text-xs"
            onClick={onSelect}
          >
            View profile
          </Button>
          {canManage ? (
            <>
              <Button
                variant={user.loginLocked ? 'primary' : 'outline-ink'}
                className="h-9 rounded-full px-4 text-xs"
                disabled={isPending || markedForDeletion}
                onClick={() => onAction({ type: 'login', user, locked: !user.loginLocked })}
              >
                <LockKeyhole className="size-3.5" />
                {user.loginLocked ? 'Unlock login' : 'Lock login'}
              </Button>
              {user.role === 'provider' ? (
                <Button
                  variant={user.providerProfileEnabled === false ? 'primary' : 'outline-ink'}
                  className="h-9 rounded-full px-4 text-xs"
                  disabled={isPending || markedForDeletion}
                  onClick={() =>
                    onAction({
                      type: 'providerProfile',
                      user,
                      enabled: user.providerProfileEnabled === false,
                    })
                  }
                >
                  {user.providerProfileEnabled === false ? (
                    <ShieldCheck className="size-3.5" />
                  ) : (
                    <ShieldOff className="size-3.5" />
                  )}
                  {user.providerProfileEnabled === false ? 'Enable profile' : 'Disable profile'}
                </Button>
              ) : null}
              <Button
                variant="outline-danger"
                className="h-9 rounded-full px-4 text-xs"
                disabled={isPending || markedForDeletion}
                onClick={() => onAction({ type: 'deletion', user })}
              >
                <Trash2 className="size-3.5" />
                Mark for deletion
              </Button>
            </>
          ) : null}
        </div>
      </td>
    </tr>
  )
}

function UserProfilePanel({ user, onClose }: { user: UserDetail; onClose: () => void }) {
  const documentMutation = useMutation({
    mutationFn: adminApi.getUserDocumentUrl,
    onSuccess: (url) => window.open(url, '_blank', 'noopener,noreferrer'),
  })
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username

  return (
    <div className="space-y-6 text-sm">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {user.avatar ? (
            <img src={user.avatar} alt="" className="size-12 rounded-full object-cover" />
          ) : (
            <div className="grid size-12 place-items-center rounded-full bg-primary-soft text-primary">
              <UserRound className="size-5" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Complete profile</p>
            <h2 className="mt-1 break-words text-xl font-medium text-ink">{displayName}</h2>
            <p className="break-all text-charcoal">@{user.username}</p>
          </div>
        </div>
        <button type="button" className="text-sm font-medium text-primary" onClick={onClose}>
          Close
        </button>
      </div>

      <ProfileSection title="Identity & contact">
        <ProfileValue label="User ID" value={user.publicId ?? user.id} />
        <ProfileValue label="Email" value={user.email} />
        <ProfileValue label="Phone" value={user.phone} />
        <ProfileValue label="Location" value={user.location} />
        <ProfileValue label="Professional title" value={user.professionalTitle} />
        <ProfileValue label="Joined" value={formatDate(user.joinedAt)} />
        <ProfileValue label="Last login" value={user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'} />
      </ProfileSection>

      <ProfileSection title="About">
        <p className="whitespace-pre-wrap break-words leading-6 text-charcoal [overflow-wrap:anywhere]">
          {user.bio || 'No bio provided.'}
        </p>
      </ProfileSection>

      <ProfileSection title="Portfolio & supporting documents">
        {user.providerApplications.flatMap((application) =>
          application.portfolioUrl ? [{ id: application.id, url: application.portfolioUrl }] : [],
        ).map((portfolio) => (
          <a
            key={portfolio.id}
            href={portfolio.url}
            target="_blank"
            rel="noreferrer"
            className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-hairline p-3 font-medium text-primary"
          >
            <span className="min-w-0 break-words [overflow-wrap:anywhere]">Portfolio link</span>
            <ExternalLink className="size-4" />
          </a>
        ))}
        {user.media.map((file) => (
          <button
            key={file.id}
            type="button"
            className="flex w-full items-center justify-between rounded-lg border border-hairline p-3 text-left text-ink hover:border-primary"
            disabled={documentMutation.isPending}
            onClick={() => documentMutation.mutate(file.id)}
          >
            <span className="flex min-w-0 items-center gap-3">
              <FileText className="size-4 shrink-0 text-primary" />
              <span className="min-w-0">
                <span className="block truncate font-medium">
                  {file.fileName || file.s3Key.split('/').pop() || 'Supporting document'}
                </span>
                <span className="block text-xs text-charcoal">
                  {file.contentType} · {formatDate(file.createdAt)}
                </span>
              </span>
            </span>
            <ExternalLink className="size-4 shrink-0 text-primary" />
          </button>
        ))}
        {user.media.length === 0 &&
        !user.providerApplications.some((application) => application.portfolioUrl) ? (
          <p className="text-charcoal">No portfolio links or supporting documents uploaded.</p>
        ) : null}
        {documentMutation.error ? (
          <p className="text-sm font-medium text-danger-deep">{documentMutation.error.message}</p>
        ) : null}
      </ProfileSection>

      {user.providerApplications.length > 0 ? (
        <ProfileSection title="Provider profile">
          {user.providerApplications.map((application) => (
            <div key={application.id} className="rounded-lg bg-cloud p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="min-w-0 break-words font-medium text-ink [overflow-wrap:anywhere]">
                  {application.headline}
                </p>
                <StatusBadge tone={application.status === 'APPROVED' ? 'good' : 'neutral'}>
                  {application.status}
                </StatusBadge>
              </div>
              {application.skills?.length ? (
                <p className="mt-2 break-words text-charcoal [overflow-wrap:anywhere]">
                  {application.skills.join(', ')}
                </p>
              ) : null}
              {application.experience ? (
                <p className="mt-2 whitespace-pre-wrap break-words leading-6 text-charcoal [overflow-wrap:anywhere]">
                  {application.experience}
                </p>
              ) : null}
            </div>
          ))}
        </ProfileSection>
      ) : null}

      <ProfileSection title="Account activity">
        <ProfileValue label="Programs published" value={String(user.programs.length)} />
        <ProfileValue label="Program enrollments" value={String(user.enrollments.length)} />
        <ProfileValue label="Support requests" value={String(user.supportTickets.length)} />
      </ProfileSection>
    </div>
  )
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="min-w-0 border-t border-hairline pt-5">
      <h3 className="mb-3 break-words font-medium text-ink">{title}</h3>
      <div className="min-w-0 space-y-2">{children}</div>
    </section>
  )
}

function ProfileValue({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-1 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:gap-3">
      <span className="text-graphite">{label}</span>
      <span className="min-w-0 break-words font-medium text-ink [overflow-wrap:anywhere]">
        {value || 'Not provided'}
      </span>
    </div>
  )
}

function actionConfirmation(action: UserAction) {
  const name = [action.user.firstName, action.user.lastName].filter(Boolean).join(' ') || action.user.username
  if (action.type === 'login') {
    return `${action.locked ? 'Lock' : 'Unlock'} login access for ${name}?`
  }
  if (action.type === 'providerProfile') {
    return `${action.enabled ? 'Enable' : 'Disable'} the provider profile for ${name}? Login access will not be changed.`
  }
  return `Mark ${name} for deletion? They will no longer be able to sign in.`
}

function actionSuccessMessage(action: UserAction) {
  const name = [action.user.firstName, action.user.lastName].filter(Boolean).join(' ') || action.user.username
  if (action.type === 'login') {
    return `${name}'s login access is now ${action.locked ? 'locked' : 'unlocked'}.`
  }
  if (action.type === 'providerProfile') {
    return `${name}'s provider profile is now ${action.enabled ? 'enabled' : 'disabled'}.`
  }
  return `${name} was marked for deletion.`
}
