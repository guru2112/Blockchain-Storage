"use client";

import { useState, useCallback, useEffect } from "react";
import { getFriendsList } from "@/lib/blockchain/friendsManager";

interface FriendsSelectorProps {
  onSelect: (friend: string) => void;
  selectedFriend?: string;
  excludeAddresses?: string[];
}

export default function FriendsSelector({
  onSelect,
  selectedFriend,
  excludeAddresses = [],
}: FriendsSelectorProps) {
  const [friends, setFriends] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const fetchFriends = useCallback(async () => {
    setLoading(true);
    try {
      const friendsList = await getFriendsList();
      const filtered = friendsList.filter((f) => !excludeAddresses.includes(f));
      setFriends(filtered);
    } catch (error) {
      console.error("Failed to fetch friends:", error);
      setFriends([]);
    } finally {
      setLoading(false);
    }
  }, [excludeAddresses]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const filteredFriends = friends.filter((friend) =>
    friend.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedFriendDisplay = selectedFriend
    ? `${selectedFriend.slice(0, 10)}...${selectedFriend.slice(-8)}`
    : "Select a friend...";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
      >
        <span className={selectedFriend ? "text-gray-900" : "text-gray-500"}>
          {selectedFriendDisplay}
        </span>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-3 text-center text-gray-500 text-sm">Loading friends...</div>
            ) : filteredFriends.length === 0 ? (
              <div className="p-3 text-center text-gray-500 text-sm">
                {friends.length === 0 ? "No friends yet" : "No matching friends"}
              </div>
            ) : (
              filteredFriends.map((friend) => (
                <button
                  key={friend}
                  onClick={() => {
                    onSelect(friend);
                    setIsOpen(false);
                    setSearchQuery("");
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                    selectedFriend === friend ? "bg-blue-100" : ""
                  }`}
                >
                  <p className="font-medium text-gray-900">
                    {friend.slice(0, 10)}...{friend.slice(-8)}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">{friend}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
