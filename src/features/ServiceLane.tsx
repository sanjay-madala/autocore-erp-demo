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
} from "@phosphor-icons/react"

// ──────────────────────────────────────────────
// Types & Dummy Data
// ──────────────────────────────────────────────
type ROStatus = "write-up" | "mpi" | "waiting-approval" | "authorized" | "in-progress" | "ready"

type Appointment = {
  id: string
  time: string
  customer: string
  vehicle: string
  vin: string
  opCode: string
  opLabel: string
  lane: "Express" | "Mainline" | "Diag"
  advisor: string
  status: "arrived" | "scheduled" | "in-bay" | "no-show"
  wait: boolean
}

type RO = {
  id: string
  ro: string
  customer: string
  vehicle: string
  tag: string
  advisor: string
  tech: string | null
  status: ROStatus
  promise: string
  concern: string
  flagged: number
  mpiDone: number
  mpiTotal: number
  tagColor: string
}

type Tech = {
  id: string
  name: string
  initials: string
  skill: string[]
  flagged: number
  capacity: number
  status: "available" | "busy" | "break"
  jobs: { ro: string; op: string; hrs: number; status: ROStatus }[]
}

type MpiItem = {
  id: string
  category: "Brakes" | "Tires" | "Fluids" | "Suspension" | "Battery" | "Filters"
  item: string
  rec: string
  severity: "green" | "yellow" | "red"
  decision: "pending" | "approved" | "declined" | "deferred"
  listPrice: number
  matrixPrice: number
  cost: number
  laborHrs: number
  photos: number
  hasVideo: boolean
  techNote: string
}

const APPOINTMENTS: Appointment[] = [
  { id: "A1", time: "7:30", customer: "Jenna Walsh", vehicle: "2022 RAV4 XLE", vin: "2T3B1RFV…4K128", opCode: "LOF + ROT", opLabel: "Oil & Rotate", lane: "Express", advisor: "D. Kim", status: "arrived", wait: true },
  { id: "A2", time: "8:00", customer: "Marcus Henry", vehicle: "2020 Tundra 1794", vin: "5DFGT8E1…9P442", opCode: "BRK INS", opLabel: "Brake Inspect", lane: "Mainline", advisor: "S. Patel", status: "arrived", wait: false },
  { id: "A3", time: "8:00", customer: "Alyssa Cho", vehicle: "2024 Camry SE", vin: "4T1G11AK…2U771", opCode: "MPI-COM", opLabel: "30K Service + MPI", lane: "Mainline", advisor: "D. Kim", status: "in-bay", wait: false },
  { id: "A4", time: "8:30", customer: "Robert Pierce", vehicle: "2018 Highlander Ltd", vin: "5TDDZRFH…8S903", opCode: "DIAG-CE", opLabel: "CEL / Diag", lane: "Diag", advisor: "J. Torres", status: "scheduled", wait: false },
  { id: "A5", time: "9:00", customer: "Keisha Grant", vehicle: "2021 4Runner TRD", vin: "JTEBU5JR…3M221", opCode: "TIRE-4", opLabel: "4 Tires + Align", lane: "Express", advisor: "S. Patel", status: "scheduled", wait: true },
  { id: "A6", time: "9:30", customer: "Waitlist • Open", vehicle: "—", vin: "—", opCode: "ANY", opLabel: "Flex slot • AI hold", lane: "Express", advisor: "—", status: "scheduled", wait: true },
  { id: "A7", time: "10:00", customer: "David Park", vehicle: "2023 Tacoma SR5", vin: "3TMCZ5AN…1P889", opCode: "RECALL", opLabel: "Recall + LOF", lane: "Mainline", advisor: "D. Kim", status: "scheduled", wait: false },
  { id: "A8", time: "10:30", customer: "Nadia Stone", vehicle: "2019 Avalon XLE", vin: "4T1BZ11D…6U334", opCode: "AC DIAG", opLabel: "A/C Diag", lane: "Diag", advisor: "J. Torres", status: "scheduled", wait: false },
]

