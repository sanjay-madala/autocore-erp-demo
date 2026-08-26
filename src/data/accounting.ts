/**
 * AutoCore ERP — Accounting (GL, Schedules, Close Checklist)
 * Flows: F8 Funding & CIT, F17 Accounting Close & Schedules (Floorplan, Warranty, CIT, Close)
 */

export type GlAccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'cogs' | 'expense';
export type JournalStatus = 'draft' | 'posted' | 'voided';
export type ScheduleStatus = 'open' | 'cleared' | 'overdue' | 'written_off';

export interface GlAccount {
  number: string;
  name: string;
  type: GlAccountType;
  balance: number; // current balance (debit positive for assets/expenses, etc. — simplified)
  description?: string;
}

export interface JournalLine {
  accountNumber: string;
  accountName: string;
  debit: number;
  credit: number;
  memo?: string;
}

export interface JournalEntry {
  id: string;
  jeNumber: string;
  date: string;
  description: string;
  reference?: string; // e.g., deal number, RO number
  rooftopId: 'dtown' | 'north' | 'westside' | 'group';
  status: JournalStatus;
  lines: JournalLine[];
  totalDebits: number;
  totalCredits: number;
  createdBy: string;
  postedAt?: string;
}

export interface FloorplanScheduleItem {
  id: string;
  vin: string;
  stockNo: string;
  vehicle: string;
  rooftopId: 'dtown' | 'north' | 'westside';
  lender: string;
  principal: number;
  rateBps: number;
  floorplanDate: string;
  dueDate: string;
  daysOnFloorplan: number;
  curtailmentDue?: number;
  interestAccrued: number;
  status: ScheduleStatus;
  dealId?: string; // if sold, linked deal
  soldDate?: string;
  payoffDueBy?: string; // typically sold + 2-5 days per agreement
}

export interface CitScheduleItem {
  id: string;
  dealNumber: string;
  customerName: string;
  rooftopId: 'dtown' | 'north' | 'westside';
  lender: string;
  amount: number;
  contractedAt: string;
  fundedAt?: string;
  citDays: number; // days since contracting (if not funded)
  expectedFundingDate?: string;
  status: ScheduleStatus;
  conditions?: string[];
}

export interface WarrantyScheduleItem {
  id: string;
  roNumber: string;
  claimNumber: string;
  rooftopId: 'dtown' | 'north' | 'westside';
  oem: 'Toyota' | 'Ford' | 'Honda' | 'BMW' | 'Hyundai';
  amount: number;
  submittedAt: string;
  status: ScheduleStatus;
  paidAt?: string;
  daysOutstanding: number;
}

export interface CloseTask {
  id: string;
  area: 'sales' | 'service' | 'parts' | 'accounting' | 'office';
  task: string;
  owner: string;
  dueDate: string;
  completedAt?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  blocker?: string;
}

