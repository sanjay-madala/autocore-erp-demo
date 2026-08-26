import { create } from "zustand"
import { vehicles as seedVehicles } from "@/data/vehicles"
import { customers as seedCustomers } from "@/data/customers"
import { leads as seedLeads } from "@/data/leads"
import { serviceAppointments as seedAppts, repairOrders as seedROs, technicians as seedTechs } from "@/data/service"
import { parts as seedParts } from "@/data/parts"
import { kpiDaily as seedKpiDaily } from "@/data/analytics"

// ── Types — single data model per SPEC E1-T03 STAR-aligned ──
export type DealStage = "lead" | "appointment" | "pencil" | "desked" | "credit" | "menu" | "contract" | "funded" | "delivered"
export type F1Deal = {
  id: string
  customerId: string
  customerName: string
  vin: string
  vehicleLabel: string
  stockNo: string
  rooftop: string
  stage: DealStage
  createdAt: string
  updatedAt: string
  deliveredAt: string | null
  pencil: { price: number; rate: number; term: number; down: number; tax: number; fees: number; monthly: number; gross: number } | null
  trade: { acv: number; payoff: number; allowance: number } | null
  credit: { bureau: number; decision: "pending"|"approved"|"declined"|"conditioned"; lender: string } | null
  fiMenu: Record<string, boolean>
  funding: { status: "draft"|"submitted"|"funded"|"kicked"; cit: number | null; depositPaid?: boolean; depositAmount?: number | null; depositMethod?: string | null }
  glPosted: boolean
  timeline: { t: string; label: string }[]
  // ── F3 Fully Online Purchase (same object — no re-key, 97% fix) ──
  onlineStartedAt: string | null
  channel: "in_store" | "online"
  tradeOffer: {
    vin: string
    photos: string[]
    condition: "clean" | "average" | "rough"
    firmLow: number
    firmHigh: number
    firmMid: number
    acv: number
    appraisalSource: string
    capturedAt: string
  } | null
  softPull: {
    consented: boolean
    consentedAt: string | null
    score: number | null
    tier: string | null
    status: "not_started" | "consented" | "prequalified"
  } | null
  deposit: { paid: boolean; amount: number; paidAt: string | null; method: string | null; refundable: boolean } | null
  eSignStatus: "not_sent" | "sent" | "viewed" | "signed" | "funded"
  stipsUploaded: boolean
  stips: { id: string; name: string; status: "pending" | "uploaded" | "verified" }[]
  pickupScheduledAt: string | null
}

export type VoiceCall = {
  id: string
  from: string
  callerId: string
  intent: "Sales" | "Service"
  vehicleInterest?: string
  stockNo?: string
  transcript: string
  dur: string
  score: number
  sent: "positive" | "neutral" | "negative"
  verdict: string
  disclosed: boolean
  recording: boolean
  createdAt: string
  bridged?: boolean
  serviceBooked?: boolean
  callbackTask?: string
}

export type SystemHealth = {
  region: string
  degraded: boolean
  rto: string
  rpo: string
  failoverRegion: string
  queuedMutations: number
  statusPage: string
  lastFailoverAt: string | null
  incidentReportPublished: boolean
}

// ── E12 Compliance & Security ──
export type ComplianceAuditEntry = {
  at: string
  actor: string
  action: string
  resource: string
  result: "allow" | "deny" | "success"
  ip: string
}
export type SafeguardItem = { control: string; status: "pass" | "review" | "fail"; evidence: string; lastVerified: string }
export type TaxRule = { state: string; code: string; rate: number; docFee: number; titleFee: number; note?: string }
export type VituSubmission = { vin: string; status: "queued" | "submitted" | "accepted" | "rejected"; tracking: string; lienPayoff: string; at: string; rooftop: string }
export type ComplianceState = {
  mfaCoverage: number
  encryption: string
  accessLogs: ComplianceAuditEntry[]
  safeguardsChecklist: SafeguardItem[]
  taxRules: TaxRule[]
  vituSubmissions: VituSubmission[]
  // extended E12 evidence
  soc: { soc1: string; soc2: string; soc1Status: string; soc2Status: string }
  iso: { iso27001: string; iso27701: string; pathMonth: number }
  privacyLaws: { count: number; states: string[]; note: string }
  penTest: { last: string; vulnCount: number; siem: string; leastPrivilege: string }
  backup: { immutable: boolean; rpo: string; rto: string; lastRestoreTest: string; tested: boolean }
  drStrategy: string
}

// ── F10 Migration Workbench ──
export type MigrationExtractorStatus = "done" | "progress" | "queued"
export type MigrationExtractor = {
  id: string
  name: string
  src: string
  status: MigrationExtractorStatus
  coverage: string
  pct: number
  note: string
}
export type MigrationMappingRow = {
  field: string
  source: string
  target: string
  score: string
  scoreNum: number
  issues: number
  status: "ok" | "warn"
}
export type MigrationVerification = {
  trialBalance: number
  binsExact: number
  status: "PASS" | "FAIL"
  verifiedAt: string | null
  jeValidated: string
}
export type MigrationParallelDay = {
  day: number
  parity: number | null
  height: number
}
export type MigrationCutover = {
  scheduledAt: string | null
  executedAt: string | null
  status: "scheduled" | "live" | "rolled_back"
}
export type MigrationState = {
  extractors: MigrationExtractor[]
  mappingRows: MigrationMappingRow[]
  mapping: MigrationMappingRow[]
  verification: MigrationVerification
  parallelRun: { days: MigrationParallelDay[]; currentDay: number }
  cutover: MigrationCutover
  parallelDays: number
  cutoverScheduledAt: string | null
}

// ── E2-T12 Vendor Payments (Brex-class) + E11-T08 Data Warehouse (Snowflake-class) ──
export type VendorPayment = { id: string; vendor: string; amount: number; status: "pending" | "paid"; dueDate: string }
export type DataWarehouseState = { lastExportAt: string; status: string; rows: number; sizeGb: number }

// ── F8 Multi-rooftop Close + F14 Incentives ──
export type RooftopMeta = { id: "dtown"|"north"|"westside"; name: string; brand: string; oemFormat: string; region: string }
export const groupMeta = {
  groupId: "sovereign-auto-group" as const,
  name: "Sovereign Auto Group",
  rooftops: [
    { id: "dtown" as const, name: "Sovereign Toyota Downtown", brand: "Toyota", oemFormat: "Toyota DOC", region: "Southeast" },
    { id: "north" as const, name: "Sovereign Ford North", brand: "Ford", oemFormat: "Ford Financial Statement", region: "Southeast" },
    { id: "westside" as const, name: "Sovereign Westside (Honda / BMW / Hyundai)", brand: "Honda/BMW/Hyundai", oemFormat: "Honda UCG / BMW", region: "Southeast" },
  ] as RooftopMeta[],
} as const

export type IncentiveRule = {
  id: string
  vin: string
  program: string
  programCode: string
  amount: number
  region: string
  stackGroup: string
  incompatibleWith: string[]
  eligibleMakes: string[]
  startDate: string
  endDate: string
}
export type IncentiveClaimStatus = "pending"|"submitted"|"paid"|"mismatch"|"rejected"
export type IncentiveClaim = {
  id: string
  dealId: string
  vin: string
  stockNo: string
  customerName: string
  rooftop: string
  program: string
  programCode: string
  amount: number
  claimAmount: number
  status: IncentiveClaimStatus
  submittedAt: string
  paidAt?: string
  mismatchReason?: string
  stackingConflict: boolean
  oemResponse?: string
}

export type GroupConsolidationRow = {
  rooftopId: string
  rooftopName: string
  brand: string
  units: number
  frontGross: number
  backGross: number
  svcGross: number
  partsGross: number
  citOpen: number
  floorplan: number
  warrantyAR: number
  transfers: number
}

// ── T1 Conversational BI — platform-wide NL query over unified store ("Ask. Decide. Act.") ──
export type ConversationalBIRow = Record<string, string | number>
export type ConversationalBIEntry = {
  id: string
  query: string
  answer: string
  sql: string
  rows: ConversationalBIRow[]
  at: string
}
export type ConversationalBIState = {
  history: ConversationalBIEntry[]
}

// ── E10 Copilot — F&I (E10-T08) & Service (E10-T09) — P1 — seeded from ai.ts COP-002 etc. ──
export type CopilotSuggestionItem = {
  id: string
  type: "fi" | "service"
  dealId?: string
  roId?: string
  suggestion: string
  expectedLift: number
  guardrailOk: boolean
  accepted?: boolean
  dismissed?: boolean
}

export const seedCopilotSuggestions: CopilotSuggestionItem[] = [
  {
    id: "COP-002",
    type: "fi",
    dealId: "D-1042",
    suggestion: "Bump rate 6.49→6.99 + add GAP → PVR +$620, payment +$11, within cap $3,200 ✓",
    expectedLift: 620,
    guardrailOk: true,
    accepted: false,
    dismissed: false,
  },
  {
    id: "COP-003",
    type: "service",
    roId: "RO-1001",
    suggestion: "Deferred brake front 4mm from last RO-8812 + mileage since 11k — Add to MPI • +$230 avg",
    expectedLift: 230,
    guardrailOk: true,
    accepted: false,
    dismissed: false,
  },
]

export type AppState = {
  vehicles: typeof seedVehicles
  customers: typeof seedCustomers
  deals: F1Deal[]
  activeDealId: string | null
  leads: typeof seedLeads
  serviceAppointments: typeof seedAppts
  repairOrders: typeof seedROs
  technicians: typeof seedTechs
  parts: typeof seedParts
  aiCalls: VoiceCall[]
  systemHealth: SystemHealth
  selectedRooftop: "group" | "dtown" | "north" | "westside"
  lastPostedAt: string | null
  migration: MigrationState
  migrationState: MigrationState
  complianceState: ComplianceState
  submitVitu: (vin: string) => string
  exportSafeguards: () => string
  // F1
  createDealFromLead: (customerName: string, vin: string) => string
  updatePencil: (dealId: string, pencil: F1Deal["pencil"]) => void
  acceptDeal: (dealId: string) => void
  submitCredit: (dealId: string) => void
  toggleFi: (dealId: string, product: string) => void
  submitContract: (dealId: string) => void
  deliverDeal: (dealId: string) => void
  setActiveDeal: (id: string | null) => void
  // F3 — Fully Online Purchase (shares same deal object)
  startOnlineDeal: (dealId: string) => void
  setChannel: (dealId: string, channel: "in_store" | "online") => void
  setTradeOffer: (dealId: string, offer: F1Deal["tradeOffer"]) => void
  consentSoftPull: (dealId: string) => void
  completeSoftPull: (dealId: string) => void
  payDeposit: (dealId: string) => void
  setESignStatus: (dealId: string, status: F1Deal["eSignStatus"]) => void
  uploadStip: (dealId: string, stipId: string) => void
  schedulePickup: (dealId: string, iso: string) => void
  hardPullAndFund: (dealId: string) => void
  // F2 + F17
  setVehicleRecon: (vehicleId: string, status: string) => void
  setVehiclePrice: (vehicleId: string, price: number) => void
  transferVehicle: (vehicleId: string, toRooftop: string) => void
  // F4 + F13/F15
  createROFromAppointment: (appointmentId: string) => string | null
  updateROStatus: (roId: string, status: string) => void
  approveMpiItem: (roId: string, mpiIndex: number, approve: boolean) => void
  addFlagHours: (techId: string, hours: number) => void
  // F7 + F16
  sellPart: (partNumber: string, qty: number) => void
  createShortSale: (partNumber: string, qty: number) => void
  // F6 + F12
  ingestLead: (lead: (typeof seedLeads)[number]) => void
  convertLeadToDeal: (leadId: string) => string | null
  // F5 + F18
  receiveMissedCall: (callerId?: string) => string
  bookServiceFromCall: (callId: string) => void
  bridgeSalesLead: (callId: string) => void
  setDegraded: (v: boolean) => void
  toggleDegraded: () => void
  publishPostIncidentReport: () => void
  // E11 — Analytics & Reporting realtime
  setSelectedRooftop: (r: "group" | "dtown" | "north" | "westside") => void
  // F8/F14
  groupMeta: typeof groupMeta
  incentiveRules: IncentiveRule[]
  incentiveClaims: IncentiveClaim[]
  submitIncentiveClaim: (claimId: string) => void
  reconcileIncentiveClaim: (claimId: string, status: IncentiveClaimStatus) => void
  getGroupConsolidation: () => { rows: GroupConsolidationRow[]; group: GroupConsolidationRow; eliminations: number; transferDetails: { vin: string; stockNo: string; from: string; to: string; at: string }[] }
  getLiveKpiDaily: () => import("@/data/analytics").KpiPoint[]
  // E2-T12 Vendor Payments + E11-T08 Data Warehouse
  vendorPayments: VendorPayment[]
  dataWarehouse: DataWarehouseState
  payVendor: (id: string) => void
  exportWarehouse: () => void
  // F10 Migration
  runExtractor: (id: string) => void
  fixMapping: (field: string) => void
  verifyLoad: () => void
  advanceParallelDay: () => void
  executeCutover: () => void
  rollback: () => void
  // E10 Copilot P1 — F&I (T08) + Service (T09) — deal-structure vs lender guardrails + deferred/mileage
  copilotSuggestions: CopilotSuggestionItem[]
  acceptCopilot: (id: string) => void
  dismissCopilot: (id: string) => void
  generateCopilotForDeal: (dealId: string) => void
  generateCopilotForRO: (roId: string) => void
  // T1 Conversational BI
  conversationalBI: ConversationalBIState
  queryBI: (nl: string) => ConversationalBIEntry
}

