export default function RootLoading() {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden bg-white/5"
      aria-hidden
    >
      <div className="h-full w-1/3 animate-pulse bg-gold-light/80" />
    </div>
  );
}
