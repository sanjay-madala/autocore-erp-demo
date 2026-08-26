import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { vehicles, type Vehicle } from "@/data/vehicles"
import { useStore } from "@/lib/store"
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
  Sparkle,
  TrendUp,
  WarningCircle,
  Copy,
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
  { code: "AL", name: "Alabama", taxRate: 0.04, docFee: 599, titleFee: 23 },
  { code: "AK", name: "Alaska", taxRate: 0, docFee: 399, titleFee: 15 },
  { code: "AZ", name: "Arizona", taxRate: 0.056, docFee: 499, titleFee: 12 },
  { code: "AR", name: "Arkansas", taxRate: 0.065, docFee: 129, titleFee: 29 },
  { code: "CA", name: "California", taxRate: 0.0725, docFee: 85, titleFee: 29 },
  { code: "CO", name: "Colorado", taxRate: 0.029, docFee: 599, titleFee: 21 },
  { code: "CT", name: "Connecticut", taxRate: 0.0635, docFee: 599, titleFee: 80 },
  { code: "DE", name: "Delaware", taxRate: 0, docFee: 0, titleFee: 35 },
  { code: "FL", name: "Florida", taxRate: 0.06, docFee: 799, titleFee: 225 },
  { code: "GA", name: "Georgia", taxRate: 0.066, docFee: 699, titleFee: 18 },
  { code: "HI", name: "Hawaii", taxRate: 0.04, docFee: 399, titleFee: 25 },
  { code: "ID", name: "Idaho", taxRate: 0.06, docFee: 399, titleFee: 21 },
  { code: "IL", name: "Illinois", taxRate: 0.0625, docFee: 358, titleFee: 199 },
  { code: "IN", name: "Indiana", taxRate: 0.07, docFee: 199, titleFee: 25 },
  { code: "IA", name: "Iowa", taxRate: 0.06, docFee: 180, titleFee: 25 },
  { code: "KS", name: "Kansas", taxRate: 0.065, docFee: 599, titleFee: 25 },
  { code: "KY", name: "Kentucky", taxRate: 0.06, docFee: 499, titleFee: 12 },
  { code: "LA", name: "Louisiana", taxRate: 0.0445, docFee: 499, titleFee: 68 },
  { code: "ME", name: "Maine", taxRate: 0.055, docFee: 499, titleFee: 35 },
  { code: "MD", name: "Maryland", taxRate: 0.06, docFee: 500, titleFee: 100 },
  { code: "MA", name: "Massachusetts", taxRate: 0.0625, docFee: 459, titleFee: 75 },
  { code: "MI", name: "Michigan", taxRate: 0.06, docFee: 260, titleFee: 15 },
  { code: "MN", name: "Minnesota", taxRate: 0.06875, docFee: 125, titleFee: 35 },
  { code: "MS", name: "Mississippi", taxRate: 0.07, docFee: 599, titleFee: 12 },
  { code: "MO", name: "Missouri", taxRate: 0.04225, docFee: 499, titleFee: 14 },
  { code: "MT", name: "Montana", taxRate: 0, docFee: 0, titleFee: 112 },
  { code: "NE", name: "Nebraska", taxRate: 0.055, docFee: 599, titleFee: 15 },
  { code: "NV", name: "Nevada", taxRate: 0.0685, docFee: 499, titleFee: 29 },
  { code: "NH", name: "New Hampshire", taxRate: 0, docFee: 0, titleFee: 35 },
  { code: "NJ", name: "New Jersey", taxRate: 0.06625, docFee: 699, titleFee: 60 },
  { code: "NM", name: "New Mexico", taxRate: 0.05125, docFee: 399, titleFee: 13 },
  { code: "NY", name: "New York", taxRate: 0.04, docFee: 175, titleFee: 50 },
  { code: "NC", name: "North Carolina", taxRate: 0.03, docFee: 599, titleFee: 58 },
  { code: "ND", name: "North Dakota", taxRate: 0.05, docFee: 299, titleFee: 12 },
  { code: "OH", name: "Ohio", taxRate: 0.0575, docFee: 250, titleFee: 15 },
  { code: "OK", name: "Oklahoma", taxRate: 0.045, docFee: 699, titleFee: 33 },
  { code: "OR", name: "Oregon", taxRate: 0, docFee: 0, titleFee: 98 },
  { code: "PA", name: "Pennsylvania", taxRate: 0.06, docFee: 449, titleFee: 62 },
  { code: "RI", name: "Rhode Island", taxRate: 0.07, docFee: 399, titleFee: 32 },
  { code: "SC", name: "South Carolina", taxRate: 0.06, docFee: 599, titleFee: 15 },
  { code: "SD", name: "South Dakota", taxRate: 0.045, docFee: 199, titleFee: 12 },
  { code: "TN", name: "Tennessee", taxRate: 0.07, docFee: 599, titleFee: 29 },
  { code: "TX", name: "Texas", taxRate: 0.0625, docFee: 150, titleFee: 33 },
  { code: "UT", name: "Utah", taxRate: 0.0485, docFee: 399, titleFee: 12 },
  { code: "VT", name: "Vermont", taxRate: 0.06, docFee: 599, titleFee: 42 },
  { code: "VA", name: "Virginia", taxRate: 0.043, docFee: 599, titleFee: 15 },
  { code: "WA", name: "Washington", taxRate: 0.065, docFee: 200, titleFee: 35 },
  { code: "WV", name: "West Virginia", taxRate: 0.06, docFee: 599, titleFee: 15 },
  { code: "WI", name: "Wisconsin", taxRate: 0.05, docFee: 399, titleFee: 164 },
  { code: "WY", name: "Wyoming", taxRate: 0.04, docFee: 299, titleFee: 15 },
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

