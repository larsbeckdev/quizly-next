"use client"

import { CheckIcon } from "lucide-react"

import type { Question } from "@/lib/api/types"
import { cn } from "@/lib/utils"

const OPTION_LETTERS = ["A", "B", "C", "D"]

type QuestionCardProps = {
  question: Question
  selected: string | undefined
  onSelect: (option: string) => void
}

/**
 * Real radio inputs under the styled labels: arrow keys move between the
 * options and screen readers announce "1 of 4" without extra ARIA.
 */
export function QuestionCard({ question, selected, onSelect }: QuestionCardProps) {
  const name = `question-${question.id}`

  return (
    <fieldset className="grid gap-6">
      <legend className="mb-6 font-heading text-2xl leading-snug font-semibold text-balance sm:text-3xl">
        {question.question_title}
      </legend>

      <div className="grid gap-3 sm:grid-cols-2">
        {question.question_options.map((option, index) => {
          const isSelected = option === selected
          return (
            <label
              key={option}
              className={cn(
                "flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/40",
                isSelected
                  ? "border-primary bg-brand-soft text-brand-soft-foreground"
                  : "border-border bg-card/80 hover:border-primary/50"
              )}
            >
              <input
                type="radio"
                name={name}
                value={option}
                checked={isSelected}
                onChange={() => onSelect(option)}
                className="sr-only"
              />
              <span
                aria-hidden
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full border-2 font-heading text-sm font-semibold",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground"
                )}
              >
                {isSelected ? <CheckIcon className="size-4" /> : OPTION_LETTERS[index]}
              </span>
              <span className="text-sm sm:text-base">{option}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
