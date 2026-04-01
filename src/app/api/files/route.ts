import { NextResponse } from "next/server";
import { list } from "@vercel/blob";

// GET: ファイル一覧を取得
export async function GET() {
  const { blobs } = await list();

  const files = blobs.map((blob) => ({
    name: blob.pathname,
    size: blob.size,
    uploadedAt: blob.uploadedAt.toISOString(),
    url: blob.url,
  }));

  // 新しい順にソート
  files.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

  return NextResponse.json(files);
}
