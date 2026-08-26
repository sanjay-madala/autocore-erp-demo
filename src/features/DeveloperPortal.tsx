import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useStore } from "@/lib/store"
import {
  Code,
  PlugsConnected,
  Shield,
  ShieldCheck,
  CheckCircle,
  Clock,
  Copy,
  Play,
  Eye,
  Globe,
  Key,
  Plug,
  Lightning,
  Database,
  FileText,
  ArrowRight,
  WarningCircle,
  LockKey,
  ChartBar,
  DownloadSimple,
  Link as LinkIcon,
  CaretRight,
  Sparkle,
  Storefront,
  CreditCard,
  Wrench,
  Users,
  CaretDown,
  ArrowSquareOut,
  Flask,
  Timer,
} from "@phosphor-icons/react"

/* ───────── mock data ───────── */

type SpecId = "customers" | "vehicles" | "deals" | "ros"
type Endpoint = { method: "GET" | "POST" | "PATCH"; path: string; desc: string; scopes: string[] }

const SPECS: Record<SpecId, { label: string; count: number; endpoints: Endpoint[] }> = {
  customers: {
    label: "Customers",
    count: 8,
    endpoints: [
      { method: "GET", path: "/v1/customers", desc: "List customers — paginated, filter by updated_since", scopes: ["read:customers"] },
      { method: "GET", path: "/v1/customers/{id}", desc: "Get customer — includes STAR contact + identity graph", scopes: ["read:customers"] },
      { method: "POST", path: "/v1/customers", desc: "Create / upsert — dedup on email+phone", scopes: ["write:customers"] },
    ],
  },
  vehicles: {
    label: "Vehicles",
    count: 11,
    endpoints: [
      { method: "GET", path: "/v1/vehicles", desc: "Search inventory — VIN, stock, rooftop, status", scopes: ["read:vehicles"] },
      { method: "GET", path: "/v1/vehicles/{vin}", desc: "Get vehicle — single VIN record, group-wide", scopes: ["read:vehicles"] },
      { method: "POST", path: "/v1/vehicles/transfer", desc: "Cross-rooftop transfer — posts GL in real time", scopes: ["write:inventory"] },
    ],
  },
  deals: {
    label: "Deals",
    count: 9,
    endpoints: [
      { method: "GET", path: "/v1/deals", desc: "List deals — status, desk, F&I", scopes: ["read:deals"] },
      { method: "GET", path: "/v1/deals/{id}", desc: "Get deal — full pencil, audit trail", scopes: ["read:deals"] },
      { method: "POST", path: "/v1/deals", desc: "Create deal — STAR-compliant payload", scopes: ["write:deals"] },
    ],
  },
  ros: {
    label: "ROs",
    count: 7,
    endpoints: [
      { method: "GET", path: "/v1/service/repair-orders", desc: "List ROs — status, tech, MPI liens", scopes: ["read:service"] },
      { method: "GET", path: "/v1/service/repair-orders/{id}", desc: "Get RO — lines, MPI, pay link", scopes: ["read:service"] },
      { method: "POST", path: "/v1/service/appointments", desc: "Book appointment — capacity-aware", scopes: ["write:service"] },
    ],
  },
}

const STAR_VEHICLE = {
  starVersion: "STAR 7.4 — Vehicle",
  vin: "JTMAAACA4PA042118",
  stockNo: "T23157",
  rooftopId: "dtown",
  year: 2023,
  make: "Toyota",
  model: "Highlander",
  trim: "Limited AWD",
  status: "stock",
  pricing: { msrp: 48950, internetPrice: 36490, cost: 34800, pack: 799 },
  provenance: { source: "AutoCore canonical — one VIN, one record", updatedAt: "2026-04-24T09:31:12Z", etag: "W/\"a4f-8841\"" },
  _links: { self: "/v1/vehicles/JTMAAACA4PA042118", history: "/v1/vehicles/JTMAAACA4PA042118/history" },
}

const MARKETPLACE = [
  { name: "RouteOne", cat: "F&I", desc: "Credit app → decision in DMS", installs: 1240, verified: true },
  { name: "Cox Auto", cat: "Inventory", desc: "vAuto pricing + merch syndication", installs: 892, verified: true },
  { name: "CDK Fortellis Clone", cat: "Legacy bridge", desc: "Drop-in for Fortellis callers", installs: 410, verified: true },
  { name: "Tekion Bridge", cat: "Migration", desc: "STAR export → AutoCore import", installs: 318, verified: true },
  { name: "CarGurus Feed", cat: "Marketing", desc: "15-min syndication feed", installs: 560, verified: false },
  { name: "Auth0 Sync", cat: "Identity", desc: "SSO + SCIM provisioning", installs: 203, verified: true },
  { name: "Stripe Pay Links", cat: "Service", desc: "MPI pay-by-link", installs: 744, verified: true },
  { name: "Twilio Voice", cat: "AI", desc: "Missed-call recovery voice agent", installs: 512, verified: true },
  { name: "Reynolds ERA Extract", cat: "Migration", desc: "ERA → AutoCore extractor", installs: 176, verified: true },
  { name: "CDK Drive Extract", cat: "Migration", desc: "Drive DMS full-history extract", installs: 221, verified: true },
  { name: "Dealertrack", cat: "F&I", desc: "eContract + digital contracting", installs: 638, verified: true },
  { name: "ServiceTitan Link", cat: "Fixed Ops", desc: "RO & MPI two-way sync", installs: 147, verified: false },
]

const WEBHOOKS = [
  { event: "deal.updated", url: "https://api.routeone.example/webhooks/autocore", status: "active", deliveries: 1842, fails: 2 },
  { event: "vehicle.transferred", url: "https://cox.example/hooks/inventory", status: "active", deliveries: 412, fails: 0 },
  { event: "ro.mpi_approved", url: "https://pay.example/mpi/callback", status: "active", deliveries: 944, fails: 1 },
  { event: "customer.created", url: "https://crm.example/autocore/customer", status: "paused", deliveries: 2103, fails: 12 },
]

