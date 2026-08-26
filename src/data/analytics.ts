/**
 * AutoCore ERP — Analytics (KPI Time Series for Dashboards)
 * Flows: F18 Analytics — Executive, Sales, Service, Parts, Accounting dashboards
 */

export type Granularity = 'daily' | 'weekly' | 'monthly';

export interface KpiPoint {
  date: string; // ISO date (YYYY-MM-DD)
  rooftopId: 'dtown' | 'north' | 'westside' | 'group';
  // Sales
  leads: number;
  appointmentsSet: number;
  shows: number;
  sales: number; // units delivered
  closingPct: number; // sales / leads
  grossPerUnit: number; // avg front+back
  frontGrossPerUnit: number;
  backGrossPerUnit: number;
  citOpenAmount?: number;
  // Service
  roCount?: number;
  serviceSales?: number;
  hoursFlagged?: number;
  efficiencyPct?: number;
  // Parts
  partsSales?: number;
  partsGrossPct?: number;
  // Inventory
  inventoryCount?: number;
  agingGt45?: number;
  // Funnel includes speed-to-lead
  avgSpeedToLeadSec?: number;
}

export interface FunnelStage {
  stage: 'Leads' | 'Contacted' | 'Appointment Set' | 'Shown' | 'Sold';
  count: number;
  pctOfLeads: number;
}

export interface LeaderboardEntry {
  name: string;
  rooftopId: 'dtown' | 'north' | 'westside';
  metric: string;
  value: number;
  rank: number;
}

// ── 14-day daily time series (2026-04-07 to 2026-04-20) — group + by rooftop breakdown ──

