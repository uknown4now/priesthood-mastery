import { useState } from "react";

export default function DebugMenu({
  onSetDay,
  onToggleOrder,
  onReset
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-20 right-4 z-50">
      {open && (
        <div className="mb-2 w-56 rounded-2xl border border-white/20 bg-[rgba(var(--color-surface),0.95)] p-3 text-xs text-gray-200 shadow-xl">
          <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">
            Debug Mode
          </p>
          <div className="mt-2 grid gap-2">
            {[1, 7, 36, 120].map((day) => (
              <button
                key={day}
                onClick={() => onSetDay(day)}
                className="rounded-lg border border-white/10 bg-[rgba(var(--color-surface),0.8)] px-3 py-2 text-left text-xs font-semibold text-gray-100 hover:border-gold-500/60"
              >
                Set Day {day}
              </button>
            ))}
            <button
              onClick={onToggleOrder}
              className="rounded-lg border border-white/10 bg-[rgba(var(--color-surface),0.8)] px-3 py-2 text-left text-xs font-semibold text-gray-100 hover:border-gold-500/60"
            >
              Toggle Priesthood Order
            </button>
            <button
              onClick={onReset}
              className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-left text-xs font-semibold text-red-200 hover:border-red-500"
            >
              Reset All Progress
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-full border border-gold-500/40 bg-gold-500/10 px-3 py-2 text-xs font-semibold text-gold-500"
      >
        Debug
      </button>
    </div>
  );
}
