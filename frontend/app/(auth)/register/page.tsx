import type { Metadata } from "next"

import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "Registrieren",
}

export default function RegisterPage() {
  return (
    <>
      <h1 className="mb-6 text-center font-heading text-3xl font-bold">
        Registrieren
      </h1>
      <RegisterForm />
    </>
  )
}
