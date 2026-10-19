import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { QuizDetailView } from "@/components/quizzes/quiz-detail-view"
import { parseQuizId } from "@/lib/route-params"

export const metadata: Metadata = {
  title: "Quiz",
}

export default async function QuizDetailPage({
  params,
}: {
  params: Promise<{ quizId: string }>
}) {
  const quizId = parseQuizId((await params).quizId)
  if (quizId === null) {
    notFound()
  }
  return <QuizDetailView quizId={quizId} />
}
