import { emptyResponseSchema, request } from "@/lib/api/client"
import { quizListSchema, quizSchema } from "@/lib/api/types"
import type { Quiz } from "@/lib/api/types"

export type QuizUpdatePayload = Partial<Pick<Quiz, "title" | "description">>

export function listQuizzes(): Promise<Quiz[]> {
  return request("/quizzes/", quizListSchema)
}

export function getQuiz(quizId: number): Promise<Quiz> {
  return request(`/quizzes/${quizId}/`, quizSchema)
}

/**
 * Transcribes the video and lets Gemini write the questions inside the
 * request, so this can take minutes. fetch has no timeout of its own.
 */
export function createQuiz(url: string): Promise<Quiz> {
  return request("/quizzes/", quizSchema, { method: "POST", body: { url } })
}

export function updateQuiz(
  quizId: number,
  payload: QuizUpdatePayload
): Promise<Quiz> {
  return request(`/quizzes/${quizId}/`, quizSchema, {
    method: "PATCH",
    body: payload,
  })
}

export function deleteQuiz(quizId: number): Promise<void> {
  return request(`/quizzes/${quizId}/`, emptyResponseSchema, {
    method: "DELETE",
  })
}
