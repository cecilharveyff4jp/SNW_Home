// page.tsx で新しいフックを使用する例

// === インポート部分に追加 ===
import { useImagePreloader } from './useImagePreloader';
import { useMapMetrics, useSortedObjects } from './useMapMetrics';
import { useLocalStorageBoolean, useLocalStorageString } from './useLocalStorage';
import { useOptimizedResize } from './useAnimationFrame';

// === コンポーネント内で使用 ===
export default function Home() {
  // 画像プリロード
  const { bgImageRef, bearImageRef, bearTrapImageRef, loadBackgroundImage } = useImagePreloader();
  
  // LocalStorage（既存のuseStateとuseEffectを置き換え）
  const [tickerHidden, setTickerHidden] = useLocalStorageBoolean('tickerHidden', false);
  const [myObjectId, setMyObjectId] = useLocalStorageString('snw-my-object-id', '');
  
  // メタデータの計算（メモ化済み）
  const mapMetrics = useMapMetrics(meta, cam, viewW, viewH);
  
  // オブジェクトのソート（メモ化済み）
  const sortedObjects = useSortedObjects(objects);
  
  // リサイズイベントの最適化
  useOptimizedResize(() => {
    draw();
  }, 100);
  
  // 背景画像の読み込み（既存のuseEffectを置き換え）
  useEffect(() => {
    if (bgConfig.image) {
      loadBackgroundImage(bgConfig.image).then(() => {
        draw();
      }).catch(console.error);
    }
  }, [bgConfig.image]);
  
  // 描画関数内で使用
  const draw = () => {
    // mapMetricsを使用
    const { cols, rows, cell, mapW, mapH, cx, cy, gridStartX, gridEndX, gridStartY, gridEndY } = mapMetrics;
    
    // sortedObjectsを使用
    for (const obj of sortedObjects) {
      // オブジェクトを描画
    }
  };
}

// === 効果 ===
// 1. useEffect が約5-7個削減される
// 2. 不要な再レンダリングが防止される
// 3. 計算がメモ化されパフォーマンス向上
// 4. コードの可読性が向上
