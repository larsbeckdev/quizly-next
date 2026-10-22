"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/api/query-keys"
import {
  createQuiz,
  deleteQuiz,
  getQuiz,
  listQuizzes,
  updateQuiz,
} from "@/lib/api/quizzes"
import type { QuizUpdatePayload } from "@/lib/api/quizzes"
import type { Quiz } from "@/lib/api/types"

export function useQuizzes() {
  return useQuery({
    queryKey: queryKeys.quizzes,
    queryFn: listQuizzes,
  })
}

export function useQuiz(quizId: number) {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: queryKeys.quiz(quizId),
    queryFn: () => getQuiz(quizId),
    enabled: Number.isFinite(quizId),
    // The list already carries every quiz with its questions, so opening one
    // from the list renders without waiting for a second round trip.
    placeholderData: () =>
      queryClient
        .getQueryData<Quiz[]>(queryKeys.quizzes)
        ?.find((quiz) => quiz.id === quizId),
  })
}

function useInvalidateQuizzes() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.quizzes })
}

export function useCreateQuiz() {
  const invalidate = useInvalidateQuizzes()
  return useMutation({
    mutationFn: createQuiz,
    onSuccess: () => void invalidate(),
  })
}

export function useUpdateQuiz(quizId: number) {
  const queryClient = useQueryClient()
  const invalidate = useInvalidateQuizzes()
  return useMutation({
    mutationFn: (payload: QuizUpdatePayload) => updateQuiz(quizId, payload),
    onSuccess: (quiz) => {
      queryClient.setQueryData(queryKeys.quiz(quizId), quiz)
      void invalidate()
    },
  })
}

export function useDeleteQuiz() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteQuiz,
    onSuccess: (_, quizId) => {
      queryClient.removeQueries({ queryKey: queryKeys.quiz(quizId), exact: true })
      queryClient.setQueryData<Quiz[]>(queryKeys.quizzes, (quizzes) =>
        quizzes?.filter((quiz) => quiz.id !== quizId)
      )
    },
  })
}