const ROS: RO[] = [
  { id: "1", ro: "RO 88341", customer: "Jenna Walsh", vehicle: "2022 RAV4 XLE • 32,410 mi", tag: "WAITER", advisor: "D. Kim", tech: "M. Reyes", status: "mpi", promise: "11:30 AM", concern: "Loud squeal braking + 30K", flagged: 1.2, mpiDone: 4, mpiTotal: 7, tagColor: "emerald" },
  { id: "2", ro: "RO 88342", customer: "Marcus Henry", vehicle: "2020 Tundra 1794 • 58,210 mi", tag: "LOANER", advisor: "S. Patel", tech: "J. Boone", status: "waiting-approval", promise: "3:00 PM", concern: "Brake pulsation, rotate", flagged: 2.4, mpiDone: 7, mpiTotal: 7, tagColor: "amber" },
  { id: "3", ro: "RO 88344", customer: "Alyssa Cho", vehicle: "2024 Camry SE • 28,900 mi", tag: "", advisor: "D. Kim", tech: "M. Reyes", status: "in-progress", promise: "4:00 PM", concern: "30K full service", flagged: 3.0, mpiDone: 7, mpiTotal: 7, tagColor: "zinc" },
  { id: "4", ro: "RO 88338", customer: "Keisha Grant", vehicle: "2021 4Runner TRD • 41,100 mi", tag: "WAITER", advisor: "S. Patel", tech: null, status: "write-up", promise: "12:00 PM", concern: "4 tires + alignment", flagged: 0, mpiDone: 0, mpiTotal: 7, tagColor: "emerald" },
  { id: "5", ro: "RO 88331", customer: "Robert Pierce", vehicle: "2018 Highlander Ltd • 72,400 mi", tag: "CUST PAY", advisor: "J. Torres", tech: "A. Silva", status: "ready", promise: "11:00 AM", concern: "CEL + trans shudder", flagged: 4.1, mpiDone: 7, mpiTotal: 7, tagColor: "sky" },
  { id: "6", ro: "RO 88345", customer: "David Park", vehicle: "2023 Tacoma SR5 • 19,200 mi", tag: "RECALL", advisor: "D. Kim", tech: "J. Boone", status: "authorized", promise: "2:00 PM", concern: "Recall + courtesy wash", flagged: 0.8, mpiDone: 7, mpiTotal: 7, tagColor: "violet" },
]

const TECHS: Tech[] = [
  { id: "T1", name: "Marco Reyes", initials: "MR", skill: ["Toyota Cert", "Brakes", "Diag"], flagged: 6.8, capacity: 8, status: "busy", jobs: [{ ro: "88341", op: "30K + BRK", hrs: 2.4, status: "mpi" }, { ro: "88344", op: "30K Service", hrs: 3.0, status: "in-progress" }] },
  { id: "T2", name: "Jenna Boone", initials: "JB", skill: ["Master", "Engine", "Hybrid"], flagged: 7.2, capacity: 8, status: "busy", jobs: [{ ro: "88342", op: "BRK INS", hrs: 1.8, status: "waiting-approval" }, { ro: "88345", op: "RECALL", hrs: 0.8, status: "authorized" }] },
  { id: "T3", name: "Alex Silva", initials: "AS", skill: ["Diag", "Trans", "Electrical"], flagged: 3.1, capacity: 8, status: "available", jobs: [{ ro: "88331", op: "DIAG-CE", hrs: 2.5, status: "ready" }] },
  { id: "T4", name: "Unassigned", initials: "—", skill: [], flagged: 0, capacity: 8, status: "available", jobs: [] },
]