// ── Chart of Accounts (simplified dealer COA) ──
export const glAccounts: GlAccount[] = [
  { number: '1000', name: 'Cash — Operating (Pinnacle Bank)', type: 'asset', balance: 482_300, description: 'Main operating' },
  { number: '1015', name: 'Cash — CIT Clearing', type: 'asset', balance: 128_400 },
  { number: '1100', name: 'Contracts in Transit (CIT)', type: 'asset', balance: 187_540 },
  { number: '1120', name: 'Factory Receivables — Warranty', type: 'asset', balance: 42_800 },
  { number: '1130', name: 'Factory Receivables — Rebates/Incentives', type: 'asset', balance: 18_500 },
  { number: '1200', name: 'New Vehicle Inventory', type: 'asset', balance: 2_842_000 },
  { number: '1210', name: 'Used Vehicle Inventory', type: 'asset', balance: 1_420_500 },
  { number: '1300', name: 'Parts Inventory', type: 'asset', balance: 384_200 },
  { number: '1400', name: 'Floorplan Liability — Toyota Financial', type: 'liability', balance: 1_280_000 },
  { number: '1410', name: 'Floorplan Liability — Ford Credit', type: 'liability', balance: 890_000 },
  { number: '1420', name: 'Floorplan Liability — BMW Financial', type: 'liability', balance: 420_000 },
  { number: '1430', name: 'Floorplan Liability — NextGear / Ally', type: 'liability', balance: 310_000 },
  { number: '2000', name: 'Accounts Payable — Trade', type: 'liability', balance: 92_400 },
  { number: '2100', name: 'Accrued Expenses', type: 'liability', balance: 44_200 },
  { number: '3000', name: 'Retained Earnings', type: 'equity', balance: 1_820_000 },
  { number: '4000', name: 'New Vehicle Sales', type: 'revenue', balance: 1_240_000 },
  { number: '4010', name: 'Used Vehicle Sales', type: 'revenue', balance: 890_000 },
  { number: '4100', name: 'F&I Income — Reserve & Products', type: 'revenue', balance: 182_000 },
  { number: '4200', name: 'Service Labor Sales', type: 'revenue', balance: 210_000 },
  { number: '4210', name: 'Parts Sales — Retail', type: 'revenue', balance: 145_000 },
  { number: '4220', name: 'Parts Sales — Wholesale', type: 'revenue', balance: 98_000 },
  { number: '5000', name: 'Cost of Sales — New Vehicles', type: 'cogs', balance: 1_180_000 },
  { number: '5010', name: 'Cost of Sales — Used Vehicles', type: 'cogs', balance: 820_000 },
  { number: '5200', name: 'Service Cost — Labor', type: 'cogs', balance: 68_000 },
  { number: '6000', name: 'Floorplan Interest Expense', type: 'expense', balance: 18_400 },
  { number: '6100', name: 'Sales Commissions', type: 'expense', balance: 42_000 },
  { number: '6200', name: 'Advertising', type: 'expense', balance: 28_500 },
];

