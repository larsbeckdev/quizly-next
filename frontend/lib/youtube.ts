const VIDEO_ID = /^[\w-]{11}$/
const HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com"])
const PATH_PREFIXES = ["/shorts/", "/embed/", "/live/"]

/**
 * Pulls the video id out of the link forms the backend accepts: watch?v=,
 * youtu.be/, shorts/, embed/ and live/. Returns null for anything else, so
 * the form can reject a link before a request that would take minutes.
 */
export function youtubeVideoId(value: string): string | null {
  let url: URL
  try {
    url = new URL(value.trim())
  } catch {
    return null
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return null
  }

  let candidate: string | null = null
  if (url.hostname === "youtu.be") {
    candidate = url.pathname.slice(1)
  } else if (HOSTS.has(url.hostname)) {
    const prefix = PATH_PREFIXES.find((entry) => url.pathname.startsWith(entry))
    candidate =
      url.pathname === "/watch"
        ? url.searchParams.get("v")
        : prefix
          ? url.pathname.slice(prefix.length).split("/")[0]
          : null
  }
  return candidate && VIDEO_ID.test(candidate) ? candidate : null
}

/** The no-cookie domain keeps YouTube from setting tracking cookies until play. */
export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}`
}
