"use client";

import { useCallback, useEffect, useState } from "react";
import { getSharedFiles, StoredFile } from "@/lib/blockchain";
import { decryptSharedFile } from "@/lib/crypto";

interface SharedFileWithSender extends StoredFile {
  sender: string;
}

interface SharedFilesReceivedProps {
  refreshKey?: string | number;
}

const IPFS_GATEWAY = "https://ipfs.io/ipfs";

export default function SharedFilesReceived({ refreshKey }: SharedFilesReceivedProps) {
  const [sharedFiles, setSharedFiles] = useState<SharedFileWithSender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ url: string; name: string } | null>(null);
  const [actionIndex, setActionIndex] = useState<number | null>(null);

  // Note: senders list managed by shared files data from blockchain

  const fetchSharedFiles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get from localStorage if available, otherwise use empty array
      const savedSenders = localStorage.getItem("sharedWithSenders");
      const senderList = savedSenders ? JSON.parse(savedSenders) : [];
      
      if (senderList.length === 0) {
        setSharedFiles([]);
        return;
      }

      setSenders(senderList);

      const allSharedFiles: SharedFileWithSender[] = [];

      // Fetch shared files from each sender
      for (const sender of senderList) {
        try {
          const files = await getSharedFiles(sender);
          files.forEach((file) => {
            allSharedFiles.push({
              ...file,
              sender,
            });
          });
        } catch (err) {
          console.warn(`Failed to fetch shared files from ${sender}:`, err);
        }
      }

      setSharedFiles(allSharedFiles);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load shared files.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSharedFiles();
  }, [fetchSharedFiles, refreshKey]);

  const fetchDecrypted = async (cid: string) => {
    try {
      const res = await fetch(`${IPFS_GATEWAY}/${cid}`);
      if (!res.ok) {
        throw new Error(`IPFS fetch failed: ${res.status} ${res.statusText}`);
      }

      const encrypted = await res.text();
      if (!encrypted) {
        throw new Error("File is empty on IPFS");
      }

      return decryptSharedFile(encrypted);
    } catch (err) {
      console.error("Decryption error details:", err);
      throw err;
    }
  };

  const handlePreview = async (file: SharedFileWithSender, index: number) => {
    setActionIndex(index);
    setError(null);

    try {
      console.log(`Previewing file - CID: ${file.cid}, Filename: ${file.filename}`);
      const url = await fetchDecrypted(file.cid);
      setPreview({ url, name: file.filename });
    } catch (err) {
      console.error("Preview error:", err);
      const message = err instanceof Error ? err.message : "Unable to preview file. Make sure the file was shared correctly.";
      setError(message);
    } finally {
      setActionIndex(null);
    }
  };

  const handleDownload = async (file: SharedFileWithSender, index: number) => {
    setActionIndex(index);
    setError(null);

    try {
      console.log(`Downloading file - CID: ${file.cid}, Filename: ${file.filename}`);
      const url = await fetchDecrypted(file.cid);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download error:", err);
      const message = err instanceof Error ? err.message : "Unable to download file. Make sure the file was shared correctly.";
      setError(message);
    } finally {
      setActionIndex(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">Loading shared files...</p>
      </div>
    );
  }

  if (sharedFiles.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          No files shared with you yet. When someone shares a file and you accept it, it will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        📤 Files Shared With Me ({sharedFiles.length})
      </h3>

      {error && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {preview && (
        <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium text-slate-900">Preview: {preview.name}</p>
            <button
              onClick={() => setPreview(null)}
              className="text-slate-500 hover:text-slate-700"
            >
              ✕
            </button>
          </div>
          <iframe
            src={preview.url}
            className="w-full h-96 border border-slate-200 rounded"
            title="File Preview"
          />
        </div>
      )}

      <div className="space-y-3">
        {sharedFiles.map((file, index) => (
          <div
            key={`${file.sender}-${file.cid}-${index}`}
            className="rounded-xl border border-slate-200 bg-slate-50/70 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-slate-900">📄 {file.filename}</p>
                <p className="text-xs text-slate-600">
                  Shared by: <span className="font-mono">{file.sender.slice(0, 6)}...{file.sender.slice(-4)}</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(file.timestamp * 1000).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handlePreview(file, index)}
                  disabled={actionIndex === index}
                  className="px-3 py-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition disabled:bg-slate-400"
                >
                  {actionIndex === index ? "..." : "👁️ Preview"}
                </button>
                <button
                  onClick={() => handleDownload(file, index)}
                  disabled={actionIndex === index}
                  className="px-3 py-1 rounded-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition disabled:bg-slate-400"
                >
                  {actionIndex === index ? "..." : "⬇️ Download"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