// ── Journal Entries (covering vehicle sale with CIT, floorplan payoff, parts sale) ──
export const journalEntries: JournalEntry[] = [
  {
    id: 'JE-001',
    jeNumber: 'JE-20441',
    date: '2026-04-16',
    description: 'New/Used Sale — Deal D-1041 Highlander — CIT setup (F8)',
    reference: 'D-1041',
    rooftopId: 'dtown',
    status: 'posted',
    lines: [
      { accountNumber: '1100', accountName: 'Contracts in Transit (CIT)', debit: 29824, credit: 0, memo: 'Amount financed — Ally 72mo' },
      { accountNumber: '1000', accountName: 'Cash — Operating', debit: 2500, credit: 0, memo: 'Cash down' },
      { accountNumber: '1100', accountName: 'Contracts in Transit — Trade Payoff', debit: 11200, credit: 0, memo: 'Ally payoff — trade equity advance' },
      { accountNumber: '4000', accountName: 'New Vehicle Sales', debit: 0, credit: 36490, memo: 'Sale price' },
      { accountNumber: '4100', accountName: 'F&I Income', debit: 0, credit: 1530, memo: 'VSC + GAP back gross' },
      { accountNumber: '1015', accountName: 'Cash — CIT Clearing', debit: 0, credit: 0, memo: '—' }, // placeholder zero line to illustrate clearing
      { accountNumber: '5000', accountName: 'Cost of Sales — Used Vehicles', debit: 34800, credit: 0, memo: 'Vehicle cost — T23157' },
      { accountNumber: '1210', accountName: 'Used Vehicle Inventory', debit: 0, credit: 34800, memo: 'Relieve inventory' },
    ],
    totalDebits: 48324,
    totalCredits: 48324,
    createdBy: 'J. Alvarez / L. Harmon',
    postedAt: '2026-04-16T16:30:00Z',
  },
  {
    id: 'JE-002',
    jeNumber: 'JE-20442',
    date: '2026-04-18',
    description: 'CIT Funding — D-1041 Ally received',
    reference: 'D-1041',
    rooftopId: 'dtown',
    status: 'posted',
    lines: [
      { accountNumber: '1000', accountName: 'Cash — Operating', debit: 29824, credit: 0, memo: 'Funding received — Ally' },
      { accountNumber: '1100', accountName: 'Contracts in Transit (CIT)', debit: 0, credit: 29824, memo: 'Clear CIT — D-1041' },
      { accountNumber: '4100', accountName: 'F&I Income — Reserve', debit: 0, credit: 420, memo: 'Reserve — Ally (not yet: actually contra)' },
    ],
    totalDebits: 29824,
    totalCredits: 30244, // Note: demo shows reserve timing nuance — UI can highlight imbalance as teaching moment
    createdBy: 'Accounting — S. Williams',
    postedAt: '2026-04-18T11:15:00Z',
  },
  {
    id: 'JE-003',
    jeNumber: 'JE-20445',
    date: '2026-04-09',
    description: 'Floorplan Payoff — Tundra T24102 sold D-1047 (Toyota Financial)',
    reference: 'D-1047 / VEH-005',
    rooftopId: 'dtown',
    status: 'posted',
    lines: [
      { accountNumber: '1400', accountName: 'Floorplan Liability — Toyota Financial', debit: 54200, credit: 0, memo: 'Payoff principal — VIN 5TFMA5DB9PX089441' },
      { accountNumber: '6000', accountName: 'Floorplan Interest Expense', debit: 142, credit: 0, memo: 'Interest to payoff date (20 days @ 6.35%)' },
      { accountNumber: '1000', accountName: 'Cash — Operating', debit: 0, credit: 54342, memo: 'Wire to TFS floorplan' },
    ],
    totalDebits: 54342,
    totalCredits: 54342,
    createdBy: 'Accounting — S. Williams',
    postedAt: '2026-04-09T10:30:00Z',
  },
  {
    id: 'JE-004',
    jeNumber: 'JE-20450',
    date: '2026-04-19',
    description: 'Service RO Invoiced — RO-50141 X5 (Customer Pay)',
    reference: 'RO-50141',
    rooftopId: 'westside',
    status: 'posted',
    lines: [
      { accountNumber: '1000', accountName: 'Cash — Operating', debit: 508, credit: 0, memo: 'Customer payment — E. Carter' },
      { accountNumber: '4200', accountName: 'Service Labor Sales', debit: 0, credit: 289, memo: 'Labor' },
      { accountNumber: '4210', accountName: 'Parts Sales — Retail', debit: 0, credit: 168, memo: 'Parts — wipers, filter' },
      { accountNumber: '5200', accountName: 'Service Cost — Labor', debit: 68, credit: 0, memo: 'Tech cost (est.)' },
      { accountNumber: '1300', accountName: 'Parts Inventory', debit: 0, credit: 92, memo: 'Relieve parts inventory (cost)' },
    ],
    totalDebits: 576,
    totalCredits: 549,
    createdBy: 'S. Park — Advisor',
    postedAt: '2026-04-19T17:15:00Z',
  },
  {
    id: 'JE-005',
    jeNumber: 'JE-20455',
    date: '2026-04-20',
    description: 'Parts Wholesale — P-88413 Nashville Auto Tech',
    reference: 'P-88413',
    rooftopId: 'dtown',
    status: 'posted',
    lines: [
      { accountNumber: '1015', accountName: 'Cash — CIT Clearing', debit: 200.40, credit: 0, memo: 'Wholesale AR — Nashville Auto Tech' },
      { accountNumber: '4220', accountName: 'Parts Sales — Wholesale', debit: 0, credit: 200.40, memo: 'Wholesale sales' },
      { accountNumber: '1300', accountName: 'Parts Inventory', debit: 0, credit: 124.00, memo: 'COGS — filters (cost)' },
      { accountNumber: '5200', accountName: 'Service Cost — Labor', debit: 124.00, credit: 0, memo: 'COGS wholesale' },
    ],
    totalDebits: 324.40,
    totalCredits: 324.40,
    createdBy: 'Parts — J. Miller',
    postedAt: '2026-04-20T08:20:00Z',
  },
];

