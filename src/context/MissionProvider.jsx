import { createContext, useContext, useEffect, useMemo, useState } from "react";
import curriculum from "../data/curriculum.json";
import {
  appendJournalHistory,
  loadReflections,
  saveReflections
} from "../services/JournalService.js";

const MissionContext = createContext(null);

const OFFICE_STORAGE_KEY = "priesthood.office";
const PROGRESS_STORAGE_KEY = "priesthood.progress";
const STARTER_STATE_KEY = "priesthood.starterState";
const BADGE_STORAGE_KEY = "priesthood.badges";
const BADGE_UNLOCK_KEY = "priesthood.badgeUnlock";
const HIGHER_PRIESTHOOD_KEY = "priesthood.higherUnlocked";
const USER_NAME_KEY = "priesthood.userName";
const PHASE_COMPLETIONS_KEY = "priesthood.phaseCompletions";
const PHASE_STATUS_KEY = "priesthood.phaseStatus";
const LAST_ACTIVE_KEY = "priesthood.lastActiveDate";
const LAST_COMPLETED_KEY = "priesthood.lastCompletedDay";
const GRACE_DAYS_KEY = "priesthood.graceDays";
const MANUAL_COMPLETED_KEY = "priesthood.manualCompletedDays";
const MANUAL_COMPLETION_COUNT_KEY = "priesthood.manualCompletionCount";
const PHASE_KEYS = {
  phase1: "phase1_complete",
  phase2: "phase2_complete",
  phase3: "phase3_complete",
  phase4: "phase4_complete",
  phase5: "phase5_complete"
};
const MASTERY_DAYS_BY_MONTH = {
  1: 28,
  2: 28,
  3: 28,
  4: 29
};
const getMasteryDays = (month) => MASTERY_DAYS_BY_MONTH[month] || 28;
const PRIESTHOOD_ORDER_BY_OFFICE = {
  deacon: "Aaronic",
  teacher: "Aaronic",
  priest: "Aaronic",
  elder: "Melchizedek"
};

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const loadFromStorage = (key, fallback) => {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
};

