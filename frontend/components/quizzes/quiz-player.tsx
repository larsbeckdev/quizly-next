"use client"

import * as React from "react"
import { ArrowLeftIcon, ArrowRightIcon, FlagIcon, XIcon } from "lucide-react"

import { QuestionCard } from "@/components/quizzes/question-card"
import { QuizProgressBar } from "@/components/quizzes/quiz-progress-bar"
import { QuizResult } from "@/components/quizzes/quiz-result"
import { QuizUnavailable } from "@/components/quizzes/quiz-unavailable"
import { Button } from "@/components/ui/button"
import { LinkButton } from "@/components/ui/link-button"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuiz } from "@/hooks/use-quizzes"
import type { Quiz } from "@/lib/api/types"
import {
  EMPTY_PROGRESS,
  readProgress,
  writeProgress,
} from "@/lib/quiz-progress"
import type { QuizProgress } from "@/lib/quiz-progress"

export function QuizPlayer({ quizId }: { quizId: number }) {
  const { data: quiz, isPending, isError, error } = useQuiz(quizId)

  if (isPending) {
    return (
      <div className="mx-auto grid w-full max-w-3xl gap-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>
    )
  }

  if (isError) {
    return <QuizUnavailable error={error} />
  }

  return <QuizRun quiz={quiz} />
}

function QuizRun({ quiz }: { quiz: Quiz }) {
  // The app shell renders only after hydration, so the stored progress can
  // seed the state directly.
  const [progress, setProgress] = React.useState(() => readProgress(quiz.id))
  const total = quiz.questions.length
  // Guards against a stored index from a quiz that once had more questions.
  const currentIndex = Math.min(progress.currentIndex, total - 1)
  const question = quiz.questions[currentIndex]
  const selected = question ? progress.answers[question.id] : undefined
  const isLast = currentIndex === total - 1

  // Every change is written straight away, so closing the tab at any point
  // resumes at the same question with the same answers.
  function update(next: QuizProgress) {
    setProgress(next)
    writeProgress(quiz.id, next)
  }

  function select(option: string) {
    update({
      ...progress,
      answers: { ...progress.answers, [question.id]: option },
    })
  }

  function goTo(index: number) {
    update({ ...progress, currentIndex: index })
  }

  if (progress.isFinished || !question) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <QuizResult
          quiz={quiz}
          answers={progress.answers}
          onRetry={() => update(EMPTY_PROGRESS)}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-8">
      <div className="flex items-start justify-between gap-4">
        <div className="grid flex-1 gap-1">
          <p className="truncate text-sm font-medium text-highlight">
            {quiz.title}
          </p>
          <QuizProgressBar current={currentIndex + 1} total={total} />
        </div>
        <LinkButton
          variant="ghost"
          size="icon"
          href={`/quizzes/${quiz.id}`}
          aria-label="Quiz unterbrechen"
        >
          <XIcon />
        </LinkButton>
      </div>

      {/* Keyed by question so focus and radio state start fresh each time. */}
      <QuestionCard
        key={question.id}
        question={question}
        selected={selected}
        onSelect={select}
      />

      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="h-11 px-4"
          disabled={currentIndex === 0}
          onClick={() => goTo(currentIndex - 1)}
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Zurück
        </Button>
        <Button
          type="button"
          size="lg"
          className="h-11 px-5"
          disabled={selected === undefined}
          onClick={() =>
            isLast
              ? update({ ...progress, isFinished: true })
              : goTo(currentIndex + 1)
          }
        >
          {isLast ? "Auswerten" : "Weiter"}
          {isLast ? (
            <FlagIcon data-icon="inline-end" />
          ) : (
            <ArrowRightIcon data-icon="inline-end" />
          )}
        </Button>
      </div>
    </div>
  )
}
