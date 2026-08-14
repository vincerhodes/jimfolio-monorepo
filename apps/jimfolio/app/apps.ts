export interface AppEntry {
  name: string;
  slug: string;
  url: string;
  tag: string;
  tagline: string;
  tech: string[];
  /** tailwind gradient stops for the card title, e.g. "from-red-500 to-orange-500" */
  gradient: string;
  /** chip styling (light + dark) */
  chip: string;
  /** optional card media from /public */
  image?: string;
  featured?: boolean;
}

/** Single source of truth for apps linked from the homepage. Only verified-live apps. */
export const APPS: AppEntry[] = [
  {
    name: "Fibr",
    slug: "fibr",
    url: "https://fibr.jimfolio.space",
    tag: "FEATURED APP",
    tagline: "Daily fiber tracker — goals, streaks & USDA food search",
    tech: ["Next.js", "TypeScript", "Turso"],
    gradient: "from-green-500 to-emerald-400",
    chip: "bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-300",
    image: "/assets/Fibr_card_front.jpg",
    featured: true,
  },
  {
    name: "Sweet Reach",
    slug: "sweet-reach",
    url: "https://sweet-reach.jimfolio.space",
    tag: "FEATURED DEMO",
    tagline: "Real-time analytics & interactive dashboards",
    tech: ["Next.js", "TypeScript", "Analytics"],
    gradient: "from-emerald-500 to-teal-500",
    chip: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300",
    image: "/assets/Sweet-Reach_card_front.jpg",
  },
  {
    name: "Crema",
    slug: "crema",
    url: "https://crema.jimfolio.space",
    tag: "APP",
    tagline: "Coffee brew tracker — beans, grinders & dial-in",
    tech: ["Next.js", "TypeScript", "Turso"],
    gradient: "from-amber-500 to-orange-400",
    chip: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-300",
  },
  {
    name: "Pantry",
    slug: "pantry",
    url: "https://pantry.jimfolio.space",
    tag: "APP",
    tagline: "AI recipe generator & pantry inventory",
    tech: ["Next.js", "OpenRouter", "Turso"],
    gradient: "from-lime-500 to-green-500",
    chip: "bg-lime-500/10 text-lime-700 border-lime-500/20 dark:text-lime-300",
  },
  {
    name: "Connexia",
    slug: "connexia",
    url: "https://connexia.jimfolio.space",
    tag: "SHOWCASE",
    tagline: "Service delivery visibility & workflow orchestration",
    tech: ["Next.js", "TypeScript", "Dashboards"],
    gradient: "from-emerald-500 to-cyan-500",
    chip: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300",
  },
  {
    name: "China Holidays 中国假期",
    slug: "chinahols",
    url: "https://chinahols.jimfolio.space",
    tag: "PRESENTATION",
    tagline: "Northern & Southern route itineraries",
    tech: ["HTML", "CSS", "JavaScript"],
    gradient: "from-red-500 to-rose-400",
    chip: "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-300",
  },
  {
    name: "WeSplit",
    slug: "wesplit",
    url: "https://wesplit.jimfolio.space",
    tag: "UTILITIES",
    tagline: "Holiday expense splitting with smart settlements",
    tech: ["Next.js", "Prisma", "SQLite"],
    gradient: "from-teal-500 to-cyan-400",
    chip: "bg-teal-500/10 text-teal-700 border-teal-500/20 dark:text-teal-300",
  },
  {
    name: "Standash",
    slug: "standash",
    url: "https://standash.jimfolio.space",
    tag: "GAME",
    tagline: "Rhythm platformer — cube, ship & ball modes",
    tech: ["HTML5 Canvas", "Vanilla JS", "Mobile-first"],
    gradient: "from-fuchsia-500 to-pink-400",
    chip: "bg-fuchsia-500/10 text-fuchsia-700 border-fuchsia-500/20 dark:text-fuchsia-300",
  },
  {
    name: "JADE Chinese 玉",
    slug: "jade-chinese",
    url: "https://jade-chinese.jimfolio.space",
    tag: "LEARNING TOOL",
    tagline: "HSK 1–3 Mandarin flashcards & quizzes",
    tech: ["Next.js", "React", "Tailwind CSS"],
    gradient: "from-emerald-500 to-green-400",
    chip: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300",
  },
  {
    name: "Power BI Course",
    slug: "powerbi",
    url: "https://powerbi.jimfolio.space/course/",
    tag: "ANALYTICS",
    tagline: "Business analytics & data visualization",
    tech: ["HTML", "CSS", "JavaScript"],
    gradient: "from-yellow-500 to-amber-400",
    chip: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20 dark:text-yellow-300",
  },
  {
    name: "Kickoff Logo Lab",
    slug: "kickoff-logos",
    url: "https://kickoff-logos.jimfolio.space",
    tag: "TOOL",
    tagline: "KickoffHQ logo recolor playground — flags & kits",
    tech: ["Next.js", "TypeScript", "SVG"],
    gradient: "from-amber-400 to-yellow-500",
    chip: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-300",
  },
];
