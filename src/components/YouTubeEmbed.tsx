"use client"

interface YouTubeEmbedProps {
  videoId: string
  title?: string
}

export function YouTubeEmbed({ videoId, title = "YouTube 비디오" }: YouTubeEmbedProps) {
  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />
    </div>
  )
}