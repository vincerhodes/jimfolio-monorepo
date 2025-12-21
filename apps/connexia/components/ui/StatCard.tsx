import Badge, { type BadgeTone } from "@/components/ui/Badge";

export default function StatCard({
  title,
  value,
  tone,
  subtitle,
}: {
  title: string;
  value: string;
  tone?: BadgeTone;
  subtitle?: string;
}) {
  return (
    <div className="cx-panel rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="text-sm cx-muted">{title}</div>
        {tone ? <Badge tone={tone}>{tone.toUpperCase()}</Badge> : null}
      </div>
      <div className="mt-4 text-3xl font-semibold tracking-tight">{value}</div>
      {subtitle ? <div className="mt-2 text-sm cx-muted">{subtitle}</div> : null}
    </div>
  );
}
