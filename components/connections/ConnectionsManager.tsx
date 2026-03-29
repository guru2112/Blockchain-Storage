"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getConnections,
  getPendingConnectionRequests,
  sendConnectionRequest,
  acceptConnectionRequest,
  ConnectionDetails
} from "@/lib/blockchain";

type SortOption = "newest" | "oldest" | "alphabetical";

export default function ConnectionsManager() {
  const [connections, setConnections] = useState<ConnectionDetails[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ConnectionDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Sorting State
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchNetworkData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [conns, pending] = await Promise.all([
        getConnections(),
        getPendingConnectionRequests()
      ]);
      setConnections(conns);
      setPendingRequests(pending);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load network data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNetworkData();
  }, [fetchNetworkData]);

  const handleSendRequest = async () => {
    if (!newAddress.trim() || newAddress.length !== 42 || !newAddress.startsWith("0x")) {
      setModalError("Please enter a valid Web3 wallet address (0x...).");
      return;
    }
    
    setIsSubmitting(true);
    setModalError(null);
    try {
      await sendConnectionRequest(newAddress.trim());
      setIsModalOpen(false);
      setNewAddress("");
      await fetchNetworkData();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : "Failed to send request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptRequest = async (address: string) => {
    setError(null);
    try {
      await acceptConnectionRequest(address);
      await fetchNetworkData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept request.");
    }
  };

  // FILTERING
  const filteredConnections = connections.filter(
    (conn) =>
      conn.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conn.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // SORTING
  const sortedConnections = [...filteredConnections].sort((a, b) => {
    if (sortBy === "alphabetical") return a.username.localeCompare(b.username);
    // Blockchain returns array in order of connection. Last = Newest.
    if (sortBy === "newest") return connections.indexOf(b) - connections.indexOf(a); 
    if (sortBy === "oldest") return connections.indexOf(a) - connections.indexOf(b);
    return 0;
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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <input
            type="text"
            placeholder="Search connections by name or address..."
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
            onClick={() => setIsModalOpen(true)}
            className="h-[50px] px-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all whitespace-nowrap active:scale-95"
          >
            Connect
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600 shadow-sm">
          {error}
        </p>
      )}

      {/* PENDING REQUESTS SECTION */}
      {pendingRequests.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
            Pending Requests 
            <span className="bg-rose-100 text-rose-600 py-0.5 px-2.5 rounded-full text-xs font-bold">
              {pendingRequests.length}
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pendingRequests.map((req) => (
              <div key={req.address} className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold shadow-inner">
                    {req.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-800">{req.username}</p>
                    <p className="text-[10px] font-mono text-slate-400">{req.address.slice(0, 6)}...{req.address.slice(-4)}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleAcceptRequest(req.address)}
                  className="px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Accept
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MY CONNECTIONS SECTION */}
      <div className="mb-6 border-t border-slate-200/60 pt-8">
        <h2 className="text-2xl font-black text-slate-800">My Network</h2>
        <p className="text-sm font-medium text-slate-500 mt-1">Friends and colleagues you can share encrypted files with.</p>
      </div>

      {sortedConnections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-300/50 rounded-3xl bg-white/50">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
             <span className="text-3xl">👥</span>
          </div>
          <p className="text-slate-500 font-bold text-lg">No connections found.</p>
          <p className="text-slate-400 text-sm mt-1">Try a different search or click "Connect" to add a friend.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {sortedConnections.map((conn) => (
            <div
              key={conn.address}
              className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all flex flex-col items-center text-center group"
            >
              <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-blue-500/20 mb-4 group-hover:scale-105 transition-transform">
                {conn.username.charAt(0).toUpperCase()}
              </div>
              <h3 className="font-bold text-slate-800 text-lg w-full truncate px-2">{conn.username}</h3>
              <p className="text-xs font-mono text-slate-400 bg-slate-50 px-3 py-1 rounded-lg mt-2 w-full truncate">
                {conn.address.slice(0, 8)}...{conn.address.slice(-6)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* CONNECT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl relative border border-white/20">
            <button 
              onClick={() => {
                setIsModalOpen(false);
                setModalError(null);
                setNewAddress("");
              }} 
              className="absolute top-5 right-5 h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors font-bold"
            >
              ✕
            </button>
            
            <div className="text-center mb-8 mt-2">
              <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🔗</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">Connect Friends</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Enter their wallet address to send a request.</p>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input
                type="text"
                value={newAddress}
                onChange={(e) => {
                  setNewAddress(e.target.value);
                  setModalError(null);
                }}
                placeholder="0x..."
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400 text-slate-800"
              />
            </div>

            {modalError && (
              <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 text-center">
                {modalError}
              </p>
            )}

            <button
              onClick={handleSendRequest}
              disabled={isSubmitting || !newAddress.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-500/20 hover:shadow-green-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? "Sending..." : "Send Request"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}