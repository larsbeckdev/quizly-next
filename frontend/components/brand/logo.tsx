import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"

type LogoProps = {
  href?: string
  className?: string
  /** Height of the robot in pixels, the wordmark scales with it. */
  size?: number
}

/**
 * The original logo is a PNG in neon green, which disappears on white. The
 * robot keeps its own colours and the wordmark is set in the logo font with
 * the theme's brand colour instead, so both appearances stay readable.
 */
export function Logo({ href = "/", className, size = 32 }: LogoProps) {
  return (
    <Link
      href={href}
      aria-label="Quizly Startseite"
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-md transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
        className
      )}
    >
      <Image
        src="/img/robot.png"
        alt=""
        aria-hidden
        width={Math.round(size * 1.2)}
        height={size}
        priority
      />
      <span
        className="font-logo leading-none text-brand"
        style={{ fontSize: size * 0.8 }}
      >
        Quizly
      </span>
    </Link>
  )
}
