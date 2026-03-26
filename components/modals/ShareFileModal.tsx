"use client";
import { useState } from "react";
import FriendsSelector from "@/components/sharing/FriendsSelector";

type ShareMethod = "friend" | "address";

interface ShareFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (recipient: string) => Promise<void>;
}

export default function ShareFileModal({ isOpen, onClose, onShare }: ShareFileModalProps) {
  const [method, setMethod] = useState<ShareMethod>("friend");
  const [selectedFriend, setSelectedFriend] = useState<string>("");
  const [manualAddress, setManualAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);

  const recipient = method === "friend" ? selectedFriend : manualAddress;

  const handleShare = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await onShare(recipient);
      setSuccess(true);
      setSelectedFriend("");
      setManualAddress("");
      
      // Clear success message after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        handleClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to share file.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setSelectedFriend("");
      setManualAddress("");
      setError(null);
      setSuccess(false);
      setMethod("friend");
      onClose();
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md transition-all duration-300 ${isAnimating ? "opacity-100 bg-black/30" : "opacity-0 bg-black/0"} pointer-events-auto p-4`}>
      <div className={`relative w-full max-w-md transition-all duration-300 transform ${isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
        {/* Glassmorphism card */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/20">
          {/* Glass background effect */}
          <div className="absolute inset-0 backdrop-blur-xl bg-white/95 border border-white/40"></div>

          {/* Decorative gradient elements */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-linear-to-b from-blue-300/30 to-transparent rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-linear-to-t from-purple-300/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>

          {/* Content */}
          <div className="relative p-8 md:p-10 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  Share File
                </h3>
                <p className="text-sm text-slate-500 mt-2">Choose a recipient and share securely</p>
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

            {/* Progress indicator */}
            <div className="flex items-center justify-between gap-2 px-2">
              <div className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${method === "friend" ? "bg-gradient-to-r from-blue-600 to-purple-600" : "bg-slate-200"}`}></div>
              <div className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${method === "address" ? "bg-gradient-to-r from-blue-600 to-purple-600" : "bg-slate-200"}`}></div>
            </div>

            {/* Share Method Selector with premium styling */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMethod("friend")}
                className={`relative group overflow-hidden rounded-2xl p-4 transition-all duration-300 border ${
                  method === "friend"
                    ? "bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-300/50 shadow-lg shadow-blue-500/20"
                    : "bg-slate-50/50 border-slate-200/50 hover:border-slate-300/50"
                }`}
              >
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <span className="text-3xl transition-transform duration-300 group-hover:scale-110">👥</span>
                  <span className="text-sm font-semibold text-slate-900">Friend</span>
                  <span className="text-xs text-slate-500">From list</span>
                </div>
                {method === "friend" && (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-blue-300/10 -z-10"></div>
                )}
              </button>

              <button
                onClick={() => setMethod("address")}
                className={`relative group overflow-hidden rounded-2xl p-4 transition-all duration-300 border ${
                  method === "address"
                    ? "bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-300/50 shadow-lg shadow-purple-500/20"
                    : "bg-slate-50/50 border-slate-200/50 hover:border-slate-300/50"
                }`}
              >
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <span className="text-3xl transition-transform duration-300 group-hover:scale-110">📋</span>
                  <span className="text-sm font-semibold text-slate-900">Address</span>
                  <span className="text-xs text-slate-500">Manual entry</span>
                </div>
                {method === "address" && (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-purple-300/10 -z-10"></div>
                )}
              </button>
            </div>

            {/* Content section with smooth transition */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-50/50 to-slate-100/30 border border-slate-200/50 p-5 backdrop-blur-sm min-h-[120px] flex flex-col justify-center">
              {method === "friend" ? (
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <span>👤</span>
                    Select Friend
                  </label>
                  <FriendsSelector
                    onSelect={setSelectedFriend}
                    selectedFriend={selectedFriend}
                  />
                  {selectedFriend && (
                    <div className="mt-3 p-3 rounded-lg bg-emerald-50/60 border border-emerald-200/50 flex items-center gap-2">
                      <span className="text-emerald-600">✓</span>
                      <span className="text-xs text-emerald-700 font-medium">Ready to share with <span className="font-semibold">{selectedFriend.slice(0, 10)}...</span></span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <span>🔗</span>
                    Recipient Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-purple-600/20 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm"></div>
                    
                    <input
                      type="text"
                      placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f..."
                      value={manualAddress}
                      onChange={(e) => setManualAddress(e.target.value)}
                      className="relative w-full px-4 py-3 bg-white/60 border border-slate-200/50 rounded-lg placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200 backdrop-blur-sm font-mono text-sm"
                      disabled={loading}
                    />
                  </div>
                  {manualAddress && (
                    <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                      <span>{manualAddress.length}/42</span>
                      {manualAddress.length === 42 && manualAddress.startsWith("0x") && (
                        <span className="text-emerald-600 font-semibold">✓ Valid address</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Error and success messages */}
            {error && (
              <div className="animate-in slide-in-from-top-2 fade-in duration-300 rounded-xl bg-gradient-to-r from-red-50/90 to-red-50/60 border border-red-200/50 p-4 flex gap-3 backdrop-blur-sm shadow-sm">
                <span className="text-red-600 text-2xl flex-shrink-0">🚫</span>
                <p className="text-sm text-red-700 font-medium leading-relaxed">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="animate-in slide-in-from-top-2 fade-in duration-300 rounded-xl bg-gradient-to-r from-emerald-50/90 to-emerald-50/60 border border-emerald-200/50 p-4 flex items-center gap-3 backdrop-blur-sm shadow-sm">
                <span className="text-emerald-600 text-2xl flex-shrink-0">✨</span>
                <p className="text-sm text-emerald-700 font-semibold">File shared successfully! Closing...</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-3 rounded-lg bg-slate-100/60 text-slate-700 font-semibold hover:bg-slate-200/60 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200/50 backdrop-blur-sm shadow-sm hover:shadow-md"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleShare}
                disabled={loading || !recipient}
                className="flex-1 relative group overflow-hidden px-4 py-3 rounded-lg text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:shadow-none"
                style={{
                  background: loading || !recipient
                    ? "rgb(203, 213, 225)"
                    : "linear-gradient(135deg, rgb(37, 99, 235) 0%, rgb(59, 130, 246) 50%, rgb(37, 99, 235) 100%)",
                  backgroundSize: "200% 200%",
                }}
                onMouseEnter={(e) => {
                  if (!loading && recipient) {
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
                      <span>Sharing...</span>
                    </>
                  ) : (
                    <>
                      <span>📤</span>
                      <span>Share File</span>
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