// ── Floorplan Schedule (F17) — 8 open + 2 cleared for realism ──
export const floorplanSchedule: FloorplanScheduleItem[] = [
  { id: 'FP-001', vin: 'JTMAAACA4PA042118', stockNo: 'T23157', vehicle: '2023 Toyota Highlander Limited AWD', rooftopId: 'dtown', lender: 'NextGear', principal: 34800, rateBps: 795, floorplanDate: '2026-04-02', dueDate: '2026-07-01', daysOnFloorplan: 18, interestAccrued: 152, status: 'open' },
  { id: 'FP-002', vin: '2T3B1RFVXNW147882', stockNo: 'T23204', vehicle: '2022 Toyota RAV4 XLE AWD', rooftopId: 'dtown', lender: 'NextGear', principal: 24200, rateBps: 825, floorplanDate: '2026-03-06', dueDate: '2026-06-04', daysOnFloorplan: 45, curtailmentDue: 2420, interestAccrued: 246, status: 'overdue' },
  { id: 'FP-003', vin: 'JTDBCMFE2P3021198', stockNo: 'T23188', vehicle: '2023 Toyota Corolla LE', rooftopId: 'dtown', lender: 'Ally', principal: 18900, rateBps: 745, floorplanDate: '2026-04-12', dueDate: '2026-07-11', daysOnFloorplan: 8, interestAccrued: 31, status: 'open' },
  { id: 'FP-004', vin: '1FTBR1CG8PKA88301', stockNo: 'F30992', vehicle: '2023 Ford Bronco Outer Banks', rooftopId: 'north', lender: 'Ally', principal: 38900, rateBps: 775, floorplanDate: '2026-04-08', dueDate: '2026-07-07', daysOnFloorplan: 12, interestAccrued: 99, status: 'open' },
  { id: 'FP-005', vin: '1FA6P8CF1L5108842', stockNo: 'F30881', vehicle: '2020 Ford Mustang GT Premium', rooftopId: 'north', lender: 'NextGear', principal: 31200, rateBps: 825, floorplanDate: '2026-02-18', dueDate: '2026-05-19', daysOnFloorplan: 61, curtailmentDue: 3120, interestAccrued: 430, status: 'overdue' },
  { id: 'FP-006', vin: 'KM8R5DGE2PU142088', stockNo: 'W40221', vehicle: '2023 Hyundai Palisade Calligraphy AWD', rooftopId: 'westside', lender: 'Ally', principal: 36800, rateBps: 755, floorplanDate: '2026-04-01', dueDate: '2026-06-30', daysOnFloorplan: 19, interestAccrued: 144, status: 'open' },
  { id: 'FP-007', vin: 'WBA33AG05PCM20184', stockNo: 'W40198', vehicle: '2022 BMW 330i xDrive CPO', rooftopId: 'westside', lender: 'BMW Financial', principal: 29800, rateBps: 625, floorplanDate: '2026-03-15', dueDate: '2026-06-13', daysOnFloorplan: 36, interestAccrued: 183, status: 'open' },
  { id: 'FP-008', vin: '1FMCU9J92PMA11842', stockNo: 'F41055', vehicle: '2025 Ford Escape ST-Line Select AWD', rooftopId: 'north', lender: 'Ford Credit', principal: 32100, rateBps: 685, floorplanDate: '2026-04-16', dueDate: '2026-07-15', daysOnFloorplan: 4, interestAccrued: 24, status: 'open' },
  // cleared (sold) — payoff due soon
  { id: 'FP-009', vin: '5TFMA5DB9PX089441', stockNo: 'T24102', vehicle: '2025 Toyota Tundra Limited CrewMax 4x4', rooftopId: 'dtown', lender: 'Toyota Financial', principal: 54200, rateBps: 635, floorplanDate: '2026-03-20', dueDate: '2026-06-18', daysOnFloorplan: 20, interestAccrued: 142, status: 'cleared', dealId: 'D-1047', soldDate: '2026-04-08', payoffDueBy: '2026-04-11' },
  { id: 'FP-010', vin: '1FTFW1E89NKE99821', stockNo: 'F30814', vehicle: '2024 Ford F-150 XLT SuperCrew 4x4', rooftopId: 'north', lender: 'Ford Credit', principal: 51800, rateBps: 685, floorplanDate: '2026-03-15', dueDate: '2026-06-13', daysOnFloorplan: 23, interestAccrued: 223, status: 'cleared', dealId: 'D-1044', soldDate: '2026-04-07', payoffDueBy: '2026-04-10' },
];

