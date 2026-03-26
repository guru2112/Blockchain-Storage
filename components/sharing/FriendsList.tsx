"use client";

import { useState } from "react";
import { removeFriend } from "@/lib/blockchain/friendsManager";

interface FriendsListProps {
  friends: string[];
  onRemoveFriend: () => void;
}

export default function FriendsList({ friends, onRemoveFriend }: FriendsListProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"address" | "recent">("address");

  const handleRemove = async (friendAddress: string) => {
    if (!confirm(`Remove this friend from your network?`)) {
      return;
    }

    setLoading(friendAddress);
    setError(null);

    try {
      await removeFriend(friendAddress);
      onRemoveFriend();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to remove friend";
      setError(message);
    } finally {
      setLoading(null);
    }
  };

  const filteredFriends = friends.filter((friend) =>
    friend.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedFriends = [...filteredFriends].sort((a, b) => {
    if (sortBy === "address") {
      return a.localeCompare(b);
    }
    return 0;
  });

  if (friends.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/50 bg-gradient-to-br from-slate-50/50 to-slate-100/30 p-12 text-center backdrop-blur-sm shadow-sm">
        <div className="text-6xl mb-4">🤝</div>
        <p className="text-slate-700 font-semibold text-lg">No friends yet</p>
        <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">Send friend requests to connect with others in the network</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="relative rounded-2xl bg-gradient-to-r from-white to-slate-50/50 border border-slate-200/50 p-4 backdrop-blur-sm shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search input with icon */}
          <div className="flex-1 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm"></div>
            
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-400 text-lg pointer-events-none">🔍</span>
              <input
                type="text"
                placeholder="Search by address or initials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/60 border border-slate-200/50 rounded-lg placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 backdrop-blur-sm text-sm"
              />
            </div>
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600 hidden sm:inline">Sort:</span>
            <div className="relative group/sort">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "address" | "recent")}
                className="appearance-none px-4 py-2.5 pr-10 bg-white border border-slate-200/50 rounded-lg text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all cursor-pointer hover:border-slate-300/50 shadow-sm"
              >
                <option value="address">💼 Address</option>
                <option value="recent">🕐 Recent</option>
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Search result count */}
        {searchQuery && (
          <div className="mt-3 text-xs text-slate-500 font-medium">
            Found <span className="text-blue-600 font-semibold">{sortedFriends.length}</span> of <span className="text-slate-700 font-semibold">{friends.length}</span> friends
          </div>
        )}
      </div>

      {error && (
        <div className="animate-in slide-in-from-top-2 fade-in duration-300 rounded-xl bg-gradient-to-r from-red-50/90 to-red-50/60 border border-red-200/50 p-4 flex gap-3 backdrop-blur-sm shadow-sm">
          <span className="text-red-600 text-xl flex-shrink-0 mt-0.5">⚠️</span>
          <div>
            <p className="font-semibold text-red-900">Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Friends list */}
      <div className="space-y-3">
        {sortedFriends.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/50 bg-gradient-to-br from-slate-50/50 to-slate-100/30 p-8 text-center backdrop-blur-sm">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-slate-700 font-semibold">No matches found</p>
            <p className="text-slate-500 text-sm mt-1">Try adjusting your search term</p>
          </div>
        ) : (
          sortedFriends.map((friend, index) => (
            <div
              key={friend}
              className="group relative animate-in fade-in slide-in-from-left-4 duration-300"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              {/* Gradient border effect on hover */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/0 via-purple-500/20 to-purple-500/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur group-hover:blur-sm pointer-events-none"></div>

              {/* Card with premium styling */}
              <div className="relative rounded-2xl border border-slate-200/50 bg-gradient-to-br from-white via-slate-50/30 to-purple-50/20 p-5 hover:shadow-xl transition-all duration-300 hover:border-purple-200/50 backdrop-blur-sm overflow-hidden">
                {/* Top accent gradient */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Decorative gradient on right side */}
                <div className="absolute -right-20 -top-20 w-40 h-40 bg-gradient-to-b from-purple-300/10 to-transparent rounded-full blur-2xl pointer-events-none group-hover:from-purple-300/20 transition-colors duration-300"></div>

                <div className="relative flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4">
                      {/* Avatar with enhanced styling */}
                      <div className="flex-shrink-0 h-14 w-14 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/40 relative group/avatar hover:shadow-xl hover:shadow-purple-500/50 transition-shadow">
                        <span className="text-base">{friend.slice(2, 4).toUpperCase()}</span>
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-white border-2 border-purple-600 shadow-sm"></div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 truncate text-sm md:text-base">
                          {friend.slice(0, 10)}...{friend.slice(-8)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 font-mono truncate hover:text-slate-600 transition-colors" title={friend}>
                          {friend}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-100/60 text-emerald-700 text-xs font-semibold border border-emerald-200/50 backdrop-blur-sm">
                            🟢 Connected
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Remove button with enhanced styling */}
                  <button
                    onClick={() => handleRemove(friend)}
                    disabled={loading === friend}
                    className="flex-shrink-0 relative group/btn overflow-hidden px-4 py-2.5 rounded-lg border border-red-300/60 bg-white text-red-600 font-semibold hover:bg-red-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-sm hover:shadow-md hover:border-red-400/80 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                    {loading === friend ? (
                      <span className="relative z-10 flex items-center gap-1.5">
                        <div className="h-3 w-3 border-2 border-red-400 border-t-red-700 rounded-full animate-spin"></div>
                        <span className="hidden sm:inline">Removing...</span>
                      </span>
                    ) : (
                      <span className="relative z-10 flex items-center gap-1">
                        <span>✕</span>
                        <span className="hidden sm:inline">Remove</span>
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer stats */}
      <div className="rounded-xl bg-gradient-to-r from-blue-50/50 to-purple-50/50 border border-blue-200/30 p-4 text-center backdrop-blur-sm">
        <p className="text-sm text-slate-700 font-medium">
          <span className="text-blue-600 font-bold">{friends.length}</span> friends in your network
        </p>
      </div>
    </div>
  );
}
