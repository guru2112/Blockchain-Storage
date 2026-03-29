"use client";
import { useState } from "react";

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (newName: string) => Promise<void>;
  currentName: string;
  type: "file" | "folder";
}

export default function RenameModal({ isOpen, onClose, onRename, currentName, type }: RenameModalProps) {
  const [newName, setNewName] = useState(currentName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRename = async () => {
    if (!newName.trim()) {
      setError("Name cannot be empty.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onRename(newName);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to rename ${type}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Rename {type === "file" ? "File" : "Folder"}</h3>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-full mb-3 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-black dark:border-zinc-700 dark:text-white"
        />
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} disabled={loading} className="flex-1 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-zinc-800 dark:text-zinc-300">
            Cancel
          </button>
          <button onClick={handleRename} disabled={loading || !newName} className="flex-1 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}