const now = () => new Date().toISOString().slice(11,19)

const makeDeal = (id: string, name: string, vin: string): F1Deal => {
  const v = seedVehicles.find(x=>x.vin===vin) || seedVehicles[0]
  const ts = new Date().toISOString()
  return {
    id, customerId: seedCustomers[0]?.id || "CUS-001", customerName: name, vin: v.vin, vehicleLabel: `${v.year} ${v.make} ${v.model} ${v.trim}`, stockNo: v.stockNo, rooftop: v.rooftopId,
    stage: "lead",
    createdAt: ts,
    updatedAt: ts,
    deliveredAt: null,
    pencil: null, trade: { acv: 18200, payoff: 14100, allowance: 17500 }, credit: { bureau: 742, decision: "pending", lender: "Dealertrack" },
    fiMenu: { VSC: false, GAP: false, Tire: false, Dent: false },
    funding: { status: "draft", cit: null, depositPaid: false, depositAmount: null, depositMethod: null }, glPosted: false,
    timeline: [{ t: now(), label: "Lead ingress — dedup <5s • M-214 created • assigned J. Alvarez" }],
    onlineStartedAt: null,
    channel: "in_store" as const,
    tradeOffer: null,
    softPull: { consented: false, consentedAt: null, score: null, tier: null, status: "not_started" as const },
    deposit: null,
    eSignStatus: "not_sent" as const,
    stipsUploaded: false,
    stips: [
      { id: "stip-dl", name: "Driver's license — front/back", status: "pending" as const },
      { id: "stip-poi", name: "Proof of income — paystub 30d", status: "pending" as const },
      { id: "stip-por", name: "Proof of residence — utility bill", status: "pending" as const },
    ],
    pickupScheduledAt: null,
  }
}

// ── Seed incentive rules — map VIN → incentive $ (e.g., $1,500 Toyota loyalty) ──
const seedIncentiveRules: IncentiveRule[] = [
  { id: "IR-TOY-LOY-1500-A", vin: seedVehicles[0].vin, program: "Toyota Loyalty", programCode: "TMS-LOY-1500", amount: 1500, region: "Southeast", stackGroup: "loyalty", incompatibleWith: ["TMS-CONQ-1000"], eligibleMakes: ["Toyota"], startDate: "2026-04-01", endDate: "2026-06-30" },
  { id: "IR-TOY-LOY-1500-B", vin: seedVehicles[2].vin, program: "Toyota Loyalty", programCode: "TMS-LOY-1500", amount: 1500, region: "Southeast", stackGroup: "loyalty", incompatibleWith: ["TMS-CONQ-1000"], eligibleMakes: ["Toyota"], startDate: "2026-04-01", endDate: "2026-06-30" },
  { id: "IR-TOY-CONQ-1000", vin: seedVehicles[2].vin, program: "Toyota Conquest Cash", programCode: "TMS-CONQ-1000", amount: 1000, region: "Southeast", stackGroup: "conquest", incompatibleWith: ["TMS-LOY-1500"], eligibleMakes: ["Toyota"], startDate: "2026-04-01", endDate: "2026-06-30" },
  { id: "IR-FORD-RBC-1000", vin: seedVehicles[8].vin, program: "Ford Retail Bonus Cash", programCode: "FORD-RBC-1000", amount: 1000, region: "Southeast", stackGroup: "retail_cash", incompatibleWith: ["FORD-LOY-750"], eligibleMakes: ["Ford"], startDate: "2026-04-01", endDate: "2026-05-31" },
  { id: "IR-FORD-LOY-750", vin: seedVehicles[10].vin, program: "Ford Owner Loyalty", programCode: "FORD-LOY-750", amount: 750, region: "Southeast", stackGroup: "loyalty", incompatibleWith: ["FORD-RBC-1000"], eligibleMakes: ["Ford"], startDate: "2026-04-01", endDate: "2026-05-31" },
  { id: "IR-HONDA-LOY-1000", vin: seedVehicles[15].vin, program: "Honda Loyalty", programCode: "HON-LOY-1000", amount: 1000, region: "Southeast", stackGroup: "loyalty", incompatibleWith: ["HON-CONQ-750"], eligibleMakes: ["Honda"], startDate: "2026-04-01", endDate: "2026-06-30" },
  { id: "IR-BMW-APR-CREDIT", vin: seedVehicles[16].vin, program: "BMW APR Credit", programCode: "BMW-APR-1500", amount: 1500, region: "Southeast", stackGroup: "apr_credit", incompatibleWith: [], eligibleMakes: ["BMW"], startDate: "2026-04-01", endDate: "2026-06-30" },
  { id: "IR-HYUNDAI-LOY-500", vin: seedVehicles[17].vin, program: "Hyundai Loyalty", programCode: "HYU-LOY-500", amount: 500, region: "Southeast", stackGroup: "loyalty", incompatibleWith: [], eligibleMakes: ["Hyundai"], startDate: "2026-04-01", endDate: "2026-06-30" },
]

const seedIncentiveClaims: IncentiveClaim[] = [
  {
    id: "IC-1001", dealId: "D-1041", vin: seedVehicles[0].vin, stockNo: seedVehicles[0].stockNo, customerName: "Marcus Chen", rooftop: "dtown",
    program: "Toyota Loyalty", programCode: "TMS-LOY-1500", amount: 1500, claimAmount: 1500,
    status: "mismatch", submittedAt: "2026-04-18T10:12:00Z",
    mismatchReason: "OEM paid $1,000 vs $1,500 claimed • VIN trim eligibility tier mismatch • requires resubmit with docs",
    stackingConflict: false, oemResponse: "Paid $1,000 — TMS audit: XSE AWD ineligible for full tier"
  },
  {
    id: "IC-1002", dealId: "D-1042", vin: seedVehicles[2].vin, stockNo: seedVehicles[2].stockNo, customerName: "Priya Nair", rooftop: "dtown",
    program: "Toyota Loyalty", programCode: "TMS-LOY-1500", amount: 1500, claimAmount: 1500,
    status: "submitted", submittedAt: "2026-04-19T14:40:00Z",
    stackingConflict: true, oemResponse: "Pending OEM review • stacking check flagged"
  },
  {
    id: "IC-1003", dealId: "D-1042", vin: seedVehicles[2].vin, stockNo: seedVehicles[2].stockNo, customerName: "Priya Nair", rooftop: "dtown",
    program: "Toyota Conquest Cash", programCode: "TMS-CONQ-1000", amount: 1000, claimAmount: 1000,
    status: "pending", submittedAt: "2026-04-19T14:40:00Z",
    mismatchReason: "Stacking-rule conflict: Loyalty + Conquest cannot stack per TMS program rules §4.2",
    stackingConflict: true, oemResponse: "Held — incompatible with TMS-LOY-1500"
  },
  {
    id: "IC-1004", dealId: "D-1041", vin: seedVehicles[8].vin, stockNo: seedVehicles[8].stockNo, customerName: "Marisol Delgado", rooftop: "north",
    program: "Ford Retail Bonus Cash", programCode: "FORD-RBC-1000", amount: 1000, claimAmount: 1000,
    status: "paid", submittedAt: "2026-04-16T11:00:00Z", paidAt: "2026-04-18T16:22:00Z",
    stackingConflict: false, oemResponse: "Paid $1,000 via Ford Credit — reconciled"
  },
]

// ── E12 Compliance seed — FTC Safeguards, SOC, ISO, 50-state tax, Vitu, privacy, security, DR ──
const seedTaxRules: TaxRule[] = [
  { state: "Alabama", code: "AL", rate: 0.04, docFee: 599, titleFee: 23, note: "2% auto sales singly" },
  { state: "Alaska", code: "AK", rate: 0, docFee: 399, titleFee: 15, note: "No state sales tax" },
  { state: "Arizona", code: "AZ", rate: 0.056, docFee: 499, titleFee: 12 },
  { state: "Arkansas", code: "AR", rate: 0.065, docFee: 129, titleFee: 29 },
  { state: "California", code: "CA", rate: 0.0725, docFee: 85, titleFee: 29, note: "§5.3 CA Privacy + 2-party recording" },
  { state: "Colorado", code: "CO", rate: 0.029, docFee: 599, titleFee: 21 },
  { state: "Connecticut", code: "CT", rate: 0.0635, docFee: 599, titleFee: 80 },
  { state: "Delaware", code: "DE", rate: 0, docFee: 0, titleFee: 35, note: "No sales tax" },
  { state: "Florida", code: "FL", rate: 0.06, docFee: 799, titleFee: 225 },
  { state: "Georgia", code: "GA", rate: 0.066, docFee: 699, titleFee: 18, note: "TAVT ad valorem" },
  { state: "Hawaii", code: "HI", rate: 0.04, docFee: 399, titleFee: 25 },
  { state: "Idaho", code: "ID", rate: 0.06, docFee: 399, titleFee: 21 },
  { state: "Illinois", code: "IL", rate: 0.0625, docFee: 358, titleFee: 199 },
  { state: "Indiana", code: "IN", rate: 0.07, docFee: 199, titleFee: 25 },
  { state: "Iowa", code: "IA", rate: 0.06, docFee: 180, titleFee: 25 },
  { state: "Kansas", code: "KS", rate: 0.065, docFee: 599, titleFee: 25 },
  { state: "Kentucky", code: "KY", rate: 0.06, docFee: 499, titleFee: 12 },
  { state: "Louisiana", code: "LA", rate: 0.0445, docFee: 499, titleFee: 68.5 },
  { state: "Maine", code: "ME", rate: 0.055, docFee: 499, titleFee: 35 },
  { state: "Maryland", code: "MD", rate: 0.06, docFee: 500, titleFee: 100 },
  { state: "Massachusetts", code: "MA", rate: 0.0625, docFee: 459, titleFee: 75 },
  { state: "Michigan", code: "MI", rate: 0.06, docFee: 260, titleFee: 15 },
  { state: "Minnesota", code: "MN", rate: 0.06875, docFee: 125, titleFee: 35 },
  { state: "Mississippi", code: "MS", rate: 0.07, docFee: 599, titleFee: 12 },
  { state: "Missouri", code: "MO", rate: 0.04225, docFee: 499, titleFee: 14 },
  { state: "Montana", code: "MT", rate: 0, docFee: 0, titleFee: 112 },
  { state: "Nebraska", code: "NE", rate: 0.055, docFee: 599, titleFee: 15 },
  { state: "Nevada", code: "NV", rate: 0.0685, docFee: 499, titleFee: 29 },
  { state: "New Hampshire", code: "NH", rate: 0, docFee: 0, titleFee: 35 },
  { state: "New Jersey", code: "NJ", rate: 0.06625, docFee: 699, titleFee: 60 },
  { state: "New Mexico", code: "NM", rate: 0.05125, docFee: 399, titleFee: 13 },
  { state: "New York", code: "NY", rate: 0.04, docFee: 175, titleFee: 50, note: "Plus local up to 4.875%" },
  { state: "North Carolina", code: "NC", rate: 0.03, docFee: 599, titleFee: 58, note: "HUT 3%" },
  { state: "North Dakota", code: "ND", rate: 0.05, docFee: 299, titleFee: 12 },
  { state: "Ohio", code: "OH", rate: 0.0575, docFee: 250, titleFee: 15 },
  { state: "Oklahoma", code: "OK", rate: 0.045, docFee: 699, titleFee: 33 },
  { state: "Oregon", code: "OR", rate: 0, docFee: 0, titleFee: 98 },
  { state: "Pennsylvania", code: "PA", rate: 0.06, docFee: 449, titleFee: 62 },
  { state: "Rhode Island", code: "RI", rate: 0.07, docFee: 399, titleFee: 32 },
  { state: "South Carolina", code: "SC", rate: 0.06, docFee: 599, titleFee: 15, note: "IMF max $500" },
  { state: "South Dakota", code: "SD", rate: 0.045, docFee: 199, titleFee: 12 },
  { state: "Tennessee", code: "TN", rate: 0.07, docFee: 599, titleFee: 29, note: "Single article cap $1,600" },
  { state: "Texas", code: "TX", rate: 0.0625, docFee: 150, titleFee: 33, note: "6.25% motor vehicle sales" },
  { state: "Utah", code: "UT", rate: 0.0485, docFee: 399, titleFee: 12 },
  { state: "Vermont", code: "VT", rate: 0.06, docFee: 599, titleFee: 42, note: "6% purchase & use" },
  { state: "Virginia", code: "VA", rate: 0.043, docFee: 599, titleFee: 15, note: "4.15% SUT" },
  { state: "Washington", code: "WA", rate: 0.065, docFee: 200, titleFee: 35 },
  { state: "West Virginia", code: "WV", rate: 0.06, docFee: 599, titleFee: 15 },
  { state: "Wisconsin", code: "WI", rate: 0.05, docFee: 399, titleFee: 164 },
  { state: "Wyoming", code: "WY", rate: 0.04, docFee: 299, titleFee: 15 },
]

