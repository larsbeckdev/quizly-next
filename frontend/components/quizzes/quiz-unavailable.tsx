import { EmptyState } from "@/components/empty-state"
import { LinkButton } from "@/components/ui/link-button"
import { ApiError } from "@/lib/api/client"

function describe(error: Error): { title: string; description: string } {
  if (error instanceof ApiError && error.status === 404) {
    return {
      title: "Quiz nicht gefunden",
      description: "Vielleicht wurde es inzwischen gelöscht.",
    }
  }
  if (error instanceof ApiError && error.status === 403) {
    return {
      title: "Kein Zugriff",
      description: "Dieses Quiz gehört einem anderen Konto.",
    }
  }
  return { title: "Das Quiz konnte nicht geladen werden", description: error.message }
}

/** Shared by the detail page and the player, which load the same quiz. */
export function QuizUnavailable({ error }: { error: Error }) {
  const { title, description } = describe(error)
  return (
    <EmptyState
      title={title}
      description={description}
      action={<LinkButton href="/library">Zur Bibliothek</LinkButton>}
    />
  )
}