const AUDIT = [
  { t: "09:31:04Z", app: "RouteOne — prod", actor: "dealer_consent:dtown", endpoint: "GET /v1/deals/8841", records: 1, latency: "18ms" },
  { t: "09:28:11Z", app: "Cox Auto — sandbox", actor: "sandbox_key", endpoint: "GET /v1/vehicles?vin=JTMAA*", records: 3, latency: "22ms" },
  { t: "09:22:47Z", app: "Tekion Bridge", actor: "admin@sovereign", endpoint: "POST /v1/customers", records: 1, latency: "31ms" },
  { t: "09:14:02Z", app: "Internal • Desking", actor: "s.rivera@sovereign", endpoint: "GET /v1/deals/8841/history", records: 4, latency: "12ms" },
  { t: "08:55:17Z", app: "RouteOne — prod", actor: "dealer_consent:group", endpoint: "GET /v1/customers?updated_since=2026-04-23", records: 14, latency: "41ms" },
]

const USAGE = [
  { d: "Mon", calls: 1840, errors: 2, throttle: 0 },
  { d: "Tue", calls: 2102, errors: 1, throttle: 0 },
  { d: "Wed", calls: 2411, errors: 3, throttle: 1 },
  { d: "Thu", calls: 1988, errors: 0, throttle: 0 },
  { d: "Fri", calls: 2650, errors: 4, throttle: 0 },
  { d: "Sat", calls: 1420, errors: 0, throttle: 0 },
  { d: "Sun", calls: 980, errors: 0, throttle: 0 },
]

const SCOPES = [
  { id: "read:customers", label: "Read customers", grant: true, sensitive: true },
  { id: "write:customers", label: "Write customers", grant: false, sensitive: false },
  { id: "read:vehicles", label: "Read vehicles", grant: true, sensitive: false },
  { id: "read:deals", label: "Read deals", grant: true, sensitive: true },
  { id: "write:deals", label: "Write deals", grant: true, sensitive: true },
  { id: "read:service", label: "Read ROs & appointments", grant: true, sensitive: false },
  { id: "write:service", label: "Write ROs / book service", grant: false, sensitive: false },
]

