"use client"

import { useState, useEffect, useRef } from "react"

interface YouTubePlayer {
  destroy?: () => void
}

interface YouTubeAPI {
  Player: new (elementId: string, config: unknown) => YouTubePlayer
  PlayerState: {
    UNSTARTED: number
    ENDED: number
    PLAYING: number
    PAUSED: number
    BUFFERING: number
    CUED: number
  }
}

interface YouTubeEmbedProps {
  videoId: string
  title?: string
  onPlayStateChange?: (isPlaying: boolean) => void
}

const THUMBNAIL_QUALITIES = ['maxresdefault', 'sddefault', 'hqdefault'] as const
const MIN_VALID_THUMBNAIL_WIDTH = 320

function LiteYouTubeEmbed({ videoId, title }: { videoId: string; title: string }) {
  const [activated, setActivated] = useState(false)
  const [qualityIndex, setQualityIndex] = useState(0)

  const thumbUrl = `https://img.youtube.com/vi/${videoId}/${THUMBNAIL_QUALITIES[qualityIndex]}.jpg`

  if (activated) {
    return (
      <div className="relative w-full aspect-video rounded-lg overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    )
  }

  return (
    <div
      className="relative w-full aspect-video rounded-lg overflow-hidden cursor-pointer group bg-black"
      onClick={() => setActivated(true)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumbUrl}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
        onLoad={(event) => {
          const image = event.currentTarget

          if (
            image.naturalWidth < MIN_VALID_THUMBNAIL_WIDTH &&
            qualityIndex < THUMBNAIL_QUALITIES.length - 1
          ) {
            setQualityIndex(qualityIndex + 1)
          }
        }}
        onError={() => {
          if (qualityIndex < THUMBNAIL_QUALITIES.length - 1) {
            setQualityIndex(qualityIndex + 1)
          }
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <svg className="w-16 h-16 sm:w-20 sm:h-20 opacity-80 group-hover:opacity-100 transition-opacity" viewBox="0 0 68 48">
          <path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55C3.97 2.33 2.27 4.81 1.48 7.74.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="red"/>
          <path d="M45 24 27 14v20" fill="white"/>
        </svg>
      </div>
    </div>
  )
}

export function YouTubeEmbed({ videoId, title = "YouTube 비디오", onPlayStateChange }: YouTubeEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YouTubePlayer | null>(null)

  useEffect(() => {
    if (!onPlayStateChange) return

    const container = containerRef.current
    let active = true

    if (!container) return

    const loadYouTubeAPI = () => {
      const windowWithYT = window as Window & {
        YT?: YouTubeAPI
        onYouTubeIframeAPIReady?: () => void
      }
      
      if (windowWithYT.YT) {
        initPlayer()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      script.async = true
      document.body.appendChild(script)

      windowWithYT.onYouTubeIframeAPIReady = initPlayer
    }

    const initPlayer = () => {
      if (!active) return

      const playerDiv = document.createElement('div')
      playerDiv.id = `youtube-player-${videoId}-${Date.now()}`
      container.replaceChildren(playerDiv)

      const windowWithYT = window as Window & { YT: YouTubeAPI }
      playerRef.current = new windowWithYT.YT.Player(playerDiv.id, {
        videoId: videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          enablejsapi: 1,
          origin: window.location.origin,
          autoplay: 0,
          controls: 1,
          rel: 0,
          vq: 'hd1080'
        },
        events: {
          onStateChange: (event: { data: number }) => {
            const windowWithYT = window as Window & { YT: YouTubeAPI }
            const isPlaying = event.data === windowWithYT.YT.PlayerState.PLAYING
            onPlayStateChange(isPlaying)
          }
        }
      })
    }

    loadYouTubeAPI()

    return () => {
      active = false
      playerRef.current?.destroy?.()
      playerRef.current = null
      container.replaceChildren()
    }
  }, [videoId, onPlayStateChange])

  if (!onPlayStateChange) {
    return <LiteYouTubeEmbed videoId={videoId} title={title} />
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video rounded-lg overflow-hidden"
    />
  )
}
