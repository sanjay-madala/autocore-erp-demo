import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CalendarDots,
  Clock,
  Wrench,
  VideoCamera,
  Camera,
  Check,
  X,
  Sparkle,
  Lightning,
  Users,
  Car,
  Flag,
  Timer,
  ArrowRight,
  CaretRight,
  DotsThree,
  MagnifyingGlass,
  Bell,
  CheckCircle,
  WarningCircle,
  Hourglass,
  Package,
  CreditCard,
  Link as LinkIcon,
  PaperPlaneTilt,
  Play,
  Eye,
  ThumbsUp,
  ThumbsDown,
  BookmarkSimple,
  TrendUp,
  Gauge,
  PenNib,
  Phone,
  ChatCircle,
  Van,
  GasPump,
  Tire,
  ClipboardText,
  FileText,
  ShieldCheck,
  House,
  Microphone,
  Waveform,
  RoadHorizon,
} from "@phosphor-icons/react"
import { useStore } from "@/lib/store"

// ──────────────────────────────────────────────
// Helpers & Mappings for store data
// ──────────────────────────────────────────────
type ROStatusDisplay = string

const storeStatusMeta: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  open: { label: "Open", color: "bg-zinc-700 text-zinc-200", icon: PenNib },
  in_progress: { label: "In Progress", color: "bg-sky-500 text-white", icon: Wrench },
  waiting_approval: { label: "Waiting approval", color: "bg-orange-500 text-white", icon: Hourglass },
  waiting_parts: { label: "Waiting parts", color: "bg-amber-500 text-black", icon: Package },
  completed: { label: "Completed", color: "bg-emerald-500 text-white", icon: CheckCircle },
  invoiced: { label: "Ready", color: "bg-violet-500 text-white", icon: Flag },
  cancelled: { label: "Cancelled", color: "bg-red-500 text-white", icon: X },
  // legacy fallbacks (in case data still has old values)
  "write-up": { label: "Write-up", color: "bg-zinc-700 text-zinc-200", icon: PenNib },
  mpi: { label: "MPI", color: "bg-amber-500 text-black", icon: Eye },
  "waiting-approval": { label: "Waiting approval", color: "bg-orange-500 text-white", icon: Hourglass },
  authorized: { label: "Authorized", color: "bg-emerald-500 text-white", icon: CheckCircle },
  "in-progress": { label: "In Progress", color: "bg-sky-500 text-white", icon: Wrench },
  ready: { label: "Ready", color: "bg-violet-500 text-white", icon: Flag },
}

const apptStatusMeta: Record<string, { label: string; color: string }> = {
  scheduled: { label: "scheduled", color: "bg-white/10 text-zinc-300" },
  checked_in: { label: "arrived", color: "bg-emerald-500 text-black" },
  in_progress: { label: "in-bay", color: "bg-sky-500 text-white" },
  waiting_parts: { label: "waiting", color: "bg-amber-500 text-black" },
  completed: { label: "completed", color: "bg-zinc-700 text-zinc-200" },
  no_show: { label: "no-show", color: "bg-red-500/20 text-red-300 border border-red-500/30" },
  cancelled: { label: "cancelled", color: "bg-red-500 text-white" },
}

function laneForAppt(a: { rooftopId: string }): "Express" | "Mainline" | "Diag" {
  if (a.rooftopId === "dtown") return "Express"
  if (a.rooftopId === "north") return "Mainline"
  return "Diag"
}

function laneColor(lane: "Express" | "Mainline" | "Diag") {
  if (lane === "Express") return "bg-emerald-500"
  if (lane === "Mainline") return "bg-sky-500"
  return "bg-violet-500"
}

function fmtTime(iso: string) {
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso
    // show like 7:30 without AM/PM to match original 7:30 style
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: false })
  } catch {
    return iso
  }
}

function vehicleLabel(v: { year: number; make: string; model: string; vin: string; mileage: number }) {
  return `${v.year} ${v.make} ${v.model}`
}

function getDecision(item: unknown) {
  const anyItem = item as Record<string, unknown>
  if (anyItem.approved === true) return "approved"
  if (anyItem.approved === false) return "declined"
  if ((item as { declined?: boolean }).declined === true) return "declined"
  const s = (item as { status?: string }).status
  if (s === "approved") return "approved"
  if (s === "declined") return "declined"
  if (s === "deferred") return "deferred"
  return "pending"
}

function getPricing(item: { retailAmount?: number; laborHours?: number }) {
  const retail = item.retailAmount ?? 0
  if (retail === 0) return null
  const list = Math.round(retail * 0.78)
  const matrix = retail
  const cost = Math.round(retail * 0.45)
  const laborHrs = item.laborHours ?? 0
  const margin = Math.round(((matrix - cost) / matrix) * 100)
  const uplift = list > 0 ? Math.round(((matrix - list) / list) * 100) : 0
  return { list, matrix, cost, laborHrs, margin, uplift }
}

