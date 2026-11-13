export const queryKeys = {
  quizzes: ["quizzes"] as const,
  quiz: (quizId: number) => ["quizzes", quizId] as const,
}
