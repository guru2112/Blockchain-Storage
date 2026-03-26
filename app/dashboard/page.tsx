"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getWallet } from "@/lib/utils/auth";
import { useProtectHistory } from "@/lib/hooks/useProtectHistory";
import { getPendingShares } from "@/lib/blockchain";
import { getPendingRequestCount } from "@/lib/blockchain/friendsManager";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import CreateFolderModal from "@/components/modals/CreateFolderModal";
import FileList from "@/components/file-management/FileList";
import PendingShares from "@/components/sharing/PendingShares";
import SharedFilesReceived from "@/components/sharing/SharedFilesReceived";
import FriendsManagement from "@/components/sharing/FriendsManagement";

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<"my-files" | "pending-shares" | "shared-with-me" | "friends">("my-files");
  const [pendingSharesCount, setPendingSharesCount] = useState(0);
  const [pendingFriendCount, setPendingFriendCount] = useState(0);
  useProtectHistory();

  useEffect(() => {
    const wallet = getWallet();

    if (!wallet) {
      router.replace("/login");
      return;
    }

    // Check if tab is specified in query params
    const tabParam = searchParams.get("tab");
    if (tabParam === "friends" || tabParam === "pending-shares" || tabParam === "shared-with-me" || tabParam === "my-files") {
      setActiveTab(tabParam);
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
  }, [router, searchParams]);

  useEffect(() => {
    if (!ready) return;

    const fetchNotificationCounts = async () => {
      try {
        const [shares, friendReq] = await Promise.all([
          getPendingShares(),
          getPendingRequestCount(),
        ]);
        setPendingSharesCount(shares.length);
        setPendingFriendCount(friendReq);
      } catch (error) {
        // If contract functions don't exist (old contract version),
        // just fetch pending shares and set friend count to 0
        if (error instanceof Error && error.message.includes("is not a function")) {
          console.warn("⚠️ Contract needs to be redeployed with friend management functions");
          try {
            const shares = await getPendingShares();
            setPendingSharesCount(shares.length);
            setPendingFriendCount(0); // Set to 0 until contract is redeployed
          } catch (innerError) {
            console.error("Failed to get pending shares:", innerError);
          }
        } else {
          console.error("Failed to fetch notification counts:", error);
        }
      }
    };

    fetchNotificationCounts();
    const interval = setInterval(fetchNotificationCounts, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [ready]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-sm text-slate-600">Checking your session...</p>
      </div>
    );
  }

  const handleFolderCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="flex">
      <DashboardSidebar refreshKey={refreshKey} />
      <main className="flex-1 px-4 py-12 lg:max-w-5xl lg:mx-auto">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Your dashboard
            </h1>
            <p className="text-sm text-slate-600">
              Manage encrypted files tied to your wallet.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateFolder(true)}
            className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            + New Folder
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 flex gap-1 bg-slate-50 rounded-lg p-1 border border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab("my-files")}
          className={`px-6 py-2.5 text-sm font-semibold rounded-md transition-all duration-200 whitespace-nowrap ${
            activeTab === "my-files"
              ? "bg-white text-blue-600 shadow-sm border border-slate-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
          }`}
        >
          📁 My Files
        </button>
        <button
          onClick={() => setActiveTab("pending-shares")}
          className={`px-6 py-2.5 text-sm font-semibold rounded-md transition-all duration-200 whitespace-nowrap relative ${
            activeTab === "pending-shares"
              ? "bg-white text-blue-600 shadow-sm border border-slate-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
          }`}
        >
          📬 Pending Shares
          {pendingSharesCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-linear-to-r from-red-500 to-red-600 text-white text-xs font-bold shadow-md">
              {pendingSharesCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("shared-with-me")}
          className={`px-6 py-2.5 text-sm font-semibold rounded-md transition-all duration-200 whitespace-nowrap ${
            activeTab === "shared-with-me"
              ? "bg-white text-blue-600 shadow-sm border border-slate-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
          }`}
        >
          📤 Shared With Me
        </button>
        <button
          onClick={() => setActiveTab("friends")}
          className={`px-6 py-2.5 text-sm font-semibold rounded-md transition-all duration-200 whitespace-nowrap relative ${
            activeTab === "friends"
              ? "bg-white text-blue-600 shadow-sm border border-slate-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
          }`}
        >
          👥 Friends
          {pendingFriendCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-linear-to-r from-orange-500 to-orange-600 text-white text-xs font-bold shadow-md">
              {pendingFriendCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === "my-files" && (
        <>
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <p className="font-medium">💡 Tip:</p>
            <p>Click the <strong>↑ Upload File</strong> button in your files section to upload files directly into any folder.</p>
          </div>

          <FileList refreshKey={refreshKey} />
        </>
      )}

      {activeTab === "pending-shares" && (
        <PendingShares refreshKey={refreshKey} />
      )}

      {activeTab === "shared-with-me" && (
        <SharedFilesReceived refreshKey={refreshKey} />
      )}

      {activeTab === "friends" && (
        <>
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <p className="font-medium">💡 Tip:</p>
            <p>Add friends to share files without re-entering wallet addresses. Send requests, accept/reject, and easily share files with your friends!</p>
          </div>
          <FriendsManagement refreshKey={refreshKey} />
        </>
      )}

      <CreateFolderModal
        isOpen={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        onSuccess={handleFolderCreated}
      />
    </main>
    </div>
  );
}
