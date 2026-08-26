import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  ChatsCircle, Phone, Envelope, Globe, Lightning, CheckCircle, Clock, User, MagnifyingGlass, Funnel,
  ArrowRight, Sparkle, Robot, ShieldCheck, Star, WarningCircle, ArrowsClockwise, TrendUp, Users,
  CalendarCheck, ChatCircleDots, Eye, Copy,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/lib/store"

// ─── fallback seed (7) — used only if store empty (Zustand has 20, so rarely) ───
type LeadDisplay = {
  id: string
  name: string
  phone: string
  email: string
  source: "OEM" | "Website" | "Third-Party" | "Phone" | "ServiceDrive" | "ThirdParty" | "Showroom" | "Chat" | string
  vehicle: string
  score: number
  grade: "A"|"B"|"C"|"D"|"F"
  status: "new"|"engaged"|"appointment"|"rescued"|"sold"| string
  assignedTo: string
  seconds: number
  dedup?: string
  lastMsg: string
  time: string
  // store passthrough
  dealId?: string
  raw?: any
}

const FALLBACK_LEADS: LeadDisplay[] = [
  { id: "LEAD-001", name: "Marcus Chen", phone: "248-555-0143", email: "marcus.chen@email.com", source: "Website", vehicle: "2024 Toyota Camry XSE", score: 92, grade: "A", status: "engaged", assignedTo: "J. Alvarez", seconds: 22, lastMsg: "Is the Camry still available? Can I see it today?", time: "09:14" },
  { id: "LEAD-006", name: "Sarah Whitfield", phone: "248-555-0088", email: "s.whitfield@email.com", source: "OEM", vehicle: "2024 Ford F-150 Lariat", score: 88, grade: "A", status: "new", assignedTo: "M. Patel", seconds: 18, dedup: "M-008", lastMsg: "Website inquiry + phone call — same customer", time: "09:22" },
  { id: "LEAD-014", name: "Sarah Whitfield", phone: "248-555-0088", email: "s.whitfield+toyota@email.com", source: "Third-Party", vehicle: "2025 Honda CR-V Hybrid", score: 88, grade: "A", status: "new", assignedTo: "M. Patel", seconds: 31, dedup: "M-008", lastMsg: "Cars.com lead — typo email, same phone + DL", time: "09:24" },
  { id: "LEAD-018", name: "Sarah Whitfield", phone: "248-555-0088", email: "sarah.whitfield@email.com", source: "Phone", vehicle: "2024 Ford F-150 Lariat", score: 88, grade: "B", status: "appointment", assignedTo: "Auto", seconds: 47, dedup: "M-008", lastMsg: "AI bridged — appointment Thu 10:30", time: "09:31" },
  { id: "LEAD-002", name: "Priya Nair", phone: "248-555-0192", email: "priya.nair@email.com", source: "Third-Party", vehicle: "2025 Ford Bronco Wildtrak", score: 76, grade: "B", status: "engaged", assignedTo: "S. Kim", seconds: 54, lastMsg: "Trade: 2021 Explorer, payoff $18.2k", time: "08:58" },
  { id: "LEAD-003", name: "David Park", phone: "248-555-0234", email: "d.park@email.com", source: "Phone", vehicle: "2024 Honda Civic Touring", score: 41, grade: "F", status: "rescued", assignedTo: "AI", seconds: 142, lastMsg: "Missed call — AI rescued, transcript available", time: "08:42" },
  { id: "LEAD-009", name: "Amara Okafor", phone: "248-555-0311", email: "amara.o@email.com", source: "ServiceDrive", vehicle: "2019 Toyota RAV4", score: 84, grade: "A", status: "new", assignedTo: "J. Alvarez", seconds: 11, lastMsg: "Service visit — equity +$4.2k, hand to sales", time: "09:38" },
]

