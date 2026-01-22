export default function PhaseCompletionModal({ phase, onContinue }) {
  if (!phase) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-8 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-gold-500/60 bg-[rgb(var(--color-surface))] p-8 text-center text-gray-100 shadow-2xl">
        <div className="pointer-events-none absolute inset-0 shimmer-layer" />
        <div className="relative mx-auto flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border border-gold-500/40 bg-slate-900/40">
          <img
            src={phase.badge}
            alt={phase.title}
            className="h-full w-full rounded-full object-cover"
            style={{
              filter: "drop-shadow(0 0 10px rgba(234, 179, 8, 0.5))"
            }}
          />
        </div>
        <h2 className="mt-4 text-2xl font-semibold text-gold-500">
          {phase.title}
        </h2>
        <p className="mt-3 text-sm text-gray-300">{phase.message}</p>
        <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm text-gray-200">
          {phase.next}
        </div>
        <button
          onClick={onContinue}
          className="mt-6 w-full rounded-xl bg-gold-500 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-gold-400"
        >
          Continue to Next Phase
        </button>
      </div>
    </div>
  );
}
