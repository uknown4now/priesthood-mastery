const REFLECTION_STORAGE_KEY = "priesthood.reflections";
const JOURNAL_HISTORY_KEY = "priesthood.journalHistory";

export const loadReflections = () => {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(REFLECTION_STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (error) {
    return {};
  }
};

export const saveReflections = (reflections) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    REFLECTION_STORAGE_KEY,
    JSON.stringify(reflections || {})
  );
};

export const loadJournalHistory = () => {
  if (typeof window === "undefined") return { entries: [] };
  const raw = window.localStorage.getItem(JOURNAL_HISTORY_KEY);
  if (!raw) return { entries: [] };
  try {
    return JSON.parse(raw);
  } catch (error) {
    return { entries: [] };
  }
};

export const appendJournalHistory = (entry) => {
  if (typeof window === "undefined") return;
  const history = loadJournalHistory();
  const updated = {
    entries: [entry, ...(history.entries || [])]
  };
  window.localStorage.setItem(JOURNAL_HISTORY_KEY, JSON.stringify(updated));
};
