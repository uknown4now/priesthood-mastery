import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "priesthood.habitRecords";
const USER_ID_KEY = "priesthood.userId";
const HABIT_KEYS = ["scripture", "prayer", "service"];
const HABIT_INDEX = { scripture: 1, prayer: 2, service: 3 };
const TOTAL_DAYS = 120;

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const loadRecords = () => {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    return {};
  }
};

const saveRecords = (records) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

const getOrCreateUserId = () => {
  if (typeof window === "undefined") return "anonymous";
  const existing = window.localStorage.getItem(USER_ID_KEY);
  if (existing) return existing;
  const next =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `user-${Date.now()}`;
  window.localStorage.setItem(USER_ID_KEY, next);
  return next;
};

const buildKey = (userId, date, habitIndex) =>
  `${userId}:${date}:${habitIndex}`;

const getStartDate = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (TOTAL_DAYS - 1));
  return start;
};

export default function useHabitRecords({ activeDay } = {}) {
  const userId = useMemo(getOrCreateUserId, []);
  const [records, setRecords] = useState(loadRecords);
  const [todayKey, setTodayKey] = useState(getTodayKey);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextKey = getTodayKey();
      setTodayKey((prev) => (prev === nextKey ? prev : nextKey));
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getHabitsForDate = useCallback(
    (dateKey, source = records) => {
      const habits = { scripture: false, prayer: false, service: false };
      HABIT_KEYS.forEach((key) => {
        const habitIndex = HABIT_INDEX[key];
        const record = source[buildKey(userId, dateKey, habitIndex)];
        if (record?.completed) {
          habits[key] = true;
        }
      });
      return habits;
    },
    [records, userId]
  );

  const habits = useMemo(
    () => getHabitsForDate(todayKey),
    [getHabitsForDate, todayKey]
  );

  const toggleHabit = useCallback(
    (habitKey) => {
      const habitIndex = HABIT_INDEX[habitKey];
      if (!habitIndex) return;
      setRecords((prev) => {
        const recordKey = buildKey(userId, todayKey, habitIndex);
        const current = Boolean(prev[recordKey]?.completed);
        const next = {
          ...prev,
          [recordKey]: {
            userId,
            date: todayKey,
            habitIndex,
            completed: !current
          }
        };
        saveRecords(next);
        return next;
      });
    },
    [todayKey, userId]
  );

  const totals = useMemo(() => {
    const counts = { scripture: 0, prayer: 0, service: 0 };
    const start = getStartDate();
    Object.values(records).forEach((record) => {
      if (!record?.completed || record.userId !== userId) return;
      const date = new Date(record.date);
      if (Number.isNaN(date.getTime()) || date < start) return;
      const habitKey = HABIT_KEYS[record.habitIndex - 1];
      if (habitKey) counts[habitKey] += 1;
    });
    return counts;
  }, [records, userId]);

  const weeklyHabitsCount = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    const dayMap = {};
    Object.values(records).forEach((record) => {
      if (!record?.completed || record.userId !== userId) return;
      const date = new Date(record.date);
      if (Number.isNaN(date.getTime()) || date < start || date > end) return;
      const dateKey = record.date;
      if (!dayMap[dateKey]) {
        dayMap[dateKey] = new Set();
      }
      dayMap[dateKey].add(record.habitIndex);
    });
    return Object.values(dayMap).reduce((count, set) => {
      return set.size >= 3 ? count + 1 : count;
    }, 0);
  }, [records, userId]);

  useEffect(() => {
    if (typeof window === "undefined" || !activeDay) return;
    const todayHabits = getHabitsForDate(todayKey);
    let habitsByDay = {};
    try {
      habitsByDay = JSON.parse(
        window.localStorage.getItem("priesthood.habitsByDay") || "{}"
      );
    } catch (error) {
      habitsByDay = {};
    }
    habitsByDay[activeDay] = todayHabits;
    window.localStorage.setItem(
      "priesthood.habitsByDay",
      JSON.stringify(habitsByDay)
    );

    let journal = {};
    try {
      journal = JSON.parse(
        window.localStorage.getItem("priesthood.journalEntries") || "{}"
      );
    } catch (error) {
      journal = {};
    }
    journal[todayKey] = {
      ...(journal[todayKey] || {}),
      habits: todayHabits
    };
    window.localStorage.setItem(
      "priesthood.journalEntries",
      JSON.stringify(journal)
    );
  }, [activeDay, getHabitsForDate, todayKey, records]);

  return { habits, toggleHabit, totals, weeklyHabitsCount };
}
