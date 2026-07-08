import { useState } from 'react'
import { Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDecoration } from '../components/ChevronDecoration'
import { Button, Card, LoadingState, TextInput } from '../components/ui'
import { useAuth } from '../context/useAuth'
import { DEMO_CREDENTIALS } from '../services/authApi'
import { getRememberedIdentifier } from '../services/authStorage'

export function LoginPage() {
  const navigate = useNavigate()
  const { session, isLoading, login, isLoggingIn, loginError } = useAuth()
  const location = useLocation()
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/admin'

  const [identifier, setIdentifier] = useState(() => getRememberedIdentifier())
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(() => Boolean(getRememberedIdentifier()))
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const displayError = formError ?? loginError?.message ?? null

  if (isLoading) return <LoadingState />

  if (session?.isAdmin) {
    return <Navigate to={redirectTo} replace />
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    if (!identifier.trim()) {
      setFormError('Enter your email or username.')
      return
    }
    if (!password) {
      setFormError('Enter your password.')
      return
    }

    try {
      await login(identifier, password, rememberMe)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to sign in.')
    }
  }

  return (
    <main className="min-h-screen">
      <div className="flex h-9 items-center justify-between bg-ink-slab px-6 text-sm text-on-ink">
        <span>TalentShare Admin Portal</span>
        <span className="text-graphite">Secure sign-in</span>
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-36px)] max-w-[1366px] items-center px-4 py-12 md:px-8">
        <div className="mx-auto grid w-full max-w-5xl items-stretch gap-8 lg:grid-cols-2">
          <div className="relative">
            <ChevronDecoration side="left" />
            <ChevronDecoration side="right" />
            <Card className="relative z-10 flex min-h-[560px] flex-col p-8 md:p-10">
              <div>
                <img src="/talentshare-logo.png" alt="TalentShare" className="h-10 w-auto" />
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.24em] text-primary">Admin access</p>
                <h1 className="mt-2 text-4xl font-medium tracking-tight text-ink">Sign in to TalentShare</h1>
                <p className="mt-3 text-sm leading-6 text-charcoal">
                  Use your admin email or username and password to access the admin dashboard.
                </p>
              </div>

              <form className="mt-6 flex flex-1 flex-col gap-4" onSubmit={(event) => void handleSubmit(event)}>
                <label className="grid gap-2 text-sm font-medium text-ink">
                  Email or username
                  <TextInput
                    autoComplete="username"
                    placeholder="admin@talentshare.com"
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-ink">
                  Password
                  <div className="relative">
                    <TextInput
                      autoComplete="current-password"
                      type={showPassword ? 'text' : 'password'}
                      className="pr-12"
                      placeholder="Enter password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-graphite hover:text-primary"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </label>

                <label className="flex items-center gap-3 text-sm font-medium text-charcoal">
                  <input
                    type="checkbox"
                    className="size-4 rounded-sm border-steel accent-primary"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                  />
                  Remember me on this device
                </label>

                {displayError ? (
                  <p className="rounded-md border border-danger/30 bg-danger-soft px-4 py-3 text-sm font-medium text-danger-deep">
                    {displayError}
                  </p>
                ) : null}

                <div className="mt-auto pt-2">
                  <Button type="submit" disabled={isLoggingIn} className="w-full">
                    {isLoggingIn ? 'Signing in...' : 'Sign in'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          <Card variant="dark" className="flex min-h-[560px] flex-col p-8 md:p-10">
            <div className="grid size-12 place-items-center rounded-lg bg-primary text-on-primary">
              <LockKeyhole className="size-5" />
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.28em] text-primary-bright">Demo credentials</p>
            <p className="mt-4 text-sm leading-6 text-on-ink/80">
              This portal is connected to the TalentShare API. Sign in with an admin account. Check
              Remember me to auto-login on the next visit.
            </p>

            <div className="mt-6 flex flex-1 flex-col justify-center gap-4">
              {DEMO_CREDENTIALS.map((account) => (
                <div key={account.identifier} className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <p className="font-medium text-primary-bright">{account.label}</p>
                  <p className="mt-2 text-sm text-on-ink/80">ID: {account.identifier}</p>
                  <p className="text-sm text-on-ink/80">Password: {account.password}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
}
