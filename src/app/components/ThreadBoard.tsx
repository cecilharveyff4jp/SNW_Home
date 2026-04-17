"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addPost,
  createThread,
  deleteThread,
  fetchThread,
  fetchThreads,
  likeThread,
  type ThreadDetail,
  type ThreadIndexEntry,
} from "../threadApi";
import { compressImageToWebP } from "../imageCompress";

type Props = {
  isEditMode: boolean;
  isDarkMode: boolean;
  initialThreadId?: string | null;
  onClose: () => void;
  onToast?: (msg: string) => void;
  standalone?: boolean;
  onBackToMap?: () => void;
};

const ACTOR = "SNW member"; // 編集モード入室者 = メンバー扱い
const MAX_IMAGES_PER_POST = 6;

export default function ThreadBoard({
  isEditMode,
  isDarkMode,
  initialThreadId,
  onClose,
  onToast,
  standalone = false,
  onBackToMap,
}: Props) {
  const [threads, setThreads] = useState<ThreadIndexEntry[]>([]);
  const [currentThread, setCurrentThread] = useState<ThreadDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // スレ作成フォーム
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  // 投稿フォーム
  const [postComment, setPostComment] = useState("");
  const [postImages, setPostImages] = useState<File[]>([]);
  const [posting, setPosting] = useState(false);

  // いいね連打防止（ローカルのみ）
  const [likedThreads, setLikedThreads] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const stored = localStorage.getItem("snw_liked_threads");
      return new Set(stored ? JSON.parse(stored) : []);
    } catch {
      return new Set();
    }
  });

  const persistLiked = useCallback((set: Set<string>) => {
    try {
      localStorage.setItem("snw_liked_threads", JSON.stringify([...set]));
    } catch {
      // ignore
    }
  }, []);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchThreads();
      setThreads(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const openThread = useCallback(async (threadId: string) => {
    setLoading(true);
    setError(null);
    try {
      const detail = await fetchThread(threadId);
      setCurrentThread(detail);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  // 初回ロード
  useEffect(() => {
    loadList();
  }, [loadList]);

  // URLクエリからの自動オープン
  useEffect(() => {
    if (initialThreadId) {
      openThread(initialThreadId);
    }
  }, [initialThreadId, openThread]);

  const handleCreate = async () => {
    const title = newTitle.trim();
    if (!title) {
      onToast?.("⚠️ タイトルを入力してください");
      return;
    }
    try {
      const id = await createThread(title, ACTOR);
      onToast?.("✅ スレッドを作成しました");
      setNewTitle("");
      setShowCreateForm(false);
      await loadList();
      await openThread(id);
    } catch (e) {
      onToast?.(`❌ 作成失敗: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const handleDelete = async (threadId: string) => {
    if (!confirm("このスレッドを削除しますか？（復元は手動対応のみ）")) return;
    try {
      await deleteThread(threadId);
      onToast?.("✅ スレッドを削除しました");
      setCurrentThread(null);
      await loadList();
    } catch (e) {
      onToast?.(`❌ 削除失敗: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const handleLike = async (threadId: string) => {
    if (likedThreads.has(threadId)) {
      onToast?.("ℹ️ 既にいいね済みです");
      return;
    }
    try {
      const newLikes = await likeThread(threadId);
      const next = new Set(likedThreads);
      next.add(threadId);
      setLikedThreads(next);
      persistLiked(next);
      // 楽観更新
      setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, likes: newLikes } : t)));
      setCurrentThread((prev) => (prev && prev.id === threadId ? { ...prev, likes: newLikes } : prev));
    } catch (e) {
      onToast?.(`❌ いいね失敗: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const handleShare = async (threadId: string) => {
    const basePath = process.env.NODE_ENV === "production" ? "/SNW_Home" : "";
    const url = `${window.location.origin}${basePath}/thread?id=${encodeURIComponent(threadId)}`;
    try {
      await navigator.clipboard.writeText(url);
      onToast?.("🔗 リンクをコピーしました");
    } catch {
      // fallback
      window.prompt("リンクをコピー:", url);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > MAX_IMAGES_PER_POST) {
      onToast?.(`⚠️ 画像は最大${MAX_IMAGES_PER_POST}枚まで`);
      setPostImages(files.slice(0, MAX_IMAGES_PER_POST));
    } else {
      setPostImages(files);
    }
  };

  const handlePost = async () => {
    if (!currentThread) return;
    const comment = postComment.trim();
    if (!comment && postImages.length === 0) {
      onToast?.("⚠️ コメントまたは画像を追加してください");
      return;
    }
    setPosting(true);
    try {
      const compressed = await Promise.all(postImages.map((f) => compressImageToWebP(f)));
      await addPost(
        currentThread.id,
        comment,
        compressed.map((c) => ({ data: c.data, mime: c.mime })),
        ACTOR
      );
      onToast?.("✅ 投稿しました");
      setPostComment("");
      setPostImages([]);
      await openThread(currentThread.id);
      await loadList();
    } catch (e) {
      onToast?.(`❌ 投稿失敗: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setPosting(false);
    }
  };

  // ===== スタイル =====
  const bg = isDarkMode ? "#111827" : "#ffffff";
  const subBg = isDarkMode ? "#1f2937" : "#f9fafb";
  const border = isDarkMode ? "#374151" : "#e5e7eb";
  const text = isDarkMode ? "#e5e7eb" : "#1f2937";
  const mutedText = isDarkMode ? "#9ca3af" : "#6b7280";
  const accent = "#2563eb";

  const outerProps = standalone
    ? {
        style: {
          position: "fixed" as const,
          inset: 0,
          background: bg,
          zIndex: 300,
          display: "flex",
          alignItems: "stretch",
          justifyContent: "center",
          padding: 0,
          overflow: "auto" as const,
        },
      }
    : {
        onClick: onClose,
        style: {
          position: "fixed" as const,
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          zIndex: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        },
      };

  const innerStyle: React.CSSProperties = standalone
    ? {
        background: bg,
        color: text,
        width: "100%",
        maxWidth: 760,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }
    : {
        background: bg,
        color: text,
        width: "100%",
        maxWidth: 760,
        maxHeight: "90vh",
        borderRadius: 12,
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      };

  return (
    <div {...outerProps}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={innerStyle}
      >
        {/* ヘッダ */}
        <div
          style={{
            padding: "14px 16px",
            borderBottom: `1px solid ${border}`,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: subBg,
          }}
        >
          {standalone && (
            <button
              onClick={() => onBackToMap?.()}
              style={iconBtn(isDarkMode)}
              title="マップに戻る"
            >
              🏠 マップ
            </button>
          )}
          {currentThread && !standalone ? (
            <button
              onClick={() => setCurrentThread(null)}
              style={iconBtn(isDarkMode)}
              title="一覧に戻る"
            >
              ← 戻る
            </button>
          ) : null}
          {currentThread && standalone ? (
            <button
              onClick={() => setCurrentThread(null)}
              style={iconBtn(isDarkMode)}
              title="一覧に戻る"
            >
              ← 一覧
            </button>
          ) : null}
          <h2 style={{ margin: 0, fontSize: 18, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            📋 {currentThread ? currentThread.title : "掲示板"}
          </h2>
          {currentThread && (
            <button
              onClick={() => handleShare(currentThread.id)}
              style={iconBtn(isDarkMode)}
              title="リンクをコピー"
            >
              🔗
            </button>
          )}
          {!standalone && (
            <button onClick={onClose} style={iconBtn(isDarkMode)} title="閉じる">
              ✕
            </button>
          )}
        </div>

        {/* 本体 */}
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          {error && (
            <div style={{ padding: 12, background: "#fee2e2", color: "#991b1b", borderRadius: 6, marginBottom: 12 }}>
              {error}
            </div>
          )}

          {loading && <div style={{ color: mutedText }}>読み込み中...</div>}

          {/* === 一覧ビュー === */}
          {!currentThread && !loading && (
            <>
              {isEditMode && (
                <div style={{ marginBottom: 16 }}>
                  {!showCreateForm ? (
                    <button
                      onClick={() => setShowCreateForm(true)}
                      style={primaryBtn(accent)}
                    >
                      ＋ 新規スレッド
                    </button>
                  ) : (
                    <div style={{ display: "flex", gap: 8, flexDirection: "column", padding: 12, background: subBg, borderRadius: 8 }}>
                      <input
                        type="text"
                        placeholder="スレッドタイトル"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        maxLength={120}
                        style={inputStyle(isDarkMode)}
                      />
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={handleCreate} style={primaryBtn(accent)}>作成</button>
                        <button
                          onClick={() => { setShowCreateForm(false); setNewTitle(""); }}
                          style={secondaryBtn(isDarkMode)}
                        >
                          キャンセル
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {threads.length === 0 ? (
                <div style={{ color: mutedText, textAlign: "center", padding: 40 }}>
                  スレッドがまだありません
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {threads.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => openThread(t.id)}
                      style={{
                        padding: 12,
                        border: `1px solid ${border}`,
                        borderRadius: 8,
                        cursor: "pointer",
                        background: subBg,
                        display: "flex",
                        gap: 12,
                        alignItems: "center",
                      }}
                    >
                      {t.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={toEmbeddableDriveUrl(t.thumbnailUrl)}
                          alt=""
                          referrerPolicy="no-referrer"
                          style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 6, flexShrink: 0 }}
                        />
                      ) : (
                        <div style={{ width: 64, height: 64, borderRadius: 6, background: border, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                          📷
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {t.title}
                        </div>
                        <div style={{ fontSize: 12, color: mutedText, marginTop: 4 }}>
                          {formatDate(t.lastPostAt || t.createdAt)} ・ 投稿{t.postCount ?? 0} ・ ♥{t.likes ?? 0}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 4 }} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleLike(t.id)}
                          style={iconBtn(isDarkMode)}
                          title="いいね"
                          disabled={likedThreads.has(t.id)}
                        >
                          {likedThreads.has(t.id) ? "♥" : "♡"}
                        </button>
                        <button
                          onClick={() => handleShare(t.id)}
                          style={iconBtn(isDarkMode)}
                          title="リンクをコピー"
                        >
                          🔗
                        </button>
                        {isEditMode && (
                          <button
                            onClick={() => handleDelete(t.id)}
                            style={iconBtn(isDarkMode)}
                            title="削除"
                          >
                            🗑
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* === 詳細ビュー === */}
          {currentThread && !loading && (
            <>
              <div style={{ fontSize: 12, color: mutedText, marginBottom: 12 }}>
                作成: {formatDate(currentThread.createdAt)} by {currentThread.createdBy} ・ ♥{currentThread.likes}
                <button
                  onClick={() => handleLike(currentThread.id)}
                  style={{ ...iconBtn(isDarkMode), marginLeft: 8 }}
                  disabled={likedThreads.has(currentThread.id)}
                >
                  {likedThreads.has(currentThread.id) ? "♥ いいね済" : "♡ いいね"}
                </button>
                {isEditMode && (
                  <button
                    onClick={() => handleDelete(currentThread.id)}
                    style={{ ...iconBtn(isDarkMode), marginLeft: 8 }}
                  >
                    🗑 削除
                  </button>
                )}
              </div>

              {currentThread.posts.length === 0 ? (
                <div style={{ color: mutedText, textAlign: "center", padding: 20 }}>
                  投稿がまだありません
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {currentThread.posts.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        padding: 12,
                        background: subBg,
                        borderRadius: 8,
                        border: `1px solid ${border}`,
                      }}
                    >
                      <div style={{ fontSize: 12, color: mutedText, marginBottom: 8 }}>
                        {p.createdBy} ・ {formatDate(p.createdAt)}
                      </div>
                      {p.comment && (
                        <div style={{ whiteSpace: "pre-wrap", marginBottom: p.imageUrls.length > 0 ? 10 : 0 }}>
                          {p.comment}
                        </div>
                      )}
                      {p.imageUrls.length > 0 && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8 }}>
                          {p.imageUrls.map((img) => {
                            const embedUrl = toEmbeddableDriveUrl(img.url, img.fileId);
                            return (
                              <a key={img.fileId} href={embedUrl} target="_blank" rel="noreferrer">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={embedUrl}
                                  alt=""
                                  loading="lazy"
                                  referrerPolicy="no-referrer"
                                  style={{ width: "100%", height: 150, objectFit: "cover", borderRadius: 6, display: "block" }}
                                />
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 投稿フォーム */}
              {isEditMode && (
                <div style={{ marginTop: 16, padding: 12, background: subBg, borderRadius: 8, border: `1px solid ${border}` }}>
                  <textarea
                    placeholder="コメント（任意）"
                    value={postComment}
                    onChange={(e) => setPostComment(e.target.value)}
                    maxLength={2000}
                    rows={3}
                    style={{ ...inputStyle(isDarkMode), resize: "vertical", marginBottom: 8 }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={onFileChange}
                    style={{ marginBottom: 8, color: text }}
                  />
                  {postImages.length > 0 && (
                    <div style={{ fontSize: 12, color: mutedText, marginBottom: 8 }}>
                      選択中: {postImages.length}枚
                    </div>
                  )}
                  <button
                    onClick={handlePost}
                    disabled={posting}
                    style={{ ...primaryBtn(accent), opacity: posting ? 0.6 : 1 }}
                  >
                    {posting ? "投稿中..." : "投稿"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDate(ts: number): string {
  if (!ts) return "";
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Google Drive の `uc?id=XXX` は <img> で表示できないので lh3 形式に変換
function toEmbeddableDriveUrl(url: string, fileId?: string): string {
  if (fileId) return `https://lh3.googleusercontent.com/d/${fileId}`;
  const m = url.match(/[?&]id=([^&]+)/);
  if (m) return `https://lh3.googleusercontent.com/d/${m[1]}`;
  const m2 = url.match(/\/d\/([^/]+)/);
  if (m2) return `https://lh3.googleusercontent.com/d/${m2[1]}`;
  return url;
}

function iconBtn(dark: boolean): React.CSSProperties {
  return {
    padding: "6px 10px",
    background: dark ? "#374151" : "#e5e7eb",
    color: dark ? "#e5e7eb" : "#1f2937",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    userSelect: "none",
  };
}

function primaryBtn(color: string): React.CSSProperties {
  return {
    padding: "8px 16px",
    background: color,
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    userSelect: "none",
  };
}

function secondaryBtn(dark: boolean): React.CSSProperties {
  return {
    padding: "8px 16px",
    background: dark ? "#374151" : "#e5e7eb",
    color: dark ? "#e5e7eb" : "#1f2937",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
    userSelect: "none",
  };
}

function inputStyle(dark: boolean): React.CSSProperties {
  return {
    width: "100%",
    padding: "8px 10px",
    background: dark ? "#111827" : "white",
    color: dark ? "#e5e7eb" : "#1f2937",
    border: `1px solid ${dark ? "#4b5563" : "#d1d5db"}`,
    borderRadius: 6,
    fontSize: 14,
    boxSizing: "border-box",
  };
}
