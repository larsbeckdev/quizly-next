import { emptyResponseSchema, request } from "@/lib/api/client"
import { loginResponseSchema } from "@/lib/api/types"
import type { LoginResponse } from "@/lib/api/types"

export type LoginPayload = {
  username: string
  password: string
}

export type RegistrationPayload = {
  username: string
  email: string
  password: string
  confirmed_password: string
}

export function login(payload: LoginPayload): Promise<LoginResponse> {
  return request("/login/", loginResponseSchema, {
    method: "POST",
    body: payload,
    anonymous: true,
  })
}

export function register(payload: RegistrationPayload): Promise<void> {
  return request("/register/", emptyResponseSchema, {
    method: "POST",
    body: payload,
    anonymous: true,
  })
}

/**
 * Blacklists the refresh token and deletes both cookies on the server. The
 * endpoint needs a valid access token, so it goes through the refresh like
 * any other request: otherwise a logout after 15 idle minutes would leave
 * the refresh token usable.
 */
export function logout(): Promise<void> {
  return request("/logout/", emptyResponseSchema, { method: "POST" })
}
