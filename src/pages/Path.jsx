import { useEffect, useMemo, useState } from "react";

export default function Path({
  offices,
  selectedOffice,
  onSelectOffice,
  activeMission,
  activeDay,
  getReflection,
  saveReflection,
  isStarterFinished,
  masteryMonth,
  masteryDay,
  month2ReflectionComplete,
  priesthoodOrder,
  graceDays,
  manualCompletedDays,
  allDays = [],
  catchUpStartDay,
  onCatchUpStartConsumed
}) {
  const officeEntries = Object.entries(offices);
  const officeLabel = selectedOffice
    ? selectedOffice.charAt(0).toUpperCase() + selectedOffice.slice(1)
    : "";
  const currentDay = activeDay || 1;
  const [selectedDay, setSelectedDay] = useState(null);
  const [reflectionText, setReflectionText] = useState("");
  const [starterCollapsed, setStarterCollapsed] = useState(isStarterFinished);
  const [expandedMonth, setExpandedMonth] = useState(null);

  const selectedMission = useMemo(() => {
    if (!selectedOffice || !selectedDay) return null;
    return allDays.find((dayItem) => dayItem.id === selectedDay) || null;
  }, [allDays, selectedDay, selectedOffice]);

  useEffect(() => {
    setReflectionText("");
  }, [selectedDay]);

  useEffect(() => {
    if (!catchUpStartDay) return;
    setSelectedDay(catchUpStartDay);
    onCatchUpStartConsumed?.();
  }, [catchUpStartDay, onCatchUpStartConsumed]);

  useEffect(() => {
    if (isStarterFinished) {
      setStarterCollapsed(true);
    }
  }, [isStarterFinished]);

  const days = selectedOffice ? offices[selectedOffice] : [];
  const activeMonth = masteryMonth || 1;
  const activeMasteryDay = masteryDay || 1;
  const showMonthDetail = expandedMonth !== null;
  const monthTitles = {
    1: "The Scriptural Priesthood",
    2: priesthoodOrder === "Melchizedek" ? "The Healer" : "The Gatekeeper",
    3: priesthoodOrder === "Melchizedek" ? "The Shepherd" : "The Watchman",
    4: priesthoodOrder === "Melchizedek" ? "The Patriarch" : "The Preparer"
  };
  const masteryDaysByMonth = { 1: 28, 2: 28, 3: 28, 4: 29 };
  const daysInExpandedMonth = masteryDaysByMonth[expandedMonth] || 28;
  const graceMap = graceDays || {};
  const manualDays = manualCompletedDays || [];

  const getGraceDate = (dayId) => graceMap?.[dayId];
  const isExcused = (dayId) => Boolean(graceMap?.[dayId]);
  const isManuallyCompleted = (dayId) => manualDays.includes(dayId);
  const isReviewMode = (dayId) => dayId < currentDay;
  const isCatchUpMode = () => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("priesthood.catchUpMode") === "true";
  };
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
  const overallDayForMonth = (month, dayNumber) => {
    const offset =
      7 + [1, 2, 3].slice(0, month - 1).reduce((sum, key) => sum + masteryDaysByMonth[key], 0);
    return offset + dayNumber;
  };

  return (
    <>
      <header className="mb-6">
        <p className="text-sm uppercase tracking-[0.2em] text-gray-400">Path</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          Journey & Mastery
        </h2>
        <p className="mt-2 text-sm text-gray-300">
          Review your progression and unlock the long-term mastery path.
        </p>
      </header>

      {!selectedOffice ? (
        <section className="rounded-2xl border border-white/20 bg-[rgba(var(--color-surface),0.8)] p-5 backdrop-blur-xl">
          <h3 className="text-base font-semibold text-white">Select Your Office</h3>
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
        </section>
      ) : (
        <>
          <section className="rounded-2xl border border-white/20 bg-[rgba(var(--color-surface),0.8)] p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-gold-500">
                    {officeLabel} Journey
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-white">
                    Foundation
                  </h3>
                  <p className="mt-2 text-sm text-gray-300">
                    Review your progress and see what is ahead this week.
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="rounded-full bg-gold-500/20 px-3 py-1 text-xs font-semibold text-gold-500">
                    {isStarterFinished ? "Complete" : `Day ${currentDay}`}
                  </span>
                  {isStarterFinished && (
                    <button
                      onClick={() => setStarterCollapsed((prev) => !prev)}
                      className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-gray-200 transition hover:border-gold-500/60"
                    >
                      {starterCollapsed ? "Show Starter Week" : "Hide Starter Week"}
                    </button>
                  )}
                </div>
              </div>

              {!starterCollapsed && (
                <div className="relative mt-6 pl-6">
                <div className="absolute left-2 top-0 h-full w-px bg-white/10" />
                <div className="space-y-4">
                  {days.map((dayItem) => {
                    const excused = isExcused(dayItem.day);
                    const isCompleted = isManuallyCompleted(dayItem.day);
                    const isCurrent = dayItem.day === currentDay;
                    const isLocked = dayItem.day > currentDay;
                    const isMissed =
                      dayItem.day < currentDay && !isCompleted && !excused;
                    const isActive = !isLocked;
                    return (
                      <button
                        key={dayItem.day}
                        onClick={() => {
                          if (isActive) setSelectedDay(dayItem.day);
                        }}
                        disabled={!isActive}
                        className={`relative flex w-full items-start gap-4 rounded-xl border px-4 py-3 text-left text-sm transition ${
                          isLocked
                            ? "border-white/10 bg-[rgba(var(--color-surface),0.8)] text-gray-500 opacity-60 blur-[0.4px]"
                            : "border-white/10 bg-[rgba(var(--color-surface),0.8)] text-gray-100 hover:border-gold-500/60"
                        } ${isCurrent ? "border-gold-500/60 shadow-[0_0_20px_rgba(234,179,8,0.25)]" : ""}`}
                      >
                        <div className="absolute -left-6 top-4 flex h-4 w-4 items-center justify-center rounded-full border border-white/20 bg-slate-900">
                          {isCompleted && <CheckIcon className="h-3 w-3 text-gold-500" />}
                          {excused && !isCompleted && (
                            <span className="h-2 w-2 rounded-full border border-dashed border-gold-500" />
                          )}
                          {isMissed && (
                            <span className="h-2 w-2 rounded-full border border-gray-500/60" />
                          )}
                          {isCurrent && (
                            <span className="h-2 w-2 rounded-full bg-gold-500 animate-pulse" />
                          )}
                          {isLocked && <span className="h-2 w-2 rounded-full bg-gray-500/60" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                            Day {dayItem.day}
                          </p>
                          <p className="mt-1 font-semibold text-white">{dayItem.title}</p>
                          <p className="mt-1 text-xs text-gray-400">
                            {excused
                              ? "Excused"
                              : isCompleted
                                ? "Completed"
                                : isMissed
                                  ? "Missed"
                                  : isCurrent
                                    ? "Current"
                                    : "Locked"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          {isCompleted && (
                            <span className="rounded-full bg-gold-500/20 px-3 py-1 text-gold-500">
                              Completed
                            </span>
                          )}
                          {excused && !isCompleted && (
                            <span className="rounded-full border border-gold-500/30 px-3 py-1 text-gold-500/80">
                              Excused
                            </span>
                          )}
                          {isMissed && (
                            <span className="rounded-full border border-white/20 px-3 py-1 text-gray-300">
                              Missed
                            </span>
                          )}
                          {isCurrent && (
                            <span className="rounded-full bg-gold-500/20 px-3 py-1 text-gold-500">
                              Today
                            </span>
                          )}
                          {isLocked && <span>Locked</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              )}

          </section>

          <section className="mt-6 rounded-2xl border border-white/20 bg-[rgba(var(--color-surface),0.8)] p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-gold-500">
                  Mastery Path
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  4-Month Journey
                </h3>
                <p className="mt-2 text-sm text-gray-300">
                  Track your monthly progression and review your discipline.
                </p>
              </div>
              <span className="rounded-full bg-gold-500/20 px-3 py-1 text-xs font-semibold text-gold-500">
                Month {activeMonth}
              </span>
            </div>

            <div
              className={`relative mt-6 transition-all duration-300 ${showMonthDetail ? "opacity-0 -translate-y-3 pointer-events-none h-0 overflow-hidden" : "opacity-100 translate-y-0"}`}
            >
              {!isStarterFinished && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl border border-white/10 bg-slate-900/70 text-center">
                  <p className="text-sm font-semibold text-gray-200">
                    Complete Starter Week to Unlock
                  </p>
                </div>
              )}
              <div className={`relative pl-6 ${!isStarterFinished ? "blur-sm" : ""}`}>
                <div className="absolute left-2 top-0 h-full w-px bg-white/10" />
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((month) => {
                    const month3Locked = month === 3 && !month2ReflectionComplete;
                    const isActive =
                      isStarterFinished && month === activeMonth && !month3Locked;
                    const isComplete = isStarterFinished && month < activeMonth;
                    const isLocked =
                      !isStarterFinished || month > activeMonth || month3Locked;
                    return (
                      <button
                        key={month}
                        onClick={() => {
                          if (isActive) setExpandedMonth(month);
                        }}
                        disabled={!isActive}
                        className={`relative flex w-full items-center gap-4 rounded-xl border px-5 py-5 text-left text-sm transition ${
                          isLocked
                            ? "border-white/10 bg-[rgba(var(--color-surface),0.8)] text-gray-500 opacity-60"
                            : "border-white/10 bg-[rgba(var(--color-surface),0.8)] text-gray-100 hover:border-gold-500/60"
                        } ${isActive ? "border-gold-500/60 shadow-[0_0_20px_rgba(234,179,8,0.25)]" : ""}`}
                      >
                        <div className="absolute -left-6 top-5 flex h-4 w-4 items-center justify-center rounded-full border border-white/20 bg-slate-900">
                          {isComplete && <CheckIcon className="h-3 w-3 text-gold-500" />}
                          {isActive && (
                            <span className="h-2 w-2 rounded-full bg-gold-500 animate-pulse" />
                          )}
                          {isLocked && <span className="h-2 w-2 rounded-full bg-gray-500/60" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                            Month {month}
                          </p>
                      <p className="mt-1 text-base font-semibold text-white">
                        {month === 2
                          ? `Month 2: ${monthTitles[2]}`
                          : month === 1
                            ? `Month 1: ${monthTitles[1]}`
                          : month === 3
                              ? `Month 3: ${monthTitles[3]}`
                              : month === 4
                                ? `Month 4: ${monthTitles[4]}`
                                : `Mastery Track ${month}`}
                      </p>
                          <p className="mt-2 text-xs text-gray-400">
                            {isComplete
                              ? "Completed"
                              : isActive
                                ? "Active"
                                : "Locked"}
                          </p>
                        </div>
                        <div className="text-xs font-semibold">
                          {isComplete && "Completed"}
                          {isActive && "Open"}
                          {isLocked && "Locked"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div
              className={`transition-all duration-300 ${showMonthDetail ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none h-0 overflow-hidden"}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                    Month {expandedMonth}
                  </p>
                  <h4 className="mt-2 text-lg font-semibold text-white">
                    Month {expandedMonth} Calendar
                  </h4>
                  <p className="mt-1 text-sm text-gray-300">
                    Stay consistent day by day.
                  </p>
                </div>
                <button
                  onClick={() => setExpandedMonth(null)}
                  className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-gray-200 transition hover:border-gold-500/60"
                >
                  Back to Timeline
                </button>
              </div>

            <div className="mt-5 grid grid-cols-6 gap-3">
              {Array.from({ length: daysInExpandedMonth }).map((_, index) => {
                  const dayNumber = index + 1;
                  const overallDay = overallDayForMonth(expandedMonth, dayNumber);
                  const excused = isExcused(overallDay);
                  const isCompleted = isManuallyCompleted(overallDay);
                  const isCurrent = dayNumber === activeMasteryDay;
                  const isLocked = dayNumber > activeMasteryDay;
                  const isMissed =
                    overallDay < currentDay && !isCompleted && !excused;
                  return (
                    <button
                      key={`day-${dayNumber}`}
                      onClick={() => {
                        if (!isLocked) setSelectedDay(overallDay);
                      }}
                      disabled={isLocked}
                      className={`flex h-12 flex-col items-center justify-center rounded-lg border text-xs font-semibold transition ${
                        isLocked
                          ? "border-white/10 bg-[rgba(var(--color-surface),0.8)] text-gray-500 opacity-60"
                          : "border-white/10 bg-[rgba(var(--color-surface),0.8)] text-gray-100 hover:border-gold-500/60"
                      } ${isCurrent ? "border-gold-500/60 shadow-[0_0_12px_rgba(234,179,8,0.25)]" : ""}`}
                    >
                      <span>Day {dayNumber}</span>
                      {isCompleted && (
                        <CheckIcon className="mt-1 h-3 w-3 text-gold-500" />
                      )}
                      {excused && !isCompleted && (
                        <span className="mt-1 h-3 w-3 rounded-full border border-dashed border-gold-500/80" />
                      )}
                      {isMissed && (
                        <span className="mt-1 h-3 w-3 rounded-full border border-gray-500/60" />
                      )}
                      {isLocked && <span className="mt-1 text-[10px]">Locked</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        </>
      )}

      {selectedMission && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/80 px-4 py-8 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 bg-[rgb(var(--color-surface))] p-6 text-gray-100 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                  Day {selectedMission.id}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  {selectedMission.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-300 hover:border-white/30"
              >
                Close
              </button>
            </div>

            <div className="mt-5 space-y-3 text-sm text-gray-200">
              {isReviewMode(selectedMission.id) && (
                <div className="rounded-2xl border border-white/10 bg-slate-900/40 px-3 py-2 text-xs text-gray-300">
                  Reviewing Past Mission — this will not advance your current
                  day.
                </div>
              )}
              {isCatchUpMode() && isReviewMode(selectedMission.id) && (
                <div className="rounded-2xl border border-gold-500/30 bg-gold-500/10 px-3 py-2 text-xs text-gold-500">
                  Catch Up Mode — complete past days in order to repair your
                  foundation.
                </div>
              )}
              {isExcused(selectedMission.id) && (
                <div className="rounded-2xl border border-gold-500/30 bg-gold-500/10 p-3 text-xs text-gold-500">
                  This day was bypassed during your return on{" "}
                  {getGraceDate(selectedMission.id)}. You can still read the
                  content here.
                </div>
              )}
              {!isExcused(selectedMission.id) &&
                isReviewMode(selectedMission.id) &&
                !isManuallyCompleted(selectedMission.id) && (
                  <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-3 text-xs text-gray-300">
                    This day was missed. You can complete it now.
                  </div>
                )}
              <p>{selectedMission.message}</p>
              <p>{selectedMission.challenge}</p>
            </div>
            {selectedMission.id < currentDay && getReflection && (
              <div className="mt-5 rounded-2xl border border-white/10 bg-[rgba(var(--color-surface),0.8)] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                  Saved Reflection
                </p>
                <p className="mt-2 text-sm text-gray-200">
                  {getReflection(selectedMission.id) || "No reflection saved."}
                </p>
              </div>
            )}
            {selectedMission.id < currentDay &&
              !isManuallyCompleted(selectedMission.id) && (
                <div className="mt-5 rounded-2xl border border-white/10 bg-[rgba(var(--color-surface),0.8)] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                    Complete with Reflection
                  </p>
                  <textarea
                    value={reflectionText}
                    onChange={(event) => setReflectionText(event.target.value)}
                    rows={4}
                    placeholder="Record how this assignment shaped your confidence and spiritual focus today."
                    className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 focus:border-gold-500/60 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      if (!reflectionText.trim()) return;
                      saveReflection?.(selectedMission.id, reflectionText.trim());
                      setReflectionText("");
                      if (isCatchUpMode()) {
                        const queue = getCatchUpQueue().filter(
                          (day) => day !== selectedMission.id
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
                          }
                        }
                        if (queue.length) {
                          setSelectedDay(queue[0]);
                        }
                      }
                    }}
                    className="mt-3 w-full rounded-xl bg-gold-500 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-gold-400"
                  >
                    {isReviewMode(selectedMission.id)
                      ? "Verify Completion"
                      : "Save Reflection"}
                  </button>
                  {isCatchUpMode() && (
                    <button
                      onClick={() => {
                        const queue = getCatchUpQueue().filter(
                          (day) => day !== selectedMission.id
                        );
                        if (queue.length) {
                          setSelectedDay(queue[0]);
                        }
                      }}
                      className="mt-2 w-full rounded-xl border border-white/20 px-4 py-2 text-xs font-semibold text-gray-200 transition hover:border-gold-500/60"
                    >
                      Next Incomplete Day
                    </button>
                  )}
                </div>
              )}

            <a
              href={selectedMission.url}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center text-sm font-semibold text-gold-500 hover:text-gold-400"
            >
              {selectedMission.scripture}
            </a>
          </div>
        </div>
      )}
    </>
  );
}

function CheckIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="m5 12 4.5 4.5L19 7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
