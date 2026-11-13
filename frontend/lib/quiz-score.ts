import type { Question } from "@/lib/api/types"

export type QuizScore = {
  correct: number
  total: number
  /** Rounded to whole percent for display. */
  percent: number
}

export function scoreQuiz(
  questions: Question[],
  answers: Record<string, string>
): QuizScore {
  const total = questions.length
  const correct = questions.filter(
    (question) => answers[question.id] === question.answer
  ).length
  return {
    correct,
    total,
    percent: total === 0 ? 0 : Math.round((correct / total) * 100),
  }
}
