"use client";
import { useState, useEffect } from "react";
import { getConnections, ConnectionDetails } from "@/lib/blockchain";

interface ShareFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (recipient: string) => Promise<void>;
}

export default function ShareFileModal({ isOpen, onClose, onShare }: ShareFileModalProps) {
  const [shareMethod, setShareMethod] = useState<"friend" | "wallet">("friend");
  const [connections, setConnections] = useState<ConnectionDetails[]>([]);
  const [selectedFriend, setSelectedFriend] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadConnections();
    } else {
      setShareMethod("friend");
      setSelectedFriend("");
      setManualAddress("");
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  const loadConnections = async () => {
    try {
      const conns = await getConnections();
      setConnections(conns);
      if (conns.length > 0) {
        setSelectedFriend(conns[0].address);
      } else {
        setShareMethod("wallet");
      }
    } catch (err) {
      console.error("Failed to load connections:", err);
    }
  };

  const handleShare = async () => {
    const targetAddress = shareMethod === "friend" ? selectedFriend : manualAddress.trim();
    
    if (!targetAddress) {
      setError(shareMethod === "friend" ? "Please select a friend." : "Please enter a wallet address.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await onShare(targetAddress);
      setSuccess(true);
      if (shareMethod === "wallet") setManualAddress("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to share file.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg dark:bg-zinc-900 dark:border dark:border-zinc-800">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Share File</h3>
        
        <div className="flex bg-slate-100 p-1 rounded-lg mb-4 dark:bg-zinc-800">
          <button
            onClick={() => {
              setShareMethod("friend");
              setError(null);
              setSuccess(false);
            }}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
              shareMethod === "friend" 
                ? "bg-white text-blue-600 shadow-sm dark:bg-zinc-700 dark:text-blue-400" 
                : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            Friend
          </button>
          <button
            onClick={() => {
              setShareMethod("wallet");
              setError(null);
              setSuccess(false);
            }}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
              shareMethod === "wallet" 
                ? "bg-white text-blue-600 shadow-sm dark:bg-zinc-700 dark:text-blue-400" 
                : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            Wallet
          </button>
        </div>

        {shareMethod === "friend" && (
          <div className="mb-3">
            {connections.length > 0 ? (
              <select
                value={selectedFriend}
                onChange={(e) => setSelectedFriend(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-black dark:border-zinc-700 dark:text-white"
              >
                {connections.map((conn) => (
                  <option key={conn.address} value={conn.address}>
                    {conn.username !== conn.address ? `${conn.username} (${conn.address.substring(0, 6)}...)` : `${conn.address.substring(0, 8)}...${conn.address.substring(conn.address.length - 6)}`}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded border border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-500 dark:border-yellow-900/50">
                No connections found. Add friends on the dashboard.
              </p>
            )}
          </div>
        )}

        {shareMethod === "wallet" && (
          <input
            type="text"
            placeholder="Recipient wallet address"
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            className="w-full mb-3 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-black dark:border-zinc-700 dark:text-white"
          />
        )}

        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-2">File shared successfully!</p>}

        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            className="flex-1 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || (shareMethod === "friend" && !selectedFriend) || (shareMethod === "wallet" && !manualAddress)}
          >
            {loading ? "Sharing..." : "Share"}
          </button>
        </div>
      </div>
    </div>
  );
}