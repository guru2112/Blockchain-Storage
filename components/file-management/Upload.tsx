// components/file-management/Upload.tsx
"use client";

import { useState } from "react";
import { uploadToBlockchain } from "@/lib/blockchain";
import { encryptFile } from "@/lib/utils/crypto";

type UploadProps = {
  onUploadSuccess?: () => void;
  folderId?: number;
};

export default function Upload({ onUploadSuccess, folderId = 0 }: UploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const encrypted = await encryptFile(file);
      const blob = new Blob([encrypted], { type: "text/plain" });

      const formData = new FormData();
      formData.append("file", blob, `${file.name}.enc`);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.cid) {
        throw new Error(data.error ?? "Upload failed");
      }

      await uploadToBlockchain(data.cid, file.name, folderId, file.size);

      setFile(null);
      
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Upload failed. Try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative rounded-xl border-2 border-dashed p-8 transition ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-slate-200 bg-slate-50"
        }`}
      >
        <input
          type="file"
          id="file-upload"
          onChange={(e) => {
            setFile(e.target.files?.[0] || null);
            setError(null);
          }}
          className="hidden"
        />
        <label
          htmlFor="file-upload"
          className="flex cursor-pointer flex-col items-center justify-center gap-2"
        >
          <svg
            className="h-10 w-10 text-slate-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3v-7"
            />
          </svg>
          <div className="text-center mt-2">
            <p className="text-sm font-semibold text-slate-800">
              Click To Upload File
            </p>
          </div>
        </label>
      </div>

      {file && (
        <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-900 text-center">
                File Name: <span className="font-normal">{file.name}</span>
              </p>
              <p className="text-xs text-slate-500 text-center">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 text-center">
          {error}
        </p>
      )}

      <button
        onClick={handleUpload}
        disabled={loading || !file}
        className="w-full rounded-lg bg-gradient-to-r from-red-500 to-purple-600 px-6 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 shadow-md"
      >
        {loading ? "Uploading..." : "Upload File"}
      </button>
    </div>
  );
}