const seedSafeguards: SafeguardItem[] = [
  { control: "MFA everywhere", status: "pass", evidence: "100% coverage • Okta + hardware FIDO2 • 342 users", lastVerified: "2026-04-22T00:00:00Z" },
  { control: "Encryption at rest & in transit", status: "pass", evidence: "AES-256 at rest (RDS/S3) • TLS 1.3 in transit • KMS rotation 90d", lastVerified: "2026-04-20T00:00:00Z" },
  { control: "Access logs & monitoring", status: "pass", evidence: "Immutable audit • SIEM → Splunk 24/7 • 4.2M events/mo", lastVerified: "2026-04-21T00:00:00Z" },
  { control: "Vendor oversight records", status: "pass", evidence: "42 vendors SOC2 reviewed • Vitu, RouteOne, Dealertrack contracts", lastVerified: "2026-04-18T00:00:00Z" },
  { control: "Incident-response runbooks", status: "pass", evidence: "IR playbooks v4.1 • tabletop 2026-03 • RTO 1h / RPO 15m drills", lastVerified: "2026-03-15T00:00:00Z" },
  { control: "FTC 500+-consumer breach workflow", status: "pass", evidence: "Auto-notify FTC + customers < 72h • credit monitoring queued", lastVerified: "2026-04-19T00:00:00Z" },
  { control: "Least-privilege + vuln management", status: "pass", evidence: "RBAC 12 rooftops • pen test 2026-04-01 • 0 critical vulns • SIEM", lastVerified: "2026-04-01T00:00:00Z" },
]

const seedAccessLogs: ComplianceAuditEntry[] = [
  { at: "2026-04-24T09:31:12Z", actor: "s.rivera@sovereign", action: "GET /v1/deals/8841", resource: "deal:8841", result: "allow", ip: "10.2.14.8" },
  { at: "2026-04-24T09:28:04Z", actor: "dealer_consent:dtown", action: "GET /v1/vehicles?vin=JTMA*", resource: "vehicle:search", result: "allow", ip: "44.22.18.5" },
  { at: "2026-04-24T09:22:47Z", actor: "admin@sovereign", action: "POST /v1/customers", resource: "customer:create", result: "allow", ip: "172.31.9.42" },
  { at: "2026-04-24T08:55:17Z", actor: "d.alvarez@sovereign", action: "POST /v1/consent/opt-in", resource: "consent:recording", result: "success", ip: "10.2.14.11" },
  { at: "2026-04-23T16:02:10Z", actor: "vitu.service@autocore", action: "POST /vitu/titl/submit", resource: "titr:VIT-8841", result: "success", ip: "52.8.14.2" },
  { at: "2026-04-23T14:02:00Z", actor: "system:scheduler", action: "BACKUP verify restore", resource: "backup:immutable", result: "success", ip: "127.0.0.1" },
]

const seedComplianceState: ComplianceState = {
  mfaCoverage: 100,
  encryption: "AES-256",
  accessLogs: seedAccessLogs,
  safeguardsChecklist: seedSafeguards,
  taxRules: seedTaxRules,
  vituSubmissions: [
    { vin: "JTMAAACA4PA042118", status: "submitted", tracking: "VIT-8841", lienPayoff: "queued • Wells Fargo $14,100 • E2 CIT", at: "2026-04-24T09:41:00Z", rooftop: "dtown" },
  ],
  soc: { soc1: "SOC 1 Type II", soc2: "SOC 2 Type II", soc1Status: "audit 2026-Q1 • clean opinion", soc2Status: "audit 2026-Q1 • controls effective • 12 rooftops" },
  iso: { iso27001: "ISO 27001", iso27701: "ISO 27701", pathMonth: 8 },
  privacyLaws: { count: 13, states: ["CA","VA","CO","CT","UT","TX","TN","OR","MT","IA","IN","DE","FL"], note: "§5.3 — 13 new state consumer-privacy laws 2026 • consent + DSAR workflows" },
  penTest: { last: "2026-04-01", vulnCount: 0, siem: "Splunk • 24/7 SOC • least-privilege RBAC", leastPrivilege: "RBAC 7 roles • JIT elevation • 15m session TTL" },
  backup: { immutable: true, rpo: "15m", rto: "1h", lastRestoreTest: "2026-04-19T06:00:00Z", tested: true },
  drStrategy: "Post-CDK lesson • immutable backups • tested restore 2026-04-19 • cross-region failover us-west-2 • RPO 15m RTO 1h • no single-vendor lock",
}

// ── E2-T12 Brex-class: vendor payments (AP automation + expense management) ──
const seedVendorPayments: VendorPayment[] = [
  { id: "VP-1001", vendor: "Ally Financial — Floorplan Lender", amount: 68546, status: "pending", dueDate: "2026-04-28" },
  { id: "VP-1002", vendor: "Toyota Genuine Parts — Parts Vendor", amount: 14200, status: "pending", dueDate: "2026-04-25" },
  { id: "VP-1003", vendor: "Snap-on Industrial — Shop Equipment", amount: 8400, status: "pending", dueDate: "2026-04-30" },
  { id: "VP-1004", vendor: "ADP — Payroll & Benefits", amount: 41200, status: "paid", dueDate: "2026-04-24" },
  { id: "VP-1005", vendor: "Duke Energy + Reynolds DMS — SaaS & Utilities", amount: 12850, status: "pending", dueDate: "2026-04-27" },
]

// ── E11-T08 Snowflake-class: nightly + CDC streaming to dealer warehouse ──
const seedDataWarehouse: DataWarehouseState = {
  lastExportAt: "2026-04-23T14:02:00Z",
  status: "CDC • RPO 15m",
  rows: 1_200_000,
  sizeGb: 4.2,
}

function computeConsolidation(vehicles: typeof seedVehicles, deals: F1Deal[], repairOrders: typeof seedROs, parts: typeof seedParts) {
  const avgFloorplanFallback = 34800
  const transferDetails: { vin: string; stockNo: string; from: string; to: string; at: string }[] = []
  vehicles.forEach(v => {
    const hist = (v as unknown as { transferHistory?: { from: string; to: string; at: string }[] }).transferHistory
    if (Array.isArray(hist)) {
      hist.forEach(h => transferDetails.push({ vin: v.vin, stockNo: v.stockNo, from: h.from, to: h.to, at: h.at }))
    }
  })
  const rows: GroupConsolidationRow[] = groupMeta.rooftops.map(rt => {
    const vehs = vehicles.filter(v => v.rooftopId === rt.id)
    const unsold = vehs.filter(v => v.status !== "sold")
    const floorplan = unsold.reduce((s, v) => s + ((v as unknown as { floorplanAmount?: number }).floorplanAmount ?? avgFloorplanFallback), 0)
    const rooftopDeals = deals.filter(d => d.rooftop === rt.id)
    const units = rooftopDeals.filter(d => d.stage === "delivered").length
    const soldVehCount = vehs.filter(v => v.status === "sold").length
    const displayUnits = units || (rooftopDeals.length === 0 ? soldVehCount : units)
    const frontGross = rooftopDeals.reduce((s, d) => s + (d.pencil?.gross ?? 0), 0)
    const backGross = rooftopDeals.reduce((s, d) => {
      const fiCount = Object.values(d.fiMenu).filter(Boolean).length
      return s + fiCount * 620 + (d.funding.status === "funded" ? 400 : 0)
    }, 0)
    const svcGross = repairOrders.filter(r=> r.rooftopId===rt.id && r.status==="invoiced").reduce((s,r)=> s + (r.total||0),0) || (rt.id==="dtown"?12400: rt.id==="north"?9200:13200)
    const _partsGross = rt.id==="dtown"?14200: rt.id==="north"?11820:12700
    const citLive = rooftopDeals.filter(d=> d.funding.status==="submitted").reduce((s,d)=> s + (d.funding.cit??0),0)
    const citFallback = rt.id==="dtown"?29824: rt.id==="north"?68546:29873
    const citOpen = citLive>0? citLive: citFallback
    const warrantyAR = repairOrders.filter(r=> r.rooftopId===rt.id && r.type==="warranty").reduce((s,r)=> s + (r.total? r.total : 2840),0)
    const transfers = transferDetails.filter(t=> t.from===rt.id || t.to===rt.id).length
    return {
      rooftopId: rt.id, rooftopName: rt.name, brand: rt.brand,
      units: displayUnits,
      frontGross, backGross, svcGross, partsGross: _partsGross,
      citOpen, floorplan, warrantyAR, transfers
    }
  })
  const group: GroupConsolidationRow = rows.reduce((a,r)=> ({
    rooftopId: "group", rooftopName: "GROUP CONSOLIDATED", brand: "All",
    units: a.units + r.units,
    frontGross: a.frontGross + r.frontGross,
    backGross: a.backGross + r.backGross,
    svcGross: a.svcGross + r.svcGross,
    partsGross: a.partsGross + r.partsGross,
    citOpen: a.citOpen + r.citOpen,
    floorplan: a.floorplan + r.floorplan,
    warrantyAR: a.warrantyAR + r.warrantyAR,
    transfers: a.transfers + r.transfers,
  }), { rooftopId:"group", rooftopName:"GROUP CONSOLIDATED", brand:"All", units:0, frontGross:0, backGross:0, svcGross:0, partsGross:0, citOpen:0, floorplan:0, warrantyAR:0, transfers:0 })
  const eliminations = transferDetails.length===0?12400: transferDetails.length*3100
  return { rows, group, eliminations, transferDetails }
}

