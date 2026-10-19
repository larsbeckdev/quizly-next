import Image from "next/image"

/**
 * Covers the page while the backend transcribes the video and writes the
 * questions. That takes from seconds to minutes, so the overlay says so
 * instead of leaving a spinner without context.
 */
export function GeneratingOverlay() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background/90 px-6 text-center backdrop-blur-sm"
    >
      <div className="relative flex size-40 items-center justify-center">
        <span className="absolute inset-0 animate-spin rounded-full border-4 border-primary/20 border-t-primary [animation-duration:1.6s]" />
        <span className="absolute inset-4 animate-spin rounded-full border-4 border-highlight/20 border-b-highlight [animation-direction:reverse] [animation-duration:2.4s]" />
        <Image
          src="/img/robot.png"
          alt=""
          aria-hidden
          width={72}
          height={60}
          className="motion-safe:animate-pulse"
        />
      </div>
      <div className="grid max-w-sm gap-2">
        <p className="font-heading text-2xl font-semibold">
          Dein Quiz entsteht…
        </p>
        <p className="text-sm text-muted-foreground">
          Das Video wird transkribiert und die KI schreibt zehn Fragen. Je
          nach Länge dauert das ein paar Minuten. Bitte lass die Seite offen.
        </p>
      </div>
    </div>
  )
}
