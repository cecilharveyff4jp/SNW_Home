import type { Obj } from '../types';
import type { FishQuestion } from '../data/fishQuestions';
import type { YojijukugoQuestion } from '../data/yojijukugoQuestions';
import type { EnglishQuestion } from '../data/englishQuestions';
import type { MuscleQuestion } from '../data/muscleQuestions';

// 兵士アニメーション用
export type SoldierAnimation = {
  from: { x: number; y: number; label: string }; // 出発地（都市）
  to: { x: number; y: number; label: string }; // 目的地（熊罠）
  progress: number; // 0-1のアニメーション進捗
  startTime: number; // アニメーション開始時刻
  randomSeed: number; // ダメージ計算用のランダムシード（固定）
  totalDamage?: number; // 計算済みの合計ダメージ（固定値）
  damages?: Array<{ damage: number; isCritical: boolean }>; // 個別ダメージ配列（固定値）
  recordSaved?: boolean; // 記録保存済みフラグ
  isNewRecord?: boolean; // 新記録フラグ（表示用）
  bearIndex?: number; // 使用する熊画像のインデックス（0-8）
  soldiers: Array<{ // 兵士群（複数の兵士が行進）
    offsetX: number; // 隊列のオフセット
    offsetY: number;
    delay: number; // 出発タイミングのずれ
    type: 'shield' | 'archer' | 'spear'; // 兵士の種類
  }>;
};

// 花火の個別粒子型
export type Firework = {
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  x: number;
  y: number;
};

// 花火アニメーション用
export type FireworksAnimation = {
  x: number;
  y: number;
  mapX: number; // マップ座標X
  mapY: number; // マップ座標Y
  particles: Firework[];
  startTime: number;
};

// キラキラエフェクト用
export type SparkleAnimation = {
  x: number;
  y: number;
  mapX: number; // マップ座標X
  mapY: number; // マップ座標Y
  particles: Array<{
    offsetX: number;
    offsetY: number;
    vx: number; // 速度ベクトルX
    vy: number; // 速度ベクトルY
    size: number;
    rotation: number;
    life: number;
    maxLife: number;
    color: string;
  }>;
  startTime: number;
  targetObj: Obj;
};

// 花吹雪アニメーション用
export type CherryBlossomAnimation = {
  x: number; // スクリーン座標X
  y: number; // スクリーン座標Y
  mapX: number; // マップ座標X
  mapY: number; // マップ座標Y
  particles: Array<{
    offsetX: number; // 中心からのオフセットX
    offsetY: number; // 中心からのオフセットY
    vx: number; // 速度ベクトルX
    vy: number; // 速度ベクトルY
    size: number;
    rotation: number;
    life: number;
    maxLife: number;
    color: string;
  }>;
  startTime: number;
  targetObj: Obj;
};

// 隕石アニメーション用
export type MeteorAnimation = {
  x: number; // スクリーン座標X（開始位置）
  y: number; // スクリーン座標Y（開始位置）
  meteors: Array<{
    offsetX: number;
    offsetY: number;
    vx: number; // 横方向速度
    vy: number; // 縦方向速度
    size: number; // 大きさ（1=大、0.5=小）
    rotation: number;
    swayOffset: number; // 揺れのオフセット
    swaySpeed: number; // 揺れの速度
    life: number;
  }>;
  startTime: number;
};

// コインアニメーション用
export type CoinAnimation = {
  x: number; // スクリーン座標X（開始位置）
  y: number; // スクリーン座標Y（開始位置）
  coins: Array<{
    offsetX: number;
    offsetY: number;
    vx: number; // 横方向速度
    vy: number; // 縦方向速度（初速）
    rotation: number;
    rotationSpeed: number; // 回転速度
    rotationAxis: 'x' | 'y' | 'z'; // 回転軸（縦回転、横回転、斜め回転）
    rotationAngle: number; // 3D回転角度
    size: number; // 大きさ（1=通常、1.5=大当たり）
    life: number;
    isJackpot: boolean; // 大当たりかどうか
  }>;  
  startTime: number;
  totalCoins: number; // このドロップで獲得したコイン枚数
  textPhysics?: { // 「+N枚」テキストの物理演算
    x: number;
    y: number;
    vx: number;
    vy: number;
  };
};

// スロットアニメーション用
export type SlotAnimation = {
  x: number; // スクリーン座標X
  y: number; // スクリーン座標Y
  reels: Array<{
    symbols: string[]; // 絵柄配列
    offset: number; // リールのオフセット
    speed: number; // 回転速度
    stopping: boolean; // 停止中か
    stopped: boolean; // 停止完了か
    finalIndex: number; // 最終的に止まる絵柄のインデックス
    stopTime: number; // 停止開始時刻
  }>;
  startTime: number;
  result: string[]; // 結果（3つの絵柄）
  payout: number; // 配当
  isWin: boolean; // 当たりかどうか
};

