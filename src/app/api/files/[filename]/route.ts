import { NextRequest, NextResponse } from "next/server";
import { del, list } from "@vercel/blob";

// DELETE: ファイルを削除
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const decodedName = decodeURIComponent(filename);

  // Blob一覧から該当ファイルを検索してURLを取得
  const { blobs } = await list();
  const target = blobs.find((blob) => blob.pathname === decodedName);

  if (!target) {
    return NextResponse.json({ error: "ファイルが見つかりません" }, { status: 404 });
  }

  await del(target.url);

  return NextResponse.json({ message: `「${decodedName}」を削除しました` });
}
