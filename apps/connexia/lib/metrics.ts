import { cases, invoices, orders, providers, sites, type MilestoneState } from "@/lib/demo-data";

function parseDate(value: string): Date {
  return new Date(value);
}

export function getProviderName(providerId: string): string {
  return providers.find((p) => p.id === providerId)?.name ?? "Unknown";
}

export function getSiteName(siteId: string): string {
  return sites.find((s) => s.id === siteId)?.name ?? siteId;
}

export function getOrderStatus(orderId: string): {
  state: "blocked" | "in_progress" | "done" | "planned";
  blockedReason?: string;
} {
  const order = orders.find((o) => o.id === orderId);
  if (!order) return { state: "planned" };

  const states = order.milestones.map((m) => m.state);
  if (states.includes("blocked")) {
    const reason = order.milestones.find((m) => m.state === "blocked")?.blockedReason;
    return { state: "blocked", blockedReason: reason };
  }
  if (states.every((s) => s === "done")) return { state: "done" };
  if (states.some((s) => s === "in_progress" || s === "done")) return { state: "in_progress" };
  return { state: "planned" };
}

export function countMilestonesByState(): Array<{ state: MilestoneState; count: number }> {
  const counts: Record<MilestoneState, number> = {
    planned: 0,
    in_progress: 0,
    blocked: 0,
    done: 0,
  };

  for (const order of orders) {
    for (const m of order.milestones) {
      counts[m.state] += 1;
    }
  }

  return [
    { state: "planned", count: counts.planned },
    { state: "in_progress", count: counts.in_progress },
    { state: "blocked", count: counts.blocked },
    { state: "done", count: counts.done },
  ];
}

export function countCasesBySeverity(): Array<{ severity: "sev1" | "sev2" | "sev3"; count: number }> {
  const counts: Record<"sev1" | "sev2" | "sev3", number> = { sev1: 0, sev2: 0, sev3: 0 };
  for (const c of cases) counts[c.severity] += 1;
  return [
    { severity: "sev1", count: counts.sev1 },
    { severity: "sev2", count: counts.sev2 },
    { severity: "sev3", count: counts.sev3 },
  ];
}

export function countOrdersByServiceType(): Array<{ serviceType: "internet" | "sd-wan" | "security"; count: number }> {
  const counts: Record<"internet" | "sd-wan" | "security", number> = { "internet": 0, "sd-wan": 0, "security": 0 };
  for (const o of orders) counts[o.serviceType] += 1;
  return [
    { serviceType: "internet", count: counts["internet"] },
    { serviceType: "sd-wan", count: counts["sd-wan"] },
    { serviceType: "security", count: counts["security"] },
  ];
}

export function countOrdersByStatus(): Array<{ status: "blocked" | "in_progress" | "done" | "planned"; count: number }> {
  const counts: Record<"blocked" | "in_progress" | "done" | "planned", number> = {
    blocked: 0,
    in_progress: 0,
    done: 0,
    planned: 0,
  };

  for (const o of orders) {
    const status = getOrderStatus(o.id);
    counts[status.state] += 1;
  }

  return [
    { status: "blocked", count: counts.blocked },
    { status: "in_progress", count: counts.in_progress },
    { status: "planned", count: counts.planned },
    { status: "done", count: counts.done },
  ];
}

export function countBlockedByOwnerTeam(): Array<{ ownerTeam: "Service Delivery" | "Provider" | "Customer" | "NOC"; count: number }> {
  const counts: Record<"Service Delivery" | "Provider" | "Customer" | "NOC", number> = {
    "Service Delivery": 0,
    Provider: 0,
    Customer: 0,
    NOC: 0,
  };

  for (const o of orders) {
    for (const m of o.milestones) {
      if (m.state !== "blocked") continue;
      counts[m.ownerTeam] += 1;
    }
  }

  const result: Array<{ ownerTeam: "Service Delivery" | "Provider" | "Customer" | "NOC"; count: number }> = [
    { ownerTeam: "Provider", count: counts.Provider },
    { ownerTeam: "Customer", count: counts.Customer },
    { ownerTeam: "Service Delivery", count: counts["Service Delivery"] },
    { ownerTeam: "NOC", count: counts.NOC },
  ];

  return result.slice().sort((a, b) => b.count - a.count);
}