// 魚クイズアニメーション用
export type FishQuizState = {
  x: number; // スクリーン座標X
  y: number; // スクリーン座標Y
  question: FishQuestion;
  choices: string[];
  state: 'showing' | 'answering' | 'correct' | 'wrong' | 'insufficient_coins';
  selectedAnswer: string | null;
  startTime: number;
  reward: number;
  consecutiveCount: number; // 連続正解数
};

// 四字熟語クイズアニメーション用
export type YojijukugoState = {
  x: number; // スクリーン座標X
  y: number; // スクリーン座標Y
  question: YojijukugoQuestion;
  choices: string[];
  state: 'showing' | 'answering' | 'correct' | 'wrong' | 'insufficient_coins';
  selectedAnswer: string | null;
  startTime: number;
  reward: number;
  consecutiveCount: number; // 連続正解数
};

// 英単語クイズアニメーション用
export type EnglishQuizState = {
  x: number; // スクリーン座標X
  y: number; // スクリーン座標Y
  question: EnglishQuestion;
  choices: string[];
  state: 'showing' | 'answering' | 'correct' | 'wrong' | 'insufficient_coins';
  selectedAnswer: string | null;
  startTime: number;
  reward: number;
  consecutiveCount: number; // 連続正解数
};

// 筋肉クイズアニメーション用
export type MuscleQuizState = {
  x: number; // スクリーン座標X
  y: number; // スクリーン座標Y
  question: MuscleQuestion;
  choices: string[];
  state: 'showing' | 'answering' | 'correct' | 'wrong' | 'insufficient_coins';
  selectedAnswer: string | null;
  startTime: number;
  reward: number;
  consecutiveCount: number; // 連続正解数
};

// 猫アニメーション用
export type CatAnimation = {
  from: { x: number; y: number }; // 出発地（マップ座標）
  to: { x: number; y: number }; // 目的地（マップ座標）
  progress: number; // 0-1のアニメーション進捗
  startTime: number; // アニメーション開始時刻
  pawPrints: Array<{ // 足跡の配列
    x: number; // マップ座標X
    y: number; // マップ座標Y
    rotation: number; // 回転角度（ラジアン）
    scale: number; // スケール
    alpha: number; // 透明度
  }>;
  showCat: boolean; // 猫を表示するか
  catAlpha: number; // 猫の透明度
};

// バルーンアニメーション用
export type BalloonAnimation = {
  x: number; // スクリーン座標X
  y: number; // スクリーン座標Y
  balloons: Array<{
    offsetX: number;
    offsetY: number;
    vy: number; // 上昇速度
    swayOffset: number; // 揺れのオフセット
    swaySpeed: number; // 揺れの速度
    size: number; // 大きさ
    color: string; // 色
    life: number; // 残り寿命
    stringLength: number; // 紐の長さ
  }>;
  startTime: number;
};

// オーロラアニメーション用
export type AuroraAnimation = {
  waves: Array<{
    offsetY: number; // Y方向のオフセット
    amplitude: number; // 波の振幅
    frequency: number; // 波の周波数
    speed: number; // 波の速度
    phase: number; // 波の位相
    color: string; // グラデーション色
    alpha: number; // 透明度
  }>;
  startTime: number;
  life: number; // 残り寿命
};

// 蝶々アニメーション用
export type ButterflyAnimation = {
  butterflies: Array<{
    x: number; // スクリーン座標X
    y: number; // スクリーン座標Y
    vx: number; // X方向速度
    vy: number; // Y方向速度
    angle: number; // 進行方向角度
    flutterPhase: number; // 羽ばたき位相
    flutterSpeed: number; // 羽ばたき速度
    size: number; // 大きさ
    color: string; // 色
    life: number; // 残り寿命
    pathType: 'figure8' | 'random'; // 動きのパターン
    pathProgress: number; // パターンの進捗
  }>;
  startTime: number;
};

// 流れ星アニメーション用
export type ShootingStarAnimation = {
  stars: Array<{
    x: number; // スクリーン座標X（開始位置）
    y: number; // スクリーン座標Y（開始位置）
    vx: number; // X方向速度
    vy: number; // Y方向速度
    length: number; // 尾の長さ
    brightness: number; // 明るさ
    life: number; // 残り寿命
    trailPoints: Array<{ x: number; y: number; alpha: number }>; // 尾の軌跡
  }>;
  startTime: number;
};

