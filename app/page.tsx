import Navbar from "@/components/Navbar";
import Upload from "@/components/Upload";
import FileList from "@/components/FileList";

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-200/60 blur-3xl" />
        <div className="absolute top-32 -right-10 h-96 w-96 rounded-full bg-indigo-200/60 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-64 w-64 rounded-full bg-emerald-200/60 blur-3xl" />
      </div>

      <Navbar />

      <main className="max-w-6xl mx-auto px-4 pb-16">
        <section className="mt-10 space-y-5 text-center md:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            Decentralized & secure
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
              Decentralized storage, beautifully simple.
            </h1>
            <p className="mx-auto max-w-3xl text-base text-slate-600 md:text-lg">
              Upload once, anchor to the blockchain, and retrieve from IPFS anytime.
              Keep your files tamper-proof with a frictionless experience.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
            <a
              href="#upload"
              className="pill inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-lg transition hover:brightness-110"
            >
              Start uploading
              <span aria-hidden className="text-lg">
                ↗
              </span>
            </a>
            <a
              href="#files"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
            >
              View your uploads
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-slate-600 md:justify-start">
            <div className="rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
              IPFS-powered availability
            </div>
            <div className="rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
              On-chain audit trail
            </div>
            <div className="rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
              No compromise on UX
            </div>
          </div>
        </section>

        <section
          id="upload"
          className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_1.15fr] xl:grid-cols-[1fr_1.2fr]"
        >
          <Upload />
          <div id="files" className="lg:col-span-1 xl:col-span-1">
            <FileList />
          </div>
        </section>
      </main>
    </div>
  );
}