export function countByProviderBlockedMilestones(): Array<{ providerId: string; providerName: string; blocked: number }> {
  const counts = new Map<string, number>();

  for (const order of orders) {
    const site = sites.find((s) => s.id === order.siteId);
    if (!site) continue;

    const blocked = order.milestones.filter((m) => m.state === "blocked").length;
    if (blocked === 0) continue;

    counts.set(site.providerId, (counts.get(site.providerId) ?? 0) + blocked);
  }

  return Array.from(counts.entries())
    .map(([providerId, blocked]) => ({ providerId, providerName: getProviderName(providerId), blocked }))
    .sort((a, b) => b.blocked - a.blocked);
}

export function countByRegionBlockedMilestones(): Array<{ region: string; blocked: number }> {
  const counts = new Map<string, number>();

  for (const order of orders) {
    const site = sites.find((s) => s.id === order.siteId);
    if (!site) continue;

    const blocked = order.milestones.filter((m) => m.state === "blocked").length;
    if (blocked === 0) continue;

    counts.set(site.region, (counts.get(site.region) ?? 0) + blocked);
  }

  return Array.from(counts.entries())
    .map(([region, blocked]) => ({ region, blocked }))
    .sort((a, b) => b.blocked - a.blocked);
}

export function countBlockedReasons(): Array<{ reason: string; count: number }> {
  const counts = new Map<string, number>();

  for (const order of orders) {
    for (const m of order.milestones) {
      if (m.state !== "blocked") continue;
      const reason = m.blockedReason ?? "unspecified";
      counts.set(reason, (counts.get(reason) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);
}

export function getOrdersFiltered(filters: {
  providerId?: string;
  region?: string;
  status?: "blocked" | "in_progress" | "done" | "planned";
  blockedReason?: string;
  serviceType?: "internet" | "sd-wan" | "security";
  blockedOwnerTeam?: "Service Delivery" | "Provider" | "Customer" | "NOC";
}): typeof orders {
  return orders.filter((o) => {
    const site = sites.find((s) => s.id === o.siteId);
    if (!site) return false;

    if (filters.providerId && site.providerId !== filters.providerId) return false;
    if (filters.region && site.region !== filters.region) return false;
    if (filters.serviceType && o.serviceType !== filters.serviceType) return false;

    const status = getOrderStatus(o.id);
    if (filters.status && status.state !== filters.status) return false;
    if (filters.blockedReason && status.blockedReason !== filters.blockedReason) return false;

    if (filters.blockedOwnerTeam) {
      const has = o.milestones.some((m) => m.state === "blocked" && m.ownerTeam === filters.blockedOwnerTeam);
      if (!has) return false;
    }

    return true;
  });
}

export function getAtRiskOrders(now = new Date()): Array<{ orderId: string; siteId: string; reason: string }> {
  const riskWindowDays = 6;
  const riskWindowMs = riskWindowDays * 24 * 60 * 60 * 1000;

  return orders
    .map((o) => {
      const status = getOrderStatus(o.id);
      const target = parseDate(o.targetDate);
      const timeLeft = target.getTime() - now.getTime();

      if (status.state === "blocked") {
        return {
          orderId: o.id,
          siteId: o.siteId,
          reason: `Blocked: ${status.blockedReason ?? "unspecified"}`,
        };
      }

      if (timeLeft < riskWindowMs) {
        return {
          orderId: o.id,
          siteId: o.siteId,
          reason: `Target date approaching (${riskWindowDays}d window)`,
        };
      }

      return null;
    })
    .filter((x): x is { orderId: string; siteId: string; reason: string } => Boolean(x));
}

export function getSlaAtRiskCases(now = new Date()): Array<{ caseId: string; siteId: string; dueInHours: number }> {
  const riskHours = 8;

  return cases
    .filter((c) => c.status !== "resolved")
    .map((c) => {
      const due = parseDate(c.slaDueAt);
      const deltaMs = due.getTime() - now.getTime();
      return { caseId: c.id, siteId: c.siteId, dueInHours: Math.round(deltaMs / (60 * 60 * 1000)) };
    })
    .filter((x) => x.dueInHours <= riskHours)
    .sort((a, b) => a.dueInHours - b.dueInHours);
}

export function summarizeCounts(): {
  totalSites: number;
  totalOrders: number;
  blockedMilestones: number;
  openCases: number;
  disputedInvoices: number;
} {
  const blockedMilestones = orders.reduce(
    (acc, o) => acc + o.milestones.filter((m) => m.state === ("blocked" as MilestoneState)).length,
    0
  );

  return {
    totalSites: sites.length,
    totalOrders: orders.length,
    blockedMilestones,
    openCases: cases.filter((c) => c.status !== "resolved").length,
    disputedInvoices: invoices.filter((i) => i.status === "disputed").length,
  };
}
