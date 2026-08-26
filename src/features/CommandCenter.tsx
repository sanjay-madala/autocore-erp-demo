import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChartBar,
  Clock,
  TrendUp,
  TrendDown,
  CurrencyDollar,
  Car,
  Wrench,
  Package,
  ShieldCheck,
  Lightning,
  WarningCircle,
  CheckCircle,
  Buildings,
  ArrowUpRight,
  CalendarBlank,
  EnvelopeSimple,
  HardDrives,
  Pulse,
  Eye,
  ClockClockwise,
  CaretRight,
  DotsThree,
  ArrowSquareOut,
} from "@phosphor-icons/react"
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
} from "recharts"
import { executiveKpis, kpiDaily, type KpiPoint } from "@/data/analytics"
import { useStore } from "@/lib/store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// ──────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)
const fmtNum = (n: number) => new Intl.NumberFormat("en-US").format(n)
const pct = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(1)}%`

// Fallback if analytics import fails (inline mock) — not used when file exists
const FALLBACK_KPIS = {
  frontGross: 3241,
  units: 184,
  eff: 92.4,
  cash: 4_100_000,
}

// Chart data derived from kpiDaily group
function buildVelocity(dataset: KpiPoint[]) {
  const group = dataset.filter((d) => d.rooftopId === "group").slice(-14)
  return group.map((d) => ({
    label: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    date: d.date,
    units: d.sales,
    leads: d.leads,
    gross: d.grossPerUnit,
    eff: d.efficiencyPct ?? 0,
    ro: d.roCount ?? 0,
  }))
}

const FIXED_OPS_QUEUE = [
  { bay: "BAY 03", job: "2022 RAV4 XLE • LOF + MPI", tech: "R. Ortiz", remain: "42m", eta: "11:30", type: "waiter" as const },
  { bay: "BAY 07", job: "2020 Tundra 1794 • Brake pulsation", tech: "J. Boone", remain: "18m", eta: "15:00", type: "loaner" as const },
  { bay: "BAY 11", job: "2024 Camry SE • 30K service", tech: "M. Reyes", remain: "06m", eta: "16:00", type: "drop" as const },
  { bay: "BAY 02", job: "2021 4Runner • 4 tires + align", tech: "—", remain: "queued", eta: "12:00", type: "waiter" as const },
]

const DEPT = {
  sales: { label: "Sales", target: 295, actual: 184, gross: 438_000, grossTarget: 580_000, spark: [2, 4, 0, 1, 3, 2, 1, 0, 2, 1, 3, 0, 1, 2] },
  service: { label: "Service", target: 58_000, actual: 34_800, ro: 62, roTarget: 94, spark: [1820, 2440, 1890, 2100, 3100, 2680, 980, 2200, 1950, 2890, 2450, 3200, 3680, 1450] },
  parts: { label: "Parts", target: 54_000, actual: 38_720, grossPct: 36, grossTarget: 38, spark: [2100, 2380, 2650, 2890, 2440, 3120, 1840, 2210, 2380, 2680, 2520, 2890, 3420, 2100] },
}

// Consolidated GL — now LIVE from store (F8) but keep static fallback for aging/spark shape
const CONSOLIDATED_FALLBACK = [
  { rooftop: "Sovereign Toyota Downtown", code: "DTOWN", units: 6, front: 11_240, back: 4_880, svc: 12_400, parts: 14_200, cit: 29_824, floor: 77_900, aging: 1 },
  { rooftop: "Sovereign Ford North", code: "NORTH", units: 4, front: 8_120, back: 3_210, svc: 9_200, parts: 11_820, cit: 68_546, floor: 108_100, aging: 2 },
  { rooftop: "Sovereign Westside (Honda/BMW/Hyundai)", code: "WEST", units: 5, front: 9_640, back: 5_310, svc: 13_200, parts: 12_700, cit: 29_873, floor: 66_600, aging: 0 },
]
const CONSOLIDATED = CONSOLIDATED_FALLBACK

export default function CommandCenter() {
  const [now, setNow] = useState<Date>(new Date())
  const systemHealth = useStore(s=> s.systemHealth)
  const degraded = systemHealth.degraded
  const toggleDegraded = useStore(s=> s.toggleDegraded)
  const setDegraded = useStore(s=> s.setDegraded)
  const publishPostIncidentReport = useStore(s=> s.publishPostIncidentReport)
  const [rooftop, setRooftop] = useState<"group" | "dtown" | "north" | "westside">("group")
  const [showDoc, setShowDoc] = useState(false)
  // ── F8/F14 live pulse from store ──
  const vehicles = useStore(s=> s.vehicles)
  const deals = useStore(s=> s.deals)
  const repairOrders = useStore(s=> s.repairOrders)
  const parts = useStore(s=> s.parts)
  const incentiveClaims = useStore(s=> s.incentiveClaims)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const velocity = useMemo(() => buildVelocity(kpiDaily), [])
  const exec = executiveKpis
  // live derived group pulse — F8
  const liveGroupGP = useMemo(()=> deals.reduce((s,d)=> s + (d.pencil?.gross ?? 0),0),[deals])
  const liveGroupGPDisplay = useMemo(()=> {
    if(liveGroupGP > 8000) return liveGroupGP
    const fallbackFront = CONSOLIDATED_FALLBACK.reduce((s,r)=> s + r.front + r.back,0)
    return fallbackFront + liveGroupGP
  },[liveGroupGP])
  const liveTransfers = useMemo(()=> vehicles.reduce((s,v)=> s + (((v as unknown as {transferHistory?:unknown[]}).transferHistory?.length) || 0),0),[vehicles])
  const liveUnits = useMemo(()=> deals.filter(d=> d.stage==="delivered").length || CONSOLIDATED_FALLBACK.reduce((s,r)=> s + r.units,0),[deals])
  const liveSparkSales = useMemo(()=>{
    const base=[2,4,0,1,3,2,1,0,2,1,3,0,1,2] as number[]
    const bump = Math.round(liveGroupGP/600) % 4
    return base.map((v,i)=> i===base.length-1? Math.max(0,v + bump + (liveTransfers%2)): v)
  },[liveGroupGP,liveTransfers])

  // KPI deltas from analytics.ts — GROUP PULSE LIVE from store (F8)
  const kpis = useMemo(
    () => [
      {
        k: "GROUP GP",
        v: fmt(liveGroupGPDisplay),
        sub: `Live sum deal gross • ${deals.length} deals • ${fmt(liveGroupGP)} front • + back/parts/svc consolidated`,
        delta: liveGroupGP>10000? pct(4.2) : pct(exec.vsPrior.grossDeltaPct),
        up: true,
        mono: fmt(liveGroupGPDisplay),
        hint: "Live • F8 store",
        icon: CurrencyDollar,
      },
      {
        k: "INTERCO TRANSFERS",
        v: `${fmtNum(liveTransfers)}`,
        sub: `Live count from vehicles transferHistory • ${liveTransfers===0? "no transfers yet — demo 14 static till first live" : "auto-posted at transaction time"}`,
        delta: liveTransfers>0? `+${liveTransfers}` : "+0",
        up: liveTransfers>=0,
        mono: `${liveTransfers}`,
        hint: "Intercompany • F8",
        icon: Buildings,
      },
      {
        k: "UNITS RETAILED",
        v: `${fmtNum(liveUnits)}`,
        sub: `MTD • ${deals.filter(d=>d.stage==="delivered").length} delivered live • ${liveUnits} with fallback • ${(liveUnits / 295 * 100).toFixed(0)}% to 295 target`,
        delta: pct(exec.vsPrior.salesDeltaPct),
        up: exec.vsPrior.salesDeltaPct >= 0,
        mono: `${liveUnits}`,
        hint: "Delivered • CIT creates on close",
        icon: Car,
      },
      {
        k: "SERVICE EFFICIENCY",
        v: `${FALLBACK_KPIS.eff.toFixed(1)}%`,
        sub: `Flag 68.4h / clock 48h best tech • grp ${exec.serviceEfficiency}% • ${repairOrders.length} ROs live • ${parts.length} parts • ${incentiveClaims.length} incentive claims`,
        delta: "+2.4% vs LY Wk",
        up: true,
        mono: "92.4%",
        hint: "Live ROs • bays",
        icon: Wrench,
      },
    ],
    [exec, liveGroupGPDisplay, liveGroupGP, liveTransfers, liveUnits, deals, repairOrders.length, parts.length, incentiveClaims.length]
  )

  const filteredVelocity = useMemo(() => {
    if (rooftop === "group") return velocity
    const subset = kpiDaily.filter((d) => d.rooftopId === rooftop).map((d) => ({
      label: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      units: d.sales,
      leads: d.leads,
      gross: d.grossPerUnit,
      eff: d.efficiencyPct ?? 0,
    }))
    return subset.length ? subset : velocity
  }, [rooftop, velocity])

  const deptCards = useMemo(
    () => {
      const liveSvcSpark = (()=> {
        const base=[1820,2440,1890,2100,3100,2680,980,2200,1950,2890,2450,3200,3680,1450] as number[]
        const invoiced = repairOrders.filter(r=> r.status==="invoiced" || r.status==="completed").length
        const bump = invoiced * 42
        return base.map((v,i)=> i===base.length-1? v + bump : v)
      })()
      const livePartsSpark = (()=> {
        const base=[2100,2380,2650,2890,2440,3120,1840,2210,2380,2680,2520,2890,3420,2100] as number[]
        const stockVal = parts.reduce((s,p)=> s+ p.onHand,0) % 600
        return base.map((v,i)=> i===base.length-1? v + stockVal : v)
      })()
      const salesActualLive = liveUnits
      const salesGrossLive = liveGroupGPDisplay
      return [
      {
        title: "Sales",
        icon: Car,
        actual: salesActualLive,
        target: DEPT.sales.target,
        meta: `${fmt(salesGrossLive)} gross live • ${((salesActualLive / DEPT.sales.target) * 100).toFixed(0)}% to target • ${liveTransfers} xfers`,
        spark: liveSparkSales,
        color: "var(--accent)",
      },
      {
        title: "Service",
        icon: Wrench,
        actual: DEPT.service.actual,
        target: DEPT.service.target,
        meta: `${repairOrders.length} ROs live • ${fmt(DEPT.service.actual)} • ${liveSvcSpark.slice(-1)[0] === 1450 ? "Today lite" : "Today live"}`,
        spark: liveSvcSpark,
        color: "#0e7a41",
      },
      {
        title: "Parts",
        icon: Package,
        actual: DEPT.parts.actual,
        target: DEPT.parts.target,
        meta: `${parts.length} SKUs • ${DEPT.parts.grossPct}% gross • live spark • wholesale+retail`,
        spark: livePartsSpark,
        color: "#b95000",
      },
    ]
    },
    [liveSparkSales, liveUnits, liveGroupGPDisplay, liveTransfers, repairOrders, parts]
  )

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
  }
  const item = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] as const } },
  }

  const liveConsolidation = useMemo(()=>{
    const s = useStore.getState()
    return s.getGroupConsolidation()
  },[vehicles, deals, repairOrders, parts, incentiveClaims])
  const groupTotals = useMemo(() => {
    const g = liveConsolidation.group
    return { units: g.units, front: g.frontGross, back: g.backGross, svc: g.svcGross, parts: g.partsGross, cit: g.citOpen, floor: g.floorplan }
  }, [liveConsolidation])
  const liveRowsForDisplay = useMemo(()=> {
    return liveConsolidation.rows.map((r,i)=> ({
      rooftop: r.rooftopName,
      code: CONSOLIDATED_FALLBACK[i]?.code || r.rooftopId.toUpperCase().slice(0,4),
      units: r.units || CONSOLIDATED_FALLBACK[i]?.units || 0,
      front: r.frontGross,
      back: r.backGross,
      svc: r.svcGross,
      parts: r.partsGross,
      cit: r.citOpen,
      floor: r.floorplan,
      aging: CONSOLIDATED_FALLBACK[i]?.aging ?? 0,
    }))
  },[liveConsolidation])

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      {/* ── Header — live pulse ── */}
      <div className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-5 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="hidden h-8 w-8 place-items-center rounded-xl bg-zinc-900 text-white md:grid">
              <ChartBar size={16} weight="fill" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[16px] font-[700] tracking-tight">Command Center</h1>
                <span className="hidden rounded-full border border-[var(--accent-border)] bg-[var(--accent-muted)] px-2 py-0.5 text-[10px] font-[600] tracking-widest text-[var(--accent)] md:inline-flex">
                  E11 • E2 • E1 • F8 • F18
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-[600] text-emerald-700">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  LIVE
                </span>
                <span className="hidden items-center gap-1 font-mono text-[11px] text-[var(--text-muted)] md:inline-flex">
                  <Clock size={12} />
                  {now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} • {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} EST
                </span>
              </div>
              <p className="hidden text-[12px] leading-none text-[var(--text-muted)] md:block">
                Executive composite • Group COO / Dealer Principal / Controller • Sovereign Auto Group • 3 rooftops • real-time &lt;60s
              </p>
              <p className="font-mono text-[11px] text-[var(--text-muted)] md:hidden">
                {now.toLocaleTimeString()} EST • P1 / P2 / P11
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 md:inline-flex">
              <ShieldCheck size={14} weight="fill" className="text-emerald-600" />
              <span className="font-mono text-[11px] font-[650] text-emerald-800">99.95% SLA</span>
              <span className="h-3 w-px bg-emerald-200" />
              <span className="font-mono text-[10px] font-medium tracking-widest text-emerald-700">RTO 1H • RPO 15M</span>
            </div>
            <div className="hidden items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1.5 text-[11px] font-medium md:inline-flex">
              <Pulse size={14} className="text-[var(--accent)]" />
              Posting in &lt;60s
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowDoc((v) => !v)} className="hidden md:inline-flex">
              <CalendarBlank size={14} />
              {showDoc ? "Hide DOC" : "6AM DOC"}
            </Button>
          </div>
        </div>

        {/* degraded-mode banner */}
        <AnimatePresence>
          {degraded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-amber-200 bg-amber-50"
            >
              <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-2 px-5 py-2.5 md:px-6">
                <div className="flex items-center gap-2 text-[12px] font-medium text-amber-900">
                  <WarningCircle size={16} weight="fill" className="text-amber-600" />
                  <span className="font-mono text-[11px] font-[700] tracking-widest">DEGRADED MODE — {systemHealth.region} → {systemHealth.failoverRegion} • AUTOMATED FAILOVER</span>
                  <span className="hidden md:inline text-amber-800">Core deal/RO writes via {systemHealth.failoverRegion} • read-heavy degrade • cached lender rates “verify at funding” • {systemHealth.queuedMutations} txns queued • status {systemHealth.statusPage.replace("https://","")} • RTO {systemHealth.rto} • RPO {systemHealth.rpo}</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => setDegraded(false)} className="h-7 bg-white">
                  Restore nominal
                </Button>
                <Button size="sm" variant="outline" onClick={() => publishPostIncidentReport()} className="h-7 bg-white hidden md:inline-flex">
                  Publish post-incident report
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── KPI strip — 4-up mono ── */}
      <div className="mx-auto max-w-[1440px] px-5 pt-4 md:px-6">
        <motion.div initial="hidden" animate="visible" variants={container} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map((s) => (
            <motion.div key={s.k} variants={item} className="surface flex flex-col gap-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="text-label-mono leading-none text-[var(--text-muted)]">{s.k}</span>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)]">
                  <s.icon size={14} weight="bold" />
                </span>
              </div>
              <div className="font-mono text-[22px] font-[700] leading-none tracking-tight tabular-nums">{s.mono}</div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-[650] ${s.up ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}
                >
                  {s.up ? <TrendUp size={12} weight="bold" /> : <TrendDown size={12} weight="bold" />}
                  {s.delta}
                </span>
                <span className="text-[11px] leading-none text-[var(--text-muted)]">{s.hint}</span>
              </div>
              <div className="text-[11px] leading-snug text-[var(--text-muted)]">{s.sub}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Middle bento 12-col ── */}
        <div className="mt-4 grid grid-cols-12 gap-3">
          {/* left 8-col — showroom velocity chart */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
            className="surface col-span-12 flex flex-col overflow-hidden p-0 lg:col-span-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface-muted)]/60 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-7 w-7 place-items-center rounded-lg bg-zinc-900 text-white">
                  <ChartBar size={14} weight="fill" />
                </div>
                <div>
                  <h2 className="text-[13px] font-[650] leading-none tracking-tight">Showroom velocity</h2>
                  <p className="font-mono text-[11px] text-[var(--text-muted)]">Leads → units • 14-day trailing • E11 Bloomberg-dense</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 rounded-xl border border-[var(--border)] bg-white p-1">
                  {(["group", "dtown", "north", "westside"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRooftop(r)}
                      className={`rounded-lg px-2 py-1 font-mono text-[11px] font-[600] transition-colors-taste ${rooftop === r ? "bg-zinc-900 text-white shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
                    >
                      {r === "group" ? "GROUP" : r.toUpperCase()}
                    </button>
                  ))}
                </div>
                <span className="hidden items-center gap-1 rounded-full bg-zinc-900 px-2 py-1 font-mono text-[10px] font-medium tracking-widest text-white md:inline-flex">
                  14D
                </span>
              </div>
            </div>

            <div className="h-[280px] p-3 pr-1">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={filteredVelocity} margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
                  <CartesianGrid stroke="#e4e4e7" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} width={28} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#71717a" }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #e4e4e7", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                    formatter={(v: unknown, n: unknown) => [String(v), String(n)] as never}
                  />
                  <Bar yAxisId="left" dataKey="leads" name="Leads" fill="#0f62fe" radius={[6, 6, 0, 0]} barSize={18} opacity={0.9} />
                  <Bar yAxisId="left" dataKey="units" name="Units" fill="#09090b" radius={[6, 6, 0, 0]} barSize={10} />
                  <Line yAxisId="right" type="monotone" dataKey="gross" name="Gross / unit" stroke="#0e7a41" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border)] bg-[var(--surface-muted)]/40 px-4 py-2.5 text-[11px] text-[var(--text-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#0f62fe]" /> Leads
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-zinc-900" /> Units
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-600" /> Gross
              </span>
              <span className="ml-auto hidden items-center gap-1 font-mono md:inline-flex">
                <ClockClockwise size={12} /> Updated 09:42:11 • posts in &lt;60s
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 font-mono text-[10px] font-medium shadow-sm">
                Funnel 20.4% close • 49 leads → 10 sold
              </span>
            </div>
          </motion.div>

          {/* right 4-col stack */}
          <div className="col-span-12 flex flex-col gap-3 lg:col-span-4">
            {/* Fixed ops queue */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.34, delay: 0.06, ease: [0.16, 1, 0.3, 1] as const }}
              className="surface overflow-hidden p-0"
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
                <h3 className="inline-flex items-center gap-2 text-[13px] font-[650]">
                  <Wrench size={14} className="text-[var(--accent)]" /> Fixed ops queue
                  <span className="rounded-full bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium shadow-sm">Live</span>
                </h3>
                <span className="font-mono text-[11px] text-[var(--text-muted)]">3 active • 1 queued</span>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {FIXED_OPS_QUEUE.slice(0, 3).map((r) => (
                  <div key={r.bay} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="shrink-0 rounded-lg border border-[var(--border)] bg-white px-1.5 py-1 font-mono text-[10px] font-[700] tracking-wide">
                      {r.bay}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12px] font-[550] leading-tight">{r.job}</div>
                      <div className="font-mono text-[11px] text-[var(--text-muted)]">{r.tech} • ETA {r.eta}</div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-1 font-mono text-[11px] font-[650] ${r.remain === "queued" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-zinc-900 text-white"}`}
                    >
                      {r.remain}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5 bg-[var(--surface-muted)] px-4 py-2 text-[11px] text-[var(--text-muted)]">
                <Eye size={12} /> Bay view synced • dispatch board live
                <a className="ml-auto inline-flex items-center gap-1 font-medium text-[var(--accent)] hover:underline" href="#">
                  Open lane <CaretRight size={12} weight="bold" />
                </a>
              </div>
            </motion.div>

            {/* Migration progress */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.34, delay: 0.1, ease: [0.16, 1, 0.3, 1] as const }}
              className="rounded-2xl border border-zinc-900 bg-zinc-950 p-4 text-white"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-[0.12em] text-zinc-400">MIGRATION • E13</span>
                <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[10px] font-[700] tracking-wide text-zinc-900">WORKBENCH</span>
              </div>
              <div className="mt-2 text-[13px] font-[650] leading-tight">CDK → AutoCore cutover</div>
              <p className="text-[11px] leading-relaxed text-zinc-400">3 rooftops staged • GL trial balance matched to the penny • parts bins verified</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
                  <motion.div initial={{ width: 0 }} animate={{ width: "68%" }} transition={{ duration: 1, ease: "easeOut" }} className="h-full rounded-full bg-[var(--accent)]" />
                </div>
                <span className="font-mono text-[11px] font-[650]">68%</span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-white/10 px-2 py-2">
                  <div className="font-mono text-[12px] font-[700]">3/3</div>
                  <div className="font-mono text-[10px] tracking-wide text-zinc-400">EXTRACTED</div>
                </div>
                <div className="rounded-xl bg-white/10 px-2 py-2">
                  <div className="font-mono text-[12px] font-[700]">2/3</div>
                  <div className="font-mono text-[10px] tracking-wide text-zinc-400">PARALLEL</div>
                </div>
                <div className="rounded-xl bg-white px-2 py-2 text-zinc-900">
                  <div className="font-mono text-[12px] font-[700]">RTO 1H</div>
                  <div className="font-mono text-[10px] tracking-wide text-zinc-500">VERIFIED ✓</div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" className="flex-1 bg-white text-zinc-900 hover:bg-zinc-100">
                  Open workbench
                </Button>
                <Button size="sm" variant="outline" className="border-white/15 bg-white/10 text-white hover:bg-white/15">
                  Drill report
                </Button>
              </div>
            </motion.div>

            {/* Resilience card */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.34, delay: 0.14, ease: [0.16, 1, 0.3, 1] as const }}
              className="surface overflow-hidden p-0"
            >
              <div className="flex items-center justify-between bg-emerald-950 px-4 py-3 text-white">
                <span className="inline-flex items-center gap-2 text-[12px] font-[650]">
                  <ShieldCheck size={16} weight="fill" className="text-emerald-400" /> Resilience • E1
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-2 py-1 text-[11px] font-[700] text-white">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> NOMINAL
                </span>
              </div>
              <div className="grid grid-cols-3 divide-x divide-[var(--border)] bg-[var(--surface-muted)]/50 text-center">
                <div className="px-2 py-3">
                  <div className="font-mono text-[14px] font-[750] leading-none">1h</div>
                  <div className="font-mono text-[10px] tracking-widest text-[var(--text-muted)]">RTO</div>
                </div>
                <div className="px-2 py-3">
                  <div className="font-mono text-[14px] font-[750] leading-none">15m</div>
                  <div className="font-mono text-[10px] tracking-widest text-[var(--text-muted)]">RPO</div>
                </div>
                <div className="px-2 py-3">
                  <div className="font-mono text-[14px] font-[750] leading-none">99.95%</div>
                  <div className="font-mono text-[10px] tracking-widest text-[var(--text-muted)]">SLA</div>
                </div>
              </div>
              <div className="space-y-2 p-3">
                <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-white px-3 py-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Multi-region active/active
                  </span>
                  <span className="font-mono text-[11px] text-[var(--text-muted)]">us-east • us-west</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-white px-3 py-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium">
                    <HardDrives size={12} /> Immutable backup
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-[650] text-emerald-700">Tested 04/19</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => toggleDegraded()}
                >
                  <WarningCircle size={14} weight={degraded ? "fill" : "regular"} />
                  {degraded ? "Exit degraded-mode demo (store)" : "Simulate Region Impairment (F18)"}
                </Button>
                <p className="text-center font-mono text-[10px] tracking-wide text-[var(--text-faint)]">Post-CDK promise (§3.1) • real, not slideware • $1.02B lesson</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Lower: department scorecards ── */}
        <motion.div initial="hidden" animate="visible" variants={container} className="mt-3 grid grid-cols-12 gap-3">
          {deptCards.map((d) => {
            const pctAT = Math.round((d.actual / d.target) * 100)
            return (
              <motion.div key={d.title} variants={item} className="surface col-span-12 flex flex-col gap-3 p-4 md:col-span-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-[13px] font-[650]">
                    <span className="grid h-7 w-7 place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface-muted)]">
                      <d.icon size={14} weight="bold" style={{ color: d.color }} />
                    </span>
                    {d.title}
                  </span>
                  <Badge variant={pctAT >= 80 ? "success" : pctAT >= 50 ? "warning" : "neutral"} className="font-mono">
                    {pctAT}% of target
                  </Badge>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[20px] font-[700] leading-none tabular-nums">{fmtNum(d.actual)}</span>
                    <span className="font-mono text-[11px] text-[var(--text-muted)]">/ {fmtNum(d.target)}</span>
                    <span className={`ml-auto inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-[650] ${pctAT >= 70 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                      {pctAT >= 70 ? <TrendUp size={12} weight="bold" /> : <TrendDown size={12} weight="bold" />} {pctAT}%
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] leading-snug text-[var(--text-muted)]">{d.meta}</div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, pctAT)}%`, background: d.color }} />
                  </div>
                </div>
                <div className="h-[56px] rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/40 p-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={d.spark.map((v, i) => ({ i, v }))} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                      <Tooltip
                        contentStyle={{ borderRadius: 10, border: "1px solid #e4e4e7", fontSize: 11 }}
                        formatter={(val: unknown) => [String(val), d.title] as never}
                      />
                      <Line type="monotone" dataKey="v" stroke={d.color} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono text-[var(--text-muted)]">MTD spark • daily</span>
                  <a className="inline-flex items-center gap-1 font-medium text-[var(--accent)] hover:underline" href="#">
                    Drill <ArrowUpRight size={12} />
                  </a>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* ── Group consolidation table ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34, delay: 0.16, ease: [0.16, 1, 0.3, 1] as const }}
          className="surface mt-3 overflow-hidden p-0"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
            <h3 className="inline-flex items-center gap-2 text-[13px] font-[650]">
              <Buildings size={14} className="text-[var(--accent)]" /> Group consolidation • 3 rooftops → one GL
              <span className="hidden rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-[650] tracking-wide text-emerald-700 md:inline-flex">
                REAL-TIME • E2
              </span>
            </h3>
            <div className="flex items-center gap-2">
              <span className="hidden font-mono text-[11px] text-[var(--text-muted)] md:inline">Elims auto-posted • no spreadsheet</span>
              <Badge variant="success" className="gap-1">
                <CheckCircle size={12} weight="fill" /> Reconciled
              </Badge>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-zinc-950 text-[10px] font-[650] tracking-widest text-zinc-300">
                <tr>
                  <th className="px-4 py-2.5 font-[650]">ROOFTOP</th>
                  <th className="px-3 py-2.5 text-right">UNITS</th>
                  <th className="px-3 py-2.5 text-right">FRONT GROSS</th>
                  <th className="px-3 py-2.5 text-right">BACK GROSS</th>
                  <th className="px-3 py-2.5 text-right">SERVICE</th>
                  <th className="px-3 py-2.5 text-right">PARTS</th>
                  <th className="px-3 py-2.5 text-right">CIT OPEN</th>
                  <th className="px-3 py-2.5 text-right">FLOORPLAN</th>
                  <th className="px-3 py-2.5 text-center">AG 45+</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {liveRowsForDisplay.map((r) => (
                  <tr key={r.code} className="hover:bg-[var(--surface-hover)]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-900 text-[10px] font-[800] text-white">{r.code.slice(0, 2)}</span>
                        <span className="hidden font-[550] md:inline">{r.rooftop}</span>
                        <span className="font-[650] md:hidden">{r.code}</span>
                        <span className="hidden rounded-full bg-emerald-50 px-1.5 py-0.5 font-mono text-[10px] text-emerald-700 md:inline">LIVE</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums">{r.units}</td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums">{fmt(r.front)}</td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums">{fmt(r.back)}</td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums">{fmt(r.svc)}</td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums">{fmt(r.parts)}</td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums">{fmt(r.cit)}</td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums">{fmt(r.floor)}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-[700] ${r.aging === 0 ? "bg-emerald-500 text-white" : r.aging === 1 ? "bg-amber-500 text-black" : "bg-red-500 text-white"}`}>{r.aging}</span>
                    </td>
                  </tr>
                ))}
                <tr className="bg-zinc-900 font-mono text-white">
                  <td className="px-4 py-3 text-[11px] font-[700] tracking-widest">GROUP CONSOLIDATED</td>
                  <td className="px-3 py-3 text-right font-[700]">{groupTotals.units}</td>
                  <td className="px-3 py-3 text-right font-[700]">{fmt(groupTotals.front)}</td>
                  <td className="px-3 py-3 text-right font-[700]">{fmt(groupTotals.back)}</td>
                  <td className="px-3 py-3 text-right font-[700]">{fmt(groupTotals.svc)}</td>
                  <td className="px-3 py-3 text-right font-[700]">{fmt(groupTotals.parts)}</td>
                  <td className="px-3 py-3 text-right font-[700]">{fmt(groupTotals.cit)}</td>
                  <td className="px-3 py-3 text-right font-[700]">{fmt(groupTotals.floor)}</td>
                  <td className="px-3 py-3 text-center font-[700]">{CONSOLIDATED_FALLBACK.reduce((s, r) => s + r.aging, 0)}</td>
                </tr>
                <tr className="bg-[var(--accent-muted)] text-[11px]">
                  <td colSpan={9} className="px-4 py-2 font-mono text-[var(--accent)]">
                    ↳ Intercompany eliminations auto-posted: <span className="font-[650]">-{fmt(liveConsolidation.eliminations)}</span> ({liveConsolidation.transferDetails.length} transfers • {liveTransfers} live) • Trial balance consolidated in real time • no batch, no export • groupMeta 3 rooftops
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2.5 text-[11px] text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> GL balanced to the penny
            </span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">Controller close packet builds continuously — not at month-end</span>
            <a className="ml-auto inline-flex items-center gap-1 font-medium text-[var(--accent)] hover:underline" href="#">
              Open GL <ArrowSquareOut size={12} />
            </a>
          </div>
        </motion.div>

        {/* ── Scheduled DOC 6AM distribution preview ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34, delay: 0.18, ease: [0.16, 1, 0.3, 1] as const }}
          className="surface mt-3 overflow-hidden p-0"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] bg-white px-4 py-3">
            <h3 className="inline-flex items-center gap-2 text-[13px] font-[650]">
              <EnvelopeSimple size={14} className="text-[var(--accent)]" /> Scheduled DOC distribution • 06:00 EST daily
              <span className="hidden items-center gap-1 rounded-full bg-zinc-900 px-2 py-1 font-mono text-[10px] font-medium tracking-widest text-white md:inline-flex">
                RMI BAR • §6.10
              </span>
            </h3>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-[600] text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active • 18 recipients
              </span>
              <Button size="sm" variant="outline" onClick={() => setShowDoc((v) => !v)}>
                {showDoc ? "Hide preview" : "Preview"}
              </Button>
            </div>
          </div>

          <div className="grid gap-0 md:grid-cols-[320px_1fr]">
            <div className="border-r border-[var(--border)] bg-[var(--surface-muted)]/40 p-4">
              <div className="text-label-mono text-[var(--text-muted)]">Distribution — 18 recipients • sortable</div>
              <div className="mt-3 space-y-2">
                {[
                  { who: "Alex Morgan — Group COO", addr: "a.morgan@sovereign.auto", scope: "GROUP" },
                  { who: "S. Williams — Controller", addr: "s.williams@sovereign.auto", scope: "GROUP + ALL" },
                  { who: "GM • Downtown Toyota", addr: "gm.dtown@sovereign.auto", scope: "DTOWN" },
                  { who: "GM • Ford North", addr: "gm.north@sovereign.auto", scope: "NORTH" },
                  { who: "GM • Westside", addr: "gm.west@sovereign.auto", scope: "WEST" },
                  { who: "Dealer Principal • J. Sovereign", addr: "j.sovereign@sovereign.auto", scope: "GROUP • owner" },
                ].map((r) => (
                  <div key={r.addr} className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3 py-2">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-zinc-900 text-[10px] font-[700] text-white">{r.who.slice(0, 1)}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12px] font-[600] leading-none">{r.who}</div>
                      <div className="truncate font-mono text-[11px] text-[var(--text-muted)]">{r.addr}</div>
                    </div>
                    <span className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-1.5 py-0.5 font-mono text-[10px] font-medium">{r.scope}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                <CalendarBlank size={12} /> Next run <span className="font-mono font-[600] text-[var(--text-primary)]">Tomorrow 06:00 EST</span>
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-1 font-[650] text-white">
                  <CheckCircle size={12} weight="fill" /> Scheduled
                </span>
              </div>
            </div>

            <div className="p-0">
              {/* DOC preview table */}
              <div className="flex items-center justify-between border-b border-[var(--border)] bg-zinc-900 px-4 py-2.5 text-white">
                <span className="text-[12px] font-[650]">DOC composite preview — April MTD (group)</span>
                <span className="hidden font-mono text-[11px] text-zinc-400 md:inline">Composite • UCG format • auto-built from GL • no manual tie-out</span>
                <Button size="sm" variant="outline" className="h-7 border-white/15 bg-white text-zinc-900 hover:bg-zinc-100">
                  Export PDF
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-[var(--surface-muted)] font-mono text-[10px] tracking-widest text-[var(--text-muted)]">
                    <tr>
                      <th className="px-4 py-2 font-[600]">LINE</th>
                      <th className="px-3 py-2 text-right">MTD ACTUAL</th>
                      <th className="px-3 py-2 text-right">MTD BUDGET</th>
                      <th className="px-3 py-2 text-right">VAR</th>
                      <th className="px-3 py-2 text-right">PRIOR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)] font-mono">
                    {[
                      { line: "New vehicle gross", actual: 18900, budget: 22000, prior: 18200 },
                      { line: "Used vehicle gross", actual: 14200, budget: 18000, prior: 13800 },
                      { line: "F&I gross", actual: 9300, budget: 12000, prior: 8900 },
                      { line: "Service labor + parts", actual: 34800, budget: 36000, prior: 32200 },
                      { line: "Parts gross", actual: 13940, budget: 16200, prior: 12800 },
                      { line: "Total gross profit", actual: 91140, budget: 104200, prior: 85900, bold: true },
                      { line: "Total expenses", actual: 72400, budget: 74000, prior: 71800 },
                      { line: "Net before tax", actual: 18740, budget: 30200, prior: 14100, bold: true, accent: true },
                    ].map((r) => (
                      <tr key={r.line} className={`${r.bold ? "bg-zinc-900 text-white font-[650]" : "hover:bg-zinc-50"} ${r.accent ? "bg-emerald-50" : ""}`}>
                        <td className={`px-4 py-2 ${r.bold ? "text-white" : "text-[var(--text-primary)]"} ${!r.bold ? "font-[500]" : ""}`}>{r.line}</td>
                        <td className={`px-3 py-2 text-right tabular-nums ${r.bold ? "text-white" : ""}`}>{fmt(r.actual)}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-[var(--text-muted)]">{fmt(r.budget)}</td>
                        <td className={`px-3 py-2 text-right tabular-nums ${r.actual >= r.budget ? "text-emerald-700" : "text-amber-700"}`}>{r.actual >= r.budget ? "+" : ""}{fmt(r.actual - r.budget)}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-[var(--text-muted)]">{fmt(r.prior)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2.5 text-[11px]">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 font-medium shadow-sm">
                  <EnvelopeSimple size={12} /> Delivers to 18 inboxes • 06:00 EST • no manual build
                </span>
                <span className="font-mono text-[var(--text-muted)]">≥100 recipients supported (P1 bar)</span>
                <span className="ml-auto inline-flex items-center gap-1 font-medium text-[var(--accent)]">
                  <Clock size={12} /> Built live from GL • not an export
                </span>
              </div>

              <AnimatePresence>
                {showDoc && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-[var(--border)] bg-white"
                  >
                    <div className="space-y-3 p-4">
                      <div className="rounded-xl border border-[var(--border)] bg-zinc-950 p-3 font-mono text-[11px] leading-relaxed text-zinc-100">
                        <div className="font-[650] tracking-wide text-white">DOC distribution config (Flow F18 — Reynolds RMI par)</div>
                        <div className="mt-1 text-zinc-300">Schedule: daily 06:00 America/New_York • Recipients: 18 • Format: UCG composite (Toyota/Ford/Honda) • Source: real-time GL • Delivery: email + portal • Retention: 7yr</div>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <div className="rounded-lg bg-white/10 px-2.5 py-2">Group composite: DTOWN + NORTH + WEST • elims applied</div>
                          <div className="rounded-lg bg-white/10 px-2.5 py-2">Per-rooftop DOC also attached as tabs • OEM statement formats honored</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          Send test now
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          Edit recipients
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* footer spec note */}
        <div className="mt-4 rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3 text-[11px] leading-relaxed text-[var(--text-muted)]">
          <span className="font-[650] text-[var(--text-primary)]">Showcase: E11 Analytics + E2 Accounting + E1 Platform + F8 CIT + F18 RMI</span>
          {" • "}Single GL truth, group consolidation, real-time posting in &lt;60s, scheduled DOC at 06:00 to 100+ recipients, RTO/RPO resilience, Bloomberg-dense but airy (variance 6, density 5) • Zinc + cobalt • Motion stagger • Phosphor • Recharts.
        </div>
      </div>

      {/* mobile bottom meta — visible only small */}
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-2 px-5 py-4 text-[11px] text-[var(--text-muted)] md:hidden">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 font-medium text-emerald-700">
          <ShieldCheck size={12} weight="fill" /> 99.95%
        </span>
        <span className="font-mono">RTO 1H • RPO 15M</span>
        <button onClick={() => toggleDegraded()} className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 font-medium text-amber-800">
          Degraded demo
        </button>
      </div>
    </div>
  )
}