const TIMELINE = [
  { t: "09:14:02", who: "Website", text: "Form submitted — 2024 Camry XSE — source UTM google/cpc", icon: Globe, c: "bg-sky-500" },
  { t: "09:14:05", who: "System", text: "Dedup — matched existing M-008? No. New M-214 created. Assigned J. Alvarez in 2.1s", icon: ArrowsClockwise, c: "bg-zinc-900" },
  { t: "09:14:22", who: "AI", text: "AI first SMS in 20s: 'Hi Marcus, the Camry XSE is here — still want it today? I can hold 2pm or 4pm.'", icon: Robot, c: "bg-[var(--accent)]" },
  { t: "09:14:47", who: "System", text: "Warm bridge to J. Alvarez mobile — whispered context: Marcus, Camry, prior RAV4 service 11k ago", icon: Phone, c: "bg-emerald-600" },
  { t: "09:15:10", who: "J. Alvarez", text: "Call 02:18 — set appointment Thu 10:30, sent reminder sequence", icon: ChatsCircle, c: "bg-emerald-600" },
]

const EQUITY = [
  { name: "Amara Okafor", vehicle: "2019 RAV4 LE • 67k mi", equity: "+$4,210", payoff: "$8,900", market: "$13,110", nextAppt: "Today 10:00 svc", action: "Advisor hand-off" },
  { name: "Luis Ortega", vehicle: "2020 F-150 XLT • 54k mi", equity: "+$3,800", payoff: "$22,400", market: "$26,200", nextAppt: "Tomorrow 09:00", action: "SMS campaign" },
  { name: "Jen Wu", vehicle: "2018 Camry SE • 81k mi", equity: "+$2,050", payoff: "$6,100", market: "$8,150", nextAppt: "No appt", action: "Call task" },
]

// helper: adapt store lead → display shape
function adaptLead(raw: any, all: any[]): LeadDisplay {
  // already display shape (fallback)
  if (raw && typeof raw.name === "string" && typeof raw.vehicle === "string" && !("customerName" in raw)) {
    return raw as LeadDisplay
  }
  const l = raw
  const phoneRaw: string = l.dedupKeys?.phone || l.phone || ""
  // keep last 10 digits formatted like 615-298-4412 for queue, but preserve raw for detail
  const phone = phoneRaw.replace("+1-", "").replace("+1", "")
  const email: string = l.dedupKeys?.email || l.email || ""
  const sourceMap: Record<string, string> = { Website: "Website", ThirdParty: "Third-Party", Phone: "Phone", Showroom: "Showroom", Chat: "Chat", ServiceDrive: "ServiceDrive" }
  const source = sourceMap[l.source] || l.source || "Website"
  const vehicle: string = l.vehicleOfInterest || l.vehicle || "—"
  const score: number = l.aiScore ?? l.score ?? 0
  const grade: LeadDisplay["grade"] = (l.speedToLeadGrade || l.grade || "F") as any
  const seconds: number = l.speedToLeadSec != null ? l.speedToLeadSec : (l.seconds ?? 999)

  // status mapping store → display
  const rawStatus: string = l.status
  const statusMap: Record<string, LeadDisplay["status"]> = {
    new: "new",
    contacted: "engaged",
    appointment_set: "appointment",
    shown: "engaged",
    sold: "sold",
    duplicate: "new",
    lost: "rescued",
    unqualified: "rescued",
  }
  let status: LeadDisplay["status"] = (statusMap[rawStatus] ?? rawStatus ?? "new") as any
  // preserve sold explicitly even if mapping would hide
  if (rawStatus === "sold") status = "sold"

  const assignedTo: string = l.owner || l.assignedTo || "Unassigned"
  const clusterCount = all.filter((x: any) => x.masterId && l.masterId && x.masterId === l.masterId).length
  const dedup: string | undefined = (l.isDuplicateLead || l.duplicateOfLeadId || clusterCount > 1) ? (l.masterId || l.dedup) : undefined

  const lastMsg: string = l.notes || l.campaign || l.sourceDetail || l.lastMsg || ""
  const time: string = l.createdAt ? String(l.createdAt).slice(11, 16) : (l.time || "--:--")
  const dealId: string | undefined = l.dealId

  return {
    id: l.id,
    name: l.customerName || l.name || "Unknown",
    phone: phone || phoneRaw,
    email,
    source,
    vehicle,
    score,
    grade,
    status,
    assignedTo,
    seconds,
    dedup,
    lastMsg,
    time,
    dealId,
    raw: l,
  }
}

