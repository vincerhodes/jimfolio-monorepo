const CREMA_API_BASE =
  process.env.CREMA_API_BASE_URL ??
  "https://vincerhodes.github.io/crema-api/api/v1";

export interface CatalogEntry {
  slug: string;
  brand: string;
  model: string;
}

export interface CatalogGrinder extends CatalogEntry {
  type: string; // GRINDER_TYPES value
}

export interface CatalogEquipment extends CatalogEntry {
  kind: string; // EQUIPMENT_KINDS value
}

interface RawCatalogItem {
  slug?: unknown;
  brand?: unknown;
  model?: unknown;
  specs?: unknown;
}

async function fetchCollection(path: string): Promise<RawCatalogItem[]> {
  try {
    const res = await fetch(`${CREMA_API_BASE}/${path}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    const data: unknown = await res.json();
    return Array.isArray(data) ? (data as RawCatalogItem[]) : [];
  } catch {
    return [];
  }
}

function baseEntry(item: RawCatalogItem): CatalogEntry | null {
  if (typeof item.slug !== "string" || !item.slug) return null;
  return {
    slug: item.slug,
    brand: typeof item.brand === "string" ? item.brand : "",
    model: typeof item.model === "string" ? item.model : "",
  };
}

function specsValue(item: RawCatalogItem, key: string): unknown {
  if (item.specs && typeof item.specs === "object") {
    return (item.specs as Record<string, unknown>)[key];
  }
  return undefined;
}

export function mapGrinderType(burrType: unknown): string {
  if (burrType === "conical") return "CONICAL_BURR";
  if (burrType === "flat") return "FLAT_BURR";
  return "OTHER";
}

export function mapBrewerKind(method: unknown, slug: string): string {
  if (slug === "moka-pot") return "MOKA_POT";
  if (method === "pour-over") return "POUR_OVER";
  if (method === "immersion") return "IMMERSION";
  return "OTHER";
}

export async function getCatalogGrinders(): Promise<CatalogGrinder[]> {
  const items = await fetchCollection("equipment/grinders.json");
  return items.flatMap((item) => {
    const base = baseEntry(item);
    if (!base) return [];
    return [{ ...base, type: mapGrinderType(specsValue(item, "burr_type")) }];
  });
}

export async function getCatalogEspressoMachines(): Promise<
  CatalogEquipment[]
> {
  const items = await fetchCollection("equipment/espresso-machines.json");
  return items.flatMap((item) => {
    const base = baseEntry(item);
    if (!base) return [];
    return [{ ...base, kind: "ESPRESSO_MACHINE" }];
  });
}

export async function getCatalogBrewers(): Promise<CatalogEquipment[]> {
  const items = await fetchCollection("equipment/brewers.json");
  return items.flatMap((item) => {
    const base = baseEntry(item);
    if (!base) return [];
    return [
      { ...base, kind: mapBrewerKind(specsValue(item, "method"), base.slug) },
    ];
  });
}
