import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { BASE_PATH, getSessionUser } from "@/lib/auth";
import { computeStreak } from "@/lib/stats";
import SettingsClient from "@/components/SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) redirect(`${BASE_PATH}/login`);

  const since = new Date();
  since.setDate(since.getDate() - 365);
  const entries = await db.fiberEntry.findMany({
    where: { userId: user.id, createdAt: { gte: since } },
    select: { foodName: true, fiberG: true, createdAt: true },
  });

  const streakDays = computeStreak(entries, user.goalFiberG);
  const totalFiber = entries.reduce((sum, e) => sum + e.fiberG, 0);

  return (
    <main className="mx-auto max-w-2xl pb-12">
      <div className="px-6 pb-6 pt-4">
        <h1 className="text-2xl font-extrabold text-ink">Settings</h1>
      </div>

      <SettingsClient
        displayName={user.displayName || user.name}
        goalFiberG={user.goalFiberG}
        streakDays={streakDays}
        totalEntries={entries.length}
        totalFiber={totalFiber}
      />
    </main>
  );
}
