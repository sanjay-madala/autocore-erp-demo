/**
 * AutoCore ERP — Platform (API Keys, Webhooks, Marketplace Apps & Integration Logs)
 * Flows: F18 Platform, Integrations & Ecosystem
 */

export type ApiKeyStatus = 'active' | 'revoked' | 'expired';
export type WebhookEvent =
  | 'lead.created'
  | 'lead.updated'
  | 'deal.contracted'
  | 'deal.funded'
  | 'vehicle.price_changed'
  | 'vehicle.sold'
  | 'ro.created'
  | 'ro.invoiced'
  | 'parts.invoice_posted'
  | 'cit.overdue'
  | 'floorplan.curtailment_due';
export type DeliveryStatus = 'delivered' | 'failed' | 'pending' | 'retrying';
export type AppCategory = 'CRM' | 'DMS' | 'Lender' | 'Marketing' | 'Communication' | 'Data' | 'F&I' | 'Service' | 'Accounting';
export type AppStatus = 'installed' | 'available' | 'pending_approval' | 'deprecated';

export interface ApiKey {
  id: string;
  name: string;
  prefix: string; // e.g., ac_live_••••
  keyPreview: string; // last 4
  environment: 'live' | 'sandbox';
  scopes: string[]; // e.g., "vehicles:read", "deals:write"
  rooftopScope: ('dtown' | 'north' | 'westside' | 'group')[];
  createdBy: string;
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
  status: ApiKeyStatus;
  rateLimitPerMin: number;
  requestsMTD: number;
}

export interface Webhook {
  id: string;
  url: string;
  description: string;
  events: WebhookEvent[];
  secretPreview: string; // whsec_••••
  status: 'active' | 'paused' | 'failing';
  createdBy: string;
  createdAt: string;
  failureCount7d: number;
  successRate7d: number; // 0-1
  rooftopScope: ('dtown' | 'north' | 'westside' | 'group')[];
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  payloadSummary: string;
  status: DeliveryStatus;
  attempts: number;
  lastAttemptAt: string;
  nextRetryAt?: string;
  httpStatus?: number;
  latencyMs?: number;
  rooftopId: 'dtown' | 'north' | 'westside';
}

export interface MarketplaceApp {
  id: string;
  name: string;
  publisher: string;
  category: AppCategory;
  description: string;
  logoUrl: string;
  status: AppStatus;
  installedAt?: string;
  installedBy?: string;
  version?: string;
  rating: number; // 1-5
  installs: number;
  scopesRequired: string[];
  webhookEvents?: WebhookEvent[];
  pricing: string; // e.g., "Free", "$199/mo", "Per RO $2.50"
  featured?: boolean;
}

export interface IntegrationLog {
  id: string;
  timestamp: string;
  direction: 'inbound' | 'outbound';
  system: string; // external system name
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  statusCode: number;
  latencyMs: number;
  rooftopId?: 'dtown' | 'north' | 'westside';
  correlationId: string;
  summary: string;
}

