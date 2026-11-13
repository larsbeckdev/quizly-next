"use client"

import * as React from "react"
import Image from "next/image"
import { EyeIcon, EyeOffIcon, LibraryIcon, RotateCcwIcon } from "lucide-react"

import { AnswerReview } from "@/components/quizzes/answer-review"
import { Button } from "@/components/ui/button"
import { LinkButton } from "@/components/ui/link-button"
import type { Quiz } from "@/lib/api/types"
import { scoreQuiz } from "@/lib/quiz-score"

const GOOD_SCORE_PERCENT = 70

type QuizResultProps = {
  quiz: Quiz
  answers: Record<string, string>
  onRetry: () => void
}

export function QuizResult({ quiz, answers, onRetry }: QuizResultProps) {
  const [isReviewing, setIsReviewing] = React.useState(false)
  const score = scoreQuiz(quiz.questions, answers)
  const isGood = score.percent >= GOOD_SCORE_PERCENT

  return (
    <div className="grid gap-10">
      <section className="grid justify-items-center gap-6 rounded-3xl border border-border bg-card/80 px-6 py-10 text-center">
        <Image
          src={isGood ? "/img/robot-smile.png" : "/img/robot.png"}
          alt=""
          aria-hidden
          width={108}
          height={90}
        />
        <div className="grid gap-1">
          <p className="text-sm text-muted-foreground">{quiz.title}</p>
          <p className="font-heading text-7xl font-bold text-primary">
            {score.percent}&nbsp;%
          </p>
          <p className="text-muted-foreground">
            {score.correct} von {score.total} Fragen richtig
          </p>
        </div>
        <p className="font-heading text-xl">
          {isGood
            ? "Stark, das sitzt!"
            : "Schau dir das Video noch einmal an und versuch es erneut."}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button type="button" size="lg" className="h-11 px-5" onClick={onRetry}>
            <RotateCcwIcon data-icon="inline-start" />
            Wiederholen
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-11 px-5"
            aria-expanded={isReviewing}
            aria-controls="answer-review"
            onClick={() => setIsReviewing((value) => !value)}
          >
            {isReviewing ? (
              <EyeOffIcon data-icon="inline-start" />
            ) : (
              <EyeIcon data-icon="inline-start" />
            )}
            {isReviewing ? "Antworten ausblenden" : "Antworten anzeigen"}
          </Button>
          <LinkButton
            variant="ghost"
            size="lg"
            className="h-11 px-5"
            href="/library"
          >
            <LibraryIcon data-icon="inline-start" />
            Zur Übersicht
          </LinkButton>
        </div>
      </section>

      {isReviewing ? (
        <section id="answer-review" aria-label="Antworten" className="grid gap-4">
          <AnswerReview questions={quiz.questions} answers={answers} />
        </section>
      ) : null}
    </div>
  )
}
