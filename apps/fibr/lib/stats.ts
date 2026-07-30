// Server-side reimplementation of the original zustand fiberStore logic
// (streak, week totals, suggestions) computed from FiberEntry rows.
import { HIGH_FIBER_FOODS } from "./constants";
import { getLocalDateString } from "./fiber";
import type { Suggestion } from "./types";

export interface EntryRow {
  foodName: string;
  fiberG: number;
  createdAt: Date;
}

// Sum fiber per local date string ("YYYY-MM-DD").
export function fiberByDay(entries: EntryRow[]): Map<string, number> {
  const byDay = new Map<string, number>();
  for (const e of entries) {
    const day = getLocalDateString(e.createdAt);
    byDay.set(day, (byDay.get(day) ?? 0) + e.fiberG);
  }
  return byDay;
}

// Faithful port of fiberStore.checkAndUpdateStreak: consecutive days ending
// today where the goal was met. If today misses the goal, streak is 0
// (matches the original — both branches break).
export function computeStreak(entries: EntryRow[], goalFiberG: number): number {
  const byDay = fiberByDay(entries);
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dayFiber = byDay.get(getLocalDateString(checkDate)) ?? 0;

    if (dayFiber >= goalFiberG) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export interface WeekDay {
  dateStr: string;
  label: string; // S M T W T F S
  fiber: number;
}

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

// Last 7 days (oldest → today), as in WeekChart.
export function computeWeek(entries: EntryRow[]): WeekDay[] {
  const byDay = fiberByDay(entries);
  const result: WeekDay[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = getLocalDateString(d);
    result.push({
      dateStr,
      label: DAY_LABELS[d.getDay()],
      fiber: byDay.get(dateStr) ?? 0,
    });
  }
  return result;
}

// Faithful port of fiberStore.refreshSuggestions: top-5 built-in foods
// (by fiberPer100g) not logged in the last 7 days.
export function computeSuggestions(entries: EntryRow[]): Suggestion[] {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const loggedNames = new Set(
    entries
      .filter((e) => e.createdAt > weekAgo)
      .map((e) => e.foodName.toLowerCase())
  );

  return HIGH_FIBER_FOODS.filter(
    (food) => !loggedNames.has(food.name.toLowerCase())
  )
    .sort((a, b) => b.fiberPer100g - a.fiberPer100g)
    .slice(0, 5)
    .map((food) => ({
      name: food.name,
      emoji: food.emoji,
      fiberPer100g: food.fiberPer100g,
      typicalServingG: food.typicalServingG,
      reason: `${food.fiberPer100g}g fiber per 100g — not logged recently`,
    }));
}
