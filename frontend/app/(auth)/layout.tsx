import Image from "next/image"

import { SessionGate } from "@/components/auth/session-gate"
import { Logo } from "@/components/brand/logo"
import { SiteFooter } from "@/components/layout/site-footer"
import { ThemeToggle } from "@/components/layout/theme-toggle"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionGate expects="guest" redirectTo="/">
      <div className="brand-glow flex min-h-dvh flex-col">
        <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <ThemeToggle />
        </header>

        <main className="flex flex-1 items-center justify-center px-4 py-10">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card/80 p-6 shadow-xl backdrop-blur sm:p-10">
            <div className="mb-8 flex flex-col items-center gap-4 text-center">
              <Image
                src="/img/robot.png"
                alt=""
                aria-hidden
                width={84}
                height={70}
                priority
              />
              <p className="font-heading text-lg text-highlight">
                Lass die KI ein Quiz aus deinem Video bauen und finde heraus,
                was hängen geblieben ist.
              </p>
            </div>
            {children}
          </div>
        </main>

        <SiteFooter />
      </div>
    </SessionGate>
  )
}
