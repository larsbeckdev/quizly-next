"use client"

import * as React from "react"

import { EmptyState } from "@/components/empty-state"
import { QuizCard } from "@/components/quizzes/quiz-card"
import { LinkButton } from "@/components/ui/link-button"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuizzes } from "@/hooks/use-quizzes"
import type { Quiz } from "@/lib/api/types"
import { groupQuizzesByDate } from "@/lib/quiz-groups"

export function LibraryView() {
  const { data: quizzes, isPending, isError, error } = useQuizzes()
  // Taken once per visit: a reference date that moved on every render would
  // make the grouping impure.
  const [now] = React.useState(() => new Date())

  if (isPending) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-36 rounded-2xl" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <p role="alert" className="text-sm text-destructive">
        {error.message}
      </p>
    )
  }

  if (quizzes.length === 0) {
    return (
      <EmptyState
        title="Deine Bibliothek ist leer"
        description="Erstelle auf der Startseite ein Quiz aus einem YouTube-Video."
        action={<LinkButton href="/">Quiz erstellen</LinkButton>}
      />
    )
  }

  const groups = groupQuizzesByDate(quizzes, now)

  return (
    <div className="grid gap-12">
      <QuizSection id="today" title="Heute" quizzes={groups.today} />
      <QuizSection
        id="last-seven-days"
        title="Letzte 7 Tage"
        quizzes={groups.lastSevenDays}
      />
      <QuizSection id="all" title="Alle Quizze" quizzes={groups.all} />
    </div>
  )
}

type QuizSectionProps = {
  id: string
  title: string
  quizzes: Quiz[]
}

function QuizSection({ id, title, quizzes }: QuizSectionProps) {
  const headingId = `${id}-heading`

  return (
    <section aria-labelledby={headingId} className="grid gap-4">
      <h2
        id={headingId}
        className="flex items-baseline gap-2 font-heading text-xl font-semibold"
      >
        {title}
        <span className="text-sm font-normal text-muted-foreground">
          {quizzes.length}
        </span>
      </h2>
      {quizzes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Hier ist noch nichts.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} isDeletable />
          ))}
        </div>
      )}
    </section>
  )
}
