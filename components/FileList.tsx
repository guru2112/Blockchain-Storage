"use client";

import { useEffect, useState } from "react";
import { getFiles } from "@/lib/blockchain";

type FileType = {
  cid: string;
  filename: string;
  timestamp: bigint;
};

export default function FileList() {
  const [files, setFiles] = useState<FileType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const data = await getFiles();

        console.log("📂 Files from blockchain:", data);

        // ✅ FIX: Type assertion
        const formattedFiles: FileType[] = Array.from(data as FileType[]);

        setFiles(formattedFiles);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
      setLoading(false);
    };

    fetchFiles();
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/90 p-6 shadow-xl backdrop-blur">
      <div className="pointer-events-none absolute -left-20 top-6 h-48 w-48 rounded-full bg-indigo-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-56 w-56 rounded-full bg-blue-200/50 blur-3xl" />

      <div className="relative space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              Files
            </p>
            <h2 className="text-xl font-bold text-slate-900">Your uploads</h2>
            <p className="text-sm text-slate-600">
              Review what&apos;s anchored on-chain and open files directly from IPFS.
            </p>
          </div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 shadow-sm">
            {files.length} stored
          </span>
        </div>

        {loading ? (
          <div className="grid gap-3 md:grid-cols-2">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-28 rounded-xl border border-slate-200/80 bg-white/70 p-4 shadow-sm"
              >
                <div className="flex h-full flex-col justify-between animate-pulse space-y-2">
                  <div className="h-3 w-1/2 rounded-full bg-slate-200" />
                  <div className="h-3 w-3/4 rounded-full bg-slate-200" />
                  <div className="h-3 w-1/3 rounded-full bg-slate-200" />
                  <div className="h-8 w-full rounded-lg bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : files.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white/80 p-6 text-center shadow-sm">
            <p className="text-sm font-semibold text-slate-800">
              No files uploaded yet
            </p>
            <p className="text-sm text-slate-500">
              Upload a file to see it logged on-chain and retrievable from IPFS.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* ✅ SAFE reverse */}
            {[...files].reverse().map((file, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
              >
                <div className="absolute right-3 top-3 h-8 w-8 rounded-full bg-blue-50" />

                <div className="relative space-y-2">
                  <p className="text-sm font-semibold text-slate-900">
                    {file.filename}
                  </p>

                  <p className="text-xs text-slate-500 break-all">
                    {file.cid}
                  </p>

                  <p className="text-xs text-slate-400">
                    {new Date(Number(file.timestamp) * 1000).toLocaleString()}
                  </p>

                  <a
                    href={`https://ipfs.io/ipfs/${file.cid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 transition hover:gap-2"
                  >
                    View on IPFS
                    <span aria-hidden>↗</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
