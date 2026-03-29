"use client";

import { useState, useEffect } from "react";
import { getConnections, sharePendingFileWith } from "@/lib/blockchain";

export default function ShareFileDialog({ fileIndex }: { fileIndex: number }) {
  const [connections, setConnections] = useState<string[]>([]);
  const [selectedConnection, setSelectedConnection] = useState("");

  useEffect(() => {
    const fetchConnections = async () => {
      const conns = await getConnections();
      setConnections(conns);
      if (conns.length > 0) setSelectedConnection(conns[0]);
    };
    fetchConnections();
  }, []);

  const handleShare = async () => {
    if (!selectedConnection) return;
    await sharePendingFileWith(selectedConnection, fileIndex);
    alert("Share request sent!");
  };

  return (
    <div className="mt-4 flex flex-col gap-2 p-4 border rounded dark:border-zinc-800">
      <h3 className="font-semibold">Share with Connection</h3>
      {connections.length === 0 ? (
        <p className="text-sm text-red-500">You must add connections first.</p>
      ) : (
        <div className="flex gap-2">
          <select 
            value={selectedConnection}
            onChange={(e) => setSelectedConnection(e.target.value)}
            className="flex-1 p-2 border rounded dark:bg-zinc-900 dark:border-zinc-700"
          >
            {connections.map((conn) => (
              <option key={conn} value={conn}>
                {conn.substring(0, 6)}...{conn.substring(conn.length - 4)}
              </option>
            ))}
          </select>
          <button 
            onClick={handleShare}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Share
          </button>
        </div>
      )}
    </div>
  );
}