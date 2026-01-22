export default function RecoveryToast({ message, onClose }) {
  return (
    <div className="fixed top-4 left-1/2 z-50 w-[90%] max-w-md -translate-x-1/2 rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 text-sm text-gray-100 shadow-xl backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-gray-200">{message}</p>
        <button
          onClick={onClose}
          className="rounded-full border border-white/10 px-2 py-1 text-xs text-gray-300 hover:border-white/30"
        >
          Close
        </button>
      </div>
    </div>
  );
}
