import type { Obj } from '../types';
import type {
  FireworksAnimation,
  SparkleAnimation,
  MeteorAnimation,
  ConfettiAnimation,
  ExplosionAnimation,
  LightParticleAnimation,
  GemAnimation,
  StarTrailAnimation,
} from '../types/animations';

// Helper types for setState functions (will be passed as parameters)
type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

interface ParticleAnimationDeps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  cfg: { cell: number };
  num: (val: any, def: number) => number;
  mapToScreen: (mapX: number, mapY: number, viewW: number, viewH: number) => { sx: number; sy: number };
  setFireworks: SetState<FireworksAnimation[]>;
  setSparkles: SetState<SparkleAnimation[]>;
  setMeteors: SetState<MeteorAnimation[]>;
  setConfettiAnimations: SetState<ConfettiAnimation[]>;
  setExplosionAnimations: SetState<ExplosionAnimation[]>;
  setLightParticleAnimations: SetState<LightParticleAnimation[]>;
  setGemAnimations: SetState<GemAnimation[]>;
  setStarTrailAnimations: SetState<StarTrailAnimation[]>;
}

// 花火アニメーション開始関数
export const startFireworksAnimation = (
  obj: Obj,
  deps: ParticleAnimationDeps
) => {
  const { canvasRef, cfg, num, mapToScreen, setFireworks } = deps;
  const canvas = canvasRef.current;
  if (!canvas) return;
  
  const rect = canvas.getBoundingClientRect();
  const viewW = rect.width;
  const viewH = rect.height;
  
  // オブジェクトのマップ座標を取得（中心位置）
  const objMapX = (num(obj.x, 0) + num(obj.w, 1) / 2) * cfg.cell;
  const objMapY = (num(obj.y, 0) + num(obj.h, 1) / 2) * cfg.cell;
  
  // マップ座標からスクリーン座標に変換
  const { sx: centerX, sy: centerY } = mapToScreen(objMapX, objMapY, viewW, viewH);
  
  // オブジェクト中心から360度に広がる花火
  const newFireworks: any[] = [];
  const colors = ['#ff1744', '#00e676', '#2979ff', '#ffd600', '#e040fb', '#00e5ff', '#ff6e40', '#ff4081'];
  
  const particles = [];
  const particleCount = 150; // 粒子数を増やして豪華に
  
  for (let j = 0; j < particleCount; j++) {
    // 360度均等に配置 + ランダム性
    const angle = (Math.PI * 2 * j) / particleCount + (Math.random() - 0.5) * 0.2;
    const speed = 8 + Math.random() * 12; // 速度を緩める（8-20）
    particles.push({
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1.0,
      maxLife: 1.0,
      color: colors[Math.floor(Math.random() * colors.length)],
      x: 0,
      y: 0,
    });
  }
  
  newFireworks.push({
    x: centerX,
    y: centerY,
    mapX: objMapX,
    mapY: objMapY,
    particles,
    startTime: Date.now(),
  });
  
  setFireworks(newFireworks);
};

