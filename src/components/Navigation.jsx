const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: HomeIcon },
  { key: "path", label: "Path", icon: PathIcon },
  { key: "ordinance", label: "Ordinance Lab", icon: LabIcon },
  { key: "journal", label: "Journal", icon: JournalIcon },
  { key: "profile", label: "Profile", icon: UserIcon }
];

export default function Navigation({ currentPage, onChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-slate-900/80 px-4 py-3 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[450px] items-center justify-between text-xs text-gray-400">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const isActive = currentPage === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium transition ${
                isActive
                  ? "text-gold-500"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function HomeIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PathIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M6 5c3 0 3 6 6 6s3-6 6-6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M6 19c3 0 3-6 6-6s3 6 6 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LabIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M9 3h6M10 3v6l-5.5 9A3 3 0 0 0 7.1 22h9.8a3 3 0 0 0 2.6-4.5L14 9V3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 15h7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UserIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 13a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M5 20a7 7 0 0 1 14 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function JournalIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M6 4h9a3 3 0 0 1 3 3v12H7a2 2 0 0 0-2 2V6a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 8h6M9 12h6M9 16h4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
