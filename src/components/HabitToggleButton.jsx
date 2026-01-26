import { memo, useCallback } from "react";

function HabitToggleButton({
  habitKey,
  label,
  icon: Icon,
  isActive,
  onToggle,
  className,
  showIcon = true
}) {
  const handleClick = useCallback(() => {
    onToggle?.(habitKey);
  }, [habitKey, onToggle]);

  return (
    <button
      onClick={handleClick}
      className={`flex flex-col items-center gap-2 rounded-xl border px-2 py-3 text-xs font-medium transition ${
        isActive
          ? "border-gold-500/80 bg-gold-500/20 text-gold-500"
          : "border-white/10 bg-[rgba(var(--color-surface),0.8)] text-gray-200 hover:border-white/30"
      } ${className || ""}`}
    >
      {showIcon && Icon ? <Icon className="h-5 w-5" /> : null}
      {label}
    </button>
  );
}

export default memo(HabitToggleButton);
