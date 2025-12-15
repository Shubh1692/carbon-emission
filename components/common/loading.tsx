export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1220] px-4">
      {/* subtle glow */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.25),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(59,130,246,0.18),transparent_45%),radial-gradient(circle_at_50%_80%,rgba(168,85,247,0.12),transparent_45%)]" />

      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-6">
        <div className="flex items-center gap-3">
          {/* spinner */}
          <div className="h-10 w-10 rounded-full border-4 border-white/10 border-t-teal-400 animate-spin" />

          <div className="flex-1">
            <div className="text-base font-semibold text-white">
              Loading…
            </div>
            <div className="text-sm text-white/60">
              Fetching details, please wait
            </div>
          </div>
        </div>

        {/* skeleton */}
        <div className="mt-6 space-y-3 animate-pulse">
          <div className="h-4 w-3/4 rounded bg-white/10" />
          <div className="h-4 w-2/3 rounded bg-white/10" />
          <div className="h-10 w-full rounded-xl bg-white/10" />
        </div>

        <div className="mt-6 text-xs text-white/40">
          If it takes too long, refresh the page.
        </div>
      </div>
    </div>
  );
}
