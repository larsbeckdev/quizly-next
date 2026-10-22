"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LogInIcon } from "lucide-react"
import { z } from "zod"

import { PasswordInput } from "@/components/auth/password-input"
import { Field } from "@/components/forms/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ApiError } from "@/lib/api/client"
import { signIn } from "@/lib/auth/sign-in"

const loginSchema = z.object({
  username: z.string().min(1, "Bitte gib deinen Benutzernamen ein."),
  password: z.string().min(1, "Bitte gib dein Passwort ein."),
})

type LoginValues = z.infer<typeof loginSchema>

/**
 * A failed login names neither field: saying the password is wrong would
 * confirm that the username exists. The backend is vague for the same
 * reason.
 */
const INVALID_CREDENTIALS = "Benutzername oder Passwort ist falsch."

export function LoginForm() {
  const router = useRouter()
  const [formError, setFormError] = React.useState<string | null>(null)
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  })

  async function onSubmit(values: LoginValues) {
    setFormError(null)
    try {
      await signIn(values)
      router.replace("/")
    } catch (error) {
      const isRejected =
        error instanceof ApiError && (error.status === 400 || error.status === 401)
      setFormError(
        isRejected
          ? INVALID_CREDENTIALS
          : error instanceof ApiError
            ? error.message
            : "Die Anmeldung ist fehlgeschlagen. Bitte versuche es erneut."
      )
    }
  }

  return (
    <div className="grid gap-6">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-5"
        noValidate
      >
        <Field
          label="Benutzername"
          htmlFor="username"
          error={form.formState.errors.username?.message}
        >
          <Input
            id="username"
            autoComplete="username"
            className="h-10 text-sm"
            aria-invalid={Boolean(form.formState.errors.username)}
            {...form.register("username")}
          />
        </Field>

        <Field
          label="Passwort"
          htmlFor="password"
          error={form.formState.errors.password?.message}
        >
          <PasswordInput
            id="password"
            autoComplete="current-password"
            className="h-10"
            aria-invalid={Boolean(form.formState.errors.password)}
            {...form.register("password")}
          />
        </Field>

        {formError ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {formError}
          </p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="h-11 w-full"
        >
          <LogInIcon data-icon="inline-start" />
          {form.formState.isSubmitting ? "Anmelden…" : "Anmelden"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Noch kein Konto?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Jetzt registrieren
        </Link>
      </p>
    </div>
  )
}
