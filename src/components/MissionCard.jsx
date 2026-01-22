import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

export default function MissionCard({
  userName,
  offices,
  selectedOffice,
  onSelectOffice,
  activeMission,
  activeDay,
  missionOpen,
  onOpenMission,
  missionCompleted,
  onCompleteMission,
  getReflection,
  saveReflection
}) {
  const officeEntries = Object.entries(offices);
  const officeLabel = selectedOffice
    ? selectedOffice.charAt(0).toUpperCase() + selectedOffice.slice(1)
    : "New";
  const currentDay = activeDay || 1;
  const [showReflection, setShowReflection] = useState(false);
  const [reflectionText, setReflectionText] = useState("");
  const [savedReflection, setSavedReflection] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [resourceRead, setResourceRead] = useState(false);

  const existingReflection = useMemo(
    () => (getReflection ? getReflection(currentDay) : ""),
    [currentDay, getReflection]
  );

  useEffect(() => {
    if (existingReflection) {
      setSavedReflection(existingReflection);
      setReflectionText(existingReflection);
    }
    setResourceRead(false);
  }, [existingReflection]);

  return (
    <section className="mb-6 rounded-2xl border border-white/20 bg-[rgba(var(--color-surface),0.8)] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gold-500">
            Daily Mission
          </p>
          <h2 className="mt-2 text-lg font-semibold text-white">
            {activeMission ? activeMission.title : "Choose Your Office"}
          </h2>
          <p className="mt-2 text-sm text-gray-300">
            {activeMission
              ? activeMission.message
              : "Select your priesthood office to begin your Path."}
          </p>
        </div>
        <span className="rounded-full bg-gold-500/20 px-3 py-1 text-xs font-semibold text-gold-500">
          {officeLabel}
        </span>
      </div>
      {!selectedOffice ? (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {officeEntries.map(([key]) => (
            <button
              key={key}
              onClick={() => onSelectOffice(key)}
              className="rounded-xl border border-white/10 bg-[rgba(var(--color-surface),0.8)] px-3 py-3 text-sm font-semibold text-gray-100 transition hover:border-gold-500/60 hover:bg-gold-500/10"
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      ) : (
        <button
          onClick={onOpenMission}
          className="mt-4 w-full rounded-xl bg-gold-500 px-4 py-3 text-sm font-semibold text-slate-900 shadow-md shadow-gold-500/30 transition hover:bg-gold-400"
        >
          Begin Mission
        </button>
      )}
      {missionOpen && activeMission && (
        <div className="mt-5 space-y-4 rounded-2xl border border-white/10 bg-[rgba(var(--color-surface),0.8)] p-4">
          <div className="flex items-center justify-between text-xs text-gray-300">
            <span className="uppercase tracking-[0.2em] text-gold-500">
              Day {currentDay}
            </span>
            <a
              href={activeMission.url}
              target="_blank"
              rel="noreferrer"
              className="text-gold-500 hover:text-gold-400"
            >
              {activeMission.scripture}
            </a>
          </div>
          <div className="space-y-3 text-sm text-gray-200">
            <p>{activeMission.message}</p>
            <p>{activeMission.challenge}</p>
          </div>
          <button
            onClick={() => {
              window.open(activeMission.url, "_blank", "noreferrer");
              setResourceRead(true);
            }}
            className="w-full rounded-xl border border-gold-500/40 bg-gold-500/10 px-4 py-3 text-sm font-semibold text-gold-500 transition hover:border-gold-500 hover:bg-gold-500/20"
          >
            {`Read ${activeMission.scripture || "todays resource"}`}
          </button>
          <button
            onClick={() => {
              onCompleteMission();
              setShowReflection(true);
            }}
            disabled={!!savedReflection || !resourceRead}
            className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
              savedReflection || !resourceRead
                ? "cursor-not-allowed bg-white/10 text-gray-400"
                : "bg-gold-500 text-slate-900 hover:bg-gold-400"
            }`}
          >
            {savedReflection ? "Completed" : "Mark Completed"}
          </button>
          {showReflection && !savedReflection && (
            <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/80 px-4 py-8 backdrop-blur-sm">
              <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[rgb(var(--color-surface))] p-6 text-gray-100 shadow-2xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                      Daily Reflection
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-white">
                      Record your takeaway
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowReflection(false)}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-300 hover:border-white/30"
                  >
                    Close
                  </button>
                </div>
                <p className="mt-3 text-sm text-gray-300">
                  Record how this assignment shaped your confidence and spiritual
                  focus today.
                </p>
                <textarea
                  value={reflectionText}
                  onChange={(event) => setReflectionText(event.target.value)}
                  rows={5}
                  placeholder="Record how this assignment shaped your confidence and spiritual focus today."
                  className="mt-4 w-full resize-none rounded-xl border border-white/10 bg-[rgba(var(--color-surface),0.8)] px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 focus:border-gold-500/60 focus:outline-none"
                />
                <button
                  onClick={() => {
                    if (!reflectionText.trim()) return;
                    saveReflection?.(currentDay, reflectionText.trim());
                    setSavedReflection(reflectionText.trim());
                    setShowReflection(false);
                    setShowCelebration(true);
                    setTimeout(() => setShowCelebration(false), 4600);
                  }}
                  className="mt-4 w-full rounded-xl border border-gold-500/40 bg-gold-500/10 px-4 py-2 text-xs font-semibold text-gold-500 transition hover:border-gold-500 hover:bg-gold-500/20"
                >
                  Save Reflection
                </button>
              </div>
            </div>
          )}
          {showCelebration &&
            typeof document !== "undefined" &&
            createPortal(
              <div className="pointer-events-none fixed inset-0 z-[80] flex items-start justify-center">
                <div className="mt-6 rounded-3xl bg-gold-500 px-16 py-10 text-3xl font-semibold text-slate-900 shadow-[0_0_30px_rgba(234,179,8,0.35)]">
                  🎉 Mission Completed!
                </div>
              </div>,
              document.body
            )}
        </div>
      )}
    </section>
  );
}
