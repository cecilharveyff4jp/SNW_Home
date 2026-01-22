import type { Obj } from '../types';
import type { FishQuestion } from '../data/fishQuestions';
import type { YojijukugoQuestion } from '../data/yojijukugoQuestions';
import type { EnglishQuestion } from '../data/englishQuestions';
import type { MuscleQuestion } from '../data/muscleQuestions';
import type { MovieQuestion } from '../data/movieQuestions';
import type { RamenQuestion } from '../data/ramenQuestions';
import type { HeritageQuestion } from '../data/heritageQuestions';
import type { SweetsQuestion } from '../data/sweetsQuestions';

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

// 映画クイズアニメーション用
export type MovieQuizState = {
  x: number;
  y: number;
  question: MovieQuestion;
  choices: string[];
  state: 'showing' | 'answering' | 'correct' | 'wrong' | 'insufficient_coins';
  selectedAnswer: string | null;
  startTime: number;
  reward: number;
  consecutiveCount: number;
};

// ラーメンクイズアニメーション用
export type RamenQuizState = {
  x: number;
  y: number;
  question: RamenQuestion;
  choices: string[];
  state: 'showing' | 'answering' | 'correct' | 'wrong' | 'insufficient_coins';
  selectedAnswer: string | null;
  startTime: number;
  reward: number;
  consecutiveCount: number;
};

// 世界遺産クイズアニメーション用
export type HeritageQuizState = {
  x: number;
  y: number;
  question: HeritageQuestion;
  choices: string[];
  state: 'showing' | 'answering' | 'correct' | 'wrong' | 'insufficient_coins';
  selectedAnswer: string | null;
  startTime: number;
  reward: number;
  consecutiveCount: number;
};

// スイーツクイズアニメーション用
export type SweetsQuizState = {
  x: number;
  y: number;
  question: SweetsQuestion;
  choices: string[];
  state: 'showing' | 'answering' | 'correct' | 'wrong' | 'insufficient_coins';
  selectedAnswer: string | null;
  startTime: number;
  reward: number;
  consecutiveCount: number;
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

// ============== 新規追加アニメーション60種類以上 ==============

// 1. クリスタルアニメーション（キラキラ光る結晶）
export type CrystalAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  crystals: Array<{
    offsetX: number;
    offsetY: number;
    size: number;
    rotation: number;
    rotationSpeed: number;
    opacity: number;
    color: string; // ダイヤモンド、ルビー、サファイア等
    glowIntensity: number;
    life: number;
  }>;
  startTime: number;
  targetObj: Obj;
};

// 2. シャボン玉アニメーション（浮遊するシャボン玉）
export type BubbleAnimation = {
  mapX: number;
  mapY: number;
  x: number;
  y: number;
  bubbles: Array<{
    offsetX: number;
    offsetY: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    rainbowPhase: number; // 虹色の位相
    life: number;
  }>;
  startTime: number;
};

// 3. 音符アニメーション（音楽記号が踊る）
export type MusicNoteAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  notes: Array<{
    offsetX: number;
    offsetY: number;
    vy: number;
    noteType: '♩' | '♪' | '♫' | '♬'; // 音符の種類
    size: number;
    rotation: number;
    opacity: number;
    life: number;
  }>;
  startTime: number;
  targetObj: Obj;
};

// 4. ハートアニメーション（ハートが舞う）
export type HeartAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  hearts: Array<{
    offsetX: number;
    offsetY: number;
    vx: number;
    vy: number;
    size: number;
    rotation: number;
    color: string; // ピンク、赤、紫等
    pulse: number; // 脈動
    opacity: number;
    life: number;
  }>;
  startTime: number;
  targetObj: Obj;
};

// 5. 星座アニメーション（星が線で繋がる）
export type ConstellationAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  stars: Array<{
    offsetX: number;
    offsetY: number;
    size: number;
    twinkle: number;
    connections: number[]; // 他の星へのインデックス
  }>;
  lineAlpha: number;
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 6. 電気アニメーション（ビリビリ電撃）
export type ElectricAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  bolts: Array<{
    segments: Array<{ x: number; y: number }>;
    thickness: number;
    alpha: number;
    life: number;
  }>;
  sparks: Array<{
    offsetX: number;
    offsetY: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    life: number;
  }>;
  startTime: number;
  targetObj: Obj;
};

