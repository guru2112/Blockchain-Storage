"use client";
import { useState, useEffect } from "react";
import { setUsername, getUsername } from "@/lib/blockchain";
import { getWallet } from "@/lib/utils/auth";

export default function ProfileSettings() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchName = async () => {
      const wallet = getWallet();
      if (wallet) {
        const currentName = await getUsername(wallet);
        setName(currentName);
      }
      setFetching(false);
    };
    fetchName();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await setUsername(name);
      alert("Username updated successfully!");
    } catch (error) {
      alert("Failed to update username.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="text-sm">Loading profile...</div>;

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm dark:bg-zinc-900 dark:border-zinc-800 mb-6 max-w-md">
      <h2 className="text-lg font-semibold mb-2 dark:text-white">Profile Settings</h2>
      <label className="block text-sm text-slate-600 dark:text-zinc-400 mb-2">Set Username</label>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter username"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 px-3 py-2 border rounded dark:bg-black dark:border-zinc-700 dark:text-white"
        />
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}