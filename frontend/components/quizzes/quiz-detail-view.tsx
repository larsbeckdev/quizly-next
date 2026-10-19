"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon, CalendarIcon, PlayIcon, RotateCcwIcon } from "lucide-react"

import { DeleteQuizButton } from "@/components/quizzes/delete-quiz-button"
import { QuizMetaEditor } from "@/components/quizzes/quiz-meta-editor"
import { QuizUnavailable } from "@/components/quizzes/quiz-unavailable"
import { QuizVideo } from "@/components/quizzes/quiz-video"
import { LinkButton } from "@/components/ui/link-button"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuiz } from "@/hooks/use-quizzes"
import { formatDateTime } from "@/lib/format"
import { readProgress } from "@/lib/quiz-progress"

export function QuizDetailView({ quizId }: { quizId: number }) {
  const router = useRouter()
  const { data: quiz, isPending, isError, error } = useQuiz(quizId)
  // The app shell only renders after hydration, so localStorage is safe to
  // read here. Read once: the player is a different page.
  const [progress] = React.useState(() => readProgress(quizId))

  if (isPending) {
    return (
      <div className="grid gap-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="aspect-video rounded-2xl" />
      </div>
    )
  }

  if (isError) {
    return <QuizUnavailable error={error} />
  }

  const answeredCount = Object.keys(progress.answers).length
  const isResumable = !progress.isFinished && answeredCount > 0

  return (
    <div className="grid gap-8">
      <div className="flex items-center justify-between gap-2">
        <LinkButton variant="ghost" size="md" href="/library" className="-ml-3">
          <ArrowLeftIcon data-icon="inline-start" />
          Bibliothek
        </LinkButton>
        <DeleteQuizButton quiz={quiz} onDeleted={() => router.replace("/library")} />
      </div>

      <QuizMetaEditor quiz={quiz} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
        <QuizVideo videoUrl={quiz.video_url} title={quiz.title} />

        <aside className="grid gap-4 rounded-2xl border border-border bg-card/80 p-6">
          <p className="font-heading text-5xl font-bold text-primary">
            {quiz.questions.length}
            <span className="ml-2 text-base font-normal text-muted-foreground">
              Fragen
            </span>
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarIcon className="size-3.5" />
            Erstellt am{" "}
            <time dateTime={quiz.created_at}>
              {formatDateTime(quiz.created_at)}
            </time>
          </p>
          {isResumable ? (
            <p className="text-sm text-highlight">
              Du hast {answeredCount} von {quiz.questions.length} Fragen
              beantwortet.
            </p>
          ) : null}
          <LinkButton
            size="lg"
            href={`/quizzes/${quiz.id}/play`}
            className="h-12 text-sm"
          >
            {isResumable ? (
              <RotateCcwIcon data-icon="inline-start" />
            ) : (
              <PlayIcon data-icon="inline-start" />
            )}
            {isResumable ? "Quiz fortsetzen" : "Quiz starten"}
          </LinkButton>
        </aside>
      </div>
    </div>
  )
}