export const apiKeys: ApiKey[] = [
  {
    id: 'KEY-001',
    name: 'Website — Inventory Feed (CDK Global)',
    prefix: 'ac_live_',
    keyPreview: '…9f42',
    environment: 'live',
    scopes: ['vehicles:read', 'vehicles:write', 'photos:read'],
    rooftopScope: ['group'],
    createdBy: 'D. Nguyen — IT Admin',
    createdAt: '2026-01-10T10:00:00Z',
    lastUsedAt: '2026-04-20T15:22:00Z',
    expiresAt: '2027-01-10T10:00:00Z',
    status: 'active',
    rateLimitPerMin: 600,
    requestsMTD: 124_800,
  },
  {
    id: 'KEY-002',
    name: 'RouteOne — Credit & Deal Submission',
    prefix: 'ac_live_',
    keyPreview: '…a11e',
    environment: 'live',
    scopes: ['customers:read', 'deals:read', 'deals:write', 'credit:write'],
    rooftopScope: ['group'],
    createdBy: 'L. Harmon — F&I Director',
    createdAt: '2025-11-02T09:00:00Z',
    lastUsedAt: '2026-04-19T18:10:00Z',
    status: 'active',
    rateLimitPerMin: 300,
    requestsMTD: 8_420,
  },
  {
    id: 'KEY-003',
    name: 'Service Lane — Equity Mining',
    prefix: 'ac_live_',
    keyPreview: '…c4d8',
    environment: 'live',
    scopes: ['customers:read', 'vehicles:read', 'leads:write'],
    rooftopScope: ['dtown', 'westside'],
    createdBy: 'T. Holloway — Service Mgr',
    createdAt: '2026-02-18T14:00:00Z',
    lastUsedAt: '2026-04-19T10:00:00Z',
    status: 'active',
    rateLimitPerMin: 200,
    requestsMTD: 2_140,
  },
  {
    id: 'KEY-004',
    name: 'Data Warehouse — Analytics ETL (Snowflake)',
    prefix: 'ac_live_',
    keyPreview: '…7b02',
    environment: 'live',
    scopes: ['*:read'], // read-all
    rooftopScope: ['group'],
    createdBy: 'D. Nguyen',
    createdAt: '2025-09-14T08:00:00Z',
    lastUsedAt: '2026-04-20T06:00:00Z', // nightly ETL
    status: 'active',
    rateLimitPerMin: 1000,
    requestsMTD: 342_000,
  },
  {
    id: 'KEY-005',
    name: 'Sandbox — Partner Dev (AutoLeadStar)',
    prefix: 'ac_test_',
    keyPreview: '…e901',
    environment: 'sandbox',
    scopes: ['leads:read', 'leads:write', 'vehicles:read'],
    rooftopScope: ['dtown'],
    createdBy: 'D. Nguyen',
    createdAt: '2026-03-01T11:00:00Z',
    lastUsedAt: '2026-04-18T09:00:00Z',
    expiresAt: '2026-09-01T11:00:00Z',
    status: 'active',
    rateLimitPerMin: 100,
    requestsMTD: 1_240,
  },
  {
    id: 'KEY-006',
    name: 'Legacy — v1 Inventory (Revoked)',
    prefix: 'ac_live_',
    keyPreview: '…0001',
    environment: 'live',
    scopes: ['vehicles:read'],
    rooftopScope: ['dtown'],
    createdBy: 'Former Vendor',
    createdAt: '2024-03-10T10:00:00Z',
    lastUsedAt: '2026-03-28T09:00:00Z',
    status: 'revoked',
    rateLimitPerMin: 60,
    requestsMTD: 0,
  },
];

export const webhooks: Webhook[] = [
  {
    id: 'WH-001',
    url: 'https://hooks.cdk.com/autocore/lead-intake',
    description: 'CDK — Lead ingestion & CRM sync',
    events: ['lead.created', 'lead.updated'],
    secretPreview: 'whsec_••••8a1f',
    status: 'active',
    createdBy: 'D. Nguyen',
    createdAt: '2026-01-11T10:00:00Z',
    failureCount7d: 0,
    successRate7d: 0.998,
    rooftopScope: ['group'],
  },
  {
    id: 'WH-002',
    url: 'https://api.dealertrack.com/webhooks/autocore/deals',
    description: 'Dealertrack — Deal / F&I product submission',
    events: ['deal.contracted', 'deal.funded'],
    secretPreview: 'whsec_••••3c9e',
    status: 'active',
    createdBy: 'L. Harmon',
    createdAt: '2025-11-15T09:00:00Z',
    failureCount7d: 1,
    successRate7d: 0.985,
    rooftopScope: ['group'],
  },
  {
    id: 'WH-003',
    url: 'https://hooks.slack.com/services/T04/sovereign-alerts/cit',
    description: 'Slack — #cit-alerts (overdue CIT + curtailment)',
    events: ['cit.overdue', 'floorplan.curtailment_due'],
    secretPreview: 'whsec_••••f110',
    status: 'active',
    createdBy: 'S. Williams — Accounting',
    createdAt: '2026-02-01T08:00:00Z',
    failureCount7d: 0,
    successRate7d: 1.0,
    rooftopScope: ['group'],
  },
  {
    id: 'WH-004',
    url: 'https://events.xtime.com/autocore/ro',
    description: 'Xtime — Service RO create/invoice',
    events: ['ro.created', 'ro.invoiced'],
    secretPreview: 'whsec_••••22ba',
    status: 'failing',
    createdBy: 'T. Holloway',
    createdAt: '2026-03-10T14:00:00Z',
    failureCount7d: 12,
    successRate7d: 0.72,
    rooftopScope: ['dtown', 'westside'],
  },
  {
    id: 'WH-005',
    url: 'https://api.vauto.com/hooks/price-change',
    description: 'vAuto — Price change push to marketplace',
    events: ['vehicle.price_changed', 'vehicle.sold'],
    secretPreview: 'whsec_••••91de',
    status: 'active',
    createdBy: 'M. Singh — Used Car Mgr',
    createdAt: '2026-02-20T10:00:00Z',
    failureCount7d: 0,
    successRate7d: 0.992,
    rooftopScope: ['group'],
  },
  {
    id: 'WH-006',
    url: 'https://hooks.zapier.com/autocore/parts-invoice',
    description: 'Zapier — Parts invoice → QuickBooks Online',
    events: ['parts.invoice_posted'],
    secretPreview: 'whsec_••••ab44',
    status: 'paused',
    createdBy: 'J. Miller — Parts Mgr',
    createdAt: '2026-03-01T09:00:00Z',
    failureCount7d: 0,
    successRate7d: 0.96,
    rooftopScope: ['group'],
  },
];

