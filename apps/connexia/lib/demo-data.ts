export type Region = "UK" | "EMEA" | "APAC" | "AMER";

export type Provider = {
  id: string;
  name: string;
};

export type Site = {
  id: string;
  name: string;
  customer: string;
  country: string;
  region: Region;
  providerId: string;
  criticality: "standard" | "critical";
};

export type MilestoneState = "planned" | "in_progress" | "blocked" | "done";

export type Milestone = {
  id: string;
  name: string;
  state: MilestoneState;
  blockedReason?: "awaiting_provider" | "awaiting_customer" | "awaiting_change_window" | "unknown";
  updatedAt: string;
  ownerTeam: "Service Delivery" | "Provider" | "Customer" | "NOC";
};

export type Order = {
  id: string;
  siteId: string;
  serviceType: "internet" | "sd-wan" | "security";
  targetDate: string;
  createdAt: string;
  milestones: Milestone[];
};

export type Case = {
  id: string;
  siteId: string;
  title: string;
  severity: "sev1" | "sev2" | "sev3";
  status: "open" | "investigating" | "waiting" | "resolved";
  ownerTeam: "NOC" | "Service Delivery" | "Provider";
  openedAt: string;
  slaDueAt: string;
};

export type Invoice = {
  id: string;
  siteId: string;
  period: string;
  amountGbp: number;
  status: "paid" | "due" | "disputed";
};

export type Event = {
  id: string;
  at: string;
  kind:
    | "order_created"
    | "milestone_updated"
    | "case_opened"
    | "case_escalated"
    | "invoice_issued"
    | "invoice_disputed";
  siteId?: string;
  orderId?: string;
  caseId?: string;
  summary: string;
};

export const providers: Provider[] = [
  { id: "p-northlink", name: "Northlink" },
  { id: "p-bluewave", name: "BlueWave" },
  { id: "p-orbittel", name: "OrbitTel" },
  { id: "p-skyline", name: "Skyline Networks" },
  { id: "p-aurora", name: "Aurora Fibre" },
];

export const sites: Site[] = [
  { id: "s-london-01", name: "London HQ", customer: "Eversley Bank", country: "UK", region: "UK", providerId: "p-northlink", criticality: "critical" },
  { id: "s-reigate-01", name: "Reigate Ops", customer: "Eversley Bank", country: "UK", region: "UK", providerId: "p-bluewave", criticality: "standard" },
  { id: "s-manchester-01", name: "Manchester DC", customer: "Eversley Bank", country: "UK", region: "UK", providerId: "p-aurora", criticality: "critical" },

  { id: "s-frankfurt-01", name: "Frankfurt DC", customer: "Northbridge Pharma", country: "DE", region: "EMEA", providerId: "p-orbittel", criticality: "critical" },
  { id: "s-paris-01", name: "Paris Office", customer: "Northbridge Pharma", country: "FR", region: "EMEA", providerId: "p-skyline", criticality: "standard" },
  { id: "s-dubai-01", name: "Dubai Hub", customer: "Helios Energy", country: "AE", region: "EMEA", providerId: "p-aurora", criticality: "critical" },

  { id: "s-singapore-01", name: "Singapore Hub", customer: "Globex Retail", country: "SG", region: "APAC", providerId: "p-northlink", criticality: "critical" },
  { id: "s-tokyo-01", name: "Tokyo Branch", customer: "Globex Retail", country: "JP", region: "APAC", providerId: "p-skyline", criticality: "standard" },
  { id: "s-sydney-01", name: "Sydney Ops", customer: "Globex Retail", country: "AU", region: "APAC", providerId: "p-orbittel", criticality: "standard" },

  { id: "s-austin-01", name: "Austin Branch", customer: "Apex Aviation", country: "US", region: "AMER", providerId: "p-bluewave", criticality: "standard" },
  { id: "s-newyork-01", name: "New York HQ", customer: "Apex Aviation", country: "US", region: "AMER", providerId: "p-skyline", criticality: "critical" },
  { id: "s-toronto-01", name: "Toronto Office", customer: "Crown & Finch Legal", country: "CA", region: "AMER", providerId: "p-aurora", criticality: "standard" },
];