const INITIAL_MPI: MpiItem[] = [
  { id: "m1", category: "Brakes", item: "Front pads & rotors", rec: "Pads at 2mm, scoring on rotor — unsafe", severity: "red", decision: "pending", listPrice: 485, matrixPrice: 629, cost: 198, laborHrs: 1.8, photos: 3, hasVideo: true, techNote: "Video: audible squeal on road test + caliper measurement" },
  { id: "m2", category: "Tires", item: "Front tires", rec: "4/32″ • uneven inner wear — alignment recommended", severity: "yellow", decision: "pending", listPrice: 398, matrixPrice: 512, cost: 176, laborHrs: 0.6, photos: 2, hasVideo: true, techNote: "Photo: wear bars visible, inner edge feathered" },
  { id: "m3", category: "Fluids", item: "Brake fluid exchange", rec: "Moisture 3.2% — due per Toyota schedule", severity: "yellow", decision: "deferred", listPrice: 129, matrixPrice: 159, cost: 28, laborHrs: 0.5, photos: 1, hasVideo: false, techNote: "Test strip + color comparison" },
  { id: "m4", category: "Filters", item: "Cabin air filter", rec: "Clogged — debris, reduced airflow", severity: "yellow", decision: "pending", listPrice: 59, matrixPrice: 79, cost: 14, laborHrs: 0.2, photos: 2, hasVideo: false, techNote: "Photo before/after bay" },
  { id: "m5", category: "Battery", item: "Battery & charging system", rec: "CCA 412/650 — marginal, slow crank noted", severity: "yellow", decision: "pending", listPrice: 289, matrixPrice: 345, cost: 168, laborHrs: 0.3, photos: 1, hasVideo: true, techNote: "Video: load test + terminal corrosion" },
  { id: "m6", category: "Suspension", item: "Rear shocks", rec: "Seepage, bounce test fail", severity: "red", decision: "pending", listPrice: 620, matrixPrice: 799, cost: 312, laborHrs: 1.4, photos: 3, hasVideo: true, techNote: "Video: shock oil leak, rebound comparison" },
  { id: "m7", category: "Fluids", item: "Coolant condition", rec: "pH OK, level OK — no action", severity: "green", decision: "approved", listPrice: 0, matrixPrice: 0, cost: 0, laborHrs: 0, photos: 1, hasVideo: false, techNote: "Green — pass" },
]

const DEFERRED = [
  { item: "Brake fluid exchange", ro: "88332 • 04/12", age: "14d ago", price: 159, next: "Next visit" },
  { item: "Alignment + 2 tires", ro: "88341 • today", age: "Declined today", price: 512, next: "30d follow-up" },
  { item: "Rear shocks", ro: "88341 • today", age: "Pending", price: 799, next: "Awaiting auth" },
]

// ──────────────────────────────────────────────
// helpers
// ──────────────────────────────────────────────
const statusMeta: Record<ROStatus, { label: string; color: string; icon: React.ElementType }> = {
  "write-up": { label: "Write-up", color: "bg-zinc-700 text-zinc-200", icon: PenNib },
  "mpi": { label: "MPI", color: "bg-amber-500 text-black", icon: Eye },
  "waiting-approval": { label: "Waiting approval", color: "bg-orange-500 text-white", icon: Hourglass },
  "authorized": { label: "Authorized", color: "bg-emerald-500 text-white", icon: CheckCircle },
  "in-progress": { label: "In Progress", color: "bg-sky-500 text-white", icon: Wrench },
  "ready": { label: "Ready", color: "bg-violet-500 text-white", icon: Flag },
}

