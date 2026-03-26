"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getPendingFriendRequests,
  getFriendsList,
  getFriendCount,
  getPendingRequestCount,
  FriendRequest,
} from "@/lib/blockchain/friendsManager";
import SendFriendRequest from "./SendFriendRequest";
import PendingRequests from "./PendingRequests";
import FriendsList from "./FriendsList";

type TabType = "friends" | "pending";

interface FriendsManagementProps {
  refreshKey?: string | number;
}

export default function FriendsManagement({ refreshKey }: FriendsManagementProps) {
  const [activeTab, setActiveTab] = useState<TabType>("friends");
  const [friends, setFriends] = useState<string[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [friendCount, setFriendCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSendRequest, setShowSendRequest] = useState(false);
  const [tabTransition, setTabTransition] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [friendsList, requests, count, pending] = await Promise.all([
        getFriendsList(),
        getPendingFriendRequests(),
        getFriendCount(),
        getPendingRequestCount(),
      ]);

      setFriends(friendsList);
      setPendingRequests(requests);
      setFriendCount(count);
      setPendingCount(pending);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load friends data";
      
      // Check if it's because the contract needs to be redeployed
      if (errorMsg.includes("is not a function")) {
        setError("⚠️ Please redeploy the smart contract to use the friends feature. See FIX_CONTRACT_ERRORS.md for instructions.");
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  const handleRequestSent = async () => {
    setShowSendRequest(false);
    await fetchData();
  };

  const handleRequestAccepted = async () => {
    await fetchData();
  };

  const handleRequestRejected = async () => {
    await fetchData();
  };

  const handleFriendRemoved = async () => {
    await fetchData();
  };

  const handleTabChange = (tab: TabType) => {
    setTabTransition(true);
    setActiveTab(tab);
    setTimeout(() => setTabTransition(false), 300);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600"></div>
          <p className="mt-4 text-slate-600 font-medium text-sm">Loading friends...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Main container with gradient background */}
      <div className="relative rounded-2xl bg-gradient-to-br from-blue-50/50 via-white to-purple-50/30 backdrop-blur-sm border border-white/40 p-6 md:p-8 shadow-xl shadow-blue-500/5">
        {/* Decorative gradient blob */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-b from-blue-200 to-transparent rounded-full opacity-20 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-t from-purple-200 to-transparent rounded-full opacity-15 blur-3xl pointer-events-none"></div>

        {error && (
          <div className="relative mb-6 rounded-xl bg-gradient-to-r from-red-50 to-red-50/50 border border-red-200/50 p-4 flex items-start gap-3 backdrop-blur-sm shadow-sm">
            <span className="text-red-600 text-xl mt-0.5 flex-shrink-0">⚠️</span>
            <div className="flex-1">
              <p className="font-semibold text-red-900">Unable to load friends</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Tabs with premium styling */}
        <div className="relative mb-8">
          <div className="flex gap-2 bg-gradient-to-r from-slate-100/60 to-slate-50/60 rounded-xl p-1.5 w-fit border border-slate-200/50 backdrop-blur-sm">
            <button
              onClick={() => handleTabChange("friends")}
              className={`relative px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-300 overflow-hidden group ${
                activeTab === "friends"
                  ? "bg-white text-blue-600 shadow-lg shadow-blue-500/20 border border-blue-200/50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="text-lg">👥</span>
                <span>Friends</span>
                {friendCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold shadow-md">
                    {friendCount}
                  </span>
                )}
              </span>
              {activeTab === "friends" && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-blue-500/5 rounded-lg -z-10"></div>
              )}
            </button>

            <button
              onClick={() => handleTabChange("pending")}
              className={`relative px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-300 overflow-hidden group ${
                activeTab === "pending"
                  ? "bg-white text-blue-600 shadow-lg shadow-blue-500/20 border border-blue-200/50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="text-lg">📬</span>
                <span>Pending</span>
                {pendingCount > 0 && (
                  <span className="animate-pulse ml-2 inline-flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-bold shadow-lg shadow-red-500/40">
                    {pendingCount}
                  </span>
                )}
              </span>
              {activeTab === "pending" && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-blue-500/5 rounded-lg -z-10"></div>
              )}
            </button>
          </div>
        </div>

        {/* Visual divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-300/30 to-transparent mb-8"></div>

        {/* Add Friend Button - Prominent CTA */}
        <button
          onClick={() => setShowSendRequest(true)}
          className="w-full relative group overflow-hidden rounded-xl px-6 py-4 text-white font-semibold transition-all duration-300 shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 active:shadow-lg"
          style={{
            background: "linear-gradient(135deg, rgb(37, 99, 235) 0%, rgb(29, 78, 216) 50%, rgb(37, 99, 235) 100%)",
            backgroundSize: "200% 200%",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundPosition = "100% 0";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundPosition = "0% 0";
          }}
        >
          <span className="relative z-10 flex items-center justify-center gap-2 text-lg">
            <span className="text-xl">➕</span>
            Send Friend Request
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>

      {/* Send Friend Request Modal */}
      {showSendRequest && (
        <SendFriendRequest
          onClose={() => setShowSendRequest(false)}
          onSuccess={handleRequestSent}
        />
      )}

      {/* Tab Content with smooth transition */}
      <div className={`transition-opacity duration-300 ${tabTransition ? "opacity-70" : "opacity-100"}`}>
        {activeTab === "friends" && (
          <FriendsList friends={friends} onRemoveFriend={handleFriendRemoved} />
        )}

        {activeTab === "pending" && (
          <PendingRequests
            requests={pendingRequests}
            onAccept={handleRequestAccepted}
            onReject={handleRequestRejected}
          />
        )}
      </div>
    </div>
  );
}
