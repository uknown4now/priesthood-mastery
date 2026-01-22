export default function HigherPriesthoodModal({ onContinue }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-gold-500/40 bg-[rgb(var(--color-surface))] p-8 text-center text-gray-100 shadow-2xl">
        <h2 className="text-2xl font-semibold text-gold-500">
          Higher Priesthood Unlocked
        </h2>
        <p className="mt-3 text-sm text-gray-300">
          You have entered the Melchizedek path. Your service now carries a new
          mantle of responsibility and blessing.
        </p>
        <div className="mx-auto mt-6 h-16 w-16 rounded-full border border-gold-500/40 bg-gold-500/10 shadow-[0_0_25px_rgba(234,179,8,0.35)]" />
        <button
          onClick={onContinue}
          className="mt-6 w-full rounded-xl bg-gold-500 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-gold-400"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