export const orders: Order[] = [
  {
    id: "o-1001",
    siteId: "s-singapore-01",
    serviceType: "sd-wan",
    createdAt: "2025-11-30T09:12:00Z",
    targetDate: "2025-12-20T00:00:00Z",
    milestones: [
      {
        id: "m-1001-1",
        name: "Site survey",
        state: "done",
        updatedAt: "2025-12-02T10:00:00Z",
        ownerTeam: "Service Delivery",
      },
      {
        id: "m-1001-2",
        name: "Circuit delivery",
        state: "blocked",
        blockedReason: "awaiting_provider",
        updatedAt: "2025-12-10T14:00:00Z",
        ownerTeam: "Provider",
      },
      {
        id: "m-1001-3",
        name: "CPE install",
        state: "planned",
        updatedAt: "2025-12-10T14:00:00Z",
        ownerTeam: "Service Delivery",
      },
    ],
  },
  {
    id: "o-1002",
    siteId: "s-austin-01",
    serviceType: "internet",
    createdAt: "2025-12-01T10:05:00Z",
    targetDate: "2025-12-28T00:00:00Z",
    milestones: [
      {
        id: "m-1002-1",
        name: "Circuit order",
        state: "in_progress",
        updatedAt: "2025-12-12T09:00:00Z",
        ownerTeam: "Provider",
      },
      {
        id: "m-1002-2",
        name: "Install & test",
        state: "planned",
        updatedAt: "2025-12-12T09:00:00Z",
        ownerTeam: "Service Delivery",
      },
    ],
  },
  {
    id: "o-1003",
    siteId: "s-frankfurt-01",
    serviceType: "security",
    createdAt: "2025-12-03T08:30:00Z",
    targetDate: "2025-12-18T00:00:00Z",
    milestones: [
      {
        id: "m-1003-1",
        name: "Policy design",
        state: "done",
        updatedAt: "2025-12-05T12:00:00Z",
        ownerTeam: "Service Delivery",
      },
      {
        id: "m-1003-2",
        name: "Change window",
        state: "blocked",
        blockedReason: "awaiting_change_window",
        updatedAt: "2025-12-12T13:15:00Z",
        ownerTeam: "Customer",
      },
    ],
  },
  {
    id: "o-1004",
    siteId: "s-london-01",
    serviceType: "internet",
    createdAt: "2025-12-02T14:10:00Z",
    targetDate: "2025-12-19T00:00:00Z",
    milestones: [
      {
        id: "m-1004-1",
        name: "Carrier feasibility",
        state: "done",
        updatedAt: "2025-12-03T09:20:00Z",
        ownerTeam: "Provider",
      },
      {
        id: "m-1004-2",
        name: "Install booking",
        state: "blocked",
        blockedReason: "awaiting_customer",
        updatedAt: "2025-12-15T11:30:00Z",
        ownerTeam: "Customer",
      },
      {
        id: "m-1004-3",
        name: "Install & test",
        state: "planned",
        updatedAt: "2025-12-15T11:30:00Z",
        ownerTeam: "Service Delivery",
      },
    ],
  },
  {
    id: "o-1005",
    siteId: "s-newyork-01",
    serviceType: "sd-wan",
    createdAt: "2025-12-04T13:00:00Z",
    targetDate: "2026-01-10T00:00:00Z",
    milestones: [
      {
        id: "m-1005-1",
        name: "CPE shipping",
        state: "in_progress",
        updatedAt: "2025-12-16T08:00:00Z",
        ownerTeam: "Provider",
      },
      {
        id: "m-1005-2",
        name: "Remote staging",
        state: "planned",
        updatedAt: "2025-12-16T08:00:00Z",
        ownerTeam: "Service Delivery",
      },
    ],
  },
  {
    id: "o-1006",
    siteId: "s-dubai-01",
    serviceType: "security",
    createdAt: "2025-12-05T09:00:00Z",
    targetDate: "2025-12-27T00:00:00Z",
    milestones: [
      {
        id: "m-1006-1",
        name: "Requirements",
        state: "done",
        updatedAt: "2025-12-06T12:00:00Z",
        ownerTeam: "Service Delivery",
      },
      {
        id: "m-1006-2",
        name: "Provider delivery",
        state: "in_progress",
        updatedAt: "2025-12-14T10:00:00Z",
        ownerTeam: "Provider",
      },
      {
        id: "m-1006-3",
        name: "Change implementation",
        state: "planned",
        updatedAt: "2025-12-14T10:00:00Z",
        ownerTeam: "Customer",
      },
    ],
  },
  {
    id: "o-1007",
    siteId: "s-paris-01",
    serviceType: "internet",
    createdAt: "2025-12-06T10:30:00Z",
    targetDate: "2025-12-23T00:00:00Z",
    milestones: [
      {
        id: "m-1007-1",
        name: "Circuit order",
        state: "blocked",
        blockedReason: "awaiting_provider",
        updatedAt: "2025-12-13T09:00:00Z",
        ownerTeam: "Provider",
      },
      {
        id: "m-1007-2",
        name: "Install & test",
        state: "planned",
        updatedAt: "2025-12-13T09:00:00Z",
        ownerTeam: "Service Delivery",
      },
    ],
  },
  {
    id: "o-1008",
    siteId: "s-tokyo-01",
    serviceType: "sd-wan",
    createdAt: "2025-12-07T07:45:00Z",
    targetDate: "2025-12-30T00:00:00Z",
    milestones: [
      {
        id: "m-1008-1",
        name: "Local access",
        state: "in_progress",
        updatedAt: "2025-12-16T04:00:00Z",
        ownerTeam: "Provider",
      },
      {
        id: "m-1008-2",
        name: "CPE install",
        state: "planned",
        updatedAt: "2025-12-16T04:00:00Z",
        ownerTeam: "Service Delivery",
      },
    ],
  },
  {
    id: "o-1009",
    siteId: "s-manchester-01",
    serviceType: "security",
    createdAt: "2025-12-08T11:20:00Z",
    targetDate: "2025-12-21T00:00:00Z",
    milestones: [
      {
        id: "m-1009-1",
        name: "Policy design",
        state: "done",
        updatedAt: "2025-12-10T10:00:00Z",
        ownerTeam: "Service Delivery",
      },
      {
        id: "m-1009-2",
        name: "Change window",
        state: "blocked",
        blockedReason: "awaiting_change_window",
        updatedAt: "2025-12-16T10:00:00Z",
        ownerTeam: "Customer",
      },
      {
        id: "m-1009-3",
        name: "Implementation",
        state: "planned",
        updatedAt: "2025-12-16T10:00:00Z",
        ownerTeam: "Service Delivery",
      },
    ],
  },
  {
    id: "o-1010",
    siteId: "s-sydney-01",
    serviceType: "internet",
    createdAt: "2025-12-09T03:15:00Z",
    targetDate: "2025-12-26T00:00:00Z",
    milestones: [
      {
        id: "m-1010-1",
        name: "Circuit delivery",
        state: "blocked",
        blockedReason: "awaiting_provider",
        updatedAt: "2025-12-16T05:00:00Z",
        ownerTeam: "Provider",
      },
      {
        id: "m-1010-2",
        name: "Install",
        state: "planned",
        updatedAt: "2025-12-16T05:00:00Z",
        ownerTeam: "Service Delivery",
      },
    ],
  },
];