// 紅葉アニメーション用
export type AutumnLeavesAnimation = {
  x: number; // スクリーン座標X
  y: number; // スクリーン座標Y
  leaves: Array<{
    offsetX: number;
    offsetY: number;
    vx: number; // 横方向速度
    vy: number; // 縦方向速度
    rotation: number; // 回転角度
    rotationSpeed: number; // 回転速度
    swayOffset: number; // 揺れ
    swaySpeed: number; // 揺れ速度
    size: number; // 大きさ
    color: string; // 色（赤、黄、橙）
    leafType: 'maple' | 'ginkgo' | 'oak'; // 葉の種類
    life: number;
  }>;
  startTime: number;
};

// 雪アニメーション用
export type SnowAnimation = {
  snowflakes: Array<{
    x: number; // スクリーン座標X
    y: number; // スクリーン座標Y
    vx: number; // 横方向速度
    vy: number; // 縦方向速度
    size: number; // 大きさ
    rotation: number; // 回転角度
    rotationSpeed: number; // 回転速度
    swayOffset: number; // 揺れ
    swaySpeed: number; // 揺れ速度
    opacity: number; // 透明度
    life: number;
  }>;
  startTime: number;
  duration: number; // 継続時間
};

// 紙吹雪アニメーション用（強化版）
export type ConfettiAnimation = {
  x: number; // スクリーン座標X
  y: number; // スクリーン座標Y
  confetti: Array<{
    offsetX: number;
    offsetY: number;
    vx: number; // 横方向速度
    vy: number; // 縦方向速度
    rotation: number; // 回転角度
    rotationSpeed: number; // 回転速度
    width: number; // 幅
    height: number; // 高さ
    color: string; // 色
    shape: 'rectangle' | 'circle' | 'star'; // 形状
    life: number;
  }>;
  startTime: number;
};

// 虹アニメーション用
export type RainbowAnimation = {
  x: number; // スクリーン座標X（中心）
  y: number; // スクリーン座標Y（アーチの底）
  radius: number; // 虹の半径
  width: number; // 虹の幅
  alpha: number; // 透明度
  life: number; // 残り寿命
  startTime: number;
};

// 雨アニメーション用
export type RainAnimation = {
  raindrops: Array<{
    x: number; // スクリーン座標X
    y: number; // スクリーン座標Y
    vy: number; // 落下速度
    length: number; // 雨粒の長さ
    opacity: number; // 透明度
    splash: boolean; // 地面に当たったか
    splashProgress: number; // 跳ね返り進捗
    life: number;
  }>;
  startTime: number;
  duration: number; // 継続時間
};

// 魔法陣アニメーション用
export type MagicCircleAnimation = {
  x: number; // スクリーン座標X
  y: number; // スクリーン座標Y
  mapX: number; // マップ座標X
  mapY: number; // マップ座標Y
  radius: number; // 魔法陣の半径
  rotation: number; // 回転角度
  rotationSpeed: number; // 回転速度
  alpha: number; // 透明度
  life: number; // 残り寿命
  glowIntensity: number; // 発光の強さ
  startTime: number;
  targetObj: Obj;
};

// 炎アニメーション用
export type FlameAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  flames: Array<{
    offsetX: number;
    offsetY: number;
    size: number;
    vy: number;
    opacity: number;
    color: string;
    life: number;
    flicker: number;
  }>;
  startTime: number;
  targetObj: Obj;
};

// 雷アニメーション用
export type ThunderAnimation = {
  segments: Array<{
    x: number;
    y: number;
    endX: number;
    endY: number;
    alpha: number;
    thickness: number;
  }>;
  startTime: number;
  life: number;
};

// 波/水しぶきアニメーション用
export type WaveAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  drops: Array<{
    offsetX: number;
    offsetY: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    life: number;
  }>;
  rings: Array<{
    radius: number;
    alpha: number;
    speed: number;
  }>;
  startTime: number;
  targetObj: Obj;
};

// 風/葉アニメーション用
export type WindAnimation = {
  leaves: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    rotation: number;
    rotationSpeed: number;
    opacity: number;
    life: number;
    color: string;
  }>;
  startTime: number;
  duration: number;
};

// 煙/霧アニメーション用
export type SmokeAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  clouds: Array<{
    offsetX: number;
    offsetY: number;
    size: number;
    vy: number;
    opacity: number;
    expansion: number;
    life: number;
  }>;
  startTime: number;
  targetObj: Obj;
};

// 竜巻アニメーション用
export type TornadoAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  particles: Array<{
    angle: number;
    height: number;
    radius: number;
    speed: number;
    size: number;
    opacity: number;
  }>;
  rotation: number;
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 宝石アニメーション用
export type GemAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  gems: Array<{
    offsetX: number;
    offsetY: number;
    vx: number;
    vy: number;
    size: number;
    rotation: number;
    rotationSpeed: number;
    color: string;
    sparkle: number;
    life: number;
  }>;
  startTime: number;
  targetObj: Obj;
};

