const HABITS = [
  { key: "scripture", label: "Scripture", icon: BookIcon },
  { key: "prayer", label: "Prayer", icon: HandsIcon },
  { key: "service", label: "Service", icon: HeartIcon }
];

export default function HabitTracker({ habits, onToggle }) {
  const completedCount = Object.values(habits).filter(Boolean).length;

  return (
    <section className="mb-6 rounded-2xl border border-white/20 bg-[rgba(var(--color-surface),0.8)] p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">Daily Habit Tracker</h3>
        <span className="text-xs text-gray-400">{completedCount} / 3 completed</span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {HABITS.map(({ key, label, icon: Icon }) => {
          const isActive = habits[key];
          return (
            <button
              key={key}
              onClick={() => onToggle(key)}
              className={`flex flex-col items-center gap-2 rounded-xl border px-2 py-3 text-xs font-medium transition ${
                isActive
                  ? "border-gold-500/80 bg-gold-500/20 text-gold-500"
                  : "border-white/10 bg-[rgba(var(--color-surface),0.8)] text-gray-200 hover:border-white/30"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function BookIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M5 5.5C5 4.12 6.12 3 7.5 3H19v16.5a2.5 2.5 0 0 0-2.5-2.5H7.5A2.5 2.5 0 0 0 5 19.5V5.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M7.5 3H5v13.5A2.5 2.5 0 0 1 7.5 14H19"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function HandsIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M6 12v-1.5a2 2 0 0 1 4 0V12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M10 12v-3a2 2 0 1 1 4 0v3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M14 12v-2a2 2 0 1 1 4 0v4.5a4.5 4.5 0 0 1-9 0V12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HeartIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 20s-6.5-4.1-8.5-8.2C2 8.7 3.7 6 6.5 6c1.8 0 3.1 1 3.5 2.3C10.4 7 11.7 6 13.5 6 16.3 6 18 8.7 16.5 11.8 14.5 15.9 12 20 12 20Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