export const cases: Case[] = [
  {
    id: "c-9001",
    siteId: "s-london-01",
    title: "Intermittent packet loss impacting voice",
    severity: "sev2",
    status: "investigating",
    ownerTeam: "NOC",
    openedAt: "2025-12-16T06:40:00Z",
    slaDueAt: "2025-12-17T06:40:00Z",
  },
  {
    id: "c-9002",
    siteId: "s-singapore-01",
    title: "Provider update overdue for circuit delivery",
    severity: "sev3",
    status: "waiting",
    ownerTeam: "Provider",
    openedAt: "2025-12-14T08:00:00Z",
    slaDueAt: "2025-12-18T08:00:00Z",
  },
  {
    id: "c-9003",
    siteId: "s-frankfurt-01",
    title: "Change approval pending for security policy deployment",
    severity: "sev2",
    status: "waiting",
    ownerTeam: "Service Delivery",
    openedAt: "2025-12-13T09:10:00Z",
    slaDueAt: "2025-12-17T09:10:00Z",
  },
  {
    id: "c-9004",
    siteId: "s-dubai-01",
    title: "Firewall throughput concerns after provider handoff",
    severity: "sev3",
    status: "investigating",
    ownerTeam: "NOC",
    openedAt: "2025-12-15T18:30:00Z",
    slaDueAt: "2025-12-18T18:30:00Z",
  },
  {
    id: "c-9005",
    siteId: "s-paris-01",
    title: "Carrier lead time clarification required for circuit order",
    severity: "sev3",
    status: "waiting",
    ownerTeam: "Provider",
    openedAt: "2025-12-16T12:20:00Z",
    slaDueAt: "2025-12-19T12:20:00Z",
  },
  {
    id: "c-9006",
    siteId: "s-newyork-01",
    title: "SD-WAN staging checklist incomplete",
    severity: "sev1",
    status: "open",
    ownerTeam: "Service Delivery",
    openedAt: "2025-12-17T04:00:00Z",
    slaDueAt: "2025-12-17T12:00:00Z",
  },
];