// ── T1 NL parser — keyword matching over unified store (no LLM) ──
function resolveBIQuery(nl: string, _get: () => AppState): { answer: string; sql: string; rows: ConversationalBIRow[] } {
  const q = nl.toLowerCase()
  const has = (...keys: string[]) => keys.some(k => q.includes(k))
  // Gross per tech this month — flag Rivera
  if ((has("gross") && has("tech")) || q.includes("per tech") || q.includes("technician")) {
    return {
      answer: "Tech Rivera — $18.4k gross this month • flagged below 75% threshold • efficiency 68% • review queued • top: W. Schmidt $24.1k, J. Walker $21.3k.",
      sql: "SELECT technician, SUM(gross) AS gross, AVG(efficiency) FROM repair_orders\nWHERE date_trunc('month', closed_at) = date_trunc('month', now())\nGROUP BY technician ORDER BY gross DESC;",
      rows: [
        { technician: "W. Schmidt — BMW Master", gross: "$24,100", hours: 68.4, eff: "142%", flag: "—" },
        { technician: "J. Walker — Ford Senior", gross: "$21,300", hours: 61.5, eff: "131%", flag: "—" },
        { technician: "R. Ortiz — Toyota MDT", gross: "$19,200", hours: 56.2, eff: "118%", flag: "—" },
        { technician: "Rivera — Westside", gross: "$18,400", hours: 42.0, eff: "68%", flag: "⚠️ below 75%" },
      ],
    }
  }
  // Aged inventory >45 days — count 4
  if (has("aged") || (has("inventory") && (q.includes("45") || q.includes(">45") || q.includes("aging")))) {
    return {
      answer: "4 units aged >45 days — carrying cost $12.4k • 2 at North (F30881 Mustang GT 62d — wholesale review, T23204 RAV4 47d), 1 at Dtown (Highlander 19d borderline), 1 pending recon • curtailment $1,840/mo.",
      sql: "SELECT stock_no, vehicle, age_days, lot, floorplan FROM vehicles\nWHERE status = 'stock' AND aging_days > 45\nORDER BY aging_days DESC;",
      rows: [
        { stock: "F30881", vehicle: "2020 Mustang GT Premium", age: "62 days", lot: "Showroom — Podium", floorplan: "$31,200" },
        { stock: "T23204", vehicle: "2022 RAV4 XLE AWD", age: "47 days", lot: "Back Lot C04", floorplan: "$24,200" },
        { stock: "W40198", vehicle: "2022 BMW 330i xDrive", age: "38 days → 45d flag soon", lot: "BMW CPO Row E02", floorplan: "$29,800" },
        { stock: "T23157", vehicle: "2023 Highlander Limited", age: "19 days", lot: "Front Line A12", floorplan: "$34,800" },
      ],
    }
  }
  // CIT aging — $142k 7 deals
  if (has("cit")) {
    return {
      answer: "$142k CIT across 7 deals — oldest D-1050 23 days • 2 deals >30 days overdue • avg 14.3 days • funding queue: 3 with Wells, 2 Dealertrack, 2 TFS • next payoff $34.8k.",
      sql: "SELECT deal_id, customer, cit_amount, age_days, lender FROM deals\nWHERE funding_status = 'submitted'\nORDER BY cit_age DESC;",
      rows: [
        { deal: "D-1050", customer: "Marcus Chen", cit: "$28,400", age: "23 days", lender: "Wells", status: "overdue" },
        { deal: "D-1052", customer: "Priya Nair", cit: "$24,800", age: "19 days", lender: "Dealertrack", status: "overdue" },
        { deal: "D-1044", customer: "Robert Owens", cit: "$22,100", age: "16 days", lender: "Ford Credit", status: "pending" },
        { deal: "D-1047", customer: "A. Johnson", cit: "$19,600", age: "11 days", lender: "TFS", status: "pending" },
        { deal: "D-1048", customer: "K. Tanaka", cit: "$18,900", age: "8 days", lender: "Wells", status: "pending" },
        { deal: "D-1051", customer: "S. Martinez", cit: "$16,200", age: "6 days", lender: "Ally", status: "pending" },
        { deal: "D-1049", customer: "E. Carter", cit: "$12,000", age: "3 days", lender: "BMW FS", status: "pending" },
      ],
    }
  }
  // Missed calls today — 3
  if (has("missed") || (has("calls") && has("today"))) {
    const todayCount = 3
    return {
      answer: `3 missed calls today — 2 recovered by AI voice (67% recovery) • 1 callback task queued for 09:45 • avg answer 22s • all transcripts on customer timeline • 30–40% drop recovered.`,
      sql: "SELECT id, caller, intent, score, verdict FROM ai_calls\nWHERE date(created_at) = current_date AND missed = true\nORDER BY created_at DESC;",
      rows: [
        { id: "C-883", caller: "615-555-0199 Grace Kim", intent: "Service", score: 89, verdict: "Booked Tue 10" },
        { id: "C-882", caller: "248-555-0311 Amara Okafor", intent: "Service", score: 88, verdict: "Booked Tue 10" },
        { id: "C-881", caller: "248-555-0143 Marcus Chen", intent: "Sales", score: 92, verdict: "Bridged → J. Alvarez" },
      ].slice(0, todayCount),
    }
  }
  // Group GP MTD — $312k
  if ((has("group") && (has("gp") || has("gross"))) || (has("mtd") && has("gp")) || q.includes("group gp")) {
    return {
      answer: "$312k Group GP MTD — 184 units • $1,696 PVR • +4.2% vs prior • Front $182k • Back $88k • Service $28k • Parts $14k • 3 rooftops consolidated • GL balanced to penny.",
      sql: "SELECT rooftop, SUM(front_gross + back_gross + svc_gross + parts_gross) AS gp\nFROM gl_consolidation\nWHERE date_trunc('month', close_date) = date_trunc('month', now())\nGROUP BY rooftop;",
      rows: [
        { rooftop: "Downtown Toyota", units: 64, gp: "$112,400", pv: "$1,756" },
        { rooftop: "North Ford", units: 58, gp: "$98,200", pv: "$1,693" },
        { rooftop: "Westside Honda/BMW", units: 62, gp: "$101,400", pv: "$1,635" },
        { rooftop: "GROUP", units: 184, gp: "$312,000", pv: "$1,696" },
      ],
    }
  }
  // Fallback — generic NL coverage hint
  return {
    answer: `Found 3 matches for “${nl}” across unified store — customers, vehicles, deals, ROs, GL. Try: “Gross per tech this month?”, “Aged inventory >45 days?”, “CIT aging?”, “Missed calls today?”, “Group GP MTD?”.`,
    sql: `SELECT * FROM unified_store\nWHERE search_vector @@ plainto_tsquery('${nl.replace(/'/g, "''").slice(0, 64)}')\nLIMIT 20;`,
    rows: [
      { source: "customers", match: "Marisol Delgado • F-884102 • repeat", score: "92%" },
      { source: "vehicles", match: "T24081 • Camry XSE • Front Line A12", score: "88%" },
      { source: "deals", match: "D-1041 • Marcus Chen • pencil $2,410", score: "85%" },
    ],
  }
}

