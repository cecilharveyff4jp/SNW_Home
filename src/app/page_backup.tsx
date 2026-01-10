"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Meta = { cols?: number; rows?: number; cellSize?: number; mapName?: string };
type Obj = {
  id?: string;
  type?: string;
  label?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  icon?: string;
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
      return { top: "rgba(107,114,128,0.18)", side: "rgba(107,114,128,0.10)", stroke: "#6b7280" };
    default:
      return { top: "rgba(17,24,39,0.14)", side: "rgba(17,24,39,0.08)", stroke: "#111827" };
  }
}

// 回転（2D）
function rot(x: number, y: number, angle: number) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: x * c - y * s, y: x * s + y * c };
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  const [meta, setMeta] = useState<Meta>({});
  const [objects, setObjects] = useState<Obj[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 編集モード
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [editingObject, setEditingObject] = useState<Obj | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ objId: string; mx: number; my: number; objX: number; objY: number } | null>(null);

  // カメラ：パン(tx,ty)は「画面座標系」での移動量（ピクセル）、scaleは倍率
  const [cam, setCam] = useState({ tx: 0, ty: 0, scale: 1 });

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

      // 影（右下）
      shadowColor: "rgba(0,0,0,0.28)",
      shadowBlur: 10,
      shadowX: 10,
      shadowY: 12,

      // グリッド
      grid: "rgba(0,0,0,0.06)",
      gridMajor: "rgba(0,0,0,0.10)",
      majorEvery: 5,

      // 立体の高さ（px換算：cellに応じて）
      liftMin: 8,
      liftRatio: 0.35,

      // 選択表現
      glowColor: "rgba(80,160,255,0.55)",
      ringColor: "rgba(80,160,255,0.90)",
    }),
    []
  );

  async function loadMap() {
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
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setErr(message);
      console.error("マップ読み込みエラー:", e);
    }
  }

  useEffect(() => {
    loadMap();
  }, []);

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

    // 背景（うっすら寒色）
    ctx.clearRect(0, 0, viewW, viewH);
    const bg = ctx.createLinearGradient(0, 0, 0, viewH);
    bg.addColorStop(0, "#ffffff");
    bg.addColorStop(1, "#f2f5fb");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, viewW, viewH);

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

    // 立体の“持ち上げ”ベクトル（スクリーンで右下影↘なので、上面は左上↖にズラす）
    const liftPx = Math.max(LOOK.liftMin, cell * LOOK.liftRatio);

    // スクリーン方向の「上面オフセット」（↖）
    const liftScreen = { x: -liftPx * 0.8, y: -liftPx * 1.0 };
    // マップ（回転前）座標に変換：R(-angle)で戻す
    const liftMap = rot(liftScreen.x, liftScreen.y, -LOOK.angle);

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

      // 立体：下面（フットプリント）4点
      const b1 = { x: gx, y: gy };
      const b2 = { x: gx + gw, y: gy };
      const b3 = { x: gx + gw, y: gy + gh };
      const b4 = { x: gx, y: gy + gh };

      // 上面：下面をliftMap分だけ移動
      const t1 = { x: b1.x + liftMap.x, y: b1.y + liftMap.y };
      const t2 = { x: b2.x + liftMap.x, y: b2.y + liftMap.y };
      const t3 = { x: b3.x + liftMap.x, y: b3.y + liftMap.y };
      const t4 = { x: b4.x + liftMap.x, y: b4.y + liftMap.y };

      // 側面（右側＆下側）を描く（簡易で“高さ”が出る）
      ctx.fillStyle = th.side;
      // 選択リング＆グロー
      if (selectedId && id && selectedId === id) {
        ctx.save();
        ctx.shadowColor = LOOK.glowColor;
        ctx.shadowBlur = 18;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.strokeStyle = LOOK.ringColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.rect(gx, gy, gw, gh);
        ctx.stroke();
        ctx.restore();
      }

      // 文字：水平のまま（回転を打ち消す）
      const label = `${o.icon ? o.icon + " " : ""}${o.label ?? ""}`.trim();
      if (label) {
        const center = { x: gx + gw / 2, y: gy + gh / 2 };

        ctx.save();
        ctx.translate(center.x, center.y);

        // ★ここで回転を戻す（文字は水平）
        ctx.rotate(-LOOK.angle);

        ctx.font = "12px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // 文字の下地（読みやすく）
        const padX = 8;
        const w = ctx.measureText(label).width;
        const boxW = w + padX * 2;
        const boxH = 18;

        ctx.fillStyle = "rgba(255,255,255,0.75)";
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

        ctx.fillStyle = "#111";
        ctx.fillText(label, 0, 0);

        ctx.restore();
      }
    }

    ctx.restore();

    // HUD
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.font = "12px system-ui";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText(`${cfg.name} | objects:${objects.length} | zoom:${cam.scale.toFixed(2)}`, viewW - 10, 10);
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
  }, [objects, cfg.cols, cfg.rows, cfg.cell, cam, selectedId]);

  // ====== 入力：パン＆ズーム（タッチ/マウス） ======
  const onPointerDown = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const { mx, my } = screenToMap(sx, sy, rect.width, rect.height);

    // 編集モード時：オブジェクトドラッグ開始
    if (isEditMode && pointersRef.current.size === 0) {
      const hit = hitTest(mx, my);
      if (hit && hit.id) {
        dragStartRef.current = {
          objId: String(hit.id),
          mx,
          my,
          objX: num(hit.x, 0),
          objY: num(hit.y, 0),
        };
        setIsDragging(true);
        setSelectedId(String(hit.id));
        canvas.setPointerCapture(e.pointerId);
        pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        return;
      }
    }

    canvas.setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // 2本指になったらピンチ開始
    if (pointersRef.current.size === 2) {
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

    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // 編集モード：オブジェクトドラッグ中
    if (isDragging && dragStartRef.current) {
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

      // オブジェクトの位置を更新
      setObjects((prev) =>
        prev.map((o) =>
          o.id === dragStartRef.current?.objId
            ? { ...o, x: Math.round(newX * 10) / 10, y: Math.round(newY * 10) / 10 }
            : o
        )
      );
      return;
    }

    // ピンチ中
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

    // 1本指＝パン
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;

    // ちょい動いたらパン扱い
    setCam((c) => ({ ...c, tx: c.tx + dx, ty: c.ty + dy }));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointersRef.current.delete(e.pointerId);
    pinchRef.current = null;
    setIsDragging(false);
    dragStartRef.current = null;
  };

  const onPointerCancel = (e: React.PointerEvent) => {
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
    
    // Ctrl+クリックで新規オブジェクト追加（編集モード時）
    if (isEditMode && e.ctrlKey) {
      const gridX = Math.floor(mx / cfg.cell);
      const gridY = Math.floor(my / cfg.cell);
      const newId = `obj_${Date.now()}`;
      const newObj: Obj = {
        id: newId,
        type: "OTHER",
        label: "新規施設",
        x: gridX,
        y: gridY,
        w: 2,
        h: 2,
        icon: "",
      };
      setObjects((prev) => [...prev, newObj]);
      setSelectedId(newId);
      setEditingObject(newObj);
      return;
    }

    const hit = hitTest(mx, my);
    setSelectedId(hit?.id ? String(hit.id) : null);
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
      setEditingObject(hit);
    }
  };

  // PCホイールズーム（中心固定）
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    const delta = -e.deltaY;
    const factor = delta > 0 ? 1.08 : 0.92;
    const newScale = clamp(cam.scale * factor, 0.35, 2.5);

    setCam((c) => ({ ...c, scale: newScale }));
    requestDraw();
  };

  // 編集モード認証
  const handlePasswordSubmit = () => {
    if (password === "snw1234") {
      setIsEditMode(true);
      setShowPasswordModal(false);
      setPassword("");
    } else {
      alert("パスワードが間違っています");
    }
  };

  const exitEditMode = () => {
    setIsEditMode(false);
    setSelectedId(null);
    setEditingObject(null);
  };

  // GASへ保存
  const saveToGAS = async () => {
    try {
      const base = process.env.NEXT_PUBLIC_GAS_URL;
      if (!base) {
        alert("GASのURLが設定されていません");
        return;
      }

      const actorName = prompt("あなたの名前を入力してください:", "名無し");
      if (!actorName) return;

      const password = prompt("パスワードを入力してください:", "");
      if (!password) return;

      const res = await fetch(`${base}?action=saveMap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          actor: actorName,
          objects,
        }),
      });

      const json = await res.json();
      if (!json.ok) {
        throw new Error(json.error || "保存に失敗しました");
      }

      alert("✅ 保存完了しました！");
      await loadMap(); // 再読込
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      alert(`❌ 保存エラー: ${message}`);
    }
  };

  return (
    <main style={{ padding: 12, fontFamily: "system-ui" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>{cfg.name}</h1>
        <button onClick={loadMap} style={{ padding: "8px 10px" }}>
          再読込
        </button>
        {!isEditMode ? (
          <button
            onClick={() => setShowPasswordModal(true)}
            style={{
              padding: "8px 12px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            🔒 編集モード
          </button>
        ) : (
          <>
            <button
              onClick={saveToGAS}
              style={{
                padding: "8px 12px",
                background: "#16a34a",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              💾 保存
            </button>
            <button
              onClick={exitEditMode}
              style={{
                padding: "8px 12px",
                background: "#dc2626",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              🔓 編集モード終了
            </button>
          </>
        )}
        <div style={{ marginLeft: "auto", opacity: 0.8 }}>
          objects: {objects.length}
          {selectedId ? ` | selected: ${selectedId}` : ""}
          {isEditMode && <span style={{ color: "#2563eb", fontWeight: "bold" }}> | 編集中</span>}
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
          }}
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: 12,
              minWidth: 320,
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: "0 0 16px 0" }}>編集モード認証</h2>
            <p style={{ margin: "0 0 12px 0", fontSize: 14, color: "#666" }}>
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
                }}
              >
                ログイン
              </button>
            </div>
          </div>
        </div>
      )}

      {err && (
        <div
          style={{
            marginTop: 10,
            padding: "12px 16px",
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
          marginTop: 10,
          width: "100%",
          height: "calc(100vh - 90px)",
          border: "1px solid rgba(0,0,0,0.10)",
          borderRadius: 12,
          overflow: "hidden",
          background: "#fff",
          touchAction: "none", // ★これがないとピンチがブラウザ操作に取られる
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "100%", display: "block" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onClick={onClick}
          onDoubleClick={onDoubleClick}
          onWheel={onWheel}
        />
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
          }}
          onClick={() => setEditingObject(null)}
        >
          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: 12,
              minWidth: 400,
              maxWidth: 500,
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: "0 0 20px 0" }}>オブジェクト編集</h2>
            
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>
                名前
              </label>
              <input
                type="text"
                value={editingObject.label || ""}
                onChange={(e) => setEditingObject({ ...editingObject, label: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  fontSize: 14,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>
                タイプ
              </label>
              <select
                value={editingObject.type || "OTHER"}
                onChange={(e) => setEditingObject({ ...editingObject, type: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  fontSize: 14,
                  boxSizing: "border-box",
                }}
              >
                <option value="HQ">本部</option>
                <option value="BEAR_TRAP">熊罠</option>
                <option value="STATUE">像</option>
                <option value="CITY">都市</option>
                <option value="DEPOT">資材庫</option>
                <option value="OTHER">その他</option>
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>
                  X座標
                </label>
                <input
                  type="number"
                  value={editingObject.x || 0}
                  onChange={(e) => setEditingObject({ ...editingObject, x: Number(e.target.value) })}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: 6,
                    fontSize: 14,
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>
                  Y座標
                </label>
                <input
                  type="number"
                  value={editingObject.y || 0}
                  onChange={(e) => setEditingObject({ ...editingObject, y: Number(e.target.value) })}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: 6,
                    fontSize: 14,
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div>
                <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>
                  幅
                </label>
                <input
                  type="number"
                  value={editingObject.w || 1}
                  onChange={(e) => setEditingObject({ ...editingObject, w: Math.max(1, Number(e.target.value)) })}
                  min="1"
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: 6,
                    fontSize: 14,
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>
                  高さ
                </label>
                <input
                  type="number"
                  value={editingObject.h || 1}
                  onChange={(e) => setEditingObject({ ...editingObject, h: Math.max(1, Number(e.target.value)) })}
                  min="1"
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: 6,
                    fontSize: 14,
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => {
                  if (confirm("本当に削除しますか？")) {
                    setObjects((prev) => prev.filter((o) => o.id !== editingObject.id));
                    setEditingObject(null);
                    setSelectedId(null);
                  }
                }}
                style={{
                  padding: "10px 16px",
                  background: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                🗑️ 削除
              </button>
              <div style={{ flex: 1 }} />
              <button
                onClick={() => setEditingObject(null)}
                style={{
                  padding: "10px 16px",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  background: "white",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  setObjects((prev) =>
                    prev.map((o) => (o.id === editingObject.id ? editingObject : o))
                  );
                  setEditingObject(null);
                }}
                style={{
                  padding: "10px 16px",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
        {isEditMode
          ? "編集モード：ドラッグで移動／ダブルクリックで編集／Ctrl+クリックで新規追加"
          : "操作：ドラッグで移動（パン）／ピンチでズーム／タップで選択（リング表示）／文字は水平固定"}
      </div>
    </main>
  );
}

