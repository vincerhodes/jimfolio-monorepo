// Whole calendar days between two dates (to − from). Bean age is always
// derived from dates, never stored.
export function daysBetween(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Display name for a grinder: "Timemore Sculptor 078s", falling back to
// whichever part is set, then a placeholder.
export function grinderDisplayName(grinder: {
  manufacturer: string | null;
  model: string | null;
}): string {
  const name = [grinder.manufacturer, grinder.model]
    .filter(Boolean)
    .join(" ")
    .trim();
  return name || "Unnamed grinder";
}

// Display name for a piece of equipment: "Lelit Bianca V3", falling back to
// whichever part is set, then a placeholder.
export function equipmentDisplayName(equipment: {
  manufacturer: string | null;
  model: string | null;
}): string {
  const name = [equipment.manufacturer, equipment.model]
    .filter(Boolean)
    .join(" ")
    .trim();
  return name || "Unnamed equipment";
}
