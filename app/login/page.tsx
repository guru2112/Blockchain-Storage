"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { connectWallet, signLogin } from "@/lib/wallet";
import { getWallet, setWallet } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = getWallet();
    if (stored) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleLogin = async () => {
    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      const address = await connectWallet();
      await signLogin();
      setWallet(address);
      router.replace("/dashboard");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to connect wallet right now."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Connect your wallet
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign a message to start your encrypted session.
        </p>
        {error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="mt-6 w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loading ? "Connecting..." : "Connect Wallet"}
        </button>
      </div>
    </div>
  );
}

