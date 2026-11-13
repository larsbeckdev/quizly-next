import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { QuizPlayer } from "@/components/quizzes/quiz-player"
import { parseQuizId } from "@/lib/route-params"

export const metadata: Metadata = {
  title: "Quiz spielen",
}

export default async function QuizPlayPage({
  params,
}: {
  params: Promise<{ quizId: string }>
}) {
  const quizId = parseQuizId((await params).quizId)
  if (quizId === null) {
    notFound()
  }
  return <QuizPlayer quizId={quizId} />
}
