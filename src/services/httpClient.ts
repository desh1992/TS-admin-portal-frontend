import { clearAuth, getStoredAuth } from './authStorage'

/**
 * Base URL of the backend API. Configurable via `VITE_API_BASE_URL`
 * (see `.env.example`). Defaults to empty string (same-origin) so that
 * in production the Express proxy handles `/api` requests without CORS.
 * For local dev, set `VITE_API_BASE_URL=http://localhost:3000` in `.env`.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(
  /\/$/,
  '',
)

/** Standard backend response envelope: `{ success, data?, message? }`. */
interface Envelope<T> {
  success: boolean
  data?: T
  message?: string
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  /** Attach the stored bearer token. Defaults to true. */
  auth?: boolean
  /** JSON-serializable request body. */
  body?: unknown
}

/**
 * Thin fetch wrapper that targets the backend, injects the bearer token,
 * unwraps the `{ success, data }` envelope, and normalizes errors.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, body, headers, ...rest } = options

  const finalHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(headers as Record<string, string> | undefined),
  }
  if (body !== undefined) {
    finalHeaders['Content-Type'] = 'application/json'
  }
  if (auth) {
    const stored = getStoredAuth()
    if (stored?.token) finalHeaders.Authorization = `Bearer ${stored.token}`
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: finalHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(
      `Unable to reach the API at ${API_BASE_URL}. Make sure the backend is running.`,
      0,
    )
  }

  let envelope: Envelope<T> | null
  try {
    envelope = (await response.json()) as Envelope<T>
  } catch {
    envelope = null
  }

  // A rejected token means the session is stale — clear it so the app
  // falls back to the login screen.
  if (response.status === 401 && auth) {
    clearAuth()
  }

  if (!response.ok || (envelope && envelope.success === false)) {
    throw new ApiError(
      envelope?.message ?? `Request to ${path} failed (${response.status}).`,
      response.status,
    )
  }

  return envelope?.data as T
}
