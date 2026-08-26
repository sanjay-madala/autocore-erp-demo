import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { vehicles, type Vehicle } from "@/data/vehicles"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  Bank,
  Calculator,
  Car,
  CheckCircle,
  Clock,
  ClipboardText,
  Coins,
  CurrencyDollar,
  FileText,
  Lightning,
  SealCheck,
  ShieldCheck,
  Signature,
  TrendUp,
  WarningCircle,
  Wrench,
} from "@phosphor-icons/react"

/* ───────── dummy data ───────── */
type Lender = { id: string; name: string; rate: number; type: "Captive" | "Bank" | "CU"; maxTerm: number; live: boolean }
const LENDERS: Lender[] = [
  { id: "tfs", name: "Toyota Financial", rate: 6.49, type: "Captive", maxTerm: 75, live: true },
  { id: "ally", name: "Ally Bank", rate: 7.24, type: "Bank", maxTerm: 84, live: true },
  { id: "chase", name: "Chase Auto", rate: 7.99, type: "Bank", maxTerm: 84, live: true },
  { id: "cu", name: "Sovereign CU", rate: 6.99, type: "CU", maxTerm: 72, live: true },
  { id: "fordc", name: "Ford Credit", rate: 6.99, type: "Captive", maxTerm: 75, live: true },
]

type StateFee = { code: string; name: string; taxRate: number; docFee: number; titleFee: number }
const STATES: StateFee[] = [
  { code: "MI", name: "Michigan", taxRate: 0.06, docFee: 260, titleFee: 15 },
  { code: "CA", name: "California", taxRate: 0.0725, docFee: 85, titleFee: 29 },
  { code: "TX", name: "Texas", taxRate: 0.0625, docFee: 150, titleFee: 33 },
  { code: "FL", name: "Florida", taxRate: 0.06, docFee: 799, titleFee: 225 },
  { code: "NY", name: "New York", taxRate: 0.04, docFee: 175, titleFee: 50 },
  { code: "IL", name: "Illinois", taxRate: 0.0625, docFee: 358, titleFee: 199 },
  { code: "GA", name: "Georgia", taxRate: 0.066, docFee: 699, titleFee: 18 },
  { code: "OH", name: "Ohio", taxRate: 0.0575, docFee: 250, titleFee: 15 },
  { code: "AZ", name: "Arizona", taxRate: 0.056, docFee: 499, titleFee: 12 },
  { code: "AL", name: "Alabama", taxRate: 0.02, docFee: 599, titleFee: 23 },
]

type Product = { id: string; name: string; price: number; desc: string; cat: "Protection" | "Appearance" | "Service" }
const PRODUCTS: Product[] = [
  { id: "gap", name: "GAP Waiver", price: 899, desc: "Covers deficiency balance", cat: "Protection" },
  { id: "vsc", name: "VSC — 7yr/100k", price: 2495, desc: "Exclusionary, $100 ded.", cat: "Protection" },
  { id: "tire", name: "Tire & Wheel", price: 799, desc: "Curb, pothole, road hazard", cat: "Protection" },
  { id: "dent", name: "Dent & Ding (PDR)", price: 499, desc: "Unlimited PDR, 5yr", cat: "Appearance" },
  { id: "maint", name: "Prepaid Maintenance", price: 1295, desc: "4yr / 45k scheduled", cat: "Service" },
  { id: "appear", name: "Appearance Guard", price: 599, desc: "Interior/exterior 5yr", cat: "Appearance" },
]

type DisclosureStep = 1 | 2 | 3 | 4
type ESig = "Draft" | "Sent" | "Viewed" | "Signed" | "Funded"

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)
const fmt2 = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n)
const fmtNum = (n: number) => new Intl.NumberFormat("en-US").format(n)

function pmt(principal: number, apr: number, term: number) {
  const r = apr / 100 / 12
  if (r === 0) return principal / term
  return (principal * r * Math.pow(1 + r, term)) / (Math.pow(1 + r, term) - 1)
}

