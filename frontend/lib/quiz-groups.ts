import type { Quiz } from "@/lib/api/types"

export type QuizGroups = {
  today: Quiz[]
  lastSevenDays: Quiz[]
  all: Quiz[]
}

/**
 * Sorts the quizzes into the three library sections. `now` is a parameter
 * instead of `new Date()` inside, so the grouping can be checked against a
 * fixed date.
 *
 * The API answers newest first; the groups keep that order.
 */
export function groupQuizzesByDate(quizzes: Quiz[], now: Date): QuizGroups {
  // TODO(lars): decide what "heute" and "letzte 7 Tage" mean and fill
  // `today` and `lastSevenDays` from quiz.created_at (an ISO string).
  //  - Calendar days (date-fns isToday / startOfDay) or a rolling window
  //    (now minus 24 h / 7 * 24 h)?
  //  - Does a quiz from today also show up under "letzte 7 Tage"?
  void now
  return { today: [], lastSevenDays: [], all: quizzes }
}
