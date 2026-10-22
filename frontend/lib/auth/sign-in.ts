import { login, logout, register } from "@/lib/api/auth"
import type { LoginPayload, RegistrationPayload } from "@/lib/api/auth"
import { clearSession, writeSession } from "@/lib/auth/session"
import type { Session } from "@/lib/auth/session"

export async function signIn(payload: LoginPayload): Promise<Session> {
  const { user } = await login(payload)
  writeSession(user)
  return user
}

/**
 * Registration answers 201 without setting cookies, so the new account is
 * signed in with the same credentials right away instead of sending the user
 * through the login form a second time.
 */
export async function signUp(payload: RegistrationPayload): Promise<Session> {
  await register(payload)
  return signIn({ username: payload.username, password: payload.password })
}

/**
 * The local hint is cleared even when the request fails: an unreachable API
 * must not keep the user stuck in a signed-in UI. The cookies then simply
 * run out on their own.
 */
export async function signOut(): Promise<void> {
  try {
    await logout()
  } finally {
    clearSession()
  }
}
