"use client";

import { useState } from "react";
import { uploadToBlockchain } from "@/lib/blockchain";
import { encryptFile } from "@/lib/crypto";

type UploadProps = {
  onUploadSuccess?: () => void;
};

export default function Upload({ onUploadSuccess }: UploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      await uploadToBlockchain(data.cid, file.name);

      setFile(null);
      onUploadSuccess?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Upload failed. Try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Upload a file</h3>
          <p className="text-sm text-slate-600">
            Files are encrypted locally before being pinned to IPFS.
          </p>
        </div>

        <input
          type="file"
          onChange={(e) => {
            setFile(e.target.files?.[0] || null);
            setError(null);
          }}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
        />

        {file && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            Selected: {file.name}
          </div>
        )}

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}