function laneColor(lane: Appointment["lane"]) {
  if (lane === "Express") return "bg-emerald-500"
  if (lane === "Mainline") return "bg-sky-500"
  return "bg-violet-500"
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────
export default function ServiceLane() {
  const [selectedRoId, setSelectedRoId] = useState<string>("2")
  const [mpi, setMpi] = useState<MpiItem[]>(INITIAL_MPI)
  const [filter, setFilter] = useState<ROStatus | "all">("all")
  const [aiAccepted, setAiAccepted] = useState(false)
  const [showPayLink, setShowPayLink] = useState(false)
  const [sentLink, setSentLink] = useState(false)
  const [search, setSearch] = useState("")

  const selectedRO = ROS.find((r) => r.id === selectedRoId) ?? ROS[1]

  const filteredRos = useMemo(() => {
    let out = ROS
    if (filter !== "all") out = out.filter((r) => r.status === filter)
    if (search) out = out.filter((r) => (r.customer + r.vehicle + r.ro).toLowerCase().includes(search.toLowerCase()))
    return out
  }, [filter, search])

  const mpiStats = useMemo(() => {
    const approved = mpi.filter((m) => m.decision === "approved").reduce((s, m) => s + m.matrixPrice, 0)
    const pending = mpi.filter((m) => m.decision === "pending").length
    const declined = mpi.filter((m) => m.decision === "declined").length
    const deferred = mpi.filter((m) => m.decision === "deferred").length
    const potential = mpi.reduce((s, m) => s + m.matrixPrice, 0)
    return { approved, pending, declined, deferred, potential }
  }, [mpi])

  const toggleMpi = (id: string, decision: MpiItem["decision"]) =>
    setMpi((prev) => prev.map((m) => (m.id === id ? { ...m, decision } : m)))

  const capacityPct = 18 / 24

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
              <span className="text-xs font-semibold">Bays 18/24</span>
              <div className="h-1.5 w-24 rounded-full bg-white/10 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${capacityPct * 100}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full bg-emerald-500" />
              </div>
              <span className="text-[11px] text-zinc-400">75% utilized</span>
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
            { label: "Appts Today", value: "24", sub: "18 arrived • 2 no-show", icon: CalendarDots, accent: "text-emerald-400" },
            { label: "ROs Open", value: "18", sub: "6 waiting approval • 4 ready", icon: Wrench, accent: "text-sky-400" },
            { label: "Flagged Hrs", value: "41.2h", sub: "Target 56h • 73% pace", icon: Timer, accent: "text-amber-400" },
            { label: "MPI Close Rate", value: "68%", sub: "+4.2% vs last Tue", icon: TrendUp, accent: "text-violet-400" },
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
                <span className="inline-flex items-center rounded-full bg-emerald-500 text-black text-[11px] font-black px-2.5 py-1">OPEN 6 SLOTS</span>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.06] bg-white/[0.02]">
              {(["Express", "Mainline", "Diag"] as const).map((lane) => (
                <div key={lane} className="col-span-12 lg:col-span-4">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${laneColor(lane)}`} />
                      <span className="text-xs font-black tracking-widest uppercase">{lane}</span>
                      <span className="text-[11px] text-zinc-500 font-mono">{APPOINTMENTS.filter((a) => a.lane === lane && a.customer.includes("Waitlist") === false).length} booked</span>
                    </div>
                    <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-white/10 border border-white/10">{lane === "Express" ? "45m" : lane === "Mainline" ? "90m" : "120m"} avg</span>
                  </div>
                  <div className="px-3 pb-3 space-y-2">
                    {APPOINTMENTS.filter((a) => a.lane === lane).map((a) => (
                      <div key={a.id} className={`group relative rounded-xl border px-3 py-2.5 flex gap-3 items-center transition ${a.customer.includes("Waitlist") ? "border-dashed border-white/15 bg-white/[0.02]" : "bg-zinc-900 border-white/[0.06] hover:border-white/15 hover:bg-zinc-800"}`}>
                        <div className="text-center min-w-[56px]">
                          <div className="text-xs font-black font-mono">{a.time}</div>
                          <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-1 inline-flex ${a.status === "arrived" ? "bg-emerald-500 text-black" : a.status === "in-bay" ? "bg-sky-500 text-white" : "bg-white/10 text-zinc-300"}`}>{a.status}</div>
                        </div>
                        <div className="h-10 w-px bg-white/10" />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold leading-none truncate">{a.customer} {a.wait && <span className="ml-1 inline-flex text-[9px] font-black tracking-widest bg-amber-500 text-black px-1 rounded">WAITER</span>}</div>
                          <div className="text-[11px] text-zinc-400 truncate">{a.vehicle !== "—" ? a.vehicle : "AI will fill • LOF • any advisor"}</div>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-[10px] font-mono font-bold bg-white text-black px-1.5 py-0.5 rounded">{a.opCode}</span>
                            <span className="text-[11px] text-zinc-400 truncate">{a.opLabel}</span>
                            <span className="ml-auto text-[11px] text-zinc-500">{a.advisor}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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
                  <div className="text-xs font-bold">Move Keisha Grant (9:00 TIRE-4) → Bay 7</div>
                  <div className="text-xs text-zinc-400 leading-relaxed">Tech Boone free at 9:15 • keeps waiter promise &lt; 90m. Alternative: push to 1pm loaner.</div>
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
                {(["all", "write-up", "mpi", "waiting-approval", "in-progress", "ready"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilter(s as any)}
                    className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize border transition ${filter === s ? "bg-white text-black border-white" : "bg-white/[0.06] text-zinc-300 border-white/10 hover:bg-white/10"}`}
                  >
                    {s === "waiting-approval" ? "waiting approval" : s}
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
                const meta = statusMeta[r.status]
                const isSel = r.id === selectedRoId
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRoId(r.id)}
                    className={`w-full text-left px-4 py-3.5 flex gap-3 hover:bg-white/[0.04] transition relative ${isSel ? "bg-violet-500/10" : ""}`}
                  >
                    {isSel && <span className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500" />}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black tracking-widest">{r.ro}</span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${meta.color}`}>
                          <meta.icon className="h-3 w-3" weight="bold" /> {meta.label}
                        </span>
                        {r.tag && <span className={`text-[10px] font-black tracking-widest px-1.5 py-0.5 rounded ${r.tagColor === "emerald" ? "bg-emerald-500 text-black" : r.tagColor === "amber" ? "bg-amber-500 text-black" : r.tagColor === "sky" ? "bg-sky-500 text-white" : "bg-violet-500 text-white"}`}>{r.tag}</span>}
                      </div>
                      <div className="text-sm font-semibold mt-1">{r.customer} <span className="text-zinc-500 font-normal">• {r.vehicle}</span></div>
                      <div className="text-xs text-zinc-400 mt-1 line-clamp-1">{r.concern} • Adv: {r.advisor} {r.tech ? `• Tech: ${r.tech}` : "• Unassigned"}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono bg-white/10 border border-white/10 px-1.5 py-0.5 rounded"><Clock className="h-3 w-3" /> Promise {r.promise}</span>
                        <span className="text-[11px] text-zinc-500">{r.flagged}h flagged</span>
                        <span className="ml-auto text-[11px] font-medium flex items-center gap-1"><span className="h-1.5 w-8 rounded-full bg-white/10 overflow-hidden inline-block"><span className="block h-full bg-emerald-500" style={{ width: `${(r.mpiDone / r.mpiTotal) * 100}%` }} /></span> MPI {r.mpiDone}/{r.mpiTotal}</span>
                      </div>
                    </div>
                    <CaretRight className={`h-4 w-4 shrink-0 self-center transition ${isSel ? "text-violet-400" : "text-zinc-600 group-hover:text-zinc-400"}`} />
                  </button>
                )
              })}
            </div>
            <div className="mt-auto px-4 py-3 bg-white/[0.03] border-t border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-medium">Pipeline: write-up → MPI → approval → ready</span>
              <span className="font-mono text-zinc-300">{filteredRos.filter((r) => r.status === "waiting-approval").length} awaiting SMS</span>
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
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white text-black font-bold px-2.5 py-1"><Timer className="h-3.5 w-3.5" /> 41.2 / 64h dispatched</span>
                <button className="h-8 w-8 grid place-items-center rounded-full bg-white/10 border border-white/10"><DotsThree className="h-4 w-4" weight="bold" /></button>
              </div>
            </div>

            <div className="grid grid-cols-12 divide-x divide-white/[0.06] min-h-[520px]">
              {TECHS.map((t) => (
                <div key={t.id} className={`col-span-6 lg:col-span-3 flex flex-col ${t.id === "T4" ? "bg-white/[0.02] border-dashed" : ""}`}>
                  <div className="px-3 py-3 border-b border-white/[0.06] bg-white/[0.03]">
                    <div className="flex items-center gap-2">
                      <div className={`h-8 w-8 rounded-full grid place-items-center text-xs font-black border ${t.status === "busy" ? "bg-amber-500 text-black border-amber-500" : t.status === "available" ? "bg-emerald-500 text-black border-emerald-500" : "bg-zinc-700 text-zinc-200 border-white/10"}`}>{t.initials}</div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold leading-none truncate">{t.name}</div>
                        <div className="text-[11px] text-zinc-400 truncate">{t.skill.join(" • ") || "Drop RO to assign"}</div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-sky-500" style={{ width: `${(t.flagged / t.capacity) * 100}%` }} />
                      </div>
                      <span className="text-[11px] font-mono font-bold">{t.flagged.toFixed(1)}h / {t.capacity}h</span>
                    </div>
                    <div className="mt-1 flex gap-1 flex-wrap">
                      {t.skill.slice(0, 2).map((s) => (
                        <span key={s} className="text-[10px] font-bold tracking-widest bg-white text-black px-1.5 py-0.5 rounded">{s}</span>
                      ))}
                      {t.status !== "available" && <span className="text-[10px] font-bold tracking-widest bg-amber-500 text-black px-1.5 py-0.5 rounded">● BUSY</span>}
                      {t.status === "available" && t.id !== "T4" && <span className="text-[10px] font-bold tracking-widest bg-emerald-500 text-black px-1.5 py-0.5 rounded">● READY</span>}
                    </div>
                  </div>

                  <div className="flex-1 p-2 space-y-2">
                    {t.jobs.length === 0 ? (
                      <div className="h-full min-h-[120px] rounded-xl border-2 border-dashed border-white/10 grid place-items-center p-4 text-center">
                        <div>
                          <div className="mx-auto h-8 w-8 rounded-full bg-white/10 grid place-items-center"><Package className="h-4 w-4 text-zinc-400" /></div>
                          <div className="text-xs font-semibold mt-2 text-zinc-300">No jobs queued</div>
                          <div className="text-[11px] text-zinc-500">Drag RO here or auto-assign</div>
                        </div>
                      </div>
                    ) : (
                      t.jobs.map((j) => {
                        const m = statusMeta[j.status]
                        return (
                          <div key={j.ro} className="rounded-xl bg-zinc-950 border border-white/10 p-3 hover:border-white/20 transition">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black">RO {j.ro}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${m.color}`}>{m.label}</span>
                            </div>
                            <div className="text-xs font-medium mt-1">{j.op}</div>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="inline-flex items-center gap-1 text-[11px] font-mono bg-white text-black px-1.5 py-0.5 rounded font-bold"><Flag className="h-3 w-3" /> {j.hrs}h</span>
                              <span className="text-[11px] text-zinc-500">Bay {j.ro.slice(-1)}</span>
                            </div>
                            {j.ro === "88342" && (
                              <div className="mt-2 rounded-lg bg-amber-500/15 border border-amber-500/20 px-2 py-1.5 flex items-center gap-1.5">
                                <Hourglass className="h-3 w-3 text-amber-400" weight="bold" />
                                <span className="text-[11px] font-bold text-amber-200">Waiting customer auth</span>
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                    {t.id !== "T4" && (
                      <button className="w-full rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/10 text-xs font-semibold py-2 flex items-center justify-center gap-1">
                        <ArrowRight className="h-3 w-3" /> Dispatch next
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 py-3 border-t border-white/[0.06] bg-white/[0.03] flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-500" /> Flag hrs live from RO labor ops</span>
              <span className="opacity-20">•</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-violet-500" /> Skill match boosts first-time fix</span>
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-white text-black font-bold px-2.5 py-1"><Sparkle className="h-3 w-3" /> Auto-dispatch enabled</span>
            </div>
          </motion.div>

          {/* Video MPI flow */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.12 }} className="col-span-12 lg:col-span-8 rounded-[20px] border border-white/[0.06] bg-zinc-900/60 backdrop-blur overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-red-500 text-white grid place-items-center"><VideoCamera className="h-4 w-4" weight="fill" /></div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">Video MPI • {selectedRO.ro}</span>
                    <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-red-500 text-white text-[11px] font-black px-2 py-0.5"><span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> REC • ShopCam</span>
                  </div>
                  <div className="text-xs text-zinc-400">{selectedRO.customer} • {selectedRO.vehicle} • Tech: {selectedRO.tech ?? "Unassigned"}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] border border-white/10 px-3 py-1.5 text-xs font-semibold"><Eye className="h-3.5 w-3.5" /> {mpiStats.pending} pending</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 text-black text-xs font-black px-3 py-1.5"><TrendUp className="h-3.5 w-3.5" /> Matrix pricing live</span>
              </div>
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
              {mpi.map((m) => (
                <div key={m.id} className="px-4 py-4 flex gap-4 hover:bg-white/[0.03] transition">
                  <div className={`h-10 w-10 rounded-xl grid place-items-center shrink-0 border ${m.severity === "red" ? "bg-red-500 text-white border-red-500" : m.severity === "yellow" ? "bg-amber-500 text-black border-amber-500" : "bg-emerald-500 text-white border-emerald-500"}`}>
                    {m.severity === "red" ? <WarningCircle className="h-5 w-5" weight="fill" /> : m.severity === "yellow" ? <WarningCircle className="h-5 w-5" weight="bold" /> : <CheckCircle className="h-5 w-5" weight="fill" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-black tracking-widest bg-white text-black px-1.5 py-0.5 rounded">{m.category}</span>
                      <span className="text-sm font-bold">{m.item}</span>
                      {m.hasVideo && <span className="inline-flex items-center gap-1 rounded-full bg-red-500 text-white text-[11px] font-bold px-2 py-0.5"><Play className="h-3 w-3" weight="fill" /> Video</span>}
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/10 text-[11px] font-semibold px-2 py-0.5"><Camera className="h-3 w-3" /> {m.photos} photos</span>
                      <span className="ml-auto flex items-center gap-1.5">
                        {m.decision === "approved" && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 text-white text-xs font-bold px-2.5 py-1"><Check className="h-3 w-3" weight="bold" /> Approved</span>}
                        {m.decision === "declined" && <span className="inline-flex items-center gap-1 rounded-full bg-zinc-700 text-white text-xs font-bold px-2.5 py-1"><X className="h-3 w-3" weight="bold" /> Declined</span>}
                        {m.decision === "deferred" && <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 text-black text-xs font-bold px-2.5 py-1"><BookmarkSimple className="h-3 w-3" weight="bold" /> Deferred</span>}
                        {m.decision === "pending" && <span className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/10 text-zinc-300 text-xs font-bold px-2.5 py-1">Pending</span>}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{m.rec}</p>
                    <p className="text-[11px] text-zinc-500 mt-1 italic">Tech note: {m.techNote}</p>

                    {/* Pricing row - matrix integration */}
                    {m.matrixPrice > 0 ? (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2 rounded-xl bg-white text-black px-3 py-2">
                          <span className="text-[11px] font-bold tracking-widest opacity-60">LIST</span>
                          <span className="text-sm font-bold line-through decoration-2 opacity-60">${m.listPrice}</span>
                          <ArrowRight className="h-3 w-3 opacity-40" />
                          <span className="text-[11px] font-bold tracking-widest">MATRIX</span>
                          <span className="text-sm font-black">${m.matrixPrice}</span>
                          <span className="text-[10px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded">+{Math.round(((m.matrixPrice - m.listPrice) / m.listPrice) * 100)}%</span>
                        </div>
                        <span className="text-[11px] font-mono bg-white/10 border border-white/10 px-2 py-1 rounded-full">Cost ${m.cost} • {m.laborHrs}h • Margin {Math.round(((m.matrixPrice - m.cost) / m.matrixPrice) * 100)}%</span>
                        <span className="ml-auto flex gap-1.5">
                          <button onClick={() => toggleMpi(m.id, "approved")} className={`h-8 w-8 rounded-full grid place-items-center border transition ${m.decision === "approved" ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white text-black border-white hover:bg-zinc-100"}`}><ThumbsUp className="h-4 w-4" weight="bold" /></button>
                          <button onClick={() => toggleMpi(m.id, "declined")} className={`h-8 w-8 rounded-full grid place-items-center border transition ${m.decision === "declined" ? "bg-zinc-700 border-zinc-700 text-white" : "bg-white/10 border-white/10 text-white hover:bg-white/15"}`}><ThumbsDown className="h-4 w-4" /></button>
                          <button onClick={() => toggleMpi(m.id, "deferred")} className={`rounded-full px-3 text-xs font-bold border transition ${m.decision === "deferred" ? "bg-amber-500 border-amber-500 text-black" : "bg-white/10 border-white/10 text-white hover:bg-white/15"}`}>Defer</button>
                        </span>
                      </div>
                    ) : (
                      <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full"><Check className="h-3.5 w-3.5" weight="bold" /> No action — passed</div>
                    )}

                    {/* media strip mock */}
                    <div className="mt-3 flex gap-2">
                      {Array.from({ length: m.photos }).map((_, i) => (
                        <div key={i} className="h-14 w-20 rounded-lg bg-zinc-800 border border-white/10 overflow-hidden relative group cursor-pointer">
                          <img src={`https://picsum.photos/seed/${m.id}${i}/160/100`} alt="" className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition" />
                          <span className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition bg-black/30"><Eye className="h-4 w-4 text-white" weight="bold" /></span>
                        </div>
                      ))}
                      {m.hasVideo && (
                        <div className="h-14 w-20 rounded-lg bg-red-950 border border-red-500/30 overflow-hidden relative grid place-items-center cursor-pointer">
                          <Play className="h-6 w-6 text-red-400" weight="fill" />
                          <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] font-bold text-white text-center py-0.5">0:24</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
                <span className="text-xs font-mono bg-amber-500 text-black px-2 py-1 rounded-full font-bold">{DEFERRED.length + mpi.filter((m) => m.decision === "deferred").length} items</span>
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
                {mpi
                  .filter((m) => m.decision === "deferred")
                  .map((m) => (
                    <div key={m.id} className="px-4 py-3 flex gap-3 bg-amber-500/5">
                      <div className="h-8 w-8 rounded-lg bg-amber-500 text-black grid place-items-center shrink-0"><BookmarkSimple className="h-4 w-4" weight="bold" /></div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold">{m.item} • live defer</div>
                        <div className="text-[11px] text-zinc-500">Just deferred • will auto-attach next RO for this VIN</div>
                      </div>
                      <span className="text-[11px] font-bold text-amber-300">${m.matrixPrice}</span>
                    </div>
                  ))}
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
                    <span className="text-[11px] font-black tracking-widest text-zinc-500">INVOICE • {selectedRO.ro} • {selectedRO.customer}</span>
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
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400"><LinkIcon className="h-3.5 w-3.5" /> pay.autocore.app/r/88342-9K2 • expires in 48h</div>
                        <div className="mt-3 rounded-xl bg-white p-3 flex gap-3">
                          <div className="h-20 w-20 rounded-lg bg-zinc-900 grid place-items-center shrink-0">
                            <div className="h-16 w-16 bg-[repeating-linear-gradient(0deg,#000_0_2px,#fff_0_4px)] opacity-80" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-black">Scan to pay — {selectedRO.customer}</div>
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
          <span className="ml-auto hidden sm:inline">AutoCore ERP • Fixed Ops Demo • Tailwind + Motion + Phosphor • bento grid</span>
        </div>
      </div>
    </div>
  )
}