// 7. 氷アニメーション（氷の結晶）
export type IceAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  crystals: Array<{
    offsetX: number;
    offsetY: number;
    size: number;
    rotation: number;
    opacity: number;
    life: number;
  }>;
  frost: {
    radius: number;
    alpha: number;
  };
  startTime: number;
  targetObj: Obj;
};

// 8. 桜吹雪アニメーション（強化版）
export type SakuraAnimation = {
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
    opacity: number;
    life: number;
  }>;
  startTime: number;
  targetObj: Obj;
};

// 9. ダンデライオンアニメーション（たんぽぽの綿毛）
export type DandelionAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  seeds: Array<{
    offsetX: number;
    offsetY: number;
    vx: number;
    vy: number;
    rotation: number;
    size: number;
    opacity: number;
    life: number;
  }>;
  startTime: number;
  targetObj: Obj;
};

// 10. クラウンアニメーション（王冠が輝く）
export type CrownAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  crown: {
    size: number;
    rotation: number;
    glow: number;
    opacity: number;
  };
  jewels: Array<{
    offsetX: number;
    offsetY: number;
    sparkle: number;
    color: string;
  }>;
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 11. ドラゴンブレスアニメーション（ドラゴンの炎）
export type DragonBreathAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  flames: Array<{
    offsetX: number;
    offsetY: number;
    vx: number;
    vy: number;
    size: number;
    rotation: number;
    color: string;
    opacity: number;
    life: number;
  }>;
  smoke: Array<{
    offsetX: number;
    offsetY: number;
    size: number;
    opacity: number;
    life: number;
  }>;
  startTime: number;
  targetObj: Obj;
};

// 12. 月光アニメーション（月の光が降り注ぐ）
export type MoonbeamAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  beams: Array<{
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
    opacity: number;
    shimmer: number;
  }>;
  particles: Array<{
    offsetX: number;
    offsetY: number;
    vy: number;
    size: number;
    opacity: number;
    life: number;
  }>;
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 13. プリズムアニメーション（虹色の光が反射）
export type PrismAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  rays: Array<{
    angle: number;
    length: number;
    color: string;
    opacity: number;
  }>;
  rotation: number;
  sparkles: Array<{
    offsetX: number;
    offsetY: number;
    size: number;
    color: string;
    opacity: number;
    life: number;
  }>;
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 14. ポータルアニメーション（次元の扉）
export type PortalAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  rings: Array<{
    radius: number;
    rotation: number;
    color: string;
    opacity: number;
  }>;
  particles: Array<{
    angle: number;
    radius: number;
    speed: number;
    size: number;
    color: string;
  }>;
  innerGlow: number;
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 15. オーラアニメーション（神秘的な輝き）
export type AuraBeamAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  layers: Array<{
    radius: number;
    opacity: number;
    color: string;
    rotation: number;
  }>;
  particles: Array<{
    angle: number;
    radius: number;
    size: number;
    opacity: number;
  }>;
  pulse: number;
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 16. 稲妻の鎖アニメーション（連鎖する雷）
export type ChainLightningAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  chains: Array<{
    points: Array<{ x: number; y: number }>;
    thickness: number;
    alpha: number;
    color: string;
    life: number;
  }>;
  startTime: number;
  duration: number;
};

// 17. ネオンサインアニメーション（光るネオン）
export type NeonSignAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  text: string;
  flicker: number;
  color: string;
  glowIntensity: number;
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 18. レーザービームアニメーション（レーザー光線）
export type LaserBeamAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  thickness: number;
  color: string;
  opacity: number;
  particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    life: number;
  }>;
  startTime: number;
  life: number;
};

