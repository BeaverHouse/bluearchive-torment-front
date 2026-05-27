declare global {
  interface Window {
    YT: unknown;
    onYouTubeIframeAPIReady: () => void;
    gtag: (...args: unknown[]) => void;
  }
}

export {};