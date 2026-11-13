"use client"

import { useSyncExternalStore } from "react"

import { readSession, subscribeToSession } from "@/lib/auth/session"
import type { Session } from "@/lib/auth/session"

/**
 * The session hint lives in localStorage, which React cannot observe on its
 * own. useSyncExternalStore keeps a cached snapshot so the hook returns a
 * stable reference between renders and still reacts to logins in other tabs.
 */
let snapshot: Session | null = readSessionSafely()
let snapshotSource = JSON.stringify(snapshot)

function readSessionSafely(): Session | null {
  return typeof window === "undefined" ? null : readSession()
}

function getSnapshot(): Session | null {
  const next = readSessionSafely()
  const nextSource = JSON.stringify(next)
  if (nextSource !== snapshotSource) {
    snapshot = next
    snapshotSource = nextSource
  }
  return snapshot
}

function getServerSnapshot(): Session | null {
  return null
}

export function useSession(): Session | null {
  return useSyncExternalStore(subscribeToSession, getSnapshot, getServerSnapshot)
}
