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
  funding: { status: "draft"|"submitted"|"funded"|"kicked"; cit: number | null }
  glPosted: boolean
  timeline: { t: string; label: string }[]
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
  // F1
  createDealFromLead: (customerName: string, vin: string) => string
  updatePencil: (dealId: string, pencil: F1Deal["pencil"]) => void
  acceptDeal: (dealId: string) => void
  submitCredit: (dealId: string) => void
  toggleFi: (dealId: string, product: string) => void
  submitContract: (dealId: string) => void
  deliverDeal: (dealId: string) => void
  setActiveDeal: (id: string | null) => void
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
  leads: seedLeads,
  serviceAppointments: seedAppts,
  repairOrders: seedROs,
  technicians: seedTechs,
  parts: seedParts,
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
      // For demo, mark first MPI item approved/declined via flag on RO
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
}))