export const webhookDeliveries: WebhookDelivery[] = [
  { id: 'WD-001', webhookId: 'WH-001', event: 'lead.created', payloadSummary: 'LEAD-020 — Emily Carter — BMW 330i', status: 'delivered', attempts: 1, lastAttemptAt: '2026-04-20T15:55:10Z', httpStatus: 200, latencyMs: 212, rooftopId: 'westside' },
  { id: 'WD-002', webhookId: 'WH-002', event: 'deal.contracted', payloadSummary: 'D-1042 — Tyler Brooks — Mustang GT — USAA $26,741', status: 'delivered', attempts: 1, lastAttemptAt: '2026-04-19T13:05:00Z', httpStatus: 200, latencyMs: 480, rooftopId: 'north' },
  { id: 'WD-003', webhookId: 'WH-003', event: 'cit.overdue', payloadSummary: 'D-1050 — Ally DECLINED — second look Exeter', status: 'delivered', attempts: 1, lastAttemptAt: '2026-04-18T10:15:00Z', httpStatus: 200, latencyMs: 95, rooftopId: 'westside' },
  { id: 'WD-004', webhookId: 'WH-004', event: 'ro.created', payloadSummary: 'RO-30112 — Grace Kim — Camry — waiting approval', status: 'failed', attempts: 5, lastAttemptAt: '2026-04-20T08:40:00Z', nextRetryAt: '2026-04-20T09:40:00Z', httpStatus: 502, latencyMs: 5004, rooftopId: 'dtown' },
  { id: 'WD-005', webhookId: 'WH-004', event: 'ro.invoiced', payloadSummary: 'RO-50141 — E. Carter — X5 — $508', status: 'retrying', attempts: 3, lastAttemptAt: '2026-04-19T17:20:00Z', nextRetryAt: '2026-04-20T10:00:00Z', httpStatus: 429, latencyMs: 1200, rooftopId: 'westside' },
  { id: 'WD-006', webhookId: 'WH-005', event: 'vehicle.price_changed', payloadSummary: 'T23157 Highlander — $37,990 → $36,490 (-$1,500)', status: 'delivered', attempts: 1, lastAttemptAt: '2026-04-15T18:00:00Z', httpStatus: 200, latencyMs: 310, rooftopId: 'dtown' },
  { id: 'WD-007', webhookId: 'WH-003', event: 'floorplan.curtailment_due', payloadSummary: 'F30881 Mustang GT — 61 days — $3,120 curtailment due 5/19', status: 'delivered', attempts: 1, lastAttemptAt: '2026-04-20T07:00:00Z', httpStatus: 200, latencyMs: 88, rooftopId: 'north' },
];

