import { useMemo } from 'react';
import type { Meta, Obj } from './types';
import { num, FALLBACK } from './utils';

/**
 * メタデータから計算される値をメモ化するカスタムフック
 */
export function useMapMetrics(meta: Meta, cam: { scale: number }, viewW: number, viewH: number) {
  return useMemo(() => {
    const cols = num(meta?.cols, FALLBACK.cols);
    const rows = num(meta?.rows, FALLBACK.rows);
    const cell = num(meta?.cellSize, FALLBACK.cellSize);
    const mapW = cols * cell;
    const mapH = rows * cell;
    const cx = mapW / 2;
    const cy = mapH / 2;

    // グリッド描画範囲の計算
    const gridMargin = Math.max(viewW, viewH) / cam.scale;
    const gridStartX = Math.floor(-gridMargin / cell);
    const gridEndX = Math.ceil((mapW + gridMargin) / cell);
    const gridStartY = Math.floor(-gridMargin / cell);
    const gridEndY = Math.ceil((mapH + gridMargin) / cell);

    return {
      cols,
      rows,
      cell,
      mapW,
      mapH,
      cx,
      cy,
      gridStartX,
      gridEndX,
      gridStartY,
      gridEndY,
    };
  }, [meta, cam.scale, viewW, viewH]);
}

/**
 * オブジェクトを描画順にソートするメモ化フック
 */
export function useSortedObjects(objects: Obj[]) {
  return useMemo(() => {
    return [...objects].sort((a, b) => {
      const ay = num(a.y, 0), by = num(b.y, 0);
      const ax = num(a.x, 0), bx = num(b.x, 0);
      return (ay - by) || (ax - bx);
    });
  }, [objects]);
}

/**
 * フィルタリングされたオブジェクトをメモ化
 */
export function useFilteredObjects(objects: Obj[], filterType?: string) {
  return useMemo(() => {
    if (!filterType) return objects;
    return objects.filter(obj => obj.type === filterType);
  }, [objects, filterType]);
}
