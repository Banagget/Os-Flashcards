interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  compact?: boolean;
}

export function ProgressBar({ value, max, label, compact = false }: ProgressBarProps) {
  const percentage = max === 0 ? 0 : Math.round((value / max) * 100);

  return (
    <div className={`progress ${compact ? "progress--compact" : ""}`}>
      <div className="progress__track" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
        <span className="progress__fill" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
