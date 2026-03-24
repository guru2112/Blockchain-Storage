"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getWallet } from "@/lib/auth";
import Upload from "@/components/Upload";
import FileList from "@/components/FileList";

export default function UploadPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Upload onUploadSuccess={() => setRefreshKey((prev) => prev + 1)} />
        <FileList refreshKey={refreshKey} />
      </div>
    </main>
  );
}
