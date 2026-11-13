import type { Metadata } from "next"
import localFont from "next/font/local"

import "./globals.css"
import { AppProviders } from "@/components/app-providers"
import { cn } from "@/lib/utils"

const kantumruy = localFont({
  variable: "--font-kantumruy",
  display: "swap",
  src: [
    { path: "./fonts/kantumruy-pro-v11-latin-regular.woff2", weight: "400" },
    { path: "./fonts/kantumruy-pro-v11-latin-500.woff2", weight: "500" },
    { path: "./fonts/kantumruy-pro-v11-latin-600.woff2", weight: "600" },
    { path: "./fonts/kantumruy-pro-v11-latin-700.woff2", weight: "700" },
  ],
})

const k2d = localFont({
  variable: "--font-k2d",
  display: "swap",
  src: [
    { path: "./fonts/k2d-v12-latin-regular.woff2", weight: "400" },
    { path: "./fonts/k2d-v12-latin-500.woff2", weight: "500" },
    { path: "./fonts/k2d-v12-latin-600.woff2", weight: "600" },
    { path: "./fonts/k2d-v12-latin-700.woff2", weight: "700" },
  ],
})

const gugi = localFont({
  variable: "--font-gugi",
  display: "swap",
  src: "./fonts/gugi-v20-latin-regular.woff2",
})

export const metadata: Metadata = {
  title: {
    default: "Quizly",
    template: "%s · Quizly",
  },
  description:
    "Quizly macht aus einem YouTube-Video ein Quiz mit zehn Fragen, damit sich das Gelernte festigt.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="de"
      suppressHydrationWarning
      className={cn(
        "font-sans antialiased",
        kantumruy.variable,
        k2d.variable,
        gugi.variable
      )}
    >
      <body className="min-h-dvh">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
