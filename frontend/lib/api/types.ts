import { z } from "zod"

export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
})

export const loginResponseSchema = z.object({
  detail: z.string(),
  user: userSchema,
})

export const questionSchema = z.object({
  id: z.number(),
  question_title: z.string(),
  question_options: z.array(z.string()),
  /** The text of the correct option, not its index. */
  answer: z.string(),
})

export const quizSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  video_url: z.string(),
  questions: z.array(questionSchema),
})

export const quizListSchema = z.array(quizSchema)

export type User = z.infer<typeof userSchema>
export type LoginResponse = z.infer<typeof loginResponseSchema>
export type Question = z.infer<typeof questionSchema>
export type Quiz = z.infer<typeof quizSchema>
