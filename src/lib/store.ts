import { create } from "zustand"
import { vehicles as seedVehicles } from "@/data/vehicles"
import { customers as seedCustomers } from "@/data/customers"

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
  fiMenu: Record<string, boolean> // productId -> accepted
  funding: { status: "draft"|"submitted"|"funded"|"kicked"; cit: number | null }
  glPosted: boolean
  timeline: { t: string; label: string }[]
}
export type AppState = {
  // single sources of truth
  vehicles: typeof seedVehicles
  customers: typeof seedCustomers
  deals: F1Deal[]
  activeDealId: string | null
  // actions
  createDealFromLead: (customerName: string, vin: string) => string
  updatePencil: (dealId: string, pencil: F1Deal["pencil"]) => void
  acceptDeal: (dealId: string) => void
  submitCredit: (dealId: string) => void
  toggleFi: (dealId: string, product: string) => void
  submitContract: (dealId: string) => void
  deliverDeal: (dealId: string) => void
  setActiveDeal: (id: string | null) => void
}

const now = () => new Date().toISOString().slice(11,19)

const makeDeal = (id: string, name: string, vin: string): F1Deal => {
  const v = seedVehicles.find(x=>x.vin===vin) || seedVehicles[0]
  return {
    id, customerId: seedCustomers[0]?.id || "CUS-001", customerName: name, vin: v.vin, vehicleLabel: `${v.year} ${v.make} ${v.model} ${v.trim}`, stockNo: v.stockNo, rooftop: v.rooftopId,
    stage: "lead",
    pencil: null, trade: { acv: 18200, payoff: 14100, allowance: 17500 }, credit: { bureau: 742, decision: "pending", lender: "Dealertrack" },
    fiMenu: { VSC: false, GAP: false, Tire: false, Dent: false },
    funding: { status: "draft", cit: null }, glPosted: false,
    timeline: [{ t: now(), label: "Lead ingress — dedup <5s • M-214 created • assigned J. Alvarez" }],
  }
}

export const useStore = create<AppState>((set, get)=> ({
  vehicles: seedVehicles,
  customers: seedCustomers,
  deals: [
    makeDeal("D-1041", "Marcus Chen", seedVehicles[0].vin),
    { ...makeDeal("D-1042", "Priya Nair", seedVehicles[2].vin), stage: "desked", pencil: { price: 48200, rate: 6.49, term: 72, down: 3000, tax: 1890, fees: 489, monthly: 612, gross: 2410 } },
  ],
  activeDealId: "D-1041",
  setActiveDeal: (id)=> set({ activeDealId: id }),
  createDealFromLead: (name, vin) => {
    const id = `D-${1043 + get().deals.length}`
    const d = makeDeal(id, name, vin)
    d.stage = "appointment"
    d.timeline.push({ t: now(), label: "AI SMS 22s → bridge 47s <60s SLA • appointment Thu 10:30" })
    set(s=> ({ deals: [...s.deals, d], activeDealId: id }))
    return id
  },
  updatePencil: (dealId, pencil)=> set(s=> ({
    deals: s.deals.map(d=> d.id===dealId ? { ...d, pencil, stage: "pencil" as DealStage, timeline: [...d.timeline, { t: now(), label: `Pencil $${pencil?.monthly}/mo • gross $${pencil?.gross} • 500ms` }] } : d)
  })),
  acceptDeal: (dealId)=> set(s=> ({
    deals: s.deals.map(d=> d.id===dealId ? { ...d, stage: "desked" as DealStage, timeline: [...d.timeline, { t: now(), label: "Customer accepted — desking → F&I" }] } : d)
  })),
  submitCredit: (dealId)=> set(s=> ({
    deals: s.deals.map(d=> d.id===dealId ? { ...d, stage: "credit" as DealStage, credit: { bureau: 742, decision: "approved", lender: "Wells" }, timeline: [...d.timeline, { t: now(), label: "Credit via Dealertrack → approved (conditioned) • 2 stips" }] } : d)
  })),
  toggleFi: (dealId, product)=> set(s=> ({
    deals: s.deals.map(d=> d.id===dealId ? { ...d, fiMenu: { ...d.fiMenu, [product]: !d.fiMenu[product] }, stage: "menu" as DealStage } : d)
  })),
  submitContract: (dealId)=> set(s=> ({
    deals: s.deals.map(d=> d.id===dealId ? { ...d, stage: "contract" as DealStage, funding: { status: "submitted", cit: 48200 }, timeline: [...d.timeline, { t: now(), label: "eContract submitted → CIT $48,200 • TITL Vitu queued" }] } : d)
  })),
  deliverDeal: (dealId)=> set(s=> ({
    deals: s.deals.map(d=> d.id===dealId ? { ...d, stage: "delivered" as DealStage, funding: { status: "funded", cit: null }, glPosted: true, timeline: [...d.timeline, { t: now(), label: "DELIVERED — floorplan payoff, CIT cleared, commission accrued • GL real-time E2 • owner lifecycle" }] } : d),
    vehicles: s.vehicles.map(v=> v.vin===s.deals.find(d=>d.id===dealId)?.vin ? { ...v, status: "sold" as const } : v)
  })),
}))
