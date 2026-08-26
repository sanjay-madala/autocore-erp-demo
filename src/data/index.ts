/**
 * AutoCore Automotive ERP — Demo Data Barrel
 * Group: sovereign-auto-group | Rooftops: dtown, north, westside
 * Covers all 18 flows F1-F18 across 10 domain modules + analytics
 *
 * F1  Lead Capture & Distribution        → leads.ts
 * F2  Showroom / CRM Pipeline            → customers.ts, leads.ts
 * F3  Desking & Pencil                   → deals.ts
 * F4  Trade Appraisal                    → deals.ts (trade), vehicles.ts (acquisition)
 * F5  Credit & Compliance (OFAC/Red Flags) → customers.ts, deals.ts
 * F6  F&I Menu Presentation              → deals.ts (fiProducts, fiMenuPresentation)
 * F7  Contracting & eSign                → deals.ts (eSignStatus)
 * F8  Funding & CIT                      → deals.ts (funding), accounting.ts (citSchedule)
 * F9  Inventory Acquisition & Ordering   → vehicles.ts
 * F10 Recon & Merchandising              → vehicles.ts (reconCost/status), service.ts (RO-1005)
 * F11 Pricing & Market Intelligence      → vehicles.ts (marketDaySupply, vAutoScore), ai.ts (COP-002)
 * F12 Service Drive & Appointments       → service.ts (appointments)
 * F13 Repair Order & MPI                 → service.ts (repairOrders, mpiItems, videoMpi)
 * F14 Dispatch & Technician Efficiency   → service.ts (technicians, dispatch)
 * F15 Parts Catalog & Inventory          → parts.ts
 * F16 Wholesale & Fulfillment            → parts.ts (wholesaleAccounts, shortSales)
 * F17 Accounting Close & Schedules       → accounting.ts
 * F18 Platform, Integrations & AI        → platform.ts, ai.ts, analytics.ts
 */

// Vehicles — F9/F10/F11
export * from './vehicles';
// Customers — F2/F5 (golden record dedup)
export * from './customers';
// Deals — F1/F3/F4/F5/F6/F7/F8
export * from './deals';
// Leads — F1/F2 (speed-to-lead + dedup)
export * from './leads';
// Service — F12/F13/F14
export * from './service';
// Parts — F15/F16
export * from './parts';
// Accounting — F8/F17
export * from './accounting';
// Platform — F18
export * from './platform';
// AI — F18
export * from './ai';
// Analytics — F18 dashboards
export * from './analytics';

// ── Convenience re-exports for common lookups ──
import { vehicles } from './vehicles';
import { customers } from './customers';
import { deals } from './deals';
import { leads } from './leads';
import { repairOrders, serviceAppointments, technicians } from './service';
import { parts } from './parts';
import { glAccounts, closeChecklist } from './accounting';
import { apiKeys, webhooks, marketplaceApps } from './platform';
import { aiCalls, copilotSuggestions } from './ai';
import { kpiDaily, executiveKpis } from './analytics';

export const groupMeta = {
  id: 'sovereign-auto-group',
  name: 'Sovereign Auto Group',
  rooftops: [
    { id: 'dtown' as const, name: 'Sovereign Toyota Downtown', brands: ['Toyota'] as const, address: '4401 Charlotte Ave, Nashville, TN 37209' },
    { id: 'north' as const, name: 'Sovereign Ford North', brands: ['Ford'] as const, address: '2710 Old Hickory Blvd, Whites Creek, TN 37189' },
    { id: 'westside' as const, name: 'Sovereign Westside (Honda / BMW / Hyundai)', brands: ['Honda', 'BMW', 'Hyundai'] as const, address: '600 12th Ave S, Nashville, TN 37203' },
  ],
} as const;

// Quick counts for UI badges / sanity checks
export const dataCounts = {
  vehicles: vehicles.length,
  customers: customers.length, // includes 1 duplicate record (CUS-008-DUP) sharing master M-008 → 15 unique humans
  uniqueCustomers: new Set(customers.map(c => c.masterId)).size,
  deals: deals.length,
  leads: leads.length,
  appointments: serviceAppointments.length,
  repairOrders: repairOrders.length,
  technicians: technicians.length,
  parts: parts.length,
  glAccounts: glAccounts.length,
  closeTasks: closeChecklist.length,
  apiKeys: apiKeys.length,
  webhooks: webhooks.length,
  marketplaceApps: marketplaceApps.length,
  aiCalls: aiCalls.length,
  copilotSuggestions: copilotSuggestions.length,
  kpiDailyPoints: kpiDaily.length,
  executiveKpis,
} as const;