export const marketplaceApps: MarketplaceApp[] = [
  {
    id: 'APP-001',
    name: 'RouteOne',
    publisher: 'RouteOne LLC',
    category: 'Lender',
    description: 'Credit application, lender submission, and eContracting. Powers F5/F7/F8 in AutoCore.',
    logoUrl: 'https://picsum.photos/seed/app-routeone/80/80',
    status: 'installed',
    installedAt: '2025-11-02T09:00:00Z',
    installedBy: 'L. Harmon',
    version: '4.2.1',
    rating: 4.7,
    installs: 12400,
    scopesRequired: ['customers:read', 'deals:write', 'credit:write'],
    webhookEvents: ['deal.contracted', 'deal.funded'],
    pricing: 'Per deal $12',
    featured: true,
  },
  {
    id: 'APP-002',
    name: 'Dealertrack',
    publisher: 'Cox Automotive',
    category: 'Lender',
    description: 'Alternate credit & compliance submission. Redundant to RouteOne for lender coverage.',
    logoUrl: 'https://picsum.photos/seed/app-dealertrack/80/80',
    status: 'installed',
    installedAt: '2025-12-01T10:00:00Z',
    installedBy: 'L. Harmon',
    version: '3.9.0',
    rating: 4.5,
    installs: 11200,
    scopesRequired: ['customers:read', 'deals:write'],
    pricing: 'Per deal $12',
  },
  {
    id: 'APP-003',
    name: 'vAuto Provision',
    publisher: 'Cox Automotive',
    category: 'Data',
    description: 'Market pricing, day supply, and appraisal. Feeds F11 Pricing & Market Intelligence.',
    logoUrl: 'https://picsum.photos/seed/app-vauto/80/80',
    status: 'installed',
    installedAt: '2026-01-15T10:00:00Z',
    installedBy: 'M. Singh',
    version: '2.8.4',
    rating: 4.8,
    installs: 8900,
    scopesRequired: ['vehicles:read', 'vehicles:write'],
    webhookEvents: ['vehicle.price_changed'],
    pricing: '$899/mo per rooftop',
    featured: true,
  },
  {
    id: 'APP-004',
    name: 'Xtime Engage',
    publisher: 'Cox Automotive',
    category: 'Service',
    description: 'Service scheduling, lane check-in, and RO integration.',
    logoUrl: 'https://picsum.photos/seed/app-xtime/80/80',
    status: 'installed',
    installedAt: '2026-03-10T14:00:00Z',
    installedBy: 'T. Holloway',
    version: '1.14.2',
    rating: 4.3,
    installs: 6200,
    scopesRequired: ['customers:read', 'ro:write'],
    webhookEvents: ['ro.created', 'ro.invoiced'],
    pricing: '$499/mo per rooftop',
  },
  {
    id: 'APP-005',
    name: 'CDK Drive DMS Sync',
    publisher: 'CDK Global',
    category: 'DMS',
    description: 'Nightly GL and inventory sync to CDK. Required for F17 close.',
    logoUrl: 'https://picsum.photos/seed/app-cdk/80/80',
    status: 'installed',
    installedAt: '2026-01-10T10:00:00Z',
    installedBy: 'S. Williams',
    version: '5.1.0',
    rating: 4.0,
    installs: 15400,
    scopesRequired: ['*:read'],
    pricing: 'Included with DMS',
    featured: true,
  },
  {
    id: 'APP-006',
    name: 'AutoLeadStar',
    publisher: 'AutoLeadStar',
    category: 'Marketing',
    description: 'AI-driven audience and paid search automation.',
    logoUrl: 'https://picsum.photos/seed/app-als/80/80',
    status: 'available',
    rating: 4.6,
    installs: 3400,
    scopesRequired: ['leads:read', 'leads:write', 'vehicles:read'],
    pricing: '$1,200/mo',
  },
  {
    id: 'APP-007',
    name: 'Podium',
    publisher: 'Podium Inc.',
    category: 'Communication',
    description: 'Reputation, messaging, and review requests post-sale/service.',
    logoUrl: 'https://picsum.photos/seed/app-podium/80/80',
    status: 'pending_approval',
    rating: 4.7,
    installs: 7800,
    scopesRequired: ['customers:read', 'deals:read'],
    pricing: '$449/mo per rooftop',
  },
  {
    id: 'APP-008',
    name: 'F&I Express (Menu)',
    publisher: 'Cox Automotive',
    category: 'F&I',
    description: 'Digital F&I menu presentation with eSign. Powers F6.',
    logoUrl: 'https://picsum.photos/seed/app-fni/80/80',
    status: 'installed',
    installedAt: '2026-02-14T09:00:00Z',
    installedBy: 'L. Harmon',
    version: '3.2.0',
    rating: 4.4,
    installs: 5600,
    scopesRequired: ['deals:read', 'deals:write'],
    webhookEvents: ['deal.contracted'],
    pricing: '$299/mo',
  },
  {
    id: 'APP-009',
    name: 'QuickBooks Online Connector',
    publisher: 'Intuit',
    category: 'Accounting',
    description: 'Parts wholesale → accounting sync via Zapier webhook.',
    logoUrl: 'https://picsum.photos/seed/app-qbo/80/80',
    status: 'installed',
    installedAt: '2026-03-01T09:00:00Z',
    installedBy: 'J. Miller',
    version: '1.0.4',
    rating: 4.1,
    installs: 4200,
    scopesRequired: ['parts:read'],
    webhookEvents: ['parts.invoice_posted'],
    pricing: 'Free (Zapier)',
  },
  {
    id: 'APP-010',
    name: 'Carfax History',
    publisher: 'Carfax',
    category: 'Data',
    description: 'Vehicle history, window sticker, and service history pull.',
    logoUrl: 'https://picsum.photos/seed/app-carfax/80/80',
    status: 'installed',
    installedAt: '2026-01-20T10:00:00Z',
    installedBy: 'M. Singh',
    version: '2.1.0',
    rating: 4.9,
    installs: 18200,
    scopesRequired: ['vehicles:read'],
    pricing: 'Per report $12',
    featured: true,
  },
  {
    id: 'APP-011',
    name: '700Credit',
    publisher: '700 Credit LLC',
    category: 'Data',
    description: 'Credit bureau pull, OFAC, Red Flags, and compliance suite (F5).',
    logoUrl: 'https://picsum.photos/seed/app-700/80/80',
    status: 'installed',
    installedAt: '2025-11-10T10:00:00Z',
    installedBy: 'L. Harmon',
    version: '2.5.1',
    rating: 4.6,
    installs: 9400,
    scopesRequired: ['customers:read', 'credit:write'],
    pricing: 'Per pull $18',
  },
  {
    id: 'APP-012',
    name: 'UVeye — Drive-Through Inspection',
    publisher: 'UVeye',
    category: 'Service',
    description: 'Automated underbody/tire inspection on service drive — feeds MPI.',
    logoUrl: 'https://picsum.photos/seed/app-uveye/80/80',
    status: 'available',
    rating: 4.8,
    installs: 1200,
    scopesRequired: ['ro:write', 'vehicles:read'],
    pricing: '$2,500/mo hardware lease',
  },
];

