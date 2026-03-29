import Link from "next/link";

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-200/60 blur-3xl" />
        <div className="absolute top-32 -right-10 h-96 w-96 rounded-full bg-indigo-200/60 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-64 w-64 rounded-full bg-emerald-200/60 blur-3xl" />
      </div>

      <section className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            Private, encrypted, and blockchain-owned
          </div>
          <h1 className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
            Decentralized file storage with wallet-based ownership.
          </h1>
          <p className="max-w-2xl text-base text-slate-600 md:text-lg">
            Store files on IPFS, encrypt them locally, and anchor metadata on-chain.
            Only your wallet can decrypt the data, and your files stay private even
            when shared.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Connect wallet
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
            >
              View dashboard
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Encrypted before upload",
              description:
                "Files are encrypted in your browser using a wallet-derived key.",
            },
            {
              title: "On-chain ownership",
              description:
                "Metadata is stored on a smart contract mapped to your wallet.",
            },
            {
              title: "Instant access",
              description:
                "Preview, download, and delete files with zero page refreshes.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-base font-semibold text-slate-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