export function MissionProvider({ children }) {
  const [userName, setUserName] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(USER_NAME_KEY) || "";
  });
  const [selectedOffice, setSelectedOffice] = useState(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(OFFICE_STORAGE_KEY);
  });
  const [progressByOffice, setProgressByOffice] = useState(() =>
    loadFromStorage(PROGRESS_STORAGE_KEY, {})
  );
  const [reflectionsByOffice, setReflectionsByOffice] = useState(() =>
    loadReflections()
  );
  const [starterState, setStarterState] = useState(() =>
    loadFromStorage(STARTER_STATE_KEY, {
      isStarterFinished: false,
      currentMonth: 0,
      currentDay: 1,
      month2ReflectionComplete: false,
      masteryComplete: false
    })
  );
  const [badgeUnlock, setBadgeUnlock] = useState(() =>
    loadFromStorage(BADGE_UNLOCK_KEY, null)
  );
  const [badges, setBadges] = useState(() =>
    loadFromStorage(BADGE_STORAGE_KEY, [])
  );
  const [higherUnlocked, setHigherUnlocked] = useState(() =>
    loadFromStorage(HIGHER_PRIESTHOOD_KEY, false)
  );
  const [phaseCompletions, setPhaseCompletions] = useState(() =>
    loadFromStorage(PHASE_COMPLETIONS_KEY, {
      [PHASE_KEYS.phase1]: false,
      [PHASE_KEYS.phase2]: false,
      [PHASE_KEYS.phase3]: false,
      [PHASE_KEYS.phase4]: false,
      [PHASE_KEYS.phase5]: false
    })
  );
  const [phaseCompletion, setPhaseCompletion] = useState(null);
  const [pendingPhaseAdvance, setPendingPhaseAdvance] = useState(null);
  const [phaseReview, setPhaseReview] = useState(null);
  const [phaseStatus, setPhaseStatus] = useState(() =>
    loadFromStorage(PHASE_STATUS_KEY, {
      [PHASE_KEYS.phase1]: null,
      [PHASE_KEYS.phase2]: null,
      [PHASE_KEYS.phase3]: null,
      [PHASE_KEYS.phase4]: null,
      [PHASE_KEYS.phase5]: null
    })
  );
  const [graceDays, setGraceDays] = useState(() => {
    const stored = loadFromStorage(GRACE_DAYS_KEY, {});
    if (Array.isArray(stored)) {
      return stored.reduce((acc, day) => {
        acc[day] = getTodayKey();
        return acc;
      }, {});
    }
    return stored || {};
  });
  const [manualCompletedDays, setManualCompletedDays] = useState(() =>
    loadFromStorage(MANUAL_COMPLETED_KEY, [])
  );
  const [manualCompletionCount, setManualCompletionCount] = useState(() =>
    loadFromStorage(MANUAL_COMPLETION_COUNT_KEY, 0)
  );

  const offices = curriculum.starter_pack;

  useEffect(() => {
    if (!selectedOffice) return;
    window.localStorage.setItem(OFFICE_STORAGE_KEY, selectedOffice);
  }, [selectedOffice]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(USER_NAME_KEY, userName);
  }, [userName]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncFromStorage = () => {
      const storedOffice = window.localStorage.getItem(OFFICE_STORAGE_KEY);
      if (storedOffice && storedOffice !== selectedOffice) {
        setSelectedOffice(storedOffice);
      }
      const storedName = window.localStorage.getItem(USER_NAME_KEY);
      if (storedName && storedName !== userName) {
        setUserName(storedName);
      }
      const storedStarter = loadFromStorage(STARTER_STATE_KEY, null);
      if (
        storedStarter &&
        (storedStarter.currentDay !== starterState.currentDay ||
          storedStarter.currentMonth !== starterState.currentMonth ||
          storedStarter.isStarterFinished !== starterState.isStarterFinished)
      ) {
        setStarterState((prev) => ({
          ...prev,
          ...storedStarter
        }));
      }
    };
    const handleStorage = (event) => {
      if (!event.key) return;
      if (
        event.key === OFFICE_STORAGE_KEY ||
        event.key === STARTER_STATE_KEY
      ) {
        syncFromStorage();
      }
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("visibilitychange", syncFromStorage);
    let intervalId = null;
    if (import.meta.env.DEV) {
      intervalId = window.setInterval(syncFromStorage, 1000);
    }
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("visibilitychange", syncFromStorage);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [selectedOffice, starterState]);

  useEffect(() => {
    window.localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify(progressByOffice)
    );
  }, [progressByOffice]);

  useEffect(() => {
    saveReflections(reflectionsByOffice);
  }, [reflectionsByOffice]);

  useEffect(() => {
    window.localStorage.setItem(
      STARTER_STATE_KEY,
      JSON.stringify(starterState)
    );
  }, [starterState]);

  useEffect(() => {
    window.localStorage.setItem(
      BADGE_UNLOCK_KEY,
      JSON.stringify(badgeUnlock)
    );
  }, [badgeUnlock]);

  useEffect(() => {
    window.localStorage.setItem(
      BADGE_STORAGE_KEY,
      JSON.stringify(badges)
    );
  }, [badges]);

  useEffect(() => {
    window.localStorage.setItem(
      HIGHER_PRIESTHOOD_KEY,
      JSON.stringify(higherUnlocked)
    );
  }, [higherUnlocked]);

  useEffect(() => {
    window.localStorage.setItem(
      PHASE_COMPLETIONS_KEY,
      JSON.stringify(phaseCompletions)
    );
  }, [phaseCompletions]);

  useEffect(() => {
    window.localStorage.setItem(
      PHASE_STATUS_KEY,
      JSON.stringify(phaseStatus)
    );
  }, [phaseStatus]);

  useEffect(() => {
    window.localStorage.setItem(GRACE_DAYS_KEY, JSON.stringify(graceDays));
  }, [graceDays]);

  useEffect(() => {
    window.localStorage.setItem(
      MANUAL_COMPLETED_KEY,
      JSON.stringify(manualCompletedDays)
    );
  }, [manualCompletedDays]);

  useEffect(() => {
    window.localStorage.setItem(
      MANUAL_COMPLETION_COUNT_KEY,
      JSON.stringify(manualCompletionCount)
    );
  }, [manualCompletionCount]);

  const missionState = useMemo(() => {
    if (!selectedOffice || !offices[selectedOffice]) {
      return {
        missions: [],
        activeDay: null,
        activeMission: null,
        isCompletedToday: false,
        completedDay: 0
      };
    }

    const missions = offices[selectedOffice];
    const progress = progressByOffice[selectedOffice] || {
      completedDay: 0,
      completedDate: null
    };
    const todayKey = getTodayKey();
    const isCompletedToday = progress.completedDate === todayKey;
    const nextDay =
      progress.completedDay === 0
        ? 1
        : progress.completedDay + (isCompletedToday ? 0 : 1);
    const activeDay = Math.min(nextDay, missions.length);
    const activeMission =
      missions.find((day) => day.day === activeDay) || null;

    return {
      missions,
      activeDay,
      activeMission,
      isCompletedToday,
      completedDay: progress.completedDay
    };
  }, [offices, progressByOffice, selectedOffice]);

  const priesthoodOrder =
    PRIESTHOOD_ORDER_BY_OFFICE[selectedOffice] || "Aaronic";
  const recordCompletion = (overallDay) => {
    if (typeof window === "undefined") return;
    const todayKey = getTodayKey();
    window.localStorage.setItem(LAST_ACTIVE_KEY, todayKey);
    window.localStorage.setItem(LAST_COMPLETED_KEY, String(overallDay));
  };

  const markGraceDays = (days, dateKey) => {
    if (!days || !days.length) return;
    const stamp = dateKey || getTodayKey();
    setGraceDays((prev) => {
      const updated = { ...(prev || {}) };
      days.forEach((day) => {
        updated[day] = stamp;
      });
      return updated;
    });
  };

  const clearGraceDay = (day) => {
    setGraceDays((prev) => {
      const updated = { ...(prev || {}) };
      delete updated[day];
      return updated;
    });
  };

  const recordManualCompletion = (day) => {
    if (!day) return;
    if (manualCompletedDays.includes(day)) return;
    const nextManual = [...manualCompletedDays, day];
    setManualCompletedDays(nextManual);
    setManualCompletionCount((prev) => prev + 1);
    updatePhaseStatusIfComplete(day, nextManual);
    clearGraceDay(day);
  };

  const allDays = useMemo(() => {
    if (!selectedOffice) return [];
    const starter = (curriculum.starter_pack?.[selectedOffice] || []).map(
      (item) => ({
        id: item.day,
        scripture: item.scripture || "",
        title: item.title || "",
        message: item.message || "",
        challenge: item.challenge || "",
        url: item.url || ""
      })
    );
    const month1 = (curriculum.month_1?.days || []).map((item) => ({
      id: item.day,
      scripture: item.scripture || "",
      title: item.title || "",
      message: item.message || "",
      challenge: item.challenge || "",
      url: item.url || ""
    }));
    const month2Track =
      priesthoodOrder === "Aaronic"
        ? curriculum.month_2?.gatekeeper || []
        : curriculum.month_2?.healer || [];
    const month2 = month2Track.map((item) => ({
      id: item.day,
      scripture: item.scripture || "",
      title: item.title || "",
      message: item.message || "",
      challenge: item.challenge || "",
      url: item.url || ""
    }));
    const month3Track =
      priesthoodOrder === "Aaronic"
        ? curriculum.month_3?.aaronic || []
        : curriculum.month_3?.melchizedek || [];
    const month3 = month3Track.map((item) => ({
      id: item.day,
      scripture: item.scripture || "",
      title: item.title || "",
      message: item.message || "",
      challenge: item.challenge || "",
      url: item.url || ""
    }));
    const month4Track =
      priesthoodOrder === "Aaronic"
        ? curriculum.month_4?.aaronic || []
        : curriculum.month_4?.melchizedek || [];
    const month4 = month4Track.map((item) => ({
      id: item.day,
      scripture: item.scripture || "",
      title: item.title || "",
      message: item.message || "",
      challenge: item.challenge || "",
      url: item.url || ""
    }));
    return [...starter, ...month1, ...month2, ...month3, ...month4];
  }, [priesthoodOrder, selectedOffice]);

  const resolvePhaseCompletion = (overallDay) => {
    const trackLabel =
      priesthoodOrder === "Melchizedek" ? "The Healer" : "The Gatekeeper";
    const content = {
      7: {
        key: PHASE_KEYS.phase1,
        title: "Foundation Laid",
        message:
          "You have mastered the Starter Week. Your foundation is firm and ready to build upon.",
        next: "Next: The Scriptural Priesthood",
        badge: "/assets/ShieldOfFaith.png"
      },
      35: {
        key: PHASE_KEYS.phase2,
        title: "Doctrines Mastered",
        message:
          "Your understanding is deepening. You are ready for specialized training.",
        next: `Next: ${trackLabel} Track`,
        badge: "/assets/TheOpenWord.png"
      },
      63: {
        key: PHASE_KEYS.phase3,
        title: "Skills Acquired",
        message:
          "You have strengthened your gifts. It is time to look outward and lead.",
        next: "Next: Active Stewardship",
        badge: "/assets/KeyOfAuthority.png"
      },
      91: {
        key: PHASE_KEYS.phase4,
        title: "Mission Fulfilled",
        message:
          "Your service has matured. You are ready to receive the crown.",
        next: "Next: Eternal Legacies",
        badge: "/assets/SheppardsStaff.png"
      }
    };
    return content[overallDay] || null;
  };

  const phaseRangeForEndDay = (endDay) => {
    if (endDay === 7) return { key: PHASE_KEYS.phase1, start: 1, end: 7 };
    if (endDay === 35) return { key: PHASE_KEYS.phase2, start: 8, end: 35 };
    if (endDay === 63) return { key: PHASE_KEYS.phase3, start: 36, end: 63 };
    if (endDay === 91) return { key: PHASE_KEYS.phase4, start: 64, end: 91 };
    return null;
  };

  const getPhaseMetrics = (range) => {
    if (!range) return { manualCount: 0, excusedDays: [], total: 0 };
    const total = range.end - range.start + 1;
    const manualCount = manualCompletedDays.filter(
      (day) => day >= range.start && day <= range.end
    ).length;
    const excusedDays = Object.keys(graceDays || {})
      .map((day) => Number(day))
      .filter((day) => day >= range.start && day <= range.end)
      .sort((a, b) => a - b);
    return { manualCount, excusedDays, total };
  };

  const updatePhaseStatusIfComplete = (day, nextManualDays) => {
    const ranges = [
      { key: PHASE_KEYS.phase1, start: 1, end: 7 },
      { key: PHASE_KEYS.phase2, start: 8, end: 35 },
      { key: PHASE_KEYS.phase3, start: 36, end: 63 },
      { key: PHASE_KEYS.phase4, start: 64, end: 91 }
    ];
    const range = ranges.find((item) => day >= item.start && day <= item.end);
    if (!range) return;
    const total = range.end - range.start + 1;
    const count = nextManualDays.filter(
      (value) => value >= range.start && value <= range.end
    ).length;
    if (count >= total) {
      setPhaseStatus((prev) => ({
        ...prev,
        [range.key]: "gold"
      }));
      setPhaseCompletions((prev) => ({
        ...prev,
        [range.key]: true
      }));
    }
  };

  const masteryMission = useMemo(() => {
    if (!starterState.isStarterFinished || !selectedOffice) return null;
    const month = starterState.currentMonth || 1;
    const day = starterState.currentDay || 1;
    const labelDayOffset =
      7 +
      [1, 2, 3].slice(0, month - 1).reduce((sum, key) => sum + getMasteryDays(key), 0);
    if (month === 1 && curriculum.month_1?.days) {
      const labelDay = day + labelDayOffset;
      const entry = curriculum.month_1.days.find(
        (item) => item.day === labelDay
      );
      if (entry) {
        return {
          ...entry,
          day: labelDay
        };
      }
    }
    if (month === 2) {
      const trackKey = priesthoodOrder === "Aaronic" ? "gatekeeper" : "healer";
      const entry = curriculum.month_2?.[trackKey]?.find(
        (item) => item.day === day + labelDayOffset
      );
      if (entry) {
        return {
          ...entry,
          day: entry.day
        };
      }
    }
    if (month === 3) {
      const trackKey = priesthoodOrder === "Aaronic" ? "aaronic" : "melchizedek";
      const entry = curriculum.month_3?.[trackKey]?.find(
        (item) => item.day === day + labelDayOffset
      );
      if (entry) {
        return {
          ...entry,
          day: entry.day
        };
      }
    }
    if (month === 4) {
      const trackKey = priesthoodOrder === "Aaronic" ? "aaronic" : "melchizedek";
      const entry = curriculum.month_4?.[trackKey]?.find(
        (item) => item.day === day + labelDayOffset
      );
      if (entry) {
        return {
          ...entry,
          day: entry.day
        };
      }
    }
    return {
      day: day + labelDayOffset,
      title: `Month ${month} - Day ${day}`,
      scripture: "D&C 84:33",
      url: "https://www.churchofjesuschrist.org/study/scriptures/dc-testament/dc/84?lang=eng&id=33#p33",
      message: "Continue your mastery path with daily, faithful discipline.",
      challenge: "Record one act of leadership or service completed today."
    };
  }, [priesthoodOrder, selectedOffice, starterState]);

  const masteryDay = starterState.currentDay || 1;
  const isCompletedToday = selectedOffice
    ? (progressByOffice[selectedOffice]?.completedDate || null) === getTodayKey()
    : false;
  const activeDay = starterState.isStarterFinished
    ? masteryDay +
      7 +
      [1, 2, 3]
        .slice(0, starterState.currentMonth - 1)
        .reduce((sum, key) => sum + getMasteryDays(key), 0)
    : missionState.activeDay;
  const activeMission = starterState.isStarterFinished
    ? masteryMission
    : missionState.activeMission;

  const advanceMasteryState = (todayKey, completedDayValue) => {
    setStarterState((prev) => {
      const nextDay = prev.currentDay + 1;
      const daysInMonth = getMasteryDays(prev.currentMonth);
      const shouldUnlockMonth3 =
        prev.currentMonth === 2 && prev.currentDay === daysInMonth;
      const shouldCompleteMastery =
        prev.currentMonth === 4 && prev.currentDay === daysInMonth;
      if (shouldUnlockMonth3) {
        const badge =
          priesthoodOrder === "Aaronic"
            ? "The Shield of Faith"
            : "The Oil of Joy";
        setBadges((prevBadges) =>
          prevBadges.includes(badge) ? prevBadges : [...prevBadges, badge]
        );
        setBadgeUnlock({
          title: badge,
          month: 2,
          date: todayKey
        });
      }
      if (shouldCompleteMastery) {
        setPhaseCompletions((prev) => ({
          ...prev,
          [PHASE_KEYS.phase5]: true
        }));
        window.localStorage.setItem(PHASE_KEYS.phase5, JSON.stringify(true));
      }
      if (nextDay > daysInMonth) {
        return {
          ...prev,
          currentMonth:
            prev.currentMonth === 4
              ? 4
              : Math.min(4, prev.currentMonth + 1),
          currentDay: prev.currentMonth === 4 ? daysInMonth : 1,
          month2ReflectionComplete:
            prev.month2ReflectionComplete || shouldUnlockMonth3,
          masteryComplete: prev.masteryComplete || shouldCompleteMastery
        };
      }
      return {
        ...prev,
        currentDay: nextDay,
        month2ReflectionComplete:
          prev.month2ReflectionComplete || shouldUnlockMonth3,
        masteryComplete: prev.masteryComplete || shouldCompleteMastery
      };
    });
    setProgressByOffice((prev) => ({
      ...prev,
      [selectedOffice]: {
        completedDay: completedDayValue,
        completedDate: todayKey
      }
    }));
  };

  const completeMission = () => {
    if (!selectedOffice || isCompletedToday) return;
    const todayKey = getTodayKey();
    if (starterState.isStarterFinished) {
      window.localStorage.setItem(
        `day_${todayKey}_completed`,
        JSON.stringify(true)
      );
      recordCompletion(activeDay);
      const phaseInfo = resolvePhaseCompletion(activeDay);
      if (phaseInfo && !phaseCompletions[phaseInfo.key]) {
        const range = phaseRangeForEndDay(activeDay);
        const metrics = getPhaseMetrics(range);
        if (metrics.excusedDays.length > 0 && metrics.manualCount < metrics.total) {
          setPhaseReview({
            phase: phaseInfo,
            range,
            ...metrics
          });
          setPendingPhaseAdvance({
            type: "mastery",
            todayKey,
            completedDayValue: starterState.currentDay
          });
          return;
        }
        setPhaseCompletion(phaseInfo);
        setPendingPhaseAdvance({
          type: "mastery",
          todayKey,
          completedDayValue: starterState.currentDay
        });
        return;
      }
      advanceMasteryState(todayKey, starterState.currentDay);
      return;
    }
    window.localStorage.setItem(
      `day_${todayKey}_completed`,
      JSON.stringify(true)
    );
    recordCompletion(missionState.activeDay || 0);
    setProgressByOffice((prev) => ({
      ...prev,
      [selectedOffice]: {
        completedDay: missionState.activeDay || 0,
        completedDate: todayKey
      }
    }));
  };

  const saveReflection = (day, text) => {
    if (!selectedOffice || !day) return;
    setReflectionsByOffice((prev) => ({
      ...prev,
      [selectedOffice]: {
        ...(prev[selectedOffice] || {}),
        [day]: text
      }
    }));
    recordManualCompletion(day);
    const entry = {
      type: "daily",
      date: new Date().toISOString(),
      office: selectedOffice,
      prompt:
        "Record how this assignment shaped your confidence and spiritual focus today.",
      response: text
    };
    window.localStorage.setItem(
      `reflection_${selectedOffice}_${day}_${Date.now()}`,
      JSON.stringify(entry)
    );
    if (typeof window !== "undefined") {
      const todayKey = getTodayKey();
      window.localStorage.setItem(LAST_ACTIVE_KEY, todayKey);
      const lastCompleted = Number(
        window.localStorage.getItem(LAST_COMPLETED_KEY) || 0
      );
      const nextCompleted = Math.max(lastCompleted, day);
      window.localStorage.setItem(LAST_COMPLETED_KEY, String(nextCompleted));
    }
    if (day === 120) {
      const updatedCount = manualCompletedDays.includes(day)
        ? manualCompletionCount
        : manualCompletionCount + 1;
      if (updatedCount >= 108) {
        const badge = "Priesthood Master";
        setBadges((prevBadges) =>
          prevBadges.includes(badge) ? prevBadges : [...prevBadges, badge]
        );
        setBadgeUnlock({
          title: badge,
          month: 4,
          date: getTodayKey()
        });
      } else {
        const badge = "Path Finisher";
        setBadges((prevBadges) =>
          prevBadges.includes(badge) ? prevBadges : [...prevBadges, badge]
        );
        setBadgeUnlock({
          title: badge,
          month: 4,
          date: getTodayKey(),
          message:
            "You have finished the journey! To earn the Gold Mastery, go back and complete your remaining Excused days."
        });
      }
    }
  };

  const getReflection = (day) => {
    if (!selectedOffice || !day) return "";
    return reflectionsByOffice[selectedOffice]?.[day] || "";
  };

  const completeWeeklyReflection = (responses) => {
    if (!selectedOffice) return;
    const entry = {
      id: crypto.randomUUID ? crypto.randomUUID() : `weekly-${Date.now()}`,
      date: new Date().toISOString(),
      office: selectedOffice,
      responses
    };
    appendJournalHistory(entry);
    const sundayEntries = Object.entries(responses || {}).map(([prompt, response]) => ({
      type: "sunday",
      date: new Date().toISOString(),
      office: selectedOffice,
      prompt,
      response
    }));
    window.localStorage.setItem(
      `sunday_report_${Date.now()}`,
      JSON.stringify(sundayEntries)
    );
    recordManualCompletion(7);
    recordCompletion(7);
    const phaseInfo = resolvePhaseCompletion(7);
    if (phaseInfo && !phaseCompletions[phaseInfo.key]) {
      const range = phaseRangeForEndDay(7);
      const metrics = getPhaseMetrics(range);
      if (metrics.excusedDays.length > 0 && metrics.manualCount < metrics.total) {
        setPhaseReview({
          phase: phaseInfo,
          range,
          ...metrics
        });
        setPendingPhaseAdvance({ type: "starter" });
        return;
      }
      setPhaseCompletion(phaseInfo);
      setPendingPhaseAdvance({ type: "starter" });
      return;
    }
    setStarterState({
      isStarterFinished: true,
      currentMonth: 1,
      currentDay: 1
    });
    setProgressByOffice((prev) => ({
      ...prev,
      [selectedOffice]: {
        completedDay: 0,
        completedDate: null
      }
    }));
  };

  const continuePhaseCompletion = () => {
    if (!phaseCompletion) return;
    if (navigator?.vibrate) {
      navigator.vibrate(25);
    }
    setPhaseCompletions((prev) => ({
      ...prev,
      [phaseCompletion.key]: true
    }));
    window.localStorage.setItem(
      phaseCompletion.key,
      JSON.stringify(true)
    );
    if (pendingPhaseAdvance?.type === "starter") {
      setStarterState({
        isStarterFinished: true,
        currentMonth: 1,
        currentDay: 1
      });
      setProgressByOffice((prev) => ({
        ...prev,
        [selectedOffice]: {
          completedDay: 0,
          completedDate: null
        }
      }));
    }
    if (pendingPhaseAdvance?.type === "mastery") {
      advanceMasteryState(
        pendingPhaseAdvance.todayKey,
        pendingPhaseAdvance.completedDayValue
      );
    }
    setPhaseCompletion(null);
    setPendingPhaseAdvance(null);
  };

  const proceedPhaseWithSilver = () => {
    if (!phaseReview?.range?.key) return;
    setPhaseStatus((prev) => ({
      ...prev,
      [phaseReview.range.key]: "silver"
    }));
    setPhaseCompletions((prev) => ({
      ...prev,
      [phaseReview.range.key]: true
    }));
    if (pendingPhaseAdvance?.type === "starter") {
      setStarterState({
        isStarterFinished: true,
        currentMonth: 1,
        currentDay: 1
      });
      setProgressByOffice((prev) => ({
        ...prev,
        [selectedOffice]: {
          completedDay: 0,
          completedDate: null
        }
      }));
    }
    if (pendingPhaseAdvance?.type === "mastery") {
      advanceMasteryState(
        pendingPhaseAdvance.todayKey,
        pendingPhaseAdvance.completedDayValue
      );
    }
    setPhaseReview(null);
    setPendingPhaseAdvance(null);
  };

  const reviewPhaseExcused = () => {
    if (!phaseReview?.excusedDays?.length) return;
    const first = phaseReview.excusedDays[0];
    setOverallDay(first);
    setPhaseReview(null);
    setPendingPhaseAdvance(null);
  };

  const debugAdvanceDay = () => {
    if (!selectedOffice) return;
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .slice(0, 10);
    if (starterState.isStarterFinished) {
      setStarterState((prev) => {
        const nextDay = prev.currentDay + 1;
        const daysInMonth = getMasteryDays(prev.currentMonth);
    const shouldUnlockMonth3 =
      prev.currentMonth === 2 && prev.currentDay === daysInMonth;
        if (nextDay > daysInMonth) {
          return {
            ...prev,
            currentMonth: Math.min(4, prev.currentMonth + 1),
            currentDay: 1,
        month2ReflectionComplete:
          prev.month2ReflectionComplete || shouldUnlockMonth3,
        masteryComplete: prev.masteryComplete
          };
        }
        return {
          ...prev,
          currentDay: nextDay,
          month2ReflectionComplete:
            prev.month2ReflectionComplete || shouldUnlockMonth3
        };
      });
      setProgressByOffice((prev) => ({
        ...prev,
        [selectedOffice]: {
          completedDay: masteryDay,
          completedDate: yesterday
        }
      }));
      return;
    }
    if (!offices[selectedOffice]) return;
    const missions = offices[selectedOffice];
    const currentActive = missionState.activeDay || 1;
    const nextCompleted = Math.min(missions.length, currentActive);
    setProgressByOffice((prev) => ({
      ...prev,
      [selectedOffice]: {
        completedDay: nextCompleted,
        completedDate: yesterday
      }
    }));
  };

  const setOverallDay = (overallDay) => {
    if (!selectedOffice) return;
    if (overallDay <= 7) {
      setStarterState((prev) => ({
        ...prev,
        isStarterFinished: false,
        currentMonth: 0,
        currentDay: 1,
        month2ReflectionComplete: false
      }));
      setProgressByOffice((prev) => ({
        ...prev,
        [selectedOffice]: {
          completedDay: Math.max(0, overallDay - 1),
          completedDate: null
        }
      }));
      return;
    }
    const monthBreaks = [
      { month: 1, start: 8, end: 35 },
      { month: 2, start: 36, end: 63 },
      { month: 3, start: 64, end: 91 },
      { month: 4, start: 92, end: 120 }
    ];
    const target = monthBreaks.find(
      (entry) => overallDay >= entry.start && overallDay <= entry.end
    );
    if (!target) return;
    const dayInMonth = overallDay - target.start + 1;
    setStarterState((prev) => ({
      ...prev,
      isStarterFinished: true,
      currentMonth: target.month,
      currentDay: dayInMonth,
      month2ReflectionComplete: overallDay > 63 || prev.month2ReflectionComplete
    }));
    setProgressByOffice((prev) => ({
      ...prev,
      [selectedOffice]: {
        completedDay: Math.max(0, dayInMonth - 1),
        completedDate: null
      }
    }));
  };

  const debugSetOverallDay = (overallDay) => {
    setOverallDay(overallDay);
  };

  const debugToggleOrder = () => {
    const nextOffice =
      PRIESTHOOD_ORDER_BY_OFFICE[selectedOffice] === "Aaronic"
        ? "elder"
        : "deacon";
    setSelectedOffice(nextOffice);
  };

  const debugResetAll = () => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(OFFICE_STORAGE_KEY);
    window.localStorage.removeItem(PROGRESS_STORAGE_KEY);
    window.localStorage.removeItem(STARTER_STATE_KEY);
    window.localStorage.removeItem(BADGE_STORAGE_KEY);
    window.localStorage.removeItem(BADGE_UNLOCK_KEY);
    window.localStorage.removeItem(HIGHER_PRIESTHOOD_KEY);
    window.localStorage.removeItem(PHASE_COMPLETIONS_KEY);
    window.localStorage.removeItem(PHASE_STATUS_KEY);
    window.localStorage.removeItem(PHASE_KEYS.phase1);
    window.localStorage.removeItem(PHASE_KEYS.phase2);
    window.localStorage.removeItem(PHASE_KEYS.phase3);
    window.localStorage.removeItem(PHASE_KEYS.phase4);
    window.localStorage.removeItem(PHASE_KEYS.phase5);
    window.localStorage.removeItem(LAST_ACTIVE_KEY);
    window.localStorage.removeItem(LAST_COMPLETED_KEY);
    window.localStorage.removeItem(GRACE_DAYS_KEY);
    window.localStorage.removeItem(MANUAL_COMPLETED_KEY);
    window.localStorage.removeItem(MANUAL_COMPLETION_COUNT_KEY);
    window.localStorage.removeItem(USER_NAME_KEY);
    setSelectedOffice(null);
    setUserName("");
    setProgressByOffice({});
    setStarterState({
      isStarterFinished: false,
      currentMonth: 0,
      currentDay: 1,
      month2ReflectionComplete: false,
      masteryComplete: false
    });
    setBadgeUnlock(null);
    setBadges([]);
    setHigherUnlocked(false);
    setPhaseCompletions({
      [PHASE_KEYS.phase1]: false,
      [PHASE_KEYS.phase2]: false,
      [PHASE_KEYS.phase3]: false,
      [PHASE_KEYS.phase4]: false,
      [PHASE_KEYS.phase5]: false
    });
    setPhaseStatus({
      [PHASE_KEYS.phase1]: null,
      [PHASE_KEYS.phase2]: null,
      [PHASE_KEYS.phase3]: null,
      [PHASE_KEYS.phase4]: null,
      [PHASE_KEYS.phase5]: null
    });
    setPhaseCompletion(null);
    setPendingPhaseAdvance(null);
    setPhaseReview(null);
    setGraceDays({});
    setManualCompletedDays([]);
    setManualCompletionCount(0);
  };

  const debugCompleteMonth = () => {
    if (!selectedOffice) return;
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .slice(0, 10);
    if (starterState.isStarterFinished) {
      setStarterState((prev) => {
        const shouldUnlockMonth3 =
          prev.currentMonth === 2 &&
          prev.currentDay <= MASTERY_DAYS_PER_MONTH;
        const nextMonth = Math.min(4, prev.currentMonth + 1);
        return {
          ...prev,
          currentMonth: nextMonth,
          currentDay: 1,
          month2ReflectionComplete:
            prev.month2ReflectionComplete || shouldUnlockMonth3
        };
      });
      setProgressByOffice((prev) => ({
        ...prev,
        [selectedOffice]: {
          completedDay: MASTERY_DAYS_PER_MONTH,
          completedDate: yesterday
        }
      }));
      return;
    }
    if (!offices[selectedOffice]) return;
    const missions = offices[selectedOffice];
    setProgressByOffice((prev) => ({
      ...prev,
      [selectedOffice]: {
        completedDay: missions.length,
        completedDate: yesterday
      }
    }));
  };

  const value = {
    offices,
    userName,
    setUserName,
    selectedOffice,
    setSelectedOffice,
    isStarterFinished: starterState.isStarterFinished,
    masteryMonth: starterState.currentMonth,
    masteryDay: starterState.currentDay,
    month2ReflectionComplete: starterState.month2ReflectionComplete,
    priesthoodOrder,
    activeDay,
    activeMission,
    isCompletedToday,
    completedDay: starterState.isStarterFinished
      ? Math.max(0, masteryDay - 1)
      : missionState.completedDay,
    completeMission,
    reflectionsByOffice,
    saveReflection,
    getReflection,
    completeWeeklyReflection,
    debugAdvanceDay,
    debugCompleteMonth,
    debugSetOverallDay,
    debugToggleOrder,
    debugResetAll,
    badgeUnlock,
    clearBadgeUnlock: () => setBadgeUnlock(null),
    masteryComplete: starterState.masteryComplete,
    badges,
    higherUnlocked,
    triggerHigherUnlocked: () => setHigherUnlocked(true),
    clearHigherUnlocked: () => setHigherUnlocked(false),
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
    manualCompletedDays,
    manualCompletionCount
  };

  return <MissionContext.Provider value={value}>{children}</MissionContext.Provider>;
}

export function useMission() {
  const context = useContext(MissionContext);
  if (!context) {
    throw new Error("useMission must be used within MissionProvider");
  }
  return context;
}
