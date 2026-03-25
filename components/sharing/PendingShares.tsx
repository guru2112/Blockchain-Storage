"use client";

import { useCallback, useEffect, useState } from "react";
import { getPendingShares, acceptPendingShare, rejectPendingShare, PendingShare } from "@/lib/blockchain";

interface PendingSharesProps {
  refreshKey?: string | number;
}

export default function PendingShares({ refreshKey }: PendingSharesProps) {
  const [pendingShares, setPendingShares] = useState<PendingShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionIndex, setActionIndex] = useState<number | null>(null);

  const fetchPendingShares = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const shares = await getPendingShares();
      setPendingShares(shares);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load pending shares.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingShares();
  }, [fetchPendingShares, refreshKey]);

  const handleAccept = async (share: PendingShare, index: number) => {
    setActionIndex(index);
    setError(null);

    try {
      await acceptPendingShare(share.sender, index);
      
      // Save sender to localStorage so SharedFilesReceived can fetch from them
      const savedSenders = localStorage.getItem("sharedWithSenders");
      const sendersList = savedSenders ? JSON.parse(savedSenders) : [];
      if (!sendersList.includes(share.sender)) {
        sendersList.push(share.sender);
        localStorage.setItem("sharedWithSenders", JSON.stringify(sendersList));
      }
      
      await fetchPendingShares();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to accept share.";
      setError(message);
    } finally {
      setActionIndex(null);
    }
  };

  const handleReject = async (index: number) => {
    setActionIndex(index);
    setError(null);

    try {
      await rejectPendingShare(index);
      await fetchPendingShares();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to reject share.";
      setError(message);
    } finally {
      setActionIndex(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">Loading pending shares...</p>
      </div>
    );
  }

  if (pendingShares.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">No pending shares. You&apos;ll receive notifications when files are shared with you.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        📬 Pending Shares ({pendingShares.length})
      </h3>

      {error && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="space-y-3">
        {pendingShares.map((share, index) => (
          <div
            key={`${share.sender}-${index}`}
            className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex items-center justify-between"
          >
            <div className="flex-1">
              <p className="font-medium text-slate-900">
                📁 {share.senderFile?.filename || "Unknown file"}
              </p>
              <p className="text-xs text-slate-600">
                Shared by: <span className="font-mono">{share.sender.slice(0, 6)}...{share.sender.slice(-4)}</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {new Date(share.timestamp * 1000).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => handleAccept(share, index)}
                disabled={actionIndex === index}
                className="px-3 py-1 rounded-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition disabled:bg-slate-400"
              >
                {actionIndex === index ? "..." : "✓ Accept"}
              </button>
              <button
                onClick={() => handleReject(index)}
                disabled={actionIndex === index}
                className="px-3 py-1 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition disabled:bg-slate-400"
              >
                {actionIndex === index ? "..." : "✕ Reject"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
