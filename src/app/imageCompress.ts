// 画像をWebPに圧縮してbase64を返す（ブラウザのCanvas API）

export type CompressedImage = {
  data: string;  // base64 (no prefix)
  mime: string;  // "image/webp"
  size: number;  // bytes after compression
};

const MAX_LONG_EDGE = 1600;
const QUALITY = 0.82;

export async function compressImageToWebP(file: File): Promise<CompressedImage> {
  const bitmap = await loadBitmap(file);
  const { width, height } = fitWithinLongEdge(bitmap.width, bitmap.height, MAX_LONG_EDGE);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      "image/webp",
      QUALITY
    );
  });

  const base64 = await blobToBase64(blob);
  return { data: base64, mime: "image/webp", size: blob.size };
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      // fall through to <img> fallback
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("image load failed"));
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function fitWithinLongEdge(w: number, h: number, maxEdge: number) {
  const long = Math.max(w, h);
  if (long <= maxEdge) return { width: w, height: h };
  const scale = maxEdge / long;
  return { width: Math.round(w * scale), height: Math.round(h * scale) };
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.substring(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("FileReader error"));
    reader.readAsDataURL(blob);
  });
}
