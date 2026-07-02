
export default function UserFilmLoading() {
  return (
    <>
      <main className="min-h-screen bg-cinema-black pb-16 safe-top-offset">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
          <div className="h-4 w-32 animate-pulse rounded bg-white/10" />

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,280px)_1fr] lg:gap-12">
            <div className="aspect-[2/3] w-full max-w-[280px] animate-pulse rounded-2xl bg-white/10" />
            <div className="min-w-0 space-y-4">
              <div className="h-10 w-3/4 max-w-md animate-pulse rounded bg-white/10" />
              <div className="flex gap-2">
                <div className="h-6 w-20 animate-pulse rounded-full bg-white/10" />
                <div className="h-6 w-24 animate-pulse rounded-full bg-white/10" />
              </div>
              <div className="h-4 w-full animate-pulse rounded bg-white/10" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-white/10" />
            </div>
          </div>

          <div className="mt-10 aspect-video w-full animate-pulse rounded-2xl bg-white/10" />
        </div>
      </main>
    </>
  );
}
