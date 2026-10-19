"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { PencilIcon } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"

import { Field } from "@/components/forms/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useUpdateQuiz } from "@/hooks/use-quizzes"
import { ApiError } from "@/lib/api/client"
import type { Quiz } from "@/lib/api/types"

const metaSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Der Titel darf nicht leer sein.")
    .max(255, "Der Titel ist zu lang."),
  description: z.string().trim(),
})

type MetaValues = z.infer<typeof metaSchema>

type QuizMetaEditorProps = {
  quiz: Quiz
}

export function QuizMetaEditor({ quiz }: QuizMetaEditorProps) {
  const [isEditing, setIsEditing] = React.useState(false)

  if (!isEditing) {
    return (
      <div className="grid gap-3">
        <div className="flex items-start gap-3">
          <h1 className="flex-1 font-heading text-3xl leading-tight font-bold text-balance sm:text-4xl">
            {quiz.title}
          </h1>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => setIsEditing(true)}
          >
            <PencilIcon data-icon="inline-start" />
            Bearbeiten
          </Button>
        </div>
        {quiz.description ? (
          <p className="text-muted-foreground text-pretty">
            {quiz.description}
          </p>
        ) : null}
      </div>
    )
  }

  // Mounted fresh on every edit, so the form always starts from the
  // current values without syncing them in an effect.
  return <MetaForm quiz={quiz} onDone={() => setIsEditing(false)} />
}

function MetaForm({ quiz, onDone }: { quiz: Quiz; onDone: () => void }) {
  const updateQuiz = useUpdateQuiz(quiz.id)
  const form = useForm<MetaValues>({
    resolver: zodResolver(metaSchema),
    defaultValues: { title: quiz.title, description: quiz.description },
  })

  async function onSubmit(values: MetaValues) {
    try {
      await updateQuiz.mutateAsync(values)
      toast.success("Änderungen gespeichert.")
      onDone()
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Die Änderungen konnten nicht gespeichert werden."
      )
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid gap-4 rounded-2xl border border-border bg-card/80 p-5"
      noValidate
    >
      <Field
        label="Titel"
        htmlFor="quiz-title"
        error={form.formState.errors.title?.message}
      >
        <Input
          id="quiz-title"
          className="h-10 text-base"
          aria-invalid={Boolean(form.formState.errors.title)}
          autoFocus
          {...form.register("title")}
        />
      </Field>
      <Field label="Beschreibung" htmlFor="quiz-description">
        <Textarea
          id="quiz-description"
          rows={4}
          className="text-sm"
          {...form.register("description")}
        />
      </Field>
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="md"
          disabled={updateQuiz.isPending}
          onClick={onDone}
        >
          Abbrechen
        </Button>
        <Button type="submit" size="md" disabled={updateQuiz.isPending}>
          {updateQuiz.isPending ? "Wird gespeichert…" : "Speichern"}
        </Button>
      </div>
    </form>
  )
}
