import { useMemo, useState } from "react";

const JOURNAL_STORAGE_KEY = "priesthood.journal";

const QUESTIONS = [
  {
    id: "ordinance",
    label: "The Ordinance",
    prompt:
      "How did you feel while participating in or watching the Sacrament today?"
  },
  {
    id: "habit",
    label: "The Habit",
    prompt:
      "You completed [X/7] of your daily habits this week. What interfered with your consistency?"
  },
  {
    id: "mission",
    label: "The Mission",
    prompt:
      "Which daily priesthood mission was the most impactful for you this week and why?"
  },
  {
    id: "people",
    label: "The People",
    prompt:
      "Who did you notice this week that might need a priesthood blessing or a friend?"
  },
  {
    id: "commitment",
    label: "The Commitment",
    prompt:
      "What is one specific priesthood goal you are setting for next week?"
  }
];

const loadJournal = () => {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(JOURNAL_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
};

export default function ReflectionWizard({
  weeklyHabitsCount,
  selectedOffice,
  weeklyReflections,
  onSubmitComplete
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const activeQuestion = useMemo(() => QUESTIONS[stepIndex], [stepIndex]);
  const totalSteps = QUESTIONS.length;
  const progress = Math.round(((stepIndex + 1) / totalSteps) * 100);

  const promptText = activeQuestion.prompt.replace(
    "[X/7]",
    `${weeklyHabitsCount}/7`
  );

  const handleChange = (event) => {
    setResponses((prev) => ({
      ...prev,
      [activeQuestion.id]: event.target.value
    }));
  };

  const handleNext = () => {
    setStepIndex((prev) => Math.min(totalSteps - 1, prev + 1));
  };

  const handleBack = () => {
    setStepIndex((prev) => Math.max(0, prev - 1));
  };

  const handleSubmit = () => {
    const entry = {
      id: crypto.randomUUID ? crypto.randomUUID() : `entry-${Date.now()}`,
      date: new Date().toISOString(),
      office: selectedOffice,
      responses
    };
    const journal = loadJournal();
    const updated = [entry, ...journal];
    window.localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(updated));
    setSubmitted(true);
    onSubmitComplete?.();
  };

  if (submitted) {
    return (
      <section className="rounded-2xl border border-white/20 bg-[rgba(var(--color-surface),0.8)] p-6 text-center backdrop-blur-xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold-500/20 text-gold-500 shadow-[0_0_30px_rgba(234,179,8,0.35)]">
          <SparkleIcon className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold text-white">Badge Unlocked</h3>
        <p className="mt-2 text-sm text-gray-300">
          First Week Starter Pack completed. Your reflections are saved.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/20 bg-[rgba(var(--color-surface),0.8)] p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span className="uppercase tracking-[0.2em] text-gold-500">
          Weekly Account of Stewardship
        </span>
        <span>{progress}%</span>
      </div>
      {weeklyReflections?.length ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-[rgba(var(--color-surface),0.8)] p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
            Weekly Notes
          </p>
          <div className="mt-3 space-y-3 text-sm text-gray-200">
            {weeklyReflections.map((entry) => (
              <div key={entry.day}>
                <p className="text-xs text-gray-400">
                  Day {entry.day}: {entry.title}
                </p>
                <p>{entry.reflection}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-4">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
          {activeQuestion.label}
        </p>
        <h3 className="mt-2 text-lg font-semibold text-white">{promptText}</h3>
        <textarea
          value={responses[activeQuestion.id] || ""}
          onChange={handleChange}
          placeholder="Write your reflection..."
          rows={5}
          className="mt-4 w-full resize-none rounded-xl border border-white/10 bg-[rgba(var(--color-surface),0.8)] px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 focus:border-gold-500/60 focus:outline-none"
        />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={stepIndex === 0}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
            stepIndex === 0
              ? "cursor-not-allowed bg-white/10 text-gray-500"
              : "border border-white/20 text-gray-200 hover:border-gold-500/60"
          }`}
        >
          Back
        </button>
        {stepIndex < totalSteps - 1 ? (
          <button
            onClick={handleNext}
            className="rounded-full bg-gold-500 px-5 py-2 text-xs font-semibold text-slate-900 transition hover:bg-gold-400"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="rounded-full bg-gold-500 px-5 py-2 text-xs font-semibold text-slate-900 transition hover:bg-gold-400"
          >
            Submit
          </button>
        )}
      </div>
    </section>
  );
}

function SparkleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3 13.8 8.2 19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
