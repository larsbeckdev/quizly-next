"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { UserPlusIcon } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"

import { PasswordInput } from "@/components/auth/password-input"
import { Field } from "@/components/forms/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ApiError } from "@/lib/api/client"
import { signUp } from "@/lib/auth/sign-in"

const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, "Bitte gib einen Benutzernamen ein.")
      .max(150, "Der Benutzername ist zu lang."),
    email: z
      .string()
      .min(1, "Bitte gib deine E-Mail-Adresse ein.")
      .email("Das sieht nicht nach einer E-Mail-Adresse aus."),
    password: z.string().min(8, "Das Passwort braucht mindestens 8 Zeichen."),
    confirmed_password: z.string().min(1, "Bitte wiederhole das Passwort."),
  })
  .refine((values) => values.password === values.confirmed_password, {
    path: ["confirmed_password"],
    message: "Die Passwörter stimmen nicht überein.",
  })

type RegisterValues = z.infer<typeof registerSchema>

const FIELDS: (keyof RegisterValues)[] = [
  "username",
  "email",
  "password",
  "confirmed_password",
]

export function RegisterForm() {
  const router = useRouter()
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmed_password: "",
    },
  })

  async function onSubmit(values: RegisterValues) {
    try {
      await signUp(values)
      toast.success("Willkommen bei Quizly!")
      router.replace("/")
    } catch (error) {
      if (!(error instanceof ApiError)) {
        toast.error("Die Registrierung ist fehlgeschlagen.")
        return
      }
      // Django's password validators run in the serializer's validate(), so
      // their complaints arrive as non_field_errors. They are about the
      // password all the same.
      const { non_field_errors: passwordErrors, ...fieldErrors } =
        error.fieldErrors
      const errors: Record<string, string[] | undefined> = {
        password: passwordErrors,
        ...fieldErrors,
      }
      let isHandled = false
      for (const field of FIELDS) {
        const message = errors[field]?.[0]
        if (message) {
          form.setError(field, { message })
          isHandled = true
        }
      }
      if (!isHandled) {
        toast.error(error.message)
      }
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
          label="E-Mail"
          htmlFor="email"
          error={form.formState.errors.email?.message}
        >
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="du@example.com"
            className="h-10 text-sm"
            aria-invalid={Boolean(form.formState.errors.email)}
            {...form.register("email")}
          />
        </Field>

        <Field
          label="Passwort"
          htmlFor="password"
          hint="Mindestens 8 Zeichen, nicht nur Ziffern."
          error={form.formState.errors.password?.message}
        >
          <PasswordInput
            id="password"
            autoComplete="new-password"
            className="h-10"
            aria-invalid={Boolean(form.formState.errors.password)}
            {...form.register("password")}
          />
        </Field>

        <Field
          label="Passwort wiederholen"
          htmlFor="confirmed_password"
          error={form.formState.errors.confirmed_password?.message}
        >
          <PasswordInput
            id="confirmed_password"
            autoComplete="new-password"
            className="h-10"
            aria-invalid={Boolean(form.formState.errors.confirmed_password)}
            {...form.register("confirmed_password")}
          />
        </Field>

        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="h-11 w-full"
        >
          <UserPlusIcon data-icon="inline-start" />
          {form.formState.isSubmitting
            ? "Konto wird erstellt…"
            : "Konto erstellen"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Schon registriert?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Zur Anmeldung
        </Link>
      </p>
    </div>
  )
}
