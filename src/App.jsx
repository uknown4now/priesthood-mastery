import { useEffect, useMemo, useState } from "react";
import Navigation from "./components/Navigation.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Journal from "./pages/Journal.jsx";
import OrdinanceLab from "./pages/OrdinanceLab.jsx";
import Path from "./pages/Path.jsx";
import Profile from "./pages/Profile.jsx";
import MasteryCelebrationModal from "./components/MasteryCelebrationModal.jsx";
import HigherPriesthoodModal from "./components/HigherPriesthoodModal.jsx";
import PhaseCompletionModal from "./components/PhaseCompletionModal.jsx";
import PhaseReviewModal from "./components/PhaseReviewModal.jsx";
import RecoveryModal from "./components/RecoveryModal.jsx";
import RecoveryToast from "./components/RecoveryToast.jsx";
import DeveloperToolbar from "./components/DeveloperToolbar.jsx";
import { useMission } from "./context/MissionProvider.jsx";
const REMINDER_KEY = "priesthood.remindersEnabled";

export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [missionOpen, setMissionOpen] = useState(false);
  const [habits, setHabits] = useState({
    scripture: false,
    prayer: false,
    service: false
  });
  const {
    offices,
    selectedOffice,
    setSelectedOffice,
    activeMission,
    activeDay,
    isCompletedToday,
    completedDay,
    completeMission,
    getReflection,
    saveReflection,
    isStarterFinished,
    completeWeeklyReflection,
    masteryMonth,
    masteryDay,
    debugAdvanceDay,
    debugCompleteMonth,
    debugSetOverallDay,
    debugToggleOrder,
    debugResetAll,
    badgeUnlock,
    clearBadgeUnlock,
    priesthoodOrder,
    month2ReflectionComplete,
    masteryComplete,
    badges,
    userName,
    setUserName,
    higherUnlocked,
    triggerHigherUnlocked,
    clearHigherUnlocked,
    phaseCompletion,
    continuePhaseCompletion,
    phaseCompletions,
    phaseReview,
    proceedPhaseWithSilver,
    reviewPhaseExcused,
    phaseStatus,
    allDays,
    markGraceDays,
    recordCompletion,
    setOverallDay,
    graceDays,
    clearGraceDay,
    manualCompletedDays
  } = useMission();

  const safeUserName = userName?.trim() || "Brother";
  const hasName = userName?.trim().length > 0;
  const [recoveryState, setRecoveryState] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [catchUpStartDay, setCatchUpStartDay] = useState(null);

  const isMonth1Theme =
    isStarterFinished && masteryMonth === 1 && masteryDay >= 1;

  const progressPercent = useMemo(
    () => Math.round((completedDay / 30) * 100),
    [completedDay]
  );

  const weeklyHabitsCount = useMemo(() => {
    if (typeof window === "undefined") return 0;
    const raw = window.localStorage.getItem("priesthood.habitLog");
    if (!raw) return 0;
    let habitLog = {};
    try {
      habitLog = JSON.parse(raw);
    } catch (error) {
      return 0;
    }
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return Object.entries(habitLog).reduce((count, [dateKey, entry]) => {
      const date = new Date(dateKey);
      if (date >= start && date <= end && entry?.completed) {
        return count + 1;
      }
      return count;
    }, 0);
  }, [habits]);

  const toggleHabit = (key) => {
    setHabits((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const todayKey = new Date().toISOString().slice(0, 10);
    const completed = Object.values(habits).every(Boolean);
    const raw = window.localStorage.getItem("priesthood.habitLog");
    let habitLog = {};
    try {
      habitLog = raw ? JSON.parse(raw) : {};
    } catch (error) {
      habitLog = {};
    }
    habitLog[todayKey] = { completed, habits };
    window.localStorage.setItem("priesthood.habitLog", JSON.stringify(habitLog));
  }, [habits]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const enabled = window.localStorage.getItem(REMINDER_KEY) === "true";
    const todayKey = new Date().toISOString().slice(0, 10);
    const isAfterSeven = new Date().getHours() >= 19;
    if (enabled && isAfterSeven && !isCompletedToday) {
      // Soft nudge banner handled in Dashboard; update SW status.
    }
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.active?.postMessage({
          type: "NUDGE_STATUS",
          payload: { completed: isCompletedToday, date: todayKey }
        });
      });
    }
  }, [isCompletedToday]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!selectedOffice) return;
    const todayKey = new Date().toISOString().slice(0, 10);
    const lastShown = window.localStorage.getItem("priesthood.recoveryShown");
    if (lastShown === todayKey) return;
    const lastActiveRaw = window.localStorage.getItem(
      "priesthood.lastActiveDate"
    );
    if (!lastActiveRaw) return;
    const lastActive = new Date(lastActiveRaw);
    const now = new Date();
    const gapDays = Math.floor(
      (now.setHours(0, 0, 0, 0) - lastActive.setHours(0, 0, 0, 0)) /
        86400000
    );
    if (gapDays <= 0) return;
    const lastCompleted = Number(
      window.localStorage.getItem("priesthood.lastCompletedDay") || 0
    );
    const targetDay = Math.min(120, lastCompleted + gapDays);
    const missedDays = allDays
      .filter(
        (day) => day.id < activeDay && !manualCompletedDays.includes(day.id)
      )
      .sort((a, b) => a.id - b.id);
    window.localStorage.setItem("priesthood.recoveryShown", todayKey);
    if (gapDays <= 2) {
      setRecoveryState({
        type: "toast",
        message: `Welcome back, ${safeUserName}. We missed you yesterday.`
      });
      setShowToast(true);
      return;
    }
    if (gapDays <= 6) {
      setRecoveryState({
        type: "catchup",
        missedDays,
        targetDay,
        lastCompleted
      });
      return;
    }
    setRecoveryState({
      type: "recenter",
      missedDays,
      targetDay,
      lastCompleted
    });
  }, [allDays, manualCompletedDays, selectedOffice, safeUserName]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const nextAccent =
      priesthoodOrder === "Melchizedek" ? "#EAB308" : "#94A3B8";
    document.documentElement.style.setProperty(
      "--color-accent-secondary",
      nextAccent
    );
  }, [priesthoodOrder]);

  const handleOfficeSelect = (officeKey, nameValue) => {
    if (officeKey === "onboardingName") {
      setUserName(nameValue);
      return;
    }
    setSelectedOffice(officeKey);
    setMissionOpen(false);
  };

  const handleOfficeUpdate = (officeKey, shouldTrigger) => {
    setSelectedOffice(officeKey);
    if (shouldTrigger) {
      triggerHigherUnlocked();
    }
  };

  const handleResetProgress = () => {
    setMissionOpen(false);
    debugSetOverallDay(1);
  };

  return (
    <div
      className={`min-h-screen text-gray-50 ${
        isMonth1Theme ? "bg-[#0b1324]" : "bg-[var(--color-bg)]"
      }`}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-[450px] flex-col px-4 pb-28 pt-8">
        {/* TEST ONLY: remove after QA */}
        {currentPage === "dashboard" && (
          <Dashboard
            userName={userName}
            hasName={hasName}
            offices={offices}
            selectedOffice={selectedOffice}
            onSelectOffice={handleOfficeSelect}
            activeMission={activeMission}
            activeDay={activeDay}
            missionOpen={missionOpen}
            onOpenMission={() => setMissionOpen(true)}
            missionCompleted={isCompletedToday}
            onCompleteMission={completeMission}
            getReflection={getReflection}
            saveReflection={saveReflection}
            isStarterFinished={isStarterFinished}
            onCompleteWeeklyReflection={completeWeeklyReflection}
            priesthoodOrder={priesthoodOrder}
            masteryMonth={masteryMonth}
            masteryComplete={masteryComplete}
            badges={badges}
            manualCompletedDays={manualCompletedDays}
            phaseStatus={phaseStatus}
            habits={habits}
            onToggleHabit={toggleHabit}
            weeklyHabitsCount={weeklyHabitsCount}
            progressDay={completedDay}
            progressPercent={progressPercent}
            allDays={allDays}
            catchUpStartDay={catchUpStartDay}
            onCatchUpStartConsumed={() => setCatchUpStartDay(null)}
          />
        )}
        {currentPage === "path" && (
          <Path
            offices={offices}
            selectedOffice={selectedOffice}
            onSelectOffice={handleOfficeSelect}
            activeMission={activeMission}
            activeDay={activeDay}
            getReflection={getReflection}
            saveReflection={saveReflection}
            isStarterFinished={isStarterFinished}
            masteryMonth={masteryMonth}
            masteryDay={masteryDay}
            month2ReflectionComplete={month2ReflectionComplete}
            priesthoodOrder={priesthoodOrder}
            graceDays={graceDays}
            manualCompletedDays={manualCompletedDays}
            allDays={allDays}
            catchUpStartDay={catchUpStartDay}
            onCatchUpStartConsumed={() => setCatchUpStartDay(null)}
          />
        )}
        {currentPage === "journal" && <Journal />}
        {currentPage === "ordinance" && <OrdinanceLab />}
        {currentPage === "profile" && (
          <Profile
            isCompletedToday={isCompletedToday}
            userName={safeUserName}
            onUpdateName={setUserName}
            selectedOffice={selectedOffice}
            onUpdateOffice={handleOfficeUpdate}
            onResetProgress={handleResetProgress}
            totalDaysCompleted={completedDay}
            phaseCompletions={phaseCompletions}
            phaseStatus={phaseStatus}
          />
        )}
      </div>

      <Navigation currentPage={currentPage} onChange={setCurrentPage} />
      {import.meta.env.DEV && (
        <DeveloperToolbar
          userName={userName}
          onUpdateName={setUserName}
          currentDay={activeDay || 1}
          onSetDay={debugSetOverallDay}
          selectedOffice={selectedOffice}
          onUpdateOffice={setSelectedOffice}
        />
      )}
      {higherUnlocked && (
        <HigherPriesthoodModal onContinue={clearHigherUnlocked} />
      )}
      {phaseCompletion && (
        <PhaseCompletionModal
          phase={phaseCompletion}
          onContinue={continuePhaseCompletion}
        />
      )}
      {phaseReview && (
        <PhaseReviewModal
          phase={phaseReview.phase}
          manualCount={phaseReview.manualCount}
          total={phaseReview.total}
          excusedDays={phaseReview.excusedDays}
          onReview={reviewPhaseExcused}
          onProceed={proceedPhaseWithSilver}
        />
      )}
      {recoveryState?.type === "catchup" && (
        <RecoveryModal
          type="catchup"
          name={safeUserName}
          missedDays={recoveryState.missedDays}
          onCatchUp={() => {
            const queue = (recoveryState.missedDays || [])
              .map((day) => day.id)
              .filter((dayId) => dayId < activeDay);
            if (typeof window !== "undefined") {
              window.localStorage.setItem(
                "priesthood.catchUpQueue",
                JSON.stringify(queue)
              );
              window.localStorage.setItem(
                "priesthood.catchUpMode",
                JSON.stringify(true)
              );
            }
            if (queue.length) {
              setCatchUpStartDay(queue[0]);
              setCurrentPage("dashboard");
            }
            setRecoveryState(null);
          }}
          onResume={() => {
            if (recoveryState.targetDay) {
              setOverallDay(recoveryState.targetDay);
              markGraceDays(
                (recoveryState.missedDays || []).map((day) => day.id),
                new Date().toISOString().slice(0, 10)
              );
              recordCompletion(recoveryState.targetDay - 1);
            }
            setRecoveryState(null);
          }}
          onClose={() => setRecoveryState(null)}
        />
      )}
      {recoveryState?.type === "recenter" && (
        <RecoveryModal
          type="recenter"
          name={safeUserName}
          missedDays={recoveryState.missedDays}
          onRestart={() => {
            if (recoveryState.targetDay) {
              setOverallDay(recoveryState.targetDay);
              markGraceDays(
                (recoveryState.missedDays || []).map((day) => day.id),
                new Date().toISOString().slice(0, 10)
              );
              recordCompletion(recoveryState.targetDay - 1);
            }
            setRecoveryState(null);
          }}
          onClose={() => setRecoveryState(null)}
        />
      )}
      {showToast && recoveryState?.type === "toast" && (
        <RecoveryToast
          message={recoveryState.message}
          onClose={() => {
            setShowToast(false);
            setRecoveryState(null);
          }}
        />
      )}
      {badgeUnlock && (
        <MasteryCelebrationModal
          monthLabel={
            badgeUnlock.title
              ? badgeUnlock.title
              : badgeUnlock.month === 4
                ? "Mastery Complete"
                : badgeUnlock.month === 2
                  ? "Month 2 Complete"
                  : "Milestone Complete"
          }
          badgeImageUrl={
            badgeUnlock.title === "Priesthood Master"
              ? "/assets/CrownOfLife.png"
              : badgeUnlock.title === "Path Finisher"
                ? "/assets/CrownOfLife.png"
                : "/assets/week1-badge.png"
          }
          message={badgeUnlock.message}
          onContinue={clearBadgeUnlock}
        />
      )}
    </div>
  );
}
