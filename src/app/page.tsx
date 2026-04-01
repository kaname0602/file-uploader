"use client";

import { useState, useEffect, useCallback } from "react";
import "./globals.css";

interface FileInfo {
  name: string;
  size: number;
  uploadedAt: string;
  url: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function Home() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customName, setCustomName] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchFiles = useCallback(async () => {
    const res = await fetch("/api/files");
    const data = await res.json();
    setFiles(data);
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setMessage({ text: "ファイルを選択してください", type: "error" });
      return;
    }

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("filename", customName);

    try {
      const res = await fetch("/api/files", { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok) {
        setMessage({ text: data.message, type: "success" });
        setSelectedFile(null);
        setCustomName("");
        const fileInput = document.getElementById("file-input") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        fetchFiles();
      } else {
        setMessage({ text: data.error || "アップロードに失敗しました", type: "error" });
      }
    } catch {
      setMessage({ text: "アップロードに失敗しました", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileName: string) => {
    if (!confirm(`「${fileName}」を削除しますか？`)) return;

    try {
      const res = await fetch(`/api/files/${encodeURIComponent(fileName)}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok) {
        setMessage({ text: data.message, type: "success" });
        fetchFiles();
      } else {
        setMessage({ text: data.error, type: "error" });
      }
    } catch {
      setMessage({ text: "削除に失敗しました", type: "error" });
    }
  };

  return (
    <div className="container">
      <h1>File Uploader</h1>

      {message && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      <div className="upload-section">
        <h2>ファイルをアップロード</h2>
        <form onSubmit={handleUpload}>
          <div className="form-group">
            <label htmlFor="custom-name">ファイル名（任意）</label>
            <input
              id="custom-name"
              type="text"
              placeholder="カスタムファイル名を入力（空欄なら元のファイル名）"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="file-input">ファイルを選択</label>
            <input
              id="file-input"
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
          </div>
          <button type="submit" className="upload-btn" disabled={uploading}>
            {uploading ? "アップロード中..." : "アップロード"}
          </button>
        </form>
      </div>

      <div className="file-list-section">
        <h2>アップロード済みファイル</h2>
        {files.length === 0 ? (
          <p className="empty-message">ファイルはまだありません</p>
        ) : (
          <ul className="file-list">
            {files.map((file) => (
              <li key={file.name} className="file-item">
                <div className="file-info">
                  <div className="file-name">{file.name}</div>
                  <div className="file-size">{formatSize(file.size)}</div>
                </div>
                <a
                  href={file.url}
                  download={file.name}
                  className="download-btn"
                >
                  DL
                </a>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(file.name)}
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
