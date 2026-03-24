"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getWallet } from "@/lib/auth";
import FileList from "@/components/FileList";

export default function Dashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const wallet = getWallet();

    if (!wallet) {
      router.push("/login");
      return;
    }

    setReady(true);
  }, [router, getWallet]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-sm text-slate-600">Checking your session...</p>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Your dashboard
          </h1>
          <p className="text-sm text-slate-600">
            Manage encrypted files tied to your wallet.
          </p>
        </div>
        <Link
          href="/upload"
          className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Upload file
        </Link>
      </div>

      <FileList />
    </main>
  );
}
