import { Header } from "@/components/Header";

export default function MonEspaceLoading() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-cinema-black pb-20">
        <section className="mon-espace-hero safe-top-offset">
          <div className="mon-espace-hero__ambient" aria-hidden>
            <div className="mon-espace-hero__glow mon-espace-hero__glow--gold" />
            <div className="mon-espace-hero__glow mon-espace-hero__glow--violet" />
          </div>
          <div className="mon-espace-hero__shell mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
            <div className="h-4 w-28 animate-pulse rounded bg-white/10" />
            <div className="mt-8 space-y-3">
              <div className="h-10 w-64 max-w-full animate-pulse rounded bg-white/10" />
              <div className="h-5 w-96 max-w-full animate-pulse rounded bg-white/10" />
            </div>
          </div>
        </section>

        <div className="mon-espace-content mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
          <div className="mt-2 grid gap-6 sm:mt-4 lg:grid-cols-[220px_1fr] lg:gap-10">
            <div className="hidden space-y-2 lg:block">
              <div className="h-10 animate-pulse rounded-xl bg-white/10" />
              <div className="h-10 animate-pulse rounded-xl bg-white/10" />
              <div className="h-10 animate-pulse rounded-xl bg-white/10" />
            </div>
            <div className="min-w-0 space-y-4">
              <div className="h-8 w-48 animate-pulse rounded bg-white/10" />
              <div className="h-4 w-full max-w-md animate-pulse rounded bg-white/10" />
              <div className="mt-6 h-40 animate-pulse rounded-2xl bg-white/10" />
              <div className="h-40 animate-pulse rounded-2xl bg-white/10" />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
