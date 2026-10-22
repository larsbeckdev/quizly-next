import { z } from "zod"

import { clearSession } from "@/lib/auth/session"

const DEFAULT_API_PORT = process.env.NEXT_PUBLIC_API_PORT || "8000"
const FALLBACK_API_BASE_URL = `http://127.0.0.1:${DEFAULT_API_PORT}/api`

/**
 * NEXT_PUBLIC_API_BASE_URL wins when it is configured. Without it the API is
 * assumed to run on NEXT_PUBLIC_API_PORT (8000 in development) of the same
 * host the page was loaded from. For Quizly that is more than a convenience:
 * the auth cookies are SameSite=Lax, so the browser only sends them when the
 * page and the API share a host name. Both values are inlined at build time.
 */
export function apiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL
  if (configured) {
    return configured.replace(/\/+$/, "")
  }
  if (typeof window === "undefined") {
    return FALLBACK_API_BASE_URL
  }
  return `${window.location.protocol}//${window.location.hostname}:${DEFAULT_API_PORT}/api`
}

type FieldErrors = Record<string, string[]>

export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: FieldErrors

  constructor(status: number, message: string, fieldErrors: FieldErrors = {}) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

function toFieldErrors(payload: unknown): FieldErrors {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return {}
  }
  const result: FieldErrors = {}
  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === "string") {
      result[key] = [value]
    } else if (Array.isArray(value)) {
      result[key] = value.map((entry) =>
        typeof entry === "string" ? entry : JSON.stringify(entry)
      )
    }
  }
  return result
}

/** Turns a DRF error body into a single sentence that can go into a toast. */
function toMessage(status: number, fieldErrors: FieldErrors): string {
  const detail = fieldErrors.detail?.[0]
  if (detail) {
    return detail
  }
  const first = Object.entries(fieldErrors)[0]
  if (first) {
    const [field, messages] = first
    return field === "non_field_errors" ? messages[0] : `${field}: ${messages[0]}`
  }
  if (status === 401) {
    return "Deine Sitzung ist abgelaufen. Bitte melde dich erneut an."
  }
  if (status === 403) {
    return "Für diese Aktion fehlt dir die Berechtigung."
  }
  return `Die Anfrage ist mit Status ${status} fehlgeschlagen.`
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE"
  body?: unknown
  /**
   * Login, registration and the refresh itself answer 401 for wrong input,
   * not for an expired session, so they must not trigger a refresh.
   */
  anonymous?: boolean
}

async function readBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null
  }
  const text = await response.text()
  if (!text) {
    return null
  }
  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

async function send(path: string, method: string, body: unknown): Promise<Response> {
  try {
    return await fetch(`${apiBaseUrl()}${path}`, {
      method,
      // The tokens live in HttpOnly cookies the page cannot read. The browser
      // only attaches them to a cross-origin request when asked to.
      credentials: "include",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(
      0,
      `Die Quizly-API unter ${apiBaseUrl()} ist nicht erreichbar. Läuft das Backend?`
    )
  }
}

let pendingRefresh: Promise<boolean> | null = null

/**
 * Requests that fail at the same moment share one refresh. A second refresh
 * would present a refresh token the first one may already have rotated out.
 */
function refreshAccessToken(): Promise<boolean> {
  pendingRefresh ??= send("/token/refresh/", "POST", undefined)
    .then((response) => response.ok)
    .catch(() => false)
    .finally(() => {
      pendingRefresh = null
    })
  return pendingRefresh
}

export async function request<S extends z.ZodTypeAny>(
  path: string,
  schema: S,
  options: RequestOptions = {}
): Promise<z.output<S>> {
  const { method = "GET", body, anonymous = false } = options

  let response = await send(path, method, body)
  if (response.status === 401 && !anonymous) {
    if (await refreshAccessToken()) {
      response = await send(path, method, body)
    }
    if (response.status === 401) {
      clearSession()
    }
  }

  const payload = await readBody(response)

  if (!response.ok) {
    const fieldErrors = toFieldErrors(payload)
    throw new ApiError(response.status, toMessage(response.status, fieldErrors), fieldErrors)
  }

  const parsed = schema.safeParse(payload)
  if (!parsed.success) {
    throw new ApiError(
      response.status,
      "Die API hat eine Antwort in einem unerwarteten Format geliefert."
    )
  }
  return parsed.data
}

/** DELETE and logout answer without a body worth reading. */
export const emptyResponseSchema = z.unknown().transform((): void => undefined)
