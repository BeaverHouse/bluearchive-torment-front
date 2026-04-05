"use client"

import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react"

// YouTube IFrame API 타입 정의
interface YouTubeAPI {
  Player: new (elementId: string, config: unknown) => unknown
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
  onVideoClick?: () => void
  isExpanded?: boolean
}

export interface YouTubePlayerRef {
  playVideo: () => void
  pauseVideo: () => void
  getPlayerState: () => number | null
}

const THUMBNAIL_QUALITIES = ['maxresdefault', 'sddefault', 'hqdefault'] as const

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

export const YouTubeEmbed = forwardRef<YouTubePlayerRef, YouTubeEmbedProps>(
  function YouTubeEmbed({ videoId, title = "YouTube 비디오", onPlayStateChange, onVideoClick, isExpanded = false }, ref) {
    const containerRef = useRef<HTMLDivElement>(null)
    const playerRef = useRef<unknown>(null)
    const playerReadyRef = useRef<boolean>(false)
    const onPlayStateChangeRef = useRef(onPlayStateChange)
    
    // onPlayStateChange를 ref로 관리하여 useEffect 재실행 방지
    useEffect(() => {
      onPlayStateChangeRef.current = onPlayStateChange
    }, [onPlayStateChange])

    // player 메소드를 외부에 노출
    useImperativeHandle(ref, () => ({
      playVideo: () => {
        const player = playerRef.current as {
          playVideo?: () => void
          getPlayerState?: () => number
        } | null

        if (!playerReadyRef.current) return

        if (player?.playVideo) {
          const state = player.getPlayerState?.()

          // 상태가 CUED(5)인 경우 재시도
          if (state === 5) {
            player.playVideo()
            setTimeout(() => {
              player.playVideo?.()
            }, 50)
          } else {
            player.playVideo()
          }
        }
      },
      pauseVideo: () => {
        const player = playerRef.current as { pauseVideo?: () => void } | null
        if (player?.pauseVideo) {
          player.pauseVideo()
        }
      },
      getPlayerState: () => {
        const player = playerRef.current as { getPlayerState?: () => number } | null
        if (player?.getPlayerState) {
          return player.getPlayerState()
        }
        return null
      }
    }))

  useEffect(() => {
    if (!onPlayStateChange) return

    // 플레이어가 이미 생성되었다면 재생성하지 않음
    if (playerRef.current && playerReadyRef.current) {
      return
    }

    // YouTube Player API 로드
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
      if (!containerRef.current) return

      // 기존 플레이어가 있다면 재사용
      if (playerRef.current && playerReadyRef.current) {
        return
      }

      // 기존 iframe 제거 (처음 생성시에만)
      const existingIframe = containerRef.current.querySelector('iframe')
      if (existingIframe) {
        existingIframe.remove()
      }

      // 플레이어 컨테이너 생성
      const playerDiv = document.createElement('div')
      playerDiv.id = `youtube-player-${videoId}-${Date.now()}` // 고유 ID 생성
      containerRef.current.appendChild(playerDiv)

      const windowWithYT = window as Window & { YT: YouTubeAPI }
      new windowWithYT.YT.Player(playerDiv.id, {
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
          onReady: (event: unknown) => {
            const player = (event as { target: unknown }).target
            playerRef.current = player
            playerReadyRef.current = true
          },
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
      // cleanup은 컴포넌트 언마운트시에만
      playerReadyRef.current = false
    }
  }, [videoId, onPlayStateChange])

  // onPlayStateChange가 없으면 lite embed 사용 (고해상도 썸네일 + 클릭 시 iframe 로드)
  if (!onPlayStateChange) {
    return <LiteYouTubeEmbed videoId={videoId} title={title} />
  }

    return (
      <div 
        ref={containerRef}
        className="relative w-full aspect-video rounded-lg overflow-hidden"
      >
        {/* 투명 오버레이 - 축소된 상태에서만 표시하여 확대 상태에서는 YouTube 플레이어와 직접 상호작용 가능 */}
        {onVideoClick && !isExpanded && (
          <div
            className="absolute inset-0 z-10 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onVideoClick();
            }}
            style={{ backgroundColor: 'transparent' }}
          />
        )}
      </div>
    )
  }
)