// 星の軌跡アニメーション用
export type StarTrailAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  stars: Array<{
    angle: number;
    radius: number;
    size: number;
    speed: number;
    trail: Array<{ x: number; y: number; alpha: number }>;
    color: string;
  }>;
  rotation: number;
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 光の粒アニメーション用
export type LightParticleAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  particles: Array<{
    offsetX: number;
    offsetY: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    color: string;
    life: number;
  }>;
  startTime: number;
  targetObj: Obj;
};

// スパイラルアニメーション用
export type SpiralAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  particles: Array<{
    angle: number;
    radius: number;
    height: number;
    size: number;
    color: string;
    opacity: number;
  }>;
  rotation: number;
  expansion: number;
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 鳥/羽アニメーション用
export type BirdAnimation = {
  birds: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    wingPhase: number;
    rotation: number;
    life: number;
  }>;
  feathers: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    rotation: number;
    rotationSpeed: number;
    size: number;
    opacity: number;
    life: number;
  }>;
  startTime: number;
  duration: number;
};

// ゴーストアニメーション用
export type GhostAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  ghosts: Array<{
    offsetX: number;
    offsetY: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    wavePhase: number;
    life: number;
  }>;
  startTime: number;
  targetObj: Obj;
};

// 蜂アニメーション用
export type BeeAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  bees: Array<{
    offsetX: number;
    offsetY: number;
    angle: number;
    radius: number;
    speed: number;
    wingPhase: number;
    size: number;
    life: number;
  }>;
  startTime: number;
  targetObj: Obj;
};

// 蛍アニメーション用
export type FireflyAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  fireflies: Array<{
    offsetX: number;
    offsetY: number;
    vx: number;
    vy: number;
    glow: number;
    glowPhase: number;
    size: number;
    life: number;
  }>;
  startTime: number;
  targetObj: Obj;
};

// 爆発アニメーション用
export type ExplosionAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  particles: Array<{
    offsetX: number;
    offsetY: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    opacity: number;
    life: number;
  }>;
  shockwave: {
    radius: number;
    alpha: number;
  };
  flash: number;
  startTime: number;
  targetObj: Obj;
};

// ターゲットアニメーション用
export type TargetAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  rings: Array<{
    radius: number;
    alpha: number;
    speed: number;
  }>;
  crosshair: {
    size: number;
    rotation: number;
    alpha: number;
  };
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 怒りマークアニメーション用
export type AngerAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  marks: Array<{
    offsetX: number;
    offsetY: number;
    size: number;
    rotation: number;
    opacity: number;
    bounce: number;
    life: number;
  }>;
  startTime: number;
  targetObj: Obj;
};

// 花びらアニメーション用
export type PetalAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  petals: Array<{
    offsetX: number;
    offsetY: number;
    vx: number;
    vy: number;
    rotation: number;
    rotationSpeed: number;
    size: number;
    color: string;
    opacity: number;
    life: number;
  }>;
  startTime: number;
  targetObj: Obj;
};

// ひまわりアニメーション用
export type SunflowerAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  flowers: Array<{
    offsetX: number;
    offsetY: number;
    size: number;
    rotation: number;
    growth: number;
    opacity: number;
    life: number;
  }>;
  seeds: Array<{
    offsetX: number;
    offsetY: number;
    vx: number;
    vy: number;
    size: number;
    rotation: number;
    life: number;
  }>;
  startTime: number;
  targetObj: Obj;
};

// バラアニメーション用
export type RoseAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  petals: Array<{
    offsetX: number;
    offsetY: number;
    vx: number;
    vy: number;
    rotation: number;
    rotationSpeed: number;
    size: number;
    layer: number;
    opacity: number;
    life: number;
  }>;
  sparkles: Array<{
    offsetX: number;
    offsetY: number;
    size: number;
    opacity: number;
    life: number;
  }>;
  startTime: number;
  targetObj: Obj;
};

// おみくじ確認ウィンドウ用
export type OmikujiConfirmAnimation = {
  x: number; // 表示位置X
  y: number; // 表示位置Y
  startTime: number; // アニメーション開始時刻
  cityLabel: string; // クリックした都市名
};

// おみくじアニメーション用
export type OmikujiAnimation = {
  x: number; // 表示位置X
  y: number; // 表示位置Y
  phase: 'roulette' | 'result' | 'detail'; // アニメーションフェーズ（ルーレット→結果→詳細）
  progress: number; // 0-1のアニメーション進捗
  startTime: number; // アニメーション開始時刻
  fortune: string; // 運勢の名前
  level: number; // 運勢レベル
  message: string; // メッセージ
  luckyItem: string; // ラッキーアイテム
  coinEffect: number; // コイン増減効果
  rouletteIndex: number; // ルーレット表示中のインデックス
  rouletteSpeed: number; // ルーレットの回転速度
  particles: Array<{ // 演出用パーティクル
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
    size: number;
  }>;
};