function initialsFromName(name: string) {
  const parts = name.split(" ").filter(Boolean)
  if (parts.length === 0) return "—"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

const DEFERRED = [
  { item: "Brake fluid exchange", ro: "88332 • 04/12", age: "14d ago", price: 159, next: "Next visit" },
  { item: "Alignment + 2 tires", ro: "88341 • today", age: "Declined today", price: 512, next: "30d follow-up" },
  { item: "Rear shocks", ro: "88341 • today", age: "Pending", price: 799, next: "Awaiting auth" },
]

const statusCycle = ["open", "in_progress", "waiting_approval", "completed"]

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────
export default function ServiceLane() {
  // Zustand store — single source of truth per tasks 1-5
  const appointments = useStore((s) => s.serviceAppointments)
  const ros = useStore((s) => s.repairOrders)
  const techs = useStore((s) => s.technicians)
  const createROFromAppointment = useStore((s) => s.createROFromAppointment)
  const updateROStatus = useStore((s) => s.updateROStatus)
  const approveMpiItem = useStore((s) => s.approveMpiItem)
  const addFlagHours = useStore((s) => s.addFlagHours)
  // E10-T09 Service Copilot — deferred + mileage-based
  const copilotSuggestions = useStore((s) => s.copilotSuggestions)
  const acceptCopilot = useStore((s) => s.acceptCopilot)
  const dismissCopilot = useStore((s) => s.dismissCopilot)
  const generateCopilotForRO = useStore((s) => s.generateCopilotForRO)
  // E14-T07 P2 Voice-to-inspection-field — Technician-AI live transcript
  const voiceTranscripts = useStore((s) => s.voiceTranscripts)
  const addVoiceTranscript = useStore((s) => s.addVoiceTranscript)
  const applyVoiceTranscript = useStore((s) => s.applyVoiceTranscript)
  const dismissVoiceTranscript = useStore((s) => s.dismissVoiceTranscript)
  // E7-T11 Loaner & Shuttle + E8-T10 Tire Hub — live store
  const loanerFleet = useStore((s) => s.loanerFleet)
  const shuttleRides = useStore((s) => s.shuttleRides)
  const tireSets = useStore((s) => s.tireSets)
  const assignLoanerToRO = useStore((s) => s.assignLoanerToRO)
  const updateLoanerAgreement = useStore((s) => s.updateLoanerAgreement)
  const returnLoaner = useStore((s) => s.returnLoaner)
  const dispatchShuttle = useStore((s) => s.dispatchShuttle)
  const completeShuttle = useStore((s) => s.completeShuttle)
  const addTireSetToRO = useStore((s) => s.addTireSetToRO)

  const [selectedRoId, setSelectedRoId] = useState<string>(ros[0]?.id ?? "RO-1001")
  const [filter, setFilter] = useState<string>("all")
  const [aiAccepted, setAiAccepted] = useState(false)
  const [showPayLink, setShowPayLink] = useState(false)
  const [sentLink, setSentLink] = useState(false)
  const [search, setSearch] = useState("")
  // E14-T07 P2 Voice-to-inspection-field — hold to record live
  const [isRecording, setIsRecording] = useState(false)
  const [recordingPulse, setRecordingPulse] = useState(false)
  const [lastVoiceId, setLastVoiceId] = useState<string | null>(null)
  const lastVoice = useMemo(() => voiceTranscripts.find(v=> v.id===lastVoiceId) ?? voiceTranscripts.filter(v=> v.roId===selectedRoId).slice(-1)[0] ?? null, [voiceTranscripts, lastVoiceId, selectedRoId])
  // E7-T11 agreement capture + E8-T10 tire hub local UI
  const [selectedLoanerId, setSelectedLoanerId] = useState<string>(loanerFleet[0]?.id ?? "LOAN-01")
  const [agreementFuel, setAgreementFuel] = useState<string>("Full")
  const [agreementDamage, setAgreementDamage] = useState<string>("")
  const [showManifestFor, setShowManifestFor] = useState<string | null>(null)
  const [tireVin, setTireVin] = useState<string>("2T3B1RFVXNW147882")
  const [tireAddedFlash, setTireAddedFlash] = useState<string | null>(null)

  // keep selected RO valid when store changes (e.g., after Create RO)
  const selectedRO = useMemo(() => ros.find((r) => r.id === selectedRoId) ?? ros[0] ?? null, [ros, selectedRoId])

  const filteredRos = useMemo(() => {
    let out: typeof ros = [...ros] as typeof ros
    if (filter !== "all") {
      // map legacy filter names to store status values
      const filterMap: Record<string, string> = {
        "write-up": "open",
        mpi: "in_progress",
        "waiting-approval": "waiting_approval",
        "waiting_approval": "waiting_approval",
        "in-progress": "in_progress",
        in_progress: "in_progress",
        ready: "completed",
        authorized: "in_progress",
        open: "open",
        completed: "completed",
        waiting_parts: "waiting_parts",
        invoiced: "invoiced",
      }
      const target = filterMap[filter] ?? filter.replace(/-/g, "_")
      out = out.filter((r) => r.status === target)
    }
    if (search) {
      const q = search.toLowerCase()
      out = out.filter((r) => (r.customerName + vehicleLabel(r.vehicle) + r.roNumber + r.concern).toLowerCase().includes(q))
    }
    return out
  }, [ros, filter, search])

  const mpiStats = useMemo(() => {
    if (!selectedRO || !selectedRO.mpiItems) return { approved: 0, pending: 0, declined: 0, deferred: 0, potential: 0, approvedCount: 0 }
    const items = selectedRO.mpiItems
    let approved = 0
    let pending = 0
    let declined = 0
    let deferred = 0
    let potential = 0
    let approvedCount = 0
    items.forEach((m) => {
      const dec = getDecision(m)
      const price = m.retailAmount ?? 0
      potential += price
      if (dec === "approved") {
        approved += price
        approvedCount++
      } else if (dec === "declined") declined++
      else if (dec === "deferred") deferred++
      else pending++
    })
    return { approved, pending, declined, deferred, potential, approvedCount }
  }, [selectedRO])

  const totalFlagged = useMemo(() => techs.reduce((s, t) => s + t.hoursFlaggedMTD, 0), [techs])
  const totalClocked = useMemo(() => techs.reduce((s, t) => s + t.hoursClockedMTD, 0), [techs])
  const avgEfficiency = totalClocked ? Math.round((totalFlagged / totalClocked) * 100) : 0
  const totalCapacityHrs = useMemo(() => techs.reduce((s, t) => s + t.maxBays * 8, 0) || 64, [techs])

  const handleStatusClick = (roId: string, current: string) => {
    const normalized = current.replace(/-/g, "_")
    let idx = statusCycle.indexOf(normalized)
    // if current not in cycle (e.g., waiting_parts, invoiced), start at 0
    if (idx === -1) idx = -1
    const next = statusCycle[(idx + 1) % statusCycle.length] as string
    updateROStatus(roId, next)
    if (next === "completed") {
      const ro = ros.find((r) => r.id === roId)
      const techId = (ro?.technicianId as string | undefined) ?? techs[0]?.id
      if (techId) addFlagHours(techId, 2.5)
    }
  }

  const handleCreateRO = (appointmentId: string) => {
    const newId = createROFromAppointment(appointmentId)
    if (newId) setSelectedRoId(newId)
  }

  const handleMpiDecision = (roId: string, index: number, approve: boolean) => {
    approveMpiItem(roId, index, approve)
  }

  // E14-T07 P2 — Hold to record → mock transcript → store pre-fill → MPI
  const startVoice = () => {
    if (!selectedRO) return
    setIsRecording(true)
    setRecordingPulse(true)
  }
  const endVoice = () => {
    if (!isRecording || !selectedRO) {
      setIsRecording(false)
      setRecordingPulse(false)
      return
    }
    setIsRecording(false)
    setRecordingPulse(false)
    const mock = "Brake pads 4mm, recommend replace, labor 1.2h"
    const entry = addVoiceTranscript(mock, selectedRO.id, "mpi_video")
    setLastVoiceId(entry.id)
  }
  const handleApplyVoice = () => {
    if (!lastVoice) return
    const ok = applyVoiceTranscript(lastVoice.id)
    if (ok) {
      // flash added — selection already updated via store
    }
  }

  const capacityPct = Math.min(1, totalFlagged / totalCapacityHrs)

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-violet-500/30 selection:text-white">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* ── Header ── */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-[#09090b]/80 border-b border-white/[0.06]">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-white text-black grid place-items-center font-black text-[11px] leading-none tracking-tighter">
              AC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[17px] font-bold tracking-tight">Service Lane</h1>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-white text-black text-[10px] font-bold px-2 py-0.5 tracking-widest">FIXED OPS</span>
                <span className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live • 9:42 AM</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-medium">
                <span className="hidden sm:inline">E7 Scheduling</span> <span className="opacity-30">•</span> F4 RO &amp; Dispatch <span className="opacity-30">•</span> F13 MPI Video <span className="opacity-30">•</span> F15 Pay
                <span className="ml-2 inline-flex items-center gap-1 rounded bg-violet-500/15 border border-violet-500/20 text-violet-300 px-1.5 py-0.5 text-[10px] font-bold tracking-widest">E7 • F4 • F13 • F15</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden xl:flex items-center gap-2 rounded-full bg-white/[0.06] border border-white/[0.06] px-3 py-1.5">
              <Gauge className="h-4 w-4 text-zinc-400" />
              <span className="text-xs font-semibold">Bays {Math.round(totalFlagged)}/{totalCapacityHrs}</span>
              <div className="h-1.5 w-24 rounded-full bg-white/10 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${capacityPct * 100}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full bg-emerald-500" />
              </div>
              <span className="text-[11px] text-zinc-400">{Math.round(capacityPct * 100)}% utilized</span>
            </div>
            <button className="relative grid h-9 w-9 place-items-center rounded-full bg-white text-black">
              <Bell className="h-4 w-4" weight="bold" />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[#09090b]" />
            </button>
            <div className="hidden md:flex items-center gap-2 rounded-full bg-white/[0.06] border border-white/10 pl-1 pr-3 py-1">
              <img src="https://i.pravatar.cc/100?img=33" alt="" className="h-7 w-7 rounded-full object-cover" />
              <div className="leading-none">
                <div className="text-xs font-semibold">S. Patel</div>
                <div className="text-[11px] text-zinc-400">Service Mgr</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI strip ── */}
      <div className="max-w-[1440px] mx-auto px-6 py-4">
        <div className="grid grid-cols-12 gap-3">
          {[
            { label: "Appts Today", value: String(appointments.length), sub: `${appointments.filter(a=>a.status==="checked_in").length} arrived • ${appointments.filter(a=>a.status==="no_show").length} no-show`, icon: CalendarDots, accent: "text-emerald-400" },
            { label: "ROs Open", value: String(ros.filter(r=> r.status !== "completed" && r.status !== "invoiced" && r.status !== "cancelled").length), sub: `${ros.filter(r=> r.status==="waiting_approval").length} waiting approval • ${ros.filter(r=> r.status==="completed" || r.status==="invoiced").length} ready`, icon: Wrench, accent: "text-sky-400" },
            { label: "Flagged Hrs", value: `${totalFlagged.toFixed(1)}h`, sub: `Target ${totalCapacityHrs}h • ${avgEfficiency}% eff • live`, icon: Timer, accent: "text-amber-400" },
            { label: "MPI Close Rate", value: selectedRO ? `${selectedRO.mpiItems.length ? Math.round((mpiStats.approvedCount / selectedRO.mpiItems.length)*100) : 68}%` : "68%", sub: `${mpiStats.approvedCount} approved • live from RO`, icon: TrendUp, accent: "text-violet-400" },
          ].map((k) => (
            <div key={k.label} className="col-span-6 lg:col-span-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur p-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase">{k.label}</div>
                <div className="text-2xl font-black tracking-tight mt-1">{k.value}</div>
                <div className="text-[11px] text-zinc-500 font-medium">{k.sub}</div>
              </div>
              <div className={`h-10 w-10 rounded-xl bg-white/[0.06] border border-white/[0.06] grid place-items-center ${k.accent}`}>
                <k.icon className="h-5 w-5" weight="duotone" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bento grid ── */}
      <div className="max-w-[1440px] mx-auto px-6 pb-10">
        <div className="grid grid-cols-12 gap-4 auto-rows-min">

          {/* Appointment Board */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="col-span-12 lg:col-span-8 rounded-[20px] border border-white/[0.06] bg-zinc-900/60 backdrop-blur overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white text-black grid place-items-center"><CalendarDots className="h-4 w-4" weight="bold" /></div>
                <div>
                  <div className="text-sm font-bold tracking-tight">Appointment Board — Today</div>
                  <div className="text-xs text-zinc-400 font-medium">Capacity-aware • Op-code lanes • Hold for AI re-balance</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold tracking-widest">
                  <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Express 3/4</span>
                  <span className="opacity-20">•</span>
                  <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sky-500" />Mainline 4/6</span>
                  <span className="opacity-20">•</span>
                  <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-violet-500" />Diag 1/2</span>
                </div>
                <span className="inline-flex items-center rounded-full bg-emerald-500 text-black text-[11px] font-black px-2.5 py-1">OPEN {Math.max(0, 6 - appointments.filter(a=> a.status!=="cancelled" && a.status!=="no_show").length)} SLOTS</span>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.06] bg-white/[0.02]">
              {(["Express", "Mainline", "Diag"] as const).map((lane) => {
                const laneAppts = appointments.filter((a) => laneForAppt(a) === lane)
                return (
                <div key={lane} className="col-span-12 lg:col-span-4">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${laneColor(lane)}`} />
                      <span className="text-xs font-black tracking-widest uppercase">{lane}</span>
                      <span className="text-[11px] text-zinc-500 font-mono">{laneAppts.length} booked</span>
                    </div>
                    <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-white/10 border border-white/10">{lane === "Express" ? "45m" : lane === "Mainline" ? "90m" : "120m"} avg</span>
                  </div>
                  <div className="px-3 pb-3 space-y-2">
                    {laneAppts.map((a) => {
                      const meta = apptStatusMeta[a.status] ?? apptStatusMeta.scheduled
                      const hasRO = Boolean(a.roId)
                      return (
                      <div key={a.id} className={`group relative rounded-xl border px-3 py-2.5 flex gap-3 items-center transition ${a.customerName.includes("Waitlist") ? "border-dashed border-white/15 bg-white/[0.02]" : "bg-zinc-900 border-white/[0.06] hover:border-white/15 hover:bg-zinc-800"}`}>
                        <div className="text-center min-w-[56px]">
                          <div className="text-xs font-black font-mono">{fmtTime(a.scheduledAt)}</div>
                          <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-1 inline-flex border ${meta.color}`}>{meta.label}</div>
                        </div>
                        <div className="h-10 w-px bg-white/10" />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold leading-none truncate">{a.customerName} {a.transport === "waiter" && <span className="ml-1 inline-flex text-[9px] font-black tracking-widest bg-amber-500 text-black px-1 rounded">WAITER</span>}</div>
                          <div className="text-[11px] text-zinc-400 truncate">{vehicleLabel(a.vehicle)} • {a.vehicle.mileage.toLocaleString()} mi</div>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-[10px] font-mono font-bold bg-white text-black px-1.5 py-0.5 rounded">{a.servicesRequested[0] ?? a.concern.slice(0,18)}</span>
                            <span className="text-[11px] text-zinc-400 truncate hidden xl:inline">{a.concern.slice(0,22)}</span>
                            <span className="ml-auto text-[11px] text-zinc-500">{a.advisor}</span>
                          </div>
                          {!hasRO && a.status !== "no_show" && a.status !== "cancelled" && (
                            <button
                              onClick={() => handleCreateRO(a.id)}
                              className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-white text-black text-[11px] font-bold px-2.5 py-1 hover:bg-zinc-100 transition"
                            >
                              <Wrench className="h-3 w-3" weight="bold" /> Create RO
                            </button>
                          )}
                          {hasRO && (
                            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-500 text-black text-[11px] font-bold px-2.5 py-1">
                              <CheckCircle className="h-3 w-3" weight="bold" /> {a.roId}
                            </span>
                          )}
                        </div>
                      </div>
                      )
                    })}
                    {laneAppts.length === 0 && (
                      <div className="rounded-xl border-2 border-dashed border-white/10 p-4 text-center">
                        <div className="text-xs font-semibold text-zinc-400">No appts</div>
                        <div className="text-[11px] text-zinc-500">AI will fill</div>
                      </div>
                    )}
                  </div>
                </div>
                )
              })}
            </div>

            <div className="px-5 py-3 bg-amber-500/10 border-t border-amber-500/20 flex items-center gap-3">
              <WarningCircle className="h-4 w-4 text-amber-400 shrink-0" weight="fill" />
              <p className="text-xs text-amber-200/90 font-medium">Capacity guard: Express is 88% — AI suggests moving 9:30 flex to Mainline or opening loaner slot.</p>
              <button onClick={() => setAiAccepted(true)} className="ml-auto hidden sm:inline-flex items-center gap-1 rounded-full bg-amber-500 text-black text-xs font-bold px-3 py-1.5 hover:bg-amber-400 transition">
                {aiAccepted ? <><Check className="h-3.5 w-3.5" weight="bold" /> Applied</> : <>Apply AI fix <CaretRight className="h-3 w-3" /></>}
              </button>
            </div>
          </motion.div>

          {/* AI Scheduling Suggestion */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.06 }} className="col-span-12 lg:col-span-4 rounded-[20px] border border-violet-500/20 bg-gradient-to-br from-violet-600/20 via-zinc-900 to-zinc-900 p-5 flex flex-col">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-violet-500 text-white grid place-items-center"><Sparkle className="h-4 w-4" weight="fill" /></div>
              <div>
                <div className="text-xs font-black tracking-widest text-violet-300 uppercase">AI Scheduling • E7</div>
                <div className="text-sm font-bold leading-none">Re-balance today for +5.4 hrs</div>
              </div>
              <span className="ml-auto text-[10px] font-bold tracking-widest bg-white text-black px-2 py-1 rounded-full">BETA</span>
            </div>

            <div className="mt-4 rounded-2xl bg-black/40 border border-white/10 p-4 space-y-3">
              <div className="flex gap-3">
                <div className="h-7 w-7 rounded-full bg-emerald-500 text-black grid place-items-center shrink-0 mt-0.5"><Lightning className="h-3.5 w-3.5" weight="fill" /></div>
                <div>
                  <div className="text-xs font-bold">Move Grace Kim (8:30 LOF) → Bay 3</div>
                  <div className="text-xs text-zinc-400 leading-relaxed">Tech Ortiz free at 9:15 • keeps waiter promise &lt; 90m. Alternative: push to 1pm loaner.</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-7 w-7 rounded-full bg-sky-500 text-white grid place-items-center shrink-0 mt-0.5"><Users className="h-3.5 w-3.5" weight="bold" /></div>
                <div>
                  <div className="text-xs font-bold">Offer 11:00 slot to waitlist • LOF $29 upsell</div>
                  <div className="text-xs text-zinc-400 leading-relaxed">2 waiters + 1 loaner open. Predicted 72% show for 11:00 flex.</div>
                </div>
              </div>
              <div className="h-px bg-white/10" />
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-white/[0.06] border border-white/10 py-2">
                  <div className="text-[11px] text-zinc-400 font-bold tracking-widest uppercase">Today flag</div>
                  <div className="text-sm font-black">+5.4h</div>
                </div>
                <div className="rounded-xl bg-white/[0.06] border border-white/10 py-2">
                  <div className="text-[11px] text-zinc-400 font-bold tracking-widest uppercase">Wait &lt; 90m</div>
                  <div className="text-sm font-black text-emerald-400">94%</div>
                </div>
                <div className="rounded-xl bg-white/[0.06] border border-white/10 py-2">
                  <div className="text-[11px] text-zinc-400 font-bold tracking-widest uppercase">CSI risk</div>
                  <div className="text-sm font-black">Low</div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={() => setAiAccepted((v) => !v)} className={`flex-1 rounded-full font-bold text-sm py-2.5 transition ${aiAccepted ? "bg-white text-black" : "bg-violet-500 text-white hover:bg-violet-400"}`}>
                {aiAccepted ? "✓ Accepted — bay updated" : "Accept & re-assign"}
              </button>
              <button className="rounded-full bg-white/10 border border-white/10 text-white font-semibold text-sm px-4">Dismiss</button>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium"><Clock className="h-3.5 w-3.5" /> Auto re-evaluates every 5 min or on RO close</div>
          </motion.div>

          {/* RO List */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }} className="col-span-12 lg:col-span-5 rounded-[20px] border border-white/[0.06] bg-zinc-900/60 backdrop-blur overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-white text-black grid place-items-center"><Wrench className="h-4 w-4" weight="bold" /></div>
                  <div>
                    <div className="text-sm font-bold">Repair Orders</div>
                    <div className="text-xs text-zinc-400">F4 • Status pipeline</div>
                  </div>
                </div>
                <span className="text-xs font-mono bg-white text-black px-2 py-1 rounded-full font-bold">{filteredRos.length} open</span>
              </div>

              <div className="mt-3 flex gap-1.5 flex-wrap">
                {(["all", "open", "in_progress", "waiting_approval", "waiting_parts", "completed"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilter(s as string)}
                    className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize border transition ${filter === s ? "bg-white text-black border-white" : "bg-white/[0.06] text-zinc-300 border-white/10 hover:bg-white/10"}`}
                  >
                    {s.replace(/_/g, " ")}
                  </button>
                ))}
              </div>

              <div className="mt-3 relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search RO, customer, plate…" className="w-full rounded-full bg-black/40 border border-white/10 pl-9 pr-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50" />
              </div>
            </div>

            <div className="divide-y divide-white/[0.06] max-h-[560px] overflow-auto">
              {filteredRos.map((r) => {
                const meta = storeStatusMeta[r.status] ?? storeStatusMeta.open
                const isSel = r.id === selectedRO?.id
                const mpiDone = r.mpiItems.filter((m) => getDecision(m) !== "pending").length
                const mpiTotal = r.mpiItems.length
                const flagged = r.dispatch?.flaggedHours ?? 0
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRoId(r.id)}
                    className={`w-full text-left px-4 py-3.5 flex gap-3 hover:bg-white/[0.04] transition relative ${isSel ? "bg-violet-500/10" : ""}`}
                  >
                    {isSel && <span className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500" />}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black tracking-widest">{r.roNumber}</span>
                        {/* Status pill wires to updateROStatus — cycles open → in_progress → waiting_approval → completed */}
                        <span
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStatusClick(r.id, r.status)
                          }}
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold cursor-pointer hover:brightness-110 transition ${meta.color}`}
                          title="Click to advance status: open → in_progress → waiting_approval → completed"
                        >
                          <meta.icon className="h-3 w-3" weight="bold" /> {meta.label}
                        </span>
                        {r.type !== "customer_pay" && <span className={`text-[10px] font-black tracking-widest px-1.5 py-0.5 rounded ${r.type === "warranty" ? "bg-amber-500 text-black" : r.type === "recall" ? "bg-violet-500 text-white" : "bg-sky-500 text-white"}`}>{r.type.toUpperCase()}</span>}
                        {(r as unknown as { loanerVehicleId?: string }).loanerVehicleId && <span className="inline-flex items-center gap-1 rounded-full bg-sky-500 text-white text-[10px] font-black px-1.5 py-0.5"><Car className="h-3 w-3" weight="bold" /> {(r as unknown as { loanerVehicleId?: string }).loanerVehicleId} • {loanerFleet.find(l=> l.id===(r as unknown as { loanerVehicleId?: string }).loanerVehicleId)?.model.split(" ").slice(1,3).join(" ") ?? "loaner"}</span>}
                        {(r.mpiItems as unknown as { id: string }[]).some(m=> m.id.startsWith("TIRE-")) && <span className="inline-flex items-center gap-1 rounded-full bg-white text-black text-[10px] font-black px-1.5 py-0.5"><Tire className="h-3 w-3" weight="bold" /> Tires</span>}
                      </div>
                      <div className="text-sm font-semibold mt-1">{r.customerName} <span className="text-zinc-500 font-normal">• {vehicleLabel(r.vehicle)} • {r.vehicle.mileage.toLocaleString()} mi</span></div>
                      <div className="text-xs text-zinc-400 mt-1 line-clamp-1">{r.concern} • Adv: {r.advisor} {r.technicianName ? `• Tech: ${r.technicianName}` : "• Unassigned"}</div>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono bg-white/10 border border-white/10 px-1.5 py-0.5 rounded"><Clock className="h-3 w-3" /> Promise {r.promisedAt ? fmtTime(r.promisedAt) : "—"}</span>
                        <span className="text-[11px] text-zinc-500">{flagged}h flagged</span>
                        {(r as unknown as { loanerVehicleId?: string }).loanerVehicleId && <span className="inline-flex items-center gap-1 rounded-full bg-white text-black text-[11px] font-bold px-2 py-0.5"><ClipboardText className="h-3 w-3" /> Manifest: {(r as unknown as { loanerVehicleId?: string }).loanerVehicleId} • {loanerFleet.find(l=> l.id===(r as unknown as { loanerVehicleId?: string }).loanerVehicleId)?.fuel ?? "Full"}</span>}
                        <span className="ml-auto text-[11px] font-medium flex items-center gap-1"><span className="h-1.5 w-8 rounded-full bg-white/10 overflow-hidden inline-block"><span className="block h-full bg-emerald-500" style={{ width: `${mpiTotal ? (mpiDone / mpiTotal) * 100 : 0}%` }} /></span> MPI {mpiDone}/{mpiTotal}</span>
                      </div>
                    </div>
                    <CaretRight className={`h-4 w-4 shrink-0 self-center transition ${isSel ? "text-violet-400" : "text-zinc-600 group-hover:text-zinc-400"}`} />
                  </button>
                )
              })}
            </div>
            <div className="mt-auto px-4 py-3 bg-white/[0.03] border-t border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-medium">Pipeline: open → in_progress → waiting_approval → completed</span>
              <span className="font-mono text-zinc-300">{ros.filter((r) => r.status === "waiting_approval").length} awaiting SMS</span>
            </div>
          </motion.div>

          {/* Dispatch Board */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="col-span-12 lg:col-span-7 rounded-[20px] border border-white/[0.06] bg-zinc-900/60 backdrop-blur overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white text-black grid place-items-center"><Users className="h-4 w-4" weight="bold" /></div>
                <div>
                  <div className="text-sm font-bold">Dispatch Board</div>
                  <div className="text-xs text-zinc-400">Tech columns • flag time • skill match</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white text-black font-bold px-2.5 py-1"><Timer className="h-3.5 w-3.5" /> {totalFlagged.toFixed(1)} / {totalCapacityHrs}h dispatched • {avgEfficiency}% eff</span>
                <button className="h-8 w-8 grid place-items-center rounded-full bg-white/10 border border-white/10"><DotsThree className="h-4 w-4" weight="bold" /></button>
              </div>
            </div>

            <div className="grid grid-cols-12 divide-x divide-white/[0.06] min-h-[520px]">
              {techs.map((t) => {
                const techROs = ros.filter((r) => r.technicianId === t.id)
                const eff = t.hoursClockedMTD ? Math.round((t.hoursFlaggedMTD / t.hoursClockedMTD) * 100) : 0
                const barPct = t.hoursClockedMTD ? Math.min(100, (t.hoursFlaggedMTD / t.hoursClockedMTD) * 100) : (t.hoursFlaggedMTD / 8) * 100
                const isAvailable = techROs.length < t.maxBays
                return (
                <div key={t.id} className={`col-span-6 lg:col-span-3 flex flex-col ${techROs.length===0 ? "bg-white/[0.02]" : ""}`}>
                  <div className="px-3 py-3 border-b border-white/[0.06] bg-white/[0.03]">
                    <div className="flex items-center gap-2">
                      <div className={`h-8 w-8 rounded-full grid place-items-center text-xs font-black border ${!isAvailable ? "bg-amber-500 text-black border-amber-500" : "bg-emerald-500 text-black border-emerald-500"}`}>{initialsFromName(t.name)}</div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold leading-none truncate">{t.name}</div>
                        <div className="text-[11px] text-zinc-400 truncate">{t.certifications.join(" • ") || "Drop RO to assign"}</div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-sky-500 transition-all duration-700" style={{ width: `${Math.min(100, barPct)}%` }} />
                      </div>
                      <span className="text-[11px] font-mono font-bold">{t.hoursFlaggedMTD.toFixed(1)}h / {t.hoursClockedMTD.toFixed(1)}h</span>
                    </div>
                    <div className="mt-1 flex gap-1 flex-wrap items-center">
                      {t.certifications.slice(0, 2).map((s) => (
                        <span key={s} className="text-[10px] font-bold tracking-widest bg-white text-black px-1.5 py-0.5 rounded">{s}</span>
                      ))}
                      <span className={`text-[10px] font-bold tracking-widest px-1.5 py-0.5 rounded ${eff >= 100 ? "bg-violet-500 text-white" : eff >= 90 ? "bg-emerald-500 text-black" : "bg-zinc-700 text-zinc-200"}`}>{eff}% EFF</span>
                      {!isAvailable && <span className="text-[10px] font-bold tracking-widest bg-amber-500 text-black px-1.5 py-0.5 rounded">● BUSY</span>}
                      {isAvailable && <span className="text-[10px] font-bold tracking-widest bg-emerald-500 text-black px-1.5 py-0.5 rounded">● READY</span>}
                    </div>
                  </div>

                  <div className="flex-1 p-2 space-y-2">
                    {techROs.length === 0 ? (
                      <div className="h-full min-h-[120px] rounded-xl border-2 border-dashed border-white/10 grid place-items-center p-4 text-center">
                        <div>
                          <div className="mx-auto h-8 w-8 rounded-full bg-white/10 grid place-items-center"><Package className="h-4 w-4 text-zinc-400" /></div>
                          <div className="text-xs font-semibold mt-2 text-zinc-300">No jobs queued</div>
                          <div className="text-[11px] text-zinc-500">Drag RO here or auto-assign</div>
                        </div>
                      </div>
                    ) : (
                      techROs.map((r) => {
                        const m = storeStatusMeta[r.status] ?? storeStatusMeta.open
                        return (
                          <div key={r.id} className="rounded-xl bg-zinc-950 border border-white/10 p-3 hover:border-white/20 transition">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black">{r.roNumber}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${m.color}`}>{m.label}</span>
                            </div>
                            <div className="text-xs font-medium mt-1 line-clamp-1">{r.concern.slice(0,28)}</div>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="inline-flex items-center gap-1 text-[11px] font-mono bg-white text-black px-1.5 py-0.5 rounded font-bold"><Flag className="h-3 w-3" /> {r.dispatch?.flaggedHours ?? 0}h</span>
                              <span className="text-[11px] text-zinc-500">{r.dispatch?.bay ?? `Bay ${r.roNumber.slice(-1)}`}</span>
                            </div>
                            {r.status === "waiting_approval" && (
                              <div className="mt-2 rounded-lg bg-amber-500/15 border border-amber-500/20 px-2 py-1.5 flex items-center gap-1.5">
                                <Hourglass className="h-3 w-3 text-amber-400" weight="bold" />
                                <span className="text-[11px] font-bold text-amber-200">Waiting customer auth</span>
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                    <button className="w-full rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/10 text-xs font-semibold py-2 flex items-center justify-center gap-1">
                      <ArrowRight className="h-3 w-3" /> Dispatch next
                    </button>
                  </div>
                </div>
                )
              })}
            </div>

            <div className="px-4 py-3 border-t border-white/[0.06] bg-white/[0.03] flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-500" /> Flag hrs live from RO labor ops • +2.5h on complete</span>
              <span className="opacity-20">•</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-violet-500" /> Skill match boosts first-time fix • {avgEfficiency}% avg eff</span>
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-white text-black font-bold px-2.5 py-1"><Sparkle className="h-3 w-3" /> Auto-dispatch enabled</span>
            </div>
          </motion.div>

          {/* ── E7-T11 Loaner Fleet • Shuttle + Agreement — Live ── */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.11 }} className="col-span-12 lg:col-span-8 rounded-[20px] border border-white/[0.06] bg-zinc-900/60 backdrop-blur overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-zinc-100 text-zinc-900 grid place-items-center"><Car className="h-4 w-4" weight="bold" /></div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold tracking-tight">Loaner Fleet</span>
                    <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-white text-black text-[10px] font-bold px-2 py-0.5 tracking-widest">E7-T11</span>
                    <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500 text-black text-[11px] font-black px-2 py-1">{loanerFleet.filter(l=>l.status==="available").length} available • 6 total</span>
                  </div>
                  <div className="text-xs text-zinc-400">Fleet tracking • agreements • fuel/damage capture • shuttle queue</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-white/[0.06] border border-white/10 px-2.5 py-1 text-[11px] font-medium"><Van className="h-3.5 w-3.5 text-zinc-300" /> Shuttle • {shuttleRides.filter(s=>s.status!=="completed").length} active</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-500 text-white text-[11px] font-black px-2.5 py-1"><ShieldCheck className="h-3.5 w-3.5" weight="bold" /> Manifest live</span>
              </div>
            </div>

            {/* Loaner grid — 6 loaners */}
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {loanerFleet.map((l) => {
                const isSelected = selectedLoanerId === l.id
                const statusMeta = l.status === "available" ? { label: "Available", color: "bg-emerald-500 text-black" } : l.status === "on_loan" ? { label: "On loan", color: "bg-sky-500 text-white" } : { label: "Maintenance", color: "bg-amber-500 text-black" }
                const isAvailable = l.status === "available"
                const isOnLoan = l.status === "on_loan"
                const linkedRO = l.roId ? ros.find(r=> r.id===l.roId) : null
                const selectedROHasLoaner = (selectedRO as unknown as { loanerVehicleId?: string })?.loanerVehicleId === l.id
                return (
                  <button
                    key={l.id}
                    onClick={() => {
                      setSelectedLoanerId(l.id)
                      setAgreementFuel(l.fuel)
                      setAgreementDamage(l.damage ?? "")
                    }}
                    className={`text-left rounded-2xl border p-3 flex flex-col gap-2 transition relative overflow-hidden ${isSelected ? "border-white bg-white text-zinc-900 shadow-lg" : "border-white/10 bg-black/30 hover:border-white/20 hover:bg-zinc-800/60 text-zinc-100"}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black tracking-widest ${isSelected ? "bg-zinc-900 text-white" : statusMeta.color}`}>{statusMeta.label}</span>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${isSelected ? "bg-zinc-900 text-white" : "bg-white/10 border border-white/10"}`}>{l.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`h-8 w-8 rounded-xl grid place-items-center shrink-0 ${isSelected ? "bg-zinc-900 text-white" : "bg-white/10 border border-white/10"}`}><Car className="h-4 w-4" weight="bold" /></div>
                      <div className="min-w-0">
                        <div className={`text-xs font-black leading-none truncate ${isSelected ? "text-zinc-900" : "text-white"}`}>{l.model}</div>
                        <div className={`text-[11px] font-mono ${isSelected ? "text-zinc-500" : "text-zinc-400"}`}>{l.plate} • Odo {l.odoOut?.toLocaleString() ?? "—"} mi</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${isSelected ? "bg-zinc-100 border border-zinc-200 text-zinc-700" : "bg-white/10 border border-white/10 text-zinc-300"}`}><GasPump className="h-3 w-3" /> {l.fuel}</span>
                      {l.damage ? (
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold border ${isSelected ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-amber-500/15 border-amber-500/20 text-amber-300"}`}><WarningCircle className="h-3 w-3" weight="bold" /> Damage</span>
                      ) : (
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${isSelected ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-emerald-500/15 border border-emerald-500/20 text-emerald-300"}`}><CheckCircle className="h-3 w-3" weight="bold" /> Clean</span>
                      )}
                      {isOnLoan && l.roId && <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${isSelected ? "bg-sky-100 border border-sky-200 text-sky-800" : "bg-sky-500 text-white"}`}>{l.roId}</span>}
                    </div>
                    {/* Assign button — updates RO loanerVehicleId and shows manifest */}
                    {isAvailable ? (
                      <span
                        onClick={(e) => {
                          e.stopPropagation()
                          if (!selectedRO) return
                          assignLoanerToRO(l.id, selectedRO.id)
                          setShowManifestFor(l.id)
                        }}
                        className={`mt-1 inline-flex items-center justify-center gap-1.5 rounded-full text-xs font-black px-3 py-2 border transition ${selectedROHasLoaner ? "bg-emerald-500 border-emerald-500 text-white" : isSelected ? "bg-zinc-900 text-white border-zinc-900 hover:bg-black" : "bg-white text-black border-white hover:bg-zinc-100"}`}
                      >
                        {selectedROHasLoaner ? <><CheckCircle className="h-3.5 w-3.5" weight="fill" /> Assigned to {selectedRO?.roNumber}</> : <><ArrowRight className="h-3.5 w-3.5" /> Assign to {selectedRO?.roNumber ?? "RO"}</>}
                      </span>
                    ) : isOnLoan ? (
                      <span className={`mt-1 inline-flex items-center gap-1 rounded-full text-[11px] font-bold px-3 py-1.5 border ${isSelected ? "bg-sky-50 border-sky-200 text-sky-800" : "bg-sky-500/15 border-sky-500/20 text-sky-300"}`}>
                        <ClipboardText className="h-3 w-3" /> On loan {linkedRO ? `• ${linkedRO.customerName}` : ""} • manifest ↓
                      </span>
                    ) : (
                      <span className={`mt-1 inline-flex items-center gap-1 rounded-full text-[11px] font-bold px-3 py-1.5 border ${isSelected ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-amber-500/15 border-amber-500/20 text-amber-300"}`}>
                        <Wrench className="h-3 w-3" /> Blocked — maintenance
                      </span>
                    )}
                    {selectedROHasLoaner && (
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${isSelected ? "bg-emerald-600 text-white" : "bg-emerald-500 text-black"}`}>● Manifest live • fuel {l.fuel}</span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Agreement mock — fuel/damage capture */}
            <div className="mx-4 mb-3 rounded-2xl border border-white/10 bg-black/40 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-xl bg-white text-black grid place-items-center"><ClipboardText className="h-3.5 w-3.5" weight="bold" /></div>
                  <div>
                    <div className="text-xs font-black">Agreement • fuel / damage capture</div>
                    <div className="text-[11px] text-zinc-400">Mock agreement for {loanerFleet.find(l=>l.id===selectedLoanerId)?.model ?? "loaner"} • {selectedLoanerId} • RO {selectedRO?.roNumber ?? "—"}</div>
                  </div>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-white text-black text-[11px] font-bold px-2.5 py-1"><FileText className="h-3 w-3" /> LOAN-AGMT-{selectedLoanerId}</span>
              </div>
              <div className="p-4 grid grid-cols-12 gap-3">
                <div className="col-span-12 lg:col-span-5 space-y-3">
                  <div>
                    <div className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase">Selected loaner</div>
                    <div className="mt-1 flex items-center gap-2 rounded-xl bg-white text-black px-3 py-2">
                      <Car className="h-4 w-4" weight="bold" />
                      <span className="text-sm font-black">{loanerFleet.find(l=>l.id===selectedLoanerId)?.model ?? "—"}</span>
                      <span className="ml-auto text-xs font-mono bg-zinc-900 text-white px-2 py-0.5 rounded-full">{selectedLoanerId}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {loanerFleet.filter(l=> l.status==="available").slice(0,3).map(l=> (
                        <button key={l.id} onClick={()=> { setSelectedLoanerId(l.id); setAgreementFuel(l.fuel); setAgreementDamage(l.damage ?? "")}} className={`rounded-full px-2.5 py-1 text-[11px] font-bold border transition ${selectedLoanerId===l.id ? "bg-white text-black border-white" : "bg-white/10 border-white/10 text-zinc-300 hover:bg-white/15"}`}>{l.id} • {l.model.split(" ")[1]}</button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="rounded-xl bg-white/[0.06] border border-white/10 p-2.5">
                      <div className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-1"><GasPump className="h-3 w-3" /> Fuel out</div>
                      <select value={agreementFuel} onChange={(e)=> setAgreementFuel(e.target.value)} className="mt-1 w-full rounded-full bg-white text-black text-sm font-bold px-2.5 py-1.5 focus:outline-none">
                        <option>Full</option><option>7/8</option><option>3/4</option><option>1/2</option><option>1/4</option><option>Empty</option>
                      </select>
                    </label>
                    <label className="rounded-xl bg-white/[0.06] border border-white/10 p-2.5">
                      <div className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase">Plate • Odo out</div>
                      <div className="mt-1 rounded-full bg-white text-black text-sm font-mono font-bold px-3 py-1.5">{loanerFleet.find(l=>l.id===selectedLoanerId)?.plate ?? "SOV-101"} • {(loanerFleet.find(l=>l.id===selectedLoanerId)?.odoOut ?? 0).toLocaleString()} mi</div>
                    </label>
                  </div>
                  <label className="block rounded-xl bg-white/[0.06] border border-white/10 p-2.5">
                    <div className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-1"><WarningCircle className="h-3 w-3" /> Damage capture</div>
                    <textarea value={agreementDamage} onChange={(e)=> setAgreementDamage(e.target.value)} placeholder="Walk-around notes • front bumper, wheels, interior • photo logged" className="mt-1 w-full rounded-xl bg-white text-zinc-900 text-sm p-2.5 min-h-[64px] placeholder:text-zinc-400 focus:outline-none" />
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-zinc-500"><Camera className="h-3 w-3" /> Photos required if damage • logged to agreement</div>
                  </label>
                  <div className="flex gap-2">
                    <button onClick={()=> updateLoanerAgreement(selectedLoanerId, agreementFuel, agreementDamage || null)} className="flex-1 rounded-full bg-white text-black font-bold text-sm py-2.5 hover:bg-zinc-100 transition">Save capture</button>
                    <button
                      onClick={() => {
                        const l = loanerFleet.find(x=> x.id===selectedLoanerId)
                        if (!l || l.status !== "on_loan") return
                        returnLoaner(selectedLoanerId, agreementFuel, agreementDamage || null)
                      }}
                      className="rounded-full bg-amber-500 text-black font-black text-sm px-4 py-2.5 hover:bg-amber-400 transition disabled:opacity-40"
                      disabled={loanerFleet.find(l=>l.id===selectedLoanerId)?.status !== "on_loan"}
                    >
                      Return • check-in
                    </button>
                  </div>
                  <div className="text-[11px] text-zinc-500 leading-relaxed">Agreement mock • fuel/damage captured at out & in • signature on file • RO link creates manifest • return triggers inspection</div>
                </div>
                <div className="col-span-12 lg:col-span-7 flex flex-col gap-3">
                  {/* Manifest preview */}
                  <div className="rounded-2xl bg-white text-zinc-900 overflow-hidden border border-zinc-200">
                    <div className="px-4 py-3 bg-zinc-900 text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" weight="bold" />
                        <span className="text-xs font-black tracking-widest uppercase">Loaner Manifest</span>
                        <span className="hidden sm:inline-flex rounded-full bg-white text-black text-[10px] font-bold px-2 py-0.5">LOAN-MANIFEST</span>
                      </div>
                      <span className="text-[11px] font-mono bg-white/10 border border-white/20 px-2 py-0.5 rounded-full">{selectedLoanerId} → {selectedRO?.roNumber ?? "RO-—"}</span>
                    </div>
                    <div className="p-4 space-y-3">
                      {(() => {
                        const sel = loanerFleet.find(l=>l.id===selectedLoanerId)
                        const manifestRO = sel?.roId ? ros.find(r=> r.id===sel.roId) : selectedRO
                        const hasManifest = Boolean(sel?.roId || (selectedRO as unknown as { loanerVehicleId?: string })?.loanerVehicleId)
                        return (
                          <>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-3">
                                <div className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase">Loaner</div>
                                <div className="font-black">{sel?.model ?? "—"} • {sel?.id}</div>
                                <div className="text-zinc-500">{sel?.plate} • {sel?.fuel} • {sel?.damage ? "Damage logged" : "No damage"}</div>
                              </div>
                              <div className="rounded-xl bg-zinc-900 text-white p-3">
                                <div className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase">Customer • RO</div>
                                <div className="font-bold">{manifestRO?.customerName ?? "—"}</div>
                                <div className="text-zinc-400 text-[11px]">{manifestRO?.roNumber ?? "—"} • {(manifestRO as unknown as { loanerVehicleId?: string })?.loanerVehicleId ? `loaner ${(manifestRO as unknown as { loanerVehicleId?: string }).loanerVehicleId}` : sel?.roId ? `loaner ${sel.id}` : "no loaner yet"} • Due {manifestRO?.promisedAt ? fmtTime(manifestRO.promisedAt) : "—"}</div>
                              </div>
                            </div>
                            <div className="rounded-xl border border-zinc-200 p-3 grid grid-cols-3 gap-2 text-center">
                              <div><div className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase">Fuel out</div><div className="font-mono font-black">{sel?.fuel ?? agreementFuel}</div></div>
                              <div><div className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase">Fuel in</div><div className="font-mono font-black">{sel?.status==="on_loan" ? sel.fuel : "—"}</div></div>
                              <div><div className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase">Mileage</div><div className="font-mono font-black">{sel?.odoOut?.toLocaleString() ?? "—"} → {sel?.odoIn ? sel.odoIn.toLocaleString() : "—"}</div></div>
                            </div>
                            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                              <div className="text-xs font-black flex items-center gap-1"><WarningCircle className="h-3.5 w-3.5 text-amber-600" weight="bold" /> Damage on agreement</div>
                              <div className="text-xs text-zinc-700 mt-1">{sel?.damage || agreementDamage || "No damage reported • walk-around clean • photos on file"}</div>
                            </div>
                            {hasManifest ? (
                              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2">
                                <CheckCircle className="h-4 w-4 text-emerald-600" weight="fill" />
                                <span className="text-xs font-bold text-emerald-800">Manifest live • RO {(manifestRO as unknown as { loanerVehicleId?: string })?.loanerVehicleId ? manifestRO?.roNumber : sel?.roId ? sel.roId : selectedRO?.roNumber} now shows loaner {hasManifest ? (sel?.id ?? (selectedRO as unknown as { loanerVehicleId?: string })?.loanerVehicleId) : ""} • printable</span>
                                <button onClick={()=> setShowManifestFor(showManifestFor ? null : (sel?.id ?? null))} className="ml-auto rounded-full bg-zinc-900 text-white text-[11px] font-bold px-3 py-1.5">{showManifestFor ? "Hide" : "View"} manifest</button>
                              </div>
                            ) : (
                              <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-3 text-center">
                                <div className="text-xs font-bold text-zinc-600">No manifest yet — assign an available loaner to {selectedRO?.roNumber ?? "RO"} to generate</div>
                                <button onClick={()=> { const avail = loanerFleet.find(l=> l.status==="available"); if(avail && selectedRO) { assignLoanerToRO(avail.id, selectedRO.id); setSelectedLoanerId(avail.id); setShowManifestFor(avail.id) } }} className="mt-2 rounded-full bg-zinc-900 text-white text-xs font-bold px-3 py-1.5">Quick assign available → {selectedRO?.roNumber}</button>
                              </div>
                            )}
                            <AnimatePresence>
                              {showManifestFor && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                  <div className="rounded-xl border border-zinc-200 bg-zinc-900 text-white p-3 font-mono text-[11px] leading-relaxed">
                                    <div className="font-black tracking-widest">LOANER AGREEMENT MANIFEST</div>
                                    <div>Loaner: {sel?.id} • {sel?.model} • {sel?.plate} • VIN {sel?.id}-VIN</div>
                                    <div>RO: {manifestRO?.roNumber} • Customer: {manifestRO?.customerName} • Advisor: {manifestRO?.advisor}</div>
                                    <div>Vehicle: {(manifestRO?.vehicle as unknown as { year: number; make: string; model: string }) ? `${(manifestRO?.vehicle as unknown as { year: number; make: string; model: string }).year} ${(manifestRO?.vehicle as unknown as { year: number; make: string; model: string }).make} ${(manifestRO?.vehicle as unknown as { year: number; make: string; model: string }).model}` : "—"} • Mileage {(manifestRO?.vehicle as unknown as { mileage: number })?.mileage?.toLocaleString() ?? "—"}</div>
                                    <div>Fuel: {sel?.fuel} • Damage: {sel?.damage ?? "none"} • Odo out {sel?.odoOut} • Odo in {sel?.odoIn ?? "—"}</div>
                                    <div className="mt-2 h-px bg-white/10" />
                                    <div className="mt-2 flex items-center gap-2"><span className="rounded bg-white text-black px-1.5 py-0.5 font-black">SIGN</span> Customer ___________ • Advisor ___________ • {new Date().toLocaleString()}</div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                  {/* RO loaner badge live */}
                  <div className="rounded-2xl bg-zinc-900 border border-white/10 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5"><ClipboardText className="h-3.5 w-3.5" /> RO loaner link</span>
                      <span className="text-[11px] font-mono bg-white text-black px-2 py-0.5 rounded-full">{selectedRO?.roNumber} { (selectedRO as unknown as { loanerVehicleId?: string })?.loanerVehicleId ? `• ${ (selectedRO as unknown as { loanerVehicleId?: string }).loanerVehicleId }` : "• no loaner"}</span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-xl bg-white text-zinc-900 py-2 border border-zinc-200"><div className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Active loans</div><div className="font-black">{loanerFleet.filter(l=> l.status==="on_loan").length}/6</div></div>
                      <div className="rounded-xl bg-white/10 border border-white/10 py-2"><div className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Avail</div><div className="font-black text-white">{loanerFleet.filter(l=> l.status==="available").length}</div></div>
                      <div className="rounded-xl bg-amber-500 text-black py-2"><div className="text-[10px] font-black tracking-widest uppercase">Maint</div><div className="font-black">{loanerFleet.filter(l=> l.status==="maintenance").length}</div></div>
                    </div>
                    {(selectedRO as unknown as { loanerVehicleId?: string })?.loanerVehicleId && (
                      <div className="mt-2 rounded-xl bg-emerald-500 text-black px-3 py-2 flex items-center gap-2 text-xs font-bold"> <CheckCircle className="h-4 w-4" weight="fill" /> Manifest shows on RO • {(selectedRO as unknown as { loanerVehicleId?: string }).loanerVehicleId} • {loanerFleet.find(l=> l.id === (selectedRO as unknown as { loanerVehicleId?: string }).loanerVehicleId)?.model}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Shuttle queue — 3 rides */}
            <div className="px-4 pb-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-xl bg-sky-500 text-white grid place-items-center"><Van className="h-3.5 w-3.5" weight="bold" /></div>
                    <div>
                      <div className="text-xs font-black">Shuttle Queue • 3 rides</div>
                      <div className="text-[11px] text-zinc-400">Van 1 • Van 2 • queue → en-route → completed</div>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-white text-black text-[11px] font-bold px-2.5 py-1"><RoadHorizon className="h-3 w-3" /> Live ETA</span>
                </div>
                <div className="divide-y divide-white/10">
                  {shuttleRides.map((r) => {
                    const statusColor = r.status === "queued" ? "bg-amber-500 text-black" : r.status === "en_route" ? "bg-sky-500 text-white" : "bg-emerald-500 text-white"
                    return (
                      <div key={r.id} className="px-4 py-3 flex flex-wrap items-center gap-3">
                        <span className={`h-2 w-2 rounded-full ${r.status==="queued" ? "bg-amber-500" : r.status==="en_route" ? "bg-sky-500 animate-pulse" : "bg-emerald-500"}`} />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold">{r.customerName} • <span className="font-normal text-zinc-400">{r.pickup} → {r.dropoff}</span></div>
                          <div className="text-[11px] text-zinc-500">{r.driver ?? "Van 1"} • ETA {r.eta} • {r.id}</div>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${statusColor}`}>{r.status.replace("_"," ")}</span>
                        <div className="flex gap-1">
                          {r.status==="queued" && <button onClick={()=> dispatchShuttle(r.id)} className="rounded-full bg-white text-black text-xs font-bold px-3 py-1.5 hover:bg-zinc-100">Dispatch</button>}
                          {r.status==="en_route" && <button onClick={()=> completeShuttle(r.id)} className="rounded-full bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 hover:bg-emerald-400">Complete</button>}
                          {r.status==="completed" && <span className="rounded-full bg-white/10 border border-white/10 text-zinc-300 text-xs font-bold px-3 py-1.5">Completed ✓</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="px-4 py-2 bg-white/[0.03] border-t border-white/10 flex items-center gap-2 text-[11px] text-zinc-400">
                  <House className="h-3 w-3" /> Door-to-door • avg 14 min • 2 vans • queue live • no phone tag
                  <span className="ml-auto hidden sm:inline-flex items-center gap-1 rounded-full bg-white text-black font-bold px-2 py-0.5">ETA live</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── E8-T10 Tire Hub — Fitment by VIN • Sets 4+TPMS • EV-weighted ── */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.12 }} className="col-span-12 lg:col-span-4 rounded-[20px] border border-white/[0.06] bg-zinc-900/60 backdrop-blur overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-white text-zinc-900 grid place-items-center"><Tire className="h-4 w-4" weight="bold" /></div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">Tire Hub</span>
                    <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-white text-black text-[10px] font-bold px-2 py-0.5 tracking-widest">E8-T10</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-sky-500 text-white text-[11px] font-black px-2 py-1"><Tire className="h-3 w-3" weight="bold" /> EV §4.5</span>
                  </div>
                  <div className="text-xs text-zinc-400">Fitment by VIN • sets 4+TPMS • demand weighted</div>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3 flex-1">
              {/* VIN fitment */}
              <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
                <div className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase">VIN fitment</div>
                <div className="mt-2 flex gap-2">
                  <input value={tireVin} onChange={(e)=> setTireVin(e.target.value)} className="flex-1 rounded-full bg-white text-black font-mono text-sm font-bold px-3 py-2 focus:outline-none" placeholder="VIN" />
                  <span className="inline-flex items-center rounded-full bg-emerald-500 text-black text-xs font-black px-3">Verified</span>
                </div>
                <div className="mt-2 text-[11px] text-zinc-400">RAV4 225/60R18 • Camry 235/45R18 • Highlander 235/55R20 • auto-decoded</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {tireSets.map(ts => (
                    <button key={ts.id} onClick={()=> setTireVin(ts.vin)} className={`rounded-full px-2.5 py-1 text-[11px] font-bold border transition ${tireVin===ts.vin ? "bg-white text-black border-white" : "bg-white/10 border-white/10 text-zinc-300 hover:bg-white/15"}`}>{ts.size} • {ts.fitment.split("•")[0].trim()}</button>
                  ))}
                </div>
              </div>

              {/* Primary tire set — RAV4 225/60R18 requirement */}
              {(() => {
                const primary = tireSets.find(ts=> ts.vin===tireVin) ?? tireSets[0]
                const isPrimaryRAV4 = primary.size==="225/60R18"
                return (
                  <div className={`rounded-2xl border-2 overflow-hidden ${primary.evWeighted ? "border-sky-500/30 bg-sky-500/10" : "border-white/10 bg-white text-zinc-900"}`}>
                    <div className={`px-4 py-3 flex items-center justify-between ${primary.evWeighted ? "bg-sky-500 text-white" : "bg-zinc-900 text-white"}`}>
                      <div className="flex items-center gap-2">
                        <Tire className="h-4 w-4" weight="bold" />
                        <span className="text-xs font-black tracking-widest uppercase">{primary.size} • {primary.fitment.split("•")[0].trim()}</span>
                      </div>
                      {primary.evWeighted && <span className="inline-flex items-center gap-1 rounded-full bg-white text-sky-700 text-[11px] font-black px-2 py-0.5">EV-weighted • 47% EV §4.5</span>}
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-black">{primary.brand} • {primary.size}</div>
                          <div className="text-xs text-zinc-600">{primary.fitment}</div>
                          <div className="text-[11px] text-zinc-500 mt-1">{primary.includes} • VIN {primary.vin.slice(-8)} verified</div>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-black ${primary.stock>5 ? "bg-emerald-500 text-white" : primary.stock>0 ? "bg-amber-500 text-black" : "bg-red-500 text-white"}`}>{primary.stock} sets • stock</span>
                      </div>
                      <div className="rounded-xl bg-zinc-900 text-white p-3 flex items-center justify-between">
                        <div>
                          <div className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase">Set price</div>
                          <div className="text-xl font-black">${primary.price} <span className="text-sm font-medium text-zinc-400">/ set • 4 tires + TPMS</span></div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase">Stock</div>
                          <div className="font-mono font-black">{primary.stock ===12 ? "12 sets" : `${primary.stock} sets`} {primary.stock===12 && <span className="text-emerald-400">● in stock</span>}</div>
                        </div>
                      </div>
                      {isPrimaryRAV4 && <div className="rounded-xl bg-sky-50 border border-sky-200 p-2.5 text-xs font-medium text-sky-900">RAV4 225/60R18 is top fitment • EV-weighted demand +23% • 47% of EV service visits tire-related §4.5 • TPMS included</div>}
                      <button
                        onClick={()=> {
                          if (!selectedRO) return
                          addTireSetToRO(primary.id, selectedRO.id)
                          setTireAddedFlash(primary.id)
                          setTimeout(()=> setTireAddedFlash(null), 2400)
                        }}
                        disabled={primary.stock<=0 || !selectedRO}
                        className={`w-full rounded-full font-black py-3 flex items-center justify-center gap-2 transition ${primary.stock<=0 ? "bg-zinc-200 text-zinc-500 cursor-not-allowed" : "bg-white text-black border-2 border-zinc-900 hover:bg-zinc-900 hover:text-white"} ${primary.evWeighted ? "ring-2 ring-sky-500/20" : ""}`}
                      >
                        <Tire className="h-4 w-4" weight="bold" /> Add to {selectedRO?.roNumber ?? "RO"} • ${primary.price} set
                      </button>
                      <AnimatePresence>
                        {tireAddedFlash===primary.id && (
                          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="rounded-xl bg-emerald-500 text-white px-3 py-2 flex items-center gap-2 text-xs font-bold">
                            <CheckCircle className="h-4 w-4" weight="fill" /> Added • {primary.size} → {selectedRO?.roNumber} • stock {primary.stock} → {Math.max(0, primary.stock-1)} • MPI updated ✓
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-xl bg-zinc-50 border border-zinc-200 py-2"><div className="font-mono font-black text-sm">4</div><div className="text-[11px] text-zinc-500">tires</div></div>
                        <div className="rounded-xl bg-zinc-50 border border-zinc-200 py-2"><div className="font-mono font-black text-sm">4</div><div className="text-[11px] text-zinc-500">TPMS</div></div>
                        <div className="rounded-xl bg-zinc-900 text-white py-2"><div className="font-mono font-black text-sm">12</div><div className="text-[11px] text-zinc-400">sets stock</div></div>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Other sets compact */}
              <div className="space-y-2">
                {tireSets.filter(ts=> ts.vin !== tireVin).slice(0,2).map(ts=> (
                  <div key={ts.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white text-zinc-900 grid place-items-center shrink-0"><Tire className="h-5 w-5" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black">{ts.size} • {ts.brand}</div>
                      <div className="text-[11px] text-zinc-400 truncate">{ts.fitment}</div>
                      <div className="text-[11px] font-mono">Stock {ts.stock} • ${ts.price}</div>
                    </div>
                    <button onClick={()=> { if(selectedRO) { addTireSetToRO(ts.id, selectedRO.id); setTireAddedFlash(ts.id); setTimeout(()=> setTireAddedFlash(null), 2400) } }} className="rounded-full bg-white text-black text-xs font-bold px-3 py-1.5 hover:bg-zinc-100 shrink-0">+ RO</button>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-3 text-center">
                <div className="text-xs font-bold text-zinc-300">EV-weighted demand — 47% of EV service visits tire-related §4.5</div>
                <div className="text-[11px] text-zinc-500 mt-1">Prius/BZ4X heavier • torque • TPMS resets auto • mount/balance road-force included • add to RO posts to MPI live</div>
              </div>
            </div>
          </motion.div>

          {/* E10-T09 — Service Copilot — deferred + mileage-based */}
          {(() => {
            const serviceCopilots = copilotSuggestions.filter((c) => c.type === "service" && !c.dismissed)
            const acceptedSvc = copilotSuggestions.filter((c) => c.type === "service" && c.accepted)
            const totalSvcLift = acceptedSvc.reduce((s, c) => s + (c.expectedLift || 0), 0)
            const hasSvc = serviceCopilots.length > 0
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] as const, delay: 0.1 }}
                className="col-span-12 lg:col-span-8 rounded-[20px] border border-sky-500/20 bg-gradient-to-br from-sky-600/10 via-zinc-900/60 to-zinc-900/60 backdrop-blur overflow-hidden"
              >
                <div className="px-5 py-4 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-sky-500 text-white grid place-items-center">
                      <Sparkle className="h-4 w-4" weight="fill" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold tracking-tight">Service Copilot</span>
                        <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-white text-black text-[10px] font-bold px-2 py-0.5 tracking-widest">E10-T09</span>
                        <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500 text-black text-[11px] font-black px-2 py-1">+ $230 avg RO</span>
                      </div>
                      <div className="text-xs text-zinc-400">Deferred-work surfacing • mileage-based recommendations at write-up</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-white/[0.06] border border-white/10 px-2.5 py-1 text-[11px] font-medium">
                      <BookmarkSimple className="h-3.5 w-3.5 text-amber-400" /> Deferred VIN history
                    </span>
                    <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-sky-500 text-white text-[11px] font-black px-2.5 py-1">
                      <Gauge className="h-3.5 w-3.5" /> Mileage aware
                    </span>
                  </div>
                </div>
                {!hasSvc ? (
                  <div className="p-5">
                    <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-center">
                      <div className="text-xs font-semibold text-zinc-300">No active service suggestion</div>
                      <div className="mt-1 text-[11px] text-zinc-500">Surfaces deferred from last visit + mileage since — +$230 avg RO evidence</div>
                      <button
                        onClick={() => selectedRO && generateCopilotForRO(selectedRO.id)}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white text-black text-xs font-bold px-3 py-1.5 hover:bg-zinc-100 transition"
                      >
                        <Sparkle className="h-3.5 w-3.5" /> Generate for {selectedRO?.roNumber ?? "RO"}
                      </button>
                      {acceptedSvc.length > 0 && (
                        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500 text-black text-xs font-black px-3 py-1">
                          <TrendUp className="h-3.5 w-3.5" /> ROI • {acceptedSvc.length} accepted • +${totalSvcLift} avg lift
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {serviceCopilots.map((c) => {
                      const isForSelected = c.roId === selectedRO?.id
                      const targetRO = c.roId ? ros.find((r) => r.id === c.roId) : null
                      const lastMpiHint = targetRO ? `${targetRO.vehicle.mileage.toLocaleString()} mi` : "81,200 mi"
                      return (
                        <div key={c.id} className={`rounded-2xl border p-4 ${c.accepted ? "border-emerald-500/30 bg-emerald-500/10" : "border-white/10 bg-black/30"}`}>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-white text-black px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest">COP • {c.id}</span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 text-black text-[11px] font-black px-2 py-0.5">
                              <WarningCircle className="h-3 w-3" weight="fill" /> Deferred
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-sky-500 text-white text-[11px] font-bold px-2 py-0.5">
                              <Gauge className="h-3 w-3" /> {lastMpiHint} • mileage-based
                            </span>
                            <span className="ml-auto hidden sm:inline-flex items-center gap-1 rounded-full bg-white/[0.06] border border-white/10 px-2 py-0.5 text-[11px] font-medium text-zinc-300">
                              RO-8812 • VIN {targetRO?.vehicle.vin.slice(-6) ?? "084412"}
                            </span>
                            {c.accepted && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 text-white text-[11px] font-black px-2 py-0.5"><CheckCircle className="h-3 w-3" weight="fill" /> Accepted</span>}
                          </div>
                          <div className={`mt-3 rounded-xl px-3 py-2.5 font-mono text-[12px] font-bold leading-snug ${c.accepted ? "bg-emerald-500 text-white" : "bg-white text-black"}`}>
                            {c.suggestion}
                            <span className="ml-1.5 hidden text-[11px] font-medium opacity-60 sm:inline">• {targetRO?.customerName ?? "Grace Kim"} • deferred brake front 4mm • 11k mi since last RO-8812 • 81.2k mi current</span>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-400">
                            <span className="inline-flex items-center gap-1 rounded-full bg-white text-black px-2 py-1 font-mono text-[11px] font-bold">4mm front brake • RO-8812</span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] border border-white/10 px-2 py-1">+11k mi since • 81.2k now • due</span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 text-black px-2 py-1 font-bold">+ $230 avg RO evidence</span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] border border-white/10 px-2 py-1 text-zinc-300">
                              <Car className="h-3 w-3" /> {targetRO?.vehicle ? vehicleLabel(targetRO.vehicle) : "2018 Camry LE"}
                            </span>
                          </div>
                          {!c.accepted ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                onClick={() => {
                                  acceptCopilot(c.id)
                                  // Accept adds MPI item live via approveMpiItem — wire to selected RO
                                  const roId = c.roId ?? selectedRO?.id
                                  if (roId) {
                                    const updated = useStore.getState().repairOrders.find((r) => r.id === roId)
                                    const already = updated?.mpiItems.find((m) => (m as { id: string }).id === `MPI-COP-${roId}`)
                                    if (already) {
                                      const idx = updated!.mpiItems.findIndex((m) => (m as { id: string }).id === `MPI-COP-${roId}`)
                                      if (idx >= 0) approveMpiItem(roId, idx, true)
                                    } else {
                                      // fallback: ensure at least one pending item gets approved to show live update
                                      if (selectedRO && selectedRO.mpiItems.length > 0) {
                                        const pendingIdx = selectedRO.mpiItems.findIndex((m) => getDecision(m) === "pending" || getDecision(m) === "deferred")
                                        if (pendingIdx >= 0) approveMpiItem(selectedRO.id, pendingIdx, true)
                                      }
                                    }
                                  }
                                }}
                                className={`inline-flex items-center gap-1.5 rounded-full font-bold text-xs px-4 py-2 transition ${isForSelected ? "bg-white text-black hover:bg-zinc-100" : "bg-white/10 border border-white/10 text-white hover:bg-white/15"}`}
                                title={isForSelected ? "Add to MPI for selected RO live" : "Add to its RO • switch to that RO to see"}
                              >
                                <Check className="h-3.5 w-3.5" weight="bold" /> Add to MPI • +$230 avg
                              </button>
                              <button
                                onClick={() => dismissCopilot(c.id)}
                                className="rounded-full bg-white/10 border border-white/10 text-white font-semibold text-xs px-4 py-2 hover:bg-white/15 transition"
                              >
                                Dismiss
                              </button>
                              <span className="ml-auto hidden sm:inline-flex items-center gap-1 text-[11px] text-zinc-500">
                                {isForSelected ? "Adds MPI item live • approveMpiItem" : `For ${c.roId} • switch RO to see`}
                              </span>
                            </div>
                          ) : (
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 text-white text-xs font-bold px-3 py-1.5">
                                <CheckCircle className="h-3.5 w-3.5" weight="fill" /> Added to MPI • +$230 avg • live via approveMpiItem
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-black border border-white/10 text-zinc-300 text-xs font-medium px-3 py-1.5">
                                RO now {targetRO?.mpiItems.length ?? selectedRO?.mpiItems.length ?? "—"} items • MPI updated live
                              </span>
                              <button onClick={() => dismissCopilot(c.id)} className="ml-auto rounded-full bg-white/10 border border-white/10 text-white text-xs font-medium px-3 py-1.5 hover:bg-white/15">
                                Dismiss
                              </button>
                            </div>
                          )}
                          <div className="mt-2 text-[11px] leading-relaxed text-zinc-500">
                            Surfaces at write-up when VIN has deferred • auto-recall next visit • +$230 avg RO evidence (Tekion NADA precedent) • mileage 81.2k triggers pad check
                          </div>
                        </div>
                      )
                    })}
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-sky-500/20 bg-sky-500/10 px-3 py-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-300">
                        <TrendUp className="h-3.5 w-3.5" /> ROI • {acceptedSvc.length} accepted • {acceptedSvc.length === 0 ? "no lift yet" : `+$${totalSvcLift} avg per RO • evidence logged`}
                      </span>
                      <span className="text-[11px] text-zinc-400">Deferred follows VIN • mileage-based surfacing at every write-up • E10-T09</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })()}
          {/* Video MPI flow */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.12 }} className="col-span-12 lg:col-span-8 rounded-[20px] border border-white/[0.06] bg-zinc-900/60 backdrop-blur overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-red-500 text-white grid place-items-center"><VideoCamera className="h-4 w-4" weight="fill" /></div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">Video MPI • {selectedRO ? selectedRO.roNumber : "—"}</span>
                    <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-red-500 text-white text-[11px] font-black px-2 py-0.5"><span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> REC • ShopCam</span>
                  </div>
                  <div className="text-xs text-zinc-400">{selectedRO ? `${selectedRO.customerName} • ${vehicleLabel(selectedRO.vehicle)} • Tech: ${selectedRO.technicianName ?? "Unassigned"}` : "Select an RO"}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] border border-white/10 px-3 py-1.5 text-xs font-semibold"><Eye className="h-3.5 w-3.5" /> {mpiStats.pending} pending</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 text-black text-xs font-black px-3 py-1.5"><TrendUp className="h-3.5 w-3.5" /> Matrix pricing live</span>
              </div>
            </div>

            {/* ── E14-T07 P2 Voice-to-inspection-field — Technician-AI hold to record → pre-fill via store ── */}
            <div className="px-4 py-3 bg-zinc-950 border-b border-white/[0.06] flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onMouseDown={startVoice}
                    onMouseUp={endVoice}
                    onMouseLeave={() => { if(isRecording) endVoice() }}
                    onTouchStart={(e)=> { e.preventDefault(); startVoice() }}
                    onTouchEnd={(e)=> { e.preventDefault(); endVoice() }}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black tracking-wide transition select-none ${isRecording ? "bg-red-500 text-white animate-pulse shadow-[0_0_18px_rgba(239,68,68,0.6)]" : "bg-white text-black hover:bg-zinc-100 shadow"}`}
                  >
                    {isRecording ? (
                      <>
                        <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                        <Waveform className="h-3.5 w-3.5 animate-pulse" weight="bold" /> Recording — speak now • release to stop
                      </>
                    ) : (
                      <>
                        <Microphone className="h-3.5 w-3.5" weight="fill" /> Hold to record
                      </>
                    )}
                  </button>
                  <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/10 px-2.5 py-1 text-[11px] font-medium text-zinc-300">
                    <Phone className="h-3 w-3" weight="bold" /> Technician phone → MPI fields
                  </span>
                  <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-violet-500/15 border border-violet-500/20 text-violet-300 px-2 py-0.5 text-[10px] font-bold tracking-widest">E14-T07 P2 • live</span>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="hidden sm:inline text-[11px] text-zinc-500">Voice → inspection pre-fill • via store •</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/10 px-2 py-0.5 font-mono text-[10px] text-zinc-300">{selectedRO?.roNumber ?? "—"} • {voiceTranscripts.filter(v=> v.roId===selectedRO?.id).length} transcripts</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 text-black text-[10px] font-black px-2 py-0.5">via E9 API</span>
                </div>
              </div>

              {/* Transcript mock — live with actual voice transcript mock */}
              <AnimatePresence>
                {lastVoice && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 overflow-hidden"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-emerald-500/20 bg-emerald-500/15">
                      <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-300">
                        <CheckCircle className="h-3.5 w-3.5" weight="fill" /> Transcript • live mock • {lastVoice.text}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5">
                        {lastVoice.applied ? "Applied to MPI ✓" : "Pre-fills inspection fields via store"}
                      </span>
                    </div>
                    <div className="p-3">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="rounded-xl bg-zinc-900 border border-white/10 p-2.5">
                          <div className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Item</div>
                          <div className="text-sm font-black text-white">{lastVoice.parsed?.item ?? "—"}</div>
                          <div className="text-[11px] text-zinc-400">voice parsed</div>
                        </div>
                        <div className="rounded-xl bg-zinc-900 border border-white/10 p-2.5">
                          <div className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Measurement</div>
                          <div className="text-sm font-black text-white">{lastVoice.parsed?.measurement ?? "—"}</div>
                          <div className="text-[11px] text-zinc-400">+ spec Min 2mm</div>
                        </div>
                        <div className="rounded-xl bg-zinc-900 border border-white/10 p-2.5">
                          <div className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Labor</div>
                          <div className="text-sm font-black text-white">{lastVoice.parsed?.laborHours ?? "—"}h</div>
                          <div className="text-[11px] text-zinc-400">Op {lastVoice.parsed?.laborOp ?? "BRK-F-01"}</div>
                        </div>
                      </div>
                      <div className="mt-2.5 rounded-xl bg-white text-black p-2.5 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase">Pre-filled inspection fields</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900 text-white text-xs font-bold px-2.5 py-1">
                          {lastVoice.parsed?.item} {lastVoice.parsed?.measurement} • {lastVoice.parsed?.recommendation}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 text-black text-xs font-black px-2.5 py-1">{lastVoice.parsed?.laborHours}h • Op {lastVoice.parsed?.laborOp}</span>
                        <span className="ml-auto font-mono text-[11px] text-zinc-500">{lastVoice.viaE9Api}</span>
                      </div>
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {!lastVoice.applied ? (
                          <>
                            <button
                              onClick={handleApplyVoice}
                              className="inline-flex items-center gap-1.5 rounded-full bg-white text-black text-xs font-black px-4 py-2 hover:bg-zinc-100 transition shadow"
                            >
                              <CheckCircle className="h-3.5 w-3.5" weight="bold" /> Add to MPI • {lastVoice.parsed?.measurement} • ${lastVoice.parsed?.retailAmount ?? 289} • labor {lastVoice.parsed?.laborHours}h
                            </button>
                            <button
                              onClick={() => dismissVoiceTranscript(lastVoice.id)}
                              className="rounded-full bg-white/10 border border-white/10 text-white text-xs font-semibold px-4 py-2 hover:bg-white/15"
                            >
                              Dismiss
                            </button>
                            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1">
                              E14 • voice pre-fill via store • Technician-AI
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 text-white text-xs font-black px-4 py-2">
                              <CheckCircle className="h-3.5 w-3.5" weight="fill" /> Added to MPI • inspection fields pre-filled • live via store
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900 text-white text-xs font-bold px-3 py-2 border border-white/10">
                              RO now {selectedRO?.mpiItems.length ?? "—"} items • MPI updated live • approveMpiItem
                            </span>
                            <button onClick={() => dismissVoiceTranscript(lastVoice.id)} className="ml-auto rounded-full bg-white/10 border border-white/10 text-white text-xs font-medium px-3 py-1.5 hover:bg-white/15">Dismiss</button>
                          </>
                        )}
                      </div>
                      <div className="mt-2 text-[11px] leading-relaxed text-emerald-200/80">
                        Hold to record → transcript “{lastVoice.text}” → parsed via store.addVoiceTranscript → pre-fills inspection fields (item, measurement, recommendation, labor) → Apply creates MPI item via store.applyVoiceTranscript • voiceTranscripts: {voiceTranscripts.length} • via {lastVoice.viaE9Api}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!lastVoice && (
                <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-3 py-2.5 flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-zinc-300"><Microphone className="h-3.5 w-3.5" weight="bold" /> Try it:</span>
                  <span className="font-mono bg-white text-black px-2 py-0.5 rounded-full text-[11px] font-bold">“Brake pads 4mm, recommend replace, labor 1.2h”</span>
                  <span className="text-zinc-500">Hold button • mock transcript auto-generates • pre-fills {selectedRO?.roNumber ?? "RO-1001"} MPI • demo without mic — Technician-AI direction</span>
                  <span className="ml-auto hidden sm:inline-flex items-center gap-1 rounded-full bg-zinc-900 border border-white/10 px-2 py-0.5 font-mono text-[10px] text-white">E9 • /v1/service/repair-orders/{selectedRO?.id ?? "RO-1001"}/mpi/voice</span>
                </div>
              )}

              {recordingPulse && (
                <div className="flex items-center gap-2 text-xs font-bold text-red-400">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                  Listening — technician phone • waveform live • release to transcribe
                  <span className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] text-zinc-500">mock STT • 42ms • Technician-AI</span>
                </div>
              )}
            </div>

            {/* Summary bar */}
            <div className="grid grid-cols-4 divide-x divide-white/[0.06] bg-black/20 border-b border-white/[0.06]">
              {[
                { k: "Approved", v: `$${mpiStats.approved}`, c: "text-emerald-400" },
                { k: "Pending", v: `${mpiStats.pending}`, c: "text-amber-400" },
                { k: "Declined", v: `${mpiStats.declined}`, c: "text-zinc-400" },
                { k: "Potential", v: `$${mpiStats.potential}`, c: "text-white" },
              ].map((s) => (
                <div key={s.k} className="px-4 py-3 text-center">
                  <div className="text-[11px] font-bold tracking-widest uppercase text-zinc-500">{s.k}</div>
                  <div className={`text-lg font-black ${s.c}`}>{s.v}</div>
                </div>
              ))}
            </div>

            {/* MPI items */}
            <div className="divide-y divide-white/[0.06] max-h-[520px] overflow-auto">
              {selectedRO && selectedRO.mpiItems.length > 0 ? selectedRO.mpiItems.map((m, idx) => {
                const decision = getDecision(m)
                const pricing = getPricing(m)
                const severity = (m.status as string)
                const isRed = severity === "red"
                const isYellow = severity === "yellow"
                const isGreen = severity === "green"
                const hasVideo = Boolean(m.videoUrl)
                const hasPhoto = Boolean(m.photoUrl)
                return (
                <div key={m.id} className="px-4 py-4 flex gap-4 hover:bg-white/[0.03] transition">
                  <div className={`h-10 w-10 rounded-xl grid place-items-center shrink-0 border ${isRed ? "bg-red-500 text-white border-red-500" : isYellow ? "bg-amber-500 text-black border-amber-500" : isGreen ? "bg-emerald-500 text-white border-emerald-500" : decision === "approved" ? "bg-emerald-500 text-white border-emerald-500" : decision === "declined" ? "bg-zinc-700 text-white border-zinc-700" : "bg-amber-500 text-black border-amber-500"}`}>
                    {isRed ? <WarningCircle className="h-5 w-5" weight="fill" /> : isYellow ? <WarningCircle className="h-5 w-5" weight="bold" /> : <CheckCircle className="h-5 w-5" weight="fill" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-black tracking-widest bg-white text-black px-1.5 py-0.5 rounded">{m.category}</span>
                      <span className="text-sm font-bold">{m.item}</span>
                      {hasVideo && <span className="inline-flex items-center gap-1 rounded-full bg-red-500 text-white text-[11px] font-bold px-2 py-0.5"><Play className="h-3 w-3" weight="fill" /> Video</span>}
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/10 text-[11px] font-semibold px-2 py-0.5"><Camera className="h-3 w-3" /> {hasPhoto ? 1 : 0} photos</span>
                      <span className="ml-auto flex items-center gap-1.5">
                        {decision === "approved" && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 text-white text-xs font-bold px-2.5 py-1"><Check className="h-3 w-3" weight="bold" /> Approved</span>}
                        {decision === "declined" && <span className="inline-flex items-center gap-1 rounded-full bg-zinc-700 text-white text-xs font-bold px-2.5 py-1"><X className="h-3 w-3" weight="bold" /> Declined</span>}
                        {decision === "deferred" && <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 text-black text-xs font-bold px-2.5 py-1"><BookmarkSimple className="h-3 w-3" weight="bold" /> Deferred</span>}
                        {decision === "pending" && <span className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/10 text-zinc-300 text-xs font-bold px-2.5 py-1">Pending</span>}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{m.recommendation} {m.measurement ? `• ${m.measurement}` : ""} {m.spec ? `• Spec: ${m.spec}` : ""}</p>
                    {m.laborOp && <p className="text-[11px] text-zinc-500 mt-1 italic">Op: {m.laborOp} {m.partsRequired?.length ? `• Parts: ${m.partsRequired.join(", ")}` : ""}</p>}

                    {/* Pricing row - matrix integration — keep list vs matrix intact */}
                    {pricing ? (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2 rounded-xl bg-white text-black px-3 py-2">
                          <span className="text-[11px] font-bold tracking-widest opacity-60">LIST</span>
                          <span className="text-sm font-bold line-through decoration-2 opacity-60">${pricing.list}</span>
                          <ArrowRight className="h-3 w-3 opacity-40" />
                          <span className="text-[11px] font-bold tracking-widest">MATRIX</span>
                          <span className="text-sm font-black">${pricing.matrix}</span>
                          <span className="text-[10px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded">+{pricing.uplift}%</span>
                        </div>
                        <span className="text-[11px] font-mono bg-white/10 border border-white/10 px-2 py-1 rounded-full">Cost ${pricing.cost} • {pricing.laborHrs}h • Margin {pricing.margin}%</span>
                        <span className="ml-auto flex gap-1.5">
                          <button onClick={() => handleMpiDecision(selectedRO.id, idx, true)} className={`h-8 w-8 rounded-full grid place-items-center border transition ${decision === "approved" ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white text-black border-white hover:bg-zinc-100"}`} title="Approve"><ThumbsUp className="h-4 w-4" weight="bold" /></button>
                          <button onClick={() => handleMpiDecision(selectedRO.id, idx, false)} className={`h-8 w-8 rounded-full grid place-items-center border transition ${decision === "declined" ? "bg-zinc-700 border-zinc-700 text-white" : "bg-white/10 border-white/10 text-white hover:bg-white/15"}`} title="Decline"><ThumbsDown className="h-4 w-4" /></button>
                          <button onClick={() => handleMpiDecision(selectedRO.id, idx, false)} className={`rounded-full px-3 text-xs font-bold border transition ${decision === "deferred" ? "bg-amber-500 border-amber-500 text-black" : "bg-white/10 border-white/10 text-white hover:bg-white/15"}`}>Defer</button>
                        </span>
                      </div>
                    ) : (
                      <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full"><Check className="h-3.5 w-3.5" weight="bold" /> No action — passed</div>
                    )}

                    {/* media strip */}
                    <div className="mt-3 flex gap-2">
                      {hasPhoto && (
                        <div className="h-14 w-20 rounded-lg bg-zinc-800 border border-white/10 overflow-hidden relative group cursor-pointer">
                          <img src={m.photoUrl} alt="" className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition" />
                          <span className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition bg-black/30"><Eye className="h-4 w-4 text-white" weight="bold" /></span>
                        </div>
                      )}
                      {!hasPhoto && (
                        <div className="h-14 w-20 rounded-lg bg-zinc-800 border border-white/10 overflow-hidden relative">
                          <img src={`https://picsum.photos/seed/${m.id}/160/100`} alt="" className="h-full w-full object-cover opacity-40" />
                        </div>
                      )}
                      {hasVideo && (
                        <div className="h-14 w-20 rounded-lg bg-red-950 border border-red-500/30 overflow-hidden relative grid place-items-center cursor-pointer">
                          <Play className="h-6 w-6 text-red-400" weight="fill" />
                          <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] font-bold text-white text-center py-0.5">0:24</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                )
              }) : (
                <div className="px-4 py-12 text-center">
                  <div className="text-sm font-semibold text-zinc-300">No MPI items</div>
                  <div className="text-xs text-zinc-500 mt-1">Select an RO with MPI or create one from an appointment</div>
                </div>
              )}
            </div>

            <div className="px-4 py-3 bg-white/[0.03] border-t border-white/[0.06] flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-zinc-300">Customer view: tap Approve / Decline per item — pay link updates live</span>
              <span className="ml-auto flex gap-2">
                <button onClick={() => setShowPayLink((v) => !v)} className="rounded-full bg-white text-black text-xs font-bold px-4 py-2 hover:bg-zinc-100 transition">Share MPI + Pay →</button>
              </span>
            </div>
          </motion.div>

          {/* Deferred + Pay-by-Link stack */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            {/* Deferred work tracking */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.14 }} className="rounded-[20px] border border-white/[0.06] bg-zinc-900/60 backdrop-blur overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-amber-500 text-black grid place-items-center"><BookmarkSimple className="h-4 w-4" weight="bold" /></div>
                  <div>
                    <div className="text-sm font-bold">Deferred Work</div>
                    <div className="text-xs text-zinc-400">Follows VIN • auto-recall next visit</div>
                  </div>
                </div>
                <span className="text-xs font-mono bg-amber-500 text-black px-2 py-1 rounded-full font-bold">{DEFERRED.length + (selectedRO ? selectedRO.mpiItems.filter((m)=> getDecision(m)==="deferred" || getDecision(m)==="declined").length : 0)} items</span>
              </div>
              <div className="divide-y divide-white/[0.06]">
                {DEFERRED.map((d) => (
                  <div key={d.item} className="px-4 py-3 flex gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white/10 border border-white/10 grid place-items-center shrink-0"><Clock className="h-4 w-4 text-zinc-400" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold leading-none">{d.item}</div>
                      <div className="text-[11px] text-zinc-500">{d.ro} • {d.age}</div>
                      <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold bg-white text-black px-1.5 py-0.5 rounded">${d.price} matrix</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[11px] font-bold text-amber-400">{d.next}</div>
                      <button className="mt-1 text-[11px] font-bold underline decoration-white/20 underline-offset-4 hover:text-white">Re-add to RO</button>
                    </div>
                  </div>
                ))}
                {selectedRO && selectedRO.mpiItems.filter((m) => getDecision(m)==="deferred" || getDecision(m)==="declined").map((m) => {
                  const pricing = getPricing(m)
                  return (
                    <div key={m.id} className="px-4 py-3 flex gap-3 bg-amber-500/5">
                      <div className="h-8 w-8 rounded-lg bg-amber-500 text-black grid place-items-center shrink-0"><BookmarkSimple className="h-4 w-4" weight="bold" /></div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold">{m.item} • live defer</div>
                        <div className="text-[11px] text-zinc-500">{getDecision(m)==="declined" ? "Declined" : "Deferred"} • will auto-attach next RO for this VIN</div>
                      </div>
                      <span className="text-[11px] font-bold text-amber-300">${pricing?.matrix ?? m.retailAmount ?? 0}</span>
                    </div>
                  )
                })}
              </div>
              <div className="px-4 py-3 bg-amber-500/10 border-t border-amber-500/20 flex items-center gap-2 text-xs font-medium text-amber-200">
                <Car className="h-3.5 w-3.5" /> Retention: +23% rebook when deferred auto-surfaces at next write-up
              </div>
            </motion.div>

            {/* Pay-by-link */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.16 }} className="rounded-[20px] border border-white/[0.06] bg-zinc-900/60 backdrop-blur overflow-hidden flex-1">
              <div className="px-5 py-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500 text-black grid place-items-center"><CreditCard className="h-4 w-4" weight="bold" /></div>
                  <div>
                    <div className="text-sm font-bold">Payment • Pay-by-Link</div>
                    <div className="text-xs text-zinc-400">F15 • SMS / Email • no terminal needed</div>
                  </div>
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-500 text-black text-[11px] font-black px-2 py-1">LIVE</span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="rounded-2xl bg-white text-zinc-900 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black tracking-widest text-zinc-500">INVOICE • {selectedRO ? selectedRO.roNumber : "—"} • {selectedRO ? selectedRO.customerName : ""}</span>
                    <span className="text-[11px] font-bold bg-zinc-900 text-white px-2 py-0.5 rounded-full">Due on pickup</span>
                  </div>
                  <div className="mt-3 space-y-1.5 text-sm">
                    <div className="flex justify-between"><span className="text-zinc-500">Approved MPI + labor</span><span className="font-bold">${mpiStats.approved || 629}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">Shop supplies + tax</span><span className="font-bold">$87</span></div>
                    <div className="h-px bg-zinc-200 my-2" />
                    <div className="flex justify-between text-base"><span className="font-black">Total due</span><span className="font-black">${(mpiStats.approved || 629) + 87}</span></div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setSentLink(true)
                        setTimeout(() => setShowPayLink(true), 300)
                      }}
                      className="rounded-full bg-zinc-900 text-white font-bold py-2.5 text-sm flex items-center justify-center gap-1.5 hover:bg-black transition"
                    >
                      <PaperPlaneTilt className="h-4 w-4" weight="bold" /> {sentLink ? "Link sent ✓" : "Send pay link"}
                    </button>
                    <button onClick={() => setShowPayLink((v) => !v)} className="rounded-full bg-white border border-zinc-200 font-bold py-2.5 text-sm flex items-center justify-center gap-1.5">
                      <LinkIcon className="h-4 w-4" /> Copy link
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-3 text-[11px] font-medium text-zinc-500">
                    <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> SMS</span>
                    <span className="opacity-30">•</span>
                    <span className="inline-flex items-center gap-1"><ChatCircle className="h-3 w-3" /> Email</span>
                    <span className="opacity-30">•</span>
                    <span>Apple Pay • Card • ACH</span>
                  </div>
                </div>

                <AnimatePresence>
                  {showPayLink && (
                    <motion.div initial={{ opacity: 0, y: 8, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: 8, height: 0 }} className="overflow-hidden">
                      <div className="rounded-2xl bg-black border border-white/10 p-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400"><LinkIcon className="h-3.5 w-3.5" /> pay.autocore.app/r/{selectedRO ? selectedRO.roNumber.replace(/\s/g,"") : "88342"}-9K2 • expires in 48h</div>
                        <div className="mt-3 rounded-xl bg-white p-3 flex gap-3">
                          <div className="h-20 w-20 rounded-lg bg-zinc-900 grid place-items-center shrink-0">
                            <div className="h-16 w-16 bg-[repeating-linear-gradient(0deg,#000_0_2px,#fff_0_4px)] opacity-80" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-black">Scan to pay — {selectedRO ? selectedRO.customerName : ""}</div>
                            <div className="text-[11px] text-zinc-500 leading-relaxed mt-1">Customer taps approve on MPI video, then pays. RO auto-marks “paid” • receipt SMS’d • cashier skips line.</div>
                            <div className="mt-2 flex gap-1.5">
                              <span className="text-[11px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">Paid $716 ✓</span>
                              <span className="text-[11px] font-bold bg-zinc-900 text-white px-2 py-0.5 rounded-full">Receipt sent</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
                          <div className="rounded-xl bg-white/[0.06] border border-white/10 py-2">
                            <div className="font-black text-white">2m 14s</div>
                            <div className="text-zinc-500">Avg pay time</div>
                          </div>
                          <div className="rounded-xl bg-white/[0.06] border border-white/10 py-2">
                            <div className="font-black text-emerald-400">94%</div>
                            <div className="text-zinc-500">Contactless</div>
                          </div>
                          <div className="rounded-xl bg-white/[0.06] border border-white/10 py-2">
                            <div className="font-black text-white">$0</div>
                            <div className="text-zinc-500">Terminal fee</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!showPayLink && (
                  <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-center">
                    <div className="text-xs font-semibold text-zinc-300">No hardware needed — link works on any phone</div>
                    <div className="text-[11px] text-zinc-500 mt-1">Tekion comparison: AutoCore settles to RO instantly; no double-entry to accounting.</div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer meta */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-medium text-zinc-500">
          <span className="inline-flex items-center gap-1 rounded-full bg-white text-black font-bold px-2.5 py-1">E7 AI Sched</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-1">F4 RO + Dispatch</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-1">F13 Video MPI + matrix</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-1">F15 Pay-by-link</span>
          <span className="ml-auto hidden sm:inline">AutoCore ERP • Fixed Ops Demo • Tailwind + Motion + Phosphor • bento grid • store wired F4</span>
        </div>
      </div>
    </div>
  )
}
