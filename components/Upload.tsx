"use client";

import { useState } from "react";
import { uploadToBlockchain } from "@/lib/blockchain";
import { useRouter } from "next/navigation";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // 📤 Upload to Pinata
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      console.log("API response:", data);

      // ❗ Stop if failed
      if (!data || !data.cid) {
        alert("❌ Pinata upload failed");
        setLoading(false);
        return;
      }

      const cid = data.cid;

      console.log("📦 CID:", cid);

      // 🔗 Store on blockchain
      await uploadToBlockchain(cid, file.name);

      alert("✅ File uploaded successfully!");

      setFile(null);

      // 🔥 VERY IMPORTANT → refresh UI
      router.refresh();
    } catch (error) {
      console.error("Upload error:", error);
      alert("❌ Upload failed");
    }

    setLoading(false);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/90 p-6 shadow-xl backdrop-blur">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-blue-200/50 blur-3xl" />

      <div className="relative space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
              Upload
            </p>
            <h2 className="text-xl font-bold text-slate-900">
              Anchor a new file
            </h2>
            <p className="text-sm text-slate-600">
              Send your file to IPFS via Pinata, then write the CID on-chain for
              immutability.
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Secure by design
          </span>
        </div>

        <div className="space-y-3 rounded-2xl border border-dashed border-slate-200 bg-white/70 p-4 shadow-sm">
          <label className="text-sm font-semibold text-slate-800">
            Select a file
          </label>
          <input
            type="file"
            className="block w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm transition file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:border-blue-200"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <p className="text-xs text-slate-500">
            {file ? `Selected: ${file.name}` : "Supports any file type. Maximize decentralization, minimize hassle."}
          </p>
        </div>

        <button
          onClick={handleUpload}
          disabled={loading}
          className="pill inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Uploading..." : "Upload & record"}
          <span aria-hidden className="text-lg">
            ⬆
          </span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          Uploads sync to IPFS first, then are committed to the blockchain for
          provenance.
        </div>
      </div>
    </div>
  );
}
