"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getPendingShares,
  acceptPendingShare,
  rejectPendingShare,
  PendingShare
} from "@/lib/blockchain";

type PendingSharesProps = {
  refreshKey?: string | number;
};

type SortOption = "newest" | "oldest" | "alphabetical";

export default function PendingShares({ refreshKey }: PendingSharesProps) {
  const [shares, setShares] = useState<PendingShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIndex, setProcessingIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Sorting State
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);

  const fetchShares = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPendingShares();
      setShares(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load pending shares.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShares();
  }, [fetchShares, refreshKey]);

  const handleAccept = async (sender: string, shareIndex: number, arrayIndex: number) => {
    setProcessingIndex(arrayIndex);
    setError(null);
    try {
      await acceptPendingShare(sender, shareIndex);
      await fetchShares();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept share.");
    } finally {
      setProcessingIndex(null);
    }
  };

  const handleReject = async (shareIndex: number, arrayIndex: number) => {
    setProcessingIndex(arrayIndex);
    setError(null);
    try {
      await rejectPendingShare(shareIndex);
      await fetchShares();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject share.");
    } finally {
      setProcessingIndex(null);
    }
  };

  // FILTERING
  const filteredShares = shares.filter(
    (share) =>
      share.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      share.senderUsername.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // GROUPING
  const groupedShares = filteredShares.reduce((acc, share) => {
    const date = new Date(Number(share.timestamp) * 1000).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(share);
    return acc;
  }, {} as Record<string, PendingShare[]>);

  // SORTING LOGIC: Sort the Date Headers
  const sortedDateKeys = Object.keys(groupedShares).sort((a, b) => {
    const timeA = Number(groupedShares[a][0].timestamp);
    const timeB = Number(groupedShares[b][0].timestamp);
    if (sortBy === "oldest") return timeA - timeB;
    return timeB - timeA; // "newest" and "alphabetical" show newest dates first
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-100"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Sleek Search & Action Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-10">
        <div className="relative flex-1 w-full group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500 text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search pending shares..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm placeholder-slate-400 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto h-full">
          <div className="relative" onMouseLeave={() => setShowSortMenu(false)}>
            <button 
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="h-[50px] px-5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm flex items-center gap-2"
            >
              <span className="text-slate-400 font-normal">Sort:</span> 
              {sortBy === "newest" ? "Newest" : sortBy === "oldest" ? "Oldest" : "A-Z"} ▾
            </button>
            
            {showSortMenu && (
              <div className="absolute top-14 right-0 w-44 bg-white border border-slate-100 rounded-xl shadow-xl z-30 p-2 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2">
                <button onClick={() => { setSortBy("newest"); setShowSortMenu(false); }} className={`text-sm font-bold text-left px-3 py-2.5 rounded-lg transition-colors ${sortBy === "newest" ? "bg-blue-50 text-blue-600" : "text-slate-700 hover:bg-slate-50"}`}>Newest First</button>
                <button onClick={() => { setSortBy("oldest"); setShowSortMenu(false); }} className={`text-sm font-bold text-left px-3 py-2.5 rounded-lg transition-colors ${sortBy === "oldest" ? "bg-blue-50 text-blue-600" : "text-slate-700 hover:bg-slate-50"}`}>Oldest First</button>
                <button onClick={() => { setSortBy("alphabetical"); setShowSortMenu(false); }} className={`text-sm font-bold text-left px-3 py-2.5 rounded-lg transition-colors ${sortBy === "alphabetical" ? "bg-blue-50 text-blue-600" : "text-slate-700 hover:bg-slate-50"}`}>Alphabetical (A-Z)</button>
              </div>
            )}
          </div>
          
          <button
            className="h-[50px] px-6 bg-gradient-to-r from-emerald-100 to-green-100 border border-green-200/50 rounded-2xl text-sm font-bold text-green-800 hover:shadow-md hover:scale-[1.02] transition-all whitespace-nowrap"
            disabled={shares.length === 0}
          >
            Accept All
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-800">Pending Shares</h2>
        <p className="text-sm font-medium text-slate-500 mt-1">Review and accept files sent to you by your connections.</p>
      </div>

      {error && (
        <p className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600 shadow-sm">
          {error}
        </p>
      )}

      {sortedDateKeys.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-300/50 rounded-3xl bg-white/50">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">📬</span>
          </div>
          <p className="text-slate-500 font-bold text-lg">No pending shares.</p>
          <p className="text-slate-400 text-sm mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedDateKeys.map((date) => {
            // Apply sorting logic inside each date group
            const dateShares = groupedShares[date].sort((a,b) => {
              if (sortBy === "alphabetical") return a.filename.localeCompare(b.filename);
              if (sortBy === "newest") return Number(b.timestamp) - Number(a.timestamp);
              if (sortBy === "oldest") return Number(a.timestamp) - Number(b.timestamp);
              return 0;
            });

            return (
              <div key={date} className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">
                  {date}
                </h3>
                
                <div className="space-y-4">
                  {dateShares.map((share, idx) => {
                    const globalIndex = shares.indexOf(share);
                    const isBusy = processingIndex === globalIndex;
                    const time = new Date(Number(share.timestamp) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div
                        key={`${share.sender}-${share.fileIndex}-${idx}`}
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors gap-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200/50 flex items-center justify-center text-lg shrink-0">
                            📄
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{share.filename}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-semibold text-slate-500">Shared By:</span>
                              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                                {share.senderUsername}
                              </span>
                              <span className="text-xs font-medium text-slate-400 ml-2">• {time}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                          <button
                            onClick={() => handleAccept(share.sender, share.fileIndex, globalIndex)}
                            disabled={isBusy}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 shadow-md shadow-green-500/20 transition-all disabled:opacity-50 disabled:scale-100 active:scale-95"
                          >
                            {isBusy ? "..." : "Accept"} 
                            {!isBusy && <span className="text-white drop-shadow-sm">✓</span>}
                          </button>
                          <button
                            onClick={() => handleReject(share.fileIndex, globalIndex)}
                            disabled={isBusy}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 shadow-md shadow-red-500/20 transition-all disabled:opacity-50 disabled:scale-100 active:scale-95"
                          >
                            {isBusy ? "..." : "Reject"}
                            {!isBusy && <span className="text-white drop-shadow-sm">✕</span>}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}