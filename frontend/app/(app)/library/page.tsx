import type { Metadata } from "next"

import { LibraryView } from "@/components/quizzes/library-view"

export const metadata: Metadata = {
  title: "Bibliothek",
}

export default function LibraryPage() {
  return (
    <div className="grid gap-8">
      <h1 className="font-heading text-3xl font-bold sm:text-4xl">
        Bibliothek
      </h1>
      <LibraryView />
    </div>
  )
}
