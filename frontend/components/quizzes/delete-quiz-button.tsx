"use client"

import * as React from "react"
import { Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useDeleteQuiz } from "@/hooks/use-quizzes"
import { ApiError } from "@/lib/api/client"
import type { Quiz } from "@/lib/api/types"
import { clearProgress } from "@/lib/quiz-progress"

type DeleteQuizButtonProps = {
  quiz: Pick<Quiz, "id" | "title">
  onDeleted?: () => void
}

export function DeleteQuizButton({ quiz, onDeleted }: DeleteQuizButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const deleteQuiz = useDeleteQuiz()

  async function confirmDelete() {
    try {
      await deleteQuiz.mutateAsync(quiz.id)
      clearProgress(quiz.id)
      setIsOpen(false)
      toast.success("Quiz gelöscht.")
      onDeleted?.()
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Das Quiz konnte nicht gelöscht werden."
      )
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`„${quiz.title}“ löschen`}
        className="text-muted-foreground hover:text-destructive"
        onClick={() => setIsOpen(true)}
      >
        <Trash2Icon />
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Quiz löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              „{quiz.title}“ und alle zehn Fragen werden entfernt. Das lässt
              sich nicht rückgängig machen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteQuiz.isPending}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteQuiz.isPending}
              onClick={() => void confirmDelete()}
            >
              {deleteQuiz.isPending ? "Wird gelöscht…" : "Endgültig löschen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
