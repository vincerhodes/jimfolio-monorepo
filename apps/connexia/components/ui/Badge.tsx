import { clsx } from "clsx";

export type BadgeTone = "neutral" | "success" | "warning" | "risk";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-700 border-slate-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  risk: "bg-red-50 text-red-700 border-red-200",
};

export default function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        toneClasses[tone]
      )}
    >
      {children}
    </span>
  );
}
