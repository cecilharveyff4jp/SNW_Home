import { useEffect, useRef, useCallback } from 'react';

/**
 * requestAnimationFrameの最適化フック
 * 不要な再描画を防ぎ、パフォーマンスを向上
 */
export function useAnimationFrame(callback: (deltaTime: number) => void, dependencies: React.DependencyList) {
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const callbackRef = useRef(callback);

  // callbackを常に最新に保つ
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== null) {
      const deltaTime = time - previousTimeRef.current;
      callbackRef.current(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}

/**
 * デバウンス付きの再描画フック
 */
export function useDebouncedRender(callback: () => void, delay: number, dependencies: React.DependencyList) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // 既存のタイマーをクリア
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    // デバウンス処理
    timeoutRef.current = setTimeout(() => {
      rafRef.current = requestAnimationFrame(() => {
        callback();
        rafRef.current = null;
      });
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}

/**
 * リサイズイベントの最適化フック
 */
export function useOptimizedResize(callback: () => void, delay: number = 100) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      // 既存のタイマーとRAFをクリア
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      // デバウンス処理
      timeoutRef.current = setTimeout(() => {
        rafRef.current = requestAnimationFrame(() => {
          callback();
          rafRef.current = null;
        });
      }, delay);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [callback, delay]);
}
