import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { BASE_PATH, getSessionUser } from "@/lib/auth";
import { fiberProgress, getLocalDateString } from "@/lib/fiber";
import { computeStreak, computeSuggestions, computeWeek } from "@/lib/stats";
import ProgressRing from "@/components/ProgressRing";
import StreakBadge from "@/components/StreakBadge";
import WeekChart from "@/components/WeekChart";
import HomeClient from "@/components/HomeClient";
import Icon from "@/components/Icon";

export const dynamic = "force-dynamic";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function HomePage() {
  const user = await getSessionUser();
  if (!user) redirect(`${BASE_PATH}/login`);

  const goalFiberG = user.goalFiberG;

  // One year of entries covers streak, week chart, and suggestions.
  const since = new Date();
  since.setDate(since.getDate() - 365);
  const entries = await db.fiberEntry.findMany({
    where: { userId: user.id, createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
  });

  const todayStr = getLocalDateString();
  const todayEntries = entries.filter(
    (e) => getLocalDateString(e.createdAt) === todayStr
  );
  const todayFiber = todayEntries.reduce((sum, e) => sum + e.fiberG, 0);
  const progress = fiberProgress(todayFiber, goalFiberG);
  const streakDays = computeStreak(entries, goalFiberG);
  const week = computeWeek(entries);
  const suggestions = computeSuggestions(entries);

  return (
    <main className="mx-auto max-w-2xl pb-12">
      <div className="px-6 pt-4">
        <p className="text-sm text-gray-400">{getGreeting()}</p>
        <h1 className="mb-6 flex items-center gap-2 text-2xl font-extrabold text-ink">
          {user.displayName || user.name || "Friend"}
          <Icon name="sprout" className="h-6 w-6 text-primary" />
        </h1>
      </div>

      <div className="mb-2 flex justify-center">
        <ProgressRing
          progress={progress}
          consumed={todayFiber}
          goal={goalFiberG}
        />
      </div>

      <div className="mb-5 text-center">
        {todayFiber < goalFiberG ? (
          <p className="text-[15px] text-gray-500">
            <span className="font-bold text-primary">
              {(goalFiberG - todayFiber).toFixed(1)}g
            </span>{" "}
            to go
          </p>
        ) : (
          <p className="text-[15px] font-bold text-primarydark">
            Goal reached!
          </p>
        )}
      </div>

      <div className="mb-6 px-6">
        <StreakBadge days={streakDays} />
      </div>

      <div className="mb-6 px-6">
        <WeekChart days={week} goalFiberG={goalFiberG} />
      </div>

      <HomeClient
        todayEntries={todayEntries.map((e) => ({
          id: e.id,
          foodName: e.foodName,
          grams: e.grams,
          fiberG: e.fiberG,
          createdAt: e.createdAt.toISOString(),
        }))}
        todayFiber={todayFiber}
        goalFiberG={goalFiberG}
        suggestions={suggestions}
      />
    </main>
  );
}