export default function CRMInbox() {
  const storeLeadsRaw = useStore(s => s.leads)
  const ingestLead = useStore(s => s.ingestLead)
  const convertLeadToDeal = useStore(s => s.convertLeadToDeal)

  // build display leads with fallback
  const allRaw: any[] = storeLeadsRaw.length ? storeLeadsRaw : (FALLBACK_LEADS as any[])
  const displayLeads: LeadDisplay[] = useMemo(() => allRaw.map(l => adaptLead(l, allRaw)), [allRaw])

  const [q, setQ] = useState("")
  const [filter, setFilter] = useState<"all"|"new"|"engaged"|"dedup">("all")
  const [selected, setSelected] = useState<string>(displayLeads[0]?.id || "LEAD-001")
  const cur = useMemo(() => displayLeads.find(l=>l.id===selected) || displayLeads[0], [displayLeads, selected])
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [convertMsg, setConvertMsg] = useState<string | null>(null)

  // keep selected in sync if leads change (e.g., ingest adds new lead at top)
  // if selected no longer exists, fallback; else keep

  const filtered = useMemo(()=> displayLeads.filter(l=>{
    if(q && !`${l.name} ${l.vehicle} ${l.phone}`.toLowerCase().includes(q.toLowerCase())) return false
    if(filter==="new") return l.status==="new"
    if(filter==="engaged") return l.status==="engaged"
    if(filter==="dedup") return !!l.dedup
    return true
  }),[displayLeads, q, filter])

  const sla = (s:number)=> s <=30 ? "text-emerald-700 bg-emerald-50 border-emerald-200" : s <=60 ? "text-amber-800 bg-amber-50 border-amber-200" : "text-red-700 bg-red-50 border-red-200"

  const handleIngest = () => {
    const sourcePool: Array<{ source: string; detail: string }> = [
      { source: "Website", detail: "Website — SEO" },
      { source: "Website", detail: "Website — Paid Search" },
      { source: "ThirdParty", detail: "Cars.com" },
      { source: "ThirdParty", detail: "AutoTrader" },
      { source: "Phone", detail: "Phone — Inbound" },
      { source: "ServiceDrive", detail: "Service Drive" },
      { source: "Showroom", detail: "Showroom Walk-In" },
    ]
    const pick = sourcePool[Math.floor(Math.random()*sourcePool.length)]
    const isDedupDemo = Math.random() > 0.42 // ~58% dedup to showcase phone+DL merge
    const nowIso = new Date().toISOString()
    const sec = Math.floor(11 + Math.random()*42) // keep <60s to show SLA met
    const grade: LeadDisplay["grade"] = sec <=30 ? "A" : sec <=60 ? "A" : sec <=300 ? "B" : "F"
    const idNum = 100 + allRaw.length + Math.floor(Math.random()*900)
    const id = `LEAD-${String(idNum).padStart(3,"0")}`

    let newLead: any
    if (isDedupDemo) {
      // real-time dedup demo: same phone+DL as M-008 (Jonathan Reeves) — phone+DL match
      newLead = {
        id,
        customerId: "CUS-008",
        customerName: "Jonathan Reeves",
        masterId: "M-008",
        isDuplicateLead: true,
        duplicateOfLeadId: "LEAD-001",
        source: pick.source,
        sourceDetail: pick.detail,
        campaign: pick.detail.includes("Cars.com") ? "Cars.com — dedup test" : "Ingest demo — phone+DL match",
        rooftopId: "dtown",
        rooftopName: "Sovereign Toyota Downtown",
        vehicleOfInterest: "2025 Toyota RAV4 Hybrid XLE Premium — Blueprint",
        stockNo: "T24093",
        status: "new",
        priority: "hot",
        owner: "M. Chen — BDC",
        ownerTeam: "BDC",
        createdAt: nowIso,
        firstResponseAt: new Date(Date.now()+ sec*1000).toISOString(),
        speedToLeadSec: sec,
        speedToLeadGrade: grade,
        attempts: 0,
        aiScore: 82 + Math.floor(Math.random()*12),
        consentStatus: "opted_in",
        dedupKeys: { phone: "+1-615-298-4412", email: `j.reeves615+${String(Date.now()).slice(-4)}@gmail.com` },
        notes: "Ingest demo — dedup phone+DL hit → merged to M-008 single customer file",
      }
    } else {
      const names = ["Noah Patel","Emma Brooks","Liam Torres","Avery Finch","Maya Singh","Ethan Cole","Sofia Delgado","Noah Kim"]
      const name = names[Math.floor(Math.random()*names.length)]
      const phoneRand = `+1-615-${String(200+Math.floor(Math.random()*700)).padStart(3,"0")}-${String(1000+Math.floor(Math.random()*9000)).padStart(4,"0")}`
      newLead = {
        id,
        customerId: `CUS-${900+Math.floor(Math.random()*90)}`,
        customerName: name,
        masterId: `M-${900+Math.floor(Math.random()*90)}`,
        isDuplicateLead: false,
        source: pick.source,
        sourceDetail: pick.detail,
        campaign: "Ingest demo — net-new",
        rooftopId: "dtown",
        rooftopName: "Sovereign Toyota Downtown",
        vehicleOfInterest: "2024 Toyota Camry XSE — New Inquiry",
        stockNo: "T24081",
        status: "new",
        priority: "warm",
        owner: "Unassigned — Round Robin Next",
        ownerTeam: "BDC",
        createdAt: nowIso,
        firstResponseAt: new Date(Date.now()+ sec*1000).toISOString(),
        speedToLeadSec: sec,
        speedToLeadGrade: grade,
        attempts: 0,
        aiScore: 68+Math.floor(Math.random()*22),
        consentStatus: "opted_in",
        dedupKeys: { phone: phoneRand, email: `${name.toLowerCase().replace(/\s+/g,".")}+demo@gmail.com` },
        notes: "Ingest demo — net-new lead, dedup clean, auto-assigned 2.1s",
      }
    }
    ingestLead(newLead)
    // auto-select the ingested lead so user sees dedup banner immediately
    setSelected(newLead.id)
    const msg = isDedupDemo
      ? `Ingested ${newLead.id} • ${pick.detail} • dedup phone+DL → merged to M-008 • SLA ${sec}s`
      : `Ingested ${newLead.id} • ${pick.detail} • dedup clean → new M file • SLA ${sec}s`
    setToast(msg)
    setTimeout(()=> setToast(null), 3200)
  }

  const handleConvert = () => {
    if (!cur) return
    // already sold?
    if (cur.status === "sold" || cur.raw?.status === "sold" || cur.dealId) {
      setToast(`Already sold • ${cur.dealId || cur.raw?.dealId || "deal exists"} — open F1 Flow`)
      setTimeout(()=> setToast(null), 2600)
      return
    }
    const dealId = convertLeadToDeal(cur.id)
    if (dealId) {
      const slaSec = cur.seconds <=60 ? 42 : cur.seconds
      setConvertMsg(`→ ${dealId} created • SLA ${slaSec}s`)
      setToast(`Converted ${cur.name} → ${dealId} • open F1 Flow to desk`)
      setTimeout(()=> setToast(null), 3400)
      setTimeout(()=> setConvertMsg(null), 5200)
    } else {
      // fallback: lead not found (maybe fallback seed without store mapping)
      setToast("Convert failed — lead not in store (fallback seed). Ingest a store lead first.")
      setTimeout(()=> setToast(null), 2800)
    }
  }

  if (!cur) return null

  const isSold = cur.status === "sold" || cur.raw?.status === "sold" || !!cur.dealId || !!cur.raw?.dealId
  const curDealId = cur.dealId || cur.raw?.dealId || (convertMsg ? convertMsg.match(/D-\d+/)?.[0] : undefined)

  return (
    <div className="mx-auto max-w-[1440px] space-y-4 p-4 lg:p-6">
      {/* toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="pointer-events-none fixed left-1/2 top-[68px] z-50 -translate-x-1/2 rounded-xl border border-zinc-900 bg-zinc-900 px-4 py-2.5 text-[12px] font-medium text-white shadow-xl"
          >
            <span className="inline-flex items-center gap-2"><Lightning size={14} weight="fill" className="text-amber-400" />{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[22px] font-[700] tracking-[-0.03em]">CRM Inbox</h1>
            <Badge variant="success" className="gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" /> LIVE</Badge>
            <span className="hidden md:inline-flex rounded-full bg-zinc-900 px-2 py-0.5 font-mono text-[10px] font-semibold text-white">E6 • Unified • F6 &lt;60s</span>
          </div>
          <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--text-muted)]">One customer, one conversation — dedup, speed-to-lead, warm bridge, coaching. No more re-keying.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="hidden md:inline font-mono text-[11px] text-[var(--text-muted)]">Speed-to-lead avg 42s • SLA 60s</span>
          <Badge variant="warning" className="gap-1"><WarningCircle size={12} weight="fill" /> 3 dedup clusters</Badge>
          <Button onClick={handleIngest} size="sm" className="gap-1.5 bg-zinc-900 text-white hover:bg-zinc-800">
            <Lightning size={14} weight="fill" className="text-amber-400" /> Ingest Lead
          </Button>
        </div>
      </div>

      {/* convert banner */}
      <AnimatePresence>
        {convertMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3"
          >
            <div className="flex flex-wrap items-center gap-2 text-[12px]">
              <span className="inline-flex items-center gap-1.5 font-mono font-bold text-emerald-800">
                <CheckCircle size={16} weight="fill" className="text-emerald-600" /> {convertMsg}
              </span>
              <span className="text-emerald-700">— navigation hint: open <span className="font-semibold">F1 Flow</span> to desk & fund</span>
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2.5 py-1 text-[11px] font-semibold text-white">
                F1 Flow <ArrowRight size={12} weight="bold" />
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--border)] bg-white p-3.5 shadow-sm">
          <div className="font-mono text-[10px] tracking-[0.08em] text-zinc-500">SPEED-TO-LEAD</div>
          <div className="mt-1 flex items-baseline gap-2"><span className="font-mono text-[20px] font-[700] tabular-nums">42s</span><span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white">A • &lt;60s</span></div>
          <div className="mt-1 text-[11px] text-emerald-700">+18% vs last week • AI backstop 100%</div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-white p-3.5 shadow-sm">
          <div className="font-mono text-[10px] tracking-[0.08em] text-zinc-500">FRESH LEADS</div>
          <div className="mt-1 font-mono text-[20px] font-[700] tabular-nums">{displayLeads.length}</div>
          <div className="mt-1 text-[11px] text-[var(--text-muted)]">5 unassigned • auto-assign 2.1s</div>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5">
          <div className="font-mono text-[10px] tracking-[0.08em] text-amber-800">MISSED CALLS RESCUED</div>
          <div className="mt-1 flex items-baseline gap-2"><span className="font-mono text-[20px] font-[700] tabular-nums">3</span><span className="text-[11px] font-medium text-amber-800">AI • F5</span></div>
          <div className="mt-1 text-[11px] text-amber-800">30–40% drop → 0 lost with AI</div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-white p-3.5 shadow-sm">
          <div className="font-mono text-[10px] tracking-[0.08em] text-zinc-500">APPT SET RATE</div>
          <div className="mt-1 font-mono text-[20px] font-[700] tabular-nums">38%</div>
          <div className="mt-1 text-[11px] text-emerald-700">+6 pts • show 71%</div>
        </div>
      </div>

      {/* main */}
      <div className="grid gap-4 lg:grid-cols-[360px_1fr_300px]">
        {/* queue */}
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5">
            <div className="relative flex-1">
              <MagnifyingGlass size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search name, vehicle, phone…" className="h-8 w-full rounded-xl border border-[var(--border-strong)] bg-white pl-8 pr-3 text-[12px] placeholder:text-zinc-400 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-muted)]" />
            </div>
            <Funnel size={16} className="text-zinc-400" />
          </div>
          <div className="flex gap-1 border-b border-[var(--border)] bg-[var(--surface-muted)] p-1.5">
            {(["all","new","engaged","dedup"] as const).map(k=>(
              <button key={k} onClick={()=>setFilter(k)} className={cn("flex-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold capitalize", filter===k? "bg-white shadow-sm border border-zinc-200 text-zinc-900":"text-zinc-500 hover:text-zinc-900")} >{k}</button>
            ))}
          </div>
          <div className="max-h-[560px] overflow-auto divide-y divide-[var(--border)]">
            {filtered.map(l=>(
              <button key={l.id} onClick={()=>{ setSelected(l.id); setConvertMsg(null)}} className={cn("flex w-full items-start gap-3 px-3 py-3 text-left hover:bg-[var(--surface-hover)]", selected===l.id && "bg-[var(--accent-muted)] border-l-2 border-l-[var(--accent)]")}>
                <span className={cn("mt-0.5 grid h-8 w-8 place-items-center rounded-full text-[11px] font-bold text-white shrink-0", l.status==="engaged"? "bg-emerald-600": l.status==="appointment"? "bg-sky-600": l.status==="sold" ? "bg-zinc-700" : "bg-zinc-900")}>{l.name.split(" ").map(w=>w[0]).join("").slice(0,2)}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 flex-wrap">
                    <span className="truncate text-[13px] font-semibold leading-none">{l.name}</span>
                    {l.dedup && <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-black"><ArrowsClockwise size={10} weight="bold" /> DEDUP {l.dedup}</span>}
                    {l.status==="sold" && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white"><CheckCircle size={10} weight="fill" /> SOLD{l.dealId? ` • ${l.dealId}`:""}</span>}
                  </span>
                  <span className="block truncate text-[11px] leading-snug text-[var(--text-muted)]">{l.vehicle}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-1">
                    <span className={cn("rounded-full border px-1.5 py-0.5 font-mono text-[10px] font-semibold", sla(l.seconds))}>{l.seconds}s • {l.grade}</span>
                    <span className="rounded-full bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-white">{l.source}</span>
                    <span className="font-mono text-[10px] text-[var(--text-faint)]">{l.time}</span>
                    {l.score>0 && <span className="font-mono text-[10px] text-[var(--text-faint)]">• {l.score}</span>}
                  </span>
                </span>
              </button>
            ))}
            {filtered.length===0 && (
              <div className="px-4 py-10 text-center text-[12px] text-[var(--text-muted)]">No leads match filter.</div>
            )}
          </div>
          <div className="bg-[var(--surface-muted)] px-3 py-2 text-center font-mono text-[11px] text-[var(--text-faint)]">{filtered.length} leads • dedup merged to one customer file</div>
        </div>

        {/* timeline */}
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--border)] bg-zinc-900 px-4 py-3 text-white">
            <span className="inline-flex items-center gap-2 text-[13px] font-semibold"><ChatCircleDots size={16} weight="fill" className="text-sky-400" /> {cur.name} — Unified timeline</span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px]">{cur.id} • {cur.phone}</span>
          </div>
          {cur.dedup && (
            <div className="mx-3 mt-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[11px]">
              <WarningCircle size={16} weight="fill" className="text-amber-600" />
              <span><span className="font-semibold">Dedup cluster {cur.dedup}:</span> 3 leads (OEM + Third-Party + Phone) merged on phone+DL • email typo auto-resolved • one customer file across 3 rooftops</span>
              <Badge variant="warning" className="ml-auto bg-white shrink-0">Merged ✓</Badge>
            </div>
          )}
          {isSold && (
            <div className="mx-3 mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[11px]">
              <CheckCircle size={16} weight="fill" className="text-emerald-600" />
              <span><span className="font-semibold">Sold — {curDealId || cur.dealId} </span> converted from lead • in F1 desking pipeline</span>
              <Badge variant="success" className="ml-auto bg-white text-emerald-700 border border-emerald-200">F1 Flow →</Badge>
            </div>
          )}
          <div className="space-y-3 p-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-center">
                <div className="font-mono text-[10px] tracking-widest text-[var(--text-muted)]">CUSTOMER FILE</div>
                <div className="text-[12px] font-semibold">{cur.name}</div>
                <div className="font-mono text-[11px] text-[var(--text-muted)] truncate">{cur.email}</div>
                <div className="mt-1 flex justify-center gap-1"><span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white">SHARED</span><span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] border">3 rooftops</span></div>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-white p-3">
                <div className="font-mono text-[10px] tracking-widest text-[var(--text-muted)]">SPEED-TO-LEAD</div>
                <div className="font-mono text-[18px] font-[700]">{cur.seconds}s</div>
                <div className={cn("inline-flex rounded-full border px-1.5 py-0.5 text-[10px] font-semibold", sla(cur.seconds))}>{cur.grade} • {cur.seconds <=60 ? "SLA met" : "Missed"}</div>
                <div className="mt-1 font-mono text-[10px] text-[var(--text-faint)]">{cur.seconds <=60 ? "<60s grade A/B — F6" : "F6 breach — AI backstop"}</div>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-white p-3">
                <div className="font-mono text-[10px] tracking-widest text-[var(--text-muted)]">ASSIGNED</div>
                <div className="text-[12px] font-semibold">{cur.assignedTo}</div>
                <div className="text-[11px] text-[var(--text-muted)]">Round-robin + skill rules • 2.1s</div>
                <div className="mt-1 flex gap-1.5">
                  <Button size="sm" variant="outline" className="h-7 gap-1 text-[11px] flex-1"><Phone size={12} /> Bridge now</Button>
                </div>
              </div>
            </div>

            {/* Convert to Deal action */}
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-[var(--surface-muted)] px-3 py-2.5">
              <Button
                onClick={handleConvert}
                disabled={isSold}
                size="sm"
                className={cn("gap-1.5", isSold ? "bg-zinc-300 text-zinc-600" : "bg-zinc-900 text-white hover:bg-zinc-800")}
              >
                {isSold ? <CheckCircle size={14} weight="fill" /> : <ArrowRight size={14} weight="bold" />}
                {isSold ? `Sold • ${curDealId || "Deal created"}` : "Convert to Deal"}
              </Button>
              {!isSold && <span className="text-[11px] text-[var(--text-muted)]">creates D-104x • wire to F1 Flow • desking →</span>}
              {isSold && curDealId && <span className="font-mono text-[11px] font-semibold text-emerald-700">→ {curDealId} created • SLA 42s • F1 Flow</span>}
              {convertMsg && !isSold && <span className="font-mono text-[11px] font-semibold text-emerald-700">{convertMsg} • F1 Flow</span>}
              <span className="ml-auto hidden items-center gap-1 text-[11px] text-[var(--text-muted)] md:inline-flex">
                <Lightning size={12} weight="fill" className="text-amber-500" /> F6 &lt;60s • F5 bridge logged
              </span>
            </div>

            {/* timeline */}
            <div className="relative space-y-0 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
              <div className="absolute bottom-4 left-[26px] top-4 w-px bg-[var(--border-strong)]" />
              {TIMELINE.map((t,i)=>(
                <div key={i} className="relative flex gap-3 py-2">
                  <span className={cn("relative z-10 grid h-7 w-7 place-items-center rounded-full text-white shrink-0", t.c)}><t.icon size={14} weight="bold" /></span>
                  <div className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-white px-3 py-2">
                    <div className="flex items-baseline gap-2"><span className="font-mono text-[11px] font-medium text-[var(--text-muted)]">{t.t}</span><span className="text-[12px] font-semibold">{t.who}</span><span className="ml-auto hidden rounded-full bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-white md:inline">{i+1}</span></div>
                    <div className="text-[12px] leading-snug text-[var(--text-secondary)]">{t.text}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* AI next-best response */}
            <div className="rounded-xl border border-[var(--accent-border)] bg-[var(--accent-muted)] p-3.5">
              <div className="flex items-center gap-2 text-[11px] font-semibold"><Sparkle size={14} weight="fill" className="text-[var(--accent)]" /> Generative CRM assist — Smart Communication (next-best response)</div>
              <div className="mt-2 rounded-xl border border-white bg-white p-3 text-[12px] leading-relaxed">
                Hi {cur.name.split(" ")[0]} — great, we have the {cur.vehicle.split("—")[0].trim()} in Blizzard Pearl on the lot. Want me to hold <span className="font-semibold">2pm today</span> for a test drive? I can have the trade paperwork ready if you bring the title. — <span className="text-[var(--text-muted)]">Draft • Press Send or Edit</span>
              </div>
              <div className="mt-2 flex gap-2">
                <Button size="sm" onClick={()=>{navigator.clipboard.writeText(`Hi ${cur.name.split(" ")[0]} — great, we have the ${cur.vehicle} in Blizzard ...`); setCopied(true); setTimeout(()=>setCopied(false),1200)}} className="gap-1"><Copy size={12} /> {copied? "Copied":"Use draft"}</Button>
                <Button size="sm" variant="outline" className="bg-white gap-1"><Eye size={12} /> View transcript</Button>
                <span className="ml-auto font-mono text-[11px] text-[var(--text-muted)]">Azure OpenAI • logged • human-override</span>
              </div>
            </div>

            {/* telephony */}
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-[11px]">
              <Phone size={14} className="text-emerald-600" /><span className="font-semibold">Telephony:</span> outbound bridge from personal cell still recorded via bridge • <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 font-medium text-emerald-700">Recording logged</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5"><ShieldCheck size={11} /> Two-party consent enforced by state</span>
            </div>
          </div>
        </div>

        {/* right: campaigns + equity */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
              <span className="inline-flex items-center gap-2 text-[12px] font-semibold"><Envelope size={14} className="text-[var(--accent)]" /> Cadences &amp; campaigns</span>
              <Badge variant="neutral" className="bg-white">3 active</Badge>
            </div>
            <div className="space-y-3 p-3.5">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
                <div className="text-[12px] font-semibold">No-show rescue • 48h SMS</div>
                <div className="text-[11px] text-[var(--text-muted)]">Lead → appointment → reminder → rescue if no-show. Open 41%.</div>
                <div className="mt-2 flex gap-1"><span className="rounded-full bg-white px-2 py-0.5 text-[11px] border">Day 1 SMS</span><span className="rounded-full bg-white px-2 py-0.5 text-[11px] border">Day 3 Call</span><span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[11px] font-semibold text-white">Auto</span></div>
              </div>
              <div className="rounded-xl border border-zinc-900 bg-zinc-900 p-3 text-white">
                <div className="flex items-center gap-2 text-[12px] font-semibold"><Users size={14} className="text-sky-400" /> Equity mining — RevenueRadar</div>
                <div className="mt-1 text-[11px] text-zinc-400">Nightly: payoff vs market • lease maturities • service-tomorrow triggers • ROI per segment</div>
                <div className="mt-2 space-y-1.5">
                  {EQUITY.map(e=>(
                    <div key={e.name} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2">
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12px] font-medium leading-none">{e.name}</span>
                        <span className="block font-mono text-[11px] text-zinc-400">{e.vehicle} • {e.equity}</span>
                      </span>
                      <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[11px] font-bold text-white">{e.action}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2 text-[11px]"><TrendUp size={12} className="text-emerald-400" /> Campaign attribution • sourced deals 12 • $41k gross <Button size="sm" variant="secondary" className="ml-auto h-6 bg-white text-zinc-900 gap-1 text-[11px]">Build segment <ArrowRight size={12} /></Button></div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3.5">
            <div className="flex items-center gap-2 text-[11px] font-semibold"><CalendarCheck size={14} /> Appointment &amp; no-show</div>
            <div className="mt-2 rounded-xl border border-[var(--border)] bg-white p-2.5">
              <div className="flex items-center justify-between"><span className="text-[12px] font-medium">Thu 10:30 • {cur.name} • {cur.vehicle.split(" ").slice(0,2).join(" ")}</span><Badge variant="success">Confirmed</Badge></div>
              <div className="mt-1 font-mono text-[11px] text-[var(--text-muted)]">Reminder: SMS 24h + 2h • no-show rescue auto-queued</div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100"><div className="h-full w-[68%] rounded-full bg-[var(--accent)]" /></div>
              <div className="mt-1 flex justify-between font-mono text-[10px] text-[var(--text-faint)]"><span>Sent</span><span>Show rate 71%</span></div>
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-[var(--border-strong)] bg-white px-3 py-2.5 text-center font-mono text-[10px] tracking-wide text-[var(--text-faint)]">E6 Inbox • &lt;5s assign • F6 bridge &lt;60s • F12 equity • F5 rescue</div>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-[11px] leading-relaxed text-[var(--text-muted)]">
        <span className="font-semibold text-[var(--text-primary)]">Showcase: E6 CRM + F6 Speed-to-Lead + F5 Missed-Call + F12 Equity Mining</span> • Dedup cluster M-008 (3 sources → one file), AI SMS 20s, bridge 47s &lt;60s SLA, unified timeline every touch, generative next-best draft, telephony bridge logged, equity hand-off to sales.
      </div>
    </div>
  )
}
