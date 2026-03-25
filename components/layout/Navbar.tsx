"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  connectWallet,
  signLogin,
  clearCachedLoginSignature,
} from "@/lib/wallet";
import { getWallet, setWallet, logout } from "@/lib/auth";
import { clearEncryptionKey } from "@/lib/crypto";

export default function Navbar() {
  const router = useRouter();
  const [account, setAccount] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const saved = getWallet();
    if (saved) setAccount(saved);
  }, []);

  const handleConnect = async () => {
    if (connecting) return;

    setConnecting(true);
    try {
      const address = await connectWallet();
      await signLogin();
      setWallet(address);
      setAccount(address);
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to connect wallet right now. Please try again.";
      alert(message);
    } finally {
      setConnecting(false);
    }
  };

  const handleLogout = () => {
    logout();
    clearCachedLoginSignature();
    clearEncryptionKey();
    setAccount(null);
    router.push("/");
  };

  return (
    <header className="border-b border-slate-200/70 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold text-slate-900">
          Decentralized Drive
        </Link>

        {account ? (
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700">
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>
            <button
              onClick={handleLogout}
              className="rounded-full bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-800"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            {connecting ? "Connecting..." : "Connect Wallet"}
          </button>
        )}
      </div>
    </header>
  );
}
