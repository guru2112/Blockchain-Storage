"use client";

import { useState } from "react";
import { sendFriendRequest } from "@/lib/blockchain/friendsManager";

interface SendFriendRequestProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function SendFriendRequest({ onClose, onSuccess }: SendFriendRequestProps) {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const trimmedAddress = address.trim();

      if (!trimmedAddress) {
        throw new Error("Please enter a wallet address");
      }

      if (!trimmedAddress.startsWith("0x")) {
        throw new Error("Address must start with 0x");
      }

      if (trimmedAddress.length !== 42) {
        throw new Error("Address must be 42 characters long");
      }

      await sendFriendRequest(trimmedAddress);
      setAddress("");
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send friend request";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setAddress("");
      setError(null);
      onClose();
    }, 200);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md transition-opacity duration-300 ${isAnimating ? "opacity-100 bg-black/30" : "opacity-0 bg-black/0"} pointer-events-auto p-4`}>
      <div className={`relative w-full max-w-md transition-all duration-300 transform ${isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
        {/* Glassmorphism card */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/20">
          {/* Glass background effect */}
          <div className="absolute inset-0 backdrop-blur-xl bg-white/95 border border-white/40"></div>

          {/* Decorative gradient elements */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-b from-blue-300/30 to-transparent rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-gradient-to-t from-purple-300/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>

          {/* Content */}
          <div className="relative p-8 md:p-10 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  Send Friend Request
                </h2>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  Add someone to your network by entering their wallet address
                </p>
              </div>
              <button
                onClick={handleClose}
                className="flex-shrink-0 ml-4 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 transition-all duration-200 hover:shadow-sm"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Error message with better styling */}
            {error && (
              <div className="animate-in slide-in-from-top-2 fade-in duration-300 rounded-xl bg-gradient-to-r from-red-50/90 to-red-50/60 border border-red-200/50 p-4 flex gap-3 backdrop-blur-sm shadow-sm">
                <span className="text-red-600 text-2xl flex-shrink-0">🚫</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-900">Validation Error</p>
                  <p className="text-sm text-red-700 mt-1 leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            {/* Form with enhanced styling */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-900">
                  <span className="flex items-center gap-2">
                    <span className="text-lg">💼</span>
                    Recipient Wallet Address
                  </span>
                </label>
                
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm"></div>
                  
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-slate-400">🔗</span>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f..."
                      className="w-full pl-12 pr-4 py-3 bg-white/60 border border-slate-200/50 rounded-xl placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 backdrop-blur-sm font-mono text-sm"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Helper text with character count and validation indicator */}
                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                  <p>Enter the 42-character Ethereum wallet address</p>
                  {address && (
                    <span className={`font-semibold transition-colors ${address.length === 42 && address.startsWith("0x") ? "text-emerald-600" : "text-orange-600"}`}>
                      {address.length}/42 {address.length === 42 && address.startsWith("0x") ? "✓" : ""}
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 px-4 py-3 rounded-lg bg-slate-100/60 text-slate-700 font-semibold hover:bg-slate-200/60 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200/50 backdrop-blur-sm shadow-sm hover:shadow-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !address}
                  className="flex-1 relative group overflow-hidden px-4 py-3 rounded-lg text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:shadow-none"
                  style={{
                    background: loading || !address 
                      ? "rgb(203, 213, 225)" 
                      : "linear-gradient(135deg, rgb(37, 99, 235) 0%, rgb(59, 130, 246) 50%, rgb(37, 99, 235) 100%)",
                    backgroundSize: "200% 200%",
                  }}
                  onMouseEnter={(e) => {
                    if (!loading && address) {
                      e.currentTarget.style.backgroundPosition = "100% 0";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundPosition = "0% 0";
                  }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <span>✉️</span>
                        <span>Send Request</span>
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>

            {/* Info callout */}
            <div className="rounded-lg bg-blue-50/40 border border-blue-200/30 p-3 flex gap-3 backdrop-blur-sm">
              <span className="text-blue-600 text-lg flex-shrink-0 mt-0.5">ℹ️</span>
              <p className="text-xs text-blue-700 leading-relaxed">
                The user will receive a friend request notification. They'll need to accept it to become your friend.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
