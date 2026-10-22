import Image from "next/image"

import { Logo } from "@/components/brand/logo"
import { LinkButton } from "@/components/ui/link-button"

export default function NotFound() {
  return (
    <div className="brand-glow flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo href="/" size={40} />
      <Image
        src="/img/robot.png"
        alt=""
        aria-hidden
        width={220}
        height={220}
        className="opacity-90"
      />
      <p className="font-heading text-5xl font-bold text-primary">404</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        Diese Seite gibt es nicht. Vielleicht wurde das Quiz inzwischen
        gelöscht.
      </p>
      <LinkButton size="lg" className="h-10" href="/">
        Zur Startseite
      </LinkButton>
    </div>
  )
}