// 19. ホログラムアニメーション（立体映像）
export type HologramAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  scanlines: Array<{
    offsetY: number;
    speed: number;
    opacity: number;
  }>;
  glitch: number;
  color: string;
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 20. サイバーサークルアニメーション（テクノロジー風）
export type CyberCircleAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  circles: Array<{
    radius: number;
    rotation: number;
    segments: number;
    opacity: number;
    color: string;
  }>;
  dataStreams: Array<{
    angle: number;
    progress: number;
    speed: number;
  }>;
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 21. ピクセル爆発アニメーション（レトロゲーム風）
export type PixelExplosionAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  pixels: Array<{
    offsetX: number;
    offsetY: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    life: number;
  }>;
  startTime: number;
  targetObj: Obj;
};

// 22. グリッチアニメーション（画面バグ風）
export type GlitchAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  strips: Array<{
    offsetY: number;
    height: number;
    offsetX: number;
    color: string;
    opacity: number;
  }>;
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 23. 砂嵐アニメーション（砂塵が舞う）
export type SandstormAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    life: number;
  }>;
  startTime: number;
  duration: number;
};

// 24. 時計アニメーション（時計の針が回る）
export type ClockAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  hourHand: { angle: number; length: number };
  minuteHand: { angle: number; length: number };
  secondHand: { angle: number; length: number };
  numbers: Array<{ angle: number; value: number }>;
  glow: number;
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 25. 歯車アニメーション（歯車が回る）
export type GearAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  gears: Array<{
    offsetX: number;
    offsetY: number;
    size: number;
    rotation: number;
    rotationSpeed: number;
    teeth: number;
    color: string;
  }>;
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 26. DNAらせんアニメーション（遺伝子の二重らせん）
export type DNAHelixAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  points: Array<{
    angle: number;
    height: number;
    side: 'left' | 'right';
    size: number;
    color: string;
  }>;
  rotation: number;
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 27. シールドアニメーション（防御バリア）
export type ShieldAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  hexagons: Array<{
    offsetX: number;
    offsetY: number;
    size: number;
    opacity: number;
    flash: number;
  }>;
  barrier: {
    radius: number;
    opacity: number;
    color: string;
  };
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 28. エネルギーボールアニメーション（エネルギー球）
export type EnergyBallAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  core: {
    size: number;
    rotation: number;
    color: string;
    glow: number;
  };
  electricity: Array<{
    angle: number;
    length: number;
    alpha: number;
  }>;
  particles: Array<{
    angle: number;
    radius: number;
    size: number;
  }>;
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 29. テレポートアニメーション（瞬間移動）
export type TeleportAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  phase: 'disappear' | 'appear';
  particles: Array<{
    offsetX: number;
    offsetY: number;
    vy: number;
    size: number;
    opacity: number;
    life: number;
  }>;
  ringExpansion: number;
  startTime: number;
  targetObj: Obj;
};

// 30. 桃の花アニメーション（桃の花びら）
export type PeachBlossomAnimation = {
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
    opacity: number;
    life: number;
  }>;
  startTime: number;
  targetObj: Obj;
};

// 31. 紫陽花アニメーション（あじさいの花）
export type HydrangeaAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  flowers: Array<{
    offsetX: number;
    offsetY: number;
    size: number;
    color: string; // 青、紫、ピンク
    opacity: number;
    growth: number;
    life: number;
  }>;
  startTime: number;
  targetObj: Obj;
};

// 32. 梅の花アニメーション（梅の花びら）
export type PlumeBlossomAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  flowers: Array<{
    offsetX: number;
    offsetY: number;
    size: number;
    rotation: number;
    opacity: number;
    life: number;
  }>;
  petals: Array<{
    offsetX: number;
    offsetY: number;
    vx: number;
    vy: number;
    rotation: number;
    size: number;
    opacity: number;
    life: number;
  }>;
  startTime: number;
  targetObj: Obj;
};

