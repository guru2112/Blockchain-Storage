"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getConnections,
  getSharedFiles,
  StoredFile,
  ConnectionDetails
} from "@/lib/blockchain";
import { decryptSharedFile } from "@/lib/utils/crypto";

type SharedFilesReceivedProps = {
  refreshKey?: string | number;
};

type GroupedSharedFiles = {
  sender: ConnectionDetails;
  files: StoredFile[];
};

const IPFS_GATEWAY = "https://ipfs.io/ipfs";

type SortOption = "newest" | "oldest" | "alphabetical";

export default function SharedFilesReceived({ refreshKey }: SharedFilesReceivedProps) {
  const [groupedData, setGroupedData] = useState<GroupedSharedFiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [actionFile, setActionFile] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ url: string; name: string } | null>(null);

  // Sorting State
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);

  const fetchSharedData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const connections = await getConnections();
      const data: GroupedSharedFiles[] = [];
      for (const conn of connections) {
        const files = await getSharedFiles(conn.address);
        if (files && files.length > 0) {
          data.push({ sender: conn, files });
        }
      }
      setGroupedData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load shared files.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSharedData();
  }, [fetchSharedData, refreshKey]);

  const fetchDecrypted = async (cid: string) => {
    const res = await fetch(`${IPFS_GATEWAY}/${cid}`);
    if (!res.ok) throw new Error("Failed to fetch file from IPFS.");
    const encrypted = await res.text();
    return decryptSharedFile(encrypted);
  };

  const handlePreview = async (file: StoredFile) => {
    setActionFile(file.cid);
    setError(null);
    try {
      const url = await fetchDecrypted(file.cid);
      setPreview({ url, name: file.filename });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to preview file.");
    } finally {
      setActionFile(null);
    }
  };

  const handleDownload = async (file: StoredFile) => {
    setActionFile(file.cid);
    setError(null);
    try {
      const url = await fetchDecrypted(file.cid);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to download file.");
    } finally {
      setActionFile(null);
    }
  };

  // FILTERING
  const filteredData = groupedData.map(group => ({
    ...group,
    files: group.files.filter(f => 
      f.filename.toLowerCase().includes(searchQuery.toLowerCase()) || 
      group.sender.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.files.length > 0);

  // SORTING LOGIC (Sorts both the Senders and the Files inside them)
  const sortedData = [...filteredData].map(group => {
    const sortedFiles = [...group.files].sort((a, b) => {
      if (sortBy === "alphabetical") return a.filename.localeCompare(b.filename);
      if (sortBy === "newest") return Number(b.timestamp) - Number(a.timestamp);
      if (sortBy === "oldest") return Number(a.timestamp) - Number(b.timestamp);
      return 0;
    });
    return { ...group, files: sortedFiles };
  }).sort((a, b) => {
    if (sortBy === "alphabetical") return a.sender.username.localeCompare(b.sender.username);
    
    // For newest/oldest, compare the most recent file in each group
    const aTime = Math.max(...a.files.map(f => Number(f.timestamp)));
    const bTime = Math.max(...b.files.map(f => Number(f.timestamp)));
    
    if (sortBy === "newest") return bTime - aTime;
    if (sortBy === "oldest") return aTime - bTime;
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
            placeholder="Search shared files or senders..."
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
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-800">Shared With Me</h2>
        <p className="text-sm font-medium text-slate-500 mt-1">Files your network has granted you access to (View Only).</p>
      </div>

      {error && (
        <p className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600 shadow-sm">
          {error}
        </p>
      )}

      {sortedData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-300/50 rounded-3xl bg-white/50">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
             <span className="text-3xl">🤝</span>
          </div>
          <p className="text-slate-500 font-bold text-lg">No shared files yet.</p>
          <p className="text-slate-400 text-sm mt-1">When friends share files with you, they'll appear here.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {sortedData.map((group) => (
            <div key={group.sender.address} className="bg-white/60 rounded-3xl border border-slate-200/60 p-6 shadow-sm">
              
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-500/20">
                  {group.sender.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg leading-tight">{group.sender.username}</h3>
                  <p className="text-xs font-mono text-slate-400">{group.sender.address.slice(0, 8)}...{group.sender.address.slice(-6)}</p>
                </div>
                <div className="ml-auto bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold">
                  {group.files.length} Files
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.files.map((file) => {
                  const isBusy = actionFile === file.cid;
                  const date = new Date(Number(file.timestamp) * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

                  return (
                    <div
                      key={file.cid}
                      className="group flex flex-col justify-between bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:-translate-y-1 transition-all relative"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <p className="font-extrabold text-sm text-slate-800 truncate pr-6 leading-tight" title={file.filename}>
                            {file.filename}
                          </p>
                          <div className="group/menu relative">
                            <button className="text-slate-400 hover:text-slate-800 font-black text-xl leading-none px-1 transition-colors">⋮</button>
                            
                            <div className="absolute right-0 top-6 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible flex flex-col gap-1 bg-white border border-slate-100 rounded-xl shadow-2xl p-1.5 z-20 transition-all w-32 scale-95 group-hover/menu:scale-100 origin-top-right">
                              <button onClick={() => handlePreview(file)} disabled={isBusy} className="text-xs font-bold text-left px-3 py-2 hover:bg-slate-50 rounded-lg text-slate-700 transition-colors">Preview</button>
                              <button onClick={() => handleDownload(file)} disabled={isBusy} className="text-xs font-bold text-left px-3 py-2 hover:bg-slate-50 rounded-lg text-slate-700 transition-colors">Download</button>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                          <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs">🔗</div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Shared On</p>
                            <p className="text-xs font-bold text-slate-600 leading-none">
                              {date}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md">
          <div className="w-full max-w-4xl rounded-3xl bg-white p-5 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
              <div>
                <p className="text-sm font-black text-slate-900">Preview Shared File</p>
                <p className="text-xs font-semibold text-slate-500">{preview.name}</p>
              </div>
              <button
                onClick={() => setPreview(null)}
                className="rounded-full bg-slate-100 hover:bg-slate-200 px-5 py-2 text-xs font-bold text-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
            <div className="h-[70vh] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <iframe title="File preview" src={preview.url} className="h-full w-full" />
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}