"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

// GitHub Pages用のbasePath設定
const basePath = process.env.NODE_ENV === 'production' ? '/SNW_Home' : '';

type Meta = { 
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
type BgConfig = {
  image: string;  // 画像ファイル名
  centerX: number;  // 中心点X (%)
  centerY: number;  // 中心点Y (%)
  scale: number;  // 拡大率
  opacity: number;  // 透明度 (0-1)
};
type Obj = {
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
};

const FALLBACK = { cols: 60, rows: 40, cellSize: 24 };

function num(v: unknown, fb: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fb;
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function theme(type: string) {
  switch ((type || "").toUpperCase()) {
    case "HQ":
      return { top: "rgba(46,107,255,0.18)", side: "rgba(46,107,255,0.10)", stroke: "#2e6bff" };
    case "BEAR_TRAP":
      return { top: "rgba(255,138,42,0.20)", side: "rgba(255,138,42,0.12)", stroke: "#ff8a2a" };
    case "STATUE":
      return { top: "rgba(33,195,138,0.20)", side: "rgba(33,195,138,0.12)", stroke: "#21c38a" };
    case "CITY":
      return { top: "rgba(181,107,255,0.18)", side: "rgba(181,107,255,0.10)", stroke: "#b56bff" };
    case "DEPOT":
      return { top: "rgba(139,69,19,0.18)", side: "rgba(139,69,19,0.10)", stroke: "#8B4513" };
    case "MOUNTAIN":
      return { top: "rgba(120,113,108,0.18)", side: "rgba(120,113,108,0.10)", stroke: "#78716c" };
    case "LAKE":
      return { top: "rgba(30,64,175,0.18)", side: "rgba(30,64,175,0.10)", stroke: "#1e40af" };
    default:
      return { top: "rgba(17,24,39,0.14)", side: "rgba(17,24,39,0.08)", stroke: "#111827" };
  }
}

// タイプ別のデフォルトサイズ
function getDefaultSize(type: string): { w: number; h: number } {
  switch ((type || "").toUpperCase()) {
    case "HQ":
      return { w: 4, h: 4 };
    case "CITY":
      return { w: 2, h: 2 };
    case "FLAG":
      return { w: 1, h: 1 };
    case "STATUE":
      return { w: 2, h: 2 };
    case "DEPOT":
      return { w: 2, h: 2 };
    case "MOUNTAIN":
      return { w: 1, h: 1 };
    case "LAKE":
      return { w: 1, h: 1 };
    default:
      return { w: 2, h: 2 };
  }
}

// 回転（2D）
function rot(x: number, y: number, angle: number) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: x * c - y * s, y: x * s + y * c };
}

// オブジェクト間の重なり判定
function checkOverlap(obj1: Obj, obj2: Obj): boolean {
  const x1 = num(obj1.x, 0);
  const y1 = num(obj1.y, 0);
  const w1 = Math.max(1, num(obj1.w, 1));
  const h1 = Math.max(1, num(obj1.h, 1));

  const x2 = num(obj2.x, 0);
  const y2 = num(obj2.y, 0);
  const w2 = Math.max(1, num(obj2.w, 1));
  const h2 = Math.max(1, num(obj2.h, 1));

  return !(
    x1 + w1 <= x2 || // obj1 is to the left of obj2
    x2 + w2 <= x1 || // obj2 is to the left of obj1
    y1 + h1 <= y2 || // obj1 is above obj2
    y2 + h2 <= y1    // obj2 is above obj1
  );
}

