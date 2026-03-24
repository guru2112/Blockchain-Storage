"use client";

import { useCallback, useEffect, useState } from "react";
import { deleteFromBlockchain, getFiles, StoredFile } from "@/lib/blockchain";
import { decryptFile } from "@/lib/crypto";

type FileListProps = {
  refreshKey?: string | number;
};

const IPFS_GATEWAY = "https://ipfs.io/ipfs";

export default function FileList({ refreshKey }: FileListProps) {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionIndex, setActionIndex] = useState<number | null>(null);
  const [preview, setPreview] = useState<{
    url: string;
    name: string;
  } | null>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getFiles();
      setFiles(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load files.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [getFiles]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles, refreshKey]);

  const fetchDecrypted = async (cid: string) => {
    const res = await fetch(`${IPFS_GATEWAY}/${cid}`);
    if (!res.ok) {
      throw new Error("Failed to fetch file from IPFS.");
    }

    const encrypted = await res.text();
    return decryptFile(encrypted);
  };

  const handlePreview = async (file: StoredFile, index: number) => {
    setActionIndex(index);
    setError(null);

    try {
      const url = await fetchDecrypted(file.cid);
      setPreview({ url, name: file.filename });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to preview file.";
      setError(message);
    } finally {
      setActionIndex(null);
    }
  };

  const handleDownload = async (file: StoredFile, index: number) => {
    setActionIndex(index);
    setError(null);

    try {
      const url = await fetchDecrypted(file.cid);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to download file.";
      setError(message);
    } finally {
      setActionIndex(null);
    }
  };

  const handleDelete = async (index: number) => {
    setActionIndex(index);
    setError(null);

    try {
      await deleteFromBlockchain(index);
      await fetchFiles();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to delete file.";
      setError(message);
    } finally {
      setActionIndex(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">Loading your files...</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Your files</h3>
          <p className="text-sm text-slate-600">
            Only files owned by your wallet are shown here.
          </p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
          {files.length} files
        </span>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {files.length === 0 ? (
        <p className="mt-6 text-sm text-slate-600">
          No files yet. Upload your first encrypted file to get started.
        </p>
      ) : (
        <div className="mt-6 grid gap-4">
          {files.map((file, index) => {
            const isBusy = actionIndex === index;
            const time = new Date(file.timestamp * 1000).toLocaleString();

            return (
              <div
                key={`${file.cid}-${index}`}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {file.filename}
                    </p>
                    <p className="text-xs text-slate-500">Uploaded {time}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handlePreview(file, index)}
                      disabled={isBusy}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => handleDownload(file, index)}
                      disabled={isBusy}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      disabled={isBusy}
                      className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-4xl rounded-2xl bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Preview</p>
                <p className="text-xs text-slate-500">{preview.name}</p>
              </div>
              <button
                onClick={() => setPreview(null)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700"
              >
                Close
              </button>
            </div>
            <div className="mt-4 h-[70vh] w-full overflow-hidden rounded-xl border border-slate-200">
              <iframe
                title="File preview"
                src={preview.url}
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
