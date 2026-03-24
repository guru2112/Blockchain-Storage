"use client";

import { useState } from "react";
import { connectWallet } from "@/lib/wallet";

export default function Navbar() {
  const [account, setAccount] = useState<string | null>(null);

  const handleConnect = async () => {
    const acc = await connectWallet();
    setAccount(acc);
  };

  return (
    <header className="sticky top-0 z-20 border-b border-white/60 bg-white/80 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="pill flex h-10 w-10 items-center justify-center rounded-2xl text-lg font-semibold shadow-md">
            D
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-slate-800">
              Decentralized Drive
            </p>
            <p className="text-xs text-slate-500">IPFS + blockchain storage</p>
          </div>
        </div>

        <button
          onClick={handleConnect}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700 hover:shadow-lg active:translate-y-0"
        >
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]" />
          {account
            ? `${account.slice(0, 6)}...${account.slice(-4)}`
            : "Connect Wallet"}
        </button>
      </div>
    </header>
  );
}
