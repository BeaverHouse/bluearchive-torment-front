declare global {
  interface Window {
    YT: unknown;
    onYouTubeIframeAPIReady: () => void;
  }
}

export {};