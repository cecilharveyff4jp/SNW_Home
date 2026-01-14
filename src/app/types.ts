// 型定義
export type Meta = { 
  cols?: number; 
  rows?: number; 
  cellSize?: number; 
  mapName?: string;
  bgImage?: string;
  bgCenterX?: number;
  bgCenterY?: number;
  bgScale?: number;
  bgOpacity?: number;
};

export type MapConfig = {
  id: string;           // 'object', 'map2', 'map3', 'map4', 'map5'
  name: string;         // 表示名
  sheetName: string;    // スプレッドシートのシート名
  isVisible: boolean;   // 表示/非表示
  isBase: boolean;      // ベースマップかどうか
  order: number;        // 表示順序
};

export type BgConfig = {
  image: string;  // 画像ファイル名
  centerX: number;  // 中心点X (%)
  centerY: number;  // 中心点Y (%)
  scale: number;  // 拡大率
  opacity: number;  // 透明度 (0-1)
};

export type Obj = {
  id?: string;
  type?: string;
  label?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  birthday?: string;
  isFavorite?: boolean;
  note?: string;
  Animation?: string;
  Fire?: string | number;
};

export type SoldierAnimation = {
  id: string;
  bearTrap: Obj;
  cities: Obj[];
  startTime: number;
  damages: Array<{ damage: number; isCritical: boolean }>;
  totalDamage: number;
};

export type Camera = {
  tx: number;
  ty: number;
  scale: number;
};

export const FALLBACK = { cols: 60, rows: 40, cellSize: 24 };
