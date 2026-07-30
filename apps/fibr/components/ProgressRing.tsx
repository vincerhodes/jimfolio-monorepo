// Port of src/components/ProgressRing.tsx — SVG circle works as-is in React DOM.
interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  consumed: number;
  goal: number;
}

export default function ProgressRing({
  progress,
  size = 200,
  strokeWidth = 14,
  consumed,
  goal,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(progress, 1));
  const isComplete = progress >= 1;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="absolute inset-0">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isComplete ? "#059669" : "#34d399"}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="text-center">
        <div
          className="text-4xl font-extrabold"
          style={{ color: isComplete ? "#059669" : "#1f2937" }}
        >
          {consumed.toFixed(1)}g
        </div>
        <div className="mt-0.5 text-sm text-gray-500">of {goal}g goal</div>
        {isComplete && (
          <div className="mt-1 text-sm font-semibold text-primary">
            Goal reached!
          </div>
        )}
      </div>
    </div>
  );
}