export const kpiDaily: KpiPoint[] = [
  // group rollups
  { date: '2026-04-07', rooftopId: 'group', leads: 3, appointmentsSet: 2, shows: 2, sales: 1, closingPct: 33.3, grossPerUnit: 2890, frontGrossPerUnit: 1445, backGrossPerUnit: 1445, citOpenAmount: 40325, roCount: 4, serviceSales: 1820, hoursFlagged: 6.2, efficiencyPct: 108, partsSales: 2100, partsGrossPct: 34, inventoryCount: 18, agingGt45: 3, avgSpeedToLeadSec: 340 },
  { date: '2026-04-08', rooftopId: 'group', leads: 4, appointmentsSet: 2, shows: 1, sales: 2, closingPct: 50.0, grossPerUnit: 2165, frontGrossPerUnit: 1315, backGrossPerUnit: 850, citOpenAmount: 50425, roCount: 5, serviceSales: 2440, hoursFlagged: 7.8, efficiencyPct: 112, partsSales: 2380, partsGrossPct: 36, inventoryCount: 19, agingGt45: 3, avgSpeedToLeadSec: 16200 },
  { date: '2026-04-09', rooftopId: 'group', leads: 2, appointmentsSet: 2, shows: 2, sales: 0, closingPct: 0, grossPerUnit: 0, frontGrossPerUnit: 0, backGrossPerUnit: 0, citOpenAmount: 50425, roCount: 3, serviceSales: 1890, hoursFlagged: 5.4, efficiencyPct: 105, partsSales: 2650, partsGrossPct: 33, inventoryCount: 19, agingGt45: 3, avgSpeedToLeadSec: 5100 },
  { date: '2026-04-10', rooftopId: 'group', leads: 5, appointmentsSet: 3, shows: 2, sales: 0, closingPct: 0, grossPerUnit: 0, frontGrossPerUnit: 0, backGrossPerUnit: 0, citOpenAmount: 28221, roCount: 4, serviceSales: 2100, hoursFlagged: 6.0, efficiencyPct: 98, partsSales: 2890, partsGrossPct: 38, inventoryCount: 20, agingGt45: 4, avgSpeedToLeadSec: 782 },
  { date: '2026-04-11', rooftopId: 'group', leads: 4, appointmentsSet: 3, shows: 3, sales: 2, closingPct: 50.0, grossPerUnit: 1855, frontGrossPerUnit: 1145, backGrossPerUnit: 610, citOpenAmount: 56442, roCount: 6, serviceSales: 3100, hoursFlagged: 9.2, efficiencyPct: 118, partsSales: 2440, partsGrossPct: 35, inventoryCount: 18, agingGt45: 3, avgSpeedToLeadSec: 312 },
  { date: '2026-04-12', rooftopId: 'group', leads: 6, appointmentsSet: 4, shows: 4, sales: 3, closingPct: 50.0, grossPerUnit: 1686, frontGrossPerUnit: 1456, backGrossPerUnit: 163, citOpenAmount: 56442, roCount: 5, serviceSales: 2680, hoursFlagged: 8.1, efficiencyPct: 114, partsSales: 3120, partsGrossPct: 37, inventoryCount: 16, agingGt45: 2, avgSpeedToLeadSec: 98 },
  { date: '2026-04-13', rooftopId: 'group', leads: 2, appointmentsSet: 1, shows: 1, sales: 0, closingPct: 0, grossPerUnit: 0, frontGrossPerUnit: 0, backGrossPerUnit: 0, citOpenAmount: 56442, roCount: 2, serviceSales: 980, hoursFlagged: 3.1, efficiencyPct: 95, partsSales: 1840, partsGrossPct: 32, inventoryCount: 16, agingGt45: 2, avgSpeedToLeadSec: 210 },
  { date: '2026-04-14', rooftopId: 'group', leads: 4, appointmentsSet: 2, shows: 2, sales: 0, closingPct: 0, grossPerUnit: 0, frontGrossPerUnit: 0, backGrossPerUnit: 0, citOpenAmount: 29824, roCount: 4, serviceSales: 2200, hoursFlagged: 6.8, efficiencyPct: 106, partsSales: 2210, partsGrossPct: 34, inventoryCount: 17, agingGt45: 2, avgSpeedToLeadSec: 680 },
  { date: '2026-04-15', rooftopId: 'group', leads: 2, appointmentsSet: 2, shows: 1, sales: 0, closingPct: 0, grossPerUnit: 0, frontGrossPerUnit: 0, backGrossPerUnit: 0, citOpenAmount: 29824, roCount: 3, serviceSales: 1950, hoursFlagged: 5.9, efficiencyPct: 102, partsSales: 2380, partsGrossPct: 36, inventoryCount: 17, agingGt45: 2, avgSpeedToLeadSec: 588 },
  { date: '2026-04-16', rooftopId: 'group', leads: 3, appointmentsSet: 2, shows: 2, sales: 1, closingPct: 33.3, grossPerUnit: 3420, frontGrossPerUnit: 1890, backGrossPerUnit: 1530, citOpenAmount: 59648, roCount: 5, serviceSales: 2890, hoursFlagged: 8.4, efficiencyPct: 115, partsSales: 2680, partsGrossPct: 39, inventoryCount: 16, agingGt45: 2, avgSpeedToLeadSec: 310 },
  { date: '2026-04-17', rooftopId: 'group', leads: 2, appointmentsSet: 1, shows: 1, sales: 0, closingPct: 0, grossPerUnit: 0, frontGrossPerUnit: 0, backGrossPerUnit: 0, citOpenAmount: 101502, roCount: 4, serviceSales: 2450, hoursFlagged: 7.2, efficiencyPct: 110, partsSales: 2520, partsGrossPct: 35, inventoryCount: 16, agingGt45: 2, avgSpeedToLeadSec: 190 },
  { date: '2026-04-18', rooftopId: 'group', leads: 3, appointmentsSet: 2, shows: 2, sales: 0, closingPct: 0, grossPerUnit: 0, frontGrossPerUnit: 0, backGrossPerUnit: 0, citOpenAmount: 101502, roCount: 6, serviceSales: 3200, hoursFlagged: 9.8, efficiencyPct: 122, partsSales: 2890, partsGrossPct: 38, inventoryCount: 16, agingGt45: 2, avgSpeedToLeadSec: 84 },
  { date: '2026-04-19', rooftopId: 'group', leads: 5, appointmentsSet: 3, shows: 2, sales: 1, closingPct: 20.0, grossPerUnit: 2140, frontGrossPerUnit: 1640, backGrossPerUnit: 500, citOpenAmount: 128243, roCount: 7, serviceSales: 3680, hoursFlagged: 11.2, efficiencyPct: 128, partsSales: 3420, partsGrossPct: 40, inventoryCount: 15, agingGt45: 2, avgSpeedToLeadSec: 522 },
  { date: '2026-04-20', rooftopId: 'group', leads: 4, appointmentsSet: 1, shows: 0, sales: 0, closingPct: 0, grossPerUnit: 0, frontGrossPerUnit: 0, backGrossPerUnit: 0, citOpenAmount: 128243, roCount: 3, serviceSales: 1450, hoursFlagged: 4.1, efficiencyPct: 98, partsSales: 2100, partsGrossPct: 34, inventoryCount: 15, agingGt45: 2, avgSpeedToLeadSec: 946 },

  // per-rooftop for 04-20 only (drilldown showcase)
  { date: '2026-04-20', rooftopId: 'dtown', leads: 1, appointmentsSet: 0, shows: 0, sales: 0, closingPct: 0, grossPerUnit: 0, frontGrossPerUnit: 0, backGrossPerUnit: 0, citOpenAmount: 29824, roCount: 1, serviceSales: 0, hoursFlagged: 2.9, efficiencyPct: 118, partsSales: 844, partsGrossPct: 42, inventoryCount: 6, agingGt45: 1, avgSpeedToLeadSec: 75 },
  { date: '2026-04-20', rooftopId: 'north', leads: 2, appointmentsSet: 1, shows: 0, sales: 0, closingPct: 0, grossPerUnit: 0, frontGrossPerUnit: 0, backGrossPerUnit: 0, citOpenAmount: 68546, roCount: 1, serviceSales: 0, hoursFlagged: 0.8, efficiencyPct: 87, partsSales: 540, partsGrossPct: 28, inventoryCount: 5, agingGt45: 1, avgSpeedToLeadSec: 1374 },
  { date: '2026-04-20', rooftopId: 'westside', leads: 1, appointmentsSet: 0, shows: 0, sales: 0, closingPct: 0, grossPerUnit: 0, frontGrossPerUnit: 0, backGrossPerUnit: 0, citOpenAmount: 29873, roCount: 1, serviceSales: 1450, hoursFlagged: 1.9, efficiencyPct: 105, partsSales: 716, partsGrossPct: 31, inventoryCount: 4, agingGt45: 0, avgSpeedToLeadSec: 0 },
];