export const floorplanSummary = {
  totalPrincipal: floorplanSchedule.filter(f => f.status !== 'cleared').reduce((s, f) => s + f.principal, 0),
  totalInterestAccrued: floorplanSchedule.filter(f => f.status !== 'cleared').reduce((s, f) => s + f.interestAccrued, 0),
  overdueCount: floorplanSchedule.filter(f => f.status === 'overdue').length,
  clearedCount: floorplanSchedule.filter(f => f.status === 'cleared').length,
};

// ── CIT Schedule (F8) ──
export const citSchedule: CitScheduleItem[] = [
  { id: 'CIT-001', dealNumber: 'D-1042', customerName: 'Tyler Brooks — Mustang GT', rooftopId: 'north', lender: 'USAA', amount: 26741, contractedAt: '2026-04-19T13:00:00Z', citDays: 1, expectedFundingDate: '2026-04-22', status: 'open', conditions: ['Proof of residency', 'POI — LES within 30 days'] },
  { id: 'CIT-002', dealNumber: 'D-1045', customerName: 'Priya Nair — BMW X5', rooftopId: 'westside', lender: 'BMW Financial', amount: 41854, contractedAt: '2026-04-18T16:00:00Z', citDays: 2, expectedFundingDate: '2026-04-21', status: 'open' },
  { id: 'CIT-003', dealNumber: 'D-1048', customerName: 'Sofia Martinez — Bronco', rooftopId: 'north', lender: 'Westlake Financial', amount: 41805, contractedAt: '2026-04-19T18:00:00Z', citDays: 1, expectedFundingDate: '2026-04-23', status: 'open' },
  { id: 'CIT-004', dealNumber: 'D-1050', customerName: 'Sofia Martinez — BMW 330i (2nd deal)', rooftopId: 'westside', lender: 'Ally → Exeter (2nd look)', amount: 32811, contractedAt: '2026-04-16T10:00:00Z', citDays: 4, expectedFundingDate: '2026-04-24', status: 'overdue', conditions: ['Declined by Ally — DTI 48%', 'Second look Exeter @ 14.49% — awaiting customer'] },
  { id: 'CIT-005', dealNumber: 'D-1052', customerName: 'Diego Hernandez — Escape', rooftopId: 'north', lender: 'Ally', amount: 28221, contractedAt: '2026-04-11T15:30:00Z', citDays: 4, expectedFundingDate: '2026-04-15', status: 'overdue', conditions: ['Unwound — income verification failed'] },
  // funded — for history
  { id: 'CIT-006', dealNumber: 'D-1041', customerName: 'Aaliyah Johnson — Highlander', rooftopId: 'dtown', lender: 'Ally', amount: 29824, contractedAt: '2026-04-16T16:00:00Z', fundedAt: '2026-04-18T11:00:00Z', citDays: 2, status: 'cleared' },
  { id: 'CIT-007', dealNumber: 'D-1047', customerName: 'Robert Owens — Tundra', rooftopId: 'dtown', lender: 'Toyota Financial', amount: 50425, contractedAt: '2026-04-08T11:30:00Z', fundedAt: '2026-04-09T10:00:00Z', citDays: 1, status: 'cleared' },
];

export const citSummary = {
  openAmount: citSchedule.filter(c => c.status === 'open' || c.status === 'overdue').reduce((s, c) => s + c.amount, 0),
  overdueAmount: citSchedule.filter(c => c.status === 'overdue').reduce((s, c) => s + c.amount, 0),
  fundedMTD: citSchedule.filter(c => c.status === 'cleared').reduce((s, c) => s + c.amount, 0),
  avgCitDays: 2.4,
};

