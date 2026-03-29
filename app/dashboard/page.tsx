"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getWallet } from "@/lib/utils/auth";
import { getUsername, getStorageInfo } from "@/lib/blockchain";
import { useProtectHistory } from "@/lib/hooks/useProtectHistory";
import FileList from "@/components/file-management/FileList";
import PendingShares from "@/components/sharing/PendingShares";
import SharedFilesReceived from "@/components/sharing/SharedFilesReceived";
import ConnectionsManager from "@/components/connections/ConnectionsManager";
import ProfileSettings from "@/components/profile/ProfileSettings";

type TabType = "my-files" | "pending-shares" | "shared-with-me" | "connections" | "profile" | "about-us";

export default function Dashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>("my-files");

  // Profile State
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [username, setUsername] = useState<string>("Loading...");
  const [showWalletDetails, setShowWalletDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  // Storage State
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageLimit, setStorageLimit] = useState(262144000); 
  
  useProtectHistory();

  useEffect(() => {
    const initProfile = async () => {
      const wallet = getWallet();
      if (!wallet) {
        router.replace("/login");
        return;
      }
      setWalletAddress(wallet);
      
      const savedName = await getUsername(wallet);
      setUsername(savedName || "Unnamed User");

      try {
        const storage = await getStorageInfo(wallet);
        setStorageUsed(storage.used);
        setStorageLimit(storage.limit);
      } catch (error) {
        console.error("Could not fetch storage limits yet", error);
      }

      setReady(true);
    };

    initProfile();
  }, [router, refreshKey]);

  const handleLogout = () => {
    localStorage.removeItem("walletAddress"); 
    router.replace("/login");
  };

  const handleCopyWallet = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatBytesToMB = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2);
  };

  const storagePercentage = Math.min((storageUsed / storageLimit) * 100, 100);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  const NavButton = ({ id, label }: { id: TabType; label: string }) => {
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => setActiveTab(id)}
        className={`w-full flex items-center justify-center py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
          isActive
            ? "bg-gradient-to-r from-cyan-300 to-blue-400 text-slate-900 shadow-lg shadow-cyan-500/20 scale-[1.02]"
            : "bg-transparent text-slate-300 hover:bg-white/10 hover:text-white"
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f4f7fb] font-sans text-slate-900">
      
      {/* TOP HEADER */}
      <header className="h-[72px] bg-[#f4f7fb] border-b border-slate-200/60 flex items-center justify-between px-8 z-30 shrink-0">
        <div className="flex items-center gap-3 ml-64"> {/* Offset for sidebar */}
          <div className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-400 to-yellow-400 text-slate-900 font-bold tracking-wide shadow-md shadow-pink-500/20">
            DeCen Drive
          </div>
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowWalletDetails(!showWalletDetails)}
            className="flex items-center gap-3 px-2 py-1.5 pr-4 bg-white/60 backdrop-blur-md border border-slate-200 rounded-full hover:bg-white transition-all shadow-sm"
          >
            <div className="h-8 w-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm shadow-inner">
              {username.charAt(0).toUpperCase()}
            </div>
            <span className="font-bold text-slate-700 uppercase text-sm tracking-tight">
              {username}
            </span>
          </button>

          {showWalletDetails && (
            <div className="absolute top-[50px] right-0 w-64 bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Connected Wallet</p>
              <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3 border border-slate-100 shadow-inner">
                <span className="font-mono text-xs font-medium text-slate-600 truncate mr-2">
                  {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}
                </span>
                <button 
                  onClick={handleCopyWallet}
                  className="p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-all shadow-sm"
                >
                  {copied ? "✅" : "📋"}
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* SIDEBAR - Absolute positioned to overlap header border gracefully */}
      <aside className="absolute top-0 left-0 h-full w-64 flex flex-col bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#0f172a] shadow-2xl z-40 rounded-r-3xl border-r border-white/10">
        <div className="h-[72px] flex items-center px-8">
            <span className="text-white/50 text-xs font-bold uppercase tracking-widest">Menu</span>
        </div>
        
        <nav className="flex-1 px-5 py-4 space-y-6 overflow-y-auto scrollbar-hide">
          <div className="space-y-2">
            <NavButton id="my-files" label="My Files" />
            <NavButton id="pending-shares" label="Pending Shares" />
            <NavButton id="shared-with-me" label="Share With Me" />
            <NavButton id="connections" label="Connections" />
          </div>
          
          <div className="pt-4 border-t border-white/10">
            <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4 px-3">Accounts</p>
            <div className="space-y-2">
              <NavButton id="profile" label="Settings" />
              <NavButton id="about-us" label="About Us" />
            </div>
          </div>
        </nav>

        <div className="p-5">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 shadow-lg shadow-red-500/20 transition-all active:scale-95"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT */}
      <main className="flex-1 ml-64 flex flex-col h-full overflow-y-auto scrollbar-hide p-8 relative">
        <div className="w-full max-w-6xl mx-auto">
          
          {/* Custom Gradient Storage Bar */}
          {activeTab === "my-files" && (
            <div className="mb-10 max-w-3xl mx-auto">
              <div className="w-full h-3.5 bg-slate-200/70 rounded-full overflow-hidden shadow-inner relative">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-1000 ease-out relative"
                  style={{ width: `${storagePercentage}%` }}
                >
                  <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/30 animate-pulse"></div>
                </div>
              </div>
              <div className="flex justify-center mt-3 text-sm font-bold text-slate-600">
                Storage Usage: <span className="text-slate-900 ml-2">{formatBytesToMB(storageUsed)} MB</span> <span className="text-slate-400 mx-1">/</span> {formatBytesToMB(storageLimit)} MB
              </div>
            </div>
          )}

          {/* Dynamic Content Rendering */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Added onDataChange right here below 👇 */}
            {activeTab === "my-files" && (
              <FileList 
                refreshKey={refreshKey} 
                onDataChange={() => setRefreshKey(prev => prev + 1)} 
              />
            )}
            {activeTab === "pending-shares" && <PendingShares refreshKey={refreshKey} />}
            {activeTab === "shared-with-me" && <SharedFilesReceived refreshKey={refreshKey} />}
            {activeTab === "connections" && <ConnectionsManager />}
            {activeTab === "profile" && <ProfileSettings />}
            {activeTab === "about-us" && (
              <div className="p-10 bg-white rounded-3xl shadow-sm border border-slate-100">
                <h2 className="text-3xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">About DeCen Drive</h2>
                <p className="text-slate-600 text-lg leading-relaxed">This is a decentralized storage system built on Web3 technologies, designed to give you absolute control and privacy over your data...</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}