export const kpiWeekly: KpiPoint[] = [
  { date: '2026-04-07', rooftopId: 'group', leads: 22, appointmentsSet: 14, shows: 12, sales: 5, closingPct: 22.7, grossPerUnit: 2120, frontGrossPerUnit: 1340, backGrossPerUnit: 780, roCount: 22, serviceSales: 11240, hoursFlagged: 33.4, efficiencyPct: 108, partsSales: 13180, partsGrossPct: 35, inventoryCount: 18, agingGt45: 3, avgSpeedToLeadSec: 2180 },
  { date: '2026-04-14', rooftopId: 'group', leads: 20, appointmentsSet: 11, shows: 9, sales: 2, closingPct: 10.0, grossPerUnit: 2780, frontGrossPerUnit: 1765, backGrossPerUnit: 1015, roCount: 26, serviceSales: 14830, hoursFlagged: 42.6, efficiencyPct: 114, partsSales: 15260, partsGrossPct: 37, inventoryCount: 16, agingGt45: 2, avgSpeedToLeadSec: 458 },
];

export const kpiMonthly: KpiPoint[] = [
  { date: '2026-03-01', rooftopId: 'group', leads: 88, appointmentsSet: 52, shows: 41, sales: 18, closingPct: 20.5, grossPerUnit: 2680, frontGrossPerUnit: 1620, backGrossPerUnit: 1060, roCount: 94, serviceSales: 48200, hoursFlagged: 142, efficiencyPct: 110, partsSales: 58200, partsGrossPct: 36, inventoryCount: 20, agingGt45: 4, avgSpeedToLeadSec: 890 },
  { date: '2026-04-01', rooftopId: 'group', leads: 49, appointmentsSet: 27, shows: 21, sales: 10, closingPct: 20.4, grossPerUnit: 2380, frontGrossPerUnit: 1480, backGrossPerUnit: 900, roCount: 62, serviceSales: 34800, hoursFlagged: 98.4, efficiencyPct: 112, partsSales: 38720, partsGrossPct: 36, inventoryCount: 15, agingGt45: 2, avgSpeedToLeadSec: 684 },
];

// Funnel for current period (April MTD) — group
export const funnelMTD: FunnelStage[] = [
  { stage: 'Leads', count: 49, pctOfLeads: 100 },
  { stage: 'Contacted', count: 44, pctOfLeads: 89.8 },
  { stage: 'Appointment Set', count: 27, pctOfLeads: 55.1 },
  { stage: 'Shown', count: 21, pctOfLeads: 42.9 },
  { stage: 'Sold', count: 10, pctOfLeads: 20.4 },
];

