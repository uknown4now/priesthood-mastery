import { useMemo, useState } from "react";
import { createPortal } from "react-dom";

const QUESTIONS = [
  {
    id: "ordinance",
    prompt:
      "How did you feel while participating in or watching the Sacrament today?"
  },
  {
    id: "habit",
    prompt:
      "Looking at your Habit Tracker, what interfered with your consistency this week?"
  },
  {
    id: "mission",
    prompt:
      "Which daily priesthood mission was the most impactful for you this week and why?"
  },
  {
    id: "people",
    prompt:
      "Who did you notice this week that might need a priesthood blessing or a friend?"
  },
  {
    id: "commitment",
    prompt: "What is your specific priesthood goal for the upcoming month?"
  }
];

export default function WeeklyReflectionWizard({
  weeklyReflections,
  onComplete,
  onClose
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [touched, setTouched] = useState(false);

  const activeQuestion = QUESTIONS[stepIndex];
  const totalSteps = QUESTIONS.length;
  const progress = Math.round(((stepIndex + 1) / totalSteps) * 100);

  const isFinalStep = stepIndex === totalSteps - 1;
  const currentValue = (responses[activeQuestion.id] || "").trim();
  const isCurrentValid = currentValue.length > 0;

  const prompt = useMemo(() => activeQuestion.prompt, [activeQuestion]);

  const content = (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/80 px-4 pt-2 pb-24 backdrop-blur-sm">
      <div className="mt-0 mb-24 w-full max-w-lg rounded-2xl border border-white/10 bg-[rgb(var(--color-surface))] p-6 text-gray-100 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
              Weekly Account of Stewardship
            </p>
            <h3 className="mt-2 text-xl font-semibold text-white">
              Reflection Step {stepIndex + 1} of {totalSteps}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-300 hover:border-white/30"
          >
            Close
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>

        <div className="mt-4">
          <h4 className="text-base font-semibold text-white">{prompt}</h4>
          {activeQuestion.id === "mission" && weeklyReflections?.length ? (
            <div className="mt-3 rounded-xl border border-white/10 bg-[rgba(var(--color-surface),0.8)] p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                This Week's Notes
              </p>
              <div className="mt-2 space-y-2 text-sm text-gray-200">
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
          <textarea
            value={responses[activeQuestion.id] || ""}
            onChange={(event) =>
              setResponses((prev) => ({
                ...prev,
                [activeQuestion.id]: event.target.value
              }))
            }
            onBlur={() => setTouched(true)}
            rows={5}
            placeholder="Write your reflection..."
            className="mt-4 w-full resize-none rounded-xl border border-white/10 bg-[rgba(var(--color-surface),0.8)] px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 focus:border-gold-500/60 focus:outline-none"
          />
          {touched && !isCurrentValid && (
            <p className="mt-2 text-xs text-gold-500">
              Please enter a response to continue.
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => {
              setTouched(false);
              setStepIndex((prev) => Math.max(0, prev - 1));
            }}
            disabled={stepIndex === 0}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              stepIndex === 0
                ? "cursor-not-allowed bg-white/10 text-gray-500"
                : "border border-white/20 text-gray-200 hover:border-gold-500/60"
            }`}
          >
            Back
          </button>
          {isFinalStep ? (
            <button
              onClick={() => onComplete(responses)}
              disabled={!isCurrentValid}
              className="rounded-full bg-gold-500 px-5 py-2 text-xs font-semibold text-slate-900 transition hover:bg-gold-400"
            >
              Complete Reflection
            </button>
          ) : (
            <button
              onClick={() => {
                if (!isCurrentValid) {
                  setTouched(true);
                  return;
                }
                setTouched(false);
                setStepIndex((prev) => Math.min(totalSteps - 1, prev + 1));
              }}
              disabled={!isCurrentValid}
              className={`rounded-full px-5 py-2 text-xs font-semibold transition ${
                isCurrentValid
                  ? "bg-gold-500 text-slate-900 hover:bg-gold-400"
                  : "cursor-not-allowed bg-white/10 text-gray-400"
              }`}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
