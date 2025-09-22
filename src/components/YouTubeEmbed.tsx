"use client"

import { useEffect, useRef } from "react"

interface YouTubeEmbedProps {
  videoId: string
  title?: string
  onPlayStateChange?: (isPlaying: boolean) => void
}

export function YouTubeEmbed({ videoId, title = "YouTube 비디오", onPlayStateChange }: YouTubeEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!onPlayStateChange) return

    // YouTube Player API 로드
    const loadYouTubeAPI = () => {
      if (window.YT) {
        initPlayer()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      script.async = true
      document.body.appendChild(script)

      window.onYouTubeIframeAPIReady = initPlayer
    }

    const initPlayer = () => {
      if (!containerRef.current) return

      // 기존 iframe 제거
      const existingIframe = containerRef.current.querySelector('iframe')
      if (existingIframe) {
        existingIframe.remove()
      }

      // 플레이어 컨테이너 생성
      const playerDiv = document.createElement('div')
      playerDiv.id = `youtube-player-${videoId}`
      containerRef.current.appendChild(playerDiv)

      new window.YT.Player(playerDiv.id, {
        videoId: videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: {
          onStateChange: (event: { data: number }) => {
            const isPlaying = event.data === window.YT.PlayerState.PLAYING
            onPlayStateChange(isPlaying)
          }
        }
      })
    }

    loadYouTubeAPI()

    return () => {
      // cleanup
      if (containerRef.current) {
        const iframe = containerRef.current.querySelector('iframe')
        if (iframe) iframe.remove()
      }
    }
  }, [videoId, onPlayStateChange])

  // onPlayStateChange가 없으면 기본 iframe 사용
  if (!onPlayStateChange) {
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

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video rounded-lg overflow-hidden"
    />
  )
}