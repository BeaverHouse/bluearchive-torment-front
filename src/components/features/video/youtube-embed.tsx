"use client"

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react"

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
          loadVideoById?: (videoId: string) => void
        } | null
        console.log('🎬 playVideo() called on player:', !!player)
        console.log('🎬 Player ready state:', playerReadyRef.current)
        
        if (!playerReadyRef.current) {
          console.warn('⚠️ Player not ready yet, skipping playVideo()')
          return
        }
        
        if (player?.playVideo) {
          // 플레이어 상태 확인
          const state = player.getPlayerState?.()
          console.log('📊 Current player state before play:', state)
          
          try {
            // 상태가 CUED(5)인 경우 먼저 비디오를 로드
            if (state === 5) {
              console.log('🔄 Player is CUED, reloading video to force play')
              // 현재 비디오 ID로 다시 로드하여 UNSTARTED 상태로 만들기
              if (player.loadVideoById) {
                // 비디오 ID를 동적으로 가져오기 어려우므로 직접 playVideo() 시도
                player.playVideo()
                // 잠시 후 다시 시도
                setTimeout(() => {
                  if (player.playVideo) {
                    console.log('🔄 Retry playVideo() after CUED state')
                    player.playVideo()
                  }
                }, 50)
              }
            } else {
              player.playVideo()
            }
            console.log('✅ playVideo() executed successfully')
            
            // 상태 변화 확인을 위해 잠시 후 다시 체크
            setTimeout(() => {
              const newState = player.getPlayerState?.()
              console.log('📊 Player state after playVideo():', newState)
            }, 100)
          } catch (error) {
            console.error('❌ Error in playVideo():', error)
          }
        } else {
          console.warn('⚠️ Player or playVideo method not available')
        }
      },
      pauseVideo: () => {
        const player = playerRef.current as { pauseVideo?: () => void } | null
        console.log('⏸️ pauseVideo() called on player:', !!player)
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
      console.log('🔄 Player already exists, skipping recreation')
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
        console.log('🔄 Reusing existing player')
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
          // 자동재생 정책 관련 설정
          autoplay: 0,
          // 사용자 상호작용 허용
          controls: 1,
          rel: 0
        },
        events: {
          onReady: (event: unknown) => {
            console.log('🎥 YouTube player ready')
            const player = (event as { target: unknown }).target
            playerRef.current = player
            playerReadyRef.current = true
            
            // 플레이어가 준비되었는지 확인
            const playerWithMethods = player as { 
              getPlayerState?: () => number
              getVideoData?: () => { title?: string; video_id?: string }
            }
            if (playerWithMethods.getPlayerState) {
              const initialState = playerWithMethods.getPlayerState()
              console.log('📊 Initial player state:', initialState)
            }
            
            // 비디오 정보 확인
            if (playerWithMethods.getVideoData) {
              const videoData = playerWithMethods.getVideoData()
              console.log('📹 Video data:', videoData?.title, videoData?.video_id)
            }
          },
          onStateChange: (event: { data: number }) => {
            const state = event.data
            const windowWithYT = window as Window & { YT: YouTubeAPI }
            const isPlaying = state === windowWithYT.YT.PlayerState.PLAYING
            console.log('🔄 Player state changed:', state, 'isPlaying:', isPlaying)
            
            // 상태별 로깅
            switch (state) {
              case windowWithYT.YT.PlayerState.UNSTARTED:
                console.log('📺 Player: UNSTARTED')
                break
              case windowWithYT.YT.PlayerState.ENDED:
                console.log('📺 Player: ENDED')
                break
              case windowWithYT.YT.PlayerState.PLAYING:
                console.log('📺 Player: PLAYING')
                break
              case windowWithYT.YT.PlayerState.PAUSED:
                console.log('📺 Player: PAUSED')
                break
              case windowWithYT.YT.PlayerState.BUFFERING:
                console.log('📺 Player: BUFFERING')
                break
              case windowWithYT.YT.PlayerState.CUED:
                console.log('📺 Player: CUED')
                break
            }
            
            onPlayStateChange(isPlaying)
          },
          onError: (event: { data: number }) => {
            console.error('❌ YouTube player error:', event.data)
            switch (event.data) {
              case 2:
                console.error('❌ Invalid video ID')
                break
              case 5:
                console.error('❌ HTML5 player error')
                break
              case 100:
                console.error('❌ Video not found or private')
                break
              case 101:
              case 150:
                console.error('❌ Video not allowed to be played in embedded players')
                break
            }
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
      >
        {/* 투명 오버레이 - 축소된 상태에서만 표시하여 확대 상태에서는 YouTube 플레이어와 직접 상호작용 가능 */}
        {onVideoClick && !isExpanded && (
          <div 
            className="absolute inset-0 z-10 cursor-pointer"
            onClick={(e) => {
              console.log('🎯 Overlay clicked - preventing propagation');
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