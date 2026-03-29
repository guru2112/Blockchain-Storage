"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteFromBlockchain,
  getFiles,
  getFolders,
  deleteFolder,
  StoredFile,
  StoredFolder,
  sharePendingFileWith,
  renameFile, 
  renameFolder
} from "@/lib/blockchain";
import { decryptSharedFile } from "@/lib/utils/crypto";
import ShareFileModal from "../modals/ShareFileModal";
import RenameModal from "../modals/RenameModal";
import CreateFolderModal from "../modals/CreateFolderModal";
import UploadFileModal from "../modals/UploadFileModal";

type FileListProps = {
  refreshKey?: string | number;
  onFolderChange?: (folderId: number) => void;
  onDataChange?: () => void; 
};

const IPFS_GATEWAY = "https://ipfs.io/ipfs";

type SortOption = "newest" | "oldest" | "alphabetical";

export default function FileList({ refreshKey, onFolderChange, onDataChange }: FileListProps) {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [folders, setFolders] = useState<StoredFolder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<number>(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionIndex, setActionIndex] = useState<number | null>(null);
  const [preview, setPreview] = useState<{ url: string; name: string } | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareFileIndex, setShareFileIndex] = useState<number | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);

  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{ id: number, name: string, type: "file" | "folder" } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [fileData, folderData] = await Promise.all([getFiles(), getFolders()]);
      setFiles(fileData);
      setFolders(folderData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load files.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  useEffect(() => {
    onFolderChange?.(currentFolderId);
  }, [currentFolderId, onFolderChange]);

  const fetchDecrypted = async (cid: string) => {
    const res = await fetch(`${IPFS_GATEWAY}/${cid}`);
    if (!res.ok) throw new Error("Failed to fetch file from IPFS.");
    const encrypted = await res.text();
    return decryptSharedFile(encrypted);
  };

  const handlePreview = async (file: StoredFile, index: number) => {
    setActionIndex(index);
    setError(null);
    try {
      const url = await fetchDecrypted(file.cid);
      setPreview({ url, name: file.filename });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to preview file.");
    } finally {
      setActionIndex(null);
    }
  };

  const handleDownload = async (file: StoredFile, index: number) => {
    setActionIndex(index);
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
      setActionIndex(null);
    }
  };

  const handleDelete = async (index: number) => {
    setActionIndex(index);
    setError(null);
    try {
      await deleteFromBlockchain(index);
      await fetchData();
      onDataChange?.(); 
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete file.");
    } finally {
      setActionIndex(null);
    }
  };

  const handleDeleteFolder = async (folderId: number) => {
    setError(null);
    try {
      await deleteFolder(folderId);
      await fetchData();
      onDataChange?.(); 
      if (currentFolderId === folderId) setCurrentFolderId(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete folder.");
    }
  };

  const executeRename = async (newName: string) => {
    if (!renameTarget) return;
    try {
      if (renameTarget.type === "folder") {
        await renameFolder(renameTarget.id, newName);
      } else {
        await renameFile(renameTarget.id, newName);
      }
      await fetchData();
    } catch (err) {
      console.error(err);
      throw new Error(`Failed to rename ${renameTarget.type}`);
    }
  };

  const currentFolderName = folders.find((f) => Number(f.id) === currentFolderId)?.name || "Root";
  
  // FILTERING
  const filesInCurrentFolder = files.filter(
    (f) => Number(f.folderId) === currentFolderId && f.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const foldersInCurrentFolder = folders.filter(
    (f) => Number(f.parentId) === currentFolderId && f.exists && Number(f.id) !== 0 && f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // SORTING LOGIC
  const sortedFolders = [...foldersInCurrentFolder].sort((a, b) => {
    if (sortBy === "alphabetical") return a.name.localeCompare(b.name);
    if (sortBy === "newest") return Number(b.id) - Number(a.id);
    if (sortBy === "oldest") return Number(a.id) - Number(b.id);
    return 0;
  });

  const sortedFiles = [...filesInCurrentFolder].sort((a, b) => {
    if (sortBy === "alphabetical") return a.filename.localeCompare(b.filename);
    if (sortBy === "newest") return Number(b.timestamp) - Number(a.timestamp);
    if (sortBy === "oldest") return Number(a.timestamp) - Number(b.timestamp);
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
            placeholder="Search files and folders..."
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
                <button 
                  onClick={() => { setSortBy("newest"); setShowSortMenu(false); }} 
                  className={`text-sm font-bold text-left px-3 py-2.5 rounded-lg transition-colors ${sortBy === "newest" ? "bg-blue-50 text-blue-600" : "text-slate-700 hover:bg-slate-50"}`}
                >
                  Newest First
                </button>
                <button 
                  onClick={() => { setSortBy("oldest"); setShowSortMenu(false); }} 
                  className={`text-sm font-bold text-left px-3 py-2.5 rounded-lg transition-colors ${sortBy === "oldest" ? "bg-blue-50 text-blue-600" : "text-slate-700 hover:bg-slate-50"}`}
                >
                  Oldest First
                </button>
                <button 
                  onClick={() => { setSortBy("alphabetical"); setShowSortMenu(false); }} 
                  className={`text-sm font-bold text-left px-3 py-2.5 rounded-lg transition-colors ${sortBy === "alphabetical" ? "bg-blue-50 text-blue-600" : "text-slate-700 hover:bg-slate-50"}`}
                >
                  Alphabetical (A-Z)
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={() => setShowCreateFolder(true)}
            className="h-[50px] px-6 bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200/50 rounded-2xl text-sm font-bold text-blue-900 hover:shadow-md hover:scale-[1.02] transition-all whitespace-nowrap"
          >
            + New Folder
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {currentFolderId !== 0 && (
            <button
              onClick={() => setCurrentFolderId(0)}
              className="text-sm font-bold text-slate-500 hover:text-slate-900 flex items-center gap-2 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200"
            >
              ← Back To Root
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-10">
        {currentFolderId !== 0 && (
          <div className="px-6 py-3 bg-white text-slate-800 font-bold rounded-xl shadow-sm border border-slate-200 truncate max-w-[250px]">
            <span className="text-xl mr-2">📂</span> {currentFolderName}
          </div>
        )}
        
        <button
          className="px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all active:scale-95"
          onClick={() => setShowUploadModal(true)}
        >
          Upload File
        </button>
      </div>

      {error && (
        <p className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600 shadow-sm">
          {error}
        </p>
      )}

      {/* Folders */}
      {sortedFolders.length > 0 && (
        <div className="mb-10">
          <div className="flex flex-wrap gap-5">
            {sortedFolders.map((folder) => (
              <div
                key={`${folder.id}-${folder.name}`}
                className="group relative flex items-center justify-between w-56 px-5 py-4 bg-gradient-to-r from-[#d1fae5] to-[#dbeafe] rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer border border-white/50"
                onClick={() => {
                  setCurrentFolderId(Number(folder.id));
                }}
              >
                <div className="flex items-center gap-3 truncate">
                  <span className="text-2xl drop-shadow-sm">📁</span>
                  <span className="font-bold text-sm text-slate-800 truncate">{folder.name}</span>
                </div>
                
                <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 flex flex-col gap-1 bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-xl shadow-xl p-1.5 z-10 transition-all scale-95 group-hover:scale-100 origin-top-right">
                  <button
                    onClick={(e) => { e.stopPropagation(); setRenameTarget({ id: Number(folder.id), name: folder.name, type: "folder" }); setRenameModalOpen(true); }}
                    className="text-[11px] text-left px-3 py-1.5 hover:bg-slate-100 rounded-lg text-slate-700 font-bold transition-colors"
                  >
                    Rename
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteFolder(Number(folder.id)); }}
                    className="text-[11px] text-left px-3 py-1.5 hover:bg-red-50 rounded-lg text-red-600 font-bold transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files */}
      {sortedFiles.length === 0 && sortedFolders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-300/50 rounded-3xl bg-white/50">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
             <span className="text-3xl">📭</span>
          </div>
          <p className="text-slate-500 font-bold text-lg">
            {currentFolderId === 0 ? "Your drive is empty." : "This folder is empty."}
          </p>
          <p className="text-slate-400 text-sm mt-1">Upload a file to get started.</p>
        </div>
      ) : (
        sortedFiles.length > 0 && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedFiles.map((file) => {
                const globalFileIndex = files.indexOf(file);
                const isBusy = actionIndex === globalFileIndex;
                const date = new Date(Number(file.timestamp) * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

                return (
                  <div
                    key={file.cid}
                    className="group flex flex-col justify-between bg-white rounded-3xl border border-slate-200/60 p-5 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all relative"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <p className="font-extrabold text-sm text-slate-800 truncate pr-6 leading-tight" title={file.filename}>
                          {file.filename}
                        </p>
                        <div className="group/menu relative">
                          <button className="text-slate-400 hover:text-slate-800 font-black text-xl leading-none px-1 transition-colors">⋮</button>
                          
                          <div className="absolute right-0 top-6 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible flex flex-col gap-1.5 bg-white border border-slate-100 rounded-xl shadow-2xl p-2 z-20 transition-all w-36 scale-95 group-hover/menu:scale-100 origin-top-right">
                            <button onClick={() => handlePreview(file, globalFileIndex)} disabled={isBusy} className="text-sm font-bold text-left px-4 py-2.5 hover:bg-slate-50 rounded-lg text-slate-700 transition-colors">Preview</button>
                            <button onClick={() => handleDownload(file, globalFileIndex)} disabled={isBusy} className="text-sm font-bold text-left px-4 py-2.5 hover:bg-slate-50 rounded-lg text-slate-700 transition-colors">Download</button>
                            <button onClick={() => { setShareFileIndex(globalFileIndex); setShareModalOpen(true); }} disabled={isBusy} className="text-sm font-bold text-left px-4 py-2.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">Share</button>
                            <button onClick={() => { setRenameTarget({ id: globalFileIndex, name: file.filename, type: "file" }); setRenameModalOpen(true); }} disabled={isBusy} className="text-sm font-bold text-left px-4 py-2.5 hover:bg-slate-50 rounded-lg text-slate-700 transition-colors">Rename</button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-xs">📄</div>
                        <p className="text-xs font-semibold text-slate-400">
                          {date}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      )}

      {/* Modals */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md">
          <div className="w-full max-w-4xl rounded-3xl bg-white p-5 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
              <div>
                <p className="text-sm font-black text-slate-900">Preview</p>
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
      
      <ShareFileModal
        isOpen={shareModalOpen}
        onClose={() => { setShareModalOpen(false); setShareFileIndex(null); }}
        onShare={async (recipientAddress: string) => {
          if (shareFileIndex === null) return;
          setError(null);
          try {
            const file = files[shareFileIndex];
            if (!file) throw new Error("File not found.");
            await sharePendingFileWith(recipientAddress, shareFileIndex);
            setShareModalOpen(false);
            setShareFileIndex(null);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to share file.");
          }
        }}
      />

      {renameTarget && (
        <RenameModal
          isOpen={renameModalOpen}
          onClose={() => { setRenameModalOpen(false); setRenameTarget(null); }}
          onRename={executeRename}
          currentName={renameTarget.name}
          type={renameTarget.type}
        />
      )}

      <CreateFolderModal
        isOpen={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        parentId={currentFolderId} 
        onSuccess={() => {
          fetchData();
          setShowCreateFolder(false);
        }}
      />

      <UploadFileModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        folderId={currentFolderId}
        onSuccess={() => {
          fetchData();
          onDataChange?.();
        }}
      />
    </div>
  );
}