// キラキラエフェクト開始関数
export const startSparkleAnimation = (
  obj: Obj,
  deps: ParticleAnimationDeps
) => {
  const { canvasRef, cfg, num, mapToScreen, setSparkles } = deps;
  const canvas = canvasRef.current;
  if (!canvas) return;
  
  const rect = canvas.getBoundingClientRect();
  const viewW = rect.width;
  const viewH = rect.height;
  
  // オブジェクトのマップ座標を取得（中心位置）
  const objMapX = (num(obj.x, 0) + num(obj.w, 1) / 2) * cfg.cell;
  const objMapY = (num(obj.y, 0) + num(obj.h, 1) / 2) * cfg.cell;
  
  // マップ座標からスクリーン座標に変換
  const { sx: centerX, sy: centerY } = mapToScreen(objMapX, objMapY, viewW, viewH);
  
  const particles = [];
  const particleCount = 120; // 粒子数を増やす
  const colors = ['#ffd700', '#ffed4e', '#fff59d', '#ffffff', '#ffe082', '#ffb300'];
  
  for (let i = 0; i < particleCount; i++) {
    // 360度均等に配置 + ランダム性
    const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.2;
    const speed = 6 + Math.random() * 10; // 速度を緩める（6-16）
    
    particles.push({
      offsetX: 0,
      offsetY: 0,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 6 + Math.random() * 10,
      rotation: Math.random() * Math.PI * 2,
      life: 1.0,
      maxLife: 1.0,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
  
  setSparkles([{
    x: centerX,
    y: centerY,
    mapX: objMapX, // マップ座標を保存
    mapY: objMapY,
    particles,
    startTime: Date.now(),
    targetObj: obj,
  }]);
};

// 隕石アニメーション開始
export const startMeteorAnimation = (
  obj: Obj,
  deps: ParticleAnimationDeps
) => {
  const { canvasRef, setMeteors } = deps;
  const canvas = canvasRef.current;
  if (!canvas) return;
  
  const rect = canvas.getBoundingClientRect();
  const viewW = rect.width;
  const viewH = rect.height;
  
  // 画面右上から左下へ（ビュー座標系で開始）
  const startX = viewW + 100; // 右端外
  const startY = -200 + Math.random() * 400; // 上端外（高さランダム -200～200）
  
  const meteorsList: Array<{
    offsetX: number;
    offsetY: number;
    vx: number;
    vy: number;
    size: number;
    rotation: number;
    swayOffset: number;
    swaySpeed: number;
    life: number;
  }> = [];
  
  // ランダムな大きさの隕石1つ
  const randomSize = 0.2 + Math.random() * 1.1; // 0.2～1.3のランダムサイズ（幅拡大）
  meteorsList.push({
    offsetX: 0,
    offsetY: 0,
    vx: -2.0, // 左へ（スピードアップ）
    vy: 2.0, // 下へ（スピードアップ）
    size: randomSize, // ランダムサイズ
    rotation: -Math.PI / 4, // -45度（表示用、実際は回転しない）
    swayOffset: Math.random() * Math.PI * 2,
    swaySpeed: 0.08, // 揺れを細かく
    life: 1.0,
  });
  
  // 既存の隕石に追加（消さない）
  setMeteors(prev => [...prev, {
    x: startX,
    y: startY,
    meteors: meteorsList,
    startTime: Date.now(),
  }]);
};

// 紙吹雪アニメーション開始
export const startConfettiAnimation = (
  x: number,
  y: number,
  deps: Pick<ParticleAnimationDeps, 'setConfettiAnimations'>
) => {
  const { setConfettiAnimations } = deps;
  const confetti: ConfettiAnimation['confetti'] = [];
  const colors = ['#ff6b9d', '#ffd93d', '#6bcf7f', '#6eb5ff', '#c77dff', '#ff5252', '#ffeb3b'];
  const shapes: Array<'rectangle' | 'circle' | 'star'> = ['rectangle', 'circle', 'star'];
  for (let i = 0; i < 80; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 4;
    confetti.push({
      offsetX: 0,
      offsetY: 0,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      width: 5 + Math.random() * 5,
      height: 8 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      life: 5 + Math.random() * 3,
    });
  }
  setConfettiAnimations(prev => [...prev, { x, y, confetti, startTime: Date.now() }]);
};

// 爆発アニメーション開始関数
export const startExplosionAnimation = (
  obj: Obj,
  deps: Pick<ParticleAnimationDeps, 'canvasRef' | 'cfg' | 'num' | 'mapToScreen' | 'setExplosionAnimations'>
) => {
  const { canvasRef, cfg, num, mapToScreen, setExplosionAnimations } = deps;
  const canvas = canvasRef.current;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const viewW = rect.width;
  const viewH = rect.height;
  const objMapX = (num(obj.x, 0) + num(obj.w, 1) / 2) * cfg.cell;
  const objMapY = (num(obj.y, 0) + num(obj.h, 1) / 2) * cfg.cell;
  const { sx: centerX, sy: centerY } = mapToScreen(objMapX, objMapY, viewW, viewH);
  
  const particles: ExplosionAnimation['particles'] = [];
  for (let i = 0; i < 50; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 5 + 2;
    particles.push({
      offsetX: 0, offsetY: 0, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      size: Math.random() * 8 + 4,
      color: ['#ff4500', '#ff6347', '#ffa500', '#ffff00'][Math.floor(Math.random() * 4)],
      opacity: 1, life: Math.random() + 1,
    });
  }
  setExplosionAnimations(prev => [...prev, {
    x: centerX, y: centerY, mapX: objMapX, mapY: objMapY, particles,
    shockwave: { radius: 0, alpha: 1 }, flash: 1, startTime: Date.now(), targetObj: obj,
  }]);
};

// 光の粒アニメーション開始関数
export const startLightParticleAnimation = (
  obj: Obj,
  deps: Pick<ParticleAnimationDeps, 'canvasRef' | 'cfg' | 'num' | 'mapToScreen' | 'setLightParticleAnimations'>
) => {
  const { canvasRef, cfg, num, mapToScreen, setLightParticleAnimations } = deps;
  const canvas = canvasRef.current;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const viewW = rect.width;
  const viewH = rect.height;
  const objMapX = (num(obj.x, 0) + num(obj.w, 1) / 2) * cfg.cell;
  const objMapY = (num(obj.y, 0) + num(obj.h, 1) / 2) * cfg.cell;
  const { sx: centerX, sy: centerY } = mapToScreen(objMapX, objMapY, viewW, viewH);
  
  const particles: LightParticleAnimation['particles'] = [];
  for (let i = 0; i < 25; i++) {
    particles.push({
      offsetX: (Math.random() - 0.5) * 20, offsetY: 0,
      vx: (Math.random() - 0.5) * 1, vy: -(Math.random() * 2 + 1),
      size: Math.random() * 4 + 2, opacity: 1,
      color: ['#ffffff', '#ffff00', '#00ffff', '#ff00ff'][Math.floor(Math.random() * 4)],
      life: Math.random() * 2 + 1,
    });
  }
  setLightParticleAnimations(prev => [...prev, { x: centerX, y: centerY, mapX: objMapX, mapY: objMapY, particles, startTime: Date.now(), targetObj: obj }]);
};

// 宝石アニメーション開始関数
export const startGemAnimation = (
  obj: Obj,
  deps: Pick<ParticleAnimationDeps, 'canvasRef' | 'cfg' | 'num' | 'mapToScreen' | 'setGemAnimations'>
) => {
  const { canvasRef, cfg, num, mapToScreen, setGemAnimations } = deps;
  const canvas = canvasRef.current;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const viewW = rect.width;
  const viewH = rect.height;
  const objMapX = (num(obj.x, 0) + num(obj.w, 1) / 2) * cfg.cell;
  const objMapY = (num(obj.y, 0) + num(obj.h, 1) / 2) * cfg.cell;
  const { sx: centerX, sy: centerY } = mapToScreen(objMapX, objMapY, viewW, viewH);
  
  const gems: GemAnimation['gems'] = [];
  for (let i = 0; i < 15; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + 1;
    gems.push({
      offsetX: 0, offsetY: 0, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 4,
      size: Math.random() * 12 + 8, rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      color: ['#ff0080', '#00ffff', '#ffff00', '#00ff00', '#ff00ff'][Math.floor(Math.random() * 5)],
      sparkle: Math.random(), life: Math.random() * 2 + 1.5,
    });
  }
  setGemAnimations(prev => [...prev, { x: centerX, y: centerY, mapX: objMapX, mapY: objMapY, gems, startTime: Date.now(), targetObj: obj }]);
};

// 星の軌跡アニメーション開始関数
export const startStarTrailAnimation = (
  obj: Obj,
  deps: Pick<ParticleAnimationDeps, 'canvasRef' | 'cfg' | 'num' | 'mapToScreen' | 'setStarTrailAnimations'>
) => {
  const { canvasRef, cfg, num, mapToScreen, setStarTrailAnimations } = deps;
  const canvas = canvasRef.current;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const viewW = rect.width;
  const viewH = rect.height;
  const objMapX = (num(obj.x, 0) + num(obj.w, 1) / 2) * cfg.cell;
  const objMapY = (num(obj.y, 0) + num(obj.h, 1) / 2) * cfg.cell;
  const { sx: centerX, sy: centerY } = mapToScreen(objMapX, objMapY, viewW, viewH);
  
  const stars: StarTrailAnimation['stars'] = [];
  for (let i = 0; i < 5; i++) {
    stars.push({
      angle: (Math.PI * 2 * i) / 5, radius: 60, size: 8, speed: 0.05,
      trail: [], color: ['#ffff00', '#00ffff', '#ff00ff', '#00ff00'][Math.floor(Math.random() * 4)],
    });
  }
  setStarTrailAnimations(prev => [...prev, { x: centerX, y: centerY, mapX: objMapX, mapY: objMapY, stars, rotation: 0, startTime: Date.now(), life: 5, targetObj: obj }]);
};
