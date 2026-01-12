import { useEffect, useRef } from 'react';
import { basePath } from './utils';

/**
 * 画像を事前読み込みするカスタムフック
 */
export function useImagePreloader() {
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const bearImageRef = useRef<HTMLImageElement[]>([]);
  const bearTrapImageRef = useRef<HTMLImageElement | null>(null);
  const isLoadedRef = useRef(false);

  useEffect(() => {
    if (isLoadedRef.current) return;

    const images: Promise<HTMLImageElement>[] = [];

    // 熊画像を非同期で読み込み（9枚）
    for (let i = 1; i <= 9; i++) {
      const promise = new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        const numStr = i.toString().padStart(2, '0');
        img.src = `${basePath}/bear-img-${numStr}.webp`;
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load bear-img-${numStr}.webp`));
      });
      images.push(promise);
    }

    // 熊罠画像を読み込み
    const trapPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.src = `${basePath}/bear-trap-img.webp`;
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load bear-trap-img.webp'));
    });
    images.push(trapPromise);

    // 全画像を並列読み込み
    Promise.all(images)
      .then((loadedImages) => {
        bearImageRef.current = loadedImages.slice(0, 9);
        bearTrapImageRef.current = loadedImages[9];
        isLoadedRef.current = true;
      })
      .catch((error) => {
        console.error('Image preloading error:', error);
      });
  }, []);

  const loadBackgroundImage = (imageName: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = `${basePath}/${imageName}`;
      img.onload = () => {
        bgImageRef.current = img;
        resolve(img);
      };
      img.onerror = () => {
        console.error('Failed to load background image:', imageName);
        bgImageRef.current = null;
        reject(new Error(`Failed to load ${imageName}`));
      };
    });
  };

  return {
    bgImageRef,
    bearImageRef,
    bearTrapImageRef,
    loadBackgroundImage,
  };
}
