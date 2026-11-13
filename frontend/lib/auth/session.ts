/**
 * The Quizly backend keeps both JWTs in HttpOnly cookies, so no script on the
 * page can read them and there is no token to store here. What is stored is
 * the user the login answered with: it lets the header greet the user and the
 * route gates decide without a request.
 *
 * It is a hint, not proof. When the cookies have expired, the next request
 * answers 401, the refresh fails and the API client clears the hint, which
 * sends the gates back to the login page.
 */

import type { User } from "@/lib/api/types"

const STORAGE_KEY = "quizly.session"
const SESSION_CHANGED_EVENT = "quizly:session-changed"

export type Session = User

function isSession(value: unknown): value is Session {
  if (typeof value !== "object" || value === null) {
    return false
  }
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.id === "number" &&
    typeof candidate.username === "string" &&
    typeof candidate.email === "string"
  )
}

export function readSession(): Session | null {
  if (typeof window === "undefined") {
    return null
  }
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }
  try {
    const parsed: unknown = JSON.parse(raw)
    return isSession(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function writeSession(session: Session): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT))
}

export function clearSession(): void {
  window.localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT))
}

/** Subscribes to session changes from this tab and from other tabs. */
export function subscribeToSession(onChange: () => void): () => void {
  window.addEventListener(SESSION_CHANGED_EVENT, onChange)
  window.addEventListener("storage", onChange)
  return () => {
    window.removeEventListener(SESSION_CHANGED_EVENT, onChange)
    window.removeEventListener("storage", onChange)
  }
}
