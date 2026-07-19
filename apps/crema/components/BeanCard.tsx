import Link from "next/link";
import { daysBetween, formatDate } from "@/lib/coffee";

interface BeanCardProps {
  bean: {
    id: string;
    name: string;
    roaster: string | null;
    roastDate: Date;
    brewCount: number;
  };
}

export default function BeanCard({ bean }: BeanCardProps) {
  const ageDays = daysBetween(bean.roastDate, new Date());

  return (
    <Link
      href={`/coffee/${bean.id}`}
      className="block rounded-lg border border-neutral-200 p-4 hover:border-neutral-400"
    >
      <h2 className="font-semibold">{bean.name}</h2>
      {bean.roaster && <p className="text-sm text-neutral-600">{bean.roaster}</p>}
      <p className="mt-2 text-sm text-neutral-500">
        Roasted {formatDate(bean.roastDate)} · {ageDays} day{ageDays === 1 ? "" : "s"} old
      </p>
      <p className="text-sm text-neutral-500">
        {bean.brewCount} brew{bean.brewCount === 1 ? "" : "s"}
      </p>
    </Link>
  );
}
