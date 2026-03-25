"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteFromBlockchain,
  getFiles,
  getFolders,
  deleteFolder,
  StoredFile,
  StoredFolder,
  sharePendingFileWith,
} from "@/lib/blockchain";
import { decryptSharedFile } from "@/lib/utils/crypto";
import ShareFileModal from "../modals/ShareFileModal";
import Upload from "./Upload";

type FileListProps = {
  refreshKey?: string | number;
  onFolderChange?: (folderId: number) => void;
};

const IPFS_GATEWAY = "https://ipfs.io/ipfs";

export default function FileList({ refreshKey, onFolderChange }: FileListProps) {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [folders, setFolders] = useState<StoredFolder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionIndex, setActionIndex] = useState<number | null>(null);
  const [preview, setPreview] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareFileIndex, setShareFileIndex] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [fileData, folderData] = await Promise.all([
        getFiles(),
        getFolders(),
      ]);
      setFiles(fileData);
      setFolders(folderData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load files.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  useEffect(() => {
    onFolderChange?.(currentFolderId);
  }, [currentFolderId, onFolderChange]);

  const fetchDecrypted = async (cid: string) => {
    const res = await fetch(`${IPFS_GATEWAY}/${cid}`);
    if (!res.ok) {
      throw new Error("Failed to fetch file from IPFS.");
    }

    const encrypted = await res.text();
    return decryptSharedFile(encrypted);
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
      await fetchData();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to delete file.";
      setError(message);
    } finally {
      setActionIndex(null);
    }
  };

  const handleDeleteFolder = async (folderId: number) => {
    setError(null);

    try {
      await deleteFolder(folderId);
      await fetchData();
      if (currentFolderId === folderId) {
        setCurrentFolderId(0);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to delete folder.";
      setError(message);
    }
  };

  const currentFolderName = folders.find((f) => f.id === currentFolderId)?.name || "Root";
  const filesInCurrentFolder = files.filter((f) => f.folderId === currentFolderId);
  const foldersInCurrentFolder = folders.filter((f) => f.parentId === currentFolderId && f.exists);

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">Loading your files...</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900">
            {currentFolderId === 0 ? "Your files" : currentFolderName}
          </h3>
          <p className="text-sm text-slate-600">
            {currentFolderId !== 0 && (
              <button
                onClick={() => setCurrentFolderId(0)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Root
              </button>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
            {filesInCurrentFolder.length} files, {foldersInCurrentFolder.length} folders
          </span>
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-semibold transition"
            onClick={() => setShowUpload((prev) => !prev)}
          >
            {showUpload ? "✕ Cancel" : "↑ Upload File"}
          </button>
        </div>
      </div>

      {showUpload && (
        <div className="mb-6 border-t pt-6">
          <Upload folderId={currentFolderId} onUploadSuccess={fetchData} />
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Folders Section */}
      {foldersInCurrentFolder.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Folders</h4>
          <div className="grid gap-3">
            {foldersInCurrentFolder.map((folder) => (
              <div
                key={`${folder.id}-${folder.name}`}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 flex items-center justify-between"
              >
                <button
                  onClick={() => {
                    setCurrentFolderId(folder.id);
                    setShowUpload(false);
                  }}
                  className="flex items-center gap-3 flex-1 text-left hover:text-blue-600"
                >
                  <span className="text-xl">📁</span>
                  <span className="font-medium text-slate-900">{folder.name}</span>
                </button>
                <button
                  onClick={() => handleDeleteFolder(folder.id)}
                  className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files Section */}
      {filesInCurrentFolder.length === 0 && foldersInCurrentFolder.length === 0 ? (
        <p className="mt-6 text-sm text-slate-600">
          {currentFolderId === 0
            ? "No files yet. Upload your first encrypted file to get started."
            : "This folder is empty."}
        </p>
      ) : (
        filesInCurrentFolder.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Files</h4>
            <div className="grid gap-4">
              {filesInCurrentFolder.map((file) => {
                const globalFileIndex = files.indexOf(file);
                const isBusy = actionIndex === globalFileIndex;
                const time = new Date(file.timestamp * 1000).toLocaleString();

                return (
                  <div
                    key={file.cid}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-slate-900">
                          {file.filename}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Uploaded {time}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handlePreview(file, globalFileIndex)}
                          disabled={isBusy}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isBusy ? "..." : "Preview"}
                        </button>
                        <button
                          onClick={() => handleDownload(file, globalFileIndex)}
                          disabled={isBusy}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-green-200 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isBusy ? "..." : "Download"}
                        </button>
                        <button
                          onClick={() => handleDelete(globalFileIndex)}
                          disabled={isBusy}
                          className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isBusy ? "..." : "Delete"}
                        </button>
                        <button
                          onClick={() => {
                            setShareFileIndex(globalFileIndex);
                            setShareModalOpen(true);
                          }}
                          disabled={isBusy}
                          className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-600 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )
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
      <ShareFileModal
        isOpen={shareModalOpen}
        onClose={() => {
          setShareModalOpen(false);
          setShareFileIndex(null);
        }}
        onShare={async (recipientAddress: string) => {
          if (shareFileIndex === null) return;
          setError(null);
          try {
            const file = files[shareFileIndex];
            if (!file) throw new Error("File not found.");
            await sharePendingFileWith(recipientAddress, shareFileIndex);
            setShareModalOpen(false);
            setShareFileIndex(null);
          } catch (err) {
            const message = err instanceof Error ? err.message : "Unable to share file.";
            setError(message);
          }
        }}
      />
    </div>
  );
}
