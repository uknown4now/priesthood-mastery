import { useEffect, useMemo, useState } from "react";
import HabitTracker from "../components/HabitTracker.jsx";
import MissionCard from "../components/MissionCard.jsx";
import MasteryCelebrationModal from "../components/MasteryCelebrationModal.jsx";
import WeeklyReflectionWizard from "../components/WeeklyReflectionWizard.jsx";

export default function Dashboard({
  userName,
  hasName,
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
  saveReflection,
  isStarterFinished,
  onCompleteWeeklyReflection,
  priesthoodOrder,
  masteryMonth,
  masteryComplete,
  badges,
  manualCompletedDays,
  phaseStatus,
  habits,
  onToggleHabit,
  weeklyHabitsCount,
  progressDay,
  progressPercent,
  allDays,
  catchUpStartDay,
  onCatchUpStartConsumed
}) {
  const [showWeeklyWizard, setShowWeeklyWizard] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [catchUpDay, setCatchUpDay] = useState(null);
  const [catchUpReflection, setCatchUpReflection] = useState("");
  const [catchUpDoneMessage, setCatchUpDoneMessage] = useState(false);
  const isAfterSeven = new Date().getHours() >= 19;
  const showSoftNudge = isAfterSeven && !missionCompleted;
  const weekReflections =
    selectedOffice && offices[selectedOffice]
      ? offices[selectedOffice]
          .map((dayItem) => ({
            day: dayItem.day,
            title: dayItem.title,
            reflection: getReflection?.(dayItem.day) || ""
          }))
          .filter((entry) => entry.reflection)
      : [];

  const totalEntries = useMemo(() => {
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

  const [finalReflection, setFinalReflection] = useState("");
  const hasFinalReflection = manualCompletedDays?.includes(120);

  const getCatchUpQueue = () => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(
        window.localStorage.getItem("priesthood.catchUpQueue") || "[]"
      );
    } catch (error) {
      return [];
    }
  };

  const isCatchUpMode = () => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("priesthood.catchUpMode") === "true";
  };

  useEffect(() => {
    if (catchUpStartDay) {
      setCatchUpDay(catchUpStartDay);
      onCatchUpStartConsumed?.();
    }
  }, [catchUpStartDay, onCatchUpStartConsumed]);

  useEffect(() => {
    if (catchUpDay) {
      setCatchUpReflection(getReflection?.(catchUpDay) || "");
    }
  }, [catchUpDay, getReflection]);

  useEffect(() => {
    if (!isCatchUpMode()) return;
    if (catchUpDay) return;
    const queue = getCatchUpQueue();
    if (queue.length) {
      setCatchUpDay(queue[0]);
    }
  }, [catchUpDay]);

  const catchUpMission = useMemo(() => {
    if (!catchUpDay) return null;
    return (allDays || []).find((day) => day.id === catchUpDay) || null;
  }, [allDays, catchUpDay]);

  const consistencyScore = useMemo(() => {
    if (typeof window === "undefined") return 0;
    let count = 0;
    for (let i = 0; i < 30; i += 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = `day_${date.toISOString().slice(0, 10)}_completed`;
      const raw = window.localStorage.getItem(key);
      if (raw) {
        try {
          if (JSON.parse(raw)) count += 1;
        } catch (error) {
          // ignore
        }
      }
    }
    return count;
  }, []);

  const catchUpSaved = catchUpDay
    ? getReflection?.(catchUpDay) || ""
    : "";

  const handleNameChange = (event) => {
    onSelectOffice("onboardingName", event.target.value);
  };

  const displayName = userName?.trim() ? userName : "Brother";

  return (
    <>
      <header className="mb-6">
        <p className="text-sm uppercase tracking-[0.2em] text-gray-400">
          Priesthood Path
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-white">
          Welcome, {displayName}
        </h1>
        <p className="mt-2 text-sm text-gray-300">
          Walk today with intention and sacred focus.
        </p>
        {isStarterFinished && masteryMonth === 3 && (
          <span className="mt-3 inline-flex rounded-full bg-gold-500/20 px-3 py-1 text-xs font-semibold text-gold-500">
            {priesthoodOrder === "Aaronic"
              ? "Active Watchman"
              : "Ordained Shepherd"}
          </span>
        )}
      </header>

      {isStarterFinished && (
        <button
          onClick={() => setShowNoteModal(true)}
          className="mb-4 w-full rounded-xl border border-gold-500/40 bg-gold-500/10 px-4 py-3 text-sm font-semibold text-gold-500 transition hover:border-gold-500 hover:bg-gold-500/20"
        >
          Quick Ministering Note
        </button>
      )}

      {showSoftNudge && (
        <div className="mb-4 rounded-2xl border border-gold-500/40 bg-gold-500/10 px-4 py-3 text-sm text-gold-500">
          🌙 The day is almost over. Don't forget to record your stewardship
          today.
        </div>
      )}

      {isCatchUpMode() && (
        <div className="mb-4 rounded-2xl border border-gold-500/40 bg-gold-500/10 px-4 py-3 text-sm text-gold-500">
          CATCH UP MODE — complete past days in order to repair your foundation.
        </div>
      )}
      {catchUpDoneMessage && (
        <div className="mb-4 rounded-2xl border border-gold-500/40 bg-gold-500/10 px-4 py-3 text-sm text-gold-500">
          Congratulations, you are all caught up! You can continue with the
          current lesson for today.
        </div>
      )}

      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/80 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[rgb(var(--color-surface))] p-6 text-gray-100 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                  Quick Ministering Note
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  Capture a prompting
                </h3>
              </div>
              <button
                onClick={() => setShowNoteModal(false)}
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-300 hover:border-white/30"
              >
                Close
              </button>
            </div>
            <textarea
              value={noteText}
              onChange={(event) => setNoteText(event.target.value)}
              rows={5}
              placeholder="Write a quick note about someone you serve..."
              className="mt-4 w-full resize-none rounded-xl border border-white/10 bg-[rgba(var(--color-surface),0.8)] px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 focus:border-gold-500/60 focus:outline-none"
            />
            <button
              onClick={() => {
                if (!noteText.trim()) return;
                const entry = {
                  type: "daily",
                  date: new Date().toISOString(),
                  office: selectedOffice,
                  prompt: "Quick Ministering Note",
                  response: noteText.trim()
                };
                window.localStorage.setItem(
                  `reflection_note_${Date.now()}`,
                  JSON.stringify(entry)
                );
                setNoteText("");
                setShowNoteModal(false);
              }}
              className="mt-4 w-full rounded-xl bg-gold-500 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-gold-400"
            >
              Save Note
            </button>
          </div>
        </div>
      )}

      {catchUpMission && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/80 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 bg-[rgb(var(--color-surface))] p-6 text-gray-100 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gold-500">
                  Catch Up Mode
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  Day {catchUpMission.id}: {catchUpMission.title}
                </h3>
              </div>
              <button
                onClick={() => setCatchUpDay(null)}
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-300 hover:border-white/30"
              >
                Close
              </button>
            </div>

            <div className="mt-5 space-y-3 text-sm text-gray-200">
              <p>{catchUpMission.message}</p>
              <p>{catchUpMission.challenge}</p>
            </div>

            <textarea
              value={catchUpReflection}
              onChange={(event) => setCatchUpReflection(event.target.value)}
              rows={5}
              placeholder="Record how this assignment shaped your confidence and spiritual focus."
              className="mt-4 w-full resize-none rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 focus:border-gold-500/60 focus:outline-none"
            />
            <button
              disabled={!catchUpReflection.trim()}
              onClick={() => {
                if (!catchUpReflection.trim()) return;
                saveReflection?.(catchUpMission.id, catchUpReflection.trim());
                setCatchUpReflection("");
                const queue = getCatchUpQueue().filter(
                  (day) => day !== catchUpMission.id
                );
                if (typeof window !== "undefined") {
                  window.localStorage.setItem(
                    "priesthood.catchUpQueue",
                    JSON.stringify(queue)
                  );
                  if (!queue.length) {
                    window.localStorage.setItem(
                      "priesthood.catchUpMode",
                      JSON.stringify(false)
                    );
                    setCatchUpDay(null);
                    setCatchUpDoneMessage(true);
                    return;
                  }
                }
                if (queue.length) {
                  setCatchUpDay(queue[0]);
                }
              }}
              className={`mt-4 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
                catchUpReflection.trim()
                  ? "bg-gold-500 text-slate-900 hover:bg-gold-400"
                  : "cursor-not-allowed bg-white/10 text-gray-500"
              }`}
            >
              Verify completion and advance to next day
            </button>
          </div>
        </div>
      )}

      {!hasName || !selectedOffice ? (
        <section className="mb-6 rounded-2xl border border-white/20 bg-[rgba(var(--color-surface),0.8)] p-5 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.25em] text-gold-500">
            Welcome
          </p>
          <h2 className="mt-2 text-lg font-semibold text-white">
            Complete Your Onboarding
          </h2>
          <p className="mt-2 text-sm text-gray-300">
            Enter your name and select your priesthood office to begin.
          </p>
          <div className="mt-4 space-y-3">
            <label className="text-xs text-gray-400">What is your name?</label>
            <input
              value={userName}
              onChange={handleNameChange}
              placeholder="Enter your name"
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 focus:border-gold-500/60 focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-3">
              {["deacon", "teacher", "priest", "elder"].map((office) => (
                <button
                  key={office}
                  onClick={() => onSelectOffice(office)}
                  className="rounded-xl border border-white/10 bg-[rgba(var(--color-surface),0.8)] px-3 py-3 text-sm font-semibold text-gray-100 transition hover:border-gold-500/60 hover:bg-gold-500/10"
                >
                  {office.charAt(0).toUpperCase() + office.slice(1)}
                </button>
              ))}
            </div>
            <button
              disabled={!userName.trim() || !selectedOffice}
              className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
                userName.trim() && selectedOffice
                  ? "bg-gold-500 text-slate-900 hover:bg-gold-400"
                  : "cursor-not-allowed bg-white/10 text-gray-400"
              }`}
            >
              Continue
            </button>
          </div>
        </section>
      ) : masteryComplete && hasFinalReflection ? (
        <section className="mb-6 rounded-2xl border border-gold-500/40 bg-[rgba(var(--color-surface),0.9)] p-6 text-gray-100">
          <p className="text-xs uppercase tracking-[0.25em] text-gold-500">
            Hall of Mastery
          </p>
          <h2 className="mt-2 text-lg font-semibold text-white">
            Graduation Complete
          </h2>
          <p className="mt-2 text-sm text-gray-300">
            You have completed the full priesthood path. Your record stands as a
            chronicle of service.
          </p>
          <div className="mt-4 grid gap-3 text-sm text-gray-200">
            <div className="flex items-center justify-between">
              <span>Total Journal Entries</span>
              <span className="font-semibold text-white">{totalEntries}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Badges Earned</span>
              <span className="font-semibold text-white">{badges?.length || 0}</span>
            </div>
          </div>
        </section>
      ) : masteryComplete ? (
        <section className="mb-6 rounded-2xl border border-white/20 bg-[rgba(var(--color-surface),0.8)] p-5 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.25em] text-gold-500">
            Final Reflection
          </p>
          <h2 className="mt-2 text-lg font-semibold text-white">
            Complete Day 120
          </h2>
          <p className="mt-2 text-sm text-gray-300">
            Record your final reflection to unlock your Mastery badge.
          </p>
          <textarea
            value={finalReflection}
            onChange={(event) => setFinalReflection(event.target.value)}
            rows={5}
            placeholder="Record how this journey shaped your confidence and spiritual focus."
            className="mt-4 w-full resize-none rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 focus:border-gold-500/60 focus:outline-none"
          />
          <button
            onClick={() => {
              if (!finalReflection.trim()) return;
              saveReflection?.(120, finalReflection.trim());
              setFinalReflection("");
            }}
            className="mt-4 w-full rounded-xl bg-gold-500 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-gold-400"
          >
            Save Final Reflection
          </button>
        </section>
      ) : activeDay === 7 && !isStarterFinished ? (
        <section className="mb-6 rounded-2xl border border-white/20 bg-[rgba(var(--color-surface),0.8)] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.25em] text-gold-500">
            Weekly Account of Stewardship
          </p>
          <h2 className="mt-2 text-lg font-semibold text-white">
            Sunday Gate
          </h2>
          <p className="mt-2 text-sm text-gray-300">
            Complete your weekly reflection to unlock the Mastery Path.
          </p>
          <button
            onClick={() => setShowWeeklyWizard(true)}
            className="mt-4 w-full rounded-xl bg-gold-500 px-4 py-3 text-sm font-semibold text-slate-900 shadow-md shadow-gold-500/30 transition hover:bg-gold-400"
          >
            Start Weekly Reflection
          </button>
          {showWeeklyWizard && (
            <WeeklyReflectionWizard
              weeklyReflections={weekReflections}
              onClose={() => setShowWeeklyWizard(false)}
              onComplete={(responses) => {
                onCompleteWeeklyReflection(responses);
                setShowWeeklyWizard(false);
                setShowCelebration(true);
              }}
            />
          )}
        </section>
      ) : (
        <MissionCard
          offices={offices}
          selectedOffice={selectedOffice}
          onSelectOffice={onSelectOffice}
          activeMission={activeMission}
          activeDay={activeDay}
          missionOpen={missionOpen}
          onOpenMission={onOpenMission}
          missionCompleted={missionCompleted}
          onCompleteMission={onCompleteMission}
          getReflection={getReflection}
          saveReflection={saveReflection}
        />
      )}

      {!masteryComplete && !(activeDay === 7 && !isStarterFinished) && (
        <>
          <HabitTracker habits={habits} onToggle={onToggleHabit} />

          <DynamicPhaseTracker
            currentDay={activeDay || 1}
            missionCompleted={missionCompleted}
            priesthoodOrder={priesthoodOrder}
            consistencyScore={consistencyScore}
            manualCompletedDays={manualCompletedDays}
            phaseStatus={phaseStatus}
          />
        </>
      )}
      {showCelebration && (
        <MasteryCelebrationModal
          monthLabel="Starter Week"
          badgeImageUrl="/assets/week1-badge.png"
          onContinue={() => setShowCelebration(false)}
        />
      )}
    </>
  );
}

function DynamicPhaseTracker({
  currentDay,
  missionCompleted,
  priesthoodOrder,
  consistencyScore,
  manualCompletedDays,
  phaseStatus
}) {
  const phases = [
    {
      key: "starter",
      name: "Starter Week",
      start: 1,
      end: 7,
      target: 7,
      label: "Starter Week"
    },
    {
      key: "month1",
      name: "Month 1: Scriptural Foundation",
      start: 8,
      end: 35,
      target: 28,
      label: "Scriptural Foundation"
    },
    {
      key: "month2",
      name: "Month 2: Specialized Skills",
      start: 36,
      end: 63,
      target: 28,
      label:
        priesthoodOrder === "Melchizedek" ? "The Healer" : "The Gatekeeper"
    },
    {
      key: "month3",
      name: "Month 3: Active Stewardship",
      start: 64,
      end: 91,
      target: 28,
      label:
        priesthoodOrder === "Melchizedek" ? "The Shepherd" : "The Watchman"
    },
    {
      key: "month4",
      name: "Month 4: Eternal Legacy",
      start: 92,
      end: 120,
      target: 29,
      label:
        priesthoodOrder === "Melchizedek" ? "The Patriarch" : "The Preparer"
    }
  ];

  const phase =
    phases.find((item) => currentDay >= item.start && currentDay <= item.end) ||
    phases[0];
  const dayInPhase = Math.min(
    phase.target,
    Math.max(1, currentDay - phase.start + 1)
  );
  const percent = Math.round((dayInPhase / phase.target) * 100);
  const isPhaseComplete = currentDay === phase.end && missionCompleted;
  const manualDays = manualCompletedDays || [];
  const manualInPhase = manualDays.filter(
    (day) => day >= phase.start && day <= phase.end
  ).length;
  const phaseProgress = Math.round((manualInPhase / phase.target) * 100);
  const masteryScore = Math.round(
    (manualDays.length / Math.max(currentDay, 1)) * 100
  );
  const badgeValue =
    phaseProgress === 100 ? "Gold" : phaseStatus?.[phase.key] === "silver" ? "Silver" : "Silver";

  return (
    <section className="rounded-2xl border border-white/20 bg-[rgba(var(--color-surface),0.8)] p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-white">
            Phase: {phase.label}
          </h3>
          <p className="mt-2 text-sm text-gray-300">
            Day {dayInPhase} of {phase.target}
          </p>
          <div className="mt-4 h-3 w-full rounded-full bg-white/10">
            <div
              className={`h-3 rounded-full transition-all duration-700 ${
                isPhaseComplete
                  ? "bg-gold-500 animate-pulse"
                  : "bg-gold-500/80"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-gray-400">
            Overall Path: {currentDay}/120 Days Mastered
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Consistency Score: {consistencyScore}/30 days active
          </p>
          <div className="mt-3 grid gap-1 text-[11px] text-gray-300">
            <div className="flex items-center justify-between">
              <span>Phase Progress</span>
              <span className="font-semibold text-white">
                {manualInPhase}/{phase.target} ({phaseProgress}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Mastery Score</span>
              <span className="font-semibold text-white">
                {manualDays.length}/{currentDay} ({masteryScore}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Path Progress</span>
              <span className="font-semibold text-white">
                {currentDay}/120
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Badge Status</span>
              <span className="font-semibold text-white">{badgeValue}</span>
            </div>
          </div>
        </div>
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-white">
          {percent}%
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-400">{phase.name}</p>
    </section>
  );
}
