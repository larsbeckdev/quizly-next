import Link from "next/link"
import { CalendarIcon } from "lucide-react"

import { DeleteQuizButton } from "@/components/quizzes/delete-quiz-button"
import type { Quiz } from "@/lib/api/types"
import { formatDate } from "@/lib/format"

type QuizCardProps = {
  quiz: Quiz
  /** The library offers deleting right on the card, the start page does not. */
  isDeletable?: boolean
}

export function QuizCard({ quiz, isDeletable = false }: QuizCardProps) {
  return (
    <article className="group relative flex flex-col gap-3 rounded-2xl border border-border bg-card/80 p-5 transition-colors hover:border-primary/60 focus-within:border-primary/60">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-heading text-lg leading-snug font-semibold">
          {/* The stretched link makes the whole card clickable while the
              delete button above it stays a separate target. */}
          <Link
            href={`/quizzes/${quiz.id}`}
            className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none"
          >
            {quiz.title}
          </Link>
        </h3>
        {isDeletable ? (
          <div className="relative z-10 -mt-1 -mr-2">
            <DeleteQuizButton quiz={quiz} />
          </div>
        ) : null}
      </div>
      <p className="line-clamp-2 text-sm text-muted-foreground">
        {quiz.description}
      </p>
      <p className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground">
        <CalendarIcon className="size-3.5" />
        <time dateTime={quiz.created_at}>{formatDate(quiz.created_at)}</time>
        <span aria-hidden>·</span>
        {quiz.questions.length} Fragen
      </p>
    </article>
  )
}
