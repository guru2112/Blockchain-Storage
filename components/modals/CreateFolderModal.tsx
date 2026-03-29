"use client";

import { useState } from "react";
import { createFolder } from "@/lib/blockchain";

type CreateFolderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  parentId?: number;
};

export default function CreateFolderModal({
  isOpen,
  onClose,
  onSuccess,
  parentId = 0,
}: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!folderName.trim()) {
      setError("Folder name cannot be empty");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createFolder(folderName, parentId);
      setFolderName("");
      onSuccess?.();
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create folder";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
        >
          ✕
        </button>
        
        <h2 className="mb-6 text-xl font-bold text-slate-900 text-center">
          Create New Folder
        </h2>

        <input
          type="text"
          value={folderName}
          onChange={(e) => {
            setFolderName(e.target.value);
            setError(null);
          }}
          placeholder="Enter folder name"
          className="mb-4 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />

        {error && (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? "Creating..." : "Create Folder"}
          </button>
        </div>
      </div>
    </div>
  );
}