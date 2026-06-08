import {
  BadgeDollarSign,
  Bell,
  ClipboardCheck,
  GraduationCap,
  Home,
  LifeBuoy,
  LockKeyhole,
  LogOut,
  MessageSquareWarning,
  ScrollText,
  Settings,
  ShieldCheck,
  Star,
  Users,
  Video,
} from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { classNames } from '../lib/format'
import { Button } from '../components/ui'
import type { Permission } from '../types/admin'

const navigation = [
  { label: 'Overview', to: '/admin', icon: Home, permission: 'dashboard.read' },
  { label: 'Users', to: '/admin/users', icon: Users, permission: 'users.read' },
  { label: 'Providers', to: '/admin/providers', icon: ShieldCheck, permission: 'providers.read' },
  {
    label: 'Applications',
    to: '/admin/provider-applications',
    icon: ClipboardCheck,
    permission: 'providerApplications.review',
  },
  { label: 'Programs', to: '/admin/programs', icon: Video, permission: 'programs.read' },
  { label: 'Enrollments', to: '/admin/enrollments', icon: GraduationCap, permission: 'enrollments.read' },
  { label: 'Finance', to: '/admin/finance', icon: BadgeDollarSign, permission: 'finance.read' },
  { label: 'Support', to: '/admin/support', icon: LifeBuoy, permission: 'support.manage' },
  { label: 'Reviews', to: '/admin/reviews', icon: Star, permission: 'programs.moderate' },
  {
    label: 'Messages',
    to: '/admin/messages',
    icon: MessageSquareWarning,
    permission: 'messages.metadata.read',
  },
  { label: 'Notifications', to: '/admin/notifications', icon: Bell, permission: 'notifications.read' },
  { label: 'Admin Users', to: '/admin/admin-users', icon: LockKeyhole, permission: 'adminUsers.manage' },
  { label: 'Audit Logs', to: '/admin/audit-logs', icon: ScrollText },
  { label: 'Settings', to: '/admin/settings', icon: Settings, permission: 'systemSettings.manage' },
] satisfies Array<{
  label: string
  to: string
  icon: typeof Home
  permission?: Permission
}>

export function AdminLayout() {
  const navigate = useNavigate()
  const { session, can, switchMockAdmin, logout, isLoggingOut } = useAuth()
  const visibleNavigation = navigation.filter((item) => can(item.permission))

  async function handleLogout() {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen text-ink">
      <div className="hidden h-9 items-center justify-between bg-ink-slab px-6 text-sm text-on-ink lg:flex">
        <span>TalentShare Admin Portal</span>
        <span className="text-graphite">Mock environment</span>
      </div>

      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-white/10 bg-ink-slab text-on-ink lg:block lg:top-9">
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 p-6">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-lg bg-primary text-on-primary">
                <img src="/logo.png" alt="" className="size-7" />
              </div>
              <div>
                <p className="text-lg font-medium">TalentShare</p>
                <p className="text-xs uppercase tracking-[0.28em] text-primary-bright">Admin Portal</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {visibleNavigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin'}
                className={({ isActive }) =>
                  classNames(
                    'relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition',
                    isActive
                      ? 'text-primary-bright'
                      : 'text-on-ink/75 hover:bg-white/10 hover:text-on-ink',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className="size-4" />
                    {item.label}
                    {isActive ? (
                      <span className="absolute bottom-2 left-4 right-4 h-0.5 bg-primary-bright" />
                    ) : null}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-graphite">Signed in as</p>
            <p className="mt-2 font-medium">{session?.user?.username}</p>
            <p className="text-sm text-on-ink/75">{session?.adminRole}</p>
            <div className="mt-3 grid gap-2">
              <button
                className="rounded-md bg-white/10 px-3 py-2 text-left text-xs font-bold hover:bg-white/15"
                onClick={() => void switchMockAdmin('usr_1003')}
              >
                Switch to SUPER_ADMIN
              </button>
              <button
                className="rounded-md bg-white/10 px-3 py-2 text-left text-xs font-bold hover:bg-white/15"
                onClick={() => void switchMockAdmin('usr_1004')}
              >
                Switch to LIMITED_ADMIN
              </button>
              <button
                className="flex items-center gap-2 rounded-md bg-danger-deep/80 px-3 py-2 text-left text-xs font-bold text-on-ink hover:bg-danger-deep disabled:opacity-60"
                disabled={isLoggingOut}
                onClick={() => void handleLogout()}
              >
                <LogOut className="size-3.5" />
                {isLoggingOut ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-10 border-b border-hairline bg-canvas/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <img src="/talentshare-logo.png" alt="TalentShare" className="h-7 w-auto" />
          <div className="flex items-center gap-2">
            <select
              className="h-11 rounded-md border border-steel bg-canvas px-3 text-sm font-medium"
              onChange={(event) => {
                if (event.target.value) void switchMockAdmin(event.target.value)
              }}
              defaultValue=""
            >
              <option value="" disabled>
                Switch role
              </option>
              <option value="usr_1003">SUPER_ADMIN</option>
              <option value="usr_1004">LIMITED_ADMIN</option>
            </select>
            <Button variant="outline-ink" disabled={isLoggingOut} onClick={() => void handleLogout()}>
              Sign out
            </Button>
          </div>
        </div>
        <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {visibleNavigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) =>
                classNames(
                  'whitespace-nowrap rounded-full px-3 py-2 text-xs font-bold',
                  isActive ? 'bg-ink-slab text-on-ink' : 'bg-canvas text-ink',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="px-4 py-6 lg:ml-72 lg:mt-9 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-[1366px]">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
