import { create } from "zustand"
import { vehicles as seedVehicles } from "@/data/vehicles"
import { customers as seedCustomers } from "@/data/customers"
import { leads as seedLeads } from "@/data/leads"
import { serviceAppointments as seedAppts, repairOrders as seedROs, technicians as seedTechs } from "@/data/service"
import { parts as seedParts } from "@/data/parts"

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
  // F8/F14
  groupMeta: typeof groupMeta
  incentiveRules: IncentiveRule[]
  incentiveClaims: IncentiveClaim[]
  submitIncentiveClaim: (claimId: string) => void
  reconcileIncentiveClaim: (claimId: string, status: IncentiveClaimStatus) => void
  getGroupConsolidation: () => { rows: GroupConsolidationRow[]; group: GroupConsolidationRow; eliminations: number; transferDetails: { vin: string; stockNo: string; from: string; to: string; at: string }[] }
}

const now = () => new Date().toISOString().slice(11,19)

const makeDeal = (id: string, name: string, vin: string): F1Deal => {
  const v = seedVehicles.find(x=>x.vin===vin) || seedVehicles[0]
  return {
    id, customerId: seedCustomers[0]?.id || "CUS-001", customerName: name, vin: v.vin, vehicleLabel: `${v.year} ${v.make} ${v.model} ${v.trim}`, stockNo: v.stockNo, rooftop: v.rooftopId,
    stage: "lead",
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

export const useStore = create<AppState>((set, get)=> ({
  vehicles: seedVehicles,
  customers: seedCustomers,
  deals: [
    makeDeal("D-1041", "Marcus Chen", seedVehicles[0].vin),
    { ...makeDeal("D-1042", "Priya Nair", seedVehicles[2].vin), stage: "desked", pencil: { price: 48200, rate: 6.49, term: 72, down: 3000, tax: 1890, fees: 489, monthly: 612, gross: 2410 } },
  ],
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
    const updated = s.deals.map(d=> d.id===dealId ? { ...d, pencil, stage: "pencil" as DealStage, timeline: [...d.timeline, { t: now(), label: `Pencil $${pencil?.monthly}/mo • gross $${pencil?.gross} • 500ms` }] } : d)
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
    const deals = s.deals.map(d=> d.id===dealId ? { ...d, stage: "desked" as DealStage, timeline: [...d.timeline, { t: now(), label: "Customer accepted — desking → F&I • incentives auto-applied" }] } : d)
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
  submitCredit: (dealId)=> set(s=> ({
    deals: s.deals.map(d=> d.id===dealId ? { ...d, stage: "credit" as DealStage, credit: { bureau: 742, decision: "approved", lender: "Wells" }, timeline: [...d.timeline, { t: now(), label: "Credit via Dealertrack → approved (conditioned) • 2 stips" }] } : d)
  })),
  toggleFi: (dealId, product)=> set(s=> ({
    deals: s.deals.map(d=> d.id===dealId ? { ...d, fiMenu: { ...d.fiMenu, [product]: !d.fiMenu[product] }, stage: "menu" as DealStage } : d)
  })),
  submitContract: (dealId)=> set(s=> ({
    deals: s.deals.map(d=> d.id===dealId ? { ...d, stage: "contract" as DealStage, funding: { ...d.funding, status: "submitted", cit: d.pencil?.price ?? 48200 }, timeline: [...d.timeline, { t: now(), label: `eContract submitted → CIT $${(d.pencil?.price ?? 48200).toLocaleString()} • TITL Vitu queued` }] } : d)
  })),
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
    return {
      deals: s.deals.map(d=> d.id===dealId ? { ...d, stage: "delivered" as DealStage, funding: { status: "funded", cit: null, depositPaid: d.funding.depositPaid, depositAmount: d.funding.depositAmount, depositMethod: d.funding.depositMethod }, glPosted: true, timeline: [...d.timeline, { t: now(), label: "DELIVERED — floorplan payoff, CIT cleared, commission accrued • GL real-time E2 • owner lifecycle • incentive AR queued" }] } : d),
      vehicles: s.vehicles.map(v=> v.vin===s.deals.find(d=>d.id===dealId)?.vin ? { ...v, status: "sold" as const } : v),
      incentiveClaims: claims
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
  updateROStatus: (roId, status)=> set(s=> ({
    repairOrders: s.repairOrders.map(r=> r.id===roId ? { ...r, status: status as typeof r.status } : r)
  })),
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
}))
