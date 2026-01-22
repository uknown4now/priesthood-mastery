export default function PhaseReviewModal({
  phase,
  manualCount,
  total,
  excusedDays,
  onReview,
  onProceed
}) {
  if (!phase) return null;
  const missingCount = Math.max(0, total - manualCount);
  const isStruggle = manualCount < Math.min(5, total);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-gold-500/40 bg-[rgb(var(--color-surface))] p-6 text-gray-100 shadow-2xl">
        <p className="text-xs uppercase tracking-[0.25em] text-gold-500">
          Review & Repair
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          {phase.title}
        </h2>
        <p className="mt-2 text-sm text-gray-300">
          You have reached the end of this phase with {missingCount} excused
          day{missingCount === 1 ? "" : "s"}.
        </p>
        <p className="mt-2 text-sm text-gray-300">
          {isStruggle
            ? "To get the most out of the next phase, we recommend completing at least 5 days first."
            : "Would you like to review them now to earn your Gold badge, or move forward with Silver?"}
        </p>

        <div className="mt-4 max-h-48 overflow-y-auto rounded-2xl border border-white/10 bg-slate-900/40 p-3 text-sm text-gray-200">
          {(excusedDays || []).length ? (
            excusedDays.map((day) => (
              <div key={day} className="py-1">
                <strong>Day {day}</strong>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No excused days detected.</p>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={onReview}
            className="w-full rounded-xl bg-gold-500 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-gold-400"
          >
            Review Missed Days
          </button>
          <button
            onClick={onProceed}
            className="w-full rounded-xl border border-white/20 px-4 py-2 text-xs text-gray-200 transition hover:border-gold-500/60"
          >
            Proceed to Next Phase (Silver)
          </button>
        </div>
      </div>
    </div>
  );
}
