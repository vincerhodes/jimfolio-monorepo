// Prefix for same-origin API fetches. Derived from the build-time basePath so
// local dev (basePath /crema) and prod (basePath "") can't drift apart —
// the old NEXT_PUBLIC_API_BASE env var leaked from .env.local into prod builds.
export const API_BASE = process.env.__NEXT_ROUTER_BASEPATH ?? "";
