import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { vehicles as seedVehicles, type Vehicle, type RooftopId, type VehicleStatus } from "@/data/vehicles"
import { useStore } from "@/lib/store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ArrowsLeftRight,
  ArrowSquareOut,
  Buildings,
  Car,
  ChartLine,
  CheckCircle,
  Clock,
  ClockClockwise,
  CurrencyDollar,
  Eye,
  MagnifyingGlass,
  MapPin,
  Package,
  ShieldCheck,
  TrendUp,
  WarningCircle,
  Wrench,
  X,
} from "@phosphor-icons/react"
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts"

/* ───────── helpers ───────── */
const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)
const fmtNum = (n: number) => new Intl.NumberFormat("en-US").format(n)

type MakeFilter = "all" | Vehicle["make"]
type RooftopFilter = "all" | RooftopId
type StatusFilter = "all" | VehicleStatus

const ROOFTOP_LABEL: Record<RooftopId, string> = {
  dtown: "Sovereign Toyota Downtown",
  north: "Sovereign Ford North",
  westside: "Sovereign Westside",
}
const ROOFTOP_SHORT: Record<RooftopId, string> = {
  dtown: "DTOWN",
  north: "NORTH",
  westside: "WEST",
}

function agingMeta(days: number) {
  if (days > 45) return { label: `${days}d • Aged`, variant: "danger" as const, dot: "bg-red-500" }
  if (days >= 30) return { label: `${days}d • Watch`, variant: "warning" as const, dot: "bg-amber-500" }
  if (days === 0) return { label: "Factory", variant: "neutral" as const, dot: "bg-zinc-400" }
  return { label: `${days}d`, variant: "success" as const, dot: "bg-emerald-500" }
}
function statusMeta(s: VehicleStatus) {
  switch (s) {
    case "stock":
      return { label: "Frontline", variant: "success" as const }
    case "recon":
      return { label: "Recon", variant: "warning" as const }
    case "ordered":
      return { label: "Factory Order", variant: "neutral" as const }
    case "in-transit":
      return { label: "In Transit", variant: "default" as const }
    case "sold":
      return { label: "Sold", variant: "neutral" as const }
    case "wholesale":
      return { label: "Wholesale", variant: "danger" as const }
  }
}

/* pricing history mock derived per vehicle – deterministic */
function priceHistory(v: Vehicle) {
  const base = v.internetPrice
  const points = 8
  return Array.from({ length: points }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (points - 1 - i) * 7)
    // small wobble around base
    const wobble = (Math.sin((v.mileage + i * 137) % 20) * 600) | 0
    const dropStep = i === points - 1 ? 0 : i === points - 2 ? -1200 : 0
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      price: Math.max(12000, base + wobble + dropStep - (points - 1 - i) * 220),
    }
  })
}

type SyndicationRow = { channel: string; status: "Synced" | "Pending" | "Error"; ago: string }
function syndicationFor(v: Vehicle): SyndicationRow[] {
  if (v.status === "ordered") return [
    { channel: "Website — Build & Price", status: "Synced", ago: "4m ago" },
    { channel: "Toyota Pipeline Feed", status: "Synced", ago: "7m ago" },
  ]
  if (v.status === "recon")
    return [
      { channel: "Website (Coming Soon)", status: "Pending", ago: "queued" },
      { channel: "AutoTrader", status: "Pending", ago: "—" },
      { channel: "Cars.com", status: "Pending", ago: "—" },
    ]
  return [
    { channel: "Dealer Website (Sincro)", status: "Synced", ago: "2m ago" },
    { channel: "AutoTrader", status: "Synced", ago: "4m ago" },
    { channel: "Cars.com", status: "Synced", ago: "4m ago" },
    { channel: "CarGurus", status: v.agingDays > 45 ? "Error" : "Synced", ago: v.agingDays > 45 ? "retry 6m" : "5m ago" },
    { channel: "Facebook Marketplace", status: "Synced", ago: "9m ago" },
  ]
}

