import { useState, useEffect } from "react";

/**
 * 터치 디바이스 감지 및 터치 이벤트 처리를 위한 커스텀 훅
 */
export function useTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  return { isTouchDevice };
}

interface TouchPosition {
  x: number;
  y: number;
  time: number;
}

/**
 * 터치 이벤트의 시작과 끝을 추적하여 탭 여부를 판단하는 훅
 */
export function useTouchTap(onTap: () => void, threshold = { distance: 10, time: 300 }) {
  const [touchStart, setTouchStart] = useState<TouchPosition | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = Math.abs(touch.clientX - touchStart.x);
    const deltaY = Math.abs(touch.clientY - touchStart.y);
    const deltaTime = Date.now() - touchStart.time;

    // 터치 이동이 threshold 이내이고 시간도 threshold 이내일 때만 탭으로 인식
    if (
      deltaX < threshold.distance &&
      deltaY < threshold.distance &&
      deltaTime < threshold.time
    ) {
      e.preventDefault();
      onTap();
    }

    setTouchStart(null);
  };

  return {
    handleTouchStart,
    handleTouchEnd,
  };
}

export default useTouchDevice;