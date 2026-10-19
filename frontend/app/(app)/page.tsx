import Image from "next/image"

import { QuizGeneratorForm } from "@/components/quizzes/quiz-generator-form"
import { RecentQuizzes } from "@/components/quizzes/recent-quizzes"

export default function HomePage() {
  return (
    <div className="grid gap-16">
      <section className="mx-auto grid w-full max-w-3xl gap-8 text-center">
        <Image
          src="/img/robot-smile.png"
          alt=""
          aria-hidden
          width={120}
          height={100}
          priority
          className="mx-auto"
        />
        <div className="grid gap-3">
          <h1 className="font-heading text-4xl leading-tight font-bold text-balance sm:text-5xl">
            Aus jedem Video ein <span className="text-primary">Quiz</span>
          </h1>
          <p className="text-muted-foreground text-pretty sm:text-lg">
            Füge den Link zu einem YouTube-Video ein. Quizly erstellt daraus
            zehn Fragen, mit denen du prüfst, was hängen geblieben ist.
          </p>
        </div>
        <div className="text-left">
          <QuizGeneratorForm />
        </div>
      </section>

      <RecentQuizzes />
    </div>
  )
}