// 33. 蓮の花アニメーション（蓮の花が開く）
export type LotusAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  petals: Array<{
    angle: number;
    openProgress: number;
    size: number;
    color: string;
  }>;
  center: {
    size: number;
    glow: number;
  };
  ripples: Array<{
    radius: number;
    opacity: number;
  }>;
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 34. 竹林アニメーション（竹が揺れる）
export type BambooAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  stalks: Array<{
    offsetX: number;
    height: number;
    sway: number;
    swaySpeed: number;
    opacity: number;
  }>;
  leaves: Array<{
    offsetX: number;
    offsetY: number;
    rotation: number;
    size: number;
    opacity: number;
  }>;
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 35. 提灯アニメーション（提灯が揺れる）
export type LanternAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  lanterns: Array<{
    offsetX: number;
    offsetY: number;
    sway: number;
    glowIntensity: number;
    color: string;
    size: number;
  }>;
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 36. 鯉のぼりアニメーション（鯉のぼりが泳ぐ）
export type KoinoboriAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  koi: Array<{
    offsetX: number;
    offsetY: number;
    size: number;
    color: string;
    wavePhase: number;
    rotation: number;
  }>;
  wind: number;
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 37. 天の川アニメーション（星の川）
export type MilkyWayAnimation = {
  mapX: number;
  mapY: number;
  stars: Array<{
    x: number;
    y: number;
    size: number;
    twinkle: number;
    color: string;
    opacity: number;
  }>;
  stardust: Array<{
    x: number;
    y: number;
    vx: number;
    size: number;
    opacity: number;
    life: number;
  }>;
  startTime: number;
  duration: number;
};

// 38. 太陽アニメーション（太陽が輝く）
export type SunAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  core: {
    size: number;
    glow: number;
    rotation: number;
  };
  rays: Array<{
    angle: number;
    length: number;
    opacity: number;
  }>;
  flares: Array<{
    offsetX: number;
    offsetY: number;
    size: number;
    opacity: number;
    life: number;
  }>;
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 39. 惑星アニメーション（惑星が回る）
export type PlanetAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  planet: {
    size: number;
    rotation: number;
    color: string;
    rings: boolean;
  };
  moons: Array<{
    angle: number;
    radius: number;
    size: number;
    speed: number;
  }>;
  atmosphere: {
    size: number;
    opacity: number;
  };
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 40. 銀河アニメーション（渦巻き銀河）
export type GalaxyAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  arms: Array<{
    angle: number;
    stars: Array<{
      distance: number;
      size: number;
      color: string;
      twinkle: number;
    }>;
  }>;
  rotation: number;
  core: {
    size: number;
    glow: number;
  };
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 41. 彗星アニメーション（彗星が飛ぶ）
export type CometAnimation = {
  mapX: number;
  mapY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  tail: Array<{
    offsetX: number;
    offsetY: number;
    size: number;
    opacity: number;
  }>;
  glow: number;
  startTime: number;
  life: number;
};

// 42. ブラックホールアニメーション（重力で吸い込む）
export type BlackHoleAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  eventHorizon: {
    radius: number;
    rotation: number;
  };
  particles: Array<{
    angle: number;
    radius: number;
    speed: number;
    size: number;
    opacity: number;
  }>;
  distortion: number;
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 43. 超新星爆発アニメーション（星が爆発）
export type SupernovaAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  shockwave: {
    radius: number;
    opacity: number;
  };
  debris: Array<{
    angle: number;
    distance: number;
    speed: number;
    size: number;
    color: string;
    opacity: number;
  }>;
  flash: number;
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 44. ワープアニメーション（ワープ航法）
export type WarpAnimation = {
  mapX: number;
  mapY: number;
  lines: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    length: number;
    opacity: number;
    life: number;
  }>;
  startTime: number;
  duration: number;
};

