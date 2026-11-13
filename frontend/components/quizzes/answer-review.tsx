import { CheckIcon, XIcon } from "lucide-react"

import type { Question } from "@/lib/api/types"
import { cn } from "@/lib/utils"

type AnswerReviewProps = {
  questions: Question[]
  answers: Record<string, string>
}

/** Every question with the own answer next to the solution. */
export function AnswerReview({ questions, answers }: AnswerReviewProps) {
  return (
    <ol className="grid gap-4">
      {questions.map((question, index) => {
        const given = answers[question.id]
        const isCorrect = given === question.answer
        return (
          <li
            key={question.id}
            className={cn(
              "grid gap-3 rounded-2xl border-2 bg-card/80 p-5",
              isCorrect ? "border-success/50" : "border-destructive/50"
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full",
                  isCorrect
                    ? "bg-success text-primary-foreground"
                    : "bg-destructive text-white"
                )}
              >
                {isCorrect ? (
                  <CheckIcon className="size-4" aria-label="Richtig" />
                ) : (
                  <XIcon className="size-4" aria-label="Falsch" />
                )}
              </span>
              <p className="font-heading font-semibold">
                {index + 1}. {question.question_title}
              </p>
            </div>
            <dl className="grid gap-1 pl-10 text-sm">
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-muted-foreground">Deine Antwort:</dt>
                <dd
                  className={cn(
                    "font-medium",
                    isCorrect ? "text-success" : "text-destructive"
                  )}
                >
                  {given ?? "keine"}
                </dd>
              </div>
              {isCorrect ? null : (
                <div className="flex flex-wrap gap-x-2">
                  <dt className="text-muted-foreground">Richtig wäre:</dt>
                  <dd className="font-medium text-success">{question.answer}</dd>
                </div>
              )}
            </dl>
          </li>
        )
      })}
    </ol>
  )
}