// F11 — compliance sequence must be VSC → GAP → Tire → Dent (cannot skip)
const REQUIRED_SEQ = ["vsc","gap","tire","dent"] as const
type RequiredId = typeof REQUIRED_SEQ[number]
type FiAuditEntry = { at: string; productId: string; productName: string; action: "presented"|"accepted"|"declined"; seq: number; disclosureStep: DisclosureStep; orderIndex: number }

// PVR anomaly — per-manager penetration demo
const PVR_MANAGERS = [
  { mgr: "M. Park", penetration: 42, pvr: 1850, deals: 24 },
  { mgr: "S. Rivera", penetration: 28, pvr: 1420, deals: 31 },
  { mgr: "D. Alvarez", penetration: 31, pvr: 1380, deals: 18 },
  { mgr: "J. Alvarez", penetration: 30, pvr: 1290, deals: 22 },
] as const


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

  // F11 — per-product audit with disclosure sequence enforcement
  const [fiAudit, setFiAudit] = useState<FiAuditEntry[]>([])
  const [auditExportOpen, setAuditExportOpen] = useState(false)
  const [fiGuardMsg, setFiGuardMsg] = useState<string | null>(null)
  const systemHealth = useStore(s=> s.systemHealth)
  const degraded = systemHealth.degraded
  // E12 — 50-state tax/fee via complianceStore + Vitu/CVR titling
  const complianceState = useStore((s) => s.complianceState)
  const submitVituStore = useStore((s) => s.submitVitu)
  const [vituTracking, setVituTracking] = useState<string | null>(complianceState.vituSubmissions[0]?.tracking ?? null)
  const [vituSubmitted, setVituSubmitted] = useState<boolean>(complianceState.vituSubmissions.length > 0)
  // E10-T08 F&I Copilot — deal-structure vs lender rate sheets + guardrails
  const copilotSuggestions = useStore((s) => s.copilotSuggestions)
  const acceptCopilot = useStore((s) => s.acceptCopilot)
  const dismissCopilot = useStore((s) => s.dismissCopilot)
  const generateCopilotForDeal = useStore((s) => s.generateCopilotForDeal)

  const vehicle: Vehicle | undefined = useMemo(() => vehicles.find((v) => v.id === selectedVehicleId), [selectedVehicleId])
  const lender: Lender | undefined = useMemo(() => LENDERS.find((l) => l.id === lenderId), [lenderId])
  // 50-state via complianceState.taxRules — live pencil uses taxRules
  const taxRulesAsStateFee: StateFee[] = useMemo(() => complianceState.taxRules.map((r) => ({ code: r.code, name: r.state, taxRate: r.rate, docFee: r.docFee, titleFee: r.titleFee })), [complianceState.taxRules])
  const stateFee: StateFee | undefined = useMemo(() => taxRulesAsStateFee.find((s) => s.code === stateCode) ?? STATES.find((s) => s.code === stateCode), [taxRulesAsStateFee, stateCode])

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

  // F11 helpers — per-product log with disclosure sequence enforcement VSC→GAP→Tire→Dent
  function logFiAudit(productId: string, action: FiAuditEntry["action"]) {
    const prod = PRODUCTS.find(p=> p.id===productId)
    const seq = (fiAudit.filter(f=> f.productId===productId).length + 1)
    const orderIndex = REQUIRED_SEQ.indexOf(productId as RequiredId)
    const at = new Date().toISOString()
    const entry: FiAuditEntry = { at, productId, productName: prod?.name || productId, action, seq, disclosureStep: disclosure, orderIndex }
    setFiAudit(a=> [...a, entry])
    pushAudit(`F&I • ${action}`, `${prod?.name || productId} ${action} • ${new Date(at).toLocaleTimeString()} • seq ${fiAudit.length+1} • disclosure ${disclosure}`)
  }
  function canPresent(productId: string): { ok: boolean; reason?: string } {
    const idx = REQUIRED_SEQ.indexOf(productId as RequiredId)
    if (idx === -1) return { ok: true }
    if (disclosure < 2) return { ok: false, reason: "Present disclosures first (step 1)" }
    for (let i=0;i<idx;i++) {
      const requiredPrev = REQUIRED_SEQ[i]
      const hasDecision = fiAudit.some(e=> e.productId===requiredPrev && (e.action==="accepted" || e.action==="declined" || e.action==="presented"))
      const hasChosen = chosen.has(requiredPrev) || fiAudit.some(e=> e.productId===requiredPrev)
      if (!hasDecision && !hasChosen) {
        const prevName = PRODUCTS.find(p=> p.id===requiredPrev)?.name || requiredPrev
        const curName = PRODUCTS.find(p=> p.id===productId)?.name || productId
        return { ok: false, reason: `F11 guardrail: must present ${prevName} before ${curName} — sequence VSC → GAP → Tire → Dent cannot be skipped` }
      }
    }
    return { ok: true }
  }
  function handleFiToggle(productId: string, nextChecked: boolean) {
    const guard = canPresent(productId)
    if (!guard.ok) {
      setFiGuardMsg(guard.reason || "Sequence blocked")
      setTimeout(()=> setFiGuardMsg(null), 2800)
      return
    }
    setFiGuardMsg(null)
    const next = new Set(chosen)
    if (nextChecked) next.add(productId)
    else next.delete(productId)
    setChosen(next)
    logFiAudit(productId, nextChecked ? "accepted" : "declined")
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

      {/* F18 degraded banner — read-heavy, lender cached */}
      {degraded && (
        <div className="mx-auto max-w-[1440px] px-5 pt-3 md:px-6">
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[12px] text-amber-900">
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-[700] tracking-widest"><WarningCircle size={14} weight="fill" className="text-amber-600" /> DEGRADED — {systemHealth.region} impairment → failover {systemHealth.failoverRegion}</span>
            <span className="hidden md:inline">• core deal/RO write paths remain via {systemHealth.failoverRegion} • read-heavy degrade with banner</span>
            <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[11px] border border-amber-200">lender rates cached <span className="font-bold">“verify at funding”</span></span>
            <span className="rounded-full bg-amber-500 px-2 py-0.5 font-mono text-[11px] font-bold text-white">queued {systemHealth.queuedMutations} sync • conflict resolution</span>
            <a href={systemHealth.statusPage} className="underline font-mono text-[11px]">{systemHealth.statusPage.replace("https://","")}</a>
          </div>
        </div>
      )}

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

          {/* state + tax/fee — E12 50-state via taxRules */}
          <div className="space-y-2">
            <label className="text-label-mono text-[var(--text-muted)]">Tax / fee • 50-state calc <span className="font-mono text-[10px] text-[var(--accent)]">via taxRules</span></label>
            <select
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value)}
              className="flex h-9 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[13px] font-[500]"
            >
              {taxRulesAsStateFee.map((s) => (
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
          {/* E12 — Vitu/CVR EVR/titling integration — §6.12 integrate, don't rebuild */}
          <div className="md:col-span-3 mt-1 rounded-xl border border-[var(--accent-border)] bg-[var(--accent-muted)] p-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-900 text-white">
                <FileText size={16} weight="fill" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[12px] font-semibold">Vitu / CVR — EVR titling integration</span>
                  <span className="rounded-full bg-white border border-[var(--border)] px-2 py-0.5 font-mono text-[10px] font-semibold">§6.12 • integrate, don’t rebuild</span>
                  <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">E12</span>
                </div>
                <div className="text-[11px] leading-snug text-[var(--text-secondary)]">
                  Title & reg via Vitu/CVR — paperless EVR • lien payoff queued • 50-state fee data drives pencil above
                  {stateFee && (
                    <span className="ml-1 font-mono text-[11px] text-[var(--text-primary)]">
                      {stateFee.code} {(stateFee.taxRate * 100).toFixed(2)}% • doc {fmt(stateFee.docFee)} + title {fmt(stateFee.titleFee)} • via taxRules (§5.3)
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {vituSubmitted && vituTracking ? (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-medium text-emerald-800">
                  <CheckCircle size={14} weight="fill" className="text-emerald-600" />
                  Submitted to Vitu • tracking #{vituTracking} • lien payoff queued
                  <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">{vehicle?.vin.slice(-6) ?? "—"}</span>
                </motion.div>
              ) : null}
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  const vin = vehicle?.vin ?? "JTMAAACA4PA042118"
                  const t = submitVituStore(vin)
                  setVituTracking(t)
                  setVituSubmitted(true)
                  const msg = `Title submitted to Vitu • ${vin.slice(-6)} • tracking ${t} • CA 7.25% / TX 6.25% taxRules validated • lien payoff queued`
                  setAudit((a) => [...a, { t: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }), who: "System • Vitu", what: msg }])
                }}
              >
                <FileText size={14} weight="fill" />
                {vituSubmitted ? "Resubmit to Vitu/CVR" : "Submit title to Vitu/CVR"}
              </Button>
              <span className="font-mono text-[10px] text-[var(--text-faint)]">tracking #VIT-8841 mock • queued</span>
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
          <div className="space-y-4">
            {/* E10-T08 — F&I Copilot — deal-structure vs lender rate sheets + guardrails */}
            {(() => {
              const fiCopilots = copilotSuggestions.filter((c) => c.type === "fi" && !c.dismissed)
              const acceptedFi = copilotSuggestions.filter((c) => c.type === "fi" && c.accepted)
              const totalAcceptedLift = acceptedFi.reduce((s, c) => s + (c.expectedLift || 0), 0)
              const hasCopilot = fiCopilots.length > 0
              return (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] as const }}
                  className="surface overflow-hidden p-0 border-[var(--accent-border)] shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--accent-border)] bg-[var(--accent-muted)] px-4 py-3">
                    <h3 className="inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--accent)]">
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-[var(--accent)] text-white">
                        <Sparkle size={14} weight="fill" />
                      </span>
                      F&I Copilot
                      <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-[var(--accent)] border border-[var(--accent-border)]">
                        E10-T08 • lender guardrails
                      </span>
                      <span className="hidden rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white md:inline-flex">ROI proof</span>
                    </h3>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                      <ShieldCheck size={12} weight="fill" className="text-emerald-600" /> Guardrail ✓ • cap $3,200
                    </span>
                  </div>
                  <div className="p-4">
                    {!hasCopilot ? (
                      <div className="rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-muted)] p-4 text-center">
                        <div className="text-[12px] font-semibold text-[var(--text-secondary)]">No active F&I suggestion</div>
                        <div className="mt-1 font-mono text-[11px] text-[var(--text-muted)]">Generate a deal-structure suggestion for the current pencil — respects menu caps</div>
                        <Button size="sm" className="mt-3 gap-1.5" onClick={() => generateCopilotForDeal("D-1042")}>
                          <Sparkle size={12} weight="fill" /> Generate for D-1042
                        </Button>
                        {acceptedFi.length > 0 && (
                          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 font-mono text-[11px] font-semibold text-emerald-700">
                            <TrendUp size={12} weight="bold" /> ROI • {acceptedFi.length} accepted • +{fmt(totalAcceptedLift)} PVR — proof logged
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {fiCopilots.map((c) => (
                          <div key={c.id} className={`rounded-xl border p-3 ${c.accepted ? "border-emerald-200 bg-emerald-50" : "border-[var(--border)] bg-[var(--surface-muted)]/60"}`}>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="rounded-full bg-zinc-900 px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest text-white">COP • {c.id}</span>
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${c.guardrailOk ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
                                <ShieldCheck size={11} weight="fill" /> {c.guardrailOk ? "within cap $3,200 ✓" : "exceeds cap ✗ — not suggested"}
                              </span>
                              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 font-mono text-[10px] font-medium shadow-sm border border-[var(--border)]">
                                <Bank size={10} /> TFS 6.49% sheet • live
                              </span>
                              {c.accepted && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[11px] font-bold text-white"><CheckCircle size={11} weight="fill" /> Accepted</span>}
                            </div>
                            <div className={`mt-2 rounded-xl px-3 py-2.5 font-mono text-[13px] font-semibold leading-snug ${c.accepted ? "bg-emerald-500 text-white" : "bg-zinc-900 text-white"}`}>
                              {c.suggestion}
                              <span className="ml-1.5 hidden font-mono text-[11px] font-medium text-white/70 sm:inline">• lender rate sheets + compliance guardrails</span>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-[var(--text-muted)]">
                              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 border border-[var(--border)]"><TrendUp size={11} className="text-emerald-600" /> PVR +{fmt(c.expectedLift)} • +$11/mo</span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 border border-[var(--border)]">menu cap $3,200 ✓ • not beyond guardrail</span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 border border-[var(--border)]"><Lightning size={10} weight="fill" className="text-[var(--accent)]" /> Acceptance tracked</span>
                            </div>
                            {!c.accepted ? (
                              <div className="mt-3 flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  className="gap-1.5"
                                  onClick={() => {
                                    acceptCopilot(c.id)
                                    setChosen((prev) => {
                                      const next = new Set(prev)
                                      next.add("gap")
                                      return next
                                    })
                                    pushAudit("F&I Copilot • E10-T08", `Accepted • ${c.suggestion} • PVR +$${c.expectedLift} • payment +$11 • within cap $3,200 ✓ • lender guardrail enforced`)
                                    logFiAudit("gap", "accepted")
                                  }}
                                >
                                  <CheckCircle size={14} weight="fill" /> Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    dismissCopilot(c.id)
                                    pushAudit("F&I Copilot • E10-T08", `Dismissed • ${c.id} • not applied • guardrail respected • ROI not counted`)
                                  }}
                                >
                                  Dismiss
                                </Button>
                                <span className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] text-[var(--text-faint)]">
                                  <Wrench size={10} /> respects menu caps
                                </span>
                              </div>
                            ) : (
                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-emerald-200 px-3 py-1 text-[12px] font-semibold text-emerald-700">
                                  <CheckCircle size={12} weight="fill" /> Applied • GAP added • pencil updated • PVR +{fmt(c.expectedLift)}
                                </span>
                                <Button size="sm" variant="outline" onClick={() => dismissCopilot(c.id)}>
                                  Dismiss
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                        {/* ROI proof strip */}
                        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--accent-border)] bg-[var(--accent-muted)] px-3 py-2">
                          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-[var(--accent)]">
                            <TrendUp size={12} weight="bold" /> ROI proof • {acceptedFi.length} accepted • {acceptedFi.length === 0 ? "no lift yet" : `+${fmt(totalAcceptedLift)} PVR cumulative`}
                          </span>
                          <span className="font-mono text-[11px] text-[var(--text-muted)]">
                            guardrail never exceeds cap $3,200 • acceptance tracked for E10
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })()}
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
              <AnimatePresence>
                {fiGuardMsg && (
                  <motion.div initial={{opacity:0, y:-4}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-4}} className="mt-2 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-800">
                    <WarningCircle size={14} weight="fill" /> {fiGuardMsg}
                  </motion.div>
                )}
              </AnimatePresence>

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
                        onChange={(e) => handleFiToggle(p.id, e.target.checked)}
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
                        {fiAudit.filter(f=> f.productId===p.id).slice(-1).map(e=> (
                          <span key={e.at} className="ml-1 inline-flex items-center gap-1 rounded-full bg-white px-1.5 py-0.5 font-mono text-[10px] border">
                            {e.action} {new Date(e.at).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})} • seq {e.seq}
                          </span>
                        ))}
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
              <AnimatePresence>
                {auditExportOpen && (
                  <motion.div initial={{height:0, opacity:0}} animate={{height:"auto", opacity:1}} exit={{height:0, opacity:0}} className="overflow-hidden mt-3 rounded-xl border border-[var(--border)] bg-zinc-950">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
                      <span className="font-mono text-[11px] font-semibold text-white">F11 audit export — per-product timestamps + disclosure sequence</span>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px] text-white">{fiAudit.length} events • {REQUIRED_SEQ.join(" → ")}</span>
                    </div>
                    <pre className="max-h-[280px] overflow-auto p-3 font-mono text-[11px] leading-relaxed text-zinc-300">{JSON.stringify({ disclosureSequence: { required: REQUIRED_SEQ, currentStep: disclosure, presented: fiAudit.filter(f=> f.action==="presented").map(f=> f.productId), accepted: fiAudit.filter(f=> f.action==="accepted").map(f=> ({ id: f.productId, at: f.at, seq: f.seq })), declined: fiAudit.filter(f=> f.action==="declined").map(f=> ({ id: f.productId, at: f.at, seq: f.seq })), fullLog: fiAudit }, pvr: { managers: PVR_MANAGERS, anomaly: (()=>{ const avg = PVR_MANAGERS.reduce((s,m)=> s+m.penetration,0)/PVR_MANAGERS.length; const max = PVR_MANAGERS.reduce((a,b)=> a.penetration > b.penetration ? a : b); return max.penetration-avg>8 ? { outlier: max.mgr, penetration: max.penetration, avg: Number(avg.toFixed(1)), delta: Number((max.penetration-avg).toFixed(1)) } : null})() }, systemHealth: degraded ? { region: systemHealth.region, failover: systemHealth.failoverRegion, queued: systemHealth.queuedMutations, rto: systemHealth.rto, rpo: systemHealth.rpo } : null }, null, 2)}</pre>
                    <div className="flex items-center gap-2 px-3 py-2 bg-white/5 text-[11px] text-zinc-400">
                      <ShieldCheck size={12} className="text-emerald-400" /> Immutable • exportable • per-product accept/decline with timestamps • disclosure sequence VSC→GAP→Tire→Dent enforced
                      <button onClick={()=> navigator.clipboard.writeText(JSON.stringify(fiAudit))} className="ml-auto inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-zinc-900"><Copy size={12} /> Copy JSON</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
