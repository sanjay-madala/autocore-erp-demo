import * as React from "react"
import {
  SquaresFour,
  Storefront,
  ChatsCircle,
  Car,
  ArrowsLeftRight,
  Wrench,
  Package,
  CurrencyDollar,
  ChartBar,
  Code,
  PuzzlePiece,
  Robot,
  HardDrives,
  MagnifyingGlass,
  Bell,
  CaretDown,
  CaretLeft,
  CaretRight,
  List,
  Command,
  ShieldCheck,
  CaretUpDown,
  Lightning,
  DeviceMobile,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"

// ── Code-split: React.lazy + dynamic import() per route (prod readiness: 1.52MB → ~180KB per route) ──
const CommandCenter = React.lazy(() => import("@/features/CommandCenter"))
const Inventory = React.lazy(() => import("@/features/Inventory"))
const Desking = React.lazy(() => import("@/features/Desking"))
const CRMInbox = React.lazy(() => import("@/features/CRMInbox"))
const ServiceLane = React.lazy(() => import("@/features/ServiceLane"))
const PartsCounter = React.lazy(() => import("@/features/PartsCounter"))
const AccountingClose = React.lazy(() => import("@/features/AccountingClose"))
const DeveloperPortal = React.lazy(() => import("@/features/DeveloperPortal"))
const AIAgents = React.lazy(() => import("@/features/AIAgents"))
const MigrationWorkbench = React.lazy(() => import("@/features/MigrationWorkbench"))
const F1Flow = React.lazy(() => import("@/features/F1Flow"))
const MobileApps = React.lazy(() => import("@/features/MobileApps"))

function ViewSkeleton() {
  return (
    <div className="mx-auto max-w-[1440px] p-6 animate-pulse">
      <div className="h-6 w-48 rounded bg-zinc-200 mb-4" />
      <div className="h-4 w-80 rounded bg-zinc-100 mb-6" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-32 rounded-xl bg-white border border-zinc-200" />
        <div className="h-32 rounded-xl bg-white border border-zinc-200" />
        <div className="h-32 rounded-xl bg-white border border-zinc-200" />
      </div>
      <div className="mt-6 h-64 rounded-xl bg-white border border-zinc-200" />
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────
type Rooftop = "All" | "Downtown Toyota" | "North Ford" | "Westside Honda"
type RooftopId = "group" | "dtown" | "north" | "westside"

const ROOFTOP_OPTS: { id: RooftopId; label: Rooftop; short: string }[] = [
  { id: "group", label: "All", short: "All" },
  { id: "dtown", label: "Downtown Toyota", short: "DT Toyota" },
  { id: "north", label: "North Ford", short: "North Ford" },
  { id: "westside", label: "Westside Honda", short: "WS Honda" },
]

type NavItem = {
  id: string
  label: string
  icon: React.ElementType
  badge?: string
}

type NavSection = {
  label: string
  items: NavItem[]
}

const NAV: NavSection[] = [
  {
    label: "OPERATE",
    items: [
      { id: "f1-flow", label: "F1 Flow", icon: Lightning },
      { id: "command-center", label: "Command Center", icon: SquaresFour },
      { id: "showroom", label: "Showroom", icon: Storefront },
      { id: "crm-inbox", label: "CRM Inbox", icon: ChatsCircle, badge: "12" },
    ],
  },
  {
    label: "INVENTORY",
    items: [
      { id: "vehicles", label: "Vehicles", icon: Car },
      { id: "transfers", label: "Transfers", icon: ArrowsLeftRight },
    ],
  },
  {
    label: "FIXED OPS",
    items: [
      { id: "service-lane", label: "Service Lane", icon: Wrench },
      { id: "parts-counter", label: "Parts Counter", icon: Package },
    ],
  },
  {
    label: "MONEY",
    items: [
      { id: "fi-desk", label: "F&I Desk", icon: CurrencyDollar },
      { id: "gl-close", label: "GL & Close", icon: ChartBar },
    ],
  },
  {
    label: "PLATFORM",
    items: [
      { id: "developer", label: "Developer", icon: Code },
      { id: "marketplace", label: "Marketplace", icon: PuzzlePiece },
    ],
  },
  {
    label: "INTELLIGENCE",
    items: [
      { id: "ai-agents", label: "AI Agents", icon: Robot },
      { id: "mobile", label: "Mobile Apps", icon: DeviceMobile },
    ],
  },
  {
    label: "MIGRATION",
    items: [{ id: "workbench", label: "Workbench", icon: HardDrives }],
  },
]

const ROOFTOPS: Rooftop[] = ["All", "Downtown Toyota", "North Ford", "Westside Honda"] as const
// legacy alias — use ROOFTOP_OPTS as source of truth

// ──────────────────────────────────────────────────────────
// Geometric A — minimal, machined
// ──────────────────────────────────────────────────────────
function GeometricA({ size = 28 }: { size?: number }) {
  return (
    <div
      className="relative flex shrink-0 items-center justify-center bg-[var(--accent)] text-white select-none"
      style={{ width: size, height: size, borderRadius: 6 }}
      aria-hidden
    >
      {/* Stylized A: two diagonal stems + crossbar */}
      <svg
        width={size * 0.62}
        height={size * 0.62}
        viewBox="0 0 16 16"
        fill="none"
        className="block"
      >
        <path
          d="M2.5 14L8 2L13.5 14"
          stroke="white"
          strokeWidth="2.1"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
        <path d="M5.2 9H10.8" stroke="white" strokeWidth="2.1" strokeLinecap="square" />
      </svg>
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// Shell
// ──────────────────────────────────────────────────────────
export function Shell({ children }: { children?: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [activeId, setActiveId] = React.useState<string>("f1-flow")
  const selectedRooftop = useStore(s=> s.selectedRooftop)
  const setSelectedRooftop = useStore(s=> s.setSelectedRooftop)
  const systemHealth = useStore(s=> s.systemHealth)
  const degraded = systemHealth.degraded

  // Close mobile drawer on resize to desktop
  React.useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false)
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--text-primary)] antialiased">
      {/* ── Top bar ── */}
      <header
        className="sticky top-0 z-40 flex h-[52px] items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-3 lg:px-4"
        style={{ height: "var(--topbar-height)" }}
      >
        {/* Left: mobile hamburger + wordmark */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            aria-label="Toggle navigation"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 lg:hidden"
          >
            <List size={18} weight="bold" />
          </button>

          <div className="flex items-center gap-2.5">
            <GeometricA />
            <span className="text-[15px] font-[750] tracking-[-0.03em] leading-none">
              AUTO<span className="font-[350] tracking-[-0.02em]">CORE</span>
            </span>
            <span className="hidden sm:inline-flex items-center rounded-md bg-zinc-900 px-1.5 py-0.5 font-mono text-[9px] font-medium tracking-widest text-white">
              ERP
            </span>
          </div>

          {/* Group switcher — desktop only dense */}
          <div className="hidden xl:flex items-center gap-2 pl-3">
            <div className="h-5 w-px bg-[var(--border)]" />
            <button className="group flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-left hover:bg-[var(--surface-hover)] transition-colors-taste">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-900 text-[10px] font-bold text-white">
                S
              </span>
              <span className="hidden 2xl:block">
                <span className="block text-[12px] font-[600] leading-none tracking-tight">
                  Sovereign Auto Group
                </span>
                <span className="block font-mono text-[10px] leading-none tracking-wide text-[var(--text-muted)]">
                  3 ROOFTOPS
                </span>
              </span>
              <span className="block xl:hidden text-[12px] font-[600] tracking-tight">
                Sovereign
              </span>
              <CaretUpDown size={12} weight="bold" className="text-zinc-400 group-hover:text-zinc-600" />
            </button>
          </div>

          {/* Rooftop selector — segmented — LIVE: Shell drives store.selectedRooftop → CommandCenter filters via useStore */}
          <div className="hidden lg:flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-1 ml-1">
            {ROOFTOP_OPTS.map((opt) => {
              const active = opt.id === selectedRooftop
              return (
                <button
                  key={opt.id}
                  onClick={() => setSelectedRooftop(opt.id)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-[12px] font-[500] leading-none tracking-tight transition-colors-taste whitespace-nowrap",
                    active
                      ? "bg-white text-zinc-900 shadow-sm border border-zinc-200"
                      : "text-zinc-600 hover:text-zinc-900"
                  )}
                  title={opt.label}
                  aria-pressed={active}
                >
                  {opt.short}
                </button>
              )
            })}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right: search + SLA + actions + user */}
        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
          {/* Global search — placeholder WCAG AA 4.83:1 (zinc-500 on white) */}
          <div className="relative hidden md:block">
            <MagnifyingGlass
              size={14}
              weight="bold"
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              placeholder="Search vehicles, deals, ROs…"
              className="h-8 w-[260px] lg:w-[300px] rounded-xl border border-[var(--border-strong)] bg-white pl-8 pr-[62px] text-[13px] text-zinc-900 placeholder:text-zinc-500 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-muted)]"
            />
            <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-zinc-600">
              <Command size={10} weight="bold" />K
            </span>
          </div>

          {/* Mobile search icon */}
          <button className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 md:hidden" aria-label="Search">
            <MagnifyingGlass size={18} />
          </button>

          {/* Resilience SLA badge */}
          <div className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-30" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
            </span>
            <span className="hidden lg:inline font-mono text-[11px] font-[600] tracking-tight text-emerald-800">
              99.95%
            </span>
            <span className="hidden lg:inline h-3 w-px bg-emerald-200" />
            <span className="font-mono text-[10px] font-medium tracking-widest text-emerald-700">
              RTO 1H
            </span>
            <ShieldCheck size={14} weight="fill" className="hidden lg:block text-emerald-600" />
          </div>

          <div className="hidden sm:block h-6 w-px bg-[var(--border)]" />

          {/* Notifications */}
          <button aria-label="Notifications" className="relative inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--border)] bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 shadow-sm">
            <Bell size={16} weight="regular" />
            <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5 items-center justify-center">
              <span className="absolute h-2.5 w-2.5 rounded-full bg-[var(--accent)] animate-ping opacity-20" />
              <span className="relative h-2 w-2 rounded-full bg-[var(--accent)] ring-2 ring-white" />
            </span>
          </button>

          {/* User */}
          <div className="flex items-center gap-2.5 pl-1">
            <div className="hidden sm:block text-right leading-none">
              <div className="text-[12px] font-[600] tracking-tight leading-none">Alex Morgan</div>
              <div className="font-mono text-[10px] tracking-widest text-[var(--text-muted)] leading-none mt-0.5">
                GROUP COO
              </div>
            </div>
            <div className="relative">
              <img
                src="https://i.pravatar.cc/100?img=12"
                alt="Alex Morgan"
                width={32}
                height={32}
                className="h-8 w-8 rounded-xl object-cover border border-zinc-200 shadow-sm"
              />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <CaretDown size={12} weight="bold" className="hidden sm:block text-zinc-400" />
          </div>
        </div>
      </header>
      {/* F18 global degraded banner — across app */}
      {degraded && (
        <div className="border-b border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-snug text-amber-900">
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 font-mono text-[11px] font-[700] tracking-widest"><span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" /> DEGRADED MODE</span>
            <span>{systemHealth.region} impairment → automated failover {systemHealth.failoverRegion} • status {systemHealth.statusPage.replace("https://","")} • core deal/RO writes remain via {systemHealth.failoverRegion} • read-heavy • lender rates “verify at funding” • queued {systemHealth.queuedMutations} • RTO {systemHealth.rto} • RPO {systemHealth.rpo}</span>
          </div>
        </div>
      )}
      {/* E12 — Consent management • two-party (CA 2-party) disclosure auto — always visible */}
      <div className="border-b border-[var(--border)] bg-white px-3 py-2 text-[11px] leading-snug text-[var(--text-secondary)]">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-border)] bg-[var(--accent-muted)] px-2 py-1 text-[11px] font-semibold text-[var(--accent)]">
            <ShieldCheck size={11} weight="fill" /> Consent • E12 §5.3
          </span>
          <span className="font-medium">CA is a two-party consent state</span>
          <span className="hidden md:inline text-[var(--text-muted)]">— recording disclosure auto: “This call may be recorded for quality & training.” at 00:02 • opt-in captured • comms (SMS/email) + data-sharing ledger • 13 new state privacy laws • immutable</span>
          <span className="rounded-full bg-zinc-900 px-2 py-0.5 font-mono text-[10px] font-semibold text-white">2-party ✓</span>
          <span className="ml-auto hidden rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-[11px] font-medium text-emerald-700 md:inline-flex">Disclosure auto • logged</span>
        </div>
      </div>

      <div className="flex">
        {/* ── Sidebar — desktop ── */}
        <aside
          className={cn(
            "sticky top-[52px] hidden h-[calc(100dvh-52px)] shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-300 lg:flex",
            collapsed ? "w-[64px]" : "w-[260px]"
          )}
          style={{
            width: collapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-width)",
            top: "var(--topbar-height)",
          }}
          aria-label="Primary"
        >
          <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 scrollbar-thin">
            {/* Collapse toggle */}
            <div className={cn("px-3 pb-3 flex", collapsed ? "justify-center" : "justify-end")}>
              <button
                onClick={() => setCollapsed((v) => !v)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors-taste"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? <CaretRight size={14} weight="bold" /> : <CaretLeft size={14} weight="bold" />}
              </button>
            </div>

            <nav className="space-y-5 px-2">
              {NAV.map((section) => (
                <div key={section.label} className="space-y-1">
                  {!collapsed && (
                    <div className="px-2 pb-1 font-mono text-[10px] font-[600] tracking-[0.12em] text-zinc-500">
                      {section.label}
                    </div>
                  )}
                  {collapsed && <div className="mx-2 h-px bg-zinc-800" />}
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const active = item.id === activeId
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveId(item.id)}
                          title={collapsed ? item.label : undefined}
                          className={cn(
                            "group relative flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-[13px] font-[450] tracking-tight transition-colors-taste",
                            collapsed && "justify-center px-2",
                            active
                              ? "bg-white text-zinc-900 shadow-sm"
                              : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                          )}
                        >
                          {active && !collapsed && (
                            <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-[var(--accent)]" />
                          )}
                          {active && collapsed && (
                            <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-[var(--accent)]" />
                          )}
                          <item.icon
                            size={18}
                            weight={active ? "fill" : "regular"}
                            className={cn(
                              "shrink-0",
                              active ? "text-zinc-900" : "text-zinc-500 group-hover:text-zinc-300"
                            )}
                          />
                          {!collapsed && (
                            <>
                              <span className="flex-1 truncate">{item.label}</span>
                              {item.badge && (
                                <span
                                  className={cn(
                                    "inline-flex min-w-5 justify-center rounded-full px-1.5 py-0.5 text-center font-mono text-[10px] font-bold leading-none",
                                    active
                                      ? "bg-zinc-900 text-white"
                                      : "bg-zinc-800 text-zinc-300 group-hover:bg-zinc-700"
                                  )}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          {/* Sidebar footer — resilience + collapse hint */}
          <div className="border-t border-zinc-800 p-3">
            {!collapsed ? (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="font-mono text-[10px] font-bold tracking-widest text-zinc-400">
                    RESILIENCE
                  </span>
                  <span className="ml-auto rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] font-medium text-zinc-300">
                    ACTIVE
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="font-mono text-[13px] font-bold tracking-tight text-white">99.95%</span>
                  <span className="text-[11px] text-zinc-500">SLA</span>
                  <span className="mx-1 text-zinc-700">•</span>
                  <span className="font-mono text-[11px] font-medium text-zinc-300">RPO 15m</span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-zinc-800">
                  <div className="h-full w-[99%] rounded-full bg-emerald-500" />
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              </div>
            )}
          </div>
        </aside>

        {/* ── Mobile drawer ── */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <button
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-zinc-950/50 backdrop-blur-[2px]"
            />
            <aside className="relative flex w-[300px] max-w-[84vw] flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-300 shadow-2xl motion-slide-in">
              <div className="flex h-[52px] items-center gap-2.5 border-b border-zinc-800 px-4">
                <GeometricA size={26} />
                <span className="text-[14px] font-[750] tracking-[-0.03em] text-white">
                  AUTO<span className="font-[350]">CORE</span>
                </span>
                <span className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400">
                  <List size={16} />
                </span>
              </div>

              <div className="p-3">
                <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900 p-1">
                  {ROOFTOP_OPTS.slice(0, 3).map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedRooftop(opt.id)}
                      className={cn(
                        "flex-1 rounded-lg px-2 py-1.5 text-[11px] font-medium",
                        opt.id === selectedRooftop ? "bg-white text-zinc-900" : "text-zinc-400"
                      )}
                    >
                      {opt.short.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-2 py-2">
                <nav className="space-y-4">
                  {NAV.map((section) => (
                    <div key={section.label}>
                      <div className="px-2 pb-1 font-mono text-[10px] tracking-[0.12em] text-zinc-500">
                        {section.label}
                      </div>
                      <div className="space-y-0.5">
                        {section.items.map((item) => {
                          const active = item.id === activeId
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setActiveId(item.id)
                                setMobileOpen(false)
                              }}
                              className={cn(
                                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px]",
                                active ? "bg-white text-zinc-900" : "text-zinc-400"
                              )}
                            >
                              <item.icon size={18} weight={active ? "fill" : "regular"} />
                              <span className="flex-1">{item.label}</span>
                              {item.badge && (
                                <span className="rounded-full bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
                                  {item.badge}
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </nav>
              </div>

              <div className="border-t border-zinc-800 p-3">
                <div className="flex items-center gap-3">
                  <img
                    src="https://i.pravatar.cc/100?img=12"
                    alt="Alex Morgan"
                    className="h-8 w-8 rounded-xl object-cover"
                  />
                  <div>
                    <div className="text-[12px] font-semibold text-white">Alex Morgan</div>
                    <div className="font-mono text-[10px] tracking-widest text-zinc-500">GROUP COO</div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* ── Main ── */}
        <main className="min-w-0 flex-1 bg-[var(--bg)]">
          {/* Rooftop bar — mobile only, secondary — LIVE drives store */}
          <div className="flex items-center gap-2 border-b border-[var(--border)] bg-white px-3 py-2 lg:hidden">
            <span className="font-mono text-[10px] tracking-widest text-zinc-500">ROOFTOP</span>
            <div className="flex flex-1 gap-1 overflow-x-auto">
              {ROOFTOP_OPTS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedRooftop(opt.id)}
                  className={cn(
                    "whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium",
                    opt.id === selectedRooftop
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white text-zinc-600"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content slot — Suspense per route (skeleton fallback) */}
          {children ? (
            <div className="p-0">{children}</div>
          ) : (
            <React.Suspense fallback={<ViewSkeleton />}>
              <div className="min-w-0">
                {activeId === "f1-flow" && <F1Flow />}
                {activeId === "command-center" && <CommandCenter />}
                {(activeId === "vehicles" || activeId === "transfers") && <Inventory />}
                {(activeId === "showroom" || activeId === "fi-desk") && <Desking />}
                {activeId === "crm-inbox" && <CRMInbox />}
                {activeId === "service-lane" && <ServiceLane />}
                {activeId === "parts-counter" && <PartsCounter />}
                {activeId === "gl-close" && <AccountingClose />}
                {(activeId === "developer" || activeId === "marketplace") && <DeveloperPortal />}
                {activeId === "ai-agents" && <AIAgents />}
                {activeId === "mobile" && <MobileApps />}
                {activeId === "workbench" && <MigrationWorkbench />}
                {!["f1-flow","command-center","vehicles","transfers","showroom","fi-desk","crm-inbox","service-lane","parts-counter","gl-close","developer","marketplace","ai-agents","mobile","workbench"].includes(activeId) && <CommandCenter />}
              </div>
            </React.Suspense>
          )}
        </main>
      </div>
    </div>
  )
}

export default Shell
