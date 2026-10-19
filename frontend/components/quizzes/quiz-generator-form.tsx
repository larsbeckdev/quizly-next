"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { SparklesIcon } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"

import { GeneratingOverlay } from "@/components/quizzes/generating-overlay"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCreateQuiz } from "@/hooks/use-quizzes"
import { ApiError } from "@/lib/api/client"
import { youtubeVideoId } from "@/lib/youtube"

const generatorSchema = z.object({
  url: z
    .string()
    .min(1, "Bitte füge einen YouTube-Link ein.")
    .refine((value) => youtubeVideoId(value) !== null, {
      message: "Das ist kein gültiger YouTube-Link.",
    }),
})

type GeneratorValues = z.infer<typeof generatorSchema>

export function QuizGeneratorForm() {
  const router = useRouter()
  const createQuiz = useCreateQuiz()
  const form = useForm<GeneratorValues>({
    resolver: zodResolver(generatorSchema),
    defaultValues: { url: "" },
  })

  async function onSubmit({ url }: GeneratorValues) {
    try {
      const quiz = await createQuiz.mutateAsync(url.trim())
      form.reset()
      toast.success("Dein Quiz ist fertig.")
      router.push(`/quizzes/${quiz.id}`)
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.fieldErrors.url?.[0] ?? error.message
          : "Das Quiz konnte nicht erstellt werden."
      form.setError("url", { message })
    }
  }

  const error = form.formState.errors.url?.message

  return (
    <>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-2"
        noValidate
      >
        <label htmlFor="video-url" className="sr-only">
          YouTube-Link
        </label>
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/80 p-2 shadow-lg focus-within:border-primary sm:flex-row">
          <Input
            id="video-url"
            type="url"
            inputMode="url"
            placeholder="https://www.youtube.com/watch?v=…"
            autoComplete="off"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "video-url-message" : undefined}
            className="h-12 flex-1 border-0 bg-transparent text-base shadow-none focus-visible:ring-0 dark:bg-transparent"
            {...form.register("url")}
          />
          <Button
            type="submit"
            size="lg"
            disabled={createQuiz.isPending}
            className="h-12 px-6 text-sm"
          >
            <SparklesIcon data-icon="inline-start" />
            Quiz erstellen
          </Button>
        </div>
        {error ? (
          <p
            id="video-url-message"
            role="alert"
            className="px-2 text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}
      </form>

      {createQuiz.isPending ? <GeneratingOverlay /> : null}
    </>
  )
}
