import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

const reflectionLibrary = {
"weekly_reflections": {
    "phase1": [
      { "id": "q1", "prompt": "Did I complete my daily missions with real intent this week?" },
      { "id": "q2", "prompt": "What was the biggest obstacle to my consistency, and how will I overcome it?" },
      { "id": "q3", "prompt": "Which scripture or quote spoke most clearly to my current needs?" },
      { "id": "q4", "prompt": "How has my awareness of my Priesthood office changed this week?" },
      { "id": "q5", "prompt": "What is one 'small and simple' thing I will focus on next week?" }
    ],
    "phase2": [
      { "id": "q1", "prompt": "How has my understanding of Priesthood Keys or Authority deepened this week?" },
      { "id": "q2", "prompt": "Did I seek personal revelation during study, or was I just 'reading to finish'?" },
      { "id": "q3", "prompt": "What 'breach' in my spiritual life am I currently working with the Lord to repair?" },
      { "id": "q4", "prompt": "How did I see the Lord's hand in my life during my moments of study?" },
      { "id": "q5", "prompt": "How can I more worthily prepare to partake of the Sacrament this Sunday?" }
    ],
    "phase3": [
      { "id": "q1", "prompt": "If called upon today to give a blessing, would I feel 'spiritually prepared'?" },
      { "id": "q2", "prompt": "How did I exercise Priesthood authority in my home or circle of influence?" },
      { "id": "q3", "prompt": "What specific attribute of Christ did I notice that I want to emulate?" },
      { "id": "q4", "prompt": "In what ways did I 'sanctify' myself to be a better instrument for the Lord?" },
      { "id": "q5", "prompt": "What prompted me most strongly to change my behavior this week?" }
    ],
    "phase4": [
      { "id": "q1", "prompt": "Who did the Spirit prompt me to serve this week, and did I act on it?" },
      { "id": "q2", "prompt": "How has my 'Priesthood Momentum' changed my perspective on daily trials?" },
      { "id": "q3", "prompt": "What is the most significant 'mighty change of heart' I have felt lately?" },
      { "id": "q4", "prompt": "Am I currently magnifying my calling, or merely performing the duties of it?" },
      { "id": "q5", "prompt": "If the Lord gave me a 'Stewardship Interview' today, what would be my report?" }
    ]
  },
  "milestone_reflections": {
    "day30": [
      { "id": "m1", "prompt": "Look back at Day 1. What is the most visible change in your spiritual discipline?" },
      { "id": "m2", "prompt": "How has your relationship with the Savior shifted during this first month?" },
      { "id": "m3", "prompt": "Which 'Foundation' principle do you feel is currently your strongest?" },
      { "id": "m4", "prompt": "What distraction are you now ready to leave behind to move deeper into the path?" },
      { "id": "m5", "prompt": "Write a 'Letter to Self' for the next 30 days: What is your primary goal?" }
    ],
    "day60": [
      { "id": "m1", "prompt": "You are halfway. How has your capacity to 'Hear Him' increased?" },
      { "id": "m2", "prompt": "Describe a moment this month where you felt the power of the Priesthood move through you." },
      { "id": "m3", "prompt": "In which ordinance or duty do you feel you need more 'Specialization' or study?" },
      { "id": "m4", "prompt": "How has your family or Quorum benefited from your commitment to this path?" },
      { "id": "m5", "prompt": "What is the 'hardest' thing the Lord has asked you to change so far?" }
    ],
    "day90": [
      { "id": "m1", "prompt": "The focus is now on others. Who are the 'sheep' in your specific stewardship?" },
      { "id": "m2", "prompt": "How has your focus shifted from 'personal growth' to 'priesthood service'?" },
      { "id": "m3", "prompt": "What does 'The Oath and Covenant of the Priesthood' mean to you personally now?" },
      { "id": "m4", "prompt": "Where do you still feel a 'lack' in your spiritual armor?" },
      { "id": "m5", "prompt": "What is your plan to ensure this momentum continues after Day 120?" }
    ],
    "day120": [
      { "id": "m1", "prompt": "You have finished the path. Who are you today compared to Day 1?" },
      { "id": "m2", "prompt": "What was the most difficult 'Gate' or 'Phase Fork' you encountered?" },
      { "id": "m3", "prompt": "Describe your current 'Priesthood Identity' in three words." },
      { "id": "m4", "prompt": "What is your commitment to the Lord regarding your service for the rest of the year?" },
      { "id": "m5", "prompt": "Final Reflection: What is the most important lesson you learned about God's power?" }
    ]
  }
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