export default function DeveloperPortal() {
  const [step, setStep] = useState(0)
  const [spec, setSpec] = useState<SpecId>("vehicles")
  const [endpointIdx, setEndpointIdx] = useState(0)
  const [vin, setVin] = useState("JTMAAACA4PA042118")
  const [running, setRunning] = useState(false)
  const [showResponse, setShowResponse] = useState(true)
  const [scopes, setScopes] = useState(SCOPES)
  const [copied, setCopied] = useState<string | null>(null)
  const [activeWebhook, setActiveWebhook] = useState(0)
  const [exportRequested, setExportRequested] = useState(false)
  // E12 — Safeguards evidence pack
  const compliance = useStore((s) => s.complianceState)
  const exportSafeguards = useStore((s) => s.exportSafeguards)
  const [safeguardsExportedAt, setSafeguardsExportedAt] = useState<number | null>(null)
  const [safeguardsAgo, setSafeguardsAgo] = useState("4.2s ago")
  useEffect(() => {
    if (safeguardsExportedAt == null) return
    const id = setInterval(() => {
      const sec = (Date.now() - safeguardsExportedAt) / 1000
      setSafeguardsAgo(sec < 60 ? `${sec.toFixed(1)}s ago` : `${Math.floor(sec / 60)}m ${Math.floor(sec % 60)}s ago`)
    }, 700)
    return () => clearInterval(id)
  }, [safeguardsExportedAt])

  const ep = SPECS[spec].endpoints[endpointIdx] ?? SPECS[spec].endpoints[0]

  function run() {
    setRunning(true)
    setTimeout(() => {
      setRunning(false)
      setShowResponse(true)
    }, 650)
  }

  const steps = [
    { n: 1, k: "Register", d: "Free — no ticket, no wait", icon: Users },
    { n: 2, k: "Sandbox key", d: "issk_live_ • in 30s", icon: Key },
    { n: 3, k: "First call <15min", d: "Try it → 200 in 42ms", icon: Lightning },
    { n: 4, k: "Dealer consent", d: "Scopes granted by dealer", icon: ShieldCheck },
  ]

  const maxCalls = Math.max(...USAGE.map((u) => u.calls))

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      {/* top bar */}
      <div className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="hidden h-7 w-7 place-items-center rounded-lg bg-[var(--accent)] text-white md:grid">
              <Code size={14} weight="fill" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[14px] font-semibold tracking-tight">Developer Portal</h1>
                <span className="rounded-full border border-[var(--accent-border)] bg-[var(--accent-muted)] px-2 py-0.5 text-[10px] font-medium tracking-widest text-[var(--accent)]">
                  E9 • F9
                </span>
                <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-700 md:inline-flex">
                  <Plug size={10} weight="fill" /> Self-serve • $0 • STAR-compliant
                </span>
              </div>
              <p className="hidden text-[12px] leading-none text-[var(--text-muted)] md:block">
                Free self-serve APIs — no $10K fee, no ticket queue, sandbox in 30s • dealer-consented
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1 text-[11px] font-medium md:inline-flex">
              <Globe size={12} /> docs.autocore.erp • OpenAPI 3.1
            </span>
            <Badge variant="success" className="bg-white">
              <Flask size={12} /> Sandbox live
            </Badge>
          </div>
        </div>
      </div>

      {/* ── Value prop banner — free vs $10K ── */}
      <div className="mx-auto max-w-[1440px] px-5 pt-4 md:px-6">
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="grid md:grid-cols-[1.15fr_0.85fr]">
            <div className="p-5 md:p-6">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white">
                <Sparkle size={12} weight="fill" className="text-sky-400" /> Why AutoCore wins
              </div>
              <h2 className="mt-3 text-[22px] font-[700] leading-[1.05] tracking-tight">
                Self-serve. Free. <span className="underline decoration-[var(--accent)] decoration-4 underline-offset-4">No $10K fee.</span>
                <br />
                <span className="font-[400] text-[var(--text-secondary)]">Third-party devs ship in minutes — not quarters.</span>
              </h2>
              <p className="mt-2 max-w-[560px] text-[12.5px] leading-relaxed text-[var(--text-muted)]">
                P12 promise: dealer-authorized, STAR-compliant, every read logged. CDK-style tollgates replaced by consent + audit.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-medium text-emerald-800">
                  <CheckCircle size={12} weight="fill" /> No program fee • $0 to build
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-border)] bg-[var(--accent-muted)] px-2.5 py-1 font-medium text-[var(--accent)]">
                  <Timer size={12} weight="bold" /> Sandbox key in 30s • first 200 &lt;15 min
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-2.5 py-1 font-medium">
                  <Shield size={12} weight="fill" className="text-zinc-500" /> Dealer grants scopes — revocable
                </span>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Button onClick={() => setStep(1)}>
                  <Key size={14} weight="bold" /> Create sandbox key
                </Button>
                <Button variant="outline" onClick={() => document.getElementById("explorer")?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                  Try API explorer <ArrowRight size={14} weight="bold" />
                </Button>
                <span className="hidden font-mono text-[11px] text-[var(--text-muted)] md:inline">issk_live_ • 42ms p50</span>
              </div>
            </div>

            {/* comparison */}
            <div className="border-t border-[var(--border)] bg-[var(--surface-muted)] p-4 md:border-l md:border-t-0">
              <div className="text-label-mono text-[var(--text-muted)]">P12 fee comparison — legacy vs AutoCore</div>
              <div className="mt-3 overflow-hidden rounded-xl border border-[var(--border)] bg-white text-[12px]">
                <div className="grid grid-cols-[1fr_1fr_1fr] gap-px bg-[var(--border)] text-[11px]">
                  <div className="bg-white p-2.5 font-medium text-[var(--text-muted)]"></div>
                  <div className="bg-amber-50 p-2.5 text-center font-semibold text-amber-800">Legacy DMS</div>
                  <div className="bg-emerald-50 p-2.5 text-center font-semibold text-emerald-800">AutoCore</div>
                </div>
                <div className="grid grid-cols-[1fr_1fr_1fr] gap-px bg-[var(--border)]">
                  {[
                    { k: "Program fee", legacy: "$10,000 / yr", ac: "$0", good: true },
                    { k: "Time to first call", legacy: "3–6 weeks", ac: "<15 minutes", good: true },
                    { k: "Sandbox", legacy: "Ticket + wait", ac: "Self-serve, instant", good: true },
                    { k: "Data export", legacy: "$5K+ / delayed", ac: "Free • <24h", good: true },
                    { k: "Auth", legacy: "Vendor-gated", ac: "Dealer-consented OAuth", good: true },
                  ].map((r) => (
                    <div key={r.k} className="contents text-[12px]">
                      <div className="bg-white px-2.5 py-2 font-medium">{r.k}</div>
                      <div className="bg-amber-50/50 px-2.5 py-2 text-center font-mono text-amber-800 line-through decoration-2">{r.legacy}</div>
                      <div className="bg-emerald-50/60 px-2.5 py-2 text-center font-mono font-semibold text-emerald-800">
                        {r.ac} {r.good && "✓"}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-white px-3 py-2 text-center font-mono text-[10px] tracking-wide text-[var(--text-faint)]">
                  Source: P12 — free self-serve, STAR payloads, audit-logged reads
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-[11px]">
                <ShieldCheck size={14} weight="fill" className="text-emerald-600" />
                <span>
                  <span className="font-semibold">Trust-first:</span> dealer consent + audit log &gt; tollgate
                </span>
                <span className="ml-auto rounded-full bg-zinc-900 px-2 py-0.5 font-mono text-[10px] font-semibold text-white">E9</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Steps tracker 4-step ── */}
      <div className="mx-auto max-w-[1440px] px-5 pt-4 md:px-6">
        <div className="surface overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
            <h3 className="inline-flex items-center gap-2 text-[12px] font-semibold">
              <Timer size={14} className="text-[var(--accent)]" /> 4 steps to first 200 — P12 flow
            </h3>
            <span className="rounded-full bg-[var(--accent)] px-2.5 py-1 text-[11px] font-semibold text-white">Avg 8m 42s • self-serve</span>
          </div>
          <div className="p-4">
            <div className="relative">
              <div className="absolute left-[18px] right-[18px] top-[18px] h-1 rounded-full bg-[var(--border)]" />
              <div
                className="absolute left-[18px] top-[18px] h-1 rounded-full bg-[var(--accent)] transition-all duration-500"
                style={{ width: `calc(${(step / 3) * 100}% - 36px)` }}
              />
              <div className="relative grid grid-cols-4 gap-2">
                {steps.map((s) => {
                  const active = step >= s.n - 1
                  const current = step === s.n - 1
                  return (
                    <button
                      key={s.n}
                      onClick={() => setStep(s.n - 1)}
                      className={`group flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-colors-taste ${
                        current
                          ? "border-[var(--accent-border)] bg-[var(--accent-muted)]"
                          : active
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-[var(--border)] bg-white hover:bg-[var(--surface-hover)]"
                      }`}
                    >
                      <span
                        className={`grid h-8 w-8 place-items-center rounded-full border text-[13px] font-[700] ${
                          active ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[var(--border)] bg-white text-[var(--text-muted)]"
                        } ${current ? "ring-2 ring-[var(--accent-muted)]" : ""}`}
                      >
                        {active ? <CheckCircle size={16} weight="fill" /> : <s.icon size={16} weight="bold" />}
                      </span>
                      <div>
                        <div className={`text-[12px] font-semibold leading-none ${current ? "text-[var(--accent)]" : active ? "text-emerald-800" : "text-[var(--text-primary)]"}`}>
                          {s.n}. {s.k}
                        </div>
                        <div className="text-[11px] leading-snug text-[var(--text-muted)]">{s.d}</div>
                      </div>
                      {current && <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-semibold text-white">You're here</span>}
                    </button>
                  )
                })}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-[12px]"
              >
                {step === 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span>
                      <span className="font-semibold">1 — Register:</span> email + org • no sales call. You get a workspace instantly. <span className="font-mono text-[11px] text-[var(--text-muted)]">workspace: sovereign-labs</span>
                    </span>
                    <Button size="sm" onClick={() => setStep(1)}>
                      Register free <CaretRight size={12} weight="bold" />
                    </Button>
                  </div>
                )}
                {step === 1 && (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="flex items-center gap-2">
                      <Key size={14} weight="bold" className="text-[var(--accent)]" />
                      <span className="font-semibold">2 — Sandbox key:</span>
                      <code className="rounded-full bg-zinc-900 px-2.5 py-1 font-mono text-[11px] font-semibold text-white">issk_live_51H7x...9aF2</code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText("issk_live_51H7x...9aF2")
                          setCopied("key")
                          setTimeout(() => setCopied(null), 1200)
                        }}
                        className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-white px-2 py-1 text-[11px] font-medium hover:bg-zinc-50"
                      >
                        <Copy size={12} /> {copied === "key" ? "Copied" : "Copy"}
                      </button>
                      <span className="font-mono text-[11px] text-emerald-700">created 12s ago • never expires in sandbox</span>
                    </span>
                    <Button size="sm" onClick={() => setStep(2)}>
                      Next: first call <ArrowRight size={12} weight="bold" />
                    </Button>
                  </div>
                )}
                {step === 2 && (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span>
                      <span className="font-semibold">3 — First call &lt;15 min:</span> Use the explorer below → <span className="font-mono font-semibold">GET /v1/vehicles?vin=...</span> → <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[11px] font-semibold text-white">200 • 42ms</span> STAR payload.
                    </span>
                    <Button size="sm" onClick={() => setStep(3)}>
                      Request dealer consent <Shield size={12} weight="bold" />
                    </Button>
                  </div>
                )}
                {step === 3 && (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2">
                      <ShieldCheck size={14} weight="fill" className="text-emerald-600" />
                      <span className="font-semibold">4 — Dealer consent:</span> Sovereign Auto Group granted <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px]">read:customers read:vehicles write:deals</code>
                      <Badge variant="success" className="bg-white">
                        Granted • revocable
                      </Badge>
                    </span>
                    <span className="font-mono text-[11px] text-[var(--text-muted)]">OAuth • PKCE • scopes per rooftop</span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Main bento — left explorer + right governance ── */}
      <div id="explorer" className="mx-auto grid max-w-[1440px] gap-4 px-5 py-4 md:px-6 lg:grid-cols-[1.3fr_0.9fr]">
        {/* LEFT */}
        <div className="space-y-4">
          {/* API explorer mock */}
          <div className="surface overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-zinc-900 px-4 py-3 text-white">
              <h3 className="inline-flex items-center gap-2 text-[13px] font-semibold">
                <Code size={16} weight="bold" className="text-sky-400" /> API Explorer
                <span className="hidden rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px] font-medium tracking-wide text-white md:inline-flex">
                  OpenAPI 3.1 • STAR payloads
                </span>
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-900">
                <Lightning size={12} weight="fill" className="text-amber-500" /> Try it live
              </span>
            </div>

            <div className="flex gap-1 border-b border-[var(--border)] bg-[var(--surface-muted)] p-1.5">
              {(Object.keys(SPECS) as SpecId[]).map((id) => {
                const active = spec === id
                return (
                  <button
                    key={id}
                    onClick={() => {
                      setSpec(id)
                      setEndpointIdx(0)
                    }}
                    className={`flex-1 rounded-lg px-2.5 py-2 text-[12px] font-semibold capitalize transition-colors-taste ${
                      active ? "bg-[var(--surface)] shadow-sm border border-[var(--border)] text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {SPECS[id].label}
                    <span className={`ml-1 rounded-full px-1.5 py-0.5 font-mono text-[10px] ${active ? "bg-[var(--accent-muted)] text-[var(--accent)]" : "bg-white text-[var(--text-muted)]"}`}>
                      {SPECS[id].count}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="grid divide-y divide-[var(--border)] md:grid-cols-[1fr_1.1fr] md:divide-x md:divide-y-0">
              {/* spec list */}
              <div className="divide-y divide-[var(--border)] bg-[var(--surface-muted)]/40">
                <div className="px-3.5 py-2.5 text-label-mono text-[var(--text-muted)]">Endpoints — {SPECS[spec].label}</div>
                {SPECS[spec].endpoints.map((e, i) => {
                  const active = i === endpointIdx
                  return (
                    <button
                      key={e.path}
                      onClick={() => setEndpointIdx(i)}
                      className={`flex w-full items-start gap-2.5 px-3.5 py-3 text-left transition-colors-taste ${active ? "bg-white" : "hover:bg-white/60"}`}
                    >
                      <span
                        className={`shrink-0 rounded-md px-1.5 py-1 font-mono text-[10px] font-[700] tracking-wide ${
                          e.method === "GET" ? "bg-sky-500 text-white" : e.method === "POST" ? "bg-emerald-600 text-white" : "bg-amber-500 text-black"
                        }`}
                      >
                        {e.method}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block font-mono text-[12px] font-semibold leading-none ${active ? "text-[var(--accent)]" : "text-[var(--text-primary)]"}`}>
                          {e.path}
                        </span>
                        <span className="block text-[11px] leading-snug text-[var(--text-muted)]">{e.desc}</span>
                        <span className="mt-1 flex flex-wrap gap-1">
                          {e.scopes.map((s) => (
                            <span key={s} className="rounded-full bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] font-medium text-white">
                              {s}
                            </span>
                          ))}
                        </span>
                      </span>
                      {active && <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />}
                    </button>
                  )
                })}
                <div className="px-3.5 py-2.5 text-[11px] text-[var(--text-muted)]">
                  STAR schemas: Vehicle, Customer, Deal, RepairOrder • versioned • <button className="font-medium text-[var(--accent)] hover:underline">View OpenAPI →</button>
                </div>
              </div>

              {/* try-it console */}
              <div className="flex flex-col bg-white">
                <div className="flex items-center justify-between border-b border-[var(--border)] bg-zinc-50 px-3.5 py-2.5">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold">
                    <Flask size={14} className="text-[var(--accent)]" /> Try-it console
                    <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white">sandbox</span>
                  </span>
                  <span className="font-mono text-[11px] text-[var(--text-muted)]">issk_live_ • scope: read:vehicles</span>
                </div>

                <div className="space-y-3 p-3.5">
                  <div className="flex gap-2">
                    <span className="grid h-8 place-items-center rounded-lg bg-sky-500 px-2 font-mono text-[11px] font-bold text-white">{ep.method}</span>
                    <div className="flex flex-1 items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-muted)] px-2.5 py-1">
                      <Globe size={14} className="text-[var(--text-muted)]" />
                      <span className="font-mono text-[12px] font-medium">https://api.autocore.erp{ep.path.replace("{vin}", vin).replace("{id}", "8841")}</span>
                      <span className="ml-auto hidden rounded-full bg-white px-1.5 py-0.5 font-mono text-[10px] shadow-sm md:inline">TLS 1.3</span>
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <label className="text-label-mono text-[var(--text-muted)]">VIN (query) or ID (path)</label>
                      <Input value={vin} onChange={(e) => setVin(e.target.value)} placeholder="JTMAAACA4PA042118" className="mt-1 font-mono text-[12px]" />
                      <div className="mt-1 font-mono text-[10px] text-[var(--text-faint)]">Try: {STAR_VEHICLE.vin.slice(0, 8)}… • wildcard supported</div>
                    </div>
                    <div>
                      <label className="text-label-mono text-[var(--text-muted)]">Authorization</label>
                      <div className="mt-1 flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-2 font-mono text-[11px]">
                        <LockKey size={12} className="text-[var(--text-muted)]" /> Bearer <span className="truncate font-semibold">issk_live_51H7x•••9aF2</span>
                        <span className="ml-auto rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">valid</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={run} disabled={running} className="min-w-[110px]">
                      {running ? (
                        <>
                          <Clock size={14} className="animate-spin" /> Sending…
                        </>
                      ) : (
                        <>
                          <Play size={14} weight="fill" /> Send
                        </>
                      )}
                    </Button>
                    <span className="font-mono text-[11px] text-[var(--text-muted)]">p50 42ms • p95 89ms • rate 120/min</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`curl -H "Authorization: Bearer issk_live_..." "https://api.autocore.erp/v1/vehicles?vin=${vin}"`)
                        setCopied("curl")
                        setTimeout(() => setCopied(null), 1200)
                      }}
                      className="ml-auto inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-white px-2.5 py-1 text-[11px] font-medium hover:bg-zinc-50"
                    >
                      <Copy size={12} /> {copied === "curl" ? "Copied" : "Copy curl"}
                    </button>
                  </div>

                  {/* response */}
                  <AnimatePresence mode="wait">
                    {showResponse && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50/50"
                      >
                        <div className="flex items-center justify-between bg-emerald-500 px-3 py-2 text-white">
                          <span className="inline-flex items-center gap-2 text-[12px] font-semibold">
                            <span className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] font-bold text-emerald-700">200</span> OK • STAR payload • 42ms
                          </span>
                          <span className="flex items-center gap-1 font-mono text-[11px] text-white/80">
                            <Clock size={11} /> 09:31:12Z • cached 12s
                            <button className="ml-2 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-emerald-700">STAR 7.4 ✓</button>
                          </span>
                        </div>
                        <pre className="max-h-[260px] overflow-auto bg-zinc-950 p-3 font-mono text-[11px] leading-relaxed text-zinc-100">{JSON.stringify(STAR_VEHICLE, null, 2)}</pre>
                        <div className="flex flex-wrap items-center gap-2 bg-white px-3 py-2 text-[11px]">
                          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-1 font-mono">
                            <Database size={12} /> Canonical • one VIN, one record
                          </span>
                          <span className="text-[var(--text-muted)]">Every read appears in audit log →</span>
                          <Badge variant="success" className="gap-1 bg-white">
                            <Eye size={12} /> Logged
                          </Badge>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!showResponse && (
                    <div className="rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-muted)] p-6 text-center text-[12px] text-[var(--text-muted)]">
                      Response will appear here • STAR-compliant JSON
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* usage dashboard */}
          <div className="surface overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
              <h3 className="inline-flex items-center gap-2 text-[12px] font-semibold">
                <ChartBar size={14} className="text-[var(--accent)]" /> Usage dashboard
                <span className="rounded-full bg-white px-1.5 py-0.5 font-mono text-[10px] shadow-sm">7-day • 120/min limit</span>
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Healthy
              </span>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-[var(--border)] bg-white p-3">
                  <div className="text-label-mono text-[var(--text-muted)]">Calls (7d)</div>
                  <div className="font-mono text-[18px] font-[700]">13,391</div>
                  <div className="text-[11px] text-emerald-700">+12% vs last week</div>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-white p-3">
                  <div className="text-label-mono text-[var(--text-muted)]">Errors</div>
                  <div className="font-mono text-[18px] font-[700]">10</div>
                  <div className="text-[11px] text-[var(--text-muted)]">0.07% • 429 never hit</div>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-white p-3">
                  <div className="text-label-mono text-[var(--text-muted)]">Throttled</div>
                  <div className="font-mono text-[18px] font-[700]">1</div>
                  <div className="text-[11px] text-[var(--text-muted)]">1 spike Wed 14:02</div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-end gap-1.5">
                  {USAGE.map((u) => (
                    <div key={u.d} className="flex flex-1 flex-col items-center gap-1">
                      <div className="relative flex w-full items-end justify-center gap-0.5" style={{ height: 64 }}>
                        <div
                          className="w-full max-w-[28px] rounded-t-md bg-[var(--accent)]"
                          style={{ height: `${(u.calls / maxCalls) * 64}px` }}
                          title={`${u.calls} calls`}
                        />
                        {u.errors > 0 && <div className="absolute -top-1 h-1.5 w-1.5 rounded-full bg-red-500" title={`${u.errors} errors`} />}
                      </div>
                      <span className="font-mono text-[11px] font-medium text-[var(--text-muted)]">{u.d}</span>
                      <span className="font-mono text-[10px] text-[var(--text-faint)]">{u.calls}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-[11px]">
                  <span className="inline-flex items-center gap-1 font-medium">
                    <span className="h-2 w-2 rounded-full bg-[var(--accent)]" /> Calls
                  </span>
                  <span className="inline-flex items-center gap-1 text-[var(--text-muted)]">
                    <span className="h-2 w-2 rounded-full bg-red-500" /> Errors
                  </span>
                  <span className="inline-flex items-center gap-1 text-[var(--text-muted)]">
                    <span className="h-2 w-2 rounded-full bg-amber-500" /> Throttle 429
                  </span>
                  <span className="ml-auto font-mono text-[11px] text-[var(--text-muted)]">Quota 120/min • burst 240</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          {/* consent management */}
          <div className="surface overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-zinc-900 px-4 py-3 text-white">
              <h3 className="inline-flex items-center gap-2 text-[12px] font-semibold">
                <Shield size={14} className="text-emerald-400" /> Consent management
                <span className="rounded-full bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white">dealer-granted</span>
              </h3>
              <Badge variant="success" className="border-white/20 bg-white text-emerald-700">
                <LockKey size={12} /> Revocable
              </Badge>
            </div>
            <div className="p-3.5">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Sovereign Auto Group • 3 rooftops</span>
                  <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[10px] shadow-sm">group-wide consent</span>
                </div>
                <div className="mt-1 font-mono text-[11px] text-[var(--text-muted)]">Granted by: D. Alvarez (Controller) • 2026-04-19 • OAuth PKCE • per-rooftop override</div>
              </div>

              <div className="mt-3 space-y-1.5">
                {scopes.map((s) => (
                  <label key={s.id} className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition-colors-taste ${s.grant ? "border-emerald-200 bg-emerald-50" : "border-[var(--border)] bg-white hover:bg-[var(--surface-hover)]"}`}>
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 text-[12px] font-semibold">
                        {s.label}
                        {s.sensitive && <span className="rounded bg-amber-500 px-1 py-0.5 font-mono text-[9px] font-bold text-black">SENSITIVE</span>}
                      </span>
                      <span className="font-mono text-[11px] text-[var(--text-muted)]">{s.id}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={s.grant}
                        onChange={(e) => setScopes((prev) => prev.map((x) => (x.id === s.id ? { ...x, grant: e.target.checked } : x)))}
                        className="h-4 w-4 rounded border-zinc-300 accent-[var(--accent)]"
                      />
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${s.grant ? "bg-emerald-600 text-white" : "bg-zinc-200 text-zinc-600"}`}>
                        {s.grant ? "Granted" : "Blocked"}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <ShieldCheck size={14} /> View consent receipt
                </Button>
                <Button size="sm" variant="secondary" className="flex-1">
                  Revoke all
                </Button>
              </div>
              <p className="mt-2 text-center font-mono text-[10px] text-[var(--text-faint)]">F9: dealer consent per scope • revocation propagates in &lt;60s</p>
            </div>
          </div>

          {/* webhook subscriptions */}
          <div className="surface overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
              <h3 className="inline-flex items-center gap-2 text-[12px] font-semibold">
                <PlugsConnected size={14} className="text-[var(--accent)]" /> Webhook subscriptions
              </h3>
              <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[10px] shadow-sm">{WEBHOOKS.filter((w) => w.status === "active").length} active • signed HMAC</span>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {WEBHOOKS.map((w, i) => {
                const active = activeWebhook === i
                return (
                  <button key={w.event} onClick={() => setActiveWebhook(i)} className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[var(--surface-hover)] ${active ? "bg-[var(--accent-muted)]" : "bg-white"}`}>
                    <span className={`grid h-7 w-7 place-items-center rounded-lg ${w.status === "active" ? "bg-emerald-500 text-white" : "bg-amber-500 text-black"}`}>
                      <PlugsConnected size={14} weight="bold" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-[12px] font-semibold leading-none">{w.event}</span>
                      <span className="block truncate font-mono text-[11px] text-[var(--text-muted)]">{w.url}</span>
                      <span className="mt-1 inline-flex gap-1.5 text-[11px]">
                        <span className="rounded-full bg-white px-1.5 py-0.5 font-mono shadow-sm">{w.deliveries} deliveries</span>
                        {w.fails > 0 && <span className="rounded-full bg-red-50 px-1.5 py-0.5 font-mono text-red-700">{w.fails} fails</span>}
                        {w.fails === 0 && <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 font-mono text-emerald-700">0 fails</span>}
                      </span>
                    </span>
                    <Badge variant={w.status === "active" ? "success" : "warning"} className="bg-white">
                      {w.status === "active" ? <CheckCircle size={12} weight="fill" /> : <Clock size={12} />}
                      {w.status}
                    </Badge>
                  </button>
                )
              })}
            </div>
            <div className="flex items-center gap-2 bg-[var(--surface-muted)] px-4 py-2.5 text-[11px]">
              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-1 font-mono text-[11px] font-semibold text-white">
                <LinkIcon size={11} /> HMAC-SHA256
              </span>
              <span className="text-[var(--text-muted)]">All webhooks signed • retry 3× • dead-letter after</span>
              <button className="ml-auto font-medium text-[var(--accent)] hover:underline">Add webhook →</button>
            </div>
          </div>

          {/* audit log */}
          <div className="surface overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
              <h3 className="inline-flex items-center gap-2 text-[12px] font-semibold">
                <FileText size={14} className="text-[var(--accent)]" /> Audit log — every read logged
              </h3>
              <span className="rounded-full bg-zinc-900 px-2 py-0.5 font-mono text-[10px] font-semibold text-white">E9 • immutable</span>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {AUDIT.map((r) => (
                <div key={r.t} className="flex gap-2.5 px-4 py-2.5">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-1.5">
                      <span className="font-mono text-[11px] font-medium text-[var(--text-muted)]">{r.t}</span>
                      <span className="rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white">{r.app}</span>
                      <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-emerald-700">{r.latency}</span>
                    </div>
                    <div className="font-mono text-[11px] font-medium">{r.endpoint}</div>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      actor <span className="font-medium text-[var(--text-primary)]">{r.actor}</span> • {r.records} record(s) • consent verified
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between bg-[var(--surface-muted)] px-4 py-2.5 text-[11px]">
              <span className="inline-flex items-center gap-1 text-[var(--text-muted)]">
                <ShieldCheck size={12} className="text-emerald-600" /> Safeguards Rule • exportable evidence
              </span>
              <button className="font-medium text-[var(--accent)] hover:underline">Export CSV →</button>
            </div>
          </div>

          {/* no-fee data export CTA */}
          <div className="overflow-hidden rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-muted)] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-2.5 py-1 text-[11px] font-semibold text-white">
                  <DownloadSimple size={12} weight="bold" /> No-fee data export
                </div>
                <div className="mt-2 text-[13px] font-semibold leading-tight">Full data export — &lt;24h, $0</div>
                <div className="text-[12px] leading-snug text-[var(--text-secondary)]">
                  All STAR entities • customers, vehicles, bins, ROs, deals • bulk JSON + CSV. Not a tollgate.
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5 font-mono text-[11px]">
                  <span className="rounded-full bg-white px-2 py-1 shadow-sm">Last export: 2026-04-23 14:02Z • 4.2 GB</span>
                  <span className="rounded-full bg-emerald-500 px-2 py-1 font-semibold text-white">Ready in 2.1h avg</span>
                </div>
              </div>
              <div className="hidden text-[11px] md:block">
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 font-medium text-amber-800">Legacy $5K+ → $0</span>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                className="flex-1"
                onClick={() => {
                  setExportRequested(true)
                  setTimeout(() => setExportRequested(false), 2600)
                }}
                disabled={exportRequested}
              >
                {exportRequested ? (
                  <>
                    <Clock size={14} className="animate-spin" /> Queued • ETA 90 min
                  </>
                ) : (
                  <>
                    <DownloadSimple size={14} weight="bold" /> Request full export — free
                  </>
                )}
              </Button>
              <Button variant="outline" className="bg-white">
                <FileText size={14} /> STAR docs
              </Button>
            </div>
            <div className="mt-2 text-center font-mono text-[10px] tracking-wide text-[var(--text-faint)]">P12: data belongs to dealer — delivered &lt;24h, no fee, no ticket</div>
          </div>
        </div>
      </div>

      {/* ── E12 Compliance & Security — Safeguards evidence pack ── */}
      <div className="mx-auto max-w-[1440px] px-5 pt-4 md:px-6">
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
          {/* header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] bg-zinc-900 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500 text-white">
                <ShieldCheck size={16} weight="fill" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[14px] font-semibold tracking-tight text-white">Compliance & Security — E12</h2>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold tracking-widest text-white border border-white/15">FTC SAFEGUARDS RULE • SOC 1/2 • ISO 27001/27701</span>
                  <span className="hidden rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white md:inline-flex">MFA 100% • AES-256 • Immutable</span>
                </div>
                <p className="text-[11px] leading-none text-white/70">
                  Toolkit: MFA everywhere, encryption at rest/in transit, access logs, vendor oversight, IR runbooks, 500+-consumer breach workflow • <span className="font-mono text-white/90">12 rooftops • immutable audit</span> • post-CDK DR lesson
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {safeguardsExportedAt ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Exported {safeguardsAgo} • 12 rooftops • immutable audit
                </span>
              ) : (
                <span className="hidden rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white md:inline-flex">12 rooftops • immutable audit • ready</span>
              )}
              <Badge variant="success" className="bg-white text-zinc-900">
                <Shield size={12} weight="fill" className="text-emerald-600" /> Evidence pack
              </Badge>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.35fr_0.85fr]">
            {/* left: 7 controls */}
            <div className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="inline-flex items-center gap-2 text-[12px] font-semibold">
                  <FileText size={14} className="text-[var(--accent)]" /> Safeguards evidence pack — 7 controls
                </h3>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-700">All pass • {compliance.mfaCoverage}% MFA • {compliance.encryption}</span>
              </div>
              <div className="mt-3 space-y-2">
                {compliance.safeguardsChecklist.map((c) => (
                  <div key={c.control} className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/60 px-3 py-2.5 transition-colors-taste hover:bg-white">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500 text-white">
                      <CheckCircle size={14} weight="fill" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-semibold leading-none">{c.control}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${c.status === "pass" ? "bg-emerald-500 text-white" : "bg-amber-500 text-black"}`}>{c.status === "pass" ? "PASS" : "REVIEW"}</span>
                      </div>
                      <div className="text-[11px] leading-snug text-[var(--text-muted)] truncate">{c.evidence}</div>
                    </div>
                    <span className="hidden font-mono text-[10px] text-[var(--text-faint)] md:inline">{new Date(c.lastVerified).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    const csv = exportSafeguards()
                    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement("a")
                    a.href = url
                    a.download = `AutoCore_Safeguards_Evidence_${new Date().toISOString().slice(0, 10)}.csv`
                    a.click()
                    URL.revokeObjectURL(url)
                    setSafeguardsExportedAt(Date.now() - 4200)
                    setSafeguardsAgo("4.2s ago")
                  }}
                  className="gap-1.5"
                >
                  <DownloadSimple size={14} weight="bold" /> Export CSV
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white gap-1.5"
                  onClick={() => {
                    const csv = exportSafeguards()
                    // mock PDF as text blob — demo
                    const blob = new Blob([csv], { type: "application/pdf" })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement("a")
                    a.href = url
                    a.download = `AutoCore_Safeguards_Evidence_${new Date().toISOString().slice(0, 10)}.pdf`
                    a.click()
                    URL.revokeObjectURL(url)
                    setSafeguardsExportedAt(Date.now() - 4200)
                    setSafeguardsAgo("4.2s ago")
                  }}
                >
                  <FileText size={14} /> Export PDF
                </Button>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-2.5 py-1 text-[11px] font-medium">
                  <Clock size={12} /> {safeguardsExportedAt ? `Exported ${safeguardsAgo} • 12 rooftops • immutable audit` : "Ready • 12 rooftops • immutable audit"}
                </span>
              </div>
              <p className="mt-2 font-mono text-[10px] tracking-wide text-[var(--text-faint)]">Evidence pack includes control status, evidence ref, verifier, audit trail — CSV/PDF both immutable snapshots</p>
            </div>

            {/* right: SOC/ISO + security + DR */}
            <div className="border-t border-[var(--border)] bg-[var(--surface-muted)] p-4 lg:border-l lg:border-t-0 space-y-3">
              {/* SOC */}
              <div className="rounded-xl border border-[var(--border)] bg-white p-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-zinc-900 text-white">
                    <Shield size={14} weight="fill" />
                  </span>
                  <span className="text-[12px] font-semibold">SOC audit programs</span>
                  <span className="ml-auto rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-700">Clean opinion</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-2">
                    <div className="font-mono text-[10px] tracking-widest text-[var(--text-muted)]">{compliance.soc.soc1}</div>
                    <div className="font-medium">{compliance.soc.soc1Status}</div>
                  </div>
                  <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-2">
                    <div className="font-mono text-[10px] tracking-widest text-[var(--text-muted)]">{compliance.soc.soc2}</div>
                    <div className="font-medium">{compliance.soc.soc2Status}</div>
                  </div>
                </div>
              </div>

              {/* ISO */}
              <div className="rounded-xl border border-[var(--border)] bg-white p-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-[var(--accent)] text-white">
                    <ShieldCheck size={14} weight="fill" />
                  </span>
                  <span className="text-[12px] font-semibold">ISO certification path</span>
                  <span className="ml-auto rounded-full bg-[var(--accent-muted)] border border-[var(--accent-border)] px-2 py-0.5 font-mono text-[10px] font-semibold text-[var(--accent)]">Month {compliance.iso.pathMonth}/12</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                  <span className="rounded-full bg-zinc-900 px-2 py-1 font-mono text-[11px] font-semibold text-white">{compliance.iso.iso27001} • Stage 2 audit Q3</span>
                  <span className="rounded-full bg-white border px-2 py-1 font-mono">{compliance.iso.iso27701} • Privacy • gap closure 78%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(compliance.iso.pathMonth / 12) * 100}%` }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="h-full rounded-full bg-[var(--accent)]" />
                </div>
              </div>

              {/* Security engineering */}
              <div className="rounded-xl border border-[var(--border)] bg-white p-3">
                <div className="text-[11px] font-semibold inline-flex items-center gap-2">
                  <LockKey size={14} className="text-[var(--accent)]" /> Security engineering
                  <span className="rounded-full bg-emerald-500 px-2 py-0.5 font-mono text-[10px] font-bold text-white">0 critical</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <span className="rounded-lg border bg-[var(--surface-muted)] px-2 py-1.5">Pen test: {compliance.penTest.last} • vulns {compliance.penTest.vulnCount}</span>
                  <span className="rounded-lg border bg-[var(--surface-muted)] px-2 py-1.5">SIEM: {compliance.penTest.siem}</span>
                </div>
                <div className="mt-1.5 text-[11px] text-[var(--text-muted)]">{compliance.penTest.leastPrivilege} • MFA 100% • session TTL 15m</div>
              </div>

              {/* Privacy + DR */}
              <div className="grid gap-2">
                <div className="rounded-xl border border-[var(--border)] bg-white p-3">
                  <div className="text-[11px] font-semibold">State consumer-privacy — {compliance.privacyLaws.count} new laws §5.3</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {compliance.privacyLaws.states.map((s) => (
                      <span key={s} className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] font-semibold border ${s === "CA" ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-[var(--border)]"}`}>
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="mt-1.5 text-[11px] leading-snug text-[var(--text-muted)]">{compliance.privacyLaws.note} • DSAR auto • opt-in ledger</div>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-900">
                    <Database size={14} className="text-amber-600" /> DR / backup — post-CDK lesson
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5 font-mono text-[11px]">
                    <span className="rounded-full bg-white px-2 py-1 border border-amber-200 font-semibold">Immutable backups ✓</span>
                    <span className="rounded-full bg-emerald-500 px-2 py-1 font-bold text-white">RPO {compliance.backup.rpo} • RTO {compliance.backup.rto}</span>
                    <span className="rounded-full bg-white px-2 py-1 border">Last restore test: {new Date(compliance.backup.lastRestoreTest).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-1.5 text-[11px] leading-snug text-amber-900">{compliance.drStrategy}</div>
                </div>
              </div>

              {/* access logs preview */}
              <div className="rounded-xl border border-[var(--border)] bg-zinc-950 p-3 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold">Access logs — immutable audit • {compliance.encryption}</span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px]">{compliance.accessLogs.length} events</span>
                </div>
                <div className="mt-2 space-y-1 font-mono text-[10px] leading-relaxed text-zinc-300">
                  {compliance.accessLogs.slice(0, 4).map((l) => (
                    <div key={l.at} className="flex gap-2">
                      <span className="text-white/60">{l.at.slice(11, 19)}</span>
                      <span className="truncate">{l.actor} • {l.action}</span>
                      <span className={`ml-auto rounded px-1 py-0.5 text-[9px] font-bold ${l.result === "allow" || l.result === "success" ? "bg-emerald-500 text-white" : "bg-amber-500 text-black"}`}>{l.result}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-white/60">
                  <ShieldCheck size={10} className="text-emerald-400" /> MFA 100% • {compliance.encryption} at rest • TLS 1.3 • least-privilege
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2.5 text-[11px] text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> §6.12 Vitu/CVR — integrate, don’t rebuild • EVR titling via Vitu</span>
            <span className="ml-auto font-mono text-[10px]">E12 • Safeguards • SOC1/2 • ISO 27001/27701 • 50-state • consent • SIEM • DR</span>
          </div>
        </div>
      </div>

      {/* ── Marketplace ── */}
      <div className="mx-auto max-w-[1440px] px-5 pb-6 md:px-6">
        <div className="surface overflow-hidden p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
            <h3 className="inline-flex items-center gap-2 text-[12px] font-semibold">
              <Storefront size={14} className="text-[var(--accent)]" /> Marketplace
              <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[10px] shadow-sm">12 apps • 1-click install</span>
              <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 md:inline-flex">
                Like Salesforce AppExchange
              </span>
            </h3>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-2.5 py-1 text-[11px] font-medium">
              <ShieldCheck size={12} weight="fill" className="text-emerald-600" /> All apps dealer-consented
            </span>
          </div>

          <div className="grid gap-3 p-4 md:grid-cols-3 xl:grid-cols-4">
            {MARKETPLACE.map((app) => (
              <div key={app.name} className="group flex flex-col gap-2.5 rounded-2xl border border-[var(--border)] bg-white p-3.5 transition-taste hover:shadow-md hover:border-[var(--border-strong)]">
                <div className="flex items-start justify-between gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-zinc-900 text-[11px] font-[800] tracking-tight text-white">
                    {app.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${app.verified ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-800 border border-amber-200"}`}>
                    {app.verified ? "Verified ✓" : "Community"}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-semibold leading-none">{app.name}</span>
                    <span className="rounded-full bg-[var(--accent-muted)] px-1.5 py-0.5 font-mono text-[10px] font-medium text-[var(--accent)]">{app.cat}</span>
                  </div>
                  <div className="text-[11px] leading-snug text-[var(--text-muted)]">{app.desc}</div>
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-[var(--border)] pt-2.5 text-[11px]">
                  <span className="inline-flex items-center gap-1 font-mono text-[var(--text-muted)]">
                    <DownloadSimple size={11} /> {app.installs.toLocaleString()} installs
                  </span>
                  <button className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2.5 py-1 text-[11px] font-semibold text-white group-hover:bg-[var(--accent)]">
                    Install <ArrowSquareOut size={11} weight="bold" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-[var(--surface-muted)] px-4 py-3 text-[11px] text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Plug size={12} className="text-[var(--accent)]" /> Publish your app:
            </span>
            <span className="rounded-full bg-white px-2 py-1 font-mono text-[11px] shadow-sm">POST /v1/marketplace/apps</span>
            <span>→ review 48h → verified badge</span>
            <span className="ml-auto font-mono text-[10px] tracking-wide text-[var(--text-faint)]">E9 marketplace • take-rate 0% for STAR apps</span>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3 text-[11px] leading-relaxed text-[var(--text-muted)]">
          <span className="font-semibold text-[var(--text-primary)]">Showcase: E9 Third-Party + F9 Data Portability + P12 Zero-Fee Movement</span>
          {" • "}Free self-serve (no $10K), sandbox &lt;15 min, OpenAPI + STAR, dealer-consented scopes, signed webhooks, immutable audit, 120/min quota, no-fee &lt;24h export, 12-app marketplace. Trust-first • zinc/cobalt • Phosphor Code/PlugsConnected/Shield.
        </div>
      </div>
    </div>
  )
}