// 45. UFOアニメーション（UFOが飛ぶ）
export type UFOAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  ufo: {
    size: number;
    rotation: number;
    tilt: number;
  };
  lights: Array<{
    angle: number;
    color: string;
    blink: number;
  }>;
  beam: {
    width: number;
    height: number;
    opacity: number;
  };
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 46. エイリアンアニメーション（宇宙人が登場）
export type AlienAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  alien: {
    size: number;
    eyeBlink: number;
    antennaWave: number;
  };
  particles: Array<{
    offsetX: number;
    offsetY: number;
    size: number;
    color: string;
    opacity: number;
    life: number;
  }>;
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 47. ロボットアニメーション（ロボットが動く）
export type RobotAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  robot: {
    size: number;
    rotation: number;
    eyeGlow: number;
  };
  sparks: Array<{
    offsetX: number;
    offsetY: number;
    vx: number;
    vy: number;
    size: number;
    life: number;
  }>;
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 48. メカニカルアニメーション（機械的な動き）
export type MechanicalAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  parts: Array<{
    offsetX: number;
    offsetY: number;
    size: number;
    rotation: number;
    type: 'gear' | 'piston' | 'lever';
    movement: number;
  }>;
  steam: Array<{
    offsetX: number;
    offsetY: number;
    vy: number;
    size: number;
    opacity: number;
    life: number;
  }>;
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 49. 工場アニメーション（工場が稼働）
export type FactoryAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  conveyor: {
    speed: number;
    items: Array<{
      position: number;
      type: string;
    }>;
  };
  smoke: Array<{
    offsetX: number;
    offsetY: number;
    vy: number;
    size: number;
    opacity: number;
    life: number;
  }>;
  lights: Array<{
    x: number;
    y: number;
    blink: number;
    color: string;
  }>;
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 50. 虹の橋アニメーション（虹の架け橋）
export type RainbowBridgeAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  arc: {
    startAngle: number;
    endAngle: number;
    radius: number;
    width: number;
  };
  sparkles: Array<{
    angle: number;
    radius: number;
    size: number;
    color: string;
    twinkle: number;
  }>;
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 51. 雲アニメーション（雲が流れる）
export type CloudAnimation = {
  mapX: number;
  mapY: number;
  clouds: Array<{
    x: number;
    y: number;
    vx: number;
    size: number;
    opacity: number;
    puffiness: number;
  }>;
  startTime: number;
  duration: number;
};

// 52. 霧アニメーション（霧が立ち込める）
export type FogAnimation = {
  mapX: number;
  mapY: number;
  layers: Array<{
    y: number;
    opacity: number;
    speed: number;
    density: number;
  }>;
  startTime: number;
  duration: number;
};

// 53. 嵐アニメーション（嵐が荒れ狂う）
export type StormAnimation = {
  mapX: number;
  mapY: number;
  rain: Array<{
    x: number;
    y: number;
    vy: number;
    length: number;
    opacity: number;
  }>;
  lightning: Array<{
    segments: Array<{ x: number; y: number }>;
    alpha: number;
    life: number;
  }>;
  wind: number;
  darkness: number;
  startTime: number;
  duration: number;
};

// 54. 津波アニメーション（大波が押し寄せる）
export type TsunamiAnimation = {
  mapX: number;
  mapY: number;
  wave: {
    x: number;
    height: number;
    speed: number;
    foam: Array<{
      offsetX: number;
      offsetY: number;
      size: number;
      opacity: number;
    }>;
  };
  splashes: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    life: number;
  }>;
  startTime: number;
  life: number;
};

// 55. 地震アニメーション（地面が揺れる）
export type EarthquakeAnimation = {
  mapX: number;
  mapY: number;
  shakeIntensity: number;
  cracks: Array<{
    x: number;
    y: number;
    angle: number;
    length: number;
    width: number;
    opacity: number;
  }>;
  debris: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    rotation: number;
    size: number;
    life: number;
  }>;
  startTime: number;
  duration: number;
};

// 56. 火山噴火アニメーション（火山が噴火）
export type VolcanoAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  lava: Array<{
    offsetX: number;
    offsetY: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    life: number;
  }>;
  smoke: Array<{
    offsetX: number;
    offsetY: number;
    vy: number;
    size: number;
    opacity: number;
    life: number;
  }>;
  ash: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    life: number;
  }>;
  startTime: number;
  targetObj: Obj;
};

