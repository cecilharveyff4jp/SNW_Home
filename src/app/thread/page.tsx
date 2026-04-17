"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ThreadBoard from "../components/ThreadBoard";

function ThreadPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const threadId = searchParams.get("id");

  const [toastMessage, setToastMessage] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("snw_dark_mode");
      if (saved === "true") setIsDarkMode(true);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(""), 3000);
    return () => clearTimeout(t);
  }, [toastMessage]);

  const handleBackToMap = () => {
    router.push("/");
  };

  if (!threadId) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          flexDirection: "column",
          gap: 16,
          background: isDarkMode ? "#111827" : "#ffffff",
          color: isDarkMode ? "#e5e7eb" : "#1f2937",
        }}
      >
        <div>スレッドIDが指定されていません</div>
        <button
          onClick={handleBackToMap}
          style={{
            padding: "10px 20px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          🏠 マップに戻る
        </button>
      </div>
    );
  }

  return (
    <>
      <ThreadBoard
        isEditMode={false}
        isDarkMode={isDarkMode}
        initialThreadId={threadId}
        standalone
        onClose={handleBackToMap}
        onBackToMap={handleBackToMap}
        onToast={(msg) => setToastMessage(msg)}
      />
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.85)",
            color: "white",
            padding: "10px 18px",
            borderRadius: 8,
            zIndex: 400,
            fontSize: 14,
          }}
        >
          {toastMessage}
        </div>
      )}
    </>
  );
}

export default function ThreadPage() {
  return (
    <Suspense fallback={<div style={{ padding: 20 }}>読み込み中...</div>}>
      <ThreadPageInner />
    </Suspense>
  );
}