/* ───────── component ───────── */
export default function Desking() {
  // deal continuity — single object from online → desk
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("VEH-003")
  const [lenderId, setLenderId] = useState<string>("tfs")
  const [stateCode, setStateCode] = useState<string>("MI")
  const [down, setDown] = useState<number>(3500)
  const [rebate, setRebate] = useState<boolean>(true)
  const [loyalty, setLoyalty] = useState<boolean>(false)

  // F&I
  const [chosen, setChosen] = useState<Set<string>>(new Set(["gap"]))
  const [disclosure, setDisclosure] = useState<DisclosureStep>(1)
  const [eSig, setESig] = useState<ESig>("Draft")
  const [audit, setAudit] = useState<{ t: string; who: string; what: string }[]>([
    { t: "09:14 EST", who: "Website • J. Morgan", what: "Online deal started — RAV4 Hybrid • soft pull consent • trade captured" },
    { t: "09:22 EST", who: "Desk • S. Rivera (SM)", what: "Same record opened in desking • no re-key • F1 continuity ✓" },
    { t: "09:23 EST", who: "System", what: "Tax calc MI 6% • doc $260 + title $15 • lender rates live" },
  ])

  const vehicle: Vehicle | undefined = useMemo(() => vehicles.find((v) => v.id === selectedVehicleId), [selectedVehicleId])
  const lender: Lender | undefined = useMemo(() => LENDERS.find((l) => l.id === lenderId), [lenderId])
  const stateFee: StateFee | undefined = useMemo(() => STATES.find((s) => s.code === stateCode), [stateCode])

  // pencils — three terms sharing down/tax/incentives, rate bumps per term
  const pencils = useMemo(() => {
    if (!vehicle || !lender || !stateFee) return []
    const price = vehicle.internetPrice
    const incentives = (rebate ? 1500 : 0) + (loyalty ? 1000 : 0)
    const taxable = Math.max(0, price - incentives)
    const tax = taxable * stateFee.taxRate
    const fees = stateFee.docFee + stateFee.titleFee
    const baseFinanced = price - down - incentives + tax + fees

    const terms = [60, 72, 84] as const
    return terms.map((term) => {
      const rateBump = term === 72 ? 0.5 : term === 84 ? 1.0 : 0
      const apr = lender.rate + rateBump
      const fiProductsTotal = Array.from(chosen).reduce((s, id) => s + (PRODUCTS.find((p) => p.id === id)?.price ?? 0), 0)
      const financed = baseFinanced + fiProductsTotal
      const monthly = pmt(financed, apr, term)
      const totalInterest = monthly * term - financed
      return {
        term,
        apr,
        price,
        down,
        incentives,
        tax,
        fees,
        financed,
        monthly,
        totalInterest,
        fiTotal: fiProductsTotal,
      }
    })
  }, [vehicle, lender, stateFee, down, rebate, loyalty, chosen])

  const primaryPencil = pencils[1] // 72mo as default

  // disclosure enforcement
  const canToggleProducts = disclosure >= 2
  const canCaptureDecision = disclosure >= 2 && chosen.size >= 0

  function pushAudit(who: string, what: string) {
    const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    setAudit((a) => [...a, { t: now, who, what }])
  }

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
  }
  const cardVar = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.34, ease: [0.16, 1, 0.3, 1] as const } },
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      {/* top bar */}
      <div className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="hidden h-7 w-7 place-items-center rounded-lg bg-[var(--accent)] text-white md:grid">
              <Calculator size={14} weight="fill" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[14px] font-semibold tracking-tight">Desking & F&I</h1>
                <span className="rounded-full border border-[var(--accent-border)] bg-[var(--accent-muted)] px-2 py-0.5 text-[10px] font-medium tracking-widest text-[var(--accent)]">
                  E4 • E5 • F1 • F3 • F11
                </span>
                <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-700 md:inline-flex">
                  <Lightning size={10} weight="fill" /> &lt;500ms calc
                </span>
              </div>
              <p className="hidden text-[12px] leading-none text-[var(--text-muted)] md:block">
                One deal object • live lender rates • 50-state tax/fee • docuPAD guardrails
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1 text-[11px] font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live rates
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">3 pencils • shared record #8841</span>
          </div>
        </div>
      </div>

      {/* ── Deal continuity banner — single record ── */}
      <div className="mx-auto max-w-[1440px] px-5 pt-4 md:px-6">
        <div className="flex flex-col gap-3 rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-muted)] px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-[12px]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-2.5 py-1 text-[11px] font-semibold text-white">
              <SealCheck size={12} weight="fill" /> Single deal object
            </span>
            <span className="font-mono text-[12px] font-semibold text-[var(--accent)]">#8841 • ONLINE → DESK</span>
            <span className="hidden h-1 w-1 rounded-full bg-[var(--accent)] md:inline-block" />
            <span className="text-[var(--text-secondary)]">
              <span className="font-medium text-[var(--text-primary)]">J. Morgan</span> online 09:14 EST →{" "}
              <span className="font-medium text-[var(--text-primary)]">S. Rivera</span> desk 09:22 • no re-key
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <Badge variant="success" className="bg-white">
              <CheckCircle size={12} weight="fill" /> Payment match to penny (E5)
            </Badge>
            <Badge variant={eSig === "Signed" || eSig === "Funded" ? "success" : eSig === "Sent" || eSig === "Viewed" ? "warning" : "neutral"}>
              <Signature size={12} /> E-sign: {eSig}
            </Badge>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-5 py-4 md:px-6">
        {/* ── Controls — vehicle, lender, state, sliders, incentives ── */}
        <div className="surface grid gap-3 p-4 md:grid-cols-[1.2fr_0.9fr_0.7fr]">
          {/* vehicle selector */}
          <div className="space-y-2">
            <label className="text-label-mono text-[var(--text-muted)]">Vehicle (from inventory)</label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="flex h-9 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[13px] font-[500]"
            >
              {vehicles
                .filter((v) => v.status !== "ordered")
                .slice(0, 8)
                .map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.year} {v.make} {v.model} {v.trim} • {fmt(v.internetPrice)} • {v.stockNo}
                  </option>
                ))}
            </select>
            {vehicle && (
              <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-[var(--text-muted)]">
                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-1 text-[10px] font-semibold text-white">
                  <Car size={10} weight="fill" /> {vehicle.vin.slice(-6)} • {fmtNum(vehicle.mileage)} mi
                </span>
                <span>{vehicle.rooftopName}</span>
                <span className="hidden sm:inline">• {vehicle.exteriorColor}</span>
              </div>
            )}
          </div>

          {/* lender selector — live rates */}
          <div className="space-y-2">
            <label className="text-label-mono flex items-center gap-1 text-[var(--text-muted)]">
              <Bank size={11} /> Lender • live rate sheet
            </label>
            <select
              value={lenderId}
              onChange={(e) => setLenderId(e.target.value)}
              className="flex h-9 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[13px] font-[500]"
            >
              {LENDERS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} • {l.rate.toFixed(2)}% • {l.type} • to {l.maxTerm}mo {l.live ? "● live" : ""}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Live • updated 38s ago • <span className="font-mono font-medium text-emerald-700">&lt;12ms calc</span>
            </div>
          </div>

          {/* state + tax/fee */}
          <div className="space-y-2">
            <label className="text-label-mono text-[var(--text-muted)]">Tax / fee • 50-state calc</label>
            <select
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value)}
              className="flex h-9 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[13px] font-[500]"
            >
              {STATES.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code} • {s.name} • {(s.taxRate * 100).toFixed(2)}% • doc {fmt(s.docFee)}
                </option>
              ))}
            </select>
            {stateFee && (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-2 font-mono text-[11px] leading-snug">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Tax {(stateFee.taxRate * 100).toFixed(2)}%</span>
                  <span className="font-semibold">{primaryPencil ? fmt(primaryPencil.tax) : "—"}</span>
                </div>
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>Doc {fmt(stateFee.docFee)} + title {fmt(stateFee.titleFee)}</span>
                  <span className="font-medium text-[var(--text-primary)]">{primaryPencil ? fmt(primaryPencil.fees) : "—"}</span>
                </div>
              </div>
            )}
          </div>

          {/* sliders + incentives — full width */}
          <div className="grid gap-3 md:col-span-3 md:grid-cols-[1fr_1fr_1.1fr]">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/60 p-3">
              <div className="flex items-center justify-between">
                <span className="text-label-mono text-[var(--text-muted)]">Cash down</span>
                <span className="font-mono text-[13px] font-[700]">{fmt(down)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={12000}
                step={500}
                value={down}
                onChange={(e) => setDown(Number(e.target.value))}
                className="mt-2 h-1.5 w-full appearance-none rounded-full bg-zinc-200 accent-[var(--accent)]"
              />
              <div className="mt-1 flex justify-between font-mono text-[10px] text-[var(--text-muted)]">
                <span>$0</span>
                <span>$12,000</span>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/60 p-3">
              <div className="flex items-center justify-between">
                <span className="text-label-mono text-[var(--text-muted)]">Term focus (all pencils)</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 font-mono text-[11px] font-semibold shadow-sm">
                  <Clock size={11} /> 60 / 72 / 84
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                <TrendUp size={12} className="text-[var(--accent)]" />
                Rate bumps: 60 +0 • 72 +0.50 • 84 +1.00
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200">
                <div className="h-full w-[72%] bg-[var(--accent)]" />
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/60 p-3">
              <div className="text-label-mono text-[var(--text-muted)]">Incentives</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => setRebate((v) => !v)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors-taste ${
                    rebate ? "border-[var(--accent-border)] bg-[var(--accent-muted)] text-[var(--accent)]" : "border-[var(--border)] bg-white text-[var(--text-secondary)]"
                  }`}
                >
                  <Coins size={12} weight={rebate ? "fill" : "regular"} /> $1,500 Rebate {rebate ? "✓" : ""}
                </button>
                <button
                  onClick={() => setLoyalty((v) => !v)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors-taste ${
                    loyalty ? "border-[var(--accent-border)] bg-[var(--accent-muted)] text-[var(--accent)]" : "border-[var(--border)] bg-white text-[var(--text-secondary)]"
                  }`}
                >
                  <ShieldCheck size={12} weight={loyalty ? "fill" : "regular"} /> $1,000 Loyalty {loyalty ? "✓" : ""}
                </button>
              </div>
              <div className="mt-2 font-mono text-[11px] text-[var(--text-muted)]">
                Applied: {primaryPencil ? fmt(primaryPencil.incentives) : "—"} • reduces taxable • live &lt;500ms
              </div>
            </div>
          </div>
        </div>

        {/* ── 3 pencils side-by-side ── */}
        <motion.div
          key={`${selectedVehicleId}-${lenderId}-${stateCode}-${down}-${rebate}-${loyalty}-${Array.from(chosen).join(",")}`}
          initial="hidden"
          animate="visible"
          variants={container}
          className="mt-4 grid gap-3 md:grid-cols-3"
        >
          {pencils.map((pc) => {
            const isPrimary = pc.term === 72
            return (
              <motion.div
                key={pc.term}
                variants={cardVar}
                className={`surface flex flex-col overflow-hidden p-0 ${isPrimary ? "ring-2 ring-[var(--accent)] shadow-md" : ""}`}
              >
                <div className={`flex items-center justify-between px-4 py-3 ${isPrimary ? "bg-[var(--accent)] text-white" : "bg-[var(--surface-muted)]"}`}>
                  <div className="flex items-center gap-2">
                    <span className={`grid h-7 w-7 place-items-center rounded-lg text-[12px] font-[700] ${isPrimary ? "bg-white text-[var(--accent)]" : "bg-zinc-900 text-white"}`}>
                      {pc.term}
                    </span>
                    <div>
                      <div className={`text-[12px] font-semibold leading-none ${isPrimary ? "text-white" : "text-[var(--text-primary)]"}`}>{pc.term} months</div>
                      <div className={`font-mono text-[11px] ${isPrimary ? "text-white/80" : "text-[var(--text-muted)]"}`}>{pc.apr.toFixed(2)}% APR • {lender?.name}</div>
                    </div>
                  </div>
                  {isPrimary && <Badge variant="neutral" className="border-white/20 bg-white text-[var(--accent)]">Recommended</Badge>}
                </div>

                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="text-center">
                    <div className="text-label-mono text-[var(--text-muted)]">Monthly payment</div>
                    <div className="font-mono text-[28px] font-[750] leading-none tracking-tight tabular-nums">
                      {fmt2(pc.monthly)}
                      <span className="text-[12px] font-medium text-[var(--text-muted)]"> /mo</span>
                    </div>
                    <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 font-mono text-[10px] font-medium text-emerald-700">
                      <Lightning size={10} weight="fill" /> Calc 8ms • live &lt;500ms
                    </div>
                  </div>

                  <div className="space-y-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/50 p-3 font-mono text-[11px] leading-snug">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Price</span>
                      <span className="font-medium">{fmt(pc.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">− Down</span>
                      <span className="font-medium text-emerald-700">−{fmt(pc.down)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">− Incentives</span>
                      <span className="font-medium text-emerald-700">−{fmt(pc.incentives)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">+ Tax ({stateFee ? (stateFee.taxRate * 100).toFixed(2) : "—"}%)</span>
                      <span className="font-medium">+{fmt(pc.tax)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">+ Doc + Title</span>
                      <span className="font-medium">+{fmt(pc.fees)}</span>
                    </div>
                    {pc.fiTotal > 0 && (
                      <div className="flex justify-between border-t border-dashed border-[var(--border)] pt-1.5">
                        <span className="text-[var(--text-muted)]">+ F&I products</span>
                        <span className="font-medium">+{fmt(pc.fiTotal)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-[var(--border)] pt-1.5 text-[12px] font-semibold">
                      <span>Amount financed</span>
                      <span>{fmt(pc.financed)}</span>
                    </div>
                    <div className="flex justify-between text-[var(--text-muted)]">
                      <span>Total interest</span>
                      <span>{fmt(pc.totalInterest)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" className={isPrimary ? "" : "opacity-90"}>
                      Present <ArrowRight size={12} weight="bold" />
                    </Button>
                    <Button variant="outline" size="sm">
                      Print
                    </Button>
                  </div>
                  <div className="text-center font-mono text-[10px] tracking-wide text-[var(--text-faint)]">F11 • E4 live pencil desking</div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* ── F&I docuPAD + audit + e-sign ── */}
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_0.85fr]">
          {/* docuPAD menu */}
          <div className="surface overflow-hidden p-0">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] bg-zinc-900 px-4 py-3 text-white">
              <h3 className="inline-flex items-center gap-2 text-[13px] font-semibold">
                <ClipboardText size={16} weight="fill" className="text-white" /> F&I Menu • docuPAD-style
                <span className="hidden rounded-full bg-white/15 px-2 py-0.5 font-mono text-[10px] font-medium tracking-wide text-white md:inline-flex">
                  Disclosure sequence enforced
                </span>
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-900">
                <ShieldCheck size={12} weight="fill" className="text-emerald-600" /> Compliant
              </span>
            </div>

            {/* disclosure stepper */}
            <div className="grid grid-cols-4 gap-px bg-[var(--border)]">
              {[
                { n: 1, t: "Disclosures" },
                { n: 2, t: "Menu" },
                { n: 3, t: "Decision" },
                { n: 4, t: "E-Sign" },
              ].map((s) => {
                const active = disclosure >= s.n
                const current = disclosure === s.n
                return (
                  <div
                    key={s.n}
                    className={`flex items-center gap-2 px-3 py-2.5 text-[11px] font-medium ${active ? "bg-[var(--accent-muted)] text-[var(--accent)]" : "bg-[var(--surface-muted)] text-[var(--text-muted)]"} ${current ? "ring-1 ring-inset ring-[var(--accent)]" : ""}`}
                  >
                    <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-[700] ${active ? "bg-[var(--accent)] text-white" : "bg-white text-[var(--text-muted)] border border-[var(--border)]"}`}>
                      {active && s.n < disclosure ? <CheckCircle size={12} weight="fill" /> : s.n}
                    </span>
                    <span className="hidden sm:inline">{s.t}</span>
                  </div>
                )
              })}
            </div>

            <div className="p-4">
              {/* controls */}
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={disclosure >= 1 ? "secondary" : "default"}
                  onClick={() => {
                    if (disclosure === 1) {
                      setDisclosure(2)
                      pushAudit("F&I • M. Park", "Disclosures presented • Reg M, privacy, OFAC • timestamp logged")
                    }
                  }}
                  disabled={disclosure > 1}
                >
                  {disclosure > 1 ? <CheckCircle size={14} weight="fill" /> : <FileText size={14} />}
                  {disclosure > 1 ? "Disclosures presented ✓" : "Present disclosures"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={disclosure < 2}
                  onClick={() => {
                    if (disclosure === 2) {
                      setDisclosure(3)
                      pushAudit("F&I • M. Park", "Menu presented • all products disclosed with price caps • customer viewed 47s")
                    }
                  }}
                >
                  <ClipboardText size={14} /> {disclosure >= 3 ? "Menu presented ✓" : "Present menu"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!canCaptureDecision || disclosure < 3}
                  onClick={() => {
                    setDisclosure(4)
                    pushAudit("Customer • J. Morgan", `Decision captured • ${chosen.size} products accepted • audit stamped`)
                  }}
                >
                  Capture decision
                </Button>
              </div>

              {!canToggleProducts && (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
                  <WarningCircle size={14} weight="fill" /> Present disclosures to unlock product selection (E4 guardrail).
                </div>
              )}

              {/* product checkboxes */}
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {PRODUCTS.map((p) => {
                  const checked = chosen.has(p.id)
                  return (
                    <label
                      key={p.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors-taste ${
                        !canToggleProducts
                          ? "border-[var(--border)] bg-zinc-50 opacity-60"
                          : checked
                            ? "border-[var(--accent-border)] bg-[var(--accent-muted)]"
                            : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={!canToggleProducts}
                        onChange={(e) => {
                          const next = new Set(chosen)
                          if (e.target.checked) next.add(p.id)
                          else next.delete(p.id)
                          setChosen(next)
                        }}
                        className="mt-0.5 h-4 w-4 rounded border-zinc-300 accent-[var(--accent)]"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 text-[12px] font-semibold leading-none">
                          {p.name}
                          <span className="rounded-full bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium shadow-sm">{fmt(p.price)}</span>
                          <span className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] font-medium text-[var(--text-muted)]">
                            +{fmt(p.price / 72)}/mo*
                          </span>
                        </span>
                        <span className="text-[11px] leading-snug text-[var(--text-muted)]">{p.desc} • {p.cat}</span>
                      </span>
                    </label>
                  )
                })}
              </div>
              <p className="mt-2 font-mono text-[10px] tracking-wide text-[var(--text-faint)]">* Illustrative at 72mo • Product pricing capped per lender/compliance rules • Declines logged with timestamp</p>

              {/* monthly impact bar */}
              {primaryPencil && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-zinc-900 px-3.5 py-2.5 text-white">
                  <span className="text-[11px] font-medium tracking-wide text-zinc-300">F&I impact on 72mo pencil</span>
                  <span className="font-mono text-[13px] font-semibold">
                    +{fmt(Array.from(chosen).reduce((s, id) => s + (PRODUCTS.find((pr) => pr.id === id)?.price ?? 0), 0) / 72)} /mo • {fmt(Array.from(chosen).reduce((s, id) => s + (PRODUCTS.find((pr) => pr.id === id)?.price ?? 0), 0))} total
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* audit + e-sign + deal JSON */}
          <div className="space-y-4">
            {/* e-sign */}
            <div className="surface overflow-hidden p-0">
              <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
                <h4 className="inline-flex items-center gap-2 text-[12px] font-semibold">
                  <Signature size={14} className="text-[var(--accent)]" /> E-Sign & funding (E4)
                </h4>
                <Badge variant={eSig === "Signed" || eSig === "Funded" ? "success" : eSig === "Sent" || eSig === "Viewed" ? "warning" : "neutral"}>{eSig}</Badge>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-1">
                  {(["Draft", "Sent", "Viewed", "Signed", "Funded"] as const).map((s, i) => {
                    const idx = (["Draft", "Sent", "Viewed", "Signed", "Funded"] as const).indexOf(eSig)
                    const done = i <= idx
                    const cur = i === idx
                    return (
                      <div key={s} className="flex flex-1 items-center gap-1">
                        <div className={`grid h-7 w-7 place-items-center rounded-full border text-[10px] font-[700] ${done ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[var(--border)] bg-white text-[var(--text-muted)]"} ${cur ? "ring-2 ring-[var(--accent-muted)]" : ""}`}>
                          {done ? <CheckCircle size={12} weight="fill" /> : i + 1}
                        </div>
                        <span className={`hidden text-[10px] font-medium md:inline ${done ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>{s}</span>
                        {i < 4 && <span className={`h-px flex-1 ${done ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`} />}
                      </div>
                    )
                  })}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-2.5">
                    <div className="text-label-mono text-[var(--text-muted)]">Package</div>
                    <div className="font-medium">Retail + F&I • {primaryPencil ? fmt(primaryPencil.financed) : "—"} financed</div>
                    <div className="font-mono text-[11px] text-[var(--text-muted)]">Stips: DL, POI, proof residence</div>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-white p-2.5">
                    <div className="text-label-mono text-[var(--text-muted)]">Signer</div>
                    <div className="font-medium">J. Morgan • j.morgan@email.com</div>
                    <div className="text-[11px] text-[var(--text-muted)]">Remote link • expires 48h</div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    disabled={disclosure < 4}
                    onClick={() => {
                      const order: ESig[] = ["Draft", "Sent", "Viewed", "Signed", "Funded"]
                      const idx = order.indexOf(eSig)
                      const next = order[Math.min(idx + 1, order.length - 1)]
                      setESig(next)
                      pushAudit("System • DocuSign", `E-sign ${next} • IP logged • consent + disclosure version pinned`)
                    }}
                  >
                    <Signature size={14} /> {eSig === "Draft" ? "Send for e-sign" : eSig === "Sent" ? "Mark viewed" : eSig === "Viewed" ? "Mark signed" : eSig === "Signed" ? "Mark funded (CIT clear)" : "Funded ✓"}
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" disabled={eSig === "Draft"}>
                    Resend
                  </Button>
                </div>
                <p className="mt-2 text-center font-mono text-[10px] text-[var(--text-faint)]">Disclosure versions pinned • every present/accept/decline logged (E4 audit)</p>
              </div>
            </div>

            {/* audit log */}
            <div className="surface overflow-hidden p-0">
              <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
                <h4 className="inline-flex items-center gap-2 text-[12px] font-semibold">
                  <FileText size={14} className="text-[var(--accent)]" /> Audit log preview
                  <span className="rounded-full bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium shadow-sm">Immutable • exportable</span>
                </h4>
                <span className="text-[11px] text-[var(--text-muted)]">{audit.length} events</span>
              </div>
              <div className="max-h-[220px] divide-y divide-[var(--border)] overflow-y-auto">
                {audit.map((e, i) => (
                  <div key={i} className="flex gap-2.5 px-4 py-2.5">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-1.5">
                        <span className="font-mono text-[11px] font-medium text-[var(--text-muted)]">{e.t}</span>
                        <span className="text-[11px] font-semibold text-[var(--text-primary)]">{e.who}</span>
                      </div>
                      <div className="text-[12px] leading-snug text-[var(--text-secondary)]">{e.what}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between bg-[var(--surface-muted)] px-4 py-2 text-[11px]">
                <span className="inline-flex items-center gap-1 text-[var(--text-muted)]">
                  <ShieldCheck size={12} className="text-emerald-600" /> Safeguards Rule evidence • E12
                </span>
                <button
                  onClick={() => pushAudit("Controller • D. Alvarez", "Audit export requested • 4.2s • delivered to DMS audit store")}
                  className="font-medium text-[var(--accent)] hover:underline"
                >
                  Export →
                </button>
              </div>
            </div>

            {/* deal object JSON */}
            <div className="surface overflow-hidden p-0">
              <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2.5">
                <h4 className="text-label-mono text-[var(--text-muted)]">Deal object • single record #8841</h4>
                <Badge variant="success" className="bg-white">
                  Online ≡ Desk
                </Badge>
              </div>
              <pre className="overflow-x-auto bg-zinc-900 p-3 font-mono text-[11px] leading-relaxed text-zinc-100">
                {JSON.stringify(
                  {
                    dealId: "8841",
                    status: eSig === "Funded" ? "funded" : eSig === "Signed" ? "contracted" : "desking",
                    customer: { name: "Jordan Morgan", email: "j.morgan@email.com", priorOnline: "2026-04-24T09:14:00-04:00" },
                    vehicle: vehicle ? { vin: vehicle.vin, stockNo: vehicle.stockNo, year: vehicle.year, make: vehicle.make, model: vehicle.model, price: vehicle.internetPrice } : null,
                    lender: lender?.name,
                    state: stateCode,
                    pencils: pencils.map((pc) => ({ term: pc.term, apr: pc.apr, monthly: Number(pc.monthly.toFixed(2)), financed: pc.financed })),
                    fi: { products: Array.from(chosen), disclosureStep: disclosure, eSig },
                    continuity: "F1 • F3 • E5: online started, desk continued — one object, no re-key, payment matched to the penny",
                  },
                  null,
                  2
                )}
              </pre>
              <div className="flex items-center gap-2 bg-[var(--surface-muted)] px-3 py-2 font-mono text-[10px] tracking-wide text-[var(--text-faint)]">
                <CurrencyDollar size={10} /> E2 posts on delivery • CIT + floorplan + commission in real time • No batch
              </div>
            </div>
          </div>
        </div>

        {/* bottom note */}
        <div className="mt-4 rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3 text-[11px] leading-relaxed text-[var(--text-muted)]">
          <span className="font-semibold text-[var(--text-primary)]">Showcase: E4 Desking & F&I + E5 Digital Retailing + F1/F3 Omnichannel + F11 Menu</span>
          {" • "}Live pencils with real lender rates (E4), online deal ≡ desk record (E5/F1/F3), 50-state tax/fee + incentives (F11), docuPAD guardrails with disclosure sequencing and immutable audit (E4), e-contract to funding (E2). Three pencils side-by-side • &lt;500ms payment calc • inline mocked state • Tailwind + Motion + Phosphor.
        </div>
      </div>

      {/* disclosure guardrail hint — subtle */}
      <AnimatePresence>
        {disclosure === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="pointer-events-none fixed bottom-4 left-1/2 z-40 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-[12px] font-medium text-amber-800 shadow-lg md:flex"
          >
            <Wrench size={14} /> E4 guardrail: disclosures must be presented in order — menu is locked until step 1 completes.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
