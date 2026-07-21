import Link from "next/link";
import { daysBetween, formatDate } from "@/lib/coffee";

interface BeanCardProps {
  bean: {
    id: string;
    name: string;
    roaster: string | null;
    roastDate: Date;
    brewCount: number;
    archived?: boolean;
  };
}

export default function BeanCard({ bean }: BeanCardProps) {
  const ageDays = daysBetween(bean.roastDate, new Date());

  return (
    <Link
      href={`/coffee/${bean.id}`}
      className="card block p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex items-center gap-2">
        <h2 className="font-semibold">{bean.name}</h2>
        {bean.archived && (
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
            Archived
          </span>
        )}
      </div>
      {bean.roaster && <p className="mt-1 text-sm text-[#7a6a5d]">{bean.roaster}</p>}
      <p className="mt-2 text-sm text-[#7a6a5d]">
        Roasted {formatDate(bean.roastDate)}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <span className="rounded-full bg-[#f1e9de] px-2.5 py-0.5 text-xs font-medium text-espresso">
          {ageDays} day{ageDays === 1 ? "" : "s"} old
        </span>
        <span className="text-xs text-[#7a6a5d]">
          {bean.brewCount} brew{bean.brewCount === 1 ? "" : "s"}
        </span>
      </div>
    </Link>
  );
}
