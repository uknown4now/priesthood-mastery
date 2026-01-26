import { useMemo } from "react";

const TOTAL_DAYS = 120;

const HABITS = [
  { key: "scripture", label: "Scripture", Icon: BookIcon },
  { key: "prayer", label: "Prayer", Icon: HandsIcon },
  { key: "service", label: "Service", Icon: HeartIcon }
];

const getHabitCounts = () => ({
  scripture: 0,
  prayer: 0,
  service: 0
});

function ProgressCircle({ percent, size, children }) {
  const stroke = Math.max(6, Math.round(size * 0.1));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={stroke}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#EAB308"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute flex items-center justify-center text-gold-500">
        {children}
      </div>
    </div>
  );
}

export default function HabitMomentumCircles({ size = 72, counts, refreshKey }) {
  const resolvedCounts = useMemo(
    () => counts || getHabitCounts(),
    [counts, refreshKey]
  );

  return (
    <div className="grid grid-cols-3 gap-3">
      {HABITS.map(({ key, label, Icon }) => {
        const count = resolvedCounts[key] || 0;
        const percent = Math.min(100, Math.round((count / TOTAL_DAYS) * 100));
        return (
          <div key={key} className="flex flex-col items-center gap-2">
            <ProgressCircle percent={percent} size={size}>
              <Icon className="h-5 w-5" />
            </ProgressCircle>
            <div className="text-center text-[10px] text-gray-300">
              {label}
              <div className="text-[9px] text-gray-500">
                {count}/{TOTAL_DAYS}
              </div>
            </div>
          </div>
        );
      })}
    </div>
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
