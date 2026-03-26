"use client";

import { useState } from "react";
import { acceptFriendRequest, rejectFriendRequest, FriendRequest } from "@/lib/blockchain/friendsManager";

interface PendingRequestsProps {
  requests: FriendRequest[];
  onAccept: () => void;
  onReject: () => void;
}

export default function PendingRequests({
  requests,
  onAccept,
  onReject,
}: PendingRequestsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async (requesterAddress: string) => {
    setLoading(requesterAddress);
    setError(null);

    try {
      await acceptFriendRequest(requesterAddress);
      onAccept();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to accept friend request";
      setError(message);
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async (requesterAddress: string) => {
    setLoading(requesterAddress);
    setError(null);

    try {
      await rejectFriendRequest(requesterAddress);
      onReject();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reject friend request";
      setError(message);
    } finally {
      setLoading(null);
    }
  };

  if (requests.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/50 bg-gradient-to-br from-slate-50/50 to-slate-100/30 p-12 text-center backdrop-blur-sm shadow-sm">
        <div className="text-6xl mb-4 animate-bounce">📬</div>
        <p className="text-slate-700 font-semibold text-lg">No pending requests</p>
        <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">Friends will appear here when they send you requests</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="animate-in slide-in-from-top-2 fade-in duration-300 rounded-xl bg-gradient-to-r from-red-50/90 to-red-50/60 border border-red-200/50 p-4 flex gap-3 backdrop-blur-sm shadow-sm">
          <span className="text-red-600 text-xl flex-shrink-0 mt-0.5">⚠️</span>
          <div>
            <p className="font-semibold text-red-900">Error processing request</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {requests.map((request, index) => {
        const daysAgo = Math.floor((Date.now() - request.timestamp * 1000) / (1000 * 60 * 60 * 24));
        const timeLabel = daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo} days ago`;

        return (
          <div
            key={request.requester}
            className="group relative animate-in fade-in slide-in-from-left-4 duration-300"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Gradient border effect on hover */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-purple-500/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm group-hover:blur pointer-events-none"></div>

            {/* Card */}
            <div className="relative rounded-2xl border border-slate-200/50 bg-gradient-to-br from-white to-slate-50/30 p-5 hover:shadow-lg transition-all duration-300 hover:border-blue-200/50 backdrop-blur-sm">
              {/* Left accent border */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 via-blue-500 to-purple-600 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    {/* Avatar with enhanced styling */}
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/40 relative">
                      <span className="text-sm">{request.requester.slice(2, 4).toUpperCase()}</span>
                      <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white shadow-md animate-pulse"></div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 truncate text-sm md:text-base">
                        {request.requester.slice(0, 10)}...{request.requester.slice(-8)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-slate-500 font-medium">
                          <span className="inline-flex items-center gap-1">
                            <span>🕐</span>
                            Requested {timeLabel}
                          </span>
                        </p>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-100/60 text-blue-700 text-xs font-semibold border border-blue-200/50 backdrop-blur-sm">
                          Pending
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action buttons with enhanced styling */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleReject(request.requester)}
                    disabled={loading === request.requester}
                    className="relative group/btn px-4 py-2.5 rounded-lg border border-slate-300/60 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-sm hover:shadow-md hover:border-slate-400/80 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                    {loading === request.requester ? (
                      <span className="flex items-center gap-1.5 relative z-10">
                        <div className="h-3 w-3 border-2 border-slate-400 border-t-slate-700 rounded-full animate-spin"></div>
                      </span>
                    ) : (
                      <span className="relative z-10 flex items-center gap-1">
                        <span>✕</span>
                        <span className="hidden sm:inline">Reject</span>
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => handleAccept(request.requester)}
                    disabled={loading === request.requester}
                    className="relative group/btn overflow-hidden px-4 py-2.5 rounded-lg text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 disabled:shadow-none"
                    style={{
                      background: loading === request.requester
                        ? "rgb(187, 247, 208)"
                        : "linear-gradient(135deg, rgb(5, 150, 105) 0%, rgb(4, 120, 87) 100%)",
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                    {loading === request.requester ? (
                      <span className="relative z-10 flex items-center gap-1.5">
                        <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </span>
                    ) : (
                      <span className="relative z-10 flex items-center gap-1">
                        <span>✓</span>
                        <span className="hidden sm:inline">Accept</span>
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
