import { NextRequest, NextResponse } from "next/server";
import { put, list } from "@vercel/blob";

// ボディサイズ制限を引き上げ（最大50MB）
export const runtime = "nodejs";
export const maxDuration = 60;

// GET: ファイル一覧を取得
export async function GET() {
  const { blobs } = await list();

  const files = blobs.map((blob) => ({
    name: blob.pathname,
    size: blob.size,
    uploadedAt: blob.uploadedAt.toISOString(),
    url: blob.url,
  }));

  files.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

  return NextResponse.json(files);
}

// POST: ファイルをアップロード
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const customName = formData.get("filename") as string | null;

  if (!file) {
    return NextResponse.json({ error: "ファイルが選択されていません" }, { status: 400 });
  }

  // ファイル名を決定
  const originalExt = file.name.includes(".") ? "." + file.name.split(".").pop() : "";
  let fileName: string;
  if (customName && customName.trim()) {
    const hasExt = customName.trim().includes(".");
    fileName = hasExt ? customName.trim() : customName.trim() + originalExt;
  } else {
    fileName = file.name;
  }

  const blob = await put(fileName, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return NextResponse.json({
    message: `「${fileName}」をアップロードしました`,
    fileName: blob.pathname,
    url: blob.url,
  });
}
