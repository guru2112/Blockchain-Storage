"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getWallet } from "@/lib/auth";
import { useProtectHistory } from "@/lib/useProtectHistory";
import CreateFolderModal from "@/components/CreateFolderModal";
import FileList from "@/components/FileList";
import PendingShares from "@/components/PendingShares";
import SharedFilesReceived from "@/components/SharedFilesReceived";

export default function Dashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<"my-files" | "pending-shares" | "shared-with-me">("my-files");
  useProtectHistory();

  useEffect(() => {
    const wallet = getWallet();

    if (!wallet) {
      router.replace("/login");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
  }, [router]);

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
    <main className="mx-auto max-w-6xl px-4 py-12">
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
      <div className="mb-6 flex gap-2 border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab("my-files")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === "my-files"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          📁 My Files
        </button>
        <button
          onClick={() => setActiveTab("pending-shares")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === "pending-shares"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          📬 Pending Shares
        </button>
        <button
          onClick={() => setActiveTab("shared-with-me")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === "shared-with-me"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          📤 Shared With Me
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

      <CreateFolderModal
        isOpen={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        onSuccess={handleFolderCreated}
        parentId={currentFolderId}
      />
    </main>
  );
}
