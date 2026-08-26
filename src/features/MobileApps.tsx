import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  DeviceMobile,
  Camera,
  Microphone,
  Play,
  Check,
  CheckCircle,
  Clock,
  WarningCircle,
  Lightning,
  MagnifyingGlass,
  Barcode,
  Scan,
  VideoCamera,
  ChatCircle,
  CreditCard,
  MapPin,
  Car,
  Users,
  Wrench,
  Timer,
  ArrowRight,
  CaretRight,
  Phone,
  EnvelopeSimple,
  ShieldCheck,
  CellSignalHigh,
  BatteryHigh,
  WifiHigh,
  PencilSimple,
  Star,
  PaperPlaneTilt,
  Flag,
  Eye,
  DotsThree,
  Plus,
  Pause,
  Stop,
} from "@phosphor-icons/react"
import { useStore } from "@/lib/store"

// ──────────────────────────────────────────────
// Phone Frame — iPhone 15 mock 390×844
// zinc-950 frame, notch, home indicator, shadow
// ──────────────────────────────────────────────
function PhoneFrame({
  children,
  label,
  accent,
}: {
  children: React.ReactNode
  label: string
  accent: string
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3 py-1 text-[11px] font-bold tracking-widest text-white">
        <span className={`h-2 w-2 rounded-full ${accent}`} />
        {label}
        <span className="ml-1 hidden sm:inline font-mono text-[10px] font-medium tracking-wide text-zinc-400">390×844 • iPhone 15</span>
      </div>
      <div className="relative bg-zinc-950 rounded-[36px] p-[10px] shadow-[0_28px_64px_rgba(0,0,0,0.45),0_10px_20px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.06)_inset]">
        {/* side button */}
        <span className="absolute -right-[3px] top-[108px] h-[72px] w-[3px] rounded-l-sm bg-zinc-700" />
        <span className="absolute -left-[3px] top-[94px] h-[28px] w-[3px] rounded-r-sm bg-zinc-700" />
        <span className="absolute -left-[3px] top-[132px] h-[56px] w-[3px] rounded-r-sm bg-zinc-700" />
        <span className="absolute -left-[3px] top-[198px] h-[56px] w-[3px] rounded-r-sm bg-zinc-700" />
        {/* screen */}
        <div className="relative flex h-[844px] w-[390px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-[28px] bg-white">
          {/* notch — Dynamic Island */}
          <div className="absolute left-1/2 top-[9px] z-30 h-[30px] w-[126px] -translate-x-1/2 rounded-full bg-zinc-950" />
          {/* status bar */}
          <div className="relative z-20 flex h-[52px] shrink-0 items-end justify-between bg-white px-7 pb-2 pt-3">
            <span className="font-mono text-[13px] font-bold tracking-tight text-zinc-900">9:42</span>
            <span className="flex items-center gap-1 text-zinc-900">
              <CellSignalHigh size={15} weight="fill" />
              <WifiHigh size={15} weight="fill" />
              <BatteryHigh size={20} weight="fill" />
            </span>
          </div>
          <div className="relative flex flex-1 flex-col overflow-hidden bg-[#fafafa]">{children}</div>
          {/* home indicator */}
          <div className="pointer-events-none absolute bottom-[7px] left-1/2 z-30 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-zinc-900" />
        </div>
      </div>
      <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2.5 py-1 font-mono text-[10px] font-medium tracking-wide text-zinc-500 shadow-sm">
        <DeviceMobile size={12} weight="bold" /> Mobile • field-native
      </span>
    </div>
  )
}

