import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

const reflectionLibrary = {
  phase1: [
    {
      id: "q1",
      prompt: "Where did you feel the Spirit confirm your foundation this week?"
    },
    {
      id: "q2",
      prompt: "Which daily mission challenged you most, and why?",
      showWeeklyNotes: true
    },
    {
      id: "q3",
      prompt: "What habit felt hardest to keep consistent this week?"
    },
    {
      id: "q4",
      prompt: "Who needed a priesthood touch or encouragement this week?"
    },
    {
      id: "q5",
      prompt: "What is your focused priesthood goal for the coming week?"
    }
  ],
  phase2: [
    {
      id: "q1",
      prompt: "Which doctrine or principle became clearer for you this week?"
    },
    {
      id: "q2",
      prompt: "How did your habit rhythm affect your confidence and discipline?"
    },
    {
      id: "q3",
      prompt: "Which mission had the greatest impact, and why?",
      showWeeklyNotes: true
    },
    {
      id: "q4",
      prompt: "Where did you notice a need you could quietly meet?"
    },
    {
      id: "q5",
      prompt: "What discipline will you guard most carefully next week?"
    }
  ],
  phase3: [
    {
      id: "q1",
      prompt: "Which ordinance or handbook insight stood out this week?"
    },
    {
      id: "q2",
      prompt: "How did preparation shape your service this week?"
    },
    {
      id: "q3",
      prompt: "Which assignment stretched your leadership?",
      showWeeklyNotes: true
    },
    {
      id: "q4",
      prompt: "Who could benefit from follow-up or a blessing this week?"
    },
    {
      id: "q5",
      prompt: "What skill will you refine over the next seven days?"
    }
  ],
  phase4: [
    {
      id: "q1",
      prompt: "Where did your stewardship bless someone in a lasting way?"
    },
    {
      id: "q2",
      prompt: "Which practice strengthened your resilience this week?"
    },
    {
      id: "q3",
      prompt: "What mission moment felt most sacred to you?",
      showWeeklyNotes: true
    },
    {
      id: "q4",
      prompt: "Who should you mentor or strengthen next?"
    },
    {
      id: "q5",
      prompt: "What is your consecrated goal for the week ahead?"
    }
  ],
  phase5: [
    {
      id: "q1",
      prompt: "How has your service legacy grown this week?"
    },
    {
      id: "q2",
      prompt: "What pattern of devotion will you keep for the long run?"
    },
    {
      id: "q3",
      prompt: "Which mission story will you remember most?",
      showWeeklyNotes: true
    },
    {
      id: "q4",
      prompt: "Who can you empower to lead next?"
    },
    {
      id: "q5",
      prompt: "What promise will you carry into the next season?"
    }
  ]
};

const PHASE_METADATA = {
  phase1: { label: "Foundation", icon: "/assets/ShieldOfFaith.png" },
  phase2: { label: "Daily Engine", icon: "/assets/TheOpenWord.png" },
  phase3: { label: "Reference", icon: "/assets/KeyOfAuthority.png" },
  phase4: { label: "Mastery", icon: "/assets/SheppardsStaff.png" },
  phase5: { label: "Legacy", icon: "/assets/CrownOfLife.png" }
};

export default function WeeklyReflectionWizard({
  weeklyReflections,
  phaseId = "phase1",
  weekLabel,
  onComplete,
  onClose
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [touched, setTouched] = useState(false);

  const questions = useMemo(
    () => reflectionLibrary[phaseId] || reflectionLibrary.phase1,
    [phaseId]
  );
  const phaseMeta = PHASE_METADATA[phaseId] || PHASE_METADATA.phase1;
  const activeQuestion = questions[stepIndex] || questions[0];
  const totalSteps = questions.length;
  const progress = totalSteps
    ? Math.round(((stepIndex + 1) / totalSteps) * 100)
    : 0;

  const isFinalStep = stepIndex === totalSteps - 1;
  const currentValue = (responses[activeQuestion?.id] || "").trim();
  const isCurrentValid = currentValue.length > 0;

  useEffect(() => {
    setStepIndex(0);
    setResponses({});
    setTouched(false);
  }, [phaseId]);

  const content = (
    <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center overflow-y-auto bg-slate-950/90 px-4 py-10 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[rgba(var(--color-surface),0.98)] p-6 text-gray-100 shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold-500/40 bg-slate-950/60 shadow-[0_0_20px_rgba(234,179,8,0.25)]">
              <img
                src={phaseMeta.icon}
                alt={`${phaseMeta.label} icon`}
                className="h-8 w-8 object-contain"
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                Weekly Account of Stewardship
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">
                Reflection Step {stepIndex + 1} of {totalSteps}
              </h3>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-gold-500">
                {phaseMeta.label}
                {weekLabel ? ` · ${weekLabel}` : ""}
              </p>
            </div>
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
          <h4 className="text-base font-semibold text-white">
            {activeQuestion?.prompt || ""}
          </h4>
          {activeQuestion?.showWeeklyNotes && weeklyReflections?.length ? (
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
            value={responses[activeQuestion?.id] || ""}
            onChange={(event) =>
              setResponses((prev) => ({
                ...prev,
                [activeQuestion?.id]: event.target.value
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
              onClick={() => onComplete({ responses, questions })}
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