// By source breakdown (MTD)
export const funnelBySource = [
  { source: 'Website' as const, leads: 18, sold: 4, closingPct: 22.2 },
  { source: 'ThirdParty' as const, leads: 14, sold: 2, closingPct: 14.3 },
  { source: 'Phone' as const, leads: 8, sold: 2, closingPct: 25.0 },
  { source: 'Showroom' as const, leads: 6, sold: 2, closingPct: 33.3 },
  { source: 'ServiceDrive' as const, leads: 3, sold: 0, closingPct: 0 },
];

// Leaderboards
export const salesLeaderboard: LeaderboardEntry[] = [
  { name: 'R. Owens — North', rooftopId: 'north', metric: 'Units', value: 3, rank: 1 },
  { name: 'J. Alvarez — Dtown', rooftopId: 'dtown', metric: 'Units', value: 2, rank: 2 },
  { name: 'K. Adams — Westside', rooftopId: 'westside', metric: 'Units', value: 2, rank: 2 },
  { name: 'L. Carter — Westside', rooftopId: 'westside', metric: 'Units', value: 2, rank: 2 },
  { name: 'S. Mitchell — Dtown', rooftopId: 'dtown', metric: 'Units', value: 1, rank: 5 },
];

export const grossLeaderboard: LeaderboardEntry[] = [
  { name: 'L. Carter — Westside', rooftopId: 'westside', metric: 'Gross $', value: 7800, rank: 1 },
  { name: 'J. Alvarez — Dtown', rooftopId: 'dtown', metric: 'Gross $', value: 5560, rank: 2 },
  { name: 'R. Owens — North', rooftopId: 'north', metric: 'Gross $', value: 5030, rank: 3 },
  { name: 'T. Brooks — North', rooftopId: 'north', metric: 'Gross $', value: 4280, rank: 4 },
  { name: 'S. Mitchell — Dtown', rooftopId: 'dtown', metric: 'Gross $', value: 3240, rank: 5 },
];

export const serviceLeaderboard: LeaderboardEntry[] = [
  { name: 'W. Schmidt — Westside (A)', rooftopId: 'westside', metric: 'Efficiency %', value: 142, rank: 1 },
  { name: 'J. Walker — North (A)', rooftopId: 'north', metric: 'Efficiency %', value: 131, rank: 2 },
  { name: 'R. Ortiz — Dtown (A)', rooftopId: 'dtown', metric: 'Efficiency %', value: 118, rank: 3 },
  { name: 'K. Nguyen — Westside (B)', rooftopId: 'westside', metric: 'Efficiency %', value: 105, rank: 4 },
];

// Executive summary KPIs (for top cards) — April MTD
export const executiveKpis = {
  period: '2026-04-01 → 2026-04-20 (MTD)',
  totalLeads: 49,
  totalSales: 10,
  closingPct: 20.4,
  totalGross: 23_800,
  avgGrossPerUnit: 2380,
  avgFront: 1480,
  avgBack: 900,
  citOpen: 128_243,
  citOverdue: 61_032, // D-1050 + D-1052
  floorplanPrincipal: 245_000, // open only
  floorplanOverdue: 2,
  serviceSales: 34_800,
  serviceEfficiency: 112,
  partsSales: 38_720,
  partsGrossPct: 36,
  speedToLeadAvgSec: 684,
  speedToLeadGrade: 'C' as const,
  // vs prior period (March full month normalized to 20 days)
  vsPrior: {
    leadsDeltaPct: -8.2,
    salesDeltaPct: +11.1,
    grossDeltaPct: +4.8,
    speedToLeadDeltaSec: -206, // improvement
  },
};

// Sparkline helpers — last 14 days values for mini charts
export const sparklines = {
  leads: kpiDaily.filter(k => k.rooftopId === 'group').slice(0, 14).map(k => k.leads),
  sales: kpiDaily.filter(k => k.rooftopId === 'group').slice(0, 14).map(k => k.sales),
  gross: kpiDaily.filter(k => k.rooftopId === 'group').slice(0, 14).map(k => k.grossPerUnit),
  speedToLead: kpiDaily.filter(k => k.rooftopId === 'group').slice(0, 14).map(k => k.avgSpeedToLeadSec ?? 0),
  serviceSales: kpiDaily.filter(k => k.rooftopId === 'group').slice(0, 14).map(k => k.serviceSales ?? 0),
  partsSales: kpiDaily.filter(k => k.rooftopId === 'group').slice(0, 14).map(k => k.partsSales ?? 0),
};
