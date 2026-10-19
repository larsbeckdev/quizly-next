import { youtubeEmbedUrl, youtubeVideoId } from "@/lib/youtube"

type QuizVideoProps = {
  videoUrl: string
  title: string
}

export function QuizVideo({ videoUrl, title }: QuizVideoProps) {
  const videoId = youtubeVideoId(videoUrl)

  if (!videoId) {
    return (
      <p className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
        Das Video kann nicht eingebettet werden.
      </p>
    )
  }

  return (
    <div className="aspect-video overflow-hidden rounded-2xl border border-border bg-black shadow-lg">
      <iframe
        src={youtubeEmbedUrl(videoId)}
        title={`Video zu „${title}“`}
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        loading="lazy"
        className="size-full"
      />
    </div>
  )
}