// ──────────────────────────────────────────────
// Offline banner — degraded mode demo (E1-T12)
// ──────────────────────────────────────────────
function OfflineBanner({ count = 3, visible }: { count?: number; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden border-b border-amber-300 bg-amber-50"
        >
          <div className="flex items-center gap-2 px-3 py-[9px]">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-amber-500 text-white">
              <WarningCircle size={13} weight="fill" />
            </span>
            <span className="font-mono text-[11px] font-bold tracking-wide text-amber-900">
              Offline • queued mutations {count} • sync on reconnect
            </span>
            <span className="ml-auto h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ──────────────────────────────────────────────
// Salesperson Phone
// ──────────────────────────────────────────────
function SalespersonPhone() {
  const [offline, setOffline] = useState(false)
  const [activeLead, setActiveLead] = useState(0)
  const [deskOpen, setDeskOpen] = useState(false)
  const [pencilDown] = useState(3000)
  // derived pencil — matches Desking math for demo
  const monthly = (() => {
    const price = 36490
    const rate = 6.49 / 100 / 12
    const n = 72
    const pv = price - pencilDown + 1890 + 275 // tax+fees mock
    const m = (pv * rate) / (1 - Math.pow(1 + rate, -n))
    return Math.round(m)
  })()

  const leads = [
    { id: "LEAD-001", name: "Jonathan Reeves", src: "Website • Paid Search", time: "2m ago", hot: true, vehicle: "RAV4 Hybrid XLE Premium", score: 84 },
    { id: "LEAD-014", name: "Priya Nair", src: "Phone inbound", time: "14m ago", hot: true, vehicle: "Grand Highlander MAX", score: 91 },
    { id: "LEAD-020", name: "Emily Carter", src: "BMW X5 • Saved search", time: "38m ago", hot: false, vehicle: "X5 xDrive40i M Sport", score: 71 },
  ]
  const active = leads[activeLead]
  const vehicles = useStore((s) => s.vehicles)
  const featured = vehicles.find((v) => v.stockNo === "T23157") ?? vehicles[2]

  return (
    <PhoneFrame label="Salesperson" accent="bg-sky-500">
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* app header */}
        <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#0F62FE] text-white">
              <Users size={13} weight="fill" />
            </div>
            <div className="leading-none">
              <div className="text-[13px] font-bold tracking-tight">Sales</div>
              <div className="font-mono text-[10px] tracking-wide text-zinc-500">Leads • Pipeline</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="hidden items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 font-mono text-[10px] font-bold sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              3 hot
            </span>
            <button className="grid h-8 w-8 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-600">
              <MagnifyingGlass size={14} weight="bold" />
            </button>
          </div>
        </div>

        {/* offline toggle row */}
        <div className="flex items-center justify-between bg-zinc-900 px-3 py-2">
          <span className="font-mono text-[10px] font-bold tracking-[0.14em] text-zinc-400">FIELD MODE</span>
          <button
            onClick={() => setOffline((v) => !v)}
            className={`relative inline-flex h-6 w-[44px] items-center rounded-full p-0.5 transition ${offline ? "bg-amber-500" : "bg-zinc-700"}`}
            aria-label="Toggle offline demo"
          >
            <span
              className={`grid h-5 w-5 place-items-center rounded-full bg-white text-[10px] font-bold shadow transition-all ${offline ? "translate-x-[20px] text-amber-600" : "translate-x-0 text-zinc-500"}`}
            >
              {offline ? "!" : "✓"}
            </span>
          </button>
        </div>
        <OfflineBanner visible={offline} count={3} />

        {/* scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* Lead queue */}
          <div className="border-b border-zinc-200 bg-white p-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold tracking-[0.12em] text-zinc-500">LEAD QUEUE • TAP TO OPEN</span>
              <span className="rounded-full bg-[#0F62FE] px-2 py-0.5 font-mono text-[10px] font-bold text-white">E14</span>
            </div>
            <div className="mt-2 space-y-2">
              {leads.map((l, i) => (
                <button
                  key={l.id}
                  onClick={() => setActiveLead(i)}
                  className={`flex w-full items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-left transition ${i === activeLead ? "border-[#0F62FE] bg-[#edf2ff] shadow-sm" : "border-zinc-200 bg-white"}`}
                >
                  <img src={`https://i.pravatar.cc/100?img=${12 + i}`} alt="" className="h-9 w-9 rounded-full object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="text-[13px] font-bold leading-none">{l.name}</span>
                      {l.hot && <span className="rounded-full bg-red-500 px-1.5 py-0.5 font-mono text-[9px] font-black tracking-widest text-white">HOT</span>}
                      <span className="ml-auto rounded-full bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">{l.score}</span>
                    </span>
                    <span className="block truncate font-mono text-[11px] leading-tight text-zinc-500">{l.src} • {l.time}</span>
                    <span className="block truncate text-[11px] font-medium text-zinc-700">{l.vehicle}</span>
                  </span>
                  <CaretRight size={14} className={i === activeLead ? "text-[#0F62FE]" : "text-zinc-300"} weight="bold" />
                </button>
              ))}
            </div>
            <div className="mt-2 flex gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 font-mono text-[10px] font-bold text-emerald-700 border border-emerald-200">
                <Phone size={10} weight="fill" /> Speed-to-lead 47s
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-1 font-mono text-[10px] font-bold text-white">
                12 open
              </span>
            </div>
          </div>

          {/* Customer timeline */}
          <div className="border-b border-zinc-200 bg-zinc-50 p-3">
            <div className="flex items-center gap-2">
              <div className="grid h-6 w-6 place-items-center rounded-lg bg-zinc-900 text-white">
                <Clock size={11} weight="bold" />
              </div>
              <span className="text-[12px] font-bold">Customer timeline</span>
              <span className="ml-auto font-mono text-[11px] font-bold text-zinc-500">{active.id} • {active.name}</span>
            </div>
            <div className="relative mt-3 pl-4">
              <span className="absolute left-[7px] top-1 bottom-2 w-px bg-zinc-200" />
              {[
                { t: "09:14", who: "Lead ingress", what: "Website VIN • dedup <5s • assigned J. Alvarez • alert", dot: "bg-[#0F62FE]" },
                { t: "09:15", who: "AI bridge", what: "SMS 22s → warm transfer • whisper: RAV4 + prior Highlander", dot: "bg-emerald-500" },
                { t: "09:42", who: "On lot now", what: `Viewing ${active.vehicle} • test drive queued • trade pending`, dot: "bg-amber-500" },
                { t: "Now", who: "Desk starter", what: "Tap to pencil — same deal object, no re-key", dot: "bg-white ring-2 ring-[#0F62FE]" },
              ].map((e) => (
                <div key={e.t} className="relative flex gap-2.5 pb-3 last:pb-0">
                  <span className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full border border-white shadow ${e.dot}`} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline gap-1.5">
                      <span className="font-mono text-[11px] font-bold">{e.t}</span>
                      <span className="text-[11px] font-semibold text-zinc-900">{e.who}</span>
                    </span>
                    <span className="block text-[11px] leading-snug text-zinc-600">{e.what}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Inventory card */}
          <div className="p-3">
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
              <div className="relative h-[148px] overflow-hidden bg-zinc-100">
                <img src={(featured.photos?.[0] as string) ?? `https://picsum.photos/seed/${featured.stockNo}/640/360`} alt="" className="h-full w-full object-cover" />
                <span className="absolute left-2.5 top-2.5 rounded-full bg-white px-2 py-1 font-mono text-[10px] font-bold shadow">{featured.stockNo} • {featured.lotLocation}</span>
                <span className="absolute bottom-2.5 left-2.5 rounded-full bg-zinc-900 px-2 py-1 font-mono text-[11px] font-bold text-white">${featured.internetPrice.toLocaleString()}</span>
                <span className="absolute bottom-2.5 right-2.5 grid h-8 w-8 place-items-center rounded-full bg-white text-zinc-900 shadow">
                  <Scan size={14} weight="bold" />
                </span>
              </div>
              <div className="p-3">
                <div className="text-[13px] font-bold leading-tight">
                  {featured.year} {featured.make} {featured.model} {featured.trim}
                </div>
                <div className="font-mono text-[11px] text-zinc-500">{featured.vin.slice(-6)} • {featured.exteriorColor} • {featured.mileage.toLocaleString()} mi</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {featured.features.slice(0, 3).map((f) => (
                    <span key={f} className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-medium text-zinc-700">
                      {f}
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-1 font-mono text-[11px]">
                  <span className={`h-1.5 w-1.5 rounded-full ${featured.status === "stock" ? "bg-emerald-500" : "bg-amber-500"}`} />
                  <span className="font-bold capitalize text-zinc-900">{featured.status}</span>
                  <span className="text-zinc-400">•</span>
                  <span className="text-zinc-500">Aging {featured.agingDays}d</span>
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                    <Eye size={10} weight="bold" /> Live
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Deal status */}
          <div className="px-3 pb-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold tracking-[0.12em] text-zinc-500">DEAL STATUS</span>
                <span className="rounded-full bg-amber-500 px-2 py-0.5 font-mono text-[10px] font-black tracking-widest text-black">PENCIL</span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-zinc-50 border border-zinc-200 py-2">
                  <div className="font-mono text-[10px] tracking-widest text-zinc-500">TERM</div>
                  <div className="text-[13px] font-bold">72m</div>
                </div>
                <div className="rounded-xl bg-zinc-900 text-white py-2">
                  <div className="font-mono text-[10px] tracking-widest text-zinc-400">PAYMENT</div>
                  <div className="font-mono text-[14px] font-black">${monthly}/mo</div>
                </div>
                <div className="rounded-xl bg-zinc-50 border border-zinc-200 py-2">
                  <div className="font-mono text-[10px] tracking-widest text-zinc-500">RATE</div>
                  <div className="text-[13px] font-bold">6.49%</div>
                </div>
              </div>
              <div className="mt-2 font-mono text-[11px] text-zinc-500">Trade • ACV $18.2k • allowance $17.5k • lender: TFS live</div>
            </div>
          </div>

          {/* Delivery checklist */}
          <div className="px-3 pb-4">
            <div className="rounded-2xl border border-zinc-900 bg-zinc-900 p-3 text-white">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-white text-zinc-900">
                  <CheckCircle size={14} weight="fill" />
                </span>
                <span className="text-[12px] font-bold">Delivery checklist</span>
                <span className="ml-auto rounded-full bg-white/15 px-2 py-0.5 font-mono text-[10px] font-bold">3/5</span>
              </div>
              <div className="mt-2.5 space-y-1.5">
                {[
                  { label: "We-owe fulfilled", done: true },
                  { label: "Funding • CIT cleared", done: true },
                  { label: "We-owe detail complete", done: true },
                  { label: "Title • Vitu queued", done: false },
                  { label: "Welcome campaign • CSI", done: false },
                ].map((c) => (
                  <div key={c.label} className="flex items-center gap-2 rounded-xl bg-white/10 px-2.5 py-2">
                    <span className={`grid h-5 w-5 place-items-center rounded-full border ${c.done ? "border-emerald-400 bg-emerald-500 text-white" : "border-white/20 bg-white/10"}`}>
                      {c.done ? <Check size={11} weight="bold" /> : <Clock size={11} />}
                    </span>
                    <span className={`text-[12px] ${c.done ? "font-semibold text-white" : "text-zinc-300"}`}>{c.label}</span>
                    {c.done && <span className="ml-auto text-[11px] font-bold text-emerald-300">✓</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* bottom action — desk starter F1 pencil */}
        <div className="border-t border-zinc-200 bg-white p-3">
          <button
            onClick={() => setDeskOpen((v) => !v)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0F62FE] py-[14px] text-[13px] font-bold text-white shadow-sm hover:bg-[#0353e9] active:bg-[#002d9c] transition"
          >
            <PencilSimple size={16} weight="fill" />
            Start Desk — F1 Pencil
            <ArrowRight size={14} weight="bold" />
          </button>
          <span className="mt-1.5 flex items-center justify-center gap-1 font-mono text-[10px] tracking-wide text-zinc-400">
            <Lightning size={10} weight="fill" className="text-amber-500" /> Opens same deal object • no re-key
          </span>
        </div>

        {/* F1 pencil sheet */}
        <AnimatePresence>
          {deskOpen && (
            <>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDeskOpen(false)}
                className="absolute inset-0 z-20 bg-zinc-950/40 backdrop-blur-[1px]"
                aria-label="Close pencil"
              />
              <motion.div
                initial={{ y: 320 }}
                animate={{ y: 0 }}
                exit={{ y: 320 }}
                transition={{ type: "spring", damping: 26, stiffness: 300 }}
                className="absolute bottom-0 left-0 right-0 z-30 max-h-[72%] overflow-hidden rounded-t-[20px] border border-zinc-200 bg-white shadow-[0_-12px_32px_rgba(0,0,0,0.18)]"
              >
                <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-3">
                  <span className="inline-flex items-center gap-2 text-[13px] font-bold">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-zinc-900 text-white">
                      <PencilSimple size={13} weight="fill" />
                    </span>
                    F1 Pencil • {active.name}
                  </span>
                  <button onClick={() => setDeskOpen(false)} className="grid h-8 w-8 place-items-center rounded-full border border-zinc-200 bg-white">
                    <CaretRight size={14} weight="bold" className="rotate-90" />
                  </button>
                </div>
                <div className="overflow-auto p-4">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { term: 60, mo: Math.round(monthly * 1.14), apr: "5.99%" },
                      { term: 72, mo: monthly, apr: "6.49%", primary: true },
                      { term: 84, mo: Math.round(monthly * 0.88), apr: "7.49%" },
                    ].map((p) => (
                      <div key={p.term} className={`rounded-2xl border p-3 text-center ${p.primary ? "border-[#0F62FE] bg-[#edf2ff] ring-1 ring-[#0F62FE]" : "border-zinc-200 bg-white"}`}>
                        <div className="font-mono text-[11px] font-bold tracking-widest text-zinc-500">{p.term} MO</div>
                        <div className="font-mono text-[16px] font-black tracking-tight">${p.mo}</div>
                        <div className="font-mono text-[11px] text-zinc-500">{p.apr}</div>
                        {p.primary && <span className="mt-1 inline-flex rounded-full bg-[#0F62FE] px-2 py-0.5 font-mono text-[10px] font-bold text-white">RECOMMENDED</span>}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 font-mono text-[11px] leading-relaxed">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Vehicle</span>
                      <span className="font-bold text-zinc-900">{featured.year} {featured.make} {featured.model} • ${featured.internetPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Cash down</span>
                      <span className="font-bold">${pencilDown.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Tax + fees (MI 6%)</span>
                      <span className="font-bold">+$2,165</span>
                    </div>
                    <div className="mt-2 flex justify-between border-t border-zinc-200 pt-2 text-[12px] font-bold">
                      <span>Amount financed</span>
                      <span>${(featured.internetPrice - pencilDown + 2165).toLocaleString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setDeskOpen(false)}
                    className="mt-3 w-full rounded-full bg-zinc-900 py-3 text-[13px] font-bold text-white"
                  >
                    Present to customer
                  </button>
                  <span className="mt-2 block text-center font-mono text-[10px] tracking-wide text-zinc-400">E5 payment match to penny • F11 caps • lender live</span>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </PhoneFrame>
  )
}

// ──────────────────────────────────────────────
// Advisor Phone
// ──────────────────────────────────────────────
function AdvisorPhone() {
  const [offline, setOffline] = useState(false)
  const [scanDone, setScanDone] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [voiceFilled, setVoiceFilled] = useState(true)
  const [approvals, setApprovals] = useState({ brakes: "pending" as "pending" | "approved" | "declined", tires: "pending" as "pending" | "approved" | "declined" })
  const [textSent, setTextSent] = useState(false)

  return (
    <PhoneFrame label="Service Advisor" accent="bg-emerald-500">
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-600 text-white">
              <Wrench size={13} weight="fill" />
            </div>
            <div className="leading-none">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-bold tracking-tight">Lane</span>
                <span className="rounded-full bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-widest text-white">RO #1001</span>
              </div>
              <div className="font-mono text-[10px] tracking-wide text-zinc-500">Walk-around • MPI • Approve</div>
            </div>
          </div>
          <span className="grid h-8 w-8 place-items-center rounded-full border border-zinc-200 bg-white">
            <DotsThree size={16} weight="bold" />
          </span>
        </div>

        <div className="flex items-center justify-between bg-zinc-900 px-3 py-2">
          <span className="font-mono text-[10px] font-bold tracking-[0.14em] text-zinc-400">ADVISOR • LOT</span>
          <button
            onClick={() => setOffline((v) => !v)}
            className={`relative inline-flex h-6 w-[44px] items-center rounded-full p-0.5 transition ${offline ? "bg-amber-500" : "bg-zinc-700"}`}
          >
            <span className={`grid h-5 w-5 place-items-center rounded-full bg-white text-[10px] font-bold shadow transition-all ${offline ? "translate-x-[20px] text-amber-600" : "translate-x-0 text-zinc-500"}`}>
              {offline ? "!" : "✓"}
            </span>
          </button>
        </div>
        <OfflineBanner visible={offline} count={3} />

        <div className="flex-1 overflow-y-auto">
          {/* VIN scan */}
          <div className="border-b border-zinc-200 bg-white p-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold tracking-[0.12em] text-zinc-500">WALK-AROUND • VIN SCAN</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700 border border-emerald-200">
                <Scan size={10} weight="bold" /> Ready
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-900 text-white">
                <Barcode size={16} weight="bold" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-mono text-[11px] font-bold tracking-wide text-zinc-500">VIN • SCANNED</div>
                <div className="font-mono text-[12px] font-bold tracking-tight">4T1G11AK2RU771842</div>
                <div className="text-[11px] text-zinc-500">2023 Camry SE • 34,210 mi • LOF + cabin</div>
              </div>
              <button
                onClick={() => setScanDone((v) => !v)}
                className={`grid h-9 w-9 place-items-center rounded-full border shadow-sm transition ${scanDone ? "border-emerald-300 bg-emerald-500 text-white" : "border-zinc-200 bg-white text-zinc-600"}`}
              >
                <Camera size={15} weight="fill" />
              </button>
            </div>
            {scanDone && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 font-mono text-[11px] font-bold text-emerald-700 border border-emerald-200">
                <CheckCircle size={12} weight="fill" /> VIN verified • RO opened
              </div>
            )}
            <div className="mt-2.5 grid grid-cols-4 gap-1.5">
              {[
                { label: "Exterior", done: true },
                { label: "Tires", done: true },
                { label: "Lights", done: false },
                { label: "Glass", done: false },
              ].map((c) => (
                <div key={c.label} className={`rounded-xl border py-2.5 text-center ${c.done ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-zinc-200 bg-white text-zinc-500"}`}>
                  <div className={`mx-auto grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold ${c.done ? "bg-emerald-500 text-white" : "bg-zinc-100"}`}>{c.done ? <Check size={11} weight="bold" /> : "○"}</div>
                  <div className="mt-1 text-[11px] font-semibold leading-none">{c.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* MPI video capture */}
          <div className="border-b border-zinc-200 bg-zinc-50 p-3">
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-red-600 text-white">
                <VideoCamera size={11} weight="fill" />
              </span>
              <span className="text-[12px] font-bold">MPI • Video capture</span>
              <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 font-mono text-[10px] font-black tracking-widest text-white">REC</span>
            </div>

            <div className="relative mt-2.5 overflow-hidden rounded-2xl bg-zinc-900">
              <img src="https://picsum.photos/seed/mpi-capture-1/640/360" alt="" className="h-[162px] w-full object-cover opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-zinc-950/0 to-transparent" />
              <button
                onClick={() => setPlaying((v) => !v)}
                className="absolute left-1/2 top-1/2 grid h-[54px] w-[54px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-zinc-900 shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
              >
                {playing ? <Pause size={20} weight="fill" /> : <Play size={20} weight="fill" className="translate-x-0.5" />}
              </button>
              <span className="absolute left-2.5 top-2.5 rounded-full bg-red-600 px-2 py-1 font-mono text-[10px] font-black tracking-widest text-white">00:24</span>
              <span className="absolute right-2.5 top-2.5 rounded-full bg-white/90 px-2 py-1 font-mono text-[10px] font-bold text-zinc-900">HD • 1080p</span>
              <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 bg-zinc-950/80 px-3 py-2 backdrop-blur">
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/20">
                  <span className="block h-full w-[62%] rounded-full bg-red-500" />
                </span>
                <span className="font-mono text-[11px] font-bold text-white">0:15 / 0:24</span>
                <Camera size={14} className="text-white/80" weight="bold" />
              </div>
            </div>

            <div className="mt-2.5 rounded-2xl border border-zinc-200 bg-white p-3">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[#0F62FE] text-white">
                  <Microphone size={12} weight="fill" />
                </span>
                <span className="text-[12px] font-bold">Voice → inspection field</span>
                <button
                  onClick={() => setVoiceFilled((v) => !v)}
                  className={`ml-auto inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${voiceFilled ? "bg-emerald-500 text-white" : "bg-zinc-900 text-white"}`}
                >
                  <Microphone size={11} weight="fill" /> {voiceFilled ? "Filled" : "Tap to fill"}
                </button>
              </div>
              <div className={`mt-2 rounded-xl border p-2.5 font-mono text-[11px] leading-relaxed ${voiceFilled ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
                {voiceFilled ? (
                  <>
                    <span className="font-bold text-emerald-700">Voice captured:</span> “Front pads at 3 mm, rotors scored — recommend replace. Rear at 6 mm — green. Recorded 0.8s • auto-transcribed • <span className="underline">inspection field filled</span>”
                  </>
                ) : (
                  <>Tap microphone to dictate — field will pre-fill from voice transcript.</>
                )}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                <span className="rounded-full bg-zinc-900 px-2 py-1 text-center font-mono text-[10px] font-bold text-white">Front: 3mm • RED</span>
                <span className="rounded-full bg-zinc-50 px-2 py-1 text-center font-mono text-[10px] font-bold border border-zinc-200">Rear: 6mm • GREEN</span>
                <span className="rounded-full bg-white px-2 py-1 text-center font-mono text-[10px] font-bold border border-zinc-200">Video attached ✓</span>
              </div>
            </div>

            {playing && (
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 font-mono text-[11px]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                Playing MPI walk-around • ShopCam • RO #1001
                <button onClick={() => setPlaying(false)} className="ml-auto grid h-7 w-7 place-items-center rounded-full bg-zinc-900 text-white">
                  <Stop size={12} weight="fill" />
                </button>
              </div>
            )}
          </div>

          {/* Approvals — customer tap */}
          <div className="bg-white p-3">
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-zinc-900 text-white">
                <CheckCircle size={11} weight="fill" />
              </span>
              <span className="text-[12px] font-bold">Customer approve by tap</span>
              <span className="ml-auto font-mono text-[11px] text-zinc-500">2 pending</span>
            </div>

            <div className="mt-2.5 space-y-2">
              {[
                { id: "brakes", label: "Front brake pads + rotors", price: 589, severity: "red" as const, key: "brakes" as const },
                { id: "tires", label: "2 tires + alignment", price: 512, severity: "yellow" as const, key: "tires" as const },
              ].map((item) => {
                const state = approvals[item.key]
                return (
                  <div key={item.id} className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`grid h-7 w-7 place-items-center rounded-lg text-white ${item.severity === "red" ? "bg-red-500" : "bg-amber-500 text-black"}`}>
                        <WarningCircle size={14} weight="fill" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12px] font-bold leading-none">{item.label}</span>
                        <span className="block font-mono text-[11px] text-zinc-500">Video • measurement • spec</span>
                      </span>
                      <span className="rounded-full bg-zinc-900 px-2 py-1 font-mono text-[11px] font-bold text-white">${item.price}</span>
                    </div>
                    <div className="mt-2.5 grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => setApprovals((a) => ({ ...a, [item.key]: a[item.key] === "approved" ? "pending" : "approved" }))}
                        className={`rounded-full py-2.5 text-[12px] font-bold transition ${state === "approved" ? "bg-emerald-500 text-white" : "bg-white border border-zinc-300 text-zinc-700"}`}
                      >
                        {state === "approved" ? "✓ Approved" : "Approve"}
                      </button>
                      <button
                        onClick={() => setApprovals((a) => ({ ...a, [item.key]: a[item.key] === "declined" ? "pending" : "declined" }))}
                        className={`rounded-full py-2.5 text-[12px] font-bold transition ${state === "declined" ? "bg-zinc-800 text-white" : "bg-zinc-50 border border-zinc-200 text-zinc-600"}`}
                      >
                        {state === "declined" ? "Declined" : "Decline / Defer"}
                      </button>
                    </div>
                    {state === "approved" && <span className="mt-2 block text-center font-mono text-[11px] font-bold text-emerald-600">Authorization logged • SMS + timeline</span>}
                  </div>
                )
              })}
            </div>

            {/* Texting preview */}
            <div className="mt-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-bold">
                <ChatCircle size={14} weight="fill" className="text-[#0F62FE]" /> Texting • to Priya Nair
                <span className="ml-auto rounded-full bg-white px-2 py-0.5 font-mono text-[10px] tracking-wide border">SMS</span>
              </div>
              <div className="mt-2 rounded-2xl rounded-bl-sm bg-white p-3 shadow-sm border border-zinc-200 text-[12px] leading-relaxed">
                Hi Priya — your MPI video is ready (0:24). Front pads at 3mm recommend replace $589. Tap to approve: <span className="font-bold text-[#0F62FE] underline">sovereign.auto/a/1001</span> — S. Patel, Service
              </div>
              <button
                onClick={() => setTextSent(true)}
                className={`mt-2 flex w-full items-center justify-center gap-1.5 rounded-full py-2.5 text-[12px] font-bold transition ${textSent ? "bg-emerald-500 text-white" : "bg-[#0F62FE] text-white hover:bg-[#0353e9]"}`}
              >
                <PaperPlaneTilt size={14} weight="fill" /> {textSent ? "Sent ✓ • delivered" : "Send approval text"}
              </button>
              {textSent && <span className="mt-1 block text-center font-mono text-[10px] text-zinc-500">2-way SMS • opt-in logged • reply STOP to opt-out</span>}
            </div>

            {/* Payments */}
            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-zinc-900 bg-zinc-900 p-3 text-white">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-zinc-900">
                <CreditCard size={14} weight="fill" />
              </span>
              <span className="text-[12px] font-bold">Payment link • $842 capture</span>
              <button className="ml-auto rounded-full bg-white px-3 py-1.5 text-[12px] font-bold text-zinc-900">Pay • Apple Pay</button>
            </div>
            <span className="mt-2 block text-center font-mono text-[10px] tracking-wide text-zinc-400">E2 embedded payments • authorization → invoice → AR</span>
          </div>
        </div>
      </div>
    </PhoneFrame>
  )
}

// ──────────────────────────────────────────────
// Technician Phone
// ──────────────────────────────────────────────
function TechnicianPhone() {
  const [offline, setOffline] = useState(false)
  const [clockedIn, setClockedIn] = useState(true)
  const [flagMins] = useState(134)
  const [voice, setVoice] = useState({ brakes: "Front pads 3mm — scored rotors", tires: "", battery: "Load test 412 CCA — marginal" })
  const [photos, setPhotos] = useState({ brakes: 1, tires: 0, battery: 1 })
  const technicians = useStore((s) => s.technicians)
  const ros = useStore((s) => s.repairOrders)
  const tech = technicians[0]

  const jobs = ros.slice(0, 2).map((r, i) => ({
    ro: r.roNumber,
    label: r.concern.slice(0, 28),
    status: (i === 0 ? "in-bay" : "queued") as "in-bay" | "queued",
    time: i === 0 ? "BAY 3 • 42m remain" : "BAY 7 • next",
  }))

  return (
    <PhoneFrame label="Technician" accent="bg-zinc-700">
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-zinc-900 text-white">
              <Wrench size={13} weight="bold" />
            </div>
            <div className="leading-none">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-bold tracking-tight">Tech • Bay 3</span>
                <span className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] font-bold ${clockedIn ? "bg-emerald-500 text-white" : "bg-zinc-200 text-zinc-600"}`}>{clockedIn ? "ON CLOCK" : "OFF"}</span>
              </div>
              <div className="font-mono text-[10px] tracking-wide text-zinc-500">{tech?.name ?? "J. Boone"} • {tech?.certifications.slice(0, 2).join(" • ") ?? "ASE"}</div>
            </div>
          </div>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-zinc-50 border border-zinc-200">
            <DotsThree size={16} weight="bold" />
          </span>
        </div>

        <div className="flex items-center justify-between bg-zinc-900 px-3 py-2">
          <span className="font-mono text-[10px] font-bold tracking-[0.14em] text-zinc-400">SHOP FLOOR • HANDS-FREE</span>
          <button
            onClick={() => setOffline((v) => !v)}
            className={`relative inline-flex h-6 w-[44px] items-center rounded-full p-0.5 transition ${offline ? "bg-amber-500" : "bg-zinc-700"}`}
          >
            <span className={`grid h-5 w-5 place-items-center rounded-full bg-white text-[10px] font-bold shadow transition-all ${offline ? "translate-x-[20px] text-amber-600" : "translate-x-0 text-zinc-500"}`}>
              {offline ? "!" : "✓"}
            </span>
          </button>
        </div>
        <OfflineBanner visible={offline} count={3} />

        <div className="flex-1 overflow-y-auto">
          {/* Flag clock */}
          <div className="border-b border-zinc-200 bg-white p-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold tracking-[0.12em] text-zinc-500">FLAG CLOCK</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-1 font-mono text-[10px] font-bold text-white">
                <Timer size={11} weight="bold" /> {Math.floor(flagMins / 60)}h {String(flagMins % 60).padStart(2, "0")} flagged today
              </span>
            </div>
            <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
                <div className="font-mono text-[11px] font-bold tracking-widest text-zinc-500">CURRENT JOB • RO #1001</div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="font-mono text-[22px] font-black tracking-tight tabular-nums">
                    {String(Math.floor(flagMins / 60)).padStart(2, "0")}:{String(flagMins % 60).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-zinc-500">on job • live</span>
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-1 font-mono text-[11px] font-bold text-white">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> Live
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200">
                  <motion.div initial={{ width: 0 }} animate={{ width: "68%" }} transition={{ duration: 0.9, ease: "easeOut" }} className="h-full rounded-full bg-zinc-900" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => setClockedIn(true)}
                  className={`rounded-full px-4 py-3 font-mono text-[11px] font-black tracking-widest transition ${clockedIn ? "bg-emerald-600 text-white shadow-sm" : "bg-white border border-zinc-300 text-zinc-600"}`}
                >
                  IN
                </button>
                <button
                  onClick={() => setClockedIn(false)}
                  className={`rounded-full px-4 py-3 font-mono text-[11px] font-black tracking-widest transition ${!clockedIn ? "bg-zinc-900 text-white shadow-sm" : "bg-white border border-zinc-300 text-zinc-600"}`}
                >
                  OUT
                </button>
              </div>
            </div>
            <div className="mt-2 flex gap-1.5 font-mono text-[11px]">
              <span className="rounded-full bg-zinc-900 px-2 py-1 font-bold text-white">Flag 6.4h / clock 8.0h • 80% eff</span>
              <span className="rounded-full border border-zinc-200 bg-white px-2 py-1">Bay 3</span>
            </div>
          </div>

          {/* Work list */}
          <div className="border-b border-zinc-200 bg-zinc-50 p-3">
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-zinc-900 text-white">
                <Flag size={11} weight="fill" />
              </span>
              <span className="text-[12px] font-bold">Work list</span>
              <span className="ml-auto rounded-full bg-white px-2 py-0.5 font-mono text-[11px] font-bold border border-zinc-200">{jobs.length} jobs</span>
            </div>
            <div className="mt-2.5 space-y-2">
              {jobs.map((j) => (
                <div key={j.ro} className={`rounded-2xl border p-3 ${j.status === "in-bay" ? "border-zinc-900 bg-zinc-900 text-white shadow-sm" : "border-zinc-200 bg-white"}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-black tracking-widest">{j.ro}</span>
                    <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${j.status === "in-bay" ? "bg-emerald-500 text-white" : "bg-zinc-100 text-zinc-600 border border-zinc-200"}`}>{j.status}</span>
                  </div>
                  <div className={`mt-1 text-[12px] font-semibold leading-tight ${j.status === "in-bay" ? "text-white" : "text-zinc-900"}`}>{j.label}</div>
                  <div className={`font-mono text-[11px] ${j.status === "in-bay" ? "text-zinc-400" : "text-zinc-500"}`}>
                    {j.time} {j.status === "in-bay" && "• flag 1.2h"}
                  </div>
                  {j.status === "in-bay" && (
                    <div className="mt-2 flex gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 font-mono text-[11px] font-bold text-zinc-900">
                        <Wrench size={11} weight="bold" /> In progress
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 font-mono text-[11px] font-bold text-white border border-white/15">MPI due</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* MPI capture — voice-to-inspection */}
          <div className="bg-white p-3">
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#0F62FE] text-white">
                <Microphone size={11} weight="fill" />
              </span>
              <span className="text-[12px] font-bold">MPI capture • voice input</span>
              <span className="ml-auto rounded-full bg-amber-500 px-2 py-0.5 font-mono text-[10px] font-black tracking-widest text-black">VOICE</span>
            </div>
            <p className="mt-1 font-mono text-[11px] leading-snug text-zinc-500">Hands-busy → speak → field fills • works offline • sync on reconnect</p>

            <div className="mt-3 space-y-2.5">
              {[
                { id: "brakes" as const, label: "Front brakes", category: "BRAKES", spec: "3mm • scored rotors • RED • video 0:24", placeholder: "Speak or type observation…" },
                { id: "tires" as const, label: "Tires • tread", category: "TIRES", spec: "5/32 • even wear • YELLOW", placeholder: "Tap mic to dictate…" },
                { id: "battery" as const, label: "Battery • CCA", category: "ELECTRICAL", spec: "412 CCA • marginal • retest", placeholder: "Speak CCA reading…" },
              ].map((row) => (
                <div key={row.id} className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-widest text-white">{row.category}</span>
                    <span className="text-[12px] font-bold">{row.label}</span>
                    <span className="ml-auto flex items-center gap-1">
                      <span className="grid h-7 w-7 place-items-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-500">
                        <Camera size={13} weight="bold" />
                      </span>
                      <span className="font-mono text-[11px] font-bold text-zinc-500">{photos[row.id]} photo</span>
                    </span>
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-zinc-500">{row.spec}</div>
                  <div className="mt-2 flex gap-2">
                    <div className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 font-mono text-[12px] leading-snug text-zinc-900">
                      {voice[row.id] ? voice[row.id] : <span className="text-zinc-400">{row.placeholder}</span>}
                    </div>
                    <button
                      onClick={() => {
                        const presets: Record<string, string> = {
                          brakes: "Front pads 3mm — scored rotors, recommend replace",
                          tires: "Tires 5/32 even wear — rotate and recheck 5k",
                          battery: "Load test 412 CCA — marginal, recommend retest",
                        }
                        setVoice((v) => ({ ...v, [row.id]: v[row.id] ? "" : presets[row.id] }))
                      }}
                      className={`grid h-[54px] w-[54px] shrink-0 place-items-center rounded-2xl border shadow-sm transition ${voice[row.id] ? "border-emerald-300 bg-emerald-500 text-white" : "border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800"}`}
                      aria-label="Voice input"
                    >
                      <Microphone size={18} weight="fill" />
                    </button>
                  </div>
                  <div className="mt-2 flex gap-1.5">
                    <button
                      onClick={() => setPhotos((p) => ({ ...p, [row.id]: p[row.id] + 1 }))}
                      className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-bold text-zinc-700"
                    >
                      <Camera size={11} weight="bold" /> Add photo
                    </button>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[11px] font-bold ${voice[row.id] ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                      {voice[row.id] ? <><Check size={11} weight="bold" /> Voice filled</> : "Tap mic to fill"}
                    </span>
                    {voice[row.id] && <span className="ml-auto font-mono text-[10px] text-zinc-400">Queued • will sync</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-2xl border border-zinc-900 bg-zinc-900 p-3 text-white">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-white text-zinc-900">
                  <ShieldCheck size={13} weight="fill" />
                </span>
                <span className="text-[12px] font-bold">Ready to submit MPI</span>
                <span className="ml-auto rounded-full bg-emerald-500 px-2 py-0.5 font-mono text-[10px] font-bold">3 items • 2 RED</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button className="rounded-full bg-white py-2.5 text-[12px] font-bold text-zinc-900">Save draft</button>
                <button className="rounded-full bg-[#0F62FE] py-2.5 text-[12px] font-bold text-white">Send to advisor</button>
              </div>
              <span className="mt-2 block text-center font-mono text-[10px] tracking-wide text-zinc-400">Offline queue → syncs on reconnect • E1-T12 degraded tolerant</span>
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  )
}

// ──────────────────────────────────────────────
// Page — header + 3 phones grid
// ──────────────────────────────────────────────
export default function MobileApps() {
  const [globalOffline, setGlobalOffline] = useState(false)

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* page header — Tekion bar §6.9 */}
      <div className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto max-w-[1440px] px-5 py-4 md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-900 text-white">
                <DeviceMobile size={16} weight="fill" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-[17px] font-black tracking-tight">Mobile • Field-native</h1>
                  <span className="rounded-full border border-[#c6d6ff] bg-[#edf2ff] px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest text-[#0F62FE]">E14</span>
                  <span className="hidden items-center gap-1.5 rounded-full bg-zinc-900 px-2.5 py-1 font-mono text-[11px] font-bold tracking-wide text-white md:inline-flex">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    Tekion bar parity
                  </span>
                </div>
                <p className="max-w-[760px] text-[12px] leading-snug text-zinc-500">
                  Three roles who live away from desks — salesperson, service advisor, technician — Tekion UX bar “makes rest feel decades behind” <span className="font-mono text-[11px] text-zinc-400">§6.9</span> • zinc/cobalt • 390×844 • offline-tolerant.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-[11px] font-bold text-zinc-700 md:inline-flex">
                <ShieldCheck size={13} weight="fill" className="text-emerald-600" /> 99.95% • RPO 15m
              </span>
              <button
                onClick={() => setGlobalOffline((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-[12px] font-bold transition ${globalOffline ? "border-amber-300 bg-amber-500 text-black" : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"}`}
              >
                <WarningCircle size={14} weight={globalOffline ? "fill" : "regular"} />
                {globalOffline ? "Global offline demo" : "Global sync nominal"}
              </button>
            </div>
          </div>

          {globalOffline && (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 font-mono text-[11px] font-bold text-amber-900">
              <WarningCircle size={14} weight="fill" className="text-amber-600" />
              Degraded mode • E1-T12 • all queued mutations sync on reconnect • lender rates cached “verify at funding” • failover us-west-2
              <span className="ml-auto rounded-full bg-amber-500 px-2 py-0.5 text-white">queued 9 • 3 per device</span>
              <span className="rounded-full bg-white px-2 py-0.5 border border-amber-200">RTO 1h • RPO 15m</span>
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-1.5 font-mono text-[11px]">
            <span className="rounded-full bg-zinc-900 px-2.5 py-1 font-bold text-white">E14 Salesperson • Advisor • Tech</span>
            <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1">Parts counter • scan via camera §</span>
            <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1">Manager • dashboards + approvals</span>
            <span className="rounded-full border border-[#c6d6ff] bg-[#edf2ff] px-2.5 py-1 font-bold text-[#0F62FE]">Tekion UX bar — field-native</span>
          </div>
        </div>
      </div>

      {/* phones — 3 side-by-side desktop, stacked mobile */}
      <div className="mx-auto max-w-[1440px] px-5 py-6 md:px-6">
        <div className="grid grid-cols-1 gap-6 lg:gap-8 xl:grid-cols-3 justify-items-center">
          <SalespersonPhone />
          <AdvisorPhone />
          <TechnicianPhone />
        </div>

        {/* extra row — parts counter + manager teaser (SPEC E14) */}
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-0 shadow-sm">
            <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-3">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-zinc-900 text-white">
                <Barcode size={13} weight="bold" />
              </span>
              <span className="text-[12px] font-bold">Parts counter • lookup → quote → sell</span>
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-1 font-mono text-[10px] font-bold text-white">
                <Camera size={11} weight="fill" /> Bin scan via camera
              </span>
            </div>
            <div className="grid gap-3 p-4 md:grid-cols-[1.1fr_0.9fr]">
              <div>
                <div className="flex gap-2">
                  <span className="flex flex-1 items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 font-mono text-[12px]">
                    <MagnifyingGlass size={13} className="text-zinc-400" /> 04465-33150
                  </span>
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-zinc-900 text-white">
                    <Camera size={16} weight="fill" />
                  </span>
                </div>
                <div className="mt-2 rounded-xl bg-zinc-900 p-2.5 text-white">
                  <div className="font-mono text-[11px] tracking-widest text-zinc-400">MATRIX PRICE • LIVE</div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[18px] font-black">$112.20</span>
                    <span className="font-mono text-[11px] line-through text-zinc-400">$125.00 list</span>
                    <span className="ml-auto rounded-full bg-emerald-500 px-2 py-0.5 font-mono text-[10px] font-bold">+31% kept</span>
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  <button className="flex-1 rounded-full bg-[#0F62FE] py-2 text-[12px] font-bold text-white">Add to quote</button>
                  <button className="flex-1 rounded-full border border-zinc-300 bg-white py-2 text-[12px] font-bold">Sell • $112.20</button>
                </div>
              </div>
              <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-3">
                <div className="flex h-24 w-full items-center justify-center rounded-xl bg-white border border-zinc-200 overflow-hidden relative">
                  <span className="absolute inset-0 opacity-[0.08] bg-[repeating-linear-gradient(90deg,#000_0_2px,transparent_0_6px)]" />
                  <Barcode size={28} className="text-zinc-800" />
                  <span className="absolute bottom-1 left-2 right-2 text-center font-mono text-[10px] font-bold tracking-widest">A-12-04 • BEEP ✓</span>
                </div>
                <div className="mt-2 font-mono text-[11px] leading-snug text-zinc-600">Camera → bin label → partNo → matrix price auto-applied → counter in one tap. Offline queue intact.</div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-900 p-0 text-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.06] px-4 py-3">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-white text-zinc-900">
                <Users size={13} weight="fill" />
              </span>
              <span className="text-[12px] font-bold">Manager • dashboards & approvals</span>
              <span className="ml-auto rounded-full bg-white px-2 py-1 font-mono text-[10px] font-bold text-zinc-900">INTELLIGENCE</span>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-white/10 border border-white/10 py-2.5">
                  <div className="font-mono text-[10px] tracking-widest text-white/60">TODAY GP</div>
                  <div className="font-mono text-[16px] font-black">$22.4k</div>
                </div>
                <div className="rounded-xl bg-white/10 border border-white/10 py-2.5">
                  <div className="font-mono text-[10px] tracking-widest text-white/60">WAIT &lt;90M</div>
                  <div className="font-mono text-[16px] font-black text-emerald-300">94%</div>
                </div>
                <div className="rounded-xl bg-white text-zinc-900 py-2.5">
                  <div className="font-mono text-[10px] tracking-widest text-zinc-500">APPROVALS</div>
                  <div className="font-mono text-[16px] font-black">3</div>
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                {[
                  { what: "Discount 12% > policy • Priya Nair • $36,490", who: "S. Rivera" },
                  { what: "CIT over 7d • $48,200 • TITL Vitu pending", who: "Funding" },
                ].map((r) => (
                  <div key={r.what} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    <span className="flex-1 text-[11px] font-medium leading-snug">{r.what}</span>
                    <button className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-zinc-900">Approve</button>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-center font-mono text-[10px] tracking-wide text-white/50">All approvals work offline • queued • conflict-resolved on sync • audit-trail intact</div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-3 text-[11px] leading-relaxed text-zinc-500">
          <span className="font-bold text-zinc-900">Showcase: E14 Mobile — field-native • §6.9 Tekion bar</span>
          {" • "}Salesperson: lead queue, customer timeline, inventory card, desk starter → same F1 pencil — no re-key. Advisor: RO #1001 walk-around VIN scan, MPI video capture with Play + voice-input pre-fill, customer approve-by-tap + texting + payments. Technician: work list, flag clock In/Out, voice-to-inspection fields. Parts: bin scan via camera. Manager: dashboards + approvals. Offline banner “Offline • queued mutations 3 • sync on reconnect” per device — degraded-tolerant capture (E1-T12) • zinc/cobalt, no purple, 390×844, notch, home indicator.
        </div>
      </div>
    </div>
  )
}