/* ───────── component ───────── */
export default function Inventory() {
  const storeVehicles = useStore(s=> s.vehicles)
  const vehicles = storeVehicles.length ? storeVehicles as unknown as Vehicle[] : seedVehicles
  const deals = useStore(s=> s.deals)
  const [rooftop, setRooftop] = useState<RooftopFilter>("all")
  const [status, setStatus] = useState<StatusFilter>("all")
  const [make, setMake] = useState<MakeFilter>("all")
  const [q, setQ] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>("VEH-003")
  const [showTransfer, setShowTransfer] = useState(false)
  const [destRooftop, setDestRooftop] = useState<RooftopId>("north")

  const selected = useMemo(() => vehicles.find((v) => v.id === selectedId) ?? null, [selectedId, vehicles])

  const kpis = useMemo(() => {
    const sellable = vehicles.filter((v) => v.status !== "sold")
    const aged = sellable.filter((v) => v.agingDays > 45).length
    const recon = vehicles.filter((v) => (v as unknown as { reconStatus?: string }).reconStatus === "in_progress").length
    const transfersMTD = 14 // mock cross-rooftop transfers
    const avgDays = Math.round(sellable.reduce((s, v) => s + v.agingDays, 0) / Math.max(1, sellable.length))
    const frontline = vehicles.filter((v) => v.status === "stock").length
    return { total: sellable.length, aged, recon, transfersMTD, avgDays, frontline, soldViaF1: deals.filter(d=>d.stage==="delivered").length }
  }, [vehicles, deals])

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      if (rooftop !== "all" && v.rooftopId !== rooftop) return false
      if (status !== "all" && v.status !== status) return false
      if (make !== "all" && v.make !== make) return false
      if (q) {
        const hay = `${v.vin} ${v.stockNo} ${v.year} ${v.make} ${v.model} ${v.trim}`.toLowerCase()
        if (!hay.includes(q.toLowerCase())) return false
      }
      return true
    })
  }, [rooftop, status, make, q])

  // Transfer accounting preview
  const transferPreview = useMemo(() => {
    if (!selected) return null
    const from = selected.rooftopId
    const to = destRooftop
    if (from === to) return null
    const cost = selected.cost + selected.reconCost
    const transport = 450
    const fee = 199
    return {
      from: ROOFTOP_LABEL[from],
      to: ROOFTOP_LABEL[to],
      vin: selected.vin,
      entries: [
        { acct: "1300 — Floorplan Payable", debit: "", credit: fmt(cost), note: `reverse at ${ROOFTOP_SHORT[from]}` },
        { acct: "1400 — Vehicle Inventory", debit: fmt(cost), credit: "", note: `add at ${ROOFTOP_SHORT[to]}` },
        { acct: "6035 — Inter-Company Transfer Fee", debit: fmt(fee), credit: "", note: "income at source" },
        { acct: "5012 — Transport Expense", debit: fmt(transport), credit: "", note: "3rd-party carrier" },
      ],
      total: fmt(transport + fee),
    }
  }, [selected, destRooftop])

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05, delayChildren: 0.06 } },
  }
  const item = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] as const } },
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="hidden h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent)] text-white md:flex">
              <Buildings size={14} weight="fill" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[14px] font-semibold tracking-tight">Inventory</h1>
                <span className="hidden rounded-full border border-[var(--accent-border)] bg-[var(--accent-muted)] px-2 py-0.5 text-[10px] font-medium tracking-widest text-[var(--accent)] md:inline-flex">
                  E3 • F2 • F17
                </span>
              </div>
              <p className="hidden text-[12px] leading-none text-[var(--text-muted)] md:block">
                One VIN, one record group-wide • 15-min syndication • Transfer accounting automated
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Feed • 15 min SLA
            </span>
            <span className="hidden items-center gap-1 text-[11px] text-[var(--text-muted)] md:inline-flex">
              <ClockClockwise size={12} />
              Last sync 2m ago
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-5 py-5 md:px-6 md:py-6">
        {/* ── KPI strip — bento-but-trust — zinc + cobalt ── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={container}
          className="grid grid-cols-2 gap-3 md:grid-cols-4"
        >
          {[
            {
              label: "Total units (group)",
              value: fmtNum(kpis.total),
              sub: `${kpis.frontline} frontline • ${kpis.avgDays}d avg`,
              icon: Car,
              accent: false,
            },
            {
              label: "Aged >45 days",
              value: fmtNum(kpis.aged),
              sub: `${((kpis.aged / Math.max(1, kpis.total)) * 100).toFixed(0)}% of sellable • triggers pricing review`,
              icon: WarningCircle,
              variant: "danger" as const,
            },
            {
              label: "In recon",
              value: fmtNum(kpis.recon),
              sub: "Bay 2 est. 4/28 • cost rolls to VIN P&L",
              icon: Wrench,
              variant: "warning" as const,
            },
            {
              label: "Cross-rooftop transfers",
              value: fmtNum(kpis.transfersMTD),
              sub: "MTD • 6 pending • auto posts to GL",
              icon: ArrowsLeftRight,
              variant: "default" as const,
            },
          ].map((k) => (
            <motion.div key={k.label} variants={item} className="surface flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between">
                <span className="text-label-mono text-[var(--text-muted)]">{k.label}</span>
                <span
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border ${
                    (k as { variant?: string }).variant === "danger"
                      ? "border-red-200 bg-red-50 text-red-600"
                      : (k as { variant?: string }).variant === "warning"
                        ? "border-amber-200 bg-amber-50 text-amber-600"
                        : (k as { variant?: string }).variant === "default"
                          ? "border-[var(--accent-border)] bg-[var(--accent-muted)] text-[var(--accent)]"
                          : "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)]"
                  }`}
                >
                  <k.icon size={14} weight="bold" />
                </span>
              </div>
              <div>
                <div className="font-mono text-[26px] font-[650] leading-none tracking-tight tabular-nums">{k.value}</div>
                <div className="mt-1 text-[11px] leading-snug text-[var(--text-muted)]">{k.sub}</div>
              </div>
              <div className="mt-auto flex items-center gap-1 text-[11px] font-medium text-[var(--accent)]">
                <TrendUp size={12} weight="bold" /> vs last month
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Filter bar ── */}
        <div className="surface mt-4 flex flex-wrap items-center gap-2.5 p-3">
          <div className="relative flex-1 min-w-[220px]">
            <MagnifyingGlass size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="VIN, stock, or model…"
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-1">
              {(["all", "dtown", "north", "westside"] as const).map((id) => (
                <button
                  key={id}
                  onClick={() => setRooftop(id)}
                  className={`rounded-lg px-2.5 py-1 text-[12px] font-[500] transition-colors-taste ${
                    rooftop === id
                      ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-sm border border-[var(--border)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {id === "all" ? "All rooftops" : ROOFTOP_SHORT[id]}
                </button>
              ))}
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFilter)}
              className="h-8 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 pr-8 text-[13px] font-[450]"
            >
              <option value="all">All status</option>
              <option value="stock">Frontline</option>
              <option value="recon">Recon</option>
              <option value="ordered">Factory Order</option>
              <option value="in-transit">In Transit</option>
              <option value="sold">Sold</option>
            </select>

            <select
              value={make}
              onChange={(e) => setMake(e.target.value as MakeFilter)}
              className="h-8 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 pr-8 text-[13px] font-[450]"
            >
              <option value="all">All makes</option>
              <option value="Toyota">Toyota</option>
              <option value="Ford">Ford</option>
              <option value="Honda">Honda</option>
              <option value="BMW">BMW</option>
              <option value="Hyundai">Hyundai</option>
            </select>

            <span className="hidden items-center gap-1.5 pl-2 text-[11px] text-[var(--text-muted)] md:inline-flex">
              <Eye size={12} />
              {filtered.length} vehicles
            </span>
          </div>
        </div>

        {/* ── Vehicle grid ── */}
        <motion.div
          key={`${rooftop}-${status}-${make}-${q}`}
          initial="hidden"
          animate="visible"
          variants={container}
          className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
        >
          {filtered.map((v) => {
            const aging = agingMeta(v.agingDays)
            const st = statusMeta(v.status)
            const totalCost = v.cost + v.reconCost
            const gross = v.internetPrice - totalCost - v.pack
            const grossPositive = gross >= 0
            const costPct = Math.min(100, (totalCost / Math.max(1, v.internetPrice)) * 100)
            return (
              <motion.button
                key={v.id}
                variants={item}
                onClick={() => setSelectedId(v.id)}
                className={`group text-left surface flex flex-col overflow-hidden p-0 transition-taste hover:shadow-md ${
                  selectedId === v.id ? "ring-2 ring-[var(--accent)] ring-offset-0" : ""
                }`}
              >
                {/* image placeholder */}
                <div className="relative h-[156px] overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="flex flex-col items-center gap-2 text-[var(--text-faint)]">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/70 shadow-sm dark:bg-zinc-800">
                        <Car size={20} weight="duotone" />
                      </div>
                      <span className="text-[10px] font-medium tracking-widest text-zinc-500">IMAGE • {v.photos.length} PHOTOS</span>
                    </div>
                  </div>
                  {/* top badges */}
                  <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
                    <Badge variant={st.variant} className="backdrop-blur">
                      {st.label}
                    </Badge>
                    {v.certified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-1 text-[10px] font-semibold tracking-wide text-white">
                        <ShieldCheck size={10} weight="fill" /> CPO
                      </span>
                    )}
                  </div>
                  <div className="absolute right-2.5 top-2.5">
                    <Badge variant={aging.variant} className="shadow-sm">
                      <span className={`h-1.5 w-1.5 rounded-full ${aging.dot}`} />
                      {aging.label}
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 left-2.5 flex items-center gap-1 rounded-full bg-zinc-900/80 px-2 py-1 text-[10px] font-medium text-white backdrop-blur">
                    <MapPin size={10} weight="fill" /> {v.lotLocation}
                  </div>
                  <div className="absolute bottom-2 right-2.5 hidden items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-zinc-700 shadow-sm group-hover:flex">
                    <Eye size={10} /> View • {ROOFTOP_SHORT[v.rooftopId]}
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-3 p-3.5">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-[13px] font-semibold leading-tight">
                        {v.year} {v.make} {v.model}
                        <span className="font-normal text-[var(--text-muted)]"> — {v.trim}</span>
                      </h3>
                      <span className="shrink-0 rounded-md bg-[var(--surface-muted)] px-1.5 py-0.5 font-mono text-[10px] font-medium text-[var(--text-secondary)]">
                        {v.mileage === 0 || v.mileage < 20 ? "NEW" : fmtNum(v.mileage) + " mi"}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 font-mono text-[10px] leading-none text-[var(--text-muted)]">
                      <span className="rounded bg-zinc-900 px-1.5 py-1 font-medium tracking-wide text-white">VIN {v.vin.slice(-6)}</span>
                      <span className="rounded border border-[var(--border)] bg-[var(--surface)] px-1.5 py-1">STK {v.stockNo}</span>
                      <span className="hidden sm:inline">{v.exteriorColor} • {v.interiorColor}</span>
                    </div>
                  </div>

                  {/* pricing row */}
                  <div className="grid grid-cols-3 gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/60 p-2.5">
                    <div>
                      <div className="text-label-mono text-[var(--text-muted)]">Internet</div>
                      <div className="font-mono text-[14px] font-[700] leading-none tracking-tight">{fmt(v.internetPrice)}</div>
                      <div className="font-mono text-[10px] text-[var(--text-faint)] line-through">{fmt(v.listPrice)}</div>
                    </div>
                    <div className="border-l border-[var(--border)] pl-2.5">
                      <div className="text-label-mono text-[var(--text-muted)]">Cost roll-up</div>
                      <div className="font-mono text-[12px] font-semibold tabular-nums">{fmt(totalCost)}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">+{fmt(v.pack)} pack</div>
                    </div>
                    <div className="border-l border-[var(--border)] pl-2.5">
                      <div className="text-label-mono text-[var(--text-muted)]">Front gross</div>
                      <div className={`font-mono text-[13px] font-[700] ${grossPositive ? "text-emerald-700" : "text-red-600"}`}>
                        {grossPositive ? "+" : ""}{fmt(gross)}
                      </div>
                      <div className="inline-flex items-center gap-1 text-[10px] font-medium text-[var(--text-muted)]">
                        <ChartLine size={10} /> vAuto {v.vAutoScore ?? "—"}
                      </div>
                    </div>
                  </div>

                  {/* cost roll-up bar */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-medium tracking-wide text-[var(--text-muted)]">
                      <span className="font-mono uppercase">Cost • Recon • Pack</span>
                      <span className="font-mono">{fmt(totalCost + v.pack)} invested</span>
                    </div>
                    <div className="mt-1 flex h-1.5 overflow-hidden rounded-full bg-zinc-100">
                      <div className="bg-zinc-800" style={{ width: `${Math.max(8, (v.cost / (totalCost + v.pack)) * 100)}%` }} />
                      <div className="bg-amber-500" style={{ width: `${Math.max(2, (v.reconCost / (totalCost + v.pack)) * 100)}%` }} />
                      <div className="bg-[var(--accent)]" style={{ width: `${Math.max(2, (v.pack / (totalCost + v.pack)) * 100)}%` }} />
                    </div>
                    <div className="mt-1 flex gap-3 font-mono text-[10px] text-[var(--text-muted)]">
                      <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-zinc-800" />{fmt(v.cost)}</span>
                      <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />{fmt(v.reconCost)}</span>
                      <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />{fmt(v.pack)}</span>
                      <span className="ml-auto tabular-nums">{costPct.toFixed(0)}% of ask</span>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-[var(--border)] pt-2.5 text-[11px]">
                    <span className="inline-flex items-center gap-1.5 font-medium text-[var(--text-secondary)]">
                      <Buildings size={12} /> {ROOFTOP_SHORT[v.rooftopId]} • {v.bodyStyle}
                    </span>
                    <span className="font-mono text-[11px] text-[var(--text-muted)]">{v.floorplanLender}</span>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </motion.div>

        {filtered.length === 0 && (
          <div className="surface mt-4 grid place-items-center gap-2 p-12 text-center">
            <MagnifyingGlass size={20} className="text-[var(--text-faint)]" />
            <p className="text-[13px] font-medium">No vehicles match filters</p>
            <p className="text-[12px] text-[var(--text-muted)]">Try broadening rooftop or status.</p>
            <Button variant="outline" size="sm" onClick={() => { setRooftop("all"); setStatus("all"); setMake("all"); setQ("") }}>
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* ── Detail drawer ── */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-zinc-950/30 backdrop-blur-[2px]"
              onClick={() => setSelectedId(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 420, damping: 36 }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[640px] flex-col border-l border-[var(--border)] bg-[var(--surface)] shadow-2xl"
            >
              {/* drawer header */}
              <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] p-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[15px] font-semibold leading-tight">
                      {selected.year} {selected.make} {selected.model} • {selected.trim}
                    </h2>
                    <Badge variant={statusMeta(selected.status).variant}>{statusMeta(selected.status).label}</Badge>
                    <span className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-0.5 font-mono text-[10px] font-medium">
                      {ROOFTOP_LABEL[selected.rooftopId]}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[11px] text-[var(--text-muted)]">
                    <span>VIN {selected.vin}</span>
                    <span className="h-1 w-1 rounded-full bg-zinc-300" />
                    <span>STK {selected.stockNo}</span>
                    <span className="h-1 w-1 rounded-full bg-zinc-300" />
                    <span>{fmtNum(selected.mileage)} mi • {selected.exteriorColor}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedId(null)} aria-label="Close">
                  <X size={16} />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {/* quick stats */}
                <div className="grid grid-cols-3 gap-px border-b border-[var(--border)] bg-[var(--border)]">
                  {[
                    { k: "Internet price", v: fmt(selected.internetPrice), sub: `List ${fmt(selected.listPrice)}` },
                    { k: "Total cost", v: fmt(selected.cost + selected.reconCost), sub: `+ ${fmt(selected.pack)} pack` },
                    {
                      k: "Aging",
                      v: `${selected.agingDays}d`,
                      sub: selected.agingDays > 45 ? "Action required" : selected.agingDays > 30 ? "Watch" : "Healthy",
                    },
                  ].map((s) => (
                    <div key={s.k} className="bg-[var(--surface)] p-3">
                      <div className="text-label-mono text-[var(--text-muted)]">{s.k}</div>
                      <div className="font-mono text-[14px] font-semibold">{s.v}</div>
                      <div className="text-[11px] text-[var(--text-muted)]">{s.sub}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 p-4">
                  {/* Appraisal workflow — KBB + condition + RO link */}
                  <section className="surface overflow-hidden p-0">
                    <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-muted)] px-3.5 py-2.5">
                      <h3 className="inline-flex items-center gap-2 text-[12px] font-semibold">
                        <CurrencyDollar size={14} className="text-[var(--accent)]" /> Appraisal workflow
                        <span className="rounded-full bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium text-[var(--text-muted)] shadow-sm">KBB • Condition • Recon</span>
                      </h3>
                      <Badge variant="success" className="gap-1">
                        <CheckCircle size={12} weight="fill" /> Certified
                      </Badge>
                    </div>
                    <div className="grid gap-3 p-3.5 md:grid-cols-3">
                      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                        <div className="text-label-mono text-[var(--text-muted)]">KBB Fair Market</div>
                        <div className="font-mono text-[15px] font-[700]">{fmt(selected.cost + 1850)}</div>
                        <div className="text-[11px] text-[var(--text-muted)]">Trade-in {fmt(selected.cost - 600)} • Retail {fmt(selected.cost + 4200)}</div>
                        <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                          <TrendUp size={12} weight="bold" /> +2.1% vs last week
                        </div>
                      </div>
                      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                        <div className="text-label-mono text-[var(--text-muted)]">Condition</div>
                        <div className="mt-1 flex items-baseline gap-1">
                          <span className="font-mono text-[18px] font-[700]">4.2</span>
                          <span className="text-[11px] text-[var(--text-muted)]">/ 5.0</span>
                          <span className="ml-1 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">Recon needed</span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                          <div className="h-full bg-[var(--accent)]" style={{ width: "84%" }} />
                        </div>
                        <div className="mt-1 text-[10px] text-[var(--text-muted)]">Exterior 4 • Interior 4 • Mechanical 5 • Tires 3</div>
                      </div>
                      <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-label-mono text-amber-800">Recon RO</span>
                          <Wrench size={14} className="text-amber-700" />
                        </div>
                        <div className="font-mono text-[13px] font-semibold text-amber-900">RO-8842 • $1,845</div>
                        <div className="text-[11px] text-amber-800">Tires, detail, windshield • Bay 2</div>
                        <Button variant="outline" size="sm" className="mt-2 h-7 w-full bg-white">
                          Open RO <ArrowSquareOut size={12} />
                        </Button>
                      </div>
                    </div>
                    <div className="mx-3.5 mb-3.5 flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-[11px]">
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <Package size={12} /> Cost roll-up
                      </span>
                      <span className="font-mono">{fmt(selected.cost)} acq.</span>
                      <span className="text-zinc-300">+</span>
                      <span className="font-mono">{fmt(selected.reconCost)} recon</span>
                      <span className="text-zinc-300">+</span>
                      <span className="font-mono">{fmt(selected.pack)} pack</span>
                      <span className="text-zinc-300">=</span>
                      <span className="font-mono font-semibold">{fmt(selected.cost + selected.reconCost + selected.pack)} invested</span>
                      <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 font-mono text-[11px] shadow-sm">
                        Gross {fmt(selected.internetPrice - selected.cost - selected.reconCost - selected.pack)}
                      </span>
                    </div>
                  </section>

                  {/* Pricing engine + sparkline */}
                  <section className="surface overflow-hidden p-0">
                    <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-muted)] px-3.5 py-2.5">
                      <h3 className="inline-flex items-center gap-2 text-[12px] font-semibold">
                        <ChartLine size={14} className="text-[var(--accent)]" /> Pricing engine
                        <span className="rounded-full bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium text-[var(--text-muted)] shadow-sm">vAuto score {selected.vAutoScore}</span>
                      </h3>
                      <span className="text-[11px] text-[var(--text-muted)]">Governance: ±3% floor, mgr approval &gt;5%</span>
                    </div>
                    <div className="grid gap-3 p-3.5 md:grid-cols-[1.1fr_1.6fr]">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-xl border border-[var(--border)] p-2.5">
                            <div className="text-label-mono text-[var(--text-muted)]">List</div>
                            <div className="font-mono text-[13px] font-semibold">{fmt(selected.listPrice)}</div>
                          </div>
                          <div className="rounded-xl border border-[var(--accent-border)] bg-[var(--accent-muted)] p-2.5">
                            <div className="text-label-mono text-[var(--accent)]">Internet</div>
                            <div className="font-mono text-[13px] font-[700] text-[var(--accent)]">{fmt(selected.internetPrice)}</div>
                          </div>
                        </div>
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-2.5">
                          <div className="flex items-center justify-between text-[11px] font-medium">
                            <span>Market day supply</span>
                            <span className="font-mono">{selected.marketDaySupply} days</span>
                          </div>
                          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-200">
                            <div className="h-full bg-zinc-800" style={{ width: `${Math.min(100, (selected.marketDaySupply / 80) * 100)}%` }} />
                          </div>
                          <div className="mt-1 text-[10px] text-[var(--text-muted)]">Lower is hotter. Recon cost rolls to P&L pre-sale.</div>
                        </div>
                        <div className="flex gap-1.5">
                          <Button size="sm" className="flex-1">
                            Price at {fmt(selected.internetPrice - 500)}
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            Hold
                          </Button>
                        </div>
                      </div>
                      <div className="rounded-xl border border-[var(--border)] bg-white p-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-label-mono text-[var(--text-muted)]">8-week price history</span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                            <TrendUp size={10} weight="bold" /> -3.2% vs market
                          </span>
                        </div>
                        <div className="mt-2 h-[120px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={priceHistory(selected)} margin={{ left: 0, right: 6, top: 6, bottom: 0 }}>
                              <Tooltip
                                contentStyle={{ borderRadius: 10, border: "1px solid #e4e4e7", fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                                formatter={(v: any) => [fmt(Number(v ?? 0)), "Price"] as any}
                              />
                              <Line type="monotone" dataKey="price" stroke="var(--accent)" strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-1 flex justify-between font-mono text-[10px] text-[var(--text-muted)]">
                          <span>{priceHistory(selected)[0].date}</span>
                          <span>Today • 15-min governance</span>
                          <span>{priceHistory(selected)[priceHistory(selected).length - 1].date}</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Merchandising syndication */}
                  <section className="surface overflow-hidden p-0">
                    <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-muted)] px-3.5 py-2.5">
                      <h3 className="inline-flex items-center gap-2 text-[12px] font-semibold">
                        <ClockClockwise size={14} className="text-[var(--accent)]" /> Merchandising syndication
                        <span className="rounded-full bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium text-emerald-700 shadow-sm">15-min feed • last 2m</span>
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live
                      </span>
                    </div>
                    <div className="divide-y divide-[var(--border)]">
                      {syndicationFor(selected).map((r) => (
                        <div key={r.channel} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                          <div className="min-w-0">
                            <div className="text-[12px] font-[500] leading-none">{r.channel}</div>
                            <div className="font-mono text-[11px] text-[var(--text-muted)]">{r.ago} • SLA 15 min</div>
                          </div>
                          <Badge
                            variant={r.status === "Synced" ? "success" : r.status === "Pending" ? "warning" : "danger"}
                            className="shrink-0"
                          >
                            {r.status === "Synced" ? <CheckCircle size={12} weight="fill" /> : r.status === "Pending" ? <Clock size={12} /> : <WarningCircle size={12} weight="fill" />}
                            {r.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 bg-[var(--surface-muted)] px-3.5 py-2.5 text-[11px] text-[var(--text-muted)]">
                      <ShieldCheck size={12} className="text-emerald-600" />
                      Fix for CDK-era broken feeds (§3.1): state change → website + 3rd-party within 15 min. Audit logged.
                    </div>
                  </section>

                  {/* History */}
                  <section className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
                    <h4 className="text-label-mono text-[var(--text-muted)]">Vehicle timeline</h4>
                    <div className="mt-2 space-y-2">
                      {selected.history.slice(0, 4).map((h) => (
                        <div key={h.date + h.event} className="flex gap-2.5 text-[12px]">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-baseline gap-1.5">
                              <span className="font-medium leading-none">{h.event}</span>
                              <span className="font-mono text-[11px] text-[var(--text-muted)]">{h.date}</span>
                              <span className="text-[11px] text-[var(--text-muted)]">• {h.user}</span>
                            </div>
                            {h.detail && <div className="text-[11px] text-[var(--text-muted)]">{h.detail}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>

              {/* drawer footer — transfer */}
              <div className="border-t border-[var(--border)] bg-[var(--surface-muted)] p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[12px] font-semibold">Cross-rooftop transfer</div>
                    <div className="text-[11px] text-[var(--text-muted)]">Automated accounting • One VIN, group-wide (§6.13)</div>
                  </div>
                  <Button onClick={() => setShowTransfer(true)} className="shrink-0">
                    <ArrowsLeftRight size={14} weight="bold" /> Transfer
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Transfer modal ── */}
      <AnimatePresence>
        {showTransfer && selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-zinc-950/40 backdrop-blur-sm"
              onClick={() => setShowTransfer(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-1/2 top-1/2 z-[61] max-h-[90vh] w-[92%] max-w-[560px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
                <div>
                  <h3 className="text-[14px] font-semibold">Transfer {selected.stockNo} → new rooftop</h3>
                  <p className="font-mono text-[11px] text-[var(--text-muted)]">VIN {selected.vin} • {selected.year} {selected.make} {selected.model}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowTransfer(false)}>
                  <X size={16} />
                </Button>
              </div>

              <div className="space-y-4 p-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
                    <div className="text-label-mono text-[var(--text-muted)]">From</div>
                    <div className="text-[13px] font-semibold">{ROOFTOP_LABEL[selected.rooftopId]}</div>
                    <div className="font-mono text-[11px] text-[var(--text-muted)]">{ROOFTOP_SHORT[selected.rooftopId]} • Cost {fmt(selected.cost + selected.reconCost)}</div>
                  </div>
                  <label className="rounded-xl border border-[var(--accent-border)] bg-[var(--accent-muted)] p-3">
                    <div className="text-label-mono text-[var(--accent)]">To (destination)</div>
                    <select
                      value={destRooftop}
                      onChange={(e) => setDestRooftop(e.target.value as RooftopId)}
                      className="mt-1 w-full rounded-lg border border-[var(--accent-border)] bg-white px-2 py-1.5 text-[13px] font-medium"
                    >
                      <option value="dtown">Sovereign Toyota Downtown</option>
                      <option value="north">Sovereign Ford North</option>
                      <option value="westside">Sovereign Westside</option>
                    </select>
                  </label>
                </div>

                {transferPreview ? (
                  <div className="overflow-hidden rounded-xl border border-[var(--border)]">
                    <div className="flex items-center justify-between bg-zinc-900 px-3.5 py-2.5 text-white">
                      <span className="inline-flex items-center gap-2 text-[12px] font-semibold">
                        <ShieldCheck size={14} weight="fill" className="text-emerald-400" /> Automated accounting preview
                      </span>
                      <span className="font-mono text-[11px] text-zinc-300">Posts on confirm • real-time GL (E2)</span>
                    </div>
                    <div className="divide-y divide-[var(--border)] bg-white">
                      {transferPreview.entries.map((en) => (
                        <div key={en.acct} className="grid grid-cols-[1.6fr_0.7fr_0.7fr] gap-2 px-3.5 py-2.5 text-[12px]">
                          <div>
                            <div className="font-mono text-[11px] font-semibold">{en.acct}</div>
                            <div className="text-[11px] text-[var(--text-muted)]">{en.note}</div>
                          </div>
                          <div className="text-right font-mono tabular-nums">{en.debit || "—"}</div>
                          <div className="text-right font-mono tabular-nums">{en.credit || "—"}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between bg-[var(--surface-muted)] px-3.5 py-2.5 text-[12px]">
                      <span className="font-medium">Net cash movement (transport + fee)</span>
                      <span className="font-mono text-[13px] font-[700]">{transferPreview.total}</span>
                    </div>
                    <div className="px-3.5 py-2 text-[11px] leading-snug text-[var(--text-muted)]">
                      One VIN record moves group-wide; floorplan and inventory schedules reconcile continuously. No overnight batch.
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[12px] text-amber-800">
                    Choose a different rooftop to preview the transfer.
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowTransfer(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={!transferPreview}
                    onClick={() => {
                      setShowTransfer(false)
                      setSelectedId(null)
                    }}
                  >
                    Confirm transfer • {transferPreview?.to.split(" ")[1] ?? "Confirm"}
                  </Button>
                </div>
                <p className="text-center font-mono text-[10px] tracking-wide text-[var(--text-faint)]">E3 • Cross-rooftop visibility + automated transfer accounting • Audit logged</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* footer spec note */}
      <div className="mx-auto max-w-[1440px] px-5 pb-8 md:px-6">
        <div className="rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3 text-[11px] leading-relaxed text-[var(--text-muted)]">
          <span className="font-semibold text-[var(--text-primary)]">Showcase: E3 Vehicle Inventory + F2 Used Lifecycle + F17 Cross-rooftop</span>
          {" • "}Single VIN record (E3), appraisal → recon RO → pricing governance → 15-min syndication (F2), transfer with automated GL post (F17). Dummy shape compatible with{" "}
          <span className="font-mono text-[var(--text-secondary)]">vehicles.ts</span> • Zinc + cobalt • Motion stagger • No stubs.
        </div>
      </div>
    </div>
  )
}
