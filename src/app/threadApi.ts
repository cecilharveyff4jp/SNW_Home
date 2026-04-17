// 掲示板機能 GAS API ラッパー

export type ThreadImage = {
  fileId: string;
  url: string;
};

export type ThreadPost = {
  id: string;
  createdBy: string;
  createdAt: number;
  comment: string;
  imageUrls: ThreadImage[];
};

export type ThreadDetail = {
  id: string;
  title: string;
  createdBy: string;
  createdAt: number;
  posts: ThreadPost[];
  likes: number;
};

export type ThreadIndexEntry = {
  id: string;
  title: string;
  createdBy: string;
  createdAt: number;
  lastPostAt: number;
  postCount: number;
  likes: number;
  thumbnailUrl: string;
  isDeleted: boolean;
  folderId: string;
};

type GasResponse<T> = { ok: true } & T | { ok: false; error: string };

const PASSWORD = "snow1234";

function gasBase(): string {
  const base = process.env.NEXT_PUBLIC_GAS_URL;
  if (!base) throw new Error("NEXT_PUBLIC_GAS_URL 未設定");
  return base;
}

async function gasGet<T>(action: string, params: Record<string, string> = {}): Promise<GasResponse<T>> {
  const qs = new URLSearchParams({ action, ...params }).toString();
  const res = await fetch(`${gasBase()}?${qs}`, { method: "GET" });
  return res.json();
}

async function gasPost<T>(action: string, body: Record<string, unknown>): Promise<GasResponse<T>> {
  const res = await fetch(`${gasBase()}?action=${action}`, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function fetchThreads(): Promise<ThreadIndexEntry[]> {
  const json = await gasGet<{ threads: ThreadIndexEntry[] }>("getThreads");
  if (!json.ok) throw new Error(json.error);
  return json.threads;
}

export async function fetchThread(threadId: string): Promise<ThreadDetail> {
  const json = await gasGet<{ thread: ThreadDetail }>("getThread", { threadId });
  if (!json.ok) throw new Error(json.error);
  return json.thread;
}

export async function createThread(title: string, createdBy: string): Promise<string> {
  const json = await gasPost<{ threadId: string }>("createThread", {
    password: PASSWORD,
    title,
    createdBy,
  });
  if (!json.ok) throw new Error(json.error);
  return json.threadId;
}

export async function addPost(
  threadId: string,
  comment: string,
  images: { data: string; mime: string }[],
  createdBy: string
): Promise<{ postId: string; imageUrls: ThreadImage[] }> {
  const json = await gasPost<{ postId: string; imageUrls: ThreadImage[] }>("addPost", {
    password: PASSWORD,
    threadId,
    comment,
    images,
    createdBy,
  });
  if (!json.ok) throw new Error(json.error);
  return { postId: json.postId, imageUrls: json.imageUrls };
}

export async function deleteThread(threadId: string): Promise<void> {
  const json = await gasPost<Record<string, never>>("deleteThread", {
    password: PASSWORD,
    threadId,
  });
  if (!json.ok) throw new Error(json.error);
}

export async function likeThread(threadId: string): Promise<number> {
  const json = await gasPost<{ likes: number }>("likeThread", { threadId });
  if (!json.ok) throw new Error(json.error);
  return json.likes;
}
