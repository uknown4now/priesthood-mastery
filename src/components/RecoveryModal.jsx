function CompassIcon() {
  return (
    <svg className="h-6 w-6 text-gold-500" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M9.5 14.5 11 9l5.5-1.5L15 13l-5.5 1.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function RecoveryModal({
  type,
  name,
  missedDays,
  onCatchUp,
  onResume,
  onRestart,
  onClose
}) {
  const isCatchUp = type === "catchup";
  const isRecenter = type === "recenter";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-gold-500/40 bg-[rgb(var(--color-surface))] p-6 text-gray-100 shadow-2xl">
        <div className="flex items-center gap-2 text-gold-500">
          <CompassIcon />
          <p className="text-xs uppercase tracking-[0.25em]">
            Gentle Nudge
          </p>
        </div>
        <h2 className="mt-3 text-xl font-semibold text-white">
          {isCatchUp
            ? `Welcome back, ${name}. Ready to catch up?`
            : "Welcome back. Let's re-center."}
        </h2>
        <p className="mt-2 text-sm text-gray-300">
          {isCatchUp
            ? "You can review what you missed or resume today with grace."
            : "Even after time away, your stewardship resumes with hope and renewal."}
        </p>

        {isCatchUp && (
          <div className="mt-4 max-h-48 overflow-y-auto rounded-2xl border border-white/10 bg-slate-900/40 p-3 text-sm text-gray-200">
            {missedDays?.length ? (
              missedDays.map((day) => (
                <div key={day.id} className="py-1">
                  <strong>Day {day.id}:</strong> {day.scripture}
                </div>
              ))
            ) : (
              <p className="text-gray-400">
                No missed entries to review. You are current.
              </p>
            )}
          </div>
        )}

        {isRecenter && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/40 p-4 text-sm text-gray-200">
            "Return unto me, and I will return unto you." — Malachi 3:7
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2">
          {isCatchUp && (
            <>
              <button
                onClick={onCatchUp}
                className="w-full rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold text-gray-100 transition hover:border-gold-500/60"
              >
                Catch Up
              </button>
              <button
                onClick={onResume}
                className="w-full rounded-xl bg-gold-500 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-gold-400"
              >
                Resume Today
              </button>
            </>
          )}
          {isRecenter && (
            <button
              onClick={onRestart}
              className="w-full rounded-xl bg-gold-500 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-gold-400"
            >
              Restart My Commitment
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full rounded-xl border border-white/20 px-4 py-2 text-xs text-gray-200 transition hover:border-gold-500/60"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
