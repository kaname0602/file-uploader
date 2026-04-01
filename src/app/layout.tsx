export const metadata = {
  title: "File Uploader",
  description: "ファイルアップロード＆ダウンロードシステム",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