// ── Warranty Schedule ──
export const warrantySchedule: WarrantyScheduleItem[] = [
  { id: 'WAR-001', roNumber: 'RO-40211', claimNumber: 'WC-F-88412', rooftopId: 'north', oem: 'Ford', amount: 589, submittedAt: '2026-04-19T12:00:00Z', status: 'open', daysOutstanding: 1 },
  { id: 'WAR-002', roNumber: 'RO-30108', claimNumber: 'WC-T-77201', rooftopId: 'dtown', oem: 'Toyota', amount: 1245, submittedAt: '2026-04-06T10:00:00Z', status: 'cleared', paidAt: '2026-04-14T09:00:00Z', daysOutstanding: 8 },
  { id: 'WAR-003', roNumber: 'RO-50144', claimNumber: 'WC-HY-90112', rooftopId: 'westside', oem: 'Hyundai', amount: 0, submittedAt: '2026-04-20T10:00:00Z', status: 'open', daysOutstanding: 0 }, // customer pay — $0 warranty
  { id: 'WAR-004', roNumber: 'RO-30112', claimNumber: 'WC-T-77218', rooftopId: 'dtown', oem: 'Toyota', amount: 890, submittedAt: '2026-04-15T11:00:00Z', status: 'open', daysOutstanding: 5 },
];

// ── Month-End Close Checklist (F17) ──
export const closeChecklist: CloseTask[] = [
  { id: 'CL-001', area: 'sales', task: 'Verify all delivered deals contracted & funded (CIT = 0 >7 days)', owner: 'S. Williams', dueDate: '2026-04-30', status: 'in_progress', blocker: 'D-1050 & D-1052 overdue CIT — F&I follow-up' },
  { id: 'CL-002', area: 'sales', task: 'Floorplan payoff audit — 2 sold units confirm wire', owner: 'S. Williams', dueDate: '2026-04-30', status: 'completed', completedAt: '2026-04-11T10:30:00Z' },
  { id: 'CL-003', area: 'service', task: 'ROs closed — no open ROs >30 days', owner: 'T. Holloway', dueDate: '2026-04-30', status: 'in_progress' },
  { id: 'CL-004', area: 'service', task: 'Warranty claims submitted & reconciled', owner: 'C. Daniels', dueDate: '2026-04-30', status: 'not_started' },
  { id: 'CL-005', area: 'parts', task: 'Parts physical — cycle count A-area', owner: 'J. Miller — Parts Mgr', dueDate: '2026-04-28', status: 'completed', completedAt: '2026-04-18T15:00:00Z' },
  { id: 'CL-006', area: 'parts', task: 'Wholesale AR — collect WS-002 $8,120 (Music City Body)', owner: 'J. Miller', dueDate: '2026-04-29', status: 'blocked', blocker: 'Short sale SS-001 — bumper backorder, customer withholding payment' },
  { id: 'CL-007', area: 'parts', task: 'Short sales cleared — 0 open >14 days', owner: 'J. Miller', dueDate: '2026-04-30', status: 'in_progress' },
  { id: 'CL-008', area: 'accounting', task: 'Bank reconciliation — Pinnacle Operating', owner: 'S. Williams', dueDate: '2026-05-02', status: 'not_started' },
  { id: 'CL-009', area: 'accounting', task: 'Floorplan interest accrual JE', owner: 'S. Williams', dueDate: '2026-04-30', status: 'not_started' },
  { id: 'CL-010', area: 'office', task: 'Title clerk — 4 sold units titles requested', owner: 'M. Torres — Title', dueDate: '2026-04-30', status: 'in_progress' },
  { id: 'CL-011', area: 'office', task: 'Rebates & incentives — claim 1130 reconciled to OEM statements', owner: 'S. Williams', dueDate: '2026-05-01', status: 'not_started' },
  { id: 'CL-012', area: 'accounting', task: 'Manager approval — close packet → Dealer Principal', owner: 'S. Williams', dueDate: '2026-05-03', status: 'not_started' },
];

export const closeProgress = {
  total: closeChecklist.length,
  completed: closeChecklist.filter(c => c.status === 'completed').length,
  inProgress: closeChecklist.filter(c => c.status === 'in_progress').length,
  blocked: closeChecklist.filter(c => c.status === 'blocked').length,
  pctComplete: Math.round((closeChecklist.filter(c => c.status === 'completed').length / closeChecklist.length) * 100),
};
