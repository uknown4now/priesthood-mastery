const CONFETTI_COUNT = 36;
const CONFETTI_COLORS = ["#EAB308", "#F8FAFC", "#FDE68A", "#FFF7ED"];

export default function MasteryCelebrationModal({
  monthLabel = "Month 1",
  badgeImageUrl,
  message,
  onContinue
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-8 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[rgb(var(--color-surface))] p-8 text-center text-gray-100 shadow-2xl">
        <div className="confetti-layer pointer-events-none absolute inset-0 overflow-hidden">
          {Array.from({ length: CONFETTI_COUNT }).map((_, index) => {
            const left = `${(index / CONFETTI_COUNT) * 100}%`;
            const delay = `${(index % 9) * 0.12}s`;
            const duration = `${2.4 + (index % 5) * 0.4}s`;
            const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
            return (
              <span
                key={`confetti-${index}`}
                className="confetti-piece"
                style={{
                  left,
                  backgroundColor: color,
                  animationDelay: delay,
                  animationDuration: duration
                }}
              />
            );
          })}
        </div>

        <h2 className="text-2xl font-semibold text-gold-500">
          Mastery Unlocked!
        </h2>
        <div className="mx-auto mt-6 flex h-28 w-28 items-center justify-center rounded-full border border-gold-500/40 bg-gold-500/10 shadow-[0_0_25px_rgba(234,179,8,0.35)]">
          {badgeImageUrl ? (
            <img
              src={badgeImageUrl}
              alt="Priesthood mastery badge"
              className="h-20 w-20 object-contain"
            />
          ) : (
            <div className="text-sm text-gold-500">
              Add LDS badge URL
            </div>
          )}
        </div>
        <p className="mt-4 text-sm text-gray-200">
          {monthLabel} Completed.
        </p>
        <p className="mt-2 text-sm text-gray-400">
          {message ||
            "Your reflections are saved. Continue forward with confidence."}
        </p>
        <button
          onClick={onContinue}
          className="mt-6 w-full rounded-xl bg-gold-500 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-gold-400"
        >
          Continue My Path
        </button>
      </div>
    </div>
  );
}