export const integrationLogs: IntegrationLog[] = [
  { id: 'LOG-001', timestamp: '2026-04-20T15:55:10Z', direction: 'inbound', system: 'Website (CDK)', endpoint: '/api/v1/leads', method: 'POST', statusCode: 201, latencyMs: 212, rooftopId: 'westside', correlationId: 'req_9f42a1', summary: 'Lead created — LEAD-020 Emily Carter' },
  { id: 'LOG-002', timestamp: '2026-04-20T09:44:12Z', direction: 'inbound', system: 'Cars.com', endpoint: '/api/v1/leads', method: 'POST', statusCode: 201, latencyMs: 340, rooftopId: 'north', correlationId: 'req_8e11c9', summary: 'Lead created — LEAD-006 Jonathan Reeves (flagged duplicate)' },
  { id: 'LOG-003', timestamp: '2026-04-20T09:20:00Z', direction: 'outbound', system: 'CDK DMS', endpoint: '/dms/parts/invoice', method: 'POST', statusCode: 200, latencyMs: 880, rooftopId: 'dtown', correlationId: 'req_7a22b8', summary: 'Parts invoice P-88413 posted — wholesale $200.40' },
  { id: 'LOG-004', timestamp: '2026-04-20T08:40:00Z', direction: 'outbound', system: 'Xtime', endpoint: '/webhooks/ro.created', method: 'POST', statusCode: 502, latencyMs: 5004, rooftopId: 'dtown', correlationId: 'req_6c33d7', summary: 'Webhook failed — Bad Gateway — retry scheduled' },
  { id: 'LOG-005', timestamp: '2026-04-19T18:10:00Z', direction: 'outbound', system: 'RouteOne', endpoint: '/credit/submit', method: 'POST', statusCode: 200, latencyMs: 1420, rooftopId: 'north', correlationId: 'req_5b44e6', summary: 'Credit submitted — Sofia Martinez — Westlake (D-1048)' },
  { id: 'LOG-006', timestamp: '2026-04-19T17:20:00Z', direction: 'outbound', system: 'Xtime', endpoint: '/webhooks/ro.invoiced', method: 'POST', statusCode: 429, latencyMs: 1200, rooftopId: 'westside', correlationId: 'req_4a55f5', summary: 'Rate limited — retry after 60s' },
  { id: 'LOG-007', timestamp: '2026-04-18T10:15:00Z', direction: 'outbound', system: 'Slack', endpoint: '/hooks/cit-alerts', method: 'POST', statusCode: 200, latencyMs: 95, correlationId: 'req_3c66a4', summary: 'CIT overdue alert — D-1050 — posted to #cit-alerts' },
  { id: 'LOG-008', timestamp: '2026-04-16T16:30:00Z', direction: 'outbound', system: 'vAuto', endpoint: '/inventory/price', method: 'PUT', statusCode: 200, latencyMs: 310, rooftopId: 'dtown', correlationId: 'req_2b77b3', summary: 'Price update — T23157 $1,500 drop pushed' },
];
