"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { HouseIcon, LibraryIcon, LogOutIcon } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"

import { Logo } from "@/components/brand/logo"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth/sign-in"
import { useSession } from "@/lib/auth/use-session"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/", label: "Start", icon: HouseIcon },
  { href: "/library", label: "Bibliothek", icon: LibraryIcon },
]

function isActivePath(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const queryClient = useQueryClient()
  const session = useSession()

  async function handleLogout() {
    try {
      await signOut()
    } finally {
      queryClient.clear()
      router.replace("/login")
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-2 px-4 sm:gap-4 sm:px-6">
        <Logo />

        <nav
          aria-label="Hauptnavigation"
          className="ml-auto flex items-center gap-1"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = isActivePath(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-soft text-brand-soft-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="size-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <ThemeToggle />

        {session ? (
          <div className="flex items-center gap-2">
            <span className="hidden max-w-32 truncate text-sm text-muted-foreground md:inline">
              {session.username}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Abmelden"
              onClick={() => void handleLogout()}
            >
              <LogOutIcon />
            </Button>
          </div>
        ) : null}
      </div>
    </header>
  )
}
