"use client"

import { ArrowRightIcon } from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { QuizCard } from "@/components/quizzes/quiz-card"
import { LinkButton } from "@/components/ui/link-button"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuizzes } from "@/hooks/use-quizzes"

const RECENT_COUNT = 6

export function RecentQuizzes() {
  const { data: quizzes, isPending, isError, error } = useQuizzes()

  return (
    <section aria-labelledby="recent-heading" className="grid gap-5">
      <div className="flex items-end justify-between gap-4">
        <h2 id="recent-heading" className="font-heading text-2xl font-semibold">
          Zuletzt erstellt
        </h2>
        {quizzes && quizzes.length > RECENT_COUNT ? (
          <LinkButton variant="ghost" size="md" href="/library">
            Alle Quizze
            <ArrowRightIcon data-icon="inline-end" />
          </LinkButton>
        ) : null}
      </div>

      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <p role="alert" className="text-sm text-destructive">
          {error.message}
        </p>
      ) : quizzes.length === 0 ? (
        <EmptyState
          title="Noch keine Quizze"
          description="Füge oben einen YouTube-Link ein, um dein erstes Quiz zu erstellen."
        />
      ) : (
        // The API answers newest first, so the head of the list is the most
        // recent.
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.slice(0, RECENT_COUNT).map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      )}
    </section>
  )
}
