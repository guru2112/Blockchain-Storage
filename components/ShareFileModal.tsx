"use client";
import { useState } from "react";

interface ShareFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (recipient: string) => Promise<void>;
}

export default function ShareFileModal({ isOpen, onClose, onShare }: ShareFileModalProps) {
  const [recipient, setRecipient] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await onShare(recipient);
      setSuccess(true);
      setRecipient("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to share file.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Share File</h3>
        <input
          type="text"
          placeholder="Recipient wallet address"
          value={recipient}
          onChange={e => setRecipient(e.target.value)}
          className="w-full mb-3 px-3 py-2 border rounded"
        />
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-2">File shared successfully!</p>}
        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            disabled={loading || !recipient}
          >
            {loading ? "Sharing..." : "Share"}
          </button>
        </div>
      </div>
    </div>
  );
}
