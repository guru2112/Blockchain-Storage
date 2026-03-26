"use client";

import { useState, useEffect } from "react";
import { setUserName } from "@/lib/blockchain";

interface SetNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName?: string;
  onSuccess?: () => void;
}

export default function SetNameModal({ isOpen, onClose, currentName = "", onSuccess }: SetNameModalProps) {
  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setName(currentName);
    setError("");
    setSuccess(false);
  }, [isOpen, currentName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!name || name.trim() === "") {
      setError("Name cannot be empty");
      return;
    }

    if (name.length > 50) {
      setError("Name must be 50 characters or less");
      return;
    }

    setLoading(true);
    try {
      await setUserName(name.trim());
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to set username";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Set Your Display Name
        </h2>

        {success ? (
          <div className="rounded-lg bg-green-50 p-4 text-center">
            <p className="text-sm font-medium text-green-700">
              ✓ Name saved successfully!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                Display Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                maxLength={50}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-slate-500">
                {name.length}/50 characters
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-linear-to-r from-blue-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-blue-200 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Name"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
