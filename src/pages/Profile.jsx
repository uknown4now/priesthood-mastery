import { useEffect, useMemo, useState } from "react";

const REMINDER_KEY = "priesthood.remindersEnabled";
const OFFICE_OPTIONS = ["deacon", "teacher", "priest", "elder"];

export default function Profile({
  isCompletedToday,
  userName,
  onUpdateName,
  selectedOffice,
  onUpdateOffice,
  onResetProgress,
  totalDaysCompleted,
  phaseCompletions,
  phaseStatus
}) {
  const [enabled, setEnabled] = useState(() =>
    typeof window === "undefined"
      ? false
      : window.localStorage.getItem(REMINDER_KEY) === "true"
  );
  const [pendingOffice, setPendingOffice] = useState(selectedOffice || "");
  const [showConfirm, setShowConfirm] = useState(false);
  const [choice, setChoice] = useState("continue");

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(REMINDER_KEY, String(enabled));
  }, [enabled]);

  useEffect(() => {
    setPendingOffice(selectedOffice || "");
  }, [selectedOffice]);

  const journalEntries = useMemo(() => {
    if (typeof window === "undefined") return 0;
    let count = 0;
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (key?.startsWith("reflection_") || key?.startsWith("sunday_report_")) {
        count += 1;
      }
    }
    return count;
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    const result = await Notification.requestPermission();
    return result === "granted";
  };

  const registerDailyNudge = async () => {
    if (!("serviceWorker" in navigator)) return;
    const registration = await navigator.serviceWorker.ready;
    if ("periodicSync" in registration) {
      try {
        await registration.periodicSync.register("daily-nudge", {
          minInterval: 24 * 60 * 60 * 1000
        });
      } catch (error) {
        // ignore permission or capability issues
      }
    }
  };

  const handleToggle = async () => {
    if (!enabled) {
      const granted = await requestPermission();
      if (!granted) return;
      await registerDailyNudge();
      setEnabled(true);
    } else {
      setEnabled(false);
    }
  };

  const handleOfficeChange = (event) => {
    const nextOffice = event.target.value;
    if (nextOffice === selectedOffice) return;
    setPendingOffice(nextOffice);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    const shouldTrigger =
      selectedOffice !== "elder" && pendingOffice === "elder";
    onUpdateOffice(pendingOffice, shouldTrigger);
    if (choice === "reset") {
      onResetProgress();
    }
    setShowConfirm(false);
  };

  return (
    <section className="rounded-2xl border border-white/20 bg-[rgba(var(--color-surface),0.8)] p-6 text-sm text-gray-300">
      <h2 className="text-lg font-semibold text-white">The Steward’s Credentials</h2>
      <p className="mt-2 text-sm text-gray-300">
        Manage your identity and review your long-term progress.
      </p>

      <div className="mt-5 space-y-3 rounded-xl border border-white/10 bg-[rgba(var(--color-surface),0.8)] p-4">
        <label className="text-xs text-gray-400">Name</label>
        <input
          value={userName}
          onChange={(event) => onUpdateName(event.target.value)}
          placeholder="Enter your name"
          className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 focus:border-gold-500/60 focus:outline-none"
        />
        <label className="text-xs text-gray-400">Priesthood Office</label>
        <select
          value={pendingOffice || ""}
          onChange={handleOfficeChange}
          className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-gray-100 focus:border-gold-500/60 focus:outline-none"
        >
          <option value="" disabled>
            Select your office
          </option>
          {OFFICE_OPTIONS.map((office) => (
            <option key={office} value={office}>
              {office.charAt(0).toUpperCase() + office.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-[rgba(var(--color-surface),0.8)] p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-gold-500">
          Service Summary
        </p>
        <div className="mt-3 grid gap-2 text-sm text-gray-200">
          <div className="flex items-center justify-between">
            <span>Current Rank</span>
            <span className="font-semibold text-white">
              {selectedOffice
                ? selectedOffice.charAt(0).toUpperCase() + selectedOffice.slice(1)
                : "Unassigned"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Path Progress</span>
            <span className="font-semibold text-white">{totalDaysCompleted}/120</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Journal Entries</span>
            <span className="font-semibold text-white">{journalEntries}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-[rgba(var(--color-surface),0.8)] p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-gold-500">
          Mastery Ribbons
        </p>
        <div className="mt-3 grid grid-cols-3 gap-4">
          {[
            {
              key: "phase1_complete",
              label: "Starter Week",
              src: "/assets/ShieldOfFaith.png"
            },
            {
              key: "phase2_complete",
              label: "Month 1",
              src: "/assets/TheOpenWord.png"
            },
            {
              key: "phase3_complete",
              label: "Month 2",
              src: "/assets/KeyOfAuthority.png"
            },
            {
              key: "phase4_complete",
              label: "Month 3",
              src: "/assets/SheppardsStaff.png"
            },
            {
              key: "phase5_complete",
              label: "Month 4",
              src: "/assets/CrownOfLife.png"
            }
          ].map((badge) => {
            const status = phaseStatus?.[badge.key];
            const unlocked = Boolean(phaseCompletions?.[badge.key]);
            const isSilver = status === "silver";
            return (
              <div
                key={badge.key}
                className="flex flex-col items-center gap-2 text-[10px] text-gray-400"
              >
                <div
                  className={`flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-slate-900/40 ${
                    unlocked ? "" : "opacity-50"
                  }`}
                >
                  <img
                    src={badge.src}
                    alt={badge.label}
                    className={`h-full w-full rounded-full object-cover ${
                      unlocked ? "" : "grayscale"
                    }`}
                    style={{
                      filter: unlocked
                        ? isSilver
                          ? "drop-shadow(0 0 6px rgba(148, 163, 184, 0.45))"
                          : "drop-shadow(0 0 10px rgba(234, 179, 8, 0.5))"
                        : "grayscale(100%)"
                    }}
                  />
                </div>
                <span>{badge.label}</span>
                {isSilver && (
                  <span className="text-[9px] uppercase tracking-[0.2em] text-slate-300">
                    Silver
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-[rgba(var(--color-surface),0.8)] px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-white">Enable Daily Reminders</p>
          <p className="text-xs text-gray-400">
            Receive a 7:00 PM nudge if today’s mission is incomplete.
          </p>
        </div>
        <button
          onClick={handleToggle}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
            enabled
              ? "bg-gold-500 text-slate-900"
              : "border border-white/20 text-gray-200 hover:border-gold-500/60"
          }`}
        >
          {enabled ? "Enabled" : "Enable"}
        </button>
      </div>
      <p className="mt-4 text-xs text-gray-400">
        Today’s mission is {isCompletedToday ? "completed" : "pending"}.
      </p>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/80 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[rgb(var(--color-surface))] p-6 text-gray-100 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">
              Congratulations on your ordination!
            </h3>
            <p className="mt-2 text-sm text-gray-300">
              Would you like to reset your Mastery Path to Day 1 for your new
              office, or continue your current progress?
            </p>
            <div className="mt-4 space-y-2 text-sm text-gray-200">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="promotion-choice"
                  checked={choice === "continue"}
                  onChange={() => setChoice("continue")}
                />
                Continue current progress
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="promotion-choice"
                  checked={choice === "reset"}
                  onChange={() => setChoice("reset")}
                />
                Reset to Day 1 (Journal history stays)
              </label>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border border-white/20 px-4 py-2 text-xs font-semibold text-gray-200 transition hover:border-gold-500/60"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 rounded-xl bg-gold-500 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-gold-400"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
