import { useEffect, useRef } from 'react';

interface Options {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  disabled?: boolean;
}

export function usePullToRefresh({ onRefresh, threshold = 80, disabled = false }: Options) {
  const startY = useRef(0);
  const pulling = useRef(false);
  const refreshing = useRef(false);

  useEffect(() => {
    if (disabled) return;
    let dist = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY > 0 || refreshing.current) return;
      startY.current = e.touches[0].clientY;
      pulling.current = true;
      dist = 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!pulling.current) return;
      const y = e.touches[0].clientY;
      dist = y - startY.current;
      if (dist > 0 && dist < threshold * 2.5) {
        // light resistance
      }
    };

    const onTouchEnd = async () => {
      if (!pulling.current) return;
      pulling.current = false;
      if (dist > threshold && !refreshing.current) {
        refreshing.current = true;
        try {
          await onRefresh();
        } finally {
          refreshing.current = false;
        }
      }
      dist = 0;
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd);
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [onRefresh, threshold, disabled]);
}