export const invoices: Invoice[] = [
  { id: "i-3001", siteId: "s-london-01", period: "2025-11", amountGbp: 4820, status: "paid" },
  { id: "i-3002", siteId: "s-london-01", period: "2025-12", amountGbp: 5190, status: "due" },
  { id: "i-3003", siteId: "s-singapore-01", period: "2025-12", amountGbp: 6100, status: "disputed" },
  { id: "i-3004", siteId: "s-frankfurt-01", period: "2025-12", amountGbp: 7420, status: "due" },
  { id: "i-3005", siteId: "s-dubai-01", period: "2025-12", amountGbp: 8350, status: "paid" },
  { id: "i-3006", siteId: "s-newyork-01", period: "2025-12", amountGbp: 11200, status: "disputed" },
  { id: "i-3007", siteId: "s-paris-01", period: "2025-12", amountGbp: 3980, status: "due" },
  { id: "i-3008", siteId: "s-tokyo-01", period: "2025-12", amountGbp: 4550, status: "paid" },
  { id: "i-3009", siteId: "s-manchester-01", period: "2025-12", amountGbp: 5210, status: "due" },
];

export const events: Event[] = [
  {
    id: "e-1",
    at: "2025-12-16T06:40:00Z",
    kind: "case_opened",
    siteId: "s-london-01",
    caseId: "c-9001",
    summary: "Case opened: Intermittent packet loss impacting voice (sev2)",
  },
  {
    id: "e-2",
    at: "2025-12-14T08:00:00Z",
    kind: "case_opened",
    siteId: "s-singapore-01",
    caseId: "c-9002",
    summary: "Case opened: Provider update overdue for circuit delivery (sev3)",
  },
  {
    id: "e-3",
    at: "2025-12-12T13:15:00Z",
    kind: "milestone_updated",
    siteId: "s-frankfurt-01",
    orderId: "o-1003",
    summary: "Milestone blocked: Change window awaiting customer approval",
  },
  {
    id: "e-4",
    at: "2025-12-12T09:00:00Z",
    kind: "milestone_updated",
    siteId: "s-austin-01",
    orderId: "o-1002",
    summary: "Milestone in progress: Circuit order acknowledged by provider",
  },
  {
    id: "e-5",
    at: "2025-12-10T14:00:00Z",
    kind: "milestone_updated",
    siteId: "s-singapore-01",
    orderId: "o-1001",
    summary: "Milestone blocked: Circuit delivery awaiting provider",
  },
  {
    id: "e-6",
    at: "2025-12-09T12:00:00Z",
    kind: "invoice_disputed",
    siteId: "s-singapore-01",
    summary: "Invoice disputed: duplicate line items suspected for 2025-12",
  },
  {
    id: "e-7",
    at: "2025-12-15T11:30:00Z",
    kind: "milestone_updated",
    siteId: "s-london-01",
    orderId: "o-1004",
    summary: "Milestone blocked: install booking awaiting customer availability",
  },
  {
    id: "e-8",
    at: "2025-12-16T08:00:00Z",
    kind: "milestone_updated",
    siteId: "s-newyork-01",
    orderId: "o-1005",
    summary: "Milestone in progress: CPE shipping in transit",
  },
  {
    id: "e-9",
    at: "2025-12-17T04:00:00Z",
    kind: "case_opened",
    siteId: "s-newyork-01",
    caseId: "c-9006",
    summary: "Case opened: SD-WAN staging checklist incomplete (sev1)",
  },
  {
    id: "e-10",
    at: "2025-12-16T05:00:00Z",
    kind: "milestone_updated",
    siteId: "s-sydney-01",
    orderId: "o-1010",
    summary: "Milestone blocked: circuit delivery awaiting provider confirmation",
  },
  {
    id: "e-11",
    at: "2025-12-16T12:20:00Z",
    kind: "case_opened",
    siteId: "s-paris-01",
    caseId: "c-9005",
    summary: "Case opened: Carrier lead time clarification required (sev3)",
  },
  {
    id: "e-12",
    at: "2025-12-12T08:05:00Z",
    kind: "invoice_issued",
    siteId: "s-frankfurt-01",
    summary: "Invoice issued for 2025-12 (due)",
  },
];
