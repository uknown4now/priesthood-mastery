import { useMemo, useState } from "react";

const FILTERS = ["All", "Daily Missions", "Sunday Reports"];

const promptByType = {
  daily: "Record how this assignment shaped your confidence and spiritual focus today.",
  sunday: "Weekly Account of Stewardship"
};

const parseEntriesFromStorage = () => {
  if (typeof window === "undefined") return [];
  const entries = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key) continue;
    if (key.startsWith("reflection_")) {
      const raw = window.localStorage.getItem(key);
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((entry) => entries.push(entry));
        } else if (parsed) {
          entries.push(parsed);
        }
      } catch (error) {
        // ignore malformed
      }
    }
    if (key.startsWith("sunday_report_")) {
      const raw = window.localStorage.getItem(key);
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((entry) => entries.push(entry));
        } else if (parsed) {
          entries.push(parsed);
        }
      } catch (error) {
        // ignore malformed
      }
    }
  }
  return entries;
};

const formatDate = (iso) => {
  if (!iso) return "Unknown date";
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

const calculateStreak = (entries) => {
  const daySet = new Set(
    entries
      .filter((entry) => entry.type === "daily")
      .map((entry) => entry.date?.slice(0, 10))
      .filter(Boolean)
  );
  if (daySet.size === 0) return 0;
  let streak = 0;
  let cursor = new Date();
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (daySet.has(key)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
};

export default function Journal() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const entries = useMemo(() => parseEntriesFromStorage(), []);

  const filteredEntries = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return entries
      .filter((entry) => {
        if (activeFilter === "Daily Missions" && entry.type !== "daily") {
          return false;
        }
        if (activeFilter === "Sunday Reports" && entry.type !== "sunday") {
          return false;
        }
        return true;
      })
      .filter((entry) => {
        const prompt = entry.prompt || promptByType[entry.type] || "";
        const response = entry.response || "";
        return (
          prompt.toLowerCase().includes(term) ||
          response.toLowerCase().includes(term) ||
          (entry.office || "").toLowerCase().includes(term)
        );
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [activeFilter, entries, searchTerm]);

  const totalEntries = entries.length;
  const currentStreak = calculateStreak(entries);
  const milestone =
    totalEntries < 7
      ? "3 weeks until Teacher advancement"
      : totalEntries < 30
        ? "2 weeks until Teacher advancement"
        : "On track for your next advancement";

  const handleExport = async () => {
    const lines = filteredEntries.map((entry) => {
      const prompt = entry.prompt || promptByType[entry.type] || "Prompt";
      return `--- ${formatDate(entry.date)} --- Office: ${entry.office || "Unknown"} Question: ${prompt} Reflection: ${entry.response || ""} ----------------`;
    });
    const payload = lines.join("\n");
    try {
      await navigator.clipboard.writeText(payload);
    } catch (error) {
      // ignore clipboard failure
    }
  };

  return (
    <>
      <header className="mb-6">
        <p className="text-sm uppercase tracking-[0.2em] text-gray-400">Journal</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          Chronicle of Service
        </h2>
        <p className="mt-2 text-sm text-gray-300">
          Search and review every reflection and Sunday report.
        </p>
      </header>

      <section className="mb-6 rounded-2xl border border-white/20 bg-[rgba(var(--color-surface),0.8)] p-5 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.25em] text-gold-500">
          Mastery Stats
        </p>
        <div className="mt-3 grid gap-3 text-sm text-gray-200">
          <div className="flex items-center justify-between">
            <span>Total Entries</span>
            <span className="font-semibold text-white">{totalEntries}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Current Streak</span>
            <span className="font-semibold text-white">{currentStreak} days</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Milestone</span>
            <span className="font-semibold text-white">{milestone}</span>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="mt-4 w-full rounded-xl border border-gold-500/40 bg-gold-500/10 px-4 py-3 text-sm font-semibold text-gold-500 transition hover:border-gold-500 hover:bg-gold-500/20"
        >
          Export Journal
        </button>
      </section>

      <div className="mb-4 rounded-2xl border border-white/20 bg-[rgba(var(--color-surface),0.8)] p-4 backdrop-blur-xl">
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search your journal"
          className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 focus:border-gold-500/60 focus:outline-none"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  isActive
                    ? "bg-gold-500 text-slate-900"
                    : "border border-white/10 bg-[rgba(var(--color-surface),0.8)] text-gray-200 hover:border-gold-500/60"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[rgba(var(--color-surface),0.8)] p-6 text-center text-sm text-gray-300">
          Your spiritual record is empty. Complete a mission to begin your
          chronicle.
        </div>
      ) : (
        <div className="grid gap-4 pb-8">
          {filteredEntries.map((entry, index) => {
            const prompt = entry.prompt || promptByType[entry.type] || "Prompt";
            const isSunday = entry.type === "sunday";
            return (
              <div
                key={`${entry.date}-${index}`}
                className={`rounded-2xl border p-5 text-sm ${
                  isSunday
                    ? "border-gold-500/60 bg-[rgba(var(--color-surface),0.8)]"
                    : "border-white/10 bg-[rgba(var(--color-surface),0.8)]"
                }`}
              >
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{formatDate(entry.date)}</span>
                  <span>{entry.office || "Unknown Office"}</span>
                </div>
                <p className="mt-3 text-sm font-semibold text-white">{prompt}</p>
                <p className="mt-2 text-sm text-gray-200">{entry.response}</p>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