export const useStore = create<AppState>((set, get)=> ({
  vehicles: seedVehicles,
  customers: seedCustomers,
  deals: (() => {
    const d1 = { ...makeDeal("D-1041", "Marcus Chen", seedVehicles[0].vin), stage: "lead" as DealStage, createdAt: new Date(Date.now() - 1000*60*62*24*2).toISOString(), updatedAt: new Date(Date.now() - 1000*60*62*24*2).toISOString() }
    const d2 = { ...makeDeal("D-1042", "Priya Nair", seedVehicles[2].vin), stage: "desked" as DealStage, pencil: { price: 48200, rate: 6.49, term: 72, down: 3000, tax: 1890, fees: 489, monthly: 612, gross: 2410 }, createdAt: new Date(Date.now() - 1000*60*60*24*6).toISOString(), updatedAt: new Date(Date.now() - 1000*60*60*24*6).toISOString() }
    // additional seeded delivered deals for E11 velocity — spread across rooftops/weeks
    const d3 = { ...makeDeal("D-1043", "Aaliyah Johnson", seedVehicles[3].vin), stage: "delivered" as DealStage, pencil: { price: 36490, rate: 6.49, term: 72, down: 3000, tax: 1890, fees: 489, monthly: 612, gross: 3420 }, createdAt: new Date(Date.now() - 1000*60*60*24*10).toISOString(), updatedAt: new Date(Date.now() - 1000*60*60*24*1).toISOString(), deliveredAt: new Date(Date.now() - 1000*60*60*24*1).toISOString(), glPosted: true } as F1Deal
    const d4 = { ...makeDeal("D-1044", "Robert Owens", seedVehicles[8].vin), stage: "delivered" as DealStage, rooftop: "north" as string, pencil: { price: 53490, rate: 6.49, term: 60, down: 5000, tax: 2100, fees: 599, monthly: 789, gross: 2890 }, createdAt: new Date(Date.now() - 1000*60*60*24*14).toISOString(), updatedAt: new Date(Date.now() - 1000*60*42).toISOString(), deliveredAt: new Date(Date.now() - 42*1000).toISOString(), glPosted: true } as F1Deal
    const d5 = { ...makeDeal("D-1045", "Kenji Tanaka", seedVehicles[16].vin), stage: "delivered" as DealStage, rooftop: "westside" as string, pencil: { price: 40750, rate: 5.99, term: 60, down: 5000, tax: 1890, fees: 489, monthly: 589, gross: 2680 }, createdAt: new Date(Date.now() - 1000*60*60*24*18).toISOString(), updatedAt: new Date(Date.now() - 1000*60*60*24*3).toISOString(), deliveredAt: new Date(Date.now() - 1000*60*60*2).toISOString(), glPosted: true } as F1Deal
    // ensure delivered deals have correct rooftop lineage from vehicle but override for demo diversity already set
    return [d1, d2, d3, d4, d5]
  })(),
  activeDealId: "D-1041",
  leads: seedLeads,
  serviceAppointments: seedAppts,
  repairOrders: seedROs,
  technicians: seedTechs,
  parts: seedParts,
  groupMeta,
  incentiveRules: seedIncentiveRules,
  incentiveClaims: seedIncentiveClaims,
  aiCalls: [
    {
      id: "C-881",
      from: "248-555-0143 Marcus Chen",
      callerId: "248-555-0143",
      intent: "Sales",
      vehicleInterest: "2024 Camry XSE",
      stockNo: "T24081",
      transcript: "AI: Hi Marcus, Sovereign AI — this call is being recorded with disclosure notice. Thanks for calling Sovereign Toyota... Are you looking for sales or service? Customer: Sales, the Camry online... AI: One moment — checking live inventory now • still available Front Line Row A12 • want 2pm today? I can bridge you now. Customer: Yes please. [ANI match ✓ • live inventory ✓]",
      dur: "00:47",
      score: 92,
      sent: "positive",
      verdict: "Bridged to J. Alvarez — whisper: Marcus + Camry + prior RAV4 • ANI match • live inventory check ✓",
      disclosed: true,
      recording: true,
      createdAt: new Date(Date.now() - 1000*60*62).toISOString(),
      bridged: true,
    },
    {
      id: "C-882",
      from: "248-555-0311 Amara Okafor",
      callerId: "248-555-0311",
      intent: "Service",
      vehicleInterest: "RAV4 Recall",
      stockNo: "N/A",
      transcript: "AI: Hi Amara — Sovereign Auto Group on a recorded line — this call may be recorded for quality. [Disclosure ✓] I see your RAV4 has an open recall — want Tuesday 10? Customer: Yes. AI: Checking capacity now… booked. Confirmation SMS sent. [ANI match • service capacity-aware]",
      dur: "01:12",
      score: 88,
      sent: "neutral",
      verdict: "Booked appt Tue 10 • capacity-aware • SMS conf • ANI match • transcript on timeline",
      disclosed: true,
      recording: true,
      createdAt: new Date(Date.now() - 1000*60*45).toISOString(),
      serviceBooked: true,
    },
    {
      id: "C-883",
      from: "615-555-0199 Grace Kim",
      callerId: "615-555-0199",
      intent: "Service",
      vehicleInterest: "Camry brake + cabin filter",
      stockNo: "N/A",
      transcript: "AI: Hi Grace — Sovereign AI on a recorded line — this call may be recorded. [Disclosure ✓] I see your Camry is due for brake inspection — checking capacity now… Customer: Brake squeak front left. AI: Found next open Bay Tue 10 with loaner — booked, video MPI queued. [ANI match • live RO check ✓]",
      dur: "00:51",
      score: 89,
      sent: "neutral",
      verdict: "Booked appt Tue 10 • video MPI queued • ANI match • recording logged",
      disclosed: true,
      recording: true,
      createdAt: new Date(Date.now() - 1000*60*20).toISOString(),
      serviceBooked: true,
    },
  ] as VoiceCall[],
  systemHealth: {
    region: "us-east-1",
    degraded: false,
    rto: "1h",
    rpo: "15m",
    failoverRegion: "us-west-2",
    queuedMutations: 0,
    statusPage: "https://status.sovereign.auto",
    lastFailoverAt: null,
    incidentReportPublished: false,
  } as SystemHealth,
  selectedRooftop: "group" as const,
  lastPostedAt: new Date(Date.now() - 42 * 1000).toISOString(),
  complianceState: seedComplianceState,
  vendorPayments: seedVendorPayments,
  dataWarehouse: seedDataWarehouse,
  copilotSuggestions: seedCopilotSuggestions,
  submitVitu: (vin: string) => {
    const tracking = `VIT-${Math.floor(8000 + Math.random()*1000)}`
    const at = new Date().toISOString()
    const entry: VituSubmission = { vin, status: "submitted" as const, tracking, lienPayoff: "queued • Wells Fargo $14,100 • E2 CIT", at, rooftop: "dtown" }
    const log: ComplianceAuditEntry = { at, actor: "vitu.service@autocore", action: `POST /vitu/titl/submit ${vin}`, resource: `titr:${tracking}`, result: "success", ip: "52.8.14.2" }
    // push to complianceState via zustand set - captured closure set is available here
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(set as any)((s: AppState) => ({ complianceState: { ...s.complianceState, vituSubmissions: [...s.complianceState.vituSubmissions, entry], accessLogs: [log, ...s.complianceState.accessLogs].slice(0, 50) } }))
    return tracking
  },
  exportSafeguards: () => {
    // returns csv string for mock download
    return `control,status,evidence,verified\n${seedSafeguards.map(s=> `"${s.control}","${s.status}","${s.evidence}","${s.lastVerified}"`).join("\n")}`
  },
  migration: {
    extractors: [
      { id: "cdk", name: "CDK Drive", src: "CDK", status: "done" as const, coverage: "GL history • customers • vehicles • bins/on-order • open ROs/deals • employees • 15k rooftops", pct: 98.4, note: "15,000 rooftops post-outage" },
      { id: "reynolds", name: "Reynolds ERA-IGNITE", src: "Reynolds", status: "progress" as const, coverage: "Same domains • ERA formats • 10k rooftops", pct: 87, note: "Mapping workbench • RCI bypass" },
      { id: "tekion", name: "Tekion ARC", src: "Tekion", status: "queued" as const, coverage: "Defensive churn capture", pct: 12, note: "Queued • after CDK/Reynolds" },
    ],
    mappingRows: [
      { field: "Customers", source: "CDK CRM", target: "M-xxx shared file", score: "98.4%", scoreNum: 98.4, issues: 3, status: "ok" as const },
      { field: "Vehicles", source: "CDK Inventory", target: "VIN master", score: "99.1%", scoreNum: 99.1, issues: 1, status: "ok" as const },
      { field: "Chart of Accounts", source: "CDK GL", target: "OEM-mapped COA", score: "96.2%", scoreNum: 96.2, issues: 7, status: "warn" as const },
      { field: "Parts bins/on-hand", source: "CDK Parts", target: "Bin location matrix", score: "99.2%", scoreNum: 99.2, issues: 0, status: "ok" as const },
      { field: "Open ROs", source: "CDK Service", target: "RO state machine", score: "97.8%", scoreNum: 97.8, issues: 2, status: "warn" as const },
      { field: "Open deals / CIT", source: "CDK Deals", target: "Deal object", score: "98.9%", scoreNum: 98.9, issues: 1, status: "ok" as const },
    ],
    mapping: [
      { field: "Customers", source: "CDK CRM", target: "M-xxx shared file", score: "98.4%", scoreNum: 98.4, issues: 3, status: "ok" as const },
      { field: "Vehicles", source: "CDK Inventory", target: "VIN master", score: "99.1%", scoreNum: 99.1, issues: 1, status: "ok" as const },
      { field: "Chart of Accounts", source: "CDK GL", target: "OEM-mapped COA", score: "96.2%", scoreNum: 96.2, issues: 7, status: "warn" as const },
      { field: "Parts bins/on-hand", source: "CDK Parts", target: "Bin location matrix", score: "99.2%", scoreNum: 99.2, issues: 0, status: "ok" as const },
      { field: "Open ROs", source: "CDK Service", target: "RO state machine", score: "97.8%", scoreNum: 97.8, issues: 2, status: "warn" as const },
      { field: "Open deals / CIT", source: "CDK Deals", target: "Deal object", score: "98.9%", scoreNum: 98.9, issues: 1, status: "ok" as const },
    ],
    verification: { trialBalance: 0, binsExact: 1204, status: "PASS" as const, verifiedAt: new Date().toISOString(), jeValidated: "JE-20441 validated" },
    parallelRun: {
      currentDay: 9,
      days: Array.from({ length: 14 }, (_, i) => {
        const heights = [62,58,71,68,75,80,77,82,69,74,78,85,0,0]
        const parity = i < 9 ? 100 : null
        return { day: i+1, parity, height: heights[i] }
      }),
    },
    cutover: { scheduledAt: new Date(Date.now() + 86400000*2).toISOString(), executedAt: null, status: "scheduled" as const },
    parallelDays: 9,
    cutoverScheduledAt: new Date(Date.now() + 86400000*2).toISOString(),
  },
  migrationState: {
    extractors: [
      { id: "cdk", name: "CDK Drive", src: "CDK", status: "done" as const, coverage: "GL history • customers • vehicles • bins/on-order • open ROs/deals • employees • 15k rooftops", pct: 98.4, note: "15,000 rooftops post-outage" },
      { id: "reynolds", name: "Reynolds ERA-IGNITE", src: "Reynolds", status: "progress" as const, coverage: "Same domains • ERA formats • 10k rooftops", pct: 87, note: "Mapping workbench • RCI bypass" },
      { id: "tekion", name: "Tekion ARC", src: "Tekion", status: "queued" as const, coverage: "Defensive churn capture", pct: 12, note: "Queued • after CDK/Reynolds" },
    ],
    mappingRows: [
      { field: "Customers", source: "CDK CRM", target: "M-xxx shared file", score: "98.4%", scoreNum: 98.4, issues: 3, status: "ok" as const },
      { field: "Vehicles", source: "CDK Inventory", target: "VIN master", score: "99.1%", scoreNum: 99.1, issues: 1, status: "ok" as const },
      { field: "Chart of Accounts", source: "CDK GL", target: "OEM-mapped COA", score: "96.2%", scoreNum: 96.2, issues: 7, status: "warn" as const },
      { field: "Parts bins/on-hand", source: "CDK Parts", target: "Bin location matrix", score: "99.2%", scoreNum: 99.2, issues: 0, status: "ok" as const },
      { field: "Open ROs", source: "CDK Service", target: "RO state machine", score: "97.8%", scoreNum: 97.8, issues: 2, status: "warn" as const },
      { field: "Open deals / CIT", source: "CDK Deals", target: "Deal object", score: "98.9%", scoreNum: 98.9, issues: 1, status: "ok" as const },
    ],
    mapping: [
      { field: "Customers", source: "CDK CRM", target: "M-xxx shared file", score: "98.4%", scoreNum: 98.4, issues: 3, status: "ok" as const },
      { field: "Vehicles", source: "CDK Inventory", target: "VIN master", score: "99.1%", scoreNum: 99.1, issues: 1, status: "ok" as const },
      { field: "Chart of Accounts", source: "CDK GL", target: "OEM-mapped COA", score: "96.2%", scoreNum: 96.2, issues: 7, status: "warn" as const },
      { field: "Parts bins/on-hand", source: "CDK Parts", target: "Bin location matrix", score: "99.2%", scoreNum: 99.2, issues: 0, status: "ok" as const },
      { field: "Open ROs", source: "CDK Service", target: "RO state machine", score: "97.8%", scoreNum: 97.8, issues: 2, status: "warn" as const },
      { field: "Open deals / CIT", source: "CDK Deals", target: "Deal object", score: "98.9%", scoreNum: 98.9, issues: 1, status: "ok" as const },
    ],
    verification: { trialBalance: 0, binsExact: 1204, status: "PASS" as const, verifiedAt: new Date().toISOString(), jeValidated: "JE-20441 validated" },
    parallelRun: {
      currentDay: 9,
      days: Array.from({ length: 14 }, (_, i) => {
        const heights = [62,58,71,68,75,80,77,82,69,74,78,85,0,0]
        const parity = i < 9 ? 100 : null
        return { day: i+1, parity, height: heights[i] }
      }),
    },
    cutover: { scheduledAt: new Date(Date.now() + 86400000*2).toISOString(), executedAt: null, status: "scheduled" as const },
    parallelDays: 9,
    cutoverScheduledAt: new Date(Date.now() + 86400000*2).toISOString(),
  },
  // ── F1 ──
  setActiveDeal: (id)=> set({ activeDealId: id }),
  createDealFromLead: (name, vin) => {
    const id = `D-${1043 + get().deals.length}`
    const d = makeDeal(id, name, vin)
    d.stage = "appointment"
    d.timeline.push({ t: now(), label: "AI SMS 22s → bridge 47s <60s SLA • appointment Thu 10:30" })
    set(s=> ({ deals: [...s.deals, d], activeDealId: id }))
    return id
  },
  updatePencil: (dealId, pencil)=> set(s=> {
    const ts = new Date().toISOString()
    const updated = s.deals.map(d=> d.id===dealId ? { ...d, pencil, stage: "pencil" as DealStage, updatedAt: ts, timeline: [...d.timeline, { t: now(), label: `Pencil $${pencil?.monthly}/mo • gross $${pencil?.gross} • 500ms` }] } : d)
    const target = updated.find(d=> d.id===dealId)
    let claims: IncentiveClaim[] = s.incentiveClaims as IncentiveClaim[]
    if (target && pencil) {
      const rules = (s.incentiveRules as IncentiveRule[]).filter(r=> r.vin===target.vin)
      const existingForDeal = claims.filter(c=> c.dealId===dealId).map(c=> c.programCode)
      rules.forEach(r=>{
        if (!existingForDeal.includes(r.programCode)) {
          const conflict = rules.some(other=> other.id!==r.id && r.incompatibleWith.includes(other.programCode))
          claims = [...claims, {
            id: `IC-${1000+claims.length+1}-${r.programCode}`,
            dealId, vin: target.vin, stockNo: target.stockNo, customerName: target.customerName, rooftop: target.rooftop,
            program: r.program, programCode: r.programCode, amount: r.amount, claimAmount: r.amount,
            status: "pending" as IncentiveClaimStatus, submittedAt: new Date().toISOString(),
            stackingConflict: conflict, oemResponse: conflict ? "Held — stacking check" : "Auto-applied at desking • pending submit",
            mismatchReason: conflict ? `Stacking-rule conflict: ${r.program} incompatible with ${r.incompatibleWith.join(", ")}` : undefined
          }]
        }
      })
    }
    return { deals: updated, incentiveClaims: claims }
  }),
  acceptDeal: (dealId)=> set(s=> {
    const ts = new Date().toISOString()
    const deals = s.deals.map(d=> d.id===dealId ? { ...d, stage: "desked" as DealStage, updatedAt: ts, timeline: [...d.timeline, { t: now(), label: "Customer accepted — desking → F&I • incentives auto-applied" }] } : d)
    const target = deals.find(d=> d.id===dealId)
    let claims: IncentiveClaim[] = s.incentiveClaims as IncentiveClaim[]
    if (target) {
      const rules = (s.incentiveRules as IncentiveRule[]).filter(r=> r.vin===target.vin)
      const existing = claims.filter(c=> c.dealId===dealId).map(c=> c.programCode)
      rules.forEach(r=>{
        if (!existing.includes(r.programCode)) {
          const hasConflict = rules.some(o=> o.id!==r.id && r.incompatibleWith.includes(o.programCode))
          claims = [...claims, {
            id: `IC-${1000+claims.length+1}`, dealId, vin: target.vin, stockNo: target.stockNo, customerName: target.customerName, rooftop: target.rooftop,
            program: r.program, programCode: r.programCode, amount: r.amount, claimAmount: r.amount,
            status: "pending" as IncentiveClaimStatus, submittedAt: new Date().toISOString(),
            stackingConflict: hasConflict,
            mismatchReason: hasConflict? `Stacking-rule conflict: ${r.program} cannot stack with ${r.incompatibleWith.join(", ")} per program rules` : undefined,
            oemResponse: hasConflict? "Flagged — stacking review" : "Auto-applied at desking"
          }]
        }
      })
    }
    return { deals, incentiveClaims: claims }
  }),
  submitCredit: (dealId)=> set(s=> {
    const ts = new Date().toISOString()
    return { deals: s.deals.map(d=> d.id===dealId ? { ...d, stage: "credit" as DealStage, updatedAt: ts, credit: { bureau: 742, decision: "approved", lender: "Wells" }, timeline: [...d.timeline, { t: now(), label: "Credit via Dealertrack → approved (conditioned) • 2 stips" }] } : d) }
  }),
  toggleFi: (dealId, product)=> set(s=> {
    const ts = new Date().toISOString()
    return { deals: s.deals.map(d=> d.id===dealId ? { ...d, fiMenu: { ...d.fiMenu, [product]: !d.fiMenu[product] }, stage: "menu" as DealStage, updatedAt: ts } : d) }
  }),
  submitContract: (dealId)=> set(s=> {
    const ts = new Date().toISOString()
    return { deals: s.deals.map(d=> d.id===dealId ? { ...d, stage: "contract" as DealStage, updatedAt: ts, funding: { ...d.funding, status: "submitted", cit: d.pencil?.price ?? 48200 }, timeline: [...d.timeline, { t: now(), label: `eContract submitted → CIT $${(d.pencil?.price ?? 48200).toLocaleString()} • TITL Vitu queued` }] } : d) }
  }),
  deliverDeal: (dealId)=> set(s=> {
    const target = s.deals.find(d=> d.id===dealId)
    let claims: IncentiveClaim[] = (s.incentiveClaims as IncentiveClaim[]).map(c=> c.dealId===dealId && c.status==="pending" ? { ...c, status: "submitted" as IncentiveClaimStatus, submittedAt: new Date().toISOString(), oemResponse: c.stackingConflict ? "Submitted — flagged stacking" : "Submitted to OEM • awaiting AR" } : c)
    if (target) {
      const rules = (s.incentiveRules as IncentiveRule[]).filter(r=> r.vin===target.vin)
      const hasClaims = claims.some(c=> c.dealId===dealId)
      if (!hasClaims && rules.length>0) {
        rules.forEach(r=>{
          const conflict = rules.some(o=> o.id!==r.id && r.incompatibleWith.includes(o.programCode))
          claims = [...claims, {
            id: `IC-${1000+claims.length+1}`, dealId, vin: target.vin, stockNo: target.stockNo, customerName: target.customerName, rooftop: target.rooftop,
            program: r.program, programCode: r.programCode, amount: r.amount, claimAmount: r.amount,
            status: "submitted" as IncentiveClaimStatus, submittedAt: new Date().toISOString(),
            stackingConflict: conflict, mismatchReason: conflict? `Stacking-rule conflict` : undefined, oemResponse: "Incentive claim submitted → reconcile AR schedule"
          }]
        })
      }
    }
    const ts = new Date().toISOString()
    return {
      deals: s.deals.map(d=> d.id===dealId ? { ...d, stage: "delivered" as DealStage, updatedAt: ts, deliveredAt: ts, funding: { status: "funded", cit: null, depositPaid: d.funding.depositPaid, depositAmount: d.funding.depositAmount, depositMethod: d.funding.depositMethod }, glPosted: true, timeline: [...d.timeline, { t: now(), label: "DELIVERED — floorplan payoff, CIT cleared, commission accrued • GL real-time E2 • owner lifecycle • incentive AR queued" }] } : d),
      vehicles: s.vehicles.map(v=> v.vin===s.deals.find(d=>d.id===dealId)?.vin ? { ...v, status: "sold" as const } : v),
      incentiveClaims: claims,
      lastPostedAt: ts
    }
  }),
  // ── F3 Fully Online Purchase (same deal object — 97% fix) ──
  startOnlineDeal: (dealId)=> set(s=> ({
    deals: s.deals.map(d=> {
      if(d.id!==dealId) return d
      const at = new Date().toISOString()
      const offer = d.tradeOffer ?? {
        vin: "1HGCM82633A099412",
        photos: ["front","rear","odo","vin_plate"],
        condition: "average" as const,
        firmLow: Math.max(12000, d.trade ? d.trade.acv - 600 : 17600),
        firmHigh: d.trade ? d.trade.acv + 600 : 18800,
        firmMid: d.trade ? d.trade.acv : 18200,
        acv: d.trade ? d.trade.acv : 18200,
        appraisalSource: "E3 • KBB + BlackBook + condition photos",
        capturedAt: at,
      }
      return {
        ...d,
        channel: "online" as const,
        onlineStartedAt: at,
        tradeOffer: offer,
        softPull: d.softPull ?? { consented: false, consentedAt: null, score: null, tier: null, status: "not_started" as const },
        stage: d.stage==="lead" ? "pencil" as DealStage : d.stage,
        timeline: [...d.timeline, { t: now(), label: "F3 Online Started • 09:14 EST • trade VIN/photos/condition captured • E3 firm-range offer" }],
      }
    })
  })),
  setChannel: (dealId, channel)=> set(s=> ({
    deals: s.deals.map(d=> {
      if(d.id!==dealId) return d
      if(channel==="online" && !d.onlineStartedAt){
        const at = new Date().toISOString()
        return {
          ...d, channel, onlineStartedAt: at,
          tradeOffer: d.tradeOffer ?? {
            vin: "2T3B1RFVXNW147882", photos: ["front","rear","odo","vin_plate"], condition: "average" as const,
            firmLow: 17600, firmHigh: 18800, firmMid: 18200, acv: 18200, appraisalSource: "E3 • KBB + BlackBook", capturedAt: at,
          },
          softPull: d.softPull ?? { consented:false, consentedAt:null, score:null, tier:null, status:"not_started" as const },
          timeline: [...d.timeline, { t: now(), label: "Channel → ONLINE • 09:14 EST • same record #"+d.id+" • no re-key" }],
        }
      }
      if(channel==="in_store"){
        return { ...d, channel, timeline: [...d.timeline, { t: now(), label: "Channel → IN-STORE • finish in-store same record" }]}
      }
      return { ...d, channel }
    })
  })),
  setTradeOffer: (dealId, offer)=> set(s=> ({
    deals: s.deals.map(d=> d.id===dealId ? { ...d, tradeOffer: offer, timeline: [...d.timeline, { t: now(), label: `Trade E3 offer $${offer?.firmLow.toLocaleString()}–$${offer?.firmHigh.toLocaleString()} • ${offer?.condition} • ${offer?.appraisalSource}` }] } : d)
  })),
  consentSoftPull: (dealId)=> set(s=> ({
    deals: s.deals.map(d=> d.id===dealId ? { ...d, softPull: { consented: true, consentedAt: new Date().toISOString(), score: null, tier: null, status: "consented" as const }, timeline: [...d.timeline, { t: now(), label: "Soft-pull consent ✓ • FCRA disclosure accepted • pre-qual running" }] } : d)
  })),
  completeSoftPull: (dealId)=> set(s=> ({
    deals: s.deals.map(d=>{
      if(d.id!==dealId) return d
      const score = 742
      const tier = score>=750 ? "Excellent" : score>=700 ? "Good" : "Fair"
      const base = d.pencil?.price ?? 48200
      const rate = tier==="Excellent" ? 5.99 : tier==="Good" ? 6.49 : 8.49
      return {
        ...d,
        softPull: { consented: true, consentedAt: d.softPull?.consentedAt ?? new Date().toISOString(), score, tier, status: "prequalified" as const },
        pencil: d.pencil ? { ...d.pencil, rate } : { price: base, rate, term: 72, down: 3500, tax: 1890, fees: 489, monthly: 598, gross: 2410 },
        credit: { bureau: score, decision: "approved" as const, lender: "Personalized — TFS 6.49% • Ally 7.24%" },
        timeline: [...d.timeline, { t: now(), label: `Soft-pull pre-qual ${score} • ${tier} • personalized rates: TFS ${rate}% live • no hard inquiry` }],
      }
    })
  })),
  payDeposit: (dealId)=> set(s=> ({
    deals: s.deals.map(d=> d.id===dealId ? {
      ...d,
      deposit: { paid: true, amount: 500, paidAt: new Date().toISOString(), method: "Embedded • Stripe • E2", refundable: true },
      funding: { ...d.funding, depositPaid: true, depositAmount: 500, depositMethod: "Embedded • E2 • refundable" },
      timeline: [...d.timeline, { t: now(), label: "Deposit $500 paid • E2 embedded payments • refundable • receipt #DEP-8841" }],
    } : d)
  })),
  setESignStatus: (dealId, status)=> set(s=> ({
    deals: s.deals.map(d=>{
      if(d.id!==dealId) return d
      let nextTimeline = [...d.timeline]
      if(status==="sent") nextTimeline.push({ t: now(), label: "eSign sent • DocuSign • link expires 48h • IP logged" })
      else if(status==="signed") nextTimeline.push({ t: now(), label: "eSigned ✓ • stips pending • deal → pending funding (97% fix — same object)" })
      else if(status==="funded") nextTimeline.push({ t: now(), label: "FUNDED • hard pull → lender approved • delivery scheduled" })
      else nextTimeline.push({ t: now(), label: `eSign ${status}` })
      const isFundable = status==="signed" || status==="funded"
      return { ...d, eSignStatus: status, funding: isFundable ? { ...d.funding, status: "submitted" as const, cit: 48200 } : d.funding, stage: status==="signed" ? "contract" as DealStage : d.stage, timeline: nextTimeline }
    })
  })),
  uploadStip: (dealId, stipId)=> set(s=> ({
    deals: s.deals.map(d=>{
      if(d.id!==dealId) return d
      const nextStips = d.stips.map(st=> st.id===stipId ? { ...st, status: "uploaded" as const } : st)
      const allUploaded = nextStips.every(st=> st.status!=="pending")
      return { ...d, stips: nextStips, stipsUploaded: allUploaded, timeline: [...d.timeline, { t: now(), label: `Stip uploaded: ${stipId} • ${allUploaded ? "all stips complete → hard pull queued":"pending"}` }] }
    })
  })),
  schedulePickup: (dealId, iso)=> set(s=> ({
    deals: s.deals.map(d=> d.id===dealId ? { ...d, pickupScheduledAt: iso, timeline: [...d.timeline, { t: now(), label: `Delivery scheduled ${iso} • pending funding → F&I hard pull • same #${d.id}` }] } : d)
  })),
  hardPullAndFund: (dealId)=> set(s=> ({
    deals: s.deals.map(d=> d.id===dealId ? { ...d, credit: { bureau: d.softPull?.score ?? 742, decision: "approved" as const, lender: "Wells • 6.99% • approved" }, funding: { status: "funded" as const, cit: null, depositPaid: d.funding.depositPaid, depositAmount: d.funding.depositAmount ?? 500, depositMethod: d.funding.depositMethod ?? "Embedded" }, glPosted: true, eSignStatus: "funded" as const, timeline: [...d.timeline, { t: now(), label: "Hard pull + lender decision: Wells 6.99% APPROVED • funded • CIT cleared • GL posted E2" }] } : d)
  })),
  // ── F2 + F17 ──
  setVehicleRecon: (vehicleId, status)=> set(s=> ({
    vehicles: s.vehicles.map(v=> {
      if ((v as unknown as { id: string }).id !== vehicleId) return v
      const normalized = status === "complete" ? "completed" as const : status as typeof v.reconStatus
      let nextReconCost = v.reconCost
      if (normalized === "completed" && (v.reconStatus as string) !== "completed" && (v.reconStatus as string) !== "complete") {
        nextReconCost = v.reconCost + 1240
      }
      let nextStatus: typeof v.status = v.status
      if (normalized === "in_progress") nextStatus = "recon" as const
      else if (normalized === "completed") nextStatus = "stock" as const
      return { ...v, reconStatus: normalized, reconCost: nextReconCost, status: nextStatus } as unknown as typeof v
    })
  })),
  setVehiclePrice: (vehicleId, price)=> set(s=> ({
    vehicles: s.vehicles.map(v=> (v as unknown as { id: string }).id === vehicleId ? { ...v, internetPrice: price } as typeof v : v)
  })),
  transferVehicle: (vehicleId, toRooftop)=> set(s=> ({
    vehicles: s.vehicles.map(v=> (v as unknown as { id: string }).id === vehicleId ? { ...v, rooftopId: toRooftop as typeof v.rooftopId, transferHistory: [...(((v as unknown as { transferHistory?: unknown[] }).transferHistory) || []), { from: v.rooftopId, to: toRooftop, at: now() }] } as typeof v : v)
  })),
  // ── F4 ──
  createROFromAppointment: (appointmentId) => {
    const appt = get().serviceAppointments.find(a=> a.id===appointmentId)
    if(!appt) return null
    const newId = `RO-${1000 + get().repairOrders.length + 1}`
    const ro: typeof seedROs[number] = {
      ...seedROs[0],
      id: newId,
      roNumber: newId,
      customerId: appt.customerId,
      customerName: appt.customerName,
      vehicle: appt.vehicle,
      rooftopId: appt.rooftopId,
      advisor: appt.advisor,
      status: "open" as unknown as typeof seedROs[number]["status"],
      createdAt: new Date().toISOString(),
    } as typeof seedROs[number]
    set(s=> ({
      repairOrders: [...s.repairOrders, ro],
      serviceAppointments: s.serviceAppointments.map(a=> a.id===appointmentId ? { ...a, roId: newId, status: "in_progress" as const } : a)
    }))
    return newId
  },
  updateROStatus: (roId, status)=> set(s=> {
    const ts = new Date().toISOString()
    const isPost = status === "invoiced" || status === "completed"
    return {
      repairOrders: s.repairOrders.map(r=> r.id===roId ? { ...r, status: status as typeof r.status, closedAt: isPost ? ts : (r as unknown as { closedAt?: string }).closedAt } : r),
      ...(isPost ? { lastPostedAt: ts } : {})
    }
  }),
  approveMpiItem: (roId, _mpiIndex, approve)=> set(s=> ({
    repairOrders: s.repairOrders.map(r=> {
      if(r.id!==roId) return r
      const items = (r as unknown as { mpiItems?: unknown[] }).mpiItems
      if(Array.isArray(items) && items[_mpiIndex]) {
        (items[_mpiIndex] as any).approved = approve
        ;(items[_mpiIndex] as any).status = approve ? "approved" : "declined"
      }
      return { ...r, status: approve ? "in_progress" as const : r.status }
    })
  })),
  addFlagHours: (techId, hours)=> set(s=> ({
    technicians: s.technicians.map(t=> t.id===techId ? { ...t, hoursFlaggedMTD: t.hoursFlaggedMTD + hours } : t)
  })),
  // ── F7 ──
  sellPart: (partNumber, qty)=> set(s=> ({
    parts: s.parts.map(p=> p.partNumber===partNumber ? { ...p, onHand: Math.max(0, p.onHand - qty), allocated: p.allocated } : p)
  })),
  createShortSale: (partNumber, qty)=> set(s=> ({
    parts: s.parts.map(p=> p.partNumber===partNumber ? { ...p, onOrder: p.onOrder + qty } : p)
  })),
  // ── F6 ──
  ingestLead: (lead)=> set(s=> ({ leads: [lead, ...s.leads] })),
  convertLeadToDeal: (leadId)=> {
    const lead = get().leads.find(l=> l.id===leadId)
    if(!lead) return null
    const v = get().vehicles.find(v=> v.stockNo===lead.stockNo) || get().vehicles[0]
    const id = get().createDealFromLead(lead.customerName, v.vin)
    set(s=> ({ leads: s.leads.map(l=> l.id===leadId ? { ...l, status: "sold" as const, dealId: id } : l) }))
    return id
  },
  receiveMissedCall: (callerId) => {
    const nowIso = new Date().toISOString()
    const shortTime = new Date().toISOString().slice(11,19)
    const personas: Array<{ name: string; phone: string; intent: "Sales"|"Service"; voi: string; stockNo?: string }> = [
      { name: "Marcus Chen", phone: "248-555-0143", intent: "Sales", voi: "2024 Camry XSE", stockNo: "T24081" },
      { name: "Amara Okafor", phone: "248-555-0311", intent: "Service", voi: "RAV4 Recall", stockNo: undefined },
      { name: "Grace Kim", phone: "615-555-0199", intent: "Service", voi: "Camry brake + cabin filter", stockNo: undefined },
      { name: "Jonathan Reeves", phone: "615-298-4412", intent: "Sales", voi: "2025 RAV4 Hybrid XLE Premium", stockNo: "T24093" },
      { name: "Priya Nair", phone: "615-344-7712", intent: "Sales", voi: "2024 Grand Highlander Hybrid MAX", stockNo: "T24055" },
      { name: "Tyler Brooks", phone: "629-444-0188", intent: "Service", voi: "Mustang GT 30K service", stockNo: undefined },
    ]
    const normalized = callerId ? callerId.replace(/[^0-9]/g, "").slice(-10) : ""
    let persona = personas.find(p => normalized && p.phone.replace(/[^0-9]/g, "").slice(-4) === normalized.slice(-4))
    if (!persona) {
      const idx = get().aiCalls.length % personas.length
      persona = personas[idx]
      if (callerId) persona = { ...persona, phone: callerId }
    }
    const isSales = persona!.intent === "Sales"
    const matchedCustomer = get().customers.find(c => c.phone.replace(/[^0-9]/g,"").slice(-4) === persona!.phone.replace(/[^0-9]/g,"").slice(-4))
    const customerLabel = matchedCustomer ? `${matchedCustomer.firstName} ${matchedCustomer.lastName} • ${matchedCustomer.fileNumber} • ANI match ✓` : `${persona!.name} • ANI match (new) • file auto-created`
    let liveCheck = ""
    let vehicleInterest = persona!.voi
    let stockNo = persona!.stockNo || "N/A"
    if (isSales) {
      const liveVeh = get().vehicles.find(v => v.status === "stock" && v.stockNo === persona!.stockNo) || get().vehicles.find(v => v.status === "stock")
      if (liveVeh) {
        liveCheck = `live inventory ✓ — ${liveVeh.year} ${liveVeh.make} ${liveVeh.model} • ${liveVeh.stockNo} • ${liveVeh.lotLocation} • $${liveVeh.internetPrice.toLocaleString()}`
        vehicleInterest = `${liveVeh.year} ${liveVeh.make} ${liveVeh.model} ${liveVeh.trim}`
        stockNo = liveVeh.stockNo
      } else {
        liveCheck = "live inventory: sold/unavailable — captured vehicle-of-interest for callback • will check dealer trade"
      }
    } else {
      const cap = get().serviceAppointments.filter(a=> a.status==="scheduled").length
      liveCheck = `capacity-aware ✓ — ${cap} appts today • next bay Tue 10 available • loaner queued`
    }
    const useWarmTransfer = Math.random() > 0.15
    const score = isSales ? 88 + Math.floor(Math.random()*7) : 86 + Math.floor(Math.random()*7)
    const durSec = 45 + Math.floor(Math.random()*35)
    const dur = `00:${String(durSec).padStart(2,"0")}`
    const sent: VoiceCall["sent"] = score >= 90 ? "positive" : "neutral"
    const id = `C-${880 + get().aiCalls.length + 1}`
    const disclosureLead = "AI: Hi — this is Sovereign Auto Group AI assistant answering on a recorded line. This call may be recorded for quality and training. [Disclosure + recording notice • two-party consent ✓ • 24s <30s SLA]"
    let transcript = ""
    let verdict = ""
    let callbackTask: string | undefined
    if (isSales) {
      transcript = `${disclosureLead} Are you looking for sales or service today? Customer: Sales — the ${persona!.voi} online. AI: One moment — ${liveCheck}. Want 2pm today or 4pm? I can bridge you now with context. Customer: Yes please — 2pm. AI: Bridging now — whisper to agent: ${persona!.name} • ${vehicleInterest} • ${stockNo} • prior ${matchedCustomer?.vehiclesOwned?.[0]?.make ?? "RAV4"} • ${customerLabel}. [Warm-transfer • whispered context • <30s answer • 30–40% drop recovered]`
      if (useWarmTransfer) {
        verdict = `Bridged to J. Alvarez — whisper: ${persona!.name} + ${vehicleInterest} + ${stockNo} + prior ${matchedCustomer?.vehiclesOwned?.[0]?.make ?? "RAV4"} • ANI match • live inventory ✓ • queued callback fallback ready`
      } else {
        callbackTask = `Callback task • ${persona!.name} • ${shortTime} • transcript on customer timeline • follow-up 09:45 • no human available`
        verdict = `No human — callback task booked • transcript attached to ${persona!.name} timeline • recording/transcript/score logged • manager queue`
      }
    } else {
      transcript = `${disclosureLead} Is this sales or service? Customer: Service — need ${persona!.voi}. AI: I see your ${persona!.voi} — ${customerLabel}. ${liveCheck}. Shall I book Tue 10? Customer: Yes. AI: Booked — confirmation SMS sent • calendar invite • loaner queued. [Service booking • ANI match • capacity-aware] ${useWarmTransfer ? "" : "No advisor free — callback task booked instead."}`
      if (useWarmTransfer) {
        verdict = `Booked appt Tue 10 • capacity-aware • SMS conf • ANI match • transcript on timeline • score ${score}`
      } else {
        callbackTask = `Callback task • ${persona!.name} • ${shortTime} • transcript on timeline • service advisor follow-up`
        verdict = `Queued — callback task booked • transcript on ${persona!.name} timeline • no human • recording logged`
      }
    }
    const call: VoiceCall = {
      id,
      from: `${persona!.phone} ${persona!.name}`,
      callerId: persona!.phone,
      intent: persona!.intent,
      vehicleInterest,
      stockNo,
      transcript,
      dur,
      score,
      sent,
      verdict,
      disclosed: true,
      recording: true,
      createdAt: nowIso,
      bridged: isSales ? useWarmTransfer : false,
      serviceBooked: !isSales ? useWarmTransfer : false,
      callbackTask,
    }
    set(s=> ({
      aiCalls: [...s.aiCalls, call],
      systemHealth: s.systemHealth.degraded ? { ...s.systemHealth, queuedMutations: s.systemHealth.queuedMutations + 1 } : s.systemHealth,
    }))
    return id
  },
  bookServiceFromCall: (callId) => {
    set(s=> ({
      aiCalls: s.aiCalls.map(c=> c.id===callId ? {
        ...c,
        serviceBooked: true,
        intent: "Service" as const,
        verdict: "Booked appt Tue 10 • capacity-aware • SMS conf • ANI match • via bookServiceFromCall • transcript on timeline",
        transcript: c.transcript + " [Action: bookServiceFromCall — appointment Tue 10 created • RO draft • SMS confirmation • customer timeline updated]",
        score: Math.max(c.score, 89),
      } : c)
    }))
  },
  bridgeSalesLead: (callId) => {
    set(s=> ({
      aiCalls: s.aiCalls.map(c=> c.id===callId ? {
        ...c,
        bridged: true,
        intent: "Sales" as const,
        verdict: `Bridged to J. Alvarez — whisper: ${c.from.split(" ").slice(1).join(" ")} + ${c.vehicleInterest} + ${c.stockNo} • warm-transfer • ANI match • live inventory ✓ • via bridgeSalesLead`,
        transcript: c.transcript + " [Action: bridgeSalesLead — warm-transfer executed • whispered context delivered to J. Alvarez • human connected <30s]",
        score: Math.max(c.score, 91),
      } : c)
    }))
  },
  setDegraded: (v) => set(s=> ({
    systemHealth: {
      ...s.systemHealth,
      degraded: v,
      queuedMutations: v ? Math.max(12, s.systemHealth.queuedMutations || 12) : 0,
      lastFailoverAt: v ? new Date().toISOString() : s.systemHealth.lastFailoverAt,
    }
  })),
  toggleDegraded: () => set(s=> {
    const next = !s.systemHealth.degraded
    return {
      systemHealth: {
        ...s.systemHealth,
        degraded: next,
        queuedMutations: next ? 12 : 0,
        lastFailoverAt: next ? new Date().toISOString() : s.systemHealth.lastFailoverAt,
      }
    }
  }),
  publishPostIncidentReport: () => set(s=> ({
    systemHealth: { ...s.systemHealth, incidentReportPublished: true, degraded: false, queuedMutations: 0 }
  })),
  submitIncentiveClaim: (claimId)=> set(s=> ({
    incentiveClaims: (s.incentiveClaims as IncentiveClaim[]).map(c=> c.id===claimId ? { ...c, status: "submitted" as IncentiveClaimStatus, submittedAt: new Date().toISOString(), oemResponse: "Re-submitted to OEM" } : c)
  })),
  reconcileIncentiveClaim: (claimId, status)=> set(s=> ({
    incentiveClaims: (s.incentiveClaims as IncentiveClaim[]).map(c=> c.id===claimId ? { ...c, status, paidAt: status==="paid"? new Date().toISOString(): c.paidAt, oemResponse: status==="paid"? "Paid — reconciled to AR schedule": status==="mismatch"? c.mismatchReason||"Mismatch — OEM short-paid" : c.oemResponse } : c)
  })),
  getGroupConsolidation: () => computeConsolidation(get().vehicles as typeof seedVehicles, get().deals, get().repairOrders as typeof seedROs, get().parts as typeof seedParts),
  setSelectedRooftop: (r) => set({ selectedRooftop: r }),
  getLiveKpiDaily: () => {
    const deals = get().deals
    const byDate: Record<string, { sales: number; gross: number; rooftops: Record<string, { sales: number; gross: number }> }> = {}
    deals.forEach(d => {
      if (d.stage !== "delivered") return
      const key = (d.deliveredAt || d.updatedAt || d.createdAt).slice(0, 10)
      if (!byDate[key]) byDate[key] = { sales: 0, gross: 0, rooftops: {} }
      byDate[key].sales += 1
      byDate[key].gross += d.pencil?.gross ?? 0
      const rt = d.rooftop || "dtown"
      if (!byDate[key].rooftops[rt]) byDate[key].rooftops[rt] = { sales: 0, gross: 0 }
      byDate[key].rooftops[rt].sales += 1
      byDate[key].rooftops[rt].gross += d.pencil?.gross ?? 0
    })
    const map = new Map(seedKpiDaily.map(b => [b.date + "|" + b.rooftopId, { ...b }]))
    Object.entries(byDate).forEach(([date, v]) => {
      const k = date + "|group"
      const existing = map.get(k)
      if (existing) {
        // overlay live delivered sales onto baseline — additive to preserve demo history but reflect new posts
        const addedSales = v.sales
        const addedGross = v.gross
        const newSales = (existing.sales || 0) + addedSales
        const totalGross = (existing.grossPerUnit || 0) * (existing.sales || 0) + addedGross
        map.set(k, { ...existing, sales: newSales, grossPerUnit: newSales ? Math.round(totalGross / newSales) : existing.grossPerUnit })
      } else {
        map.set(k, { date, rooftopId: "group" as const, leads: 2, appointmentsSet: 1, shows: 1, sales: v.sales, closingPct: 20.4, grossPerUnit: v.sales ? Math.round(v.gross / v.sales) : 0, frontGrossPerUnit: 1200, backGrossPerUnit: 600, roCount: 2, serviceSales: 2100, hoursFlagged: 6, efficiencyPct: 110, partsSales: 2200, partsGrossPct: 36, inventoryCount: 18, agingGt45: 2 })
      }
      // per-rooftop overlay
      Object.entries(v.rooftops).forEach(([rt, rv]) => {
        const rk = date + "|" + rt
        const ex = map.get(rk)
        if (ex) {
          const newSales = (ex.sales || 0) + rv.sales
          const totalGross = (ex.grossPerUnit || 0) * (ex.sales || 0) + rv.gross
          map.set(rk, { ...ex, sales: newSales, grossPerUnit: newSales ? Math.round(totalGross / newSales) : ex.grossPerUnit })
        } else {
          // create missing per-rooftop point by cloning group template for that date
          const tpl = map.get(k) || map.get(date + "|group")
          map.set(rk, { date, rooftopId: rt as "dtown"|"north"|"westside", leads: 1, appointmentsSet: 1, shows: 0, sales: rv.sales, closingPct: 20.4, grossPerUnit: rv.sales ? Math.round(rv.gross / rv.sales) : 0, frontGrossPerUnit: 1200, backGrossPerUnit: 600, roCount: 1, serviceSales: 900, hoursFlagged: 2, efficiencyPct: 108, partsSales: 800, partsGrossPct: 34, inventoryCount: 6, agingGt45: 1, avgSpeedToLeadSec: 200 })
        }
      })
    })
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date))
  },
  // ── F10 Migration Workbench ──
  runExtractor: (id: string)=> {
    const ext = get().migration.extractors.find(e=> e.id===id)
    if(!ext) return
    if(ext.status==="done" && ext.pct>=98.4) return
    set(s=>{
      const upd = (list: MigrationExtractor[]) => list.map(e=> e.id===id ? { ...e, status: "progress" as const } : e)
      return {
        migration: { ...s.migration, extractors: upd(s.migration.extractors) },
        migrationState: { ...s.migrationState, extractors: upd(s.migrationState.extractors) },
      }
    })
    const start = ext.pct
    const target = 98.4
    const duration = 1100
    const steps = 22
    let step = 0
    const interval = setInterval(()=>{
      step++
      const progress = step/steps
      const current = start + (target - start) * progress
      const pct = step===steps ? target : Math.round(current*10)/10
      const done = pct>=98.4
      set(s=>{
        const upd = (list: MigrationExtractor[]) => list.map(e=> e.id===id ? { ...e, pct, status: done ? "done" as const : "progress" as const, note: done ? "Completed • verified 98.4% coverage" : e.note } : e)
        return {
          migration: { ...s.migration, extractors: upd(s.migration.extractors) },
          migrationState: { ...s.migrationState, extractors: upd(s.migrationState.extractors) },
        }
      })
      if(step>=steps) clearInterval(interval)
    }, duration/steps)
  },
  fixMapping: (field: string)=> set(s=>{
    const fix = (list: MigrationMappingRow[]) => list.map(r=> r.field===field ? { ...r, score: "99.1%", scoreNum: 99.1, issues: 0, status: "ok" as const } : r)
    return {
      migration: { ...s.migration, mappingRows: fix(s.migration.mappingRows), mapping: fix(s.migration.mapping) },
      migrationState: { ...s.migrationState, mappingRows: fix(s.migrationState.mappingRows), mapping: fix(s.migrationState.mapping) },
    }
  }),
  verifyLoad: ()=> set(s=>{
    const v = { trialBalance: 0, binsExact: 1204, status: "PASS" as const, verifiedAt: new Date().toISOString(), jeValidated: "JE-20441 validated" }
    return {
      migration: { ...s.migration, verification: v },
      migrationState: { ...s.migrationState, verification: v },
    }
  }),
  advanceParallelDay: ()=> set(s=>{
    const cur = s.migration.parallelRun.currentDay
    if(cur>=14) return s
    const next = cur+1
    const updateDays = (days: MigrationParallelDay[]) => days.map(d=> d.day===next ? { ...d, parity: 100, height: 68 + Math.floor(Math.random()*17) } : d)
    return {
      migration: {
        ...s.migration,
        parallelRun: { currentDay: next, days: updateDays(s.migration.parallelRun.days) },
        parallelDays: next,
      },
      migrationState: {
        ...s.migrationState,
        parallelRun: { currentDay: next, days: updateDays(s.migrationState.parallelRun.days) },
        parallelDays: next,
      },
    }
  }),
  executeCutover: ()=> set(s=>{
    const at = new Date().toISOString()
    const cut = { scheduledAt: s.migration.cutover.scheduledAt, executedAt: at, status: "live" as const }
    return {
      migration: { ...s.migration, cutover: cut, cutoverScheduledAt: s.migration.cutoverScheduledAt },
      migrationState: { ...s.migrationState, cutover: cut, cutoverScheduledAt: s.migrationState.cutoverScheduledAt },
      vehicles: s.vehicles.map(v=> ({
        // @ts-ignore transferHistory is dynamic per store transferVehicle
        ...v,
        history: [...(v.history||[]), { date: at.slice(0,10), event: "Cutover — CDK → AutoCore", user: "Migration Workbench", detail: `Live at ${at} • vehicles migrated` }],
        transferHistory: [...(((v as unknown as { transferHistory?: unknown[] }).transferHistory)||[]), { from: "CDK", to: "AutoCore", at }],
      } as unknown as typeof v)),
    }
  }),
  rollback: ()=> set(s=>{
    const cut = { scheduledAt: s.migration.cutover.scheduledAt, executedAt: null, status: "rolled_back" as const }
    return {
      migration: { ...s.migration, cutover: cut },
      migrationState: { ...s.migrationState, cutover: cut },
      vehicles: s.vehicles.map(v=> {
        const hist = (v.history||[]).filter((h: { event:string })=> h.event !== "Cutover — CDK → AutoCore")
        const thRaw = (v as unknown as { transferHistory?: {from:string;to:string;at:string}[] }).transferHistory
        const filtered = Array.isArray(thRaw) ? thRaw.filter(t=> !(t.from==="CDK" && t.to==="AutoCore")) : undefined
        const base: Record<string, unknown> = { ...v, history: hist }
        if(filtered && filtered.length>0) base.transferHistory = filtered
        else if(filtered && filtered.length===0) base.transferHistory = []
        else if(thRaw) base.transferHistory = filtered
        return base as unknown as typeof v
      }),
    }
  }),
  // ── E10 Copilot — F&I guardrail + Service deferred/mileage ──
  acceptCopilot: (id: string)=> set(s=> {
    const item = s.copilotSuggestions.find(c=> c.id===id)
    if(!item) return s
    const updated = s.copilotSuggestions.map(c=> c.id===id ? { ...c, accepted: true, dismissed: false } : c)
    const extra: Partial<AppState> = {}
    // F&I guardrail: respect menu caps $3,200 — only suggest within cap (guardrailOk already enforced seed)
    if(item.type==="fi" && item.dealId){
      ;(extra as { deals: typeof s.deals }).deals = s.deals.map(d=>{
        if(d.id!==item.dealId) return d
        const newFiMenu = { ...d.fiMenu, GAP: true }
        let newPencil = d.pencil
        if(d.pencil){
          const bumpedRate = Number((d.pencil.rate + 0.5).toFixed(2))
          // enforce guardrail: if would exceed cap, keep guardrailOk false and don't apply
          // cap $3,200 — current total + expectedLift must be <= cap
          const currentFiTotal = Object.entries(d.fiMenu).filter(([,v])=> v).length * 620 // rough
          const willExceed = currentFiTotal + item.expectedLift > 3200
          if(willExceed && !item.guardrailOk) return d
          newPencil = { ...d.pencil, rate: bumpedRate > 6.99 ? 6.99 : bumpedRate, gross: (d.pencil.gross ?? 0) + item.expectedLift }
        }
        return { ...d, fiMenu: newFiMenu, pencil: newPencil, timeline: [...d.timeline, { t: new Date().toISOString().slice(11,19), label: `F&I Copilot accepted • ${item.suggestion} • PVR +$${item.expectedLift} • guardrail ✓` }] }
      })
    }
    if(item.type==="service" && item.roId){
      const roId = item.roId
      ;(extra as { repairOrders: typeof s.repairOrders }).repairOrders = s.repairOrders.map(r=>{
        if(r.id!==roId) return r
        const mpi = (r as unknown as { mpiItems: unknown[] }).mpiItems as unknown as Record<string, unknown>[]
        const exists = mpi.some(m=> (m as { id: string }).id===`MPI-COP-${roId}`)
        if(exists){
          const nextMpi = mpi.map(m=> (m as { id: string }).id===`MPI-COP-${roId}` ? { ...(m as object), approved: true, status: "approved" } as unknown as typeof m : m)
          return { ...r, mpiItems: nextMpi as unknown as typeof r.mpiItems, status: "waiting_approval" as unknown as typeof r.status }
        }
        const newItem = {
          id: `MPI-COP-${roId}`,
          category: "safety" as const,
          item: "Front Brake Pads — deferred 4mm (RO-8812 • 11k mi ago)",
          status: "red" as const,
          measurement: "4mm",
          spec: "Min 2mm • 81.2k mi (mileage-based trigger)",
          recommendation: "Replace pads + resurface rotors — deferred from RO-8812 (11k mi ago) + mileage-based 81k • +$230 avg RO",
          laborOp: "BRK-F-01",
          partsRequired: ["04465-33150","43512-33150 x2"],
          laborHours: 1.2,
          retailAmount: item.expectedLift,
          photoUrl: "https://picsum.photos/seed/mpi-brake-cop/600/400",
          videoUrl: undefined,
          approved: true,
        }
        return { ...r, mpiItems: [...(r.mpiItems as unknown as unknown[]), newItem] as unknown as typeof r.mpiItems, status: "waiting_approval" as unknown as typeof r.status }
      })
    }
    return { copilotSuggestions: updated, ...extra } as Partial<AppState> as AppState
  }),
  dismissCopilot: (id: string)=> set(s=> ({
    copilotSuggestions: s.copilotSuggestions.map(c=> c.id===id ? { ...c, dismissed: true, accepted: false } : c)
  })),
  generateCopilotForDeal: (dealId: string)=> set(s=>{
    const exists = s.copilotSuggestions.some(c=> c.dealId===dealId && c.type==="fi" && !c.dismissed)
    if(exists) return s
    const deal = s.deals.find(d=> d.id===dealId)
    if(!deal) return s
    const newId = `COP-FI-${dealId}-${Date.now().toString().slice(-4)}`
    const baseRate = deal.pencil?.rate ?? 6.49
    const nextRate = (baseRate + 0.5).toFixed(2)
    const suggestion = `Bump rate ${baseRate.toFixed(2)}→${nextRate} + add GAP → PVR +$620, payment +$11, within cap $3,200 ✓`
    // guardrail: never suggest beyond cap $3,200 — check current PVR
    const fiCount = Object.values(deal.fiMenu).filter(Boolean).length
    const guardrailOk = (fiCount * 899 + 620) <= 3200
    const newItem: CopilotSuggestionItem = {
      id: newId,
      type: "fi",
      dealId,
      suggestion: guardrailOk ? suggestion : `Rate ${baseRate.toFixed(2)}→${nextRate} + GAP — exceeds cap $3,200 ✗ — not suggested`,
      expectedLift: guardrailOk ? 620 : 0,
      guardrailOk,
      accepted: false,
      dismissed: false,
    }
    if(!guardrailOk) return s
    return { copilotSuggestions: [...s.copilotSuggestions, newItem] }
  }),
  generateCopilotForRO: (roId: string)=> set(s=>{
    const exists = s.copilotSuggestions.some(c=> c.roId===roId && c.type==="service" && !c.dismissed)
    if(exists) return s
    const ro = s.repairOrders.find(r=> r.id===roId)
    if(!ro) return s
    const newId = `COP-SVC-${roId}-${Date.now().toString().slice(-4)}`
    const mileage = ro.vehicle.mileage
    const suggestion = `Deferred brake front 4mm from last RO-8812 + mileage since 11k (${mileage.toLocaleString()} mi) — Add to MPI • +$230 avg`
    const newItem: CopilotSuggestionItem = {
      id: newId,
      type: "service",
      roId,
      suggestion,
      expectedLift: 230,
      guardrailOk: true,
      accepted: false,
      dismissed: false,
    }
    return { copilotSuggestions: [...s.copilotSuggestions, newItem] }
  }),
  payVendor: (id: string) => set(s => {
    const nowIso = new Date().toISOString()
    const entry = s.vendorPayments.find(v => v.id === id)
    if (!entry || entry.status === "paid") return s
    const nextPayments = s.vendorPayments.map(v => v.id === id ? { ...v, status: "paid" as const } : v)
    const log: ComplianceAuditEntry = { at: nowIso, actor: "ap.service@autocore", action: `POST /v1/payments/vendor ${id} $${entry.amount} → GL`, resource: `payment:${id}`, result: "success" as const, ip: "10.2.14.22" }
    return {
      vendorPayments: nextPayments,
      lastPostedAt: nowIso,
      complianceState: { ...s.complianceState, accessLogs: [log, ...s.complianceState.accessLogs].slice(0, 50) },
    }
  }),
  exportWarehouse: () => set(s => {
    const nowIso = new Date().toISOString()
    const nextRows = s.dataWarehouse.rows + Math.floor(Math.random() * 8000 + 2000)
    const nextGb = Math.round((s.dataWarehouse.sizeGb + Math.random() * 0.08) * 100) / 100
    const log: ComplianceAuditEntry = { at: nowIso, actor: "system:scheduler", action: `WAREHOUSE EXPORT ${nextRows} rows → Snowflake/BigQuery`, resource: "warehouse:export", result: "success" as const, ip: "127.0.0.1" }
    return {
      dataWarehouse: { lastExportAt: nowIso, status: "CDC • RPO 15m", rows: nextRows, sizeGb: nextGb },
      complianceState: { ...s.complianceState, accessLogs: [log, ...s.complianceState.accessLogs].slice(0, 50) },
    }
  }),
  conversationalBI: { history: [] },
  queryBI: (nl: string) => {
    const resolved = resolveBIQuery(nl, get)
    const entry: ConversationalBIEntry = {
      id: `BI-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      query: nl,
      answer: resolved.answer,
      sql: resolved.sql,
      rows: resolved.rows,
      at: new Date().toISOString(),
    }
    set(s => ({ conversationalBI: { history: [...s.conversationalBI.history, entry] } }))
    return entry
  },
}))
