import { useEffect, useState } from "react";

export default function DeveloperToolbar({
  userName,
  onUpdateName,
  currentDay,
  onSetDay,
  selectedOffice,
  onUpdateOffice
}) {
  const [nameInput, setNameInput] = useState(userName || "");
  const [dayInput, setDayInput] = useState(currentDay || 1);
  const [open, setOpen] = useState(false);
  const [officeInput, setOfficeInput] = useState(selectedOffice || "");
  const [lastActiveInput, setLastActiveInput] = useState("");

  useEffect(() => {
    setNameInput(userName || "");
  }, [userName]);

  useEffect(() => {
    setDayInput(currentDay || 1);
  }, [currentDay]);

  useEffect(() => {
    setOfficeInput(selectedOffice || "");
  }, [selectedOffice]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("priesthood.lastActiveDate") || "";
    setLastActiveInput(stored);
  }, [open]);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {open && (
        <div className="mb-2 w-72 rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 text-xs text-gray-200 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-gray-400">
            Developer Settings
            <button
              onClick={() => setOpen(false)}
              className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-gray-300 hover:border-white/30"
            >
              Hide
            </button>
          </div>
          <div className="mt-2 flex gap-2">
            <input
              value={nameInput}
              onChange={(event) => setNameInput(event.target.value)}
              onBlur={() => onUpdateName(nameInput)}
              placeholder="Test name"
              className="flex-1 rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-xs text-gray-100 placeholder:text-gray-500 focus:border-gold-500/60 focus:outline-none"
            />
            <button
              onClick={() => onUpdateName(nameInput)}
              className="rounded-xl border border-gold-500/40 bg-gold-500/10 px-3 py-2 text-xs font-semibold text-gold-500"
            >
              Set
            </button>
          </div>
          <div className="mt-2">
            <select
              value={officeInput}
              onChange={(event) => {
                const value = event.target.value;
                setOfficeInput(value);
                onUpdateOffice(value);
              }}
              className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-xs text-gray-100 focus:border-gold-500/60 focus:outline-none"
            >
              <option value="" disabled>
                Select office
              </option>
              {["deacon", "teacher", "priest", "elder"].map((office) => (
                <option key={office} value={office}>
                  {office.charAt(0).toUpperCase() + office.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="range"
              min="1"
              max="120"
              value={dayInput}
              onChange={(event) => setDayInput(Number(event.target.value))}
              onMouseUp={() => onSetDay(dayInput)}
              onTouchEnd={() => onSetDay(dayInput)}
              className="flex-1"
            />
            <input
              type="number"
              min="1"
              max="120"
              value={dayInput}
              onChange={(event) => {
                const value = Number(event.target.value);
                setDayInput(value);
                if (!Number.isNaN(value)) onSetDay(value);
              }}
              className="w-16 rounded-xl border border-white/10 bg-slate-900/70 px-2 py-2 text-xs text-gray-100 focus:border-gold-500/60 focus:outline-none"
            />
          </div>
          <div className="mt-2 flex gap-2">
            <input
              type="date"
              value={lastActiveInput}
              onChange={(event) => setLastActiveInput(event.target.value)}
              className="flex-1 rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-xs text-gray-100 focus:border-gold-500/60 focus:outline-none"
            />
            <button
              onClick={() => {
                if (typeof window === "undefined") return;
                if (lastActiveInput) {
                  window.localStorage.setItem(
                    "priesthood.lastActiveDate",
                    lastActiveInput
                  );
                }
              }}
              className="rounded-xl border border-gold-500/40 bg-gold-500/10 px-3 py-2 text-xs font-semibold text-gold-500"
            >
              Set Last Active
            </button>
          </div>
          <button
            onClick={() => {
              if (typeof window === "undefined") return;
              window.localStorage.removeItem("priesthood.recoveryShown");
            }}
            className="mt-2 w-full rounded-xl border border-white/20 px-3 py-2 text-[10px] font-semibold text-gray-200 transition hover:border-gold-500/60"
          >
            Clear Recovery Prompt Lock
          </button>
        </div>
      )}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-full border border-gold-500/40 bg-gold-500/10 px-3 py-2 text-xs font-semibold text-gold-500"
      >
        Dev
      </button>
    </div>
  );
}
