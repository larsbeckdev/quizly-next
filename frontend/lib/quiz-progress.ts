import { z } from "zod"

/**
 * A quiz in progress survives a reload or a closed tab: the answers given so
 * far are kept in localStorage per quiz id. Answers are keyed by question id
 * rather than by position, so a stored answer can never land on a different
 * question.
 */

const progressSchema = z.object({
  answers: z.record(z.string()),
  currentIndex: z.number().int().min(0),
  isFinished: z.boolean(),
})

export type QuizProgress = z.infer<typeof progressSchema>

export const EMPTY_PROGRESS: QuizProgress = {
  answers: {},
  currentIndex: 0,
  isFinished: false,
}

function storageKey(quizId: number): string {
  return `quizly.progress.${quizId}`
}

export function readProgress(quizId: number): QuizProgress {
  if (typeof window === "undefined") {
    return EMPTY_PROGRESS
  }
  try {
    const raw = window.localStorage.getItem(storageKey(quizId))
    if (!raw) {
      return EMPTY_PROGRESS
    }
    const parsed = progressSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : EMPTY_PROGRESS
  } catch {
    return EMPTY_PROGRESS
  }
}

export function writeProgress(quizId: number, progress: QuizProgress): void {
  try {
    window.localStorage.setItem(storageKey(quizId), JSON.stringify(progress))
  } catch {
    // ponytail: a full or blocked storage only costs the resume feature, the
    // quiz itself keeps working from memory.
  }
}

export function clearProgress(quizId: number): void {
  try {
    window.localStorage.removeItem(storageKey(quizId))
  } catch {
    // Same as above: nothing to clean up when storage is unavailable.
  }
}