// 57. オーシャンアニメーション（海の波）
export type OceanAnimation = {
  mapX: number;
  mapY: number;
  waves: Array<{
    x: number;
    amplitude: number;
    frequency: number;
    speed: number;
    foam: boolean;
  }>;
  bubbles: Array<{
    x: number;
    y: number;
    vy: number;
    size: number;
    opacity: number;
    life: number;
  }>;
  startTime: number;
  duration: number;
};

// 58. 滝アニメーション（滝が流れる）
export type WaterfallAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  water: Array<{
    offsetX: number;
    offsetY: number;
    vy: number;
    size: number;
    opacity: number;
  }>;
  mist: Array<{
    offsetX: number;
    offsetY: number;
    vy: number;
    size: number;
    opacity: number;
    life: number;
  }>;
  splash: {
    particles: Array<{
      vx: number;
      vy: number;
      size: number;
      life: number;
    }>;
  };
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 59. 温泉アニメーション（温泉の湯気）
export type OnsenAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  steam: Array<{
    offsetX: number;
    offsetY: number;
    vy: number;
    size: number;
    opacity: number;
    life: number;
  }>;
  bubbles: Array<{
    offsetX: number;
    offsetY: number;
    vy: number;
    size: number;
    life: number;
  }>;
  ripples: Array<{
    radius: number;
    opacity: number;
  }>;
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 60. キャンプファイヤーアニメーション（キャンプファイヤー）
export type CampfireAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  flames: Array<{
    offsetX: number;
    offsetY: number;
    size: number;
    height: number;
    flicker: number;
    color: string;
    opacity: number;
  }>;
  sparks: Array<{
    offsetX: number;
    offsetY: number;
    vy: number;
    size: number;
    life: number;
  }>;
  glow: {
    radius: number;
    intensity: number;
  };
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 61. 宝箱アニメーション（宝箱が開く）
export type TreasureChestAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  lid: {
    openProgress: number;
    angle: number;
  };
  treasures: Array<{
    offsetX: number;
    offsetY: number;
    vy: number;
    type: 'coin' | 'gem' | 'crown';
    rotation: number;
    size: number;
    life: number;
  }>;
  glow: {
    intensity: number;
    color: string;
  };
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 62. マジックワンドアニメーション（魔法の杖）
export type MagicWandAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  wand: {
    angle: number;
    glow: number;
  };
  sparkles: Array<{
    offsetX: number;
    offsetY: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    opacity: number;
    life: number;
  }>;
  trail: Array<{
    x: number;
    y: number;
    opacity: number;
  }>;
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 63. ポーションアニメーション（薬瓶から泡）
export type PotionAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  bottle: {
    size: number;
    liquidColor: string;
    shake: number;
  };
  bubbles: Array<{
    offsetY: number;
    size: number;
    speed: number;
    opacity: number;
  }>;
  vapor: Array<{
    offsetX: number;
    offsetY: number;
    vy: number;
    size: number;
    color: string;
    opacity: number;
    life: number;
  }>;
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 64. 魔法書アニメーション（魔法書が開く）
export type SpellbookAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  book: {
    openProgress: number;
    glowIntensity: number;
  };
  runes: Array<{
    offsetX: number;
    offsetY: number;
    symbol: string;
    rotation: number;
    opacity: number;
    color: string;
  }>;
  particles: Array<{
    offsetX: number;
    offsetY: number;
    vx: number;
    vy: number;
    size: number;
    life: number;
  }>;
  startTime: number;
  life: number;
  targetObj: Obj;
};

// 65. パーティクルエクスプロージョン（派手な爆発）
export type ParticleExplosionAnimation = {
  x: number;
  y: number;
  mapX: number;
  mapY: number;
  particles: Array<{
    angle: number;
    speed: number;
    distance: number;
    size: number;
    color: string;
    opacity: number;
    trail: Array<{ x: number; y: number; alpha: number }>;
  }>;
  shockwave: {
    radius: number;
    opacity: number;
  };
  flash: number;
  startTime: number;
  targetObj: Obj;
};
