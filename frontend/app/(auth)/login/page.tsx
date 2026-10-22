import type { Metadata } from "next"

import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Anmelden",
}

export default function LoginPage() {
  return (
    <>
      <h1 className="mb-6 text-center font-heading text-3xl font-bold">
        Anmelden
      </h1>
      <LoginForm />
    </>
  )
}
