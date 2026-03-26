"use client";

import { useState, useEffect } from "react";
import { getWallet } from "@/lib/utils/auth";
import { getUserName } from "@/lib/blockchain";
import SetNameModal from "@/components/modals/SetNameModal";

interface DashboardSidebarProps {
  refreshKey?: number;
}

export default function DashboardSidebar({ refreshKey = 0 }: DashboardSidebarProps) {
  const [userName, setUserName] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [showNameModal, setShowNameModal] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const wallet = getWallet();
        if (wallet) {
          setWalletAddress(wallet);
          const name = await getUserName(wallet);
          setUserName(name);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [refreshKey]);

  const displayAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "";

  const handleNameUpdated = async () => {
    try {
      if (walletAddress) {
        const name = await getUserName(walletAddress);
        setUserName(name);
      }
    } catch (error) {
      console.error("Failed to refresh username:", error);
    }
  };

  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 bg-linear-to-b from-slate-50 to-slate-100 border-r border-slate-200 p-6 sticky top-0 h-screen">
        {/* User Profile Section */}
        <div className="mb-8">
          <div
            onClick={() => setShowNameModal(true)}
            className="cursor-pointer group rounded-lg border border-slate-200 bg-white p-4 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
          >
            {loading ? (
              <div className="space-y-2">
                <div className="h-5 w-24 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-slate-100 rounded animate-pulse"></div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {userName ? (
                      <>
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 truncate">
                          {userName}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 truncate">
                          {displayAddress}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-slate-600 group-hover:text-blue-600">
                          Click to add name
                        </p>
                        <p className="text-xs text-slate-500 mt-1 truncate">
                          {displayAddress}
                        </p>
                      </>
                    )}
                  </div>
                  <span className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    ✎
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4 flex-1">
          <div className="rounded-lg bg-white border border-slate-200 p-4">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Quick Info
            </h3>
            <div className="space-y-2 text-xs text-slate-600">
              <p>📁 Manage your encrypted files</p>
              <p>👥 Share with friends</p>
              <p>🔒 All data encrypted</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile User Profile Bar */}
      <div className="lg:hidden mb-6 rounded-lg border border-slate-200 bg-white p-4">
        <button
          onClick={() => setShowNameModal(true)}
          className="w-full text-left hover:bg-slate-50 transition-colors"
        >
          {loading ? (
            <div className="space-y-2">
              <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-3 w-32 bg-slate-100 rounded animate-pulse"></div>
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold text-slate-900">
                {userName || "Click to add name"}
              </p>
              <p className="text-xs text-slate-500 mt-1">{displayAddress}</p>
            </>
          )}
        </button>
      </div>

      <SetNameModal
        isOpen={showNameModal}
        onClose={() => setShowNameModal(false)}
        currentName={userName}
        onSuccess={handleNameUpdated}
      />
    </>
  );
}