// 重なっている領域を取得
function getOverlapRect(obj1: Obj, obj2: Obj): { x: number; y: number; w: number; h: number } | null {
  const x1 = num(obj1.x, 0);
  const y1 = num(obj1.y, 0);
  const w1 = Math.max(1, num(obj1.w, 1));
  const h1 = Math.max(1, num(obj1.h, 1));

  const x2 = num(obj2.x, 0);
  const y2 = num(obj2.y, 0);
  const w2 = Math.max(1, num(obj2.w, 1));
  const h2 = Math.max(1, num(obj2.h, 1));

  if (!checkOverlap(obj1, obj2)) return null;

  const overlapX = Math.max(x1, x2);
  const overlapY = Math.max(y1, y2);
  const overlapW = Math.min(x1 + w1, x2 + w2) - overlapX;
  const overlapH = Math.min(y1 + h1, y2 + h2) - overlapY;

  return { x: overlapX, y: overlapY, w: overlapW, h: overlapH };
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tickerCanvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const headerMenuRef = useRef<HTMLDivElement>(null);

  const [meta, setMeta] = useState<Meta>({});
  const [objects, setObjects] = useState<Obj[]>([]);
  const [links, setLinks] = useState<Array<{ name: string; url: string; order: number; display: boolean }>>([]);
  const [err, setErr] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 編集モード
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [editingObject, setEditingObject] = useState<Obj | null>(null);
  const [originalEditingId, setOriginalEditingId] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState<{ name: string; url: string; order: number; display: boolean; index: number } | null>(null);
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [hasUnsavedLinksChanges, setHasUnsavedLinksChanges] = useState(false);
  const [showAddObjectModal, setShowAddObjectModal] = useState(false);
  const [pendingPosition, setPendingPosition] = useState<{ x: number; y: number } | null>(null);
  const [lastSelectedType, setLastSelectedType] = useState("");
  const [modalSelectedType, setModalSelectedType] = useState("");
  const [undoStack, setUndoStack] = useState<Obj[][]>([]);
  const [redoStack, setRedoStack] = useState<Obj[][]>([]);
  const dragStartRef = useRef<{ objId: string; mx: number; my: number; objX: number; objY: number } | null>(null);
  const initialObjectsRef = useRef<Obj[]>([]);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const [showMoveArrows, setShowMoveArrows] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [hoveredLinkIndex, setHoveredLinkIndex] = useState<number | null>(null);
  const [highlightedLinkIndex, setHighlightedLinkIndex] = useState<number | null>(null);
  const [showBirthdayCelebration, setShowBirthdayCelebration] = useState(false);
  const [birthdayPersonName, setBirthdayPersonName] = useState<string>('');
  const [birthdayAnimationStage, setBirthdayAnimationStage] = useState<number>(0); // 0: HappyBirthday, 2: Confetti
  const [isCameraMoving, setIsCameraMoving] = useState(false);
  const cameraMovingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isPositionSizeExpanded, setIsPositionSizeExpanded] = useState(false);

  // 背景設定
  const [bgConfig, setBgConfig] = useState<BgConfig>({
    image: "map-bg.jpg",
    centerX: 50,
    centerY: 50,
    scale: 1.0,
    opacity: 1.0,
  });
  const [showBgConfigModal, setShowBgConfigModal] = useState(false);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  
  // 個人オブジェクト追跡（ローカルストレージ）
  const [myObjectId, setMyObjectId] = useState<string | null>(null);
  const [showMyObjectSelector, setShowMyObjectSelector] = useState(false);
  const [myObjectSearchText, setMyObjectSearchText] = useState('');

  // テロップアニメーション用（LocalStorageで永続化）
  const [tickerHidden, setTickerHidden] = useState(false);
  const [tickerKey, setTickerKey] = useState(0); // テロップリセット用キー（データ再読み込み時のみ更新）

  // スマホ画面判定（768px以下をモバイルとする）
  const [isMobile, setIsMobile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // カメラ：パン(tx,ty)は「画面座標系」での移動量（ピクセル）、scaleは倍率
  // 初期ズーム: 統一して1.0でスタート（SSRハイドレーションエラー回避）
  const [cam, setCam] = useState({ 
    tx: 0, 
    ty: 0, 
    scale: 1.0 
  });

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // 初回のみ、モバイルの場合にズームを調整
      setCam(prev => {
        if (prev.scale === 1.0 && mobile) {
          return { ...prev, scale: 0.78 };
        }
        return prev;
      });
    };
    const checkDarkMode = () => {
      const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(darkMode);
    };
    
    checkMobile();
    checkDarkMode();
    
    window.addEventListener('resize', checkMobile);
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeQuery.addEventListener('change', checkDarkMode);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      darkModeQuery.removeEventListener('change', checkDarkMode);
    };
  }, []);

  // ローカルストレージから設定を読み込み
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 個人オブジェクトIDを読み込み（これは個人設定なのでlocalStorageのまま）
      const savedMyObjectId = localStorage.getItem('snw-my-object-id');
      if (savedMyObjectId) {
        setMyObjectId(savedMyObjectId);
      }
    }
  }, []);

  // 背景画像の読み込み
  useEffect(() => {
    if (bgConfig.image) {
      const img = new Image();
      img.src = `${basePath}/${bgConfig.image}`;
      img.onload = () => {
        bgImageRef.current = img;
        draw(); // 画像読み込み完了後に再描画
      };
      img.onerror = () => {
        console.error('Failed to load background image:', bgConfig.image);
        bgImageRef.current = null;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bgConfig.image]);

  // 背景設定変更時の再描画
  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bgConfig.centerX, bgConfig.centerY, bgConfig.scale, bgConfig.opacity]);

  // ウィンドウリサイズ時の再描画
  useEffect(() => {
    const handleResize = () => {
      // リサイズ時に強制的に再描画をトリガー
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(() => {
        draw();
        rafRef.current = null;
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cam, objects, selectedId, isEditMode, showMoveArrows]);

  // LocalStorageからテロップ表示状態を読み込む
  useEffect(() => {
    const saved = localStorage.getItem('tickerHidden');
    if (saved !== null) {
      setTickerHidden(saved === 'true');
    }
  }, []);

  // tickerHiddenが変わったらLocalStorageに保存
  useEffect(() => {
    localStorage.setItem('tickerHidden', String(tickerHidden));
  }, [tickerHidden]);

  // トースト自動消去
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // テロップはCSS keyframesで実装（state更新なし）
  // useEffect削除

  // テロップテキスト生成（HTML表示用）
  const tickerText = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    
    const getBirthdayMembers = (month: number) => {
      return objects
        .filter(obj => {
          if (!obj.birthday) return false;
          const match = obj.birthday.match(/(\d+)月/);
          if (!match) return false;
          const birthMonth = parseInt(match[1], 10);
          return birthMonth === month;
        })
        .map(obj => ({
          name: obj.label || '名前なし',
          date: obj.birthday!,
          day: parseInt(obj.birthday!.match(/(\d+)日/)?.[1] || '0', 10)
        }))
        .sort((a, b) => a.day - b.day);
    };
    
    const currentMonthMembers = getBirthdayMembers(currentMonth);
    const nextMonthMembers = getBirthdayMembers(nextMonth);
    
    const parts: string[] = [];
    if (currentMonthMembers.length > 0) {
      const memberList = currentMonthMembers.map(m => `${m.date} ${m.name}さん`).join('　');
      parts.push(`今月お誕生日を迎えるメンバーは・・・${memberList}です。　　お誕生日おめでとうございます。`);
    }
    if (nextMonthMembers.length > 0) {
      const memberList = nextMonthMembers.map(m => `${m.date} ${m.name}さん`).join('　');
      parts.push(`来月お誕生日を迎えるメンバーは・・・${memberList}です。`);
    }
    
    return parts.join('　　　　');
  }, [objects]);

  // 誕生日チェック（選択されたオブジェクトのbirthdayフィールドをチェックし、現在の月と一致すれば紙吹雪表示）
  useEffect(() => {
    if (selectedId) {
      const selectedObj = objects.find(o => String(o.id) === selectedId);
      if (selectedObj && selectedObj.birthday) {
        // M月D日 または MM月DD日 のパターンを検出（🎂なし）
        const birthdayPattern = /(\d{1,2})月(\d{1,2})日/;
        const match = selectedObj.birthday.match(birthdayPattern);
        if (match) {
          const birthdayMonth = parseInt(match[1], 10);
          const currentMonth = new Date().getMonth() + 1; // 0-11 → 1-12
          if (birthdayMonth === currentMonth) {
            setBirthdayPersonName((selectedObj as any).name || '');
            setBirthdayAnimationStage(0); // アニメーションを最初から開始
            setShowBirthdayCelebration(true);
          } else {
            setShowBirthdayCelebration(false);
          }
        } else {
          setShowBirthdayCelebration(false);
        }
      } else {
        setShowBirthdayCelebration(false);
      }
    } else {
      setShowBirthdayCelebration(false);
    }
  }, [selectedId, objects]);

  // 誕生日アニメーションステージの自動進行
  useEffect(() => {
    if (!showBirthdayCelebration) return;
    
    if (birthdayAnimationStage === 0) {
      // Happy Birthday表示後、2.5秒でステージ2（紙吹雪）へ
      const timer = setTimeout(() => setBirthdayAnimationStage(2), 2500);
      return () => clearTimeout(timer);
    }
  }, [showBirthdayCelebration, birthdayAnimationStage]);

  // 編集モーダルが開いたときに名前入力欄にフォーカス（一度だけ）
  // selectedIdが変わったときのみフォーカス（同じオブジェクトの編集中は再フォーカスしない）
  const lastFocusedIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (editingObject && selectedId && selectedId !== lastFocusedIdRef.current) {
      lastFocusedIdRef.current = selectedId;
      
      // FLAG, MOUNTAIN, LAKEの場合は読み取り専用なのでフォーカスしない
      const isReadOnly = editingObject.type === "FLAG" || editingObject.type === "MOUNTAIN" || editingObject.type === "LAKE";
      if (!isReadOnly && nameInputRef.current) {
        // モーダルのアニメーションを考慮して少し遅延
        setTimeout(() => {
          const input = nameInputRef.current;
          if (input) {
            input.focus();
            // カーソルを末尾に配置
            const length = input.value.length;
            input.setSelectionRange(length, length);
          }
        }, 100);
      }
    } else if (!editingObject) {
      // モーダルが閉じてもlastFocusedIdRefはリセットしない（次に同じオブジェクトを開いたときに再フォーカスしないため）
    }
  }, [selectedId, editingObject]);

  // ヘッダーメニューの外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showHeaderMenu && headerMenuRef.current && !headerMenuRef.current.contains(e.target as Node)) {
        setShowHeaderMenu(false);
      }
    };
    if (showHeaderMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showHeaderMenu]);

  // ジェスチャ状態（ピンチ）
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchRef = useRef<null | {
    startScale: number;
    startTx: number;
    startTy: number;
    startMid: { x: number; y: number };
    startDist: number;
  }>(null);

  const cfg = useMemo(
    () => ({
      cols: num(meta.cols, FALLBACK.cols),
      rows: num(meta.rows, FALLBACK.rows),
      cell: num(meta.cellSize, FALLBACK.cellSize),
      name: String(meta.mapName || "SNW Map"),
    }),
    [meta]
  );

  // 見た目（実機寄せ）
  const LOOK = useMemo(
    () => ({
      angle: -Math.PI / 4, // 45°
      padding: 40,

      // グリッド
      grid: "rgba(0,0,0,0.06)",
      gridMajor: "rgba(0,0,0,0.10)",
      majorEvery: 5,

      // 選択表現
      glowColor: "rgba(80,160,255,0.55)",
      ringColor: "rgba(80,160,255,0.90)",
    }),
    []
  );

  async function loadMap() {
    setIsLoading(true);
    try {
      setErr(null);
      const base = process.env.NEXT_PUBLIC_GAS_URL;
      if (!base) {
        throw new Error(
          "Google Apps ScriptのURLが設定されていません。.env.localファイルにNEXT_PUBLIC_GAS_URLを設定してください。"
        );
      }

      const res = await fetch(`${base}?action=getMap`, { method: "GET" });
      const json = await res.json();
      if (!json.ok) {
        throw new Error(json.error || "マップデータの取得に失敗しました");
      }

      setMeta(json.meta || {});
      setObjects(Array.isArray(json.objects) ? json.objects : []);
      
      // 背景設定をmetaから読み込み（metaに設定がある場合のみ）
      if (json.meta) {
        const newBgConfig: BgConfig = {
          image: json.meta.bgImage || "map-bg.jpg",
          centerX: json.meta.bgCenterX ?? 50,
          centerY: json.meta.bgCenterY ?? 50,
          scale: json.meta.bgScale ?? 1.0,
          opacity: json.meta.bgOpacity ?? 1.0,
        };
        setBgConfig(newBgConfig);
      }
      
      // リンクデータを取得
      try {
        const linksRes = await fetch(`${base}?action=getLinks`, { method: "GET" });
        const linksJson = await linksRes.json();
        if (linksJson.ok && Array.isArray(linksJson.links)) {
          setLinks(linksJson.links);
        }
      } catch (e) {
        console.error("リンクデータの取得に失敗:", e);
        // リンクの取得に失敗してもマップは表示する
      }
      
      // カメラ位置とズームを特定の座標に設定
      // マイオブジェクトが設定されている場合はその座標、なければデフォルト(18, 19)
      let targetGridX = 18;
      let targetGridY = 19;
      
      // localStorageからmyObjectIdを読み込み、該当するオブジェクトがあればその座標を使用
      if (typeof window !== 'undefined') {
        const savedMyObjectId = localStorage.getItem('snw-my-object-id');
        if (savedMyObjectId) {
          const myObj = (Array.isArray(json.objects) ? json.objects : []).find((o: Obj) => o.id === savedMyObjectId);
          if (myObj && myObj.x !== undefined && myObj.y !== undefined) {
            targetGridX = num(myObj.x, 18);
            targetGridY = num(myObj.y, 19);
          }
        }
      }
      
      const targetScale = window.innerWidth <= 768 ? 0.78 : 1.0;
      
      // メタデータから設定を取得
      const cols = num(json.meta?.cols, FALLBACK.cols);
      const rows = num(json.meta?.rows, FALLBACK.rows);
      const cell = num(json.meta?.cellSize, FALLBACK.cellSize);
      
      // マップ中心（ピクセル座標）
      const cx = (cols * cell) / 2;
      const cy = (rows * cell) / 2;
      
      // 目標位置（ピクセル座標）
      const targetX = targetGridX * cell;
      const targetY = targetGridY * cell;
      
      // マップ中心からのオフセット
      const offsetX = targetX - cx;
      const offsetY = targetY - cy;
      
      // 回転を適用（-45度）
      const angle = -Math.PI / 4;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const rotatedX = offsetX * cos - offsetY * sin;
      const rotatedY = offsetX * sin + offsetY * cos;
      
      // スケールを適用してパン量を計算（逆向き）
      const tx = -rotatedX * targetScale;
      const ty = -rotatedY * targetScale;
      
      setCam({ tx, ty, scale: targetScale });
      
      // カメラ移動中フラグを設定
      setIsCameraMoving(true);
      if (cameraMovingTimerRef.current) clearTimeout(cameraMovingTimerRef.current);
      cameraMovingTimerRef.current = setTimeout(() => setIsCameraMoving(false), 200);
      
      // データ再読み込み時にテロップをリセット
      setTickerKey(prev => prev + 1);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setErr(message);
      console.error("マップ読み込みエラー:", e);
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  }

  useEffect(() => {
    loadMap();
  }, []);

  // キャンバスのホイールイベントでページスクロールを防止 & ズーム機能
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      // ズーム処理
      const delta = -e.deltaY;
      const factor = delta > 0 ? 1.08 : 0.92;
      
      setCam((prev) => {
        const newScale = clamp(prev.scale * factor, 0.35, 2.5);
        return { ...prev, scale: newScale };
      });
      
      // カメラ移動中フラグを設定
      setIsCameraMoving(true);
      if (cameraMovingTimerRef.current) clearTimeout(cameraMovingTimerRef.current);
      cameraMovingTimerRef.current = setTimeout(() => setIsCameraMoving(false), 200);
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, []);

  // キーボードショートカット（Ctrl+Z, Ctrl+Y）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isEditMode) return;
      
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, undoStack, redoStack, objects]);

  // 描画要求（rafで間引き）
  const requestDraw = () => {
    if (rafRef.current != null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      draw();
    });
  };

  // 変換（スクリーン→マップ座標）: タップ選択の当たり判定で使う
  const screenToMap = (sx: number, sy: number, viewW: number, viewH: number) => {
    const mapW = cfg.cols * cfg.cell;
    const mapH = cfg.rows * cfg.cell;
    const cx = mapW / 2;
    const cy = mapH / 2;

    // 画面中心へ
    let x = sx - viewW / 2;
    let y = sy - viewH / 2;

    // パンを戻す
    x -= cam.tx;
    y -= cam.ty;

    // スケールを戻す
    x /= cam.scale;
    y /= cam.scale;

    // 回転を戻す（逆回転）
    const p = rot(x, y, -LOOK.angle);

    // マップ中心を戻す
    return { mx: p.x + cx, my: p.y + cy };
  };

  // オブジェクト選択（マップ座標mx,myが矩形内か）
  const hitTest = (mx: number, my: number) => {
    // 上に描かれる(奥→手前)を優先したいので、y→x降順で当たり判定
    const sorted = [...objects].sort((a, b) => {
      const ay = num(a.y, 0), by = num(b.y, 0);
      const ax = num(a.x, 0), bx = num(b.x, 0);
      // 手前優先＝大きい方から
      return (by - ay) || (bx - ax);
    });

    for (const o of sorted) {
      const x = num(o.x, 0) * cfg.cell;
      const y = num(o.y, 0) * cfg.cell;
      const w = Math.max(1, num(o.w, 1)) * cfg.cell;
      const h = Math.max(1, num(o.h, 1)) * cfg.cell;
      if (mx >= x && mx <= x + w && my >= y && my <= y + h) return o;
    }
    return null;
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // fit to CSS size
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const viewW = rect.width;
    const viewH = rect.height;

    const cell = cfg.cell;
    const mapW = cfg.cols * cell;
    const mapH = cfg.rows * cell;
    const cx = mapW / 2;
    const cy = mapH / 2;

    // 背景をクリア（透明に）
    ctx.clearRect(0, 0, viewW, viewH);
    
    // 背景画像を描画（設定されている場合、ロード完了後のみ）
    if (!isInitialLoading && bgConfig.image && bgImageRef.current) {
      ctx.save();
      ctx.globalAlpha = bgConfig.opacity;
      
      // 画像の実際のサイズ
      const img = bgImageRef.current;
      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;
      
      // 拡大率を適用した画像サイズ
      const scaledW = imgW * bgConfig.scale;
      const scaledH = imgH * bgConfig.scale;
      
      // 中心点の座標（%から実座標へ変換）
      const centerPointX = imgW * (bgConfig.centerX / 100);
      const centerPointY = imgH * (bgConfig.centerY / 100);
      
      // 画像の描画位置を計算（中心点がビューポート中央に来るように）
      const drawX = (viewW / 2) - (centerPointX * bgConfig.scale);
      const drawY = (viewH / 2) - (centerPointY * bgConfig.scale);
      
      ctx.drawImage(img, drawX, drawY, scaledW, scaledH);
      ctx.restore();
    }

    // ===== カメラ変換（中心→パン→ズーム→回転→マップ中心へ）=====
    ctx.save();
    ctx.translate(viewW / 2, viewH / 2);
    ctx.translate(cam.tx, cam.ty);
    ctx.scale(cam.scale, cam.scale);
    ctx.rotate(LOOK.angle);
    ctx.translate(-cx, -cy);

    // グリッド（余白含めて拡張表示）
    // 回転とズームを考慮して、画面全体をカバーする広い範囲を確保
    const gridMargin = Math.max(viewW, viewH) / cam.scale;
    const gridStartX = Math.floor(-gridMargin / cell);
    const gridEndX = Math.ceil((mapW + gridMargin) / cell);
    const gridStartY = Math.floor(-gridMargin / cell);
    const gridEndY = Math.ceil((mapH + gridMargin) / cell);

    // 縦線
    for (let x = gridStartX; x <= gridEndX; x++) {
      const major = x % LOOK.majorEvery === 0;
      ctx.strokeStyle = major ? LOOK.gridMajor : LOOK.grid;
      ctx.lineWidth = major ? 1.2 : 1;
      ctx.beginPath();
      ctx.moveTo(x * cell, gridStartY * cell);
      ctx.lineTo(x * cell, gridEndY * cell);
      ctx.stroke();
    }
    // 横線
    for (let y = gridStartY; y <= gridEndY; y++) {
      const major = y % LOOK.majorEvery === 0;
      ctx.strokeStyle = major ? LOOK.gridMajor : LOOK.grid;
      ctx.lineWidth = major ? 1.2 : 1;
      ctx.beginPath();
      ctx.moveTo(gridStartX * cell, y * cell);
      ctx.lineTo(gridEndX * cell, y * cell);
      ctx.stroke();
    }


    // Draw order
    // 描画順：奥→手前（y→x）で自然に重なる
    const sorted = [...objects].sort((a, b) => {
      const ay = num(a.y, 0), by = num(b.y, 0);
      const ax = num(a.x, 0), bx = num(b.x, 0);
      return (ay - by) || (ax - bx);
    });

    for (const o of sorted) {
      const id = String(o.id || "");
      const gx = num(o.x, 0) * cell;
      const gy = num(o.y, 0) * cell;
      const gw = Math.max(1, num(o.w, 1)) * cell;
      const gh = Math.max(1, num(o.h, 1)) * cell;

      const th = theme(o.type || "");
      
      // 選択中のオブジェクトの重なり判定
      const isSelected = selectedId && id && selectedId === id;
      const isDraggingThis = isDragging && dragStartRef.current?.objId === id;
      const hasOverlap = isSelected && isEditMode && objects.some(other => 
        other.id !== id && checkOverlap(o, other)
      );

      // 未保存の変更を検出（編集モード時）
      // 実際に変更されたオブジェクトのみを判定
      const isModified = isEditMode && initialObjectsRef.current.length > 0 && (() => {
        const initial = initialObjectsRef.current.find(orig => orig.id === id);
        if (!initial && id.startsWith("obj_")) return true; // 新規追加
        if (!initial) return false;
        // 各プロパティを比較して実際に変更があったかチェック
        return (
          initial.x !== o.x ||
          initial.y !== o.y ||
          initial.w !== o.w ||
          initial.h !== o.h ||
          initial.type !== o.type ||
          initial.label !== o.label ||
          initial.isFavorite !== o.isFavorite
        );
      })();

      // Flat rectangle rendering
      ctx.save();
      
      // ドラッグ中の視覚的エフェクト（影と浮かび）
      if (isDraggingThis) {
        ctx.shadowColor = "rgba(0,0,0,0.4)";
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;
        // 少し浮かせる（左上に移動）
        ctx.translate(-2, -2);
      }
      
      ctx.fillStyle = hasOverlap ? "rgba(239,68,68,0.25)" : th.top;
      ctx.fillRect(gx, gy, gw, gh);
      ctx.strokeStyle = hasOverlap ? "#dc2626" : (th.stroke || "rgba(0,0,0,0.2)");
      ctx.lineWidth = hasOverlap ? 3 : (isDraggingThis ? 3 : 2);
      ctx.strokeRect(gx, gy, gw, gh);
      
      ctx.restore();

      // お気に入りエフェクト（柔らかいぼかしで表現）- オブジェクト輪郭の直後に描画
      if (o.isFavorite) {
        ctx.save();
        
        // 外側：大きなぴんくのぼかし
        ctx.shadowColor = "rgba(255, 182, 193, 0.8)"; // ライトピンク
        ctx.shadowBlur = 30;
        ctx.strokeStyle = "rgba(255, 182, 193, 0.6)";
        ctx.lineWidth = 6;
        ctx.setLineDash([]);
        ctx.strokeRect(gx - 3, gy - 3, gw + 6, gh + 6);
        
        // 中間：ピーチのぼかし
        ctx.shadowColor = "rgba(255, 218, 185, 0.9)"; // ピーチ
        ctx.shadowBlur = 20;
        ctx.strokeStyle = "rgba(255, 218, 185, 0.7)";
        ctx.lineWidth = 4;
        ctx.strokeRect(gx - 2, gy - 2, gw + 4, gh + 4);
        
        // 内側：明るいコーラルピンク
        ctx.shadowColor = "rgba(255, 127, 80, 1)"; // コーラル
        ctx.shadowBlur = 12;
        ctx.strokeStyle = "rgba(255, 160, 122, 0.9)";
        ctx.lineWidth = 3;
        ctx.strokeRect(gx - 1, gy - 1, gw + 2, gh + 2);
        
        ctx.restore();
      }
      
      // 未保存変更のマーカー（オレンジの点線枠）- お気に入りエフェクトの上に描画
      if (isModified) {
        ctx.save();
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(gx - 3, gy - 3, gw + 6, gh + 6);
        ctx.setLineDash([]);
        ctx.restore();
      }

      // マイオブジェクトエフェクト（紫のふわふわ光る輝き）
      const isMyObject = !isEditMode && myObjectId && id === myObjectId;
      if (isMyObject) {
        ctx.save();
        
        // 外側：大きな紫のふわふわぼかし
        ctx.shadowColor = "rgba(181, 107, 255, 0.8)"; // CITY紫
        ctx.shadowBlur = 40;
        ctx.strokeStyle = "rgba(181, 107, 255, 0.5)";
        ctx.lineWidth = 8;
        ctx.setLineDash([]);
        ctx.strokeRect(gx - 5, gy - 5, gw + 10, gh + 10);
        
        // 中間：明るい紫のぼかし
        ctx.shadowColor = "rgba(199, 143, 255, 0.9)"; // ライトパープル
        ctx.shadowBlur = 30;
        ctx.strokeStyle = "rgba(199, 143, 255, 0.7)";
        ctx.lineWidth = 6;
        ctx.strokeRect(gx - 4, gy - 4, gw + 8, gh + 8);
        
        // 内側：濃い紫の輝き
        ctx.shadowColor = "rgba(139, 92, 246, 1)"; // バイオレット
        ctx.shadowBlur = 20;
        ctx.strokeStyle = "rgba(167, 139, 250, 0.9)";
        ctx.lineWidth = 4;
        ctx.strokeRect(gx - 3, gy - 3, gw + 6, gh + 6);
        
        // 最内側：強い紫のコア
        ctx.shadowColor = "rgba(124, 58, 237, 1)"; // ディープパープル
        ctx.shadowBlur = 12;
        ctx.strokeStyle = "rgba(147, 51, 234, 1)";
        ctx.lineWidth = 3;
        ctx.strokeRect(gx - 2, gy - 2, gw + 4, gh + 4);
        
        ctx.restore();
      }

      // Selection ring
      if (isSelected) {
        ctx.save();
        ctx.shadowColor = hasOverlap ? "rgba(220,38,38,0.6)" : LOOK.glowColor;
        ctx.shadowBlur = 18;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.strokeStyle = hasOverlap ? "#dc2626" : LOOK.ringColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.rect(gx, gy, gw, gh);
        ctx.stroke();
        ctx.restore();

        // 重なり部分をハイライト表示
        if (hasOverlap && isEditMode) {
          objects.forEach(other => {
            if (other.id !== id) {
              const overlap = getOverlapRect(o, other);
              if (overlap) {
                const ox = overlap.x * cell;
                const oy = overlap.y * cell;
                const ow = overlap.w * cell;
                const oh = overlap.h * cell;
                ctx.save();
                ctx.fillStyle = "rgba(239,68,68,0.35)";
                ctx.fillRect(ox, oy, ow, oh);
                ctx.strokeStyle = "#dc2626";
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(ox, oy, ow, oh);
                ctx.restore();
              }
            }
          });
        }
      }

      // 文字：水平のまま（回転を打ち消す）
      const label = (o.label ?? "").trim();
      if (label) {
        const center = { x: gx + gw / 2, y: gy + gh / 2 };

        ctx.save();
        ctx.translate(center.x, center.y);

        // ★ここで回転を戻す（文字は水平）
        ctx.rotate(-LOOK.angle);

        ctx.font = "12px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // 山/湖/旗以外は文字の下地（読みやすく）
        const type = (o.type || "").toUpperCase();
        const noBackground = type === "MOUNTAIN" || type === "LAKE" || type === "FLAG";
        
        if (!noBackground) {
          const padX = 8;
          const w = ctx.measureText(label).width;
          const boxW = w + padX * 2;
          const boxH = 18;

          // 既知のタイプかどうかをチェック
          const knownTypes = ["HQ", "BEAR_TRAP", "STATUE", "CITY", "DEPOT"];
          const isKnownType = knownTypes.includes(type);
          
          // その他のオブジェクトは黒背景、それ以外は白背景
          ctx.fillStyle = isKnownType ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.75)";
          ctx.strokeStyle = "rgba(0,0,0,0.10)";
          ctx.lineWidth = 1;

          const x0 = -boxW / 2;
          const y0 = -boxH / 2;
          const r = 8;

          ctx.beginPath();
          ctx.moveTo(x0 + r, y0);
          ctx.arcTo(x0 + boxW, y0, x0 + boxW, y0 + boxH, r);
          ctx.arcTo(x0 + boxW, y0 + boxH, x0, y0 + boxH, r);
          ctx.arcTo(x0, y0 + boxH, x0, y0, r);
          ctx.arcTo(x0, y0, x0 + boxW, y0, r);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

        // その他のオブジェクトは白文字、それ以外は黒文字
        const knownTypes = ["HQ", "BEAR_TRAP", "STATUE", "CITY", "DEPOT"];
        const isKnownType = knownTypes.includes(type);
        ctx.fillStyle = isKnownType ? "#111" : "#fff";
        ctx.fillText(label, 0, 0);

        ctx.restore();
      }
    }

    ctx.restore();

    // 吹き出しを一番上のレイヤーに描画（選択されたオブジェクトにbirthdayまたはnoteがある場合）
    if (selectedId) {
      const selectedObj = objects.find(o => String(o.id) === selectedId);
      const hasBirthday = selectedObj && selectedObj.birthday && selectedObj.birthday.trim();
      const hasNote = selectedObj && selectedObj.note && selectedObj.note.trim();
      
      if (hasBirthday || hasNote) {
        ctx.save();
        ctx.translate(viewW / 2, viewH / 2);
        ctx.translate(cam.tx, cam.ty);
        ctx.scale(cam.scale, cam.scale);
        ctx.rotate(LOOK.angle);
        ctx.translate(-cx, -cy);

        const gx = num(selectedObj.x, 0) * cell;
        const gy = num(selectedObj.y, 0) * cell;
        const gw = Math.max(1, num(selectedObj.w, 1)) * cell;
        const gh = Math.max(1, num(selectedObj.h, 1)) * cell;
        const center = { x: gx + gw / 2, y: gy + gh / 2 };

        ctx.save();
        ctx.translate(center.x, center.y);
        ctx.rotate(-LOOK.angle);

        // 半透明設定（90%）
        ctx.globalAlpha = 0.9;

        // 吹き出しの内容を作成（誕生日 + note）
        let bubbleContent = '';
        if (hasBirthday) {
          bubbleContent = `🎂 ${selectedObj.birthday}`;
        }
        if (hasNote) {
          if (bubbleContent) bubbleContent += '\n';
          bubbleContent += selectedObj.note;
        }

        // 吹き出しのサイズ計算
        ctx.font = "13px system-ui";
        const maxWidth = isMobile ? 200 : 280;
        const lines: string[] = [];
        const words = bubbleContent.split('\n');
        
        for (const word of words) {
          if (!word) {
            lines.push('');
            continue;
          }
          const wordWidth = ctx.measureText(word).width;
          if (wordWidth <= maxWidth) {
            lines.push(word);
          } else {
            let currentLine = '';
            for (let i = 0; i < word.length; i++) {
              const testLine = currentLine + word[i];
              if (ctx.measureText(testLine).width > maxWidth) {
                lines.push(currentLine);
                currentLine = word[i];
              } else {
                currentLine = testLine;
              }
            }
            if (currentLine) lines.push(currentLine);
          }
        }

        const lineHeight = 20;
        const padding = 12;
        const bubbleWidth = Math.min(maxWidth, Math.max(...lines.map(l => ctx.measureText(l).width))) + padding * 2;
        const bubbleHeight = lines.length * lineHeight + padding * 2;
        const labelBoxH = 18;
        const bubbleY = -labelBoxH / 2 - bubbleHeight - 10 / cam.scale;  // 吹き出し全体を名前に近づける

        const gradient = ctx.createLinearGradient(
          -bubbleWidth / 2, bubbleY,
          bubbleWidth / 2, bubbleY + bubbleHeight
        );
        gradient.addColorStop(0, '#fef3c7');
        gradient.addColorStop(1, '#fde68a');

        const r = 6;  // 角丸を小さく
        const x0 = -bubbleWidth / 2;
        const y0 = bubbleY;

        ctx.fillStyle = gradient;
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1 / cam.scale;  // 線を細く

        ctx.beginPath();
        ctx.moveTo(x0 + r, y0);
        ctx.arcTo(x0 + bubbleWidth, y0, x0 + bubbleWidth, y0 + bubbleHeight, r);
        ctx.arcTo(x0 + bubbleWidth, y0 + bubbleHeight, x0, y0 + bubbleHeight, r);
        ctx.arcTo(x0, y0 + bubbleHeight, x0, y0, r);
        ctx.arcTo(x0, y0, x0 + bubbleWidth, y0, r);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        const arrowSize = 8 / cam.scale;
        const arrowOffset = 1 / cam.scale;  // 三角形を吹き出しに詰める
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(-arrowSize, y0 + bubbleHeight + arrowOffset);
        ctx.lineTo(0, y0 + bubbleHeight + arrowSize + arrowOffset);
        ctx.lineTo(arrowSize, y0 + bubbleHeight + arrowOffset);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.moveTo(-arrowSize + 1 / cam.scale, y0 + bubbleHeight + arrowOffset);
        ctx.lineTo(0, y0 + bubbleHeight + arrowSize - 1 / cam.scale + arrowOffset);
        ctx.lineTo(arrowSize - 1 / cam.scale, y0 + bubbleHeight + arrowOffset);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#78350f';
        ctx.font = "13px system-ui";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        const textX = x0 + padding;
        for (let i = 0; i < lines.length; i++) {
          ctx.fillText(lines[i], textX, y0 + padding + i * lineHeight);
        }

        ctx.restore();
        ctx.restore();
      }
    }

    // 長押し時の移動矢印を表示
    if (showMoveArrows && isEditMode) {
      const arrowObj = objects.find(o => String(o.id) === showMoveArrows);
      if (arrowObj) {
        ctx.save();
        ctx.translate(viewW / 2, viewH / 2);
        ctx.translate(cam.tx, cam.ty);
        ctx.scale(cam.scale, cam.scale);
        ctx.rotate(LOOK.angle);
        ctx.translate(-cx, -cy);

        const ox = num(arrowObj.x, 0) * cell;
        const oy = num(arrowObj.y, 0) * cell;
        const ow = Math.max(1, num(arrowObj.w, 1)) * cell;
        const oh = Math.max(1, num(arrowObj.h, 1)) * cell;
        const centerX = ox + ow / 2;
        const centerY = oy + oh / 2;

        // 矢印のサイズと位置
        const arrowSize = 30;
        const arrowDistance = Math.max(ow, oh) / 2 + arrowSize + 10;

        // 矢印を描画する関数
        const drawArrow = (x: number, y: number, direction: 'up' | 'down' | 'left' | 'right') => {
          ctx.save();
          ctx.translate(x, y);

          // 矢印の背景円
          ctx.fillStyle = "rgba(59, 130, 246, 0.95)";
          ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, arrowSize / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // 矢印の向き（マップ回転と同じ角度で表示）
          let angle = 0;
          if (direction === 'up') angle = -Math.PI / 2;
          else if (direction === 'down') angle = Math.PI / 2;
          else if (direction === 'left') angle = Math.PI;
          else if (direction === 'right') angle = 0;

          ctx.rotate(angle);

          // 矢印の形
          ctx.fillStyle = "white";
          ctx.beginPath();
          ctx.moveTo(8, 0);
          ctx.lineTo(-4, -6);
          ctx.lineTo(-4, 6);
          ctx.closePath();
          ctx.fill();

          ctx.restore();
        };

        // 4方向に矢印を配置
        drawArrow(centerX, centerY - arrowDistance, 'up');
        drawArrow(centerX, centerY + arrowDistance, 'down');
        drawArrow(centerX - arrowDistance, centerY, 'left');
        drawArrow(centerX + arrowDistance, centerY, 'right');

        // OKボタン（左矢印と下矢印の下）
        // -45度回転を考慮した位置：左下方向
        const okButtonDistance = arrowDistance + arrowSize + 20;
        const okButtonX = centerX - okButtonDistance / Math.sqrt(2);
        const okButtonY = centerY + okButtonDistance / Math.sqrt(2);
        const okButtonWidth = 60;
        const okButtonHeight = 32;
        
        ctx.save();
        ctx.translate(okButtonX, okButtonY);
        // ボタンをマップと同じ角度に回転
        ctx.rotate(-LOOK.angle);
        
        // OKボタンの背景
        ctx.fillStyle = "rgba(34, 197, 94, 0.95)"; // 緑色
        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
        ctx.lineWidth = 2;
        
        const radius = 8;
        ctx.beginPath();
        ctx.moveTo(-okButtonWidth/2 + radius, -okButtonHeight/2);
        ctx.arcTo(okButtonWidth/2, -okButtonHeight/2, okButtonWidth/2, okButtonHeight/2, radius);
        ctx.arcTo(okButtonWidth/2, okButtonHeight/2, -okButtonWidth/2, okButtonHeight/2, radius);
        ctx.arcTo(-okButtonWidth/2, okButtonHeight/2, -okButtonWidth/2, -okButtonHeight/2, radius);
        ctx.arcTo(-okButtonWidth/2, -okButtonHeight/2, okButtonWidth/2, -okButtonHeight/2, radius);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // OKテキスト
        ctx.fillStyle = "white";
        ctx.font = "bold 14px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("OK", 0, 0);
        
        ctx.restore();

        ctx.restore();
      }
    }

    // HUD - オブジェクト選択時のみ表示（ID、名前、座標）
    if (selectedId) {
      const selectedObj = objects.find(o => String(o.id) === selectedId);
      if (selectedObj) {
        const x = num(selectedObj.x, 0);
        const y = num(selectedObj.y, 0);
        const w = Math.max(1, num(selectedObj.w, 1));
        const h = Math.max(1, num(selectedObj.h, 1));
        
        // ゲーム座標への変換（参考値）
        // 全サイズ共通: オブジェクトの中心座標を使用
        const centerX = x + (w - 1) / 2;
        const centerY = y + (h - 1) / 2;
        
        // 参考値としてのゲーム座標（完全な精度は保証されません）
        const gameX = Math.round(centerX + 358.5);
        
        let yOffset = 395.5; // デフォルト（2×2基準）
        if (w >= 4 && h >= 4) {
          yOffset = 411.5; // 4×4
        } else if (w >= 3 && h >= 3) {
          yOffset = 395; // 3×3
        } else if (w === 1 && h === 1) {
          yOffset = 392; // 1×1
        }
        
        const gameY = Math.round(centerY + yOffset);
        
        // HUD表示（ID、名前、座標のみ）
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.font = "12px system-ui";
        ctx.textAlign = "right";
        ctx.textBaseline = "top";
        const hudText = `ID:${selectedObj.id} | ${selectedObj.label || '名前なし'} | 座標(参考): X:${gameX} Y:${gameY}`;
        ctx.fillText(hudText, viewW - 10, 10);
      }
    }

    // 誕生日テロップ（参照モード時のみ表示）
    if (!isEditMode) {
      const now = new Date();
      const currentMonth = now.getMonth() + 1; // 1-12
      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      
      // 誕生日のあるメンバーを抽出
      const getBirthdayMembers = (month: number) => {
        return objects
          .filter(obj => {
            if (!obj.birthday) return false;
            // birthday形式: "○月●日" (例: "1月10日")
            const match = obj.birthday.match(/(\d+)月/);
            if (!match) return false;
            const birthMonth = parseInt(match[1], 10);
            return birthMonth === month;
          })
          .map(obj => {
            return {
              name: obj.label || '名前なし',
              date: obj.birthday!,
              day: parseInt(obj.birthday!.match(/(\d+)日/)?.[1] || '0', 10)
            };
          })
          .sort((a, b) => {
            // 日付順にソート
            return a.day - b.day;
          });
      };
      
      const currentMonthMembers = getBirthdayMembers(currentMonth);
      const nextMonthMembers = getBirthdayMembers(nextMonth);
      
      // テロップテキストを生成（1行にまとめる）
      const parts: string[] = [];
      if (currentMonthMembers.length > 0) {
        const memberList = currentMonthMembers
          .map(m => `${m.date} ${m.name}さん`)
          .join('　'); // カンマなし、全角スペースのみ
        parts.push(`今月お誕生日を迎えるメンバーは・・・${memberList}　　お誕生日おめでとうございます。`);
      }
      if (nextMonthMembers.length > 0) {
        const memberList = nextMonthMembers
          .map(m => `${m.date} ${m.name}さん`)
          .join('　'); // カンマなし、全角スペースのみ
        parts.push(`来月お誕生日を迎えるメンバーは・・・${memberList}`);
      }
      
      // 間隔を開けて1行に結合（Canvas描画は削除、HTMLテロップで表示）
      const tickerText = parts.join('　　　　');
    }
  };

  // 初期表示：最初は少し引き気味にして“ゲームっぽく”
  useEffect(() => {
    // 1回だけ、map全体が入りやすいように軽くズームアウト
    setCam((c) => (c.scale === 1 ? { ...c, scale: 0.9 } : c));

  }, []);

  // データ・カメラ変更で描画
  useEffect(() => {
    requestDraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objects, cfg.cols, cfg.rows, cfg.cell, cam, selectedId, showMoveArrows, myObjectId, isEditMode]);

  // ====== 入力:パン＆ズーム（タッチ/マウス） ======
  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault(); // ブラウザのデフォルト動作を防ぐ
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const { mx, my } = screenToMap(sx, sy, rect.width, rect.height);

    // ポインター情報を先に登録
    canvas.setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // 編集モード時の処理（1本指のみ）
    if (isEditMode && pointersRef.current.size === 1) {
      const hit = hitTest(mx, my);
      
      if (hit && hit.id) {
        // タッチデバイスかどうかを判定
        const isTouchDevice = e.pointerType === 'touch';
        
        if (isTouchDevice) {
          // 矢印表示中のオブジェクトなら即座にドラッグ開始
          if (showMoveArrows && String(hit.id) === showMoveArrows) {
            pushToHistory(objects);
            dragStartRef.current = {
              objId: String(hit.id),
              mx,
              my,
              objX: num(hit.x, 0),
              objY: num(hit.y, 0),
            };
            setIsDragging(true);
            setSelectedId(String(hit.id));
            return;
          }
          
          // タッチデバイス：長押しでドラッグ＆矢印表示開始
          pointerStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
          
          longPressTimerRef.current = setTimeout(() => {
            // 長押しが成立：ドラッグ開始＆矢印を表示
            const canvas = canvasRef.current;
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            const currentSx = pointerStartRef.current!.x - rect.left;
            const currentSy = pointerStartRef.current!.y - rect.top;
            const { mx: currentMx, my: currentMy } = screenToMap(currentSx, currentSy, rect.width, rect.height);
            
            pushToHistory(objects);
            dragStartRef.current = {
              objId: String(hit.id),
              mx: currentMx,
              my: currentMy,
              objX: num(hit.x, 0),
              objY: num(hit.y, 0),
            };
            setIsDragging(true);
            setSelectedId(String(hit.id));
            setShowMoveArrows(String(hit.id));
            
            // 触覚フィードバック（対応デバイスのみ）
            if ('vibrate' in navigator) {
              navigator.vibrate(50);
            }
          }, 500); // 500msの長押し
          return;
        } else {
          // マウス：即座にドラッグ開始（従来の動作）
          pushToHistory(objects);
          dragStartRef.current = {
            objId: String(hit.id),
            mx,
            my,
            objX: num(hit.x, 0),
            objY: num(hit.y, 0),
          };
          setIsDragging(true);
          setSelectedId(String(hit.id));
          return;
        }
      }
    }

    // 2本指になったらピンチ開始（ドラッグをキャンセル）
    if (pointersRef.current.size === 2) {
      // 長押しタイマーをクリア
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      pointerStartRef.current = null;
      setIsDragging(false);
      dragStartRef.current = null;
      
      const pts = [...pointersRef.current.values()];
      const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      pinchRef.current = {
        startScale: cam.scale,
        startTx: cam.tx,
        startTy: cam.ty,
        startMid: mid,
        startDist: dist,
      };
    } else {
      pinchRef.current = null;
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointersRef.current.get(e.pointerId);
    if (!prev) return;

    // 長押し待機中に移動したらキャンセル
    if (longPressTimerRef.current && pointerStartRef.current) {
      const moveDistance = Math.hypot(
        e.clientX - pointerStartRef.current.x,
        e.clientY - pointerStartRef.current.y
      );
      if (moveDistance > 10) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
        pointerStartRef.current = null;
      }
    }

    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // ピンチ中（2本指操作は常に優先）
    if (pointersRef.current.size === 2 && pinchRef.current) {
      const pts = [...pointersRef.current.values()];
      const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);

      const ratio = dist / Math.max(1, pinchRef.current.startDist);
      const newScale = clamp(pinchRef.current.startScale * ratio, 0.35, 2.5);

      // “ピンチ中心が画面上でズレない”ように、パンを調整
      const dx = mid.x - pinchRef.current.startMid.x;
      const dy = mid.y - pinchRef.current.startMid.y;

      setCam({
        scale: newScale,
        tx: pinchRef.current.startTx + dx,
        ty: pinchRef.current.startTy + dy,
      });
      return;
    }

    // 編集モード：オブジェクトドラッグ中（1本指のみ）
    if (isDragging && dragStartRef.current && pointersRef.current.size === 1) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const { mx, my } = screenToMap(sx, sy, rect.width, rect.height);

      const deltaX = mx - dragStartRef.current.mx;
      const deltaY = my - dragStartRef.current.my;

      const newX = dragStartRef.current.objX + deltaX / cfg.cell;
      const newY = dragStartRef.current.objY + deltaY / cfg.cell;

      // グリッドマスに合わせて整数座標に丸める
      const snappedX = Math.round(newX);
      const snappedY = Math.round(newY);

      // オブジェクトの位置を更新
      setObjects((prev) =>
        prev.map((o) =>
          o.id === dragStartRef.current?.objId
            ? { ...o, x: snappedX, y: snappedY }
            : o
        )
      );
      setHasUnsavedChanges(true);
      return;
    }

    // パン操作（2本指の時はピンチを優先、1本指のみパン可能）
    if (pointersRef.current.size === 1 && !pinchRef.current) {
      if (isEditMode) {
        // 編集モード：ドラッグ中でなければパン可能
        if (!isDragging) {
          const dx = e.clientX - prev.x;
          const dy = e.clientY - prev.y;
          setCam((c) => ({ ...c, tx: c.tx + dx, ty: c.ty + dy }));
          
          // カメラ移動中フラグを設定
          setIsCameraMoving(true);
          if (cameraMovingTimerRef.current) clearTimeout(cameraMovingTimerRef.current);
          cameraMovingTimerRef.current = setTimeout(() => setIsCameraMoving(false), 200);
        }
      } else {
        // 閲覧モード：常にパン可能
        const dx = e.clientX - prev.x;
        const dy = e.clientY - prev.y;
        setCam((c) => ({ ...c, tx: c.tx + dx, ty: c.ty + dy }));
        
        // カメラ移動中フラグを設定
        setIsCameraMoving(true);
        if (cameraMovingTimerRef.current) clearTimeout(cameraMovingTimerRef.current);
        cameraMovingTimerRef.current = setTimeout(() => setIsCameraMoving(false), 200);
      }
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    // 長押しタイマーをクリア
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    // タッチデバイスで短いタップの場合、ダブルタップ検出を優先
    if (e.pointerType === 'touch' && pointerStartRef.current && !isDragging && isEditMode) {
      const tapDuration = Date.now() - pointerStartRef.current.time;
      if (tapDuration < 500) {
        const currentTime = Date.now();
        const canvas = canvasRef.current;
        
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const sx = e.clientX - rect.left;
          const sy = e.clientY - rect.top;
          
          // ダブルタップ検出（400ms以内、50px以内）- 時間を少し延長
          if (lastTapRef.current) {
            const timeDiff = currentTime - lastTapRef.current.time;
            const distDiff = Math.hypot(
              sx - lastTapRef.current.x,
              sy - lastTapRef.current.y
            );
            
            if (timeDiff < 400 && distDiff < 50) {
              // ダブルタップ検出！
              lastTapRef.current = null;
              
              // ダブルクリックと同じ処理を実行
              const { mx, my } = screenToMap(sx, sy, rect.width, rect.height);
              const hit = hitTest(mx, my);
              if (hit) {
                pushToHistory(objects);
                setEditingObject(hit);
                setOriginalEditingId(hit.id || null);
                setShowMoveArrows(null); // 編集ダイアログを開くときは矢印を閉じる
                if (isMobile) setIsPositionSizeExpanded(false); // モバイルではアコーディオンを閉じる
              } else {
                const gridX = Math.floor(mx / cfg.cell);
                const gridY = Math.floor(my / cfg.cell);
                setPendingPosition({ x: gridX, y: gridY });
                setModalSelectedType(lastSelectedType);
                setShowAddObjectModal(true);
              }
              pointerStartRef.current = null;
              
              // グリッドスナップ（編集モード時のみ）
              if (dragStartRef.current) {
                setObjects((prev) =>
                  prev.map((o) => {
                    if (o.id === dragStartRef.current?.objId) {
                      return {
                        ...o,
                        x: Math.round(num(o.x, 0)),
                        y: Math.round(num(o.y, 0)),
                      };
                    }
                    return o;
                  })
                );
              }

              pointersRef.current.delete(e.pointerId);
              pinchRef.current = null;
              setIsDragging(false);
              dragStartRef.current = null;
              return; // ダブルタップ検出したら早期リターン
            }
          }
          
          // 単一タップ：次のタップのために記録
          lastTapRef.current = { time: currentTime, x: sx, y: sy };
          
          // 矢印表示中は矢印を消さない（OKボタンでのみ終了）
          // ただし矢印表示中でない場合は選択処理を行う
          if (!showMoveArrows) {
            const { mx, my } = screenToMap(sx, sy, rect.width, rect.height);
            const hit = hitTest(mx, my);
            if (hit && hit.id) {
              setSelectedId(String(hit.id));
            } else {
              setSelectedId(null);
            }
          }
        }
      }
    }
    
    pointerStartRef.current = null;
    
    // グリッドスナップ（編集モード時のみ）
    if (isDragging && dragStartRef.current && isEditMode) {
      setObjects((prev) =>
        prev.map((o) => {
          if (o.id === dragStartRef.current?.objId) {
            return {
              ...o,
              x: Math.round(num(o.x, 0)),
              y: Math.round(num(o.y, 0)),
            };
          }
          return o;
        })
      );
    }

    pointersRef.current.delete(e.pointerId);
    pinchRef.current = null;
    setIsDragging(false);
    dragStartRef.current = null;
    // 矢印はOKボタンでのみ消すので、ここでは消さない
  };

  const onPointerCancel = (e: React.PointerEvent) => {
    // 長押しタイマーをクリア
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    pointerStartRef.current = null;
    
    pointersRef.current.delete(e.pointerId);
    pinchRef.current = null;
    setIsDragging(false);
    dragStartRef.current = null;
  };

  // タップ選択（短いクリック/タップ）
  const onClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    const { mx, my } = screenToMap(sx, sy, rect.width, rect.height);
    
    // OKボタンのクリック判定（矢印表示中のみ）
    if (isEditMode && showMoveArrows) {
      const arrowObj = objects.find(o => String(o.id) === showMoveArrows);
      if (arrowObj) {
        const ox = num(arrowObj.x, 0) * cfg.cell;
        const oy = num(arrowObj.y, 0) * cfg.cell;
        const ow = Math.max(1, num(arrowObj.w, 1)) * cfg.cell;
        const oh = Math.max(1, num(arrowObj.h, 1)) * cfg.cell;
        const centerX = ox + ow / 2;
        const centerY = oy + oh / 2;
        
        const arrowSize = 30;
        const arrowDistance = Math.max(ow, oh) / 2 + arrowSize + 10;
        const okButtonDistance = arrowDistance + arrowSize + 20;
        const okButtonX = centerX - okButtonDistance / Math.sqrt(2);
        const okButtonY = centerY + okButtonDistance / Math.sqrt(2);
        const okButtonWidth = 60;
        const okButtonHeight = 32;
        
        // OKボタンの当たり判定
        if (Math.abs(mx - okButtonX) <= okButtonWidth / 2 && Math.abs(my - okButtonY) <= okButtonHeight / 2) {
          // OKボタンがクリックされた！
          setShowMoveArrows(null);
          return;
        }
      }
    }
    
    // 矢印がクリックされたかチェック（編集モード時のみ）
    if (isEditMode && showMoveArrows) {
      const arrowObj = objects.find(o => String(o.id) === showMoveArrows);
      if (arrowObj) {
        const ox = num(arrowObj.x, 0) * cfg.cell;
        const oy = num(arrowObj.y, 0) * cfg.cell;
        const ow = Math.max(1, num(arrowObj.w, 1)) * cfg.cell;
        const oh = Math.max(1, num(arrowObj.h, 1)) * cfg.cell;
        const centerX = ox + ow / 2;
        const centerY = oy + oh / 2;
        
        const arrowSize = 30;
        const arrowDistance = Math.max(ow, oh) / 2 + arrowSize + 10;
        const arrowRadius = arrowSize / 2;
        
        // 各矢印の位置
        const arrows = [
          { x: centerX, y: centerY - arrowDistance, dir: 'up' as const, dx: 0, dy: -1 },
          { x: centerX, y: centerY + arrowDistance, dir: 'down' as const, dx: 0, dy: 1 },
          { x: centerX - arrowDistance, y: centerY, dir: 'left' as const, dx: -1, dy: 0 },
          { x: centerX + arrowDistance, y: centerY, dir: 'right' as const, dx: 1, dy: 0 },
        ];
        
        for (const arrow of arrows) {
          const dist = Math.hypot(mx - arrow.x, my - arrow.y);
          if (dist <= arrowRadius + 5) {
            // 矢印がクリックされた！
            pushToHistory(objects);
            setObjects((prev) =>
              prev.map((o) =>
                o.id === showMoveArrows
                  ? { 
                      ...o, 
                      x: num(o.x, 0) + arrow.dx, 
                      y: num(o.y, 0) + arrow.dy 
                    }
                  : o
              )
            );
            setHasUnsavedChanges(true);
            
            // 触覚フィードバック
            if ('vibrate' in navigator) {
              navigator.vibrate(30);
            }
            return;
          }
        }
      }
    }
    
    // Ctrl+クリックで新規オブジェクト追加（編集モード時）
    if (isEditMode && e.ctrlKey) {
      pushToHistory(objects);
      const gridX = Math.floor(mx / cfg.cell);
      const gridY = Math.floor(my / cfg.cell);
      const newId = `obj_${Date.now()}`;
      const defaultSize = getDefaultSize("FLAG");
      const newObj: Obj = {
        id: newId,
        type: "FLAG",
        label: "🚩",
        x: gridX,
        y: gridY,
        w: defaultSize.w,
        h: defaultSize.h,
      };
      setObjects((prev) => [...prev, newObj]);
      setSelectedId(newId);
      setEditingObject(newObj);
      setOriginalEditingId(newId);  // 新規追加時も元のIDとして設定
      if (isMobile) setIsPositionSizeExpanded(false); // モバイルではアコーディオンを閉じる
      setHasUnsavedChanges(true);
      return;
    }

    const hit = hitTest(mx, my);
    
    // 矢印が表示されている場合、矢印以外をクリックしたら閉じる
    if (showMoveArrows) {
      if (hit?.id && String(hit.id) === showMoveArrows) {
        // 同じオブジェクトをクリック：矢印を閉じる
        setShowMoveArrows(null);
      } else {
        // 他の場所をクリック：矢印を閉じて選択を変更
        setShowMoveArrows(null);
        setSelectedId(hit?.id ? String(hit.id) : null);
      }
    } else {
      setSelectedId(hit?.id ? String(hit.id) : null);
    }
  };

  // ダブルクリックで編集（編集モード時のみ）
  const onDoubleClick = (e: React.MouseEvent) => {
    if (!isEditMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    const { mx, my } = screenToMap(sx, sy, rect.width, rect.height);
    const hit = hitTest(mx, my);
    if (hit) {
      // 編集開始前の状態を保存
      pushToHistory(objects);
      setShowMoveArrows(null); // 編集ダイアログを開くときは矢印を閉じる
      setEditingObject(hit);
      setOriginalEditingId(hit.id || null);
      if (isMobile) setIsPositionSizeExpanded(false); // モバイルではアコーディオンを閉じる
    } else {
      // 空白箱所で新規追加モーダルを表示
      const gridX = Math.floor(mx / cfg.cell);
      const gridY = Math.floor(my / cfg.cell);
      setPendingPosition({ x: gridX, y: gridY });
      setModalSelectedType(lastSelectedType);
      setShowAddObjectModal(true);
    }
  };

  // 編集モード認証
  const handlePasswordSubmit = () => {
    if (password === "snow1234") {
      setIsEditMode(true);
      setShowPasswordModal(false);
      setShowMoveArrows(null);
      // 初期状態を保存
      initialObjectsRef.current = JSON.parse(JSON.stringify(objects));
      setHasUnsavedChanges(false);
      // Undo/Redoスタックをリセット
      setUndoStack([]);
      setRedoStack([]);
      // ヘッダーが見えるようにスクロールをトップに戻す
      window.scrollTo(0, 0);
      // パスワードをlocalStorageに保存
      try {
        localStorage.setItem('snw_edit_password', password);
      } catch (e) {
        console.warn('localStorageにパスワードを保存できませんでした', e);
      }
      setPassword("");
    } else {
      alert("パスワードが間違っています");
    }
  };

  // 履歴に追加（変更前の状態を保存）
  const pushToHistory = (currentObjects: Obj[]) => {
    setUndoStack(prev => [...prev, JSON.parse(JSON.stringify(currentObjects))]);
    setRedoStack([]); // 新しい変更があったらredoスタックをクリア
  };

  // Undo（戻る）
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    
    const previousState = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);
    
    // 現在の状態をredoスタックに保存
    setRedoStack(prev => [...prev, JSON.parse(JSON.stringify(objects))]);
    setUndoStack(newUndoStack);
    setObjects(previousState);
    setHasUnsavedChanges(true);
  };

  // Redo（進む）
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    
    const nextState = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);
    
    // 現在の状態をundoスタックに保存
    setUndoStack(prev => [...prev, JSON.parse(JSON.stringify(objects))]);
    setRedoStack(newRedoStack);
    setObjects(nextState);
    setHasUnsavedChanges(true);
  };

  const exitEditMode = () => {
    if (hasUnsavedChanges || hasUnsavedLinksChanges) {
      if (!confirm("⚠️ 保存されていない変更があります。編集モードを終了してもよろしいですか？\n\n変更は破棄されます。")) {
        return;
      }
      // 変更を破棄して元に戻す
      setObjects(initialObjectsRef.current);
    }
    setIsEditMode(false);
    setSelectedId(null);
    setEditingObject(null);
    setOriginalEditingId(null);
    setShowMoveArrows(null);
    setHasUnsavedChanges(false);
    setHasUnsavedLinksChanges(false);
  };

  // 重なりチェック
  const hasAnyOverlap = useMemo(() => {
    if (!isEditMode) return false;
    for (let i = 0; i < objects.length; i++) {
      for (let j = i + 1; j < objects.length; j++) {
        if (checkOverlap(objects[i], objects[j])) {
          return true;
        }
      }
    }
    return false;
  }, [objects, isEditMode]);

  // GASへ保存
  const saveToGAS = async () => {
    if (hasAnyOverlap) {
      setToastMessage("⚠️ 重なりを解消してください");
      return;
    }

    setIsLoading(true);

    try {
      const base = process.env.NEXT_PUBLIC_GAS_URL;
      if (!base) {
        setToastMessage("❌ URL未設定");
        setIsLoading(false);
        return;
      }

      const actorName = "anonymous"; // 常にanonymousで保存

      console.log("保存開始:", { base, actorName, objectsCount: objects.length });

      const res = await fetch(`${base}?action=saveMap`, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          password: "snow1234",
          actor: actorName,
          objects,
          meta: {
            ...meta,
            bgImage: bgConfig.image,
            bgCenterX: bgConfig.centerX,
            bgCenterY: bgConfig.centerY,
            bgScale: bgConfig.scale,
            bgOpacity: bgConfig.opacity,
          },
        }),
      });

      console.log("レスポンスステータス:", res.status);
      const text = await res.text();
      console.log("レスポンス本文:", text);

      let json;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error(`GASからの応答が不正です: ${text.substring(0, 200)}`);
      }

      if (!json.ok) {
        throw new Error(json.error || "保存に失敗しました");
      }

      setToastMessage("✅ 保存完了");
      // 初期状態を更新（カメラ位置は維持）
      initialObjectsRef.current = JSON.parse(JSON.stringify(objects));
      setHasUnsavedChanges(false);
      // 再読込はしない（カメラ位置を維持）
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      console.error("保存エラー詳細:", e);
      setToastMessage(`❌ 保存エラー: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const saveLinksToGAS = async () => {
    setIsLoading(true);

    try {
      const base = process.env.NEXT_PUBLIC_GAS_URL;
      if (!base) {
        setToastMessage("❌ URL未設定");
        setIsLoading(false);
        return;
      }

      const res = await fetch(`${base}?action=saveLinks`, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          password: "snow1234",
          links: links.map((link, index) => ({
            ...link,
            order: index + 1,  // 現在の並び順を保存
            display: true
          })),
        }),
      });

      const text = await res.text();
      const json = JSON.parse(text);

      if (!json.ok) {
        throw new Error(json.error || "リンク保存に失敗しました");
      }

      setToastMessage("✅ リンク保存完了");
      setHasUnsavedLinksChanges(false);
      await loadMap(); // リンクを再読込
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      console.error("リンク保存エラー:", e);
      setToastMessage(`❌ リンク保存エラー: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main style={{ 
      fontFamily: "system-ui", 
      height: "100vh", 
      display: "flex", 
      flexDirection: "column", 
      overflow: "hidden", 
      position: "relative",
    }}>
      {/* 超半透明の白いオーバーレイ */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255, 255, 255, 0.92)",
        pointerEvents: "none",
        zIndex: 0,
      }} />
      {/* 誕生日お祝い紙吹雪オーバーレイ */}
      {showBirthdayCelebration && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          zIndex: 9998,
          overflow: "hidden",
        }}>
          {/* ステージ0: Happy Birthday筆記体アニメーション */}
          {birthdayAnimationStage === 0 && (
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
            }}>
              <div style={{
                fontSize: isMobile ? 56 : 90,
                fontFamily: "'Brush Script MT', 'Lucida Handwriting', 'Comic Sans MS', cursive",
                fontStyle: "italic",
                fontWeight: "bold",
                background: "linear-gradient(135deg, #ff6b9d 0%, #ffd93d 25%, #6bcf7f 50%, #4d9fff 75%, #b57fff 100%)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "gradientFlow 3s ease infinite, fadeInUp 2s ease-out",
                filter: "drop-shadow(0 0 20px rgba(255,215,0,0.7))",
                letterSpacing: isMobile ? 2 : 4,
                textShadow: "0 0 30px rgba(255,107,157,0.5)",
              }}>
                Happy Birthday!!
              </div>
            </div>
          )}
          {birthdayAnimationStage === 2 && (
            <>
              {/* 背景グロー */}
              <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: isMobile ? "150%" : "100%",
                height: isMobile ? "150%" : "100%",
                background: "radial-gradient(circle, rgba(255,107,157,0.05) 0%, rgba(77,159,255,0.03) 40%, transparent 70%)",
                animation: "pulse 4s ease-in-out infinite",
              }} />

              {/* メインタイトル - 軽いぼかし背景 */}
              <div style={{
                position: "absolute",
                top: isMobile ? "15%" : "20%",
                left: "50%",
                transform: "translate(-50%, 0)",
                padding: isMobile ? "10px 24px" : "14px 40px",
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(8px)",
                borderRadius: 16,
                animation: "fadeIn 2s ease-out",
                opacity: 0,
                animationFillMode: "forwards",
              }}>
            <div style={{
              fontSize: isMobile ? 28 : 52,
              fontWeight: "900",
              background: "linear-gradient(135deg, #ff6b9d 0%, #ffd93d 25%, #6bcf7f 50%, #4d9fff 75%, #b57fff 100%)",
              backgroundSize: "300% 300%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "gradientFlow 4s ease infinite",
              letterSpacing: isMobile ? 4 : 8,
              textAlign: "center",
              filter: "drop-shadow(0 0 20px rgba(255,215,0,0.5))",
              whiteSpace: "nowrap",
            }}>
              HAPPY BIRTHDAY
            </div>
              </div>

              {/* 光の粒子エフェクト - 画面全体から */}
              {!isCameraMoving && Array.from({ length: 80 }).map((_, i) => {
                const startX = Math.random() * 100;
                const startY = Math.random() * 100;
                const delay = Math.random() * 5;
                const duration = 3 + Math.random() * 4; // 3-7秒にゆっくり
                const size = isMobile ? (2 + Math.random() * 4) : (3 + Math.random() * 6);
                const colors = ['#ff6b9d', '#ffd93d', '#6bcf7f', '#4d9fff', '#b57fff', '#fff'];
                const color = colors[Math.floor(Math.random() * colors.length)];
                return (
                  <div
                    key={`particle-${i}`}
                    style={{
                      position: "absolute",
                      left: `${startX}%`,
                      top: `${startY}%`,
                      width: size,
                      height: size,
                      borderRadius: "50%",
                      background: color,
                      animation: `particleFloat ${duration}s ease-in-out ${delay}s infinite`,
                      boxShadow: `0 0 ${size * 4}px ${color}, 0 0 ${size * 8}px ${color}`,
                      opacity: 0,
                    }}
                  />
                );
              })}

              {/* 紙吹雪 - 画面全体から舞い散る */}
              {!isCameraMoving && Array.from({ length: 100 }).map((_, i) => {
                const startSide = Math.floor(Math.random() * 4); // 0:top, 1:right, 2:bottom, 3:left
                let startX, startY;
                
                if (startSide === 0) { // top
                  startX = Math.random() * 100;
                  startY = -5;
                } else if (startSide === 1) { // right
                  startX = 105;
                  startY = Math.random() * 100;
                } else if (startSide === 2) { // bottom
                  startX = Math.random() * 100;
                  startY = 105;
                } else { // left
                  startX = -5;
                  startY = Math.random() * 100;
                }
                
                const delay = Math.random() * 5; // 0-5秒
                const duration = 6 + Math.random() * 4; // 6-10秒にゆっくり
                const size = isMobile ? (8 + Math.random() * 12) : (10 + Math.random() * 16);
                const rotate = Math.random() * 360;
                
                const colors = [
                  { base: '#ff6b9d', glow: 'rgba(255,107,157,0.8)' },
                  { base: '#ffd93d', glow: 'rgba(255,217,61,0.8)' },
                  { base: '#6bcf7f', glow: 'rgba(107,207,127,0.8)' },
                  { base: '#4d9fff', glow: 'rgba(77,159,255,0.8)' },
                  { base: '#b57fff', glow: 'rgba(181,127,255,0.8)' },
                  { base: '#ff8c42', glow: 'rgba(255,140,66,0.8)' },
                ];
                const color = colors[Math.floor(Math.random() * colors.length)];
                const shapeType = Math.floor(Math.random() * 5); // 0-4: 様々な形
                
                let shapeStyle: React.CSSProperties = {};
                if (shapeType === 0) {
                  // 円
                  shapeStyle = {
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${color.base}, ${color.glow})`,
                  };
                } else if (shapeType === 1) {
                  // 四角
                  shapeStyle = {
                    width: size,
                    height: size,
                    borderRadius: size * 0.2,
                    background: `linear-gradient(135deg, ${color.base}, ${color.glow})`,
                  };
                } else if (shapeType === 2) {
                  // 星
                  shapeStyle = {
                    width: size,
                    height: size,
                    background: color.base,
                    clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                  };
                } else if (shapeType === 3) {
                  // ダイヤモンド
                  shapeStyle = {
                    width: size,
                    height: size,
                    background: color.base,
                    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                  };
                } else {
                  // 六角形
                  shapeStyle = {
                    width: size,
                    height: size,
                    background: color.base,
                    clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
                  };
                }
                
                return (
                  <div
                    key={`confetti-${i}`}
                    style={{
                      position: "absolute",
                      left: `${startX}%`,
                      top: `${startY}%`,
                      animation: `confettiExplode ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s infinite`,
                      transform: `rotate(${rotate}deg)`,
                      opacity: 0,
                      filter: `drop-shadow(0 0 ${size * 0.5}px ${color.glow})`,
                      ...shapeStyle,
                    }}
                  />
                );
              })}

              {/* ネオンリング */}
              {!isCameraMoving && Array.from({ length: 3 }).map((_, i) => {
                const delay = i * 1.5;
                const size = isMobile ? (200 + i * 100) : (300 + i * 150);
                return (
                  <div
                    key={`ring-${i}`}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      width: size,
                      height: size,
                      marginLeft: -size / 2,
                      marginTop: -size / 2,
                      borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.3)",
                      animation: `ringExpand 4s ease-out ${delay}s infinite`,
                      opacity: 0,
                    }}
                  />
                );
              })}
            </>
          )}
        </div>
      )}

      {/* ローディングオーバーレイ */}
      {isLoading && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{
            animation: "snowflakeAnimation 3s infinite linear",
            display: "inline-block",
            transformOrigin: "center center",
            lineHeight: 1,
          }}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* 中心の六角形 */}
              <circle cx="32" cy="32" r="4" fill="white" opacity="0.9"/>
              
              {/* 6本の主軸 */}
              <line x1="32" y1="8" x2="32" y2="56" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              <line x1="11.7" y1="20" x2="52.3" y2="44" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              <line x1="11.7" y1="44" x2="52.3" y2="20" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              
              {/* 上方向の枝 */}
              <line x1="32" y1="18" x2="26" y2="13" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="32" y1="18" x2="38" y2="13" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="32" y1="14" x2="28" y2="10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="32" y1="14" x2="36" y2="10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              
              {/* 下方向の枝 */}
              <line x1="32" y1="46" x2="26" y2="51" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="32" y1="46" x2="38" y2="51" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="32" y1="50" x2="28" y2="54" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="32" y1="50" x2="36" y2="54" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              
              {/* 右上方向の枝 */}
              <line x1="40.5" y1="26.9" x2="42.5" y2="21.5" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="40.5" y1="26.9" x2="45" y2="29" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="43.8" y1="24.6" x2="46" y2="19.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="43.8" y1="24.6" x2="47.8" y2="26.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              
              {/* 右下方向の枝 */}
              <line x1="40.5" y1="37.1" x2="42.5" y2="42.5" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="40.5" y1="37.1" x2="45" y2="35" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="43.8" y1="39.4" x2="46" y2="44.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="43.8" y1="39.4" x2="47.8" y2="37.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              
              {/* 左上方向の枝 */}
              <line x1="23.5" y1="26.9" x2="21.5" y2="21.5" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="23.5" y1="26.9" x2="19" y2="29" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="20.2" y1="24.6" x2="18" y2="19.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="20.2" y1="24.6" x2="16.2" y2="26.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              
              {/* 左下方向の枝 */}
              <line x1="23.5" y1="37.1" x2="21.5" y2="42.5" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="23.5" y1="37.1" x2="19" y2="35" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="20.2" y1="39.4" x2="18" y2="44.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="20.2" y1="39.4" x2="16.2" y2="37.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      )}
      {/* トースト通知 */}
      {toastMessage && (
        <div style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: toastMessage.startsWith("✅") 
            ? "rgba(34, 197, 94, 0.95)"  // 緑色（成功）
            : "rgba(220, 38, 38, 0.95)",  // 赤色（エラー）
          color: "white",
          padding: "12px 24px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          zIndex: 10000,
          maxWidth: "90%",
          textAlign: "center",
          fontSize: "14px",
          fontWeight: "600",
          animation: "toastFadeIn 0.3s ease-out",
        }}>
          {toastMessage}
        </div>
      )}
      <style jsx global>{`
        @keyframes snowflakeAnimation {
          0% {
            transform: rotate(0deg) scale(0.8);
            opacity: 0.7;
          }
          25% {
            transform: rotate(90deg) scale(1.1);
            opacity: 0.9;
          }
          50% {
            transform: rotate(180deg) scale(0.8);
            opacity: 1;
          }
          75% {
            transform: rotate(270deg) scale(1.1);
            opacity: 0.9;
          }
          100% {
            transform: rotate(360deg) scale(0.8);
            opacity: 0.7;
          }
        }
        @keyframes toastFadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        @keyframes savePulse {
          0%, 100% {
            box-shadow: 0 4px 12px rgba(22, 163, 74, 0.4);
          }
          50% {
            box-shadow: 0 6px 20px rgba(22, 163, 74, 0.7);
          }
        }
        @keyframes bubblePop {
          0% {
            opacity: 0;
            transform: translate(-50%, -100%) scale(0.8);
          }
          50% {
            transform: translate(-50%, -100%) scale(1.05);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -100%) scale(1);
          }
        }
      `}</style>
      <div style={{ 
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: (isMobile && isEditMode) ? "2px 4px" : (isMobile ? "4px 4px" : "8px"), 
        display: "flex", 
        gap: isMobile ? "4px" : "6px", 
        alignItems: "center", 
        background: "rgba(255, 255, 255, 0.2)", 
        backgroundImage: `url('${basePath}/header-bg.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundBlendMode: "overlay",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(255,255,255,0.3)",
        flexWrap: "wrap",
        fontSize: "14px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}>
        {/* 半透明オーバーレイ */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          zIndex: -1,
        }} />
        <div style={{ position: "relative" }} ref={headerMenuRef}>
          <h1 
            onClick={() => setShowHeaderMenu(!showHeaderMenu)}
            style={{ 
              margin: 0, 
              fontSize: isMobile ? "14px" : "clamp(16px, 4vw, 20px)", 
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: isMobile ? "100px" : "200px",
              color: "white",
              textShadow: "2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.6), 1px -1px 2px rgba(0,0,0,0.6), -1px 1px 2px rgba(0,0,0,0.6)",
              fontWeight: "bold",
              position: "relative",
              zIndex: 1,
              cursor: "pointer",
            }}
          >
            {isInitialLoading ? "読込中..." : cfg.name}
          </h1>
          
          {/* ドロップダウンメニュー */}
          {showHeaderMenu && (
            <div 
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                marginTop: 8,
                background: isDarkMode ? "#1f2937" : "white",
                borderRadius: 8,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                minWidth: 280,
                zIndex: 200,
                overflow: "hidden",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* リンク集（見出し） */}
              <div 
                style={{
                  padding: "12px 16px",
                  borderBottom: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                  userSelect: "none",
                  fontWeight: 600,
                  color: isDarkMode ? "#9ca3af" : "#6b7280",
                  fontSize: "13px",
                  background: isDarkMode ? "#111827" : "#f9fafb",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>🔗 リンク集</span>
                {isEditMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingLink({ name: "", url: "", order: 0, display: true, index: -1 });
                      setShowAddLinkModal(true);
                      setShowHeaderMenu(false);
                    }}
                    style={{
                      padding: "4px 8px",
                      fontSize: "11px",
                      background: "#2563eb",
                      color: "white",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    ＋追加
                  </button>
                )}
              </div>
              
              {/* リンク集のサブメニュー - スプレッドシートから動的に生成 */}
              {links.filter(link => link.display).map((link, displayIndex) => {
                const actualIndex = links.indexOf(link);  // 元の配列でのインデックス
                const isHighlighted = highlightedLinkIndex === actualIndex;
                const isHovered = hoveredLinkIndex === actualIndex;
                
                return (
                <div 
                  key={actualIndex}
                  style={{
                    padding: "10px 16px 10px 32px",
                    cursor: "pointer",
                    borderBottom: displayIndex < links.filter(l => l.display).length - 1 ? (isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb") : "none",
                    transition: "background 0.2s",
                    userSelect: "none",
                    fontSize: "14px",
                    background: isHighlighted 
                      ? (isDarkMode ? "#1e3a8a" : "#dbeafe") 
                      : (isHovered ? (isDarkMode ? "#374151" : "#f3f4f6") : (isDarkMode ? "#1f2937" : "white")),
                    color: isDarkMode ? "#e5e7eb" : "#1f2937",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onMouseEnter={() => setHoveredLinkIndex(actualIndex)}
                  onMouseLeave={() => setHoveredLinkIndex(null)}
                >
                  <span 
                    onClick={(e) => {
                      if (!isEditMode) {
                        e.stopPropagation();
                        window.open(link.url, "_blank");
                        setShowHeaderMenu(false);
                      }
                    }}
                    style={{ flex: 1, cursor: isEditMode ? "default" : "pointer" }}
                  >
                    {link.name}
                  </span>
                  {isEditMode && (
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (actualIndex > 0) {
                            const newLinks = [...links];
                            [newLinks[actualIndex - 1], newLinks[actualIndex]] = [newLinks[actualIndex], newLinks[actualIndex - 1]];
                            setLinks(newLinks);
                            setHasUnsavedLinksChanges(true);
                            setHighlightedLinkIndex(actualIndex - 1);  // 移動先をハイライト
                          }
                        }}
                        disabled={actualIndex === 0}
                        style={{
                          padding: "2px 6px",
                          fontSize: "11px",
                          background: actualIndex === 0 ? "#d1d5db" : "#6366f1",
                          color: "white",
                          border: "none",
                          borderRadius: 3,
                          cursor: actualIndex === 0 ? "not-allowed" : "pointer",
                          userSelect: "none",
                          opacity: actualIndex === 0 ? 0.5 : 1,
                        }}
                        title="上に移動"
                      >
                        ↑
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (actualIndex < links.length - 1) {
                            const newLinks = [...links];
                            [newLinks[actualIndex], newLinks[actualIndex + 1]] = [newLinks[actualIndex + 1], newLinks[actualIndex]];
                            setLinks(newLinks);
                            setHasUnsavedLinksChanges(true);
                            setHighlightedLinkIndex(actualIndex + 1);  // 移動先をハイライト
                          }
                        }}
                        disabled={actualIndex === links.length - 1}
                        style={{
                          padding: "2px 6px",
                          fontSize: "11px",
                          background: actualIndex === links.length - 1 ? "#d1d5db" : "#6366f1",
                          color: "white",
                          border: "none",
                          borderRadius: 3,
                          cursor: actualIndex === links.length - 1 ? "not-allowed" : "pointer",
                          userSelect: "none",
                          opacity: actualIndex === links.length - 1 ? 0.5 : 1,
                        }}
                        title="下に移動"
                      >
                        ↓
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingLink({ ...link, index: actualIndex });
                          setShowHeaderMenu(false);
                        }}
                        style={{
                          padding: "2px 6px",
                          fontSize: "11px",
                          background: "#059669",
                          color: "white",
                          border: "none",
                          borderRadius: 3,
                          cursor: "pointer",
                          userSelect: "none",
                        }}
                      >
                        編集
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setLinks(links.map((l, i) => 
                            i === actualIndex ? { ...l, display: false } : l
                          ));
                          setHasUnsavedLinksChanges(true);
                        }}
                        style={{
                          padding: "2px 6px",
                          fontSize: "11px",
                          background: "#f59e0b",
                          color: "white",
                          border: "none",
                          borderRadius: 3,
                          cursor: "pointer",
                          userSelect: "none",
                        }}
                        title="非表示にする"
                      >
                        非表示
                      </button>
                    </div>
                  )}
                </div>
              );
              })}
              
              {/* 編集モード時：非表示のリンク一覧 */}
              {isEditMode && links.filter(link => !link.display).length > 0 && (
                <>
                  <div style={{
                    padding: "12px 16px",
                    borderTop: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                    userSelect: "none",
                    fontWeight: 600,
                    color: isDarkMode ? "#6b7280" : "#9ca3af",
                    fontSize: "13px",
                    background: isDarkMode ? "#111827" : "#f9fafb",
                  }}>
                    👻 非表示のリンク
                  </div>
                  {links.filter(link => !link.display).map((link, hiddenIndex) => {
                    const actualIndex = links.indexOf(link);
                    return (
                      <div 
                        key={actualIndex}
                        style={{
                          padding: "10px 16px 10px 32px",
                          borderBottom: hiddenIndex < links.filter(l => !l.display).length - 1 ? (isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb") : "none",
                          userSelect: "none",
                          fontSize: "14px",
                          background: isDarkMode ? "#111827" : "#fafafa",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          opacity: 0.6,
                        }}
                      >
                        <span style={{ flex: 1, textDecoration: "line-through", color: isDarkMode ? "#6b7280" : "#9ca3af" }}>
                          {link.name}
                        </span>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setLinks(links.map((l, i) => 
                                i === actualIndex ? { ...l, display: true } : l
                              ));
                              setHasUnsavedLinksChanges(true);
                            }}
                            style={{
                              padding: "2px 6px",
                              fontSize: "11px",
                              background: "#10b981",
                              color: "white",
                              border: "none",
                              borderRadius: 3,
                              cursor: "pointer",
                              userSelect: "none",
                            }}
                            title="再表示する"
                          >
                            表示
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`「${link.name}」を完全に削除しますか？`)) {
                                setLinks(links.filter((_, i) => i !== actualIndex));
                                setHasUnsavedLinksChanges(true);
                              }
                            }}
                            style={{
                              padding: "2px 6px",
                              fontSize: "11px",
                              background: "#dc2626",
                              color: "white",
                              border: "none",
                              borderRadius: 3,
                              cursor: "pointer",
                              userSelect: "none",
                            }}
                            title="完全に削除"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
              
              {/* 設定セクション区切り */}
              <div style={{
                borderTop: isDarkMode ? "2px solid #374151" : "2px solid #e5e7eb",
                margin: "4px 0",
              }} />
              
              {/* 背景変更（編集モード時のみ） */}
              {isEditMode && (
                <div
                  onClick={() => {
                    setShowBgConfigModal(true);
                    setShowHeaderMenu(false);
                  }}
                  style={{
                    padding: "12px 16px 12px 32px",
                    cursor: "pointer",
                    transition: "background 0.2s",
                    userSelect: "none",
                    fontSize: "14px",
                    background: isDarkMode ? "#1f2937" : "white",
                    color: isDarkMode ? "#e5e7eb" : "#1f2937",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontWeight: "600",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDarkMode ? "#374151" : "#f3f4f6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isDarkMode ? "#1f2937" : "white";
                  }}
                >
                  🖼️ <span>背景画像設定</span>
                </div>
              )}
              
              {/* マイオブジェクト設定（参照モード時のみ） */}
              {!isEditMode && (
                <div
                  onClick={() => {
                    setShowMyObjectSelector(true);
                    setShowHeaderMenu(false);
                  }}
                  style={{
                    padding: "12px 16px 12px 32px",
                    cursor: "pointer",
                    transition: "background 0.2s",
                    userSelect: "none",
                    fontSize: "14px",
                    background: myObjectId 
                      ? "#5b21b6"
                      : (isDarkMode ? "#1f2937" : "white"),
                    color: myObjectId
                      ? "#c4b5fd"
                      : (isDarkMode ? "#e5e7eb" : "#1f2937"),
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontWeight: "600",
                  }}
                  onMouseEnter={(e) => {
                    if (myObjectId) {
                      e.currentTarget.style.background = "#6d28d9";
                    } else {
                      e.currentTarget.style.background = isDarkMode ? "#374151" : "#f3f4f6";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (myObjectId) {
                      e.currentTarget.style.background = "#5b21b6";
                    } else {
                      e.currentTarget.style.background = isDarkMode ? "#1f2937" : "white";
                    }
                  }}
                >
                  {myObjectId ? "✓" : "📍"} <span>マイオブジェクト設定</span>
                </div>
              )}
            </div>
          )}
        </div>
        <button onClick={loadMap} style={{ 
          padding: isMobile ? "8px 8px" : "6px 10px", 
          fontSize: isMobile ? "16px" : "13px", 
          whiteSpace: "nowrap", 
          minWidth: "auto",
          minHeight: isMobile ? "36px" : "auto",
          fontWeight: isMobile ? "bold" : "normal",
          position: "relative",
          zIndex: 1,
          borderRadius: "8px",
          border: "1px solid #d1d5db",
          background: "white",
          color: "#1f2937",
          cursor: "pointer",
          userSelect: "none",
        }}>
          {isMobile ? "🔄" : (isEditMode ? "リセット" : "再読込")}
        </button>
        {!isEditMode ? (
          <>
            <div
              onClick={() => setTickerHidden(!tickerHidden)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: isMobile ? "6px 10px" : "6px 12px",
                background: "white",
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: 6,
                cursor: "pointer",
                userSelect: "none",
                minHeight: isMobile ? "36px" : "auto",
              }}
              title={tickerHidden ? "テロップを表示" : "テロップを非表示"}
            >
              <span style={{
                fontSize: isMobile ? 12 : 13,
                fontWeight: 500,
                color: "#333",
                whiteSpace: "nowrap",
              }}>
                テロップ
              </span>
              <div style={{
                position: "relative",
                width: "44px",
                height: "22px",
                background: tickerHidden ? "#d1d5db" : "#fbbf24",
                borderRadius: "11px",
                transition: "background 0.3s",
              }}>
                <div style={{
                  position: "absolute",
                  top: "2px",
                  left: tickerHidden ? "2px" : "22px",
                  width: "18px",
                  height: "18px",
                  background: "white",
                  borderRadius: "50%",
                  transition: "left 0.3s",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                }} />
              </div>
              <span style={{
                fontSize: isMobile ? 11 : 12,
                fontWeight: 600,
                color: tickerHidden ? "#9ca3af" : "#f59e0b",
                minWidth: "28px",
              }}>
                {tickerHidden ? "OFF" : "ON"}
              </span>
            </div>
            <button
              onClick={() => {
                // localStorageからパスワードを読み込んで自動認証を試みる
                try {
                  const savedPassword = localStorage.getItem('snw_edit_password');
                  if (savedPassword === 'snow1234') {
                    setIsEditMode(true);
                    setShowMoveArrows(null);
                    initialObjectsRef.current = JSON.parse(JSON.stringify(objects));
                    setHasUnsavedChanges(false);
                    setUndoStack([]);
                    setRedoStack([]);
                    window.scrollTo(0, 0);
                  } else {
                    setShowPasswordModal(true);
                  }
                } catch {
                  setShowPasswordModal(true);
                }
              }}
              style={{
                padding: isMobile ? "6px 8px" : "6px 10px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: isMobile ? "12px" : "13px",
                fontWeight: isMobile ? "bold" : "normal",
                whiteSpace: "nowrap",
                minHeight: isMobile ? "36px" : "auto",
                position: "relative",
                zIndex: 1,
                userSelect: "none",
              }}
            >
              {isMobile ? "編集" : "🔓 編集モード"}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              style={{
                padding: isMobile ? "8px 12px" : "6px 8px",
                background: undoStack.length === 0 ? "#d1d5db" : "#6b7280",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: undoStack.length === 0 ? "not-allowed" : "pointer",
                opacity: undoStack.length === 0 ? 0.5 : 1,
                fontSize: isMobile ? "16px" : "13px",
                minWidth: "auto",
                minHeight: isMobile ? "40px" : "auto",
                position: "relative",
                zIndex: 1,
                userSelect: "none",
              }}
              title="戻る (Ctrl+Z)"
            >
              ↶
            </button>
            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              style={{
                padding: isMobile ? "8px 12px" : "6px 10px",
                background: redoStack.length === 0 ? "#d1d5db" : "#6b7280",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: redoStack.length === 0 ? "not-allowed" : "pointer",
                opacity: redoStack.length === 0 ? 0.5 : 1,
                fontSize: isMobile ? "16px" : "13px",
                fontWeight: isMobile ? "bold" : "normal",
                minWidth: "auto",
                minHeight: isMobile ? "40px" : "auto",
                position: "relative",
                zIndex: 1,
                userSelect: "none",
              }}
              title="進む (Ctrl+Y)"
            >
              {isMobile ? "↷" : "↷ 進む"}
            </button>
            <button
              onClick={async () => {
                // マップが編集されている場合は保存
                if (hasUnsavedChanges) {
                  await saveToGAS();
                }
                // リンク集が編集されている場合は保存
                if (hasUnsavedLinksChanges) {
                  await saveLinksToGAS();
                }
              }}
              disabled={hasAnyOverlap || (!hasUnsavedChanges && !hasUnsavedLinksChanges)}
              style={{
                padding: isMobile ? "8px 16px" : "8px 14px",
                background: (hasAnyOverlap || (!hasUnsavedChanges && !hasUnsavedLinksChanges)) ? "#9ca3af" : "#16a34a",
                color: "white",
                border: (hasAnyOverlap || (!hasUnsavedChanges && !hasUnsavedLinksChanges)) ? "none" : "2px solid #22c55e",
                borderRadius: 8,
                cursor: (hasAnyOverlap || (!hasUnsavedChanges && !hasUnsavedLinksChanges)) ? "not-allowed" : "pointer",
                opacity: (hasAnyOverlap || (!hasUnsavedChanges && !hasUnsavedLinksChanges)) ? 0.6 : 1,
                fontSize: isMobile ? "14px" : "14px",
                fontWeight: "bold",
                whiteSpace: "nowrap",
                minHeight: isMobile ? "40px" : "auto",
                position: "relative",
                zIndex: 1,
                boxShadow: (hasAnyOverlap || !hasUnsavedChanges) ? "none" : "0 4px 12px rgba(22, 163, 74, 0.4)",
                animation: (hasAnyOverlap || !hasUnsavedChanges) ? "none" : "savePulse 2s ease-in-out infinite",
                transform: (hasAnyOverlap || !hasUnsavedChanges) ? "none" : "scale(1.05)",
                userSelect: "none",
              }}
              title={
                hasAnyOverlap 
                  ? "オブジェクトが重なっているため保存できません" 
                  : !hasUnsavedChanges 
                  ? "変更がないため保存できません"
                  : ""
              }
            >
              {isMobile ? "💾 保存" : "💾 保存"}
            </button>
            <button
              onClick={() => {
                setModalSelectedType(lastSelectedType);
                setShowAddObjectModal(true);
              }}
              style={{
                padding: isMobile ? "6px 8px" : "6px 10px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: isMobile ? "12px" : "13px",
                whiteSpace: "nowrap",
                fontWeight: "bold",
                minHeight: isMobile ? "36px" : "auto",
                position: "relative",
                zIndex: 1,
                userSelect: "none",
              }}
            >
              {isMobile ? "新規" : "➕ 新規オブジェクト"}
            </button>
            <button
              onClick={exitEditMode}
              style={{
                padding: isMobile ? "6px 8px" : "6px 10px",
                background: "#dc2626",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: isMobile ? "12px" : "13px",
                fontWeight: isMobile ? "bold" : "normal",
                whiteSpace: "nowrap",
                minHeight: isMobile ? "36px" : "auto",
                position: "relative",
                zIndex: 1,
                userSelect: "none",
              }}
            >
              {isMobile ? "終了" : "🔒 編集終了"}
            </button>
          </>
        )}
        <div style={{ 
          marginLeft: "auto", 
          opacity: 0.8, 
          fontSize: "11px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "flex",
          gap: "4px",
          alignItems: "center",
          flexWrap: "wrap"
        }}>
          <span style={{ display: "none" }}>objects: {objects.length}</span>
          {isEditMode && <span style={{ color: "#2563eb", fontWeight: "bold" }}>🔧</span>}
          {hasUnsavedChanges && <span style={{ color: "#f59e0b", fontWeight: "bold" }}>🟡</span>}
          {hasAnyOverlap && <span style={{ color: "#dc2626", fontWeight: "bold" }}>⚠️</span>}
        </div>
      </div>

      {/* パスワード認証モーダル */}
      {showPasswordModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
            overflowY: "auto",
          }}
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: 12,
              width: "100%",
              maxWidth: "400px",
              minWidth: "280px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: "0 0 16px 0", userSelect: "none" }}>編集モード認証</h2>
            <p style={{ margin: "0 0 12px 0", fontSize: 14, color: "#666", userSelect: "none" }}>
              パスワードを入力してください
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
              placeholder="パスワード"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: 6,
                fontSize: 14,
                boxSizing: "border-box",
              }}
              autoFocus
            />
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button
                onClick={() => setShowPasswordModal(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  background: "white",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                キャンセル
              </button>
              <button
                onClick={handlePasswordSubmit}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                ログイン
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 新規オブジェクト追加モーダル（スマホ対応） */}
      {showAddObjectModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
            overflowY: "auto",
          }}
          onClick={() => setShowAddObjectModal(false)}
        >
          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: 12,
              width: "100%",
              maxWidth: "400px",
              minWidth: "280px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: "0 0 16px 0", userSelect: "none" }}>新規施設を追加</h2>
            <p style={{ margin: "0 0 12px 0", fontSize: 14, color: "#666", userSelect: "none" }}>
              {pendingPosition 
                ? `クリックした位置 (${pendingPosition.x}, ${pendingPosition.y}) に新しい施設を追加します`
                : "マップの中央に新しい施設を追加します"}
            </p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500, userSelect: "none" }}>
                タイプを選択
              </label>
              <select
                value={modalSelectedType}
                onChange={(e) => setModalSelectedType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  fontSize: 14,
                  boxSizing: "border-box",
                }}
              >
                <option value="">（選択してください）</option>
                <option value="HQ">本部</option>
                <option value="BEAR_TRAP">熊罠</option>
                <option value="STATUE">同盟建造物</option>
                <option value="CITY">都市</option>
                <option value="DEPOT">同盟資材</option>
                <option value="FLAG">旗</option>
                <option value="MOUNTAIN">山</option>
                <option value="LAKE">湖</option>
                <option value="OTHER">その他</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => {
                  setShowAddObjectModal(false);
                  setPendingPosition(null);
                }}
                style={{
                  flex: 1,
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  background: "white",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  if (!modalSelectedType) {
                    alert("タイプを選択してください");
                    return;
                  }
                  pushToHistory(objects);
                  const centerX = pendingPosition ? pendingPosition.x : Math.floor(cfg.cols / 2);
                  const centerY = pendingPosition ? pendingPosition.y : Math.floor(cfg.rows / 2);
                  const newId = `obj_${Date.now()}`;
                  const defaultSize = getDefaultSize(modalSelectedType);
                  
                  let newLabel = "新規施設";
                  if (modalSelectedType === "FLAG") newLabel = "🚩";
                  else if (modalSelectedType === "MOUNTAIN") newLabel = "🏔️";
                  else if (modalSelectedType === "LAKE") newLabel = "🌊";
                  
                  const newObj: Obj = {
                    id: newId,
                    type: modalSelectedType,
                    label: newLabel,
                    x: centerX,
                    y: centerY,
                    w: defaultSize.w,
                    h: defaultSize.h,
                  };
                  setObjects((prev) => [...prev, newObj]);
                  setSelectedId(newId);
                  setEditingObject(newObj);
                  setOriginalEditingId(newId);  // 新規追加時も元のIDとして設定
                  if (isMobile) setIsPositionSizeExpanded(false); // モバイルではアコーディオンを閉じる
                  setHasUnsavedChanges(true);
                  setLastSelectedType(modalSelectedType);
                  setShowAddObjectModal(false);
                  setPendingPosition(null);
                }}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                追加
              </button>
            </div>
          </div>
        </div>
      )}

      {err && (
        <div
          style={{
            margin: "0 12px",
            padding: "12px 16px",
            flexShrink: 0,
            background: "rgba(220, 38, 38, 0.1)",
            border: "1px solid rgba(220, 38, 38, 0.3)",
            borderRadius: 8,
            color: "#991b1b",
            fontSize: 14,
          }}
        >
          <strong>⚠️ エラー:</strong> {err}
        </div>
      )}

      <div
        style={{
          margin: isMobile ? "0" : "12px",
          marginTop: isMobile ? "52px" : "60px",
          marginBottom: isMobile ? "0" : "12px",
          flex: 1,
          border: isMobile ? "none" : "1px solid rgba(0,0,0,0.10)",
          borderRadius: isMobile ? 0 : 12,
          overflow: "hidden",
          background: "transparent",
          touchAction: "none",
          minHeight: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ 
            width: "100%", 
            height: "100%", 
            display: "block",
            userSelect: "none",
            position: "relative",
            zIndex: 1,
            WebkitUserSelect: "none",
            WebkitTouchCallout: "none"
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onClick={onClick}
          onDoubleClick={onDoubleClick}
        />
        
        {/* 誕生日テロップ（CSS keyframes実装） */}
        {!isEditMode && !tickerHidden && !showBirthdayCelebration && !isLoading && (
          <div style={{
              position: "absolute",
              top: 28,
              left: 0,
              right: 0,
              height: 22,
              background: "linear-gradient(to bottom, rgba(255,255,200,0.5), rgba(255,255,200,0.7))",
              backdropFilter: "blur(2px)",
              overflow: "hidden",
              zIndex: 10,
              pointerEvents: "none",
            }}>
              <div 
                key={tickerKey}
                style={{
                  position: "absolute",
                  display: "flex",
                  whiteSpace: "nowrap",
                  animation: "tickerScroll 60s linear infinite",
                }}>
                <span style={{
                  fontSize: 14,
                  fontFamily: "system-ui",
                  color: "#4a4a4a",
                  lineHeight: "22px",
                  paddingRight: "100vw",
                }}>
                  {tickerText}
                </span>
                <span style={{
                  fontSize: 14,
                  fontFamily: "system-ui",
                  color: "#4a4a4a",
                  lineHeight: "22px",
                  paddingRight: "100vw",
                }}>
                  {tickerText}
                </span>
              </div>
            </div>
        )}
        
        {/* ズームボタン */}
        <div
          style={{
            position: "absolute",
            bottom: isMobile ? 12 : 16,
            right: isMobile ? 8 : 16,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            zIndex: 10,
          }}
        >
          <button
            onClick={() => {
              setCam((prev) => {
                const newScale = Math.min(prev.scale * 1.2, 3);
                return { ...prev, scale: newScale };
              });
              
              // カメラ移動中フラグを設定
              setIsCameraMoving(true);
              if (cameraMovingTimerRef.current) clearTimeout(cameraMovingTimerRef.current);
              cameraMovingTimerRef.current = setTimeout(() => setIsCameraMoving(false), 200);
            }}
            style={{
              width: 40,
              height: 40,
              border: "1px solid #d1d5db",
              borderRadius: 8,
              background: "white",
              cursor: "pointer",
              fontSize: 20,
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              transition: "all 0.2s",
              userSelect: "none",
              WebkitUserSelect: "none",
            } as React.CSSProperties}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f3f4f6";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "white";
              e.currentTarget.style.transform = "scale(1)";
            }}
            title="ズームイン"
          >
            +
          </button>
          <button
            onClick={() => {
              setCam((prev) => {
                const newScale = Math.max(prev.scale / 1.2, 0.1);
                return { ...prev, scale: newScale };
              });
              
              // カメラ移動中フラグを設定
              setIsCameraMoving(true);
              if (cameraMovingTimerRef.current) clearTimeout(cameraMovingTimerRef.current);
              cameraMovingTimerRef.current = setTimeout(() => setIsCameraMoving(false), 200);
            }}
            style={{
              width: 40,
              height: 40,
              border: "1px solid #d1d5db",
              borderRadius: 8,
              background: "white",
              cursor: "pointer",
              fontSize: 20,
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              transition: "all 0.2s",
              userSelect: "none",
              WebkitUserSelect: "none",
            } as React.CSSProperties}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f3f4f6";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "white";
              e.currentTarget.style.transform = "scale(1)";
            }}
            title="ズームアウト"
          >
            −
          </button>
          
          {/* ズームレベル表示 */}
          <div
            style={{
              width: 40,
              padding: "4px 0",
              background: "rgba(255,255,255,0.7)",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: "500",
              color: "#6b7280",
              textAlign: "center",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              userSelect: "none",
            }}
          >
            ×{cam.scale.toFixed(2)}
          </div>
        </div>
      </div>

      {/* 編集ダイアログ */}
      {editingObject && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: isMobile ? "12px" : "16px",
            overflowY: "auto",
          }}
          onClick={() => {
            setEditingObject(null);
            setOriginalEditingId(null);
            window.scrollTo(0, 0);
          }}
        >
          <div
            style={{
              background: "white",
              padding: "0",
              borderRadius: 16,
              width: "100%",
              maxWidth: isMobile ? "min(calc(100vw - 32px), 460px)" : "480px",
              minWidth: isMobile ? "auto" : "280px",
              maxHeight: isMobile ? "calc(100vh - 24px)" : "90vh",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              margin: "0 auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              padding: isMobile ? "12px 16px" : "18px 24px",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              flexShrink: 0,
            }}>
              <h2 style={{ margin: 0, color: "white", fontSize: isMobile ? 17 : 20, fontWeight: 600, userSelect: "none" }}>オブジェクト編集</h2>
            </div>
            <div style={{ padding: isMobile ? "14px" : "20px", overflowY: "auto", flex: 1 }}>
            
            {/* ID入力フィールド */}
            <div style={{ 
              marginBottom: isMobile ? 8 : 12,
              display: isMobile ? "grid" : "block",
              gridTemplateColumns: isMobile ? "70px 1fr" : "auto",
              gap: isMobile ? "8px" : "0",
              alignItems: isMobile ? "center" : "flex-start",
              background: isMobile ? "linear-gradient(to right, rgba(107, 114, 128, 0.03), rgba(156, 163, 175, 0.03))" : "transparent",
              padding: isMobile ? "10px" : "0",
              borderRadius: isMobile ? 8 : 0,
              border: isMobile ? "1px solid rgba(107, 114, 128, 0.1)" : "none",
            }}>
              <label style={{ 
                display: "flex",
                alignItems: "center",
                gap: isMobile ? 4 : 0,
                marginBottom: isMobile ? 0 : 6, 
                fontSize: 13, 
                fontWeight: 600, 
                color: "#374151",
                userSelect: "none",
              }}>
                {isMobile && "🔖"}
                <span>ID</span>
              </label>
              <input
                type="text"
                value={editingObject.id != null ? String(editingObject.id) : ""}
                onChange={(e) => {
                  const newId = e.target.value.trim();
                  setEditingObject({ ...editingObject, id: newId });
                }}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: (() => {
                    const newId = editingObject.id != null ? String(editingObject.id) : "";
                    const isDuplicate = objects.some(o => String(o.id) === newId && String(o.id) !== originalEditingId);
                    return isDuplicate ? "2px solid #dc2626" : "2px solid #e5e7eb";
                  })(),
                  borderRadius: 8,
                  fontSize: 15,
                  boxSizing: "border-box",
                  backgroundColor: "white",
                  color: "#1f2937",
                  transition: "all 0.2s",
                  outline: "none",
                  boxShadow: isMobile ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
                onFocus={(e) => {
                  const newId = editingObject.id != null ? String(editingObject.id) : "";
                  const isDuplicate = objects.some(o => String(o.id) === newId && String(o.id) !== originalEditingId);
                  if (!isDuplicate) {
                    e.target.style.borderColor = "#2563eb";
                    e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)";
                  }
                }}
                onBlur={(e) => {
                  const newId = editingObject.id != null ? String(editingObject.id) : "";
                  const isDuplicate = objects.some(o => String(o.id) === newId && String(o.id) !== originalEditingId);
                  e.target.style.borderColor = isDuplicate ? "#dc2626" : "#e5e7eb";
                  e.target.style.boxShadow = isMobile ? "0 1px 3px rgba(0,0,0,0.1)" : "none";
                }}
              />
              {(() => {
                const currentId = editingObject.id != null ? String(editingObject.id) : "";
                const isDuplicate = objects.some(o => String(o.id) === currentId && String(o.id) !== originalEditingId);
                return isDuplicate ? (
                  <p style={{ margin: "4px 0 0 0", fontSize: 11, color: "#dc2626", userSelect: "none" }}>
                    ⚠️ このIDは既に使用されています
                  </p>
                ) : null;
              })()}
            </div>

            <div style={{ 
              marginBottom: isMobile ? 8 : 12,
              display: isMobile ? "grid" : "block",
              gridTemplateColumns: isMobile ? "70px 1fr" : "auto",
              gap: isMobile ? "8px" : "0",
              alignItems: isMobile ? "center" : "flex-start",
              background: isMobile ? "linear-gradient(to right, rgba(59, 130, 246, 0.03), rgba(147, 197, 253, 0.03))" : "transparent",
              padding: isMobile ? "10px" : "0",
              borderRadius: isMobile ? 8 : 0,
              border: isMobile ? "1px solid rgba(59, 130, 246, 0.1)" : "none",
            }}>
              <label style={{ 
                display: "flex",
                alignItems: "center",
                gap: isMobile ? 4 : 0,
                marginBottom: isMobile ? 0 : 6, 
                fontSize: 13, 
                fontWeight: 600, 
                color: "#374151",
                userSelect: "none",
              }}>
                {isMobile && "📝"}
                <span>名前</span>
              </label>
              <input
                ref={nameInputRef}
                type="text"
                value={editingObject.label || ""}
                onChange={(e) => setEditingObject({ ...editingObject, label: e.target.value })}
                readOnly={editingObject.type === "FLAG" || editingObject.type === "MOUNTAIN" || editingObject.type === "LAKE"}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "2px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: 15,
                  boxSizing: "border-box",
                  backgroundColor: (editingObject.type === "FLAG" || editingObject.type === "MOUNTAIN" || editingObject.type === "LAKE") ? "#f9fafb" : "white",
                  color: "#1f2937",
                  cursor: (editingObject.type === "FLAG" || editingObject.type === "MOUNTAIN" || editingObject.type === "LAKE") ? "not-allowed" : "text",
                  transition: "all 0.2s",
                  outline: "none",
                  boxShadow: isMobile ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
                onFocus={(e) => {
                  if (editingObject.type !== "FLAG" && editingObject.type !== "MOUNTAIN" && editingObject.type !== "LAKE") {
                    e.target.style.borderColor = "#2563eb";
                    e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)";
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                  e.target.style.boxShadow = isMobile ? "0 1px 3px rgba(0,0,0,0.1)" : "none";
                }}
              />
            </div>

            {/* 誕生日入力フィールド */}
            <div style={{ 
              marginBottom: isMobile ? 8 : 12,
              display: isMobile ? "grid" : "block",
              gridTemplateColumns: isMobile ? "70px 1fr" : "auto",
              gap: isMobile ? "8px" : "0",
              alignItems: isMobile ? "center" : "flex-start",
              background: isMobile ? "linear-gradient(to right, rgba(251, 146, 60, 0.03), rgba(254, 215, 170, 0.03))" : "transparent",
              padding: isMobile ? "10px" : "0",
              borderRadius: isMobile ? 8 : 0,
              border: isMobile ? "1px solid rgba(251, 146, 60, 0.1)" : "none",
            }}>
              <label style={{ 
                display: "flex",
                alignItems: "center",
                gap: isMobile ? 4 : 0,
                marginBottom: isMobile ? 0 : 6, 
                fontSize: 13, 
                fontWeight: 600, 
                color: "#374151",
                userSelect: "none",
              }}>
                {isMobile && "🎂"}
                <span>誕生日</span>
              </label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <select
                  value={(() => {
                    if (!editingObject.birthday) return '';
                    const match = editingObject.birthday.match(/(\d{1,2})月/);
                    return match ? match[1] : '';
                  })()}
                  onChange={(e) => {
                    const month = e.target.value;
                    if (!month) {
                      setEditingObject({ ...editingObject, birthday: '' });
                    } else {
                      const currentDay = (() => {
                        if (!editingObject.birthday) return '1';
                        const match = editingObject.birthday.match(/(\d{1,2})日/);
                        return match ? match[1] : '1';
                      })();
                      setEditingObject({ ...editingObject, birthday: `${month}月${currentDay}日` });
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    border: "2px solid #e5e7eb",
                    borderRadius: 8,
                    fontSize: 15,
                    boxSizing: "border-box",
                    backgroundColor: "white",
                    color: "#1f2937",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="">--月</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>{m}月</option>
                  ))}
                </select>
                <select
                  value={(() => {
                    if (!editingObject.birthday) return '';
                    const match = editingObject.birthday.match(/(\d{1,2})日/);
                    return match ? match[1] : '';
                  })()}
                  onChange={(e) => {
                    const day = e.target.value;
                    const currentMonth = (() => {
                      if (!editingObject.birthday) return '';
                      const match = editingObject.birthday.match(/(\d{1,2})月/);
                      return match ? match[1] : '';
                    })();
                    if (!day || !currentMonth) {
                      setEditingObject({ ...editingObject, birthday: '' });
                    } else {
                      setEditingObject({ ...editingObject, birthday: `${currentMonth}月${day}日` });
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    border: "2px solid #e5e7eb",
                    borderRadius: 8,
                    fontSize: 15,
                    boxSizing: "border-box",
                    backgroundColor: "white",
                    color: "#1f2937",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="">--日</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                    <option key={d} value={d}>{d}日</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ 
              marginBottom: isMobile ? 8 : 12,
              display: isMobile ? "grid" : "block",
              gridTemplateColumns: isMobile ? "70px 1fr" : "auto",
              gap: isMobile ? "8px" : "0",
              alignItems: isMobile ? "center" : "flex-start",
              background: isMobile ? "linear-gradient(to right, rgba(147, 51, 234, 0.03), rgba(196, 181, 253, 0.03))" : "transparent",
              padding: isMobile ? "10px" : "0",
              borderRadius: isMobile ? 8 : 0,
              border: isMobile ? "1px solid rgba(147, 51, 234, 0.1)" : "none",
            }}>
              <label style={{ 
                display: "flex",
                alignItems: "center",
                gap: isMobile ? 4 : 0,
                marginBottom: isMobile ? 0 : 6, 
                fontSize: 13, 
                fontWeight: 600, 
                color: "#374151",
                userSelect: "none",
              }}>
                {isMobile && "🏷️"}
                <span>タイプ</span>
              </label>
              <select
                value={editingObject.type || "OTHER"}
                onChange={(e) => {
                  const newType = e.target.value;
                  const defaultSize = getDefaultSize(newType);
                  let newLabel = editingObject.label;
                  if (newType === "FLAG") newLabel = "🚩";
                  else if (newType === "MOUNTAIN") newLabel = "🏔️";
                  else if (newType === "LAKE") newLabel = "🌊";
                  setEditingObject({ 
                    ...editingObject, 
                    type: newType,
                    label: newLabel,
                    w: defaultSize.w,
                    h: defaultSize.h,
                  });
                }}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "2px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: 15,
                  boxSizing: "border-box",
                  backgroundColor: "white",
                  color: "#1f2937",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <option value="HQ">本部</option>
                <option value="BEAR_TRAP">熊罠</option>
                <option value="STATUE">同盟建造物</option>
                <option value="CITY">都市</option>
                <option value="DEPOT">同盟資材</option>
                <option value="FLAG">旗</option>
                <option value="MOUNTAIN">山</option>
                <option value="LAKE">湖</option>
                <option value="OTHER">その他</option>
              </select>
            </div>

            {/* 位置・サイズセクション（アコーディオン） */}
            <div style={{ marginBottom: isMobile ? 8 : 12 }}>
              <button
                onClick={() => setIsPositionSizeExpanded(!isPositionSizeExpanded)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  background: "#f9fafb",
                  border: "2px solid #e5e7eb",
                  borderRadius: 8,
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#374151",
                  userSelect: "none",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f3f4f6";
                  e.currentTarget.style.borderColor = "#d1d5db";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f9fafb";
                  e.currentTarget.style.borderColor = "#e5e7eb";
                }}
              >
                <span>📐 位置・サイズ設定</span>
                <span style={{ fontSize: 12, transition: "transform 0.2s", transform: isPositionSizeExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
              </button>
              
              {isPositionSizeExpanded && (
                <div style={{ marginTop: 12 }}>
                  {/* X座標 */}
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#374151", userSelect: "none" }}>
                      X座標
                    </label>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button
                        onClick={() => setEditingObject({ ...editingObject, x: Math.max(0, (editingObject.x || 0) - 1) })}
                        style={{
                          width: 40,
                          height: 46,
                          border: "2px solid #e5e7eb",
                          borderRadius: 8,
                          background: "white",
                          cursor: "pointer",
                          fontSize: 20,
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#6b7280",
                          flexShrink: 0,
                          userSelect: "none",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f3f4f6";
                          e.currentTarget.style.borderColor = "#d1d5db";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "white";
                          e.currentTarget.style.borderColor = "#e5e7eb";
                        }}
                      >
                        −
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={editingObject.x || 0}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setEditingObject({ ...editingObject, x: val === '' ? 0 : Number(val) });
                        }}
                        style={{
                          flex: 1,
                          padding: "12px 8px",
                          border: "2px solid #e5e7eb",
                          borderRadius: 8,
                          fontSize: 16,
                          boxSizing: "border-box",
                          backgroundColor: "white",
                          color: "#1f2937",
                          outline: "none",
                          textAlign: "center",
                          fontWeight: 600,
                        }}
                      />
                      <button
                        onClick={() => setEditingObject({ ...editingObject, x: (editingObject.x || 0) + 1 })}
                        style={{
                          width: 40,
                          height: 46,
                          border: "2px solid #e5e7eb",
                          borderRadius: 8,
                          background: "white",
                          cursor: "pointer",
                          fontSize: 20,
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#6b7280",
                          flexShrink: 0,
                          userSelect: "none",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f3f4f6";
                          e.currentTarget.style.borderColor = "#d1d5db";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "white";
                          e.currentTarget.style.borderColor = "#e5e7eb";
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  {/* Y座標 */}
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#374151", userSelect: "none" }}>
                      Y座標
                    </label>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button
                        onClick={() => setEditingObject({ ...editingObject, y: Math.max(0, (editingObject.y || 0) - 1) })}
                        style={{
                          width: 40,
                          height: 46,
                          border: "2px solid #e5e7eb",
                          borderRadius: 8,
                          background: "white",
                          cursor: "pointer",
                          fontSize: 20,
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#6b7280",
                          flexShrink: 0,
                          userSelect: "none",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f3f4f6";
                          e.currentTarget.style.borderColor = "#d1d5db";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "white";
                          e.currentTarget.style.borderColor = "#e5e7eb";
                        }}
                      >
                        −
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={editingObject.y || 0}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setEditingObject({ ...editingObject, y: val === '' ? 0 : Number(val) });
                        }}
                        style={{
                          flex: 1,
                          padding: "12px 8px",
                          border: "2px solid #e5e7eb",
                          borderRadius: 8,
                          fontSize: 16,
                          boxSizing: "border-box",
                          backgroundColor: "white",
                          color: "#1f2937",
                          outline: "none",
                          textAlign: "center",
                          fontWeight: 600,
                        }}
                      />
                      <button
                        onClick={() => setEditingObject({ ...editingObject, y: (editingObject.y || 0) + 1 })}
                        style={{
                          width: 40,
                          height: 46,
                          border: "2px solid #e5e7eb",
                          borderRadius: 8,
                          background: "white",
                          cursor: "pointer",
                          fontSize: 20,
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#6b7280",
                          flexShrink: 0,
                          userSelect: "none",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f3f4f6";
                          e.currentTarget.style.borderColor = "#d1d5db";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "white";
                          e.currentTarget.style.borderColor = "#e5e7eb";
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  {/* 幅 */}
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#374151", userSelect: "none" }}>
                      幅
                    </label>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button
                        onClick={() => setEditingObject({ ...editingObject, w: Math.max(1, (editingObject.w || 1) - 1) })}
                        style={{
                          width: 40,
                          height: 46,
                          border: "2px solid #e5e7eb",
                          borderRadius: 8,
                          background: "white",
                          cursor: "pointer",
                          fontSize: 20,
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#6b7280",
                          flexShrink: 0,
                          userSelect: "none",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f3f4f6";
                          e.currentTarget.style.borderColor = "#d1d5db";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "white";
                          e.currentTarget.style.borderColor = "#e5e7eb";
                        }}
                      >
                        −
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={editingObject.w || 1}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setEditingObject({ ...editingObject, w: Math.max(1, val === '' ? 1 : Number(val)) });
                        }}
                        style={{
                          flex: 1,
                          padding: "12px 8px",
                          border: "2px solid #e5e7eb",
                          borderRadius: 8,
                          fontSize: 16,
                          boxSizing: "border-box",
                          backgroundColor: "white",
                          color: "#1f2937",
                          outline: "none",
                          textAlign: "center",
                          fontWeight: 600,
                        }}
                      />
                      <button
                        onClick={() => setEditingObject({ ...editingObject, w: (editingObject.w || 1) + 1 })}
                        style={{
                          width: 40,
                          height: 46,
                          border: "2px solid #e5e7eb",
                          borderRadius: 8,
                          background: "white",
                          cursor: "pointer",
                          fontSize: 20,
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#6b7280",
                          flexShrink: 0,
                          userSelect: "none",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f3f4f6";
                          e.currentTarget.style.borderColor = "#d1d5db";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "white";
                          e.currentTarget.style.borderColor = "#e5e7eb";
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  {/* 高さ */}
                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#374151", userSelect: "none" }}>
                      高さ
                    </label>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button
                        onClick={() => setEditingObject({ ...editingObject, h: Math.max(1, (editingObject.h || 1) - 1) })}
                        style={{
                          width: 40,
                          height: 46,
                          border: "2px solid #e5e7eb",
                          borderRadius: 8,
                          background: "white",
                          cursor: "pointer",
                          fontSize: 20,
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#6b7280",
                          flexShrink: 0,
                          userSelect: "none",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f3f4f6";
                          e.currentTarget.style.borderColor = "#d1d5db";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "white";
                          e.currentTarget.style.borderColor = "#e5e7eb";
                        }}
                      >
                        −
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={editingObject.h || 1}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setEditingObject({ ...editingObject, h: Math.max(1, val === '' ? 1 : Number(val)) });
                        }}
                        style={{
                          flex: 1,
                          padding: "12px 8px",
                          border: "2px solid #e5e7eb",
                          borderRadius: 8,
                          fontSize: 16,
                          boxSizing: "border-box",
                          backgroundColor: "white",
                          color: "#1f2937",
                          outline: "none",
                          textAlign: "center",
                          fontWeight: 600,
                        }}
                      />
                      <button
                        onClick={() => setEditingObject({ ...editingObject, h: (editingObject.h || 1) + 1 })}
                        style={{
                          width: 40,
                          height: 46,
                          border: "2px solid #e5e7eb",
                          borderRadius: 8,
                          background: "white",
                          cursor: "pointer",
                          fontSize: 20,
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#6b7280",
                          flexShrink: 0,
                          userSelect: "none",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f3f4f6";
                          e.currentTarget.style.borderColor = "#d1d5db";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "white";
                          e.currentTarget.style.borderColor = "#e5e7eb";
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ 
              marginBottom: isMobile ? 10 : 16, 
              padding: isMobile ? "10px" : "14px", 
              background: "#fef3c7", 
              borderRadius: 8,
              border: "2px solid #fbbf24",
            }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
                <input
                  type="checkbox"
                  checked={editingObject.isFavorite || false}
                  onChange={(e) => setEditingObject({ ...editingObject, isFavorite: e.target.checked })}
                  style={{
                    width: 20,
                    height: 20,
                    cursor: "pointer",
                    accentColor: "#f59e0b",
                  }}
                />
                <span style={{ fontSize: 15, fontWeight: 600, color: "#92400e", userSelect: "none" }}>
                  ⭐ お気に入り（注目マーク）
                </span>
              </label>
              <p style={{ margin: "8px 0 0 30px", fontSize: 12, color: "#78350f", lineHeight: 1.5, userSelect: "none" }}>
                チェックするとマップ上でピンク系の柔らかいぼかしで目立つように表示されます
              </p>
            </div>

            {/* メモ欄 */}
            <div style={{ 
              marginBottom: isMobile ? 10 : 16,
              display: isMobile ? "block" : "block",
            }}>
              <label style={{ 
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 8, 
                fontSize: 13, 
                fontWeight: 600, 
                color: "#374151",
                userSelect: "none",
              }}>
                <span>📝</span>
                <span>メモ</span>
                <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 400, userSelect: "none" }}>（選択時に吹き出しで表示されます）</span>
              </label>
              <textarea
                value={editingObject.note || ""}
                onChange={(e) => setEditingObject({ ...editingObject, note: e.target.value })}
                placeholder="このオブジェクトについてのメモを入力してください..."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "2px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: 14,
                  boxSizing: "border-box",
                  backgroundColor: "white",
                  color: "#1f2937",
                  minHeight: "80px",
                  resize: "vertical",
                  fontFamily: "system-ui",
                  lineHeight: 1.5,
                  outline: "none",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#2563eb";
                  e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* メインアクションボタン */}
            <div style={{ 
              display: "flex", 
              gap: 10,
              paddingTop: 8, 
              borderTop: "1px solid #e5e7eb" 
            }}>
              {/* PC版：削除ボタンを左側に小さく配置 */}
              {!isMobile && (
                <button
                  onClick={() => {
                    if (confirm("本当に削除しますか？")) {
                      setObjects((prev) => prev.filter((o) => o.id !== editingObject.id));
                      setEditingObject(null);
                      setOriginalEditingId(null);
                      setSelectedId(null);
                      setHasUnsavedChanges(true);
                      window.scrollTo(0, 0);
                    }
                  }}
                  style={{
                    padding: "9px 14px",
                    background: "white",
                    color: "#dc2626",
                    border: "1px solid #fca5a5",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 500,
                    minWidth: "auto",
                    transition: "all 0.2s",
                    opacity: 0.7,
                    userSelect: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.borderColor = "#dc2626";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "0.7";
                    e.currentTarget.style.borderColor = "#fca5a5";
                  }}
                >
                  🗑️
                </button>
              )}
              <div style={{ flex: 1 }} />
              
              {/* キャンセルと更新ボタン */}
              <div style={{ 
                display: "flex", 
                gap: 10,
                width: isMobile ? "100%" : "auto",
              }}>
                <button
                  onClick={() => {
                    setEditingObject(null);
                    setOriginalEditingId(null);
                    window.scrollTo(0, 0);
                  }}
                  style={{
                    padding: isMobile ? "13px 0" : "11px 24px",
                    border: "2px solid #d1d5db",
                    borderRadius: 8,
                    background: "white",
                    color: "#374151",
                    cursor: "pointer",
                    fontSize: isMobile ? 15 : 14,
                    fontWeight: 600,
                    flex: isMobile ? 1 : "0 0 auto",
                    minWidth: isMobile ? 0 : "auto",
                    transition: "all 0.2s",
                    userSelect: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f3f4f6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "white";
                  }}
                >
                  {isMobile ? "閉じる" : "キャンセル"}
                </button>
                <button
                  onClick={() => {
                    // 必須入力チェック
                    if (!editingObject.label || editingObject.label.trim() === "") {
                      alert("名前を入力してください");
                      return;
                    }
                    if (!editingObject.type) {
                      alert("タイプを選択してください");
                      return;
                    }
                    const idStr = editingObject.id != null ? String(editingObject.id).trim() : "";
                    if (!idStr) {
                      alert("IDを入力してください");
                      return;
                    }
                    
                    // ID重複チェック
                    const isDuplicate = objects.some(o => String(o.id) === idStr && String(o.id) !== originalEditingId);
                    if (isDuplicate) {
                      alert("このIDは既に使用されています。別のIDを入力してください。");
                      return;
                    }
                    
                    // グリッドスナップを適用し、全角ハイフンを半角に変換
                    const snappedObject = {
                      ...editingObject,
                      id: idStr,  // IDを文字列として明示的に設定
                      label: (editingObject.label || '').replace(/ー/g, '-'),  // 全角ハイフンを半角に変換
                      x: Math.round(num(editingObject.x, 0)),
                      y: Math.round(num(editingObject.y, 0)),
                      w: Math.max(1, Math.round(num(editingObject.w, 1))),
                      h: Math.max(1, Math.round(num(editingObject.h, 1))),
                    };
                    
                    // IDが変更されている場合、selectedIdも更新
                    if (originalEditingId && originalEditingId !== idStr) {
                      setSelectedId(idStr);
                    }
                    
                    setObjects((prev) =>
                      prev.map((o) => (o.id === originalEditingId ? snappedObject : o))
                    );
                    setEditingObject(null);
                    setOriginalEditingId(null);
                    setHasUnsavedChanges(true);
                    window.scrollTo(0, 0);
                  }}
                  style={{
                    padding: isMobile ? "13px 0" : "11px 28px",
                    background: "#2563eb",
                    color: "white",
                    border: "2px solid #2563eb",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: isMobile ? 15 : 14,
                    fontWeight: 600,
                    flex: isMobile ? 1 : "0 0 auto",
                    minWidth: isMobile ? 0 : "auto",
                    boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)",
                    transition: "all 0.2s",
                    userSelect: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#1d4ed8";
                    e.currentTarget.style.borderColor = "#1d4ed8";
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#2563eb";
                    e.currentTarget.style.borderColor = "#2563eb";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(37, 99, 235, 0.3)";
                  }}
                >
                  {isMobile ? "✓ 更新" : "更新"}
                </button>
              </div>
            </div>
            
            {/* スマホ版：削除ボタンを小さく控えめに下部に配置 */}
            {isMobile && (
              <div style={{ 
                paddingTop: 12,
                textAlign: "center",
              }}>
                <button
                  onClick={() => {
                    if (confirm("⚠️ 本当に削除しますか？\n\nこの操作は取り消せません。")) {
                      setObjects((prev) => prev.filter((o) => o.id !== editingObject.id));
                      setEditingObject(null);
                      setOriginalEditingId(null);
                      setSelectedId(null);
                      setHasUnsavedChanges(true);
                      window.scrollTo(0, 0);
                    }
                  }}
                  style={{
                    padding: "8px 20px",
                    background: "transparent",
                    color: "#9ca3af",
                    border: "1px dashed #d1d5db",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 500,
                    transition: "all 0.2s",
                    userSelect: "none",
                  }}
                >
                  🗑️ このオブジェクトを削除
                </button>
              </div>
            )}
            </div>
          </div>
        </div>
      )}

      {/* リンク編集/追加モーダル */}
      {(editingLink || showAddLinkModal) && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: isMobile ? "16px" : "20px",
          }}
          onClick={() => {
            setEditingLink(null);
            setShowAddLinkModal(false);
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 12,
              padding: isMobile ? "20px" : "28px",
              maxWidth: 500,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ 
              margin: "0 0 20px 0", 
              fontSize: isMobile ? 18 : 20, 
              fontWeight: 700,
              color: "#1f2937",
              userSelect: "none",
            }}>
              {editingLink ? "リンク編集" : "リンク追加"}
            </h2>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#374151", userSelect: "none" }}>
                表示名（絵文字含む）
              </label>
              <input
                type="text"
                value={editingLink?.name || ""}
                onChange={(e) => {
                  if (editingLink) {
                    setEditingLink({ ...editingLink, name: e.target.value });
                  }
                }}
                placeholder="例: 🎁 交換センター"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "2px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: 15,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#374151", userSelect: "none" }}>
                URL
              </label>
              <input
                type="url"
                value={editingLink?.url || ""}
                onChange={(e) => {
                  if (editingLink) {
                    setEditingLink({ ...editingLink, url: e.target.value });
                  }
                }}
                placeholder="https://example.com"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "2px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: 15,
                  boxSizing: "border-box",
                }}
              />
            </div>

            {!showAddLinkModal && editingLink && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
                  <input
                    type="checkbox"
                    checked={editingLink.display}
                    onChange={(e) => {
                      setEditingLink({ ...editingLink, display: e.target.checked });
                    }}
                    style={{ width: 18, height: 18, cursor: "pointer" }}
                  />
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
                    メニューに表示する
                  </span>
                </label>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button
                onClick={() => {
                  setEditingLink(null);
                  setShowAddLinkModal(false);
                }}
                style={{
                  flex: 1,
                  padding: "11px 24px",
                  border: "2px solid #d1d5db",
                  borderRadius: 8,
                  background: "white",
                  color: "#374151",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  userSelect: "none",
                }}
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  if (!editingLink?.name || !editingLink?.url) {
                    alert("表示名とURLを入力してください");
                    return;
                  }

                  if (showAddLinkModal) {
                    // 新規追加
                    const newLink = { 
                      name: editingLink.name || "", 
                      url: editingLink.url || "", 
                      order: links.length + 1,
                      display: true  // 新規追加は常に表示
                    };
                    setLinks([...links, newLink]);
                    setHasUnsavedLinksChanges(true);
                  } else if (editingLink) {
                    // 編集
                    setLinks(links.map((link, i) => 
                      i === editingLink.index 
                        ? { name: editingLink.name, url: editingLink.url, order: link.order, display: editingLink.display }
                        : link
                    ));
                    setHasUnsavedLinksChanges(true);
                  }

                  setEditingLink(null);
                  setShowAddLinkModal(false);
                  setHasUnsavedChanges(true);
                }}
                style={{
                  flex: 1,
                  padding: "11px 28px",
                  background: "#2563eb",
                  color: "white",
                  border: "2px solid #2563eb",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  userSelect: "none",
                }}
              >
                {editingLink && !showAddLinkModal ? "更新" : "追加"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 背景設定モーダル */}
      {showBgConfigModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: isMobile ? "16px" : "20px",
          }}
          onClick={() => setShowBgConfigModal(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: 12,
              padding: isMobile ? "20px" : "28px",
              maxWidth: 500,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ 
              margin: "0 0 20px 0", 
              fontSize: isMobile ? 20 : 22, 
              fontWeight: 600,
              color: "#1f2937",
              userSelect: "none",
            }}>
              🖼️ 背景画像設定
            </h2>
            
            {/* 画像選択 */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ 
                display: "block", 
                marginBottom: 8, 
                fontSize: 13, 
                fontWeight: 600, 
                color: "#374151",
                userSelect: "none",
              }}>
                背景画像
              </label>
              <select
                value={bgConfig.image}
                onChange={(e) => setBgConfig({...bgConfig, image: e.target.value})}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "2px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: 15,
                  boxSizing: "border-box",
                  backgroundColor: "white",
                  color: "#1f2937",
                  cursor: "pointer",
                }}
              >
                <option value="map-bg.jpg">map-bg.jpg (デフォルト)</option>
                <option value="map-bg2.jpg">map-bg2.jpg</option>
                <option value="map-bg3.webp">map-bg3.webp</option>
                <option value="map-bg4.jpg">map-bg4.jpg</option>
                <option value="map-bg5.jpg">map-bg5.jpg</option>
                <option value="map-bg6.webp">map-bg6.webp</option>
              </select>
            </div>

            {/* 中心点X */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ 
                display: "block", 
                marginBottom: 8, 
                fontSize: 13, 
                fontWeight: 600, 
                color: "#374151",
                userSelect: "none",
              }}>
                中心点X: {bgConfig.centerX}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={bgConfig.centerX}
                onChange={(e) => setBgConfig({...bgConfig, centerX: Number(e.target.value)})}
                style={{
                  width: "100%",
                  cursor: "pointer",
                }}
              />
            </div>

            {/* 中心点Y */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ 
                display: "block", 
                marginBottom: 8, 
                fontSize: 13, 
                fontWeight: 600, 
                color: "#374151",
                userSelect: "none",
              }}>
                中心点Y: {bgConfig.centerY}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={bgConfig.centerY}
                onChange={(e) => setBgConfig({...bgConfig, centerY: Number(e.target.value)})}
                style={{
                  width: "100%",
                  cursor: "pointer",
                }}
              />
            </div>

            {/* 拡大率 */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ 
                display: "block", 
                marginBottom: 8, 
                fontSize: 13, 
                fontWeight: 600, 
                color: "#374151",
                userSelect: "none",
              }}>
                拡大率: {bgConfig.scale.toFixed(2)}
              </label>
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.05"
                value={bgConfig.scale}
                onChange={(e) => setBgConfig({...bgConfig, scale: Number(e.target.value)})}
                style={{
                  width: "100%",
                  cursor: "pointer",
                }}
              />
            </div>

            {/* 透明度 */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ 
                display: "block", 
                marginBottom: 8, 
                fontSize: 13, 
                fontWeight: 600, 
                color: "#374151",
                userSelect: "none",
              }}>
                透明度: {(bgConfig.opacity * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={bgConfig.opacity}
                onChange={(e) => setBgConfig({...bgConfig, opacity: Number(e.target.value)})}
                style={{
                  width: "100%",
                  cursor: "pointer",
                }}
              />
            </div>

            {/* ボタン */}
            <div style={{ 
              display: "flex", 
              gap: 12, 
              marginTop: 24,
            }}>
              <button
                onClick={() => setShowBgConfigModal(false)}
                style={{
                  flex: 1,
                  padding: "11px 28px",
                  background: "white",
                  color: "#6b7280",
                  border: "2px solid #d1d5db",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  userSelect: "none",
                }}
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  // 背景設定変更を未保存としてマーク
                  setHasUnsavedChanges(true);
                  setShowBgConfigModal(false);
                  setToastMessage("💾 背景設定を変更しました。保存してください");
                }}
                style={{
                  flex: 1,
                  padding: "11px 28px",
                  background: "#8b5cf6",
                  color: "white",
                  border: "2px solid #8b5cf6",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  userSelect: "none",
                }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* マイオブジェクト選択モーダル */}
      {showMyObjectSelector && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: isMobile ? "16px" : "20px",
          }}
          onClick={() => {
            setShowMyObjectSelector(false);
            setMyObjectSearchText('');
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 12,
              padding: isMobile ? "20px" : "28px",
              maxWidth: 600,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 右上の閉じるボタン */}
            <button
              onClick={() => {
                setShowMyObjectSelector(false);
                setMyObjectSearchText('');
              }}
              style={{
                position: "absolute",
                top: isMobile ? 12 : 16,
                right: isMobile ? 12 : 16,
                width: 32,
                height: 32,
                border: "none",
                borderRadius: 6,
                background: "#f3f4f6",
                color: "#6b7280",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: "bold",
                transition: "all 0.2s",
                userSelect: "none",
                zIndex: 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#e5e7eb";
                e.currentTarget.style.color = "#374151";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f3f4f6";
                e.currentTarget.style.color = "#6b7280";
              }}
              title="閉じる"
            >
              ✕
            </button>
            
            <h2 style={{ 
              margin: "0 0 20px 0", 
              fontSize: isMobile ? 20 : 22, 
              fontWeight: 600,
              color: "#1f2937",
              userSelect: "none",
            }}>
              📍 マイオブジェクト設定
            </h2>
            
            <p style={{
              margin: "0 0 20px 0",
              fontSize: 14,
              color: "#6b7280",
              userSelect: "none",
            }}>
              自分のオブジェクトを選択すると、マップを開いた時に自動的にそのオブジェクトが中心に表示されます。<br/>
              （設定はこの端末にのみ保存されます）
            </p>
            
            {/* 検索フィールド */}
            <div style={{ marginBottom: 20 }}>
              <input
                type="text"
                placeholder="🔍 都市名で検索..."
                value={myObjectSearchText}
                onChange={(e) => setMyObjectSearchText(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "2px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: 14,
                  boxSizing: "border-box",
                  outline: "none",
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "#5b21b6"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#e5e7eb"}
              />
            </div>
            
            {/* クリアボタン */}
            {myObjectId && (
              <button
                onClick={() => {
                  setMyObjectId(null);
                  try {
                    localStorage.removeItem('snw-my-object-id');
                  } catch (err) {
                    console.error('マイオブジェクトIDの削除に失敗:', err);
                  }
                  setShowMyObjectSelector(false);
                  setMyObjectSearchText('');
                }}
                style={{
                  padding: "10px 16px",
                  background: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 20,
                  userSelect: "none",
                }}
              >
                ✕ 設定をクリア
              </button>
            )}
            
            {/* オブジェクト一覧 */}
            {(() => {
              // カタカナ→ひらがな変換
              const toHiragana = (str: string) => {
                return str.replace(/[\u30a1-\u30f6]/g, (match) => {
                  const chr = match.charCodeAt(0) - 0x60;
                  return String.fromCharCode(chr);
                });
              };
              
              // ひらがな→カタカナ変換
              const toKatakana = (str: string) => {
                return str.replace(/[\u3041-\u3096]/g, (match) => {
                  const chr = match.charCodeAt(0) + 0x60;
                  return String.fromCharCode(chr);
                });
              };
              
              // ローマ字→ひらがな簡易変換（主要なパターンのみ）
              const romajiToHiragana = (str: string) => {
                const map: Record<string, string> = {
                  'kya': 'きゃ', 'kyu': 'きゅ', 'kyo': 'きょ',
                  'sha': 'しゃ', 'shu': 'しゅ', 'sho': 'しょ',
                  'cha': 'ちゃ', 'chu': 'ちゅ', 'cho': 'ちょ',
                  'nya': 'にゃ', 'nyu': 'にゅ', 'nyo': 'にょ',
                  'hya': 'ひゃ', 'hyu': 'ひゅ', 'hyo': 'ひょ',
                  'mya': 'みゃ', 'myu': 'みゅ', 'myo': 'みょ',
                  'rya': 'りゃ', 'ryu': 'りゅ', 'ryo': 'りょ',
                  'gya': 'ぎゃ', 'gyu': 'ぎゅ', 'gyo': 'ぎょ',
                  'ja': 'じゃ', 'ju': 'じゅ', 'jo': 'じょ',
                  'bya': 'びゃ', 'byu': 'びゅ', 'byo': 'びょ',
                  'pya': 'ぴゃ', 'pyu': 'ぴゅ', 'pyo': 'ぴょ',
                  'ka': 'か', 'ki': 'き', 'ku': 'く', 'ke': 'け', 'ko': 'こ',
                  'sa': 'さ', 'shi': 'し', 'su': 'す', 'se': 'せ', 'so': 'そ',
                  'ta': 'た', 'chi': 'ち', 'tsu': 'つ', 'te': 'て', 'to': 'と',
                  'na': 'な', 'ni': 'に', 'nu': 'ぬ', 'ne': 'ね', 'no': 'の',
                  'ha': 'は', 'hi': 'ひ', 'fu': 'ふ', 'he': 'へ', 'ho': 'ほ',
                  'ma': 'ま', 'mi': 'み', 'mu': 'む', 'me': 'め', 'mo': 'も',
                  'ya': 'や', 'yu': 'ゆ', 'yo': 'よ',
                  'ra': 'ら', 'ri': 'り', 'ru': 'る', 're': 'れ', 'ro': 'ろ',
                  'wa': 'わ', 'wo': 'を', 'nn': 'ん', 'n': 'ん',
                  'ga': 'が', 'gi': 'ぎ', 'gu': 'ぐ', 'ge': 'げ', 'go': 'ご',
                  'za': 'ざ', 'ji': 'じ', 'zu': 'ず', 'ze': 'ぜ', 'zo': 'ぞ',
                  'da': 'だ', 'di': 'ぢ', 'du': 'づ', 'de': 'で', 'do': 'ど',
                  'ba': 'ば', 'bi': 'び', 'bu': 'ぶ', 'be': 'べ', 'bo': 'ぼ',
                  'pa': 'ぱ', 'pi': 'ぴ', 'pu': 'ぷ', 'pe': 'ぺ', 'po': 'ぽ',
                  'a': 'あ', 'i': 'い', 'u': 'う', 'e': 'え', 'o': 'お',
                };
                
                let result = str.toLowerCase();
                // 長いパターンから順に変換
                const sortedKeys = Object.keys(map).sort((a, b) => b.length - a.length);
                for (const key of sortedKeys) {
                  result = result.split(key).join(map[key]);
                }
                return result;
              };
              
              // 柔軟な検索マッチング
              const flexibleMatch = (label: string, searchText: string) => {
                if (!searchText) return true;
                
                const labelLower = label.toLowerCase();
                const searchLower = searchText.toLowerCase();
                
                // 1. 直接マッチ
                if (labelLower.includes(searchLower)) return true;
                
                // 2. ひらがな化してマッチ
                const labelHiragana = toHiragana(label);
                const searchHiragana = toHiragana(searchText);
                if (labelHiragana.includes(searchHiragana)) return true;
                
                // 3. カタカナ化してマッチ
                const labelKatakana = toKatakana(label);
                const searchKatakana = toKatakana(searchText);
                if (labelKatakana.includes(searchKatakana)) return true;
                
                // 4. ローマ字→ひらがな変換してマッチ
                const searchFromRomaji = romajiToHiragana(searchText);
                if (labelHiragana.includes(searchFromRomaji)) return true;
                if (toKatakana(labelHiragana).includes(toKatakana(searchFromRomaji))) return true;
                
                return false;
              };
              
              const cityObjects = objects.filter(obj => obj.id && obj.label && obj.type === 'CITY');
              const filteredCities = cityObjects.filter(obj => 
                flexibleMatch(obj.label || '', myObjectSearchText)
              ).sort((a, b) => (a.label || '').localeCompare(b.label || '', 'ja'));
              
              return (
                <>
                  <div style={{
                    marginBottom: 12,
                    fontSize: 13,
                    color: "#6b7280",
                    fontWeight: 600,
                    userSelect: "none",
                  }}>
                    都市数: {filteredCities.length} / {cityObjects.length}
                  </div>
                  
                  <div style={{
                    maxHeight: "50vh",
                    overflowY: "auto",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                  }}>
                    {filteredCities.length === 0 ? (
                      <div style={{
                        padding: "40px 20px",
                        textAlign: "center",
                        color: "#9ca3af",
                        fontSize: 14,
                      }}>
                        該当する都市が見つかりません
                      </div>
                    ) : (
                      filteredCities.map((obj, index) => {
                const isSelected = myObjectId === obj.id;
                return (
                  <div
                    key={obj.id || index}
                    onClick={() => {
                      const newId = obj.id || null;
                      setMyObjectId(newId);
                      try {
                        if (newId) {
                          localStorage.setItem('snw-my-object-id', newId);
                          
                          // カメラを選択したオブジェクトに即座に移動
                          const cols = meta.cols ?? 60;
                          const rows = meta.rows ?? 40;
                          const cell = meta.cellSize ?? 24;
                          const targetScale = window.innerWidth <= 768 ? 0.78 : 1.0;
                          
                          const cx = (cols * cell) / 2;
                          const cy = (rows * cell) / 2;
                          const targetX = (obj.x ?? 0) * cell;
                          const targetY = (obj.y ?? 0) * cell;
                          const offsetX = targetX - cx;
                          const offsetY = targetY - cy;
                          
                          const angle = -Math.PI / 4;
                          const cos = Math.cos(angle);
                          const sin = Math.sin(angle);
                          const rotatedX = offsetX * cos - offsetY * sin;
                          const rotatedY = offsetX * sin + offsetY * cos;
                          
                          const tx = -rotatedX * targetScale;
                          const ty = -rotatedY * targetScale;
                          
                          setCam({ tx, ty, scale: targetScale });
                        } else {
                          localStorage.removeItem('snw-my-object-id');
                        }
                      } catch (err) {
                        console.error('マイオブジェクトIDの保存に失敗:', err);
                      }
                      setShowMyObjectSelector(false);
                      setMyObjectSearchText('');
                    }}
                    style={{
                      padding: "12px 16px",
                      borderBottom: index < filteredCities.length - 1 ? "1px solid #e5e7eb" : "none",
                      cursor: "pointer",
                      background: isSelected ? "#dbeafe" : "white",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      userSelect: "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "#f3f4f6";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "white";
                    }}
                  >
                    <div style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      border: `2px solid ${isSelected ? "#2563eb" : "#d1d5db"}`,
                      background: isSelected ? "#2563eb" : "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {isSelected && (
                        <div style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "white",
                        }}/>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: "#1f2937", fontSize: 15 }}>
                        {obj.label}
                      </div>
                      <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                        ID: {obj.id} | タイプ: {obj.type || "未設定"}
                      </div>
                    </div>
                  </div>
                );
              })
                    )}
                  </div>
                </>
              );
            })()}
            
            {/* 閉じるボタン */}
            <button
              onClick={() => {
                setShowMyObjectSelector(false);
                setMyObjectSearchText(''); // 検索テキストをリセット
              }}
              style={{
                width: "100%",
                padding: "11px 28px",
                background: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                marginTop: 20,
                userSelect: "none",
              }}
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      <div style={{ 
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        padding: isMobile ? "4px 2px" : "8px 12px", 
        fontSize: isMobile ? 10 : 12, 
        opacity: 0.7,
        wordBreak: "break-word",
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(8px)",
        borderTop: "1px solid rgba(0,0,0,0.05)",
        zIndex: 90,
        userSelect: "none"
      }}>
        {isEditMode
          ? (isMobile 
              ? "編集：長押しでドラッグ＆矢印表示 / 矢印タップで移動 / OKボタンで移動終了 / ダブルタップで編集"
              : "編集モード：ドラッグで移動 / ダブルクリックで編集 / 「➕新規オブジェクト」ボタンまたはCtrl+クリックで施設追加 / 🟡オレンジ枠=未保存")
          : (isMobile
              ? "操作：ドラッグでパン / ピンチでズーム"
              : "操作：ドラッグで移動（パン）／ピンチでズーム／タップで選択（リング表示）／文字は水平固定")}
      </div>
    </main>
  );
}
