import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MagnifyingGlass,
  Barcode,
  Tag,
  TrendUp,
  Warning,
  CheckCircle,
  XCircle,
  ArrowRight,
  Lightning,
  Cube,
  Buildings,
  Receipt,
  FileText,
  ClipboardText,
  ArrowLineRight,
  Clock,
  Percent,
  CaretRight,
  Plus,
  Minus,
  ShoppingCart,
  CreditCard,
  Truck,
  ArrowsLeftRight,
  Sparkle,
  ShieldCheck,
  CurrencyDollar,
  Stack,
  Timer,
  Phone,
  Eye,
  Link as LinkIcon,
} from "@phosphor-icons/react"

// ──────────────────────────────────────────
// Matrix pricing engine — the hero
// ──────────────────────────────────────────
type MatrixRow = { range: string; costMin: number; costMax: number | null; markupPct: number; exampleCost: number; list: number; matrix: number }
const MATRIX: MatrixRow[] = [
  { range: "$0 – $10", costMin: 0, costMax: 10, markupPct: 180, exampleCost: 7.2, list: 18, matrix: 20.16 },
  { range: "$10.01 – $25", costMin: 10.01, costMax: 25, markupPct: 120, exampleCost: 18, list: 42, matrix: 39.6 },
  { range: "$25.01 – $50", costMin: 25.01, costMax: 50, markupPct: 85, exampleCost: 38, list: 89, matrix: 70.3 },
  { range: "$50.01 – $100", costMin: 50.01, costMax: 100, markupPct: 65, exampleCost: 68, list: 125, matrix: 112.2 },
  { range: "$100 – $250", costMin: 100, costMax: 250, markupPct: 45, exampleCost: 168, list: 289, matrix: 243.6 },
  { range: "$250+", costMin: 250, costMax: null, markupPct: 35, exampleCost: 312, list: 620, matrix: 421.2 },
]

type PriceLevel = "retail" | "wholesale" | "internal" | "bodyshop"

type Part = {
  id: string
  partNo: string
  desc: string
  category: string
  brand: string
  vinFit: string
  cost: number
  listPrice: number
  matrixPrice: number
  onHand: number
  onOrder: number
  bin: string
  image: string
  crossRef?: string
  superseded?: string
}

const PARTS: Part[] = [
  { id: "p1", partNo: "04465-33150", desc: "Brake Pad Set — Front (Ceramic)", category: "Brakes", brand: "Toyota Genuine", vinFit: "2020–24 Camry / 22–24 RAV4", cost: 68, listPrice: 125, matrixPrice: 219, onHand: 6, onOrder: 4, bin: "A-14-03", image: "https://picsum.photos/seed/brakepads/240/180", crossRef: "04465-AZ120", superseded: "04465-33140 → 33150" },
  { id: "p2", partNo: "90915-YZZF2", desc: "Oil Filter Element", category: "Filters", brand: "Toyota Genuine", vinFit: "All 2.5L Dynamic Force", cost: 4.2, listPrice: 12.5, matrixPrice: 11.76, onHand: 48, onOrder: 0, bin: "C-02-11", image: "https://picsum.photos/seed/oilfilter/240/180" },
  { id: "p3", partNo: "00272-SLLC2", desc: "Brake Fluid DOT4 — 12oz", category: "Fluids", brand: "Toyota", vinFit: "Universal", cost: 7.2, listPrice: 18, matrixPrice: 20.16, onHand: 22, onOrder: 0, bin: "F-01-04", image: "https://picsum.photos/seed/fluid/240/180" },
  { id: "p4", partNo: "28800-0V030", desc: "Battery — 24F 650CCA AGM", category: "Battery", brand: "TrueStart", vinFit: "2018+ Camry / Highlander", cost: 168, listPrice: 289, matrixPrice: 345, onHand: 3, onOrder: 6, bin: "B-09-01", image: "https://picsum.photos/seed/battery/240/180" },
  { id: "p5", partNo: "42110-33150", desc: "Shock Absorber — Rear RH", category: "Suspension", brand: "Toyota Genuine", vinFit: "2018–24 Camry", cost: 156, listPrice: 310, matrixPrice: 226.2, onHand: 0, onOrder: 8, bin: "S-03-07", image: "https://picsum.photos/seed/shock/240/180" },
  { id: "p6", partNo: "42611-0E040", desc: "Wheel — Alloy 18″ (Take-off)", category: "Wheels", brand: "Toyota", vinFit: "2021+ Highlander", cost: 285, listPrice: 520, matrixPrice: 384.75, onHand: 2, onOrder: 0, bin: "W-01-02", image: "https://picsum.photos/seed/wheel/240/180" },
]

const WHOLESALE_ACCOUNTS = [
  { name: "ACME Body Shop #441", terms: "Net 20", balance: 18420, limit: 50000, discount: "Wholesale -15% off matrix" },
  { name: "North Fulton Toyota (Transfer)", terms: "Due on receipt", balance: 0, limit: 0, discount: "Cross-rooftop at cost+" },
  { name: "QuickLane Wholesale", terms: "Net 10", balance: 4200, limit: 15000, discount: "Wholesale flat" },
]

type QuoteLine = { partId: string; qty: number; priceLevel: PriceLevel }

export default function PartsCounter() {
  const [vin, setVin] = useState("4T1G11AK2RU771842")
  const [q, setQ] = useState("")
  const [cat, setCat] = useState<string>("All")
  const [selectedPartId, setSelectedPartId] = useState<string>("p1")
  const [priceLevel, setPriceLevel] = useState<PriceLevel>("retail")
  const [qty, setQty] = useState(1)
  const [quoteLines, setQuoteLines] = useState<QuoteLine[]>([
    { partId: "p1", qty: 1, priceLevel: "retail" },
    { partId: "p3", qty: 1, priceLevel: "retail" },
  ])
  const [scanOpen, setScanOpen] = useState(false)
  const [scanValue, setScanValue] = useState("")
  const [invoiced, setInvoiced] = useState(false)
  const [poCreated, setPoCreated] = useState(false)

  const selectedPart = PARTS.find((p) => p.id === selectedPartId) ?? PARTS[0]

  const filtered = useMemo(() => {
    return PARTS.filter((p) => {
      if (cat !== "All" && p.category !== cat) return false
      if (q && !(p.partNo + p.desc + p.brand).toLowerCase().includes(q.toLowerCase())) return false
      return true
    })
  }, [q, cat])

  const priceFor = (part: Part, level: PriceLevel) => {
    const base = part.matrixPrice
    if (level === "retail") return base
    if (level === "wholesale") return Math.round(base * 0.82 * 100) / 100
    if (level === "internal") return Math.round(part.cost * 1.1 * 100) / 100
    if (level === "bodyshop") return Math.round(base * 0.88 * 100) / 100
    return base
  }

  const quoteTotals = useMemo(() => {
    let subtotal = 0
    let listTotal = 0
    for (const l of quoteLines) {
      const p = PARTS.find((x) => x.id === l.partId)!
      subtotal += priceFor(p, l.priceLevel) * l.qty
      listTotal += p.listPrice * l.qty
    }
    const tax = Math.round(subtotal * 0.07 * 100) / 100
    const uplift = subtotal - listTotal
    return { subtotal, listTotal, tax, total: subtotal + tax, uplift }
  }, [quoteLines])

  const addToQuote = () => {
    setQuoteLines((prev) => [...prev, { partId: selectedPartId, qty, priceLevel }])
  }

  const removeLine = (idx: number) => setQuoteLines((prev) => prev.filter((_, i) => i !== idx))

  // short-sale / backorder demo: p5 is 0 on hand but on order
  const shortSalePart = PARTS.find((p) => p.id === "p5")!

  return (
    <div className="min-h-screen bg-[#FCFCF9] text-zinc-900 selection:bg-amber-200">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Inter:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* Header — light industrial */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-[#FCFCF9]/85 border-b border-zinc-200">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-zinc-900 text-white grid place-items-center font-black text-[11px] tracking-tighter">AC</div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[17px] font-black tracking-tight">Parts Counter</h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 tracking-widest">FIXED OPS • HERO</span>
                <span className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-zinc-900 text-white text-xs font-bold px-2.5 py-1"><Percent className="h-3.5 w-3.5" /> Matrix pricing live</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-zinc-500">
                <span>E8 Catalog</span><span className="opacity-30">•</span><span>F7 Pricing Engine</span><span className="opacity-30">•</span><span>F16 Inventory & Transfers</span>
                <span className="ml-2 hidden lg:inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 text-amber-900 px-2 py-0.5 text-[11px] font-bold">Tekion failure → AutoCore profit</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-2 rounded-full bg-white border border-zinc-200 px-3 py-1.5 shadow-sm">
              <Buildings className="h-4 w-4 text-zinc-500" />
              <span className="text-xs font-bold">South Cobb Toyota</span>
              <span className="h-3 w-px bg-zinc-200" />
              <span className="text-xs font-medium text-zinc-500">3 rooftops visible</span>
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-zinc-900 text-white pl-1 pr-3 py-1">
              <img src="https://i.pravatar.cc/100?img=15" alt="" className="h-7 w-7 rounded-full object-cover" />
              <div className="leading-none">
                <div className="text-xs font-bold">M. Alvarez</div>
                <div className="text-[11px] text-zinc-400">Parts • Counter</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero — Matrix breakthrough */}
      <div className="max-w-[1440px] mx-auto px-6 pt-6">
        <div className="rounded-[24px] border border-amber-200 bg-gradient-to-br from-amber-400 via-amber-300 to-yellow-200 p-[1.5px] shadow-[0_12px_32px_rgba(0,0,0,0.08)]">
          <div className="rounded-[22px] bg-white overflow-hidden">
            <div className="grid grid-cols-12 gap-0">
              {/* Left copy */}
              <div className="col-span-12 lg:col-span-5 p-6 lg:p-7">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 text-white text-[11px] font-black tracking-widest px-3 py-1">
                  <Sparkle className="h-3.5 w-3.5 text-amber-400" weight="fill" /> WHY MATRIX WINS
                </div>
                <h2 className="text-[28px] lg:text-[30px] font-black leading-[0.95] tracking-tight mt-3">
                  List price <span className="text-zinc-400 line-through decoration-zinc-900 decoration-2">leaves money</span><br />
                  Matrix <span className="bg-amber-400 px-1">prints it.</span>
                </h2>
                <p className="text-sm leading-relaxed text-zinc-600 mt-3">
                  Tekion charges <span className="font-bold text-zinc-900">list (MSRP)</span> — a flat $125 for a $68-cost pad. AutoCore runs a <span className="font-bold text-zinc-900">cost-escalated matrix</span>: cheap parts get higher %, expensive parts stay competitive — every line recovers true margin.
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-2xl bg-zinc-900 text-white p-3">
                    <div className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase">List ticket</div>
                    <div className="text-xl font-black line-through decoration-2">$125.00</div>
                    <div className="text-[11px] text-zinc-400">Tekion • flat</div>
                  </div>
                  <div className="rounded-2xl bg-amber-400 text-black p-3 border-2 border-amber-500">
                    <div className="text-[11px] font-black tracking-widest uppercase">Matrix ticket</div>
                    <div className="text-xl font-black">$219.00</div>
                    <div className="text-[11px] font-bold">+75% • cost-driven</div>
                  </div>
                  <div className="rounded-2xl bg-emerald-500 text-white p-3">
                    <div className="text-[11px] font-bold tracking-widest uppercase text-emerald-100">Margin kept</div>
                    <div className="text-xl font-black">+$94</div>
                    <div className="text-[11px] font-bold text-emerald-100">on this one pad</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1"><ShieldCheck className="h-3.5 w-3.5" weight="bold" /> No more list leakage</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 text-white px-2.5 py-1"><CurrencyDollar className="h-3.5 w-3.5" /> Cost + matrix = fair & profitable</span>
                </div>
              </div>

              {/* Matrix table */}
              <div className="col-span-12 lg:col-span-7 bg-zinc-50 border-t lg:border-t-0 lg:border-l border-zinc-200">
                <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-zinc-900 text-white grid place-items-center"><Stack className="h-4 w-4" /></div>
                    <div>
                      <div className="text-sm font-black">Cost-Escalated Matrix</div>
                      <div className="text-xs text-zinc-500 font-medium">Edit anytime • applies to counter, wholesale, RO — same engine</div>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-amber-400 text-black text-xs font-black px-3 py-1"><Lightning className="h-3.5 w-3.5" weight="fill" /> ACTIVE</span>
                </div>

                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[11px] font-black tracking-widest text-zinc-500 uppercase bg-white border-b border-zinc-200">
                        <th className="text-left px-4 py-2.5 font-black">Cost range</th>
                        <th className="text-center px-2 py-2.5">Markup</th>
                        <th className="text-right px-2 py-2.5">Example cost</th>
                        <th className="text-right px-2 py-2.5">List (Tekion)</th>
                        <th className="text-right px-4 py-2.5">AutoCore Matrix</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {MATRIX.map((r) => {
                        const highlight = r.costMin === 50.01
                        return (
                          <tr key={r.range} className={`${highlight ? "bg-amber-50" : r.markupPct >= 85 ? "bg-white" : "bg-zinc-50/50"} ${highlight ? "ring-1 ring-amber-300" : ""}`}>
                            <td className="px-4 py-2.5 font-mono font-bold">{r.range}</td>
                            <td className="px-2 py-2.5 text-center">
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-black ${r.markupPct >= 120 ? "bg-zinc-900 text-white" : r.markupPct >= 65 ? "bg-amber-400 text-black" : "bg-white border border-zinc-200"}`}>
                                +{r.markupPct}%
                              </span>
                            </td>
                            <td className="px-2 py-2.5 text-right font-mono text-zinc-600">${r.exampleCost.toFixed(2)}</td>
                            <td className="px-2 py-2.5 text-right font-mono line-through decoration-zinc-400 text-zinc-500">${r.list.toFixed(2)}</td>
                            <td className="px-4 py-2.5 text-right">
                              <span className={`font-mono font-black px-2.5 py-1 rounded-full ${highlight ? "bg-zinc-900 text-white" : "bg-emerald-500 text-white"}`}>${r.matrix.toFixed(2)}</span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-3 bg-zinc-900 text-zinc-300 text-xs flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5"><TrendUp className="h-3.5 w-3.5 text-amber-400" /> Avg +$38/lines vs list — <span className="text-white font-bold">+31% GP</span> on today’s counter</span>
                  <span className="ml-auto hidden sm:inline-flex items-center gap-1 rounded-full bg-white text-black font-bold px-2.5 py-1">Source: cost × matrix • not guesswork</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search + Catalog + Detail bento */}
      <div className="max-w-[1440px] mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-4">

          {/* Catalog search */}
          <div className="col-span-12 rounded-[20px] border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 flex flex-wrap gap-3 items-center border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-zinc-900 text-white grid place-items-center"><MagnifyingGlass className="h-4 w-4" /></div>
                <div>
                  <div className="text-sm font-black">VIN-Driven Catalog</div>
                  <div className="text-xs text-zinc-500 font-medium">E8 • exact fit, no returns</div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-auto w-full lg:w-auto">
                <div className="relative flex-1 lg:w-[360px]">
                  <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search part #, description, brand…" className="w-full rounded-full bg-zinc-50 border border-zinc-200 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-zinc-900 focus:bg-white" />
                </div>
                <button onClick={() => setScanOpen((v) => !v)} className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2.5 text-sm font-bold transition ${scanOpen ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-200 hover:bg-zinc-50"}`}>
                  <Barcode className="h-4 w-4" weight="bold" /> Scan
                </button>
              </div>
            </div>

            <div className="px-5 py-3 bg-zinc-50 border-b border-zinc-200 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-widest text-zinc-500 uppercase">VIN</span>
                <div className="flex items-center gap-1.5 rounded-full bg-white border border-zinc-200 px-2.5 py-1">
                  <input value={vin} onChange={(e) => setVin(e.target.value)} className="w-[160px] sm:w-[210px] bg-transparent text-sm font-mono font-bold focus:outline-none" />
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 text-white text-[11px] font-black px-2 py-0.5"><CheckCircle className="h-3 w-3" weight="fill" /> Decoded</span>
                </div>
                <span className="hidden sm:inline text-xs font-medium text-zinc-600">2023 Camry SE 2.5L • Section: Brakes, Filters, Fluids</span>
              </div>
              <div className="ml-auto flex items-center gap-1.5 overflow-auto">
                {["All", "Brakes", "Filters", "Fluids", "Battery", "Suspension", "Wheels"].map((c) => (
                  <button key={c} onClick={() => setCat(c)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold border transition ${cat === c ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-200 hover:bg-zinc-50"}`}>{c}</button>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {scanOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-zinc-200 bg-zinc-900 text-white">
                  <div className="px-5 py-4 flex flex-col lg:flex-row gap-4 items-center">
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-2 text-sm font-bold"><Barcode className="h-4 w-4" /> Barcode scan mock — point camera at bin label or part</div>
                      <div className="mt-3 relative">
                        <div className="rounded-2xl bg-white text-zinc-900 p-3 flex gap-3">
                          <div className="h-24 w-36 rounded-xl bg-zinc-900 overflow-hidden relative grid place-items-center shrink-0">
                            <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(90deg,#fff_0_2px,transparent_0_6px)]" />
                            <motion.div animate={{ top: ["10%", "80%", "10%"] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute left-2 right-2 h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                            <Barcode className="h-8 w-8 text-white relative z-10" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-black tracking-widest text-zinc-500 uppercase">SCANNER INPUT</div>
                            <input value={scanValue} onChange={(e) => setScanValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && scanValue) { const hit = PARTS.find((p) => p.partNo.includes(scanValue)); if (hit) setSelectedPartId(hit.id); setScanValue(""); }}} placeholder="04465-33150  •  press Enter to lookup" className="mt-1 w-full rounded-full bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm font-mono focus:outline-none focus:border-zinc-900" />
                            <div className="mt-2 flex gap-1.5">
                              <button onClick={() => { const hit = PARTS.find((p) => p.partNo.includes(scanValue)) ?? PARTS[0]; setSelectedPartId(hit.id); }} className="rounded-full bg-zinc-900 text-white text-xs font-bold px-3 py-1.5">Lookup</button>
                              <button onClick={() => setScanValue("04465-33150")} className="rounded-full bg-white border border-zinc-200 text-xs font-bold px-3 py-1.5">Paste demo barcode</button>
                              <span className="ml-auto text-[11px] text-zinc-500 self-center">Bin A-14-03 • beep ✓</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="hidden lg:block h-24 w-px bg-white/10" />
                    <div className="text-xs leading-relaxed text-zinc-400 lg:max-w-[240px]">
                      <span className="text-white font-bold">AutoCore scan flow:</span> camera → partNo → VIN-fit verified → matrix price auto-applied → add to counter in one tap. No typing, no list-price slip.
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-12 gap-0">
              {/* Part grid */}
              <div className="col-span-12 lg:col-span-7 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filtered.map((p) => {
                    const isSel = p.id === selectedPartId
                    const margin = Math.round(((priceFor(p, "retail") - p.cost) / priceFor(p, "retail")) * 100)
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPartId(p.id)}
                        className={`text-left rounded-2xl border overflow-hidden transition group ${isSel ? "border-zinc-900 ring-2 ring-zinc-900 bg-white" : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-md"}`}
                      >
                        <div className="h-28 bg-zinc-50 overflow-hidden relative">
                          <img src={p.image} alt="" className="h-full w-full object-cover group-hover:scale-[1.02] transition duration-300" />
                          <span className="absolute left-2 top-2 rounded-full bg-white border border-zinc-200 text-[11px] font-bold px-2 py-0.5 shadow-sm">{p.category}</span>
                          {p.onHand === 0 && <span className="absolute right-2 top-2 rounded-full bg-amber-400 text-black text-[11px] font-black px-2 py-0.5">0 on hand • on order</span>}
                          {p.onHand > 0 && p.onHand <= 3 && <span className="absolute right-2 top-2 rounded-full bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5">Low • {p.onHand} left</span>}
                          <span className="absolute bottom-2 left-2 rounded-full bg-zinc-900 text-white text-[11px] font-mono font-bold px-2 py-0.5">{p.bin}</span>
                        </div>
                        <div className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="font-mono text-xs font-black">{p.partNo}</div>
                            <span className="text-[11px] font-bold text-zinc-500">{p.brand}</span>
                          </div>
                          <div className="text-sm font-bold leading-tight mt-1 line-clamp-2">{p.desc}</div>
                          <div className="text-[11px] text-zinc-500 mt-1">{p.vinFit}</div>

                          {/* Hero pricing row */}
                          <div className="mt-3 rounded-xl bg-zinc-900 text-white p-2.5 flex items-center justify-between">
                            <div>
                              <div className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">List (Tekion)</div>
                              <div className="text-sm font-mono line-through decoration-2 decoration-white/40 opacity-60">${p.listPrice.toFixed(2)}</div>
                            </div>
                            <ArrowRight className="h-3.5 w-3.5 text-zinc-500" />
                            <div className="text-right">
                              <div className="text-[10px] font-black tracking-widest text-amber-300 uppercase">AutoCore Matrix</div>
                              <div className="text-lg font-black leading-none">${priceFor(p, "retail").toFixed(2)}</div>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-[11px] font-mono bg-zinc-50 border border-zinc-200 px-2 py-1 rounded-full">Cost ${p.cost.toFixed(2)} • {margin}% margin</span>
                            <span className="text-[11px] font-bold text-emerald-600">+${(priceFor(p, "retail") - p.listPrice).toFixed(2)} vs list</span>
                          </div>
                          <div className="mt-2 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                            <div className="h-full bg-amber-400" style={{ width: `${margin}%` }} />
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Detail hero */}
              <div className="col-span-12 lg:col-span-5 border-t lg:border-t-0 lg:border-l border-zinc-200 bg-zinc-50 p-4 lg:sticky lg:top-[0px]">
                <div className="rounded-[20px] border border-zinc-200 bg-white overflow-hidden shadow-sm">
                  <div className="h-40 bg-zinc-50 overflow-hidden relative">
                    <img src={selectedPart.image} alt="" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <div>
                        <div className="inline-flex rounded-full bg-white text-zinc-900 text-xs font-mono font-black px-2.5 py-1 shadow">{selectedPart.partNo}</div>
                        <div className="text-white font-black text-sm leading-none mt-1.5 drop-shadow">{selectedPart.desc}</div>
                      </div>
                      <span className="rounded-full bg-emerald-500 text-white text-xs font-black px-2.5 py-1 shadow">In stock • {selectedPart.onHand}</span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Tag className="h-3.5 w-3.5 text-zinc-500" />
                      <span className="font-semibold">{selectedPart.brand}</span>
                      <span className="opacity-30">•</span>
                      <span className="text-zinc-500">{selectedPart.vinFit}</span>
                    </div>
                    {selectedPart.superseded && <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold px-2.5 py-1"><ArrowsLeftRight className="h-3 w-3" /> Supersession: {selectedPart.superseded}</div>}

                    {/* Price levels */}
                    <div className="mt-4">
                      <div className="text-[11px] font-black tracking-widest text-zinc-500 uppercase">Price levels — same matrix, different rule</div>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {(["retail", "wholesale", "internal", "bodyshop"] as PriceLevel[]).map((lvl) => {
                          const price = priceFor(selectedPart, lvl)
                          const isActive = priceLevel === lvl
                          const labels: Record<PriceLevel, string> = { retail: "Retail", wholesale: "Wholesale", internal: "Internal", bodyshop: "Body shop RO" }
                          const subs: Record<PriceLevel, string> = { retail: "Matrix", wholesale: "Matrix -18%", internal: "Cost +10%", bodyshop: "Matrix -12%" }
                          return (
                            <button key={lvl} onClick={() => setPriceLevel(lvl)} className={`rounded-2xl border p-3 text-left transition ${isActive ? "bg-zinc-900 text-white border-zinc-900 shadow" : "bg-white border-zinc-200 hover:border-zinc-300"}`}>
                              <div className={`text-[11px] font-bold tracking-widest uppercase ${isActive ? "text-zinc-400" : "text-zinc-500"}`}>{labels[lvl]}</div>
                              <div className="text-lg font-black leading-none mt-1">${price.toFixed(2)}</div>
                              <div className={`text-[11px] font-medium ${isActive ? "text-zinc-400" : "text-zinc-500"}`}>{subs[lvl]}</div>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Matrix calc breakout — hero */}
                    <div className="mt-4 rounded-2xl bg-amber-400 p-3.5 border-2 border-amber-500">
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        <span className="text-xs font-black tracking-widest uppercase">Matrix math — transparent</span>
                        <span className="ml-auto text-[11px] font-bold bg-zinc-900 text-white px-2 py-0.5 rounded-full">Cost ${selectedPart.cost.toFixed(2)}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-sm font-mono">
                        <span className="rounded-full bg-white px-2.5 py-1 font-bold">${selectedPart.cost.toFixed(2)}</span>
                        <span className="font-black">×</span>
                        <span className="rounded-full bg-zinc-900 text-white px-2.5 py-1 font-black">+{MATRIX.find((r) => selectedPart.cost >= r.costMin && (r.costMax === null || selectedPart.cost <= r.costMax))?.markupPct}%</span>
                        <span className="font-black">=</span>
                        <span className="rounded-full bg-white px-2.5 py-1 font-black">${priceFor(selectedPart, "retail").toFixed(2)}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="font-medium">List (Tekion) would be <span className="line-through">${selectedPart.listPrice.toFixed(2)}</span> — you keep <span className="font-black">+${(priceFor(selectedPart, "retail") - selectedPart.listPrice).toFixed(2)}</span></span>
                        <span className="hidden sm:inline font-mono bg-white px-2 py-0.5 rounded-full font-bold">{Math.round(((priceFor(selectedPart, "retail") - selectedPart.cost) / priceFor(selectedPart, "retail")) * 100)}% margin</span>
                      </div>
                    </div>

                    {/* Qty + add */}
                    <div className="mt-4 flex items-center gap-2">
                      <div className="flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 p-1">
                        <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-8 w-8 rounded-full bg-white border border-zinc-200 grid place-items-center hover:bg-zinc-50"><Minus className="h-3.5 w-3.5" /></button>
                        <span className="w-10 text-center font-mono font-black">{qty}</span>
                        <button onClick={() => setQty((q) => q + 1)} className="h-8 w-8 rounded-full bg-zinc-900 text-white grid place-items-center hover:bg-black"><Plus className="h-3.5 w-3.5" weight="bold" /></button>
                      </div>
                      <button onClick={addToQuote} className="flex-1 rounded-full bg-zinc-900 text-white font-black py-3 flex items-center justify-center gap-1.5 hover:bg-black transition">
                        <ShoppingCart className="h-4 w-4" weight="bold" /> Add to quote — ${priceFor(selectedPart, priceLevel).toFixed(2)}
                      </button>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
                      <div className="rounded-xl bg-zinc-50 border border-zinc-200 py-2">
                        <div className="font-mono font-black">{selectedPart.onHand}</div>
                        <div className="text-zinc-500 font-medium">On hand</div>
                      </div>
                      <div className="rounded-xl bg-zinc-50 border border-zinc-200 py-2">
                        <div className="font-mono font-black">{selectedPart.onOrder}</div>
                        <div className="text-zinc-500 font-medium">On order</div>
                      </div>
                      <div className="rounded-xl bg-zinc-900 text-white py-2">
                        <div className="font-mono font-black">{selectedPart.bin}</div>
                        <div className="text-zinc-400 font-medium">Bin</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl bg-zinc-900 text-white p-3 flex items-center gap-2 text-xs">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" weight="fill" />
                  <span className="font-medium"><span className="font-black">Tekion vs AutoCore:</span> Tekion hides cost → counter guesses. AutoCore shows cost, matrix, margin live.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Counter sale + Stock order + Backorder integrity */}
          <div className="col-span-12 lg:col-span-7 rounded-[20px] border border-zinc-200 bg-white shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-zinc-900 text-white grid place-items-center"><Receipt className="h-4 w-4" weight="bold" /></div>
                <div>
                  <div className="text-sm font-black">Counter Sale • Quote → Invoice</div>
                  <div className="text-xs text-zinc-500 font-medium">Matrix price locked at quote • no re-price on invoice</div>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ${invoiced ? "bg-emerald-500 text-white" : "bg-amber-400 text-black"}`}>{invoiced ? <><CheckCircle className="h-3.5 w-3.5" weight="fill" /> Invoiced</> : <><ClipboardText className="h-3.5 w-3.5" /> Quote</>}</span>
            </div>

            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-black tracking-widest text-zinc-500 uppercase">
                  <tr>
                    <th className="text-left px-4 py-2">Part</th>
                    <th className="text-center px-2 py-2">Lvl</th>
                    <th className="text-center px-2 py-2">Qty</th>
                    <th className="text-right px-2 py-2">List</th>
                    <th className="text-right px-2 py-2">Matrix</th>
                    <th className="text-right px-4 py-2">Ext</th>
                    <th className="px-2 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {quoteLines.map((l, idx) => {
                    const p = PARTS.find((x) => x.id === l.partId)!
                    return (
                      <tr key={idx} className="hover:bg-zinc-50/70">
                        <td className="px-4 py-3">
                          <div className="font-mono text-xs font-black">{p.partNo}</div>
                          <div className="text-xs font-semibold leading-none">{p.desc}</div>
                          <div className="text-[11px] text-zinc-500">{p.brand} • {p.bin}</div>
                        </td>
                        <td className="px-2 py-3 text-center"><span className="inline-flex rounded-full bg-zinc-900 text-white text-[11px] font-bold px-2 py-0.5 capitalize">{l.priceLevel}</span></td>
                        <td className="px-2 py-3 text-center font-mono font-bold">{l.qty}</td>
                        <td className="px-2 py-3 text-right font-mono line-through text-zinc-400">${p.listPrice.toFixed(2)}</td>
                        <td className="px-2 py-3 text-right"><span className="font-mono font-black bg-amber-400 px-2 py-0.5 rounded-full">${priceFor(p, l.priceLevel).toFixed(2)}</span></td>
                        <td className="px-4 py-3 text-right font-mono font-black">${(priceFor(p, l.priceLevel) * l.qty).toFixed(2)}</td>
                        <td className="px-2 py-3"><button onClick={() => removeLine(idx)} className="h-7 w-7 rounded-full bg-white border border-zinc-200 grid place-items-center hover:bg-zinc-50"><XCircle className="h-4 w-4 text-zinc-400" /></button></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-auto p-4 bg-zinc-50 border-t border-zinc-200">
              <div className="rounded-2xl bg-white border border-zinc-200 p-4">
                <div className="flex justify-between text-sm"><span className="text-zinc-500 font-medium">List total (what Tekion would charge)</span><span className="font-mono line-through text-zinc-400">${quoteTotals.listTotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm mt-1"><span className="text-zinc-500 font-medium">Matrix subtotal</span><span className="font-mono font-bold">${quoteTotals.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm mt-1"><span className="text-emerald-700 font-bold">Uplift vs list</span><span className="font-mono font-black text-emerald-600">+${quoteTotals.uplift.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm mt-1"><span className="text-zinc-500">Tax 7%</span><span className="font-mono">${quoteTotals.tax.toFixed(2)}</span></div>
                <div className="h-px bg-zinc-200 my-3" />
                <div className="flex justify-between text-base"><span className="font-black">Total due</span><span className="font-mono font-black text-lg">${quoteTotals.total.toFixed(2)}</span></div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button onClick={() => setInvoiced(false)} className={`rounded-full font-bold py-2.5 text-sm border ${!invoiced ? "bg-white border-zinc-900 text-zinc-900" : "bg-white border-zinc-200 text-zinc-500"}`}>Save Quote</button>
                  <button onClick={() => setInvoiced(true)} className={`rounded-full font-black py-2.5 text-sm flex items-center justify-center gap-1.5 ${invoiced ? "bg-emerald-500 text-white" : "bg-zinc-900 text-white hover:bg-black"}`}>
                    {invoiced ? <><CheckCircle className="h-4 w-4" weight="fill" /> Invoiced • #SI-88412</> : <><ArrowLineRight className="h-4 w-4" weight="bold" /> Convert to Invoice</>}
                  </button>
                </div>
                <div className="mt-2 text-center text-[11px] text-zinc-500 font-medium">Invoice posts to AR instantly • inventory relieved • no double-count on backorder</div>
              </div>
            </div>
          </div>

          {/* Short-sale / backorder integrity + Stock order */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
            <div className="rounded-[20px] border border-amber-200 bg-amber-50 overflow-hidden">
              <div className="px-5 py-4 border-b border-amber-200 bg-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-amber-400 text-black grid place-items-center"><Warning className="h-4 w-4" weight="bold" /></div>
                  <div>
                    <div className="text-sm font-black">Short-Sale / Backorder Integrity</div>
                    <div className="text-xs text-zinc-500 font-medium">Preserve sale • allocate on receipt • no double-count</div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900 text-white text-[11px] font-black px-2.5 py-1">F16</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="rounded-2xl bg-white border border-amber-200 p-4">
                  <div className="flex gap-3">
                    <img src={shortSalePart.image} alt="" className="h-14 w-14 rounded-xl object-cover border border-zinc-200 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-xs font-black">{shortSalePart.partNo} • {shortSalePart.desc}</div>
                      <div className="text-xs text-zinc-600 mt-1">RO 88331 requests 2 • On hand 0 • On order 8 (ETA 2d)</div>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 text-black text-xs font-black px-2.5 py-1"><Clock className="h-3 w-3" weight="bold" /> Short-sale created</span>
                        <span className="text-[11px] font-mono bg-zinc-900 text-white px-2 py-0.5 rounded-full">Qty 2 reserved</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-zinc-900 text-white p-2.5">
                      <div className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Available</div>
                      <div className="text-sm font-black">0</div>
                      <div className="text-[11px] text-zinc-400">Not oversold</div>
                    </div>
                    <div className="rounded-xl bg-amber-400 text-black p-2.5 border-2 border-amber-500">
                      <div className="text-[10px] font-black tracking-widest uppercase">Committed</div>
                      <div className="text-sm font-black">2</div>
                      <div className="text-[11px] font-bold">Preserved ↑</div>
                    </div>
                    <div className="rounded-xl bg-white border border-zinc-200 p-2.5">
                      <div className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">On order</div>
                      <div className="text-sm font-black">8</div>
                      <div className="text-[11px] text-zinc-500">Due Fri</div>
                    </div>
                  </div>
                  <div className="mt-3 rounded-xl bg-zinc-900 text-white p-3 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-500 grid place-items-center shrink-0"><Truck className="h-4 w-4" weight="bold" /></div>
                    <div className="text-xs leading-relaxed">
                      <span className="font-black">On receipt:</span> 2 auto-allocated to RO 88331 • remaining 6 to stock • sale stays intact — no double-count, no lost RO.
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2 text-[11px] font-bold">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1"><CheckCircle className="h-3 w-3" weight="fill" /> Tekion bug fixed</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white border border-zinc-200 px-2.5 py-1"><ShieldCheck className="h-3 w-3" /> Allocation audit logged</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stock order widget — working day-one */}
            <div className="rounded-[20px] border border-zinc-200 bg-white shadow-sm overflow-hidden flex-1">
              <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-zinc-900 text-white grid place-items-center"><Cube className="h-4 w-4" weight="bold" /></div>
                  <div>
                    <div className="text-sm font-black">Stock Order — Working Day-One</div>
                    <div className="text-xs text-zinc-500 font-medium">No 3-week setup • min/max + demand live</div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 text-white text-xs font-black px-2.5 py-1"><Timer className="h-3.5 w-3.5" /> Auto</span>
              </div>
              <div className="divide-y divide-zinc-100">
                {[
                  { part: PARTS[0], min: 4, max: 8, onHand: 6, suggested: 2 },
                  { part: PARTS[3], min: 4, max: 6, onHand: 3, suggested: 3 },
                  { part: PARTS[4], min: 2, max: 4, onHand: 0, suggested: 4 },
                ].map((r) => (
                  <div key={r.part.id} className="px-4 py-3 flex items-center gap-3">
                    <img src={r.part.image} alt="" className="h-10 w-10 rounded-lg object-cover border border-zinc-200" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-mono font-black">{r.part.partNo}</div>
                      <div className="text-xs font-semibold truncate">{r.part.desc}</div>
                      <div className="text-[11px] text-zinc-500">Min {r.min} • Max {r.max} • On hand {r.onHand}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black">+{r.suggested}</div>
                      <div className="text-[11px] text-zinc-500">to order</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-zinc-50 border-t border-zinc-200">
                <button onClick={() => setPoCreated((v) => !v)} className={`w-full rounded-full font-black py-3 flex items-center justify-center gap-1.5 transition ${poCreated ? "bg-emerald-500 text-white" : "bg-zinc-900 text-white hover:bg-black"}`}>
                  {poCreated ? <><CheckCircle className="h-4 w-4" weight="fill" /> PO-7712 created • sent to PDC</> : <><FileText className="h-4 w-4" /> Generate stock PO • 9 lines • $1,842</>}
                </button>
                <div className="mt-2 text-center text-[11px] text-zinc-500 font-medium">Phase-one in 2010? This widget was already filling bins while others configured.</div>
              </div>
            </div>
          </div>

          {/* Wholesale + Cross-rooftop */}
          <div className="col-span-12 grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-7 rounded-[20px] border border-zinc-200 bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-violet-600 text-white grid place-items-center"><Buildings className="h-4 w-4" weight="bold" /></div>
                  <div>
                    <div className="text-sm font-black">Wholesale Account • Quote → Invoice → Statement</div>
                    <div className="text-xs text-zinc-500 font-medium">Matrix wholesale level • AR aging • monthly statement</div>
                  </div>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-zinc-900 text-white text-xs font-bold px-2.5 py-1">Net 20</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="rounded-2xl border border-zinc-200 overflow-hidden">
                  <div className="px-4 py-3 bg-zinc-900 text-white flex items-center justify-between">
                    <div>
                      <div className="text-sm font-black">{WHOLESALE_ACCOUNTS[0].name}</div>
                      <div className="text-xs text-zinc-400">{WHOLESALE_ACCOUNTS[0].discount} • {WHOLESALE_ACCOUNTS[0].terms}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] tracking-widest font-bold text-zinc-400 uppercase">Balance</div>
                      <div className="text-lg font-mono font-black">${WHOLESALE_ACCOUNTS[0].balance.toLocaleString()}</div>
                      <div className="text-[11px] text-zinc-400">Limit $50k • 36% used</div>
                    </div>
                  </div>
                  <div className="divide-y divide-zinc-100">
                    {[
                      { inv: "WS-4421", date: "Today", total: 892, status: "Quote" },
                      { inv: "WS-4419", date: "Aug 24", total: 1240, status: "Invoiced" },
                      { inv: "WS-4412", date: "Aug 18", total: 2100, status: "Paid" },
                    ].map((row) => (
                      <div key={row.inv} className="px-4 py-3 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-zinc-50 border border-zinc-200 grid place-items-center"><Receipt className="h-4 w-4 text-zinc-600" /></div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-mono font-black">{row.inv} <span className="text-zinc-400 font-normal">• {row.date}</span></div>
                          <div className="text-xs text-zinc-500">ACME Body • 6 lines • Matrix wholesale</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-black">${row.total.toFixed(2)}</div>
                          <span className={`inline-flex text-[11px] font-bold px-2 py-0.5 rounded-full ${row.status === "Quote" ? "bg-amber-400 text-black" : row.status === "Invoiced" ? "bg-zinc-900 text-white" : "bg-emerald-500 text-white"}`}>{row.status}</span>
                        </div>
                        <CaretRight className="h-4 w-4 text-zinc-400" />
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-3 bg-zinc-50 border-t border-zinc-200 flex items-center gap-2">
                    <button className="flex-1 rounded-full bg-white border border-zinc-200 font-bold py-2 text-sm">View statement</button>
                    <button className="flex-1 rounded-full bg-zinc-900 text-white font-bold py-2 text-sm flex items-center justify-center gap-1"><CreditCard className="h-4 w-4" /> Pay now • ACH</button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                  <Phone className="h-3.5 w-3.5" /> Wholesale price is matrix-derived — no manual discount sheet.
                  <span className="ml-auto hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 font-bold"><CheckCircle className="h-3 w-3" weight="fill" /> Statement auto-emails 1st of month</span>
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-5 rounded-[20px] border border-zinc-200 bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-200">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-sky-500 text-white grid place-items-center"><ArrowsLeftRight className="h-4 w-4" weight="bold" /></div>
                  <div>
                    <div className="text-sm font-black">Cross-Rooftop Visibility</div>
                    <div className="text-xs text-zinc-500 font-medium">See all stores • transfer in one tap • no phone tag</div>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="rounded-2xl bg-zinc-900 text-white p-4">
                  <div className="text-xs font-black tracking-widest text-zinc-400 uppercase">Selected part availability</div>
                  <div className="text-sm font-mono font-black mt-1">{selectedPart.partNo} • {selectedPart.desc}</div>
                  <div className="mt-3 space-y-2">
                    {[
                      { store: "South Cobb (you)", qty: selectedPart.onHand, eta: "Now • Bin " + selectedPart.bin, color: "bg-emerald-500" },
                      { store: "North Fulton Toyota", qty: 4, eta: "Transfer 1h • driver en route", color: "bg-sky-500" },
                      { store: "Marietta Toyota", qty: 0, eta: "0 • On order 6", color: "bg-zinc-700" },
                      { store: "PDC Atlanta", qty: 22, eta: "Stock order tomorrow 8am", color: "bg-amber-400 text-black" },
                    ].map((s) => (
                      <div key={s.store} className="flex items-center gap-3 rounded-xl bg-white/10 border border-white/10 px-3 py-2.5">
                        <span className={`h-2 w-2 rounded-full ${s.color}`} />
                        <span className="text-sm font-semibold flex-1">{s.store}</span>
                        <span className="text-sm font-mono font-black">{s.qty}</span>
                        <span className="hidden sm:inline text-xs text-zinc-400">{s.eta}</span>
                      </div>
                    ))}
                  </div>
                  <button className="mt-3 w-full rounded-full bg-white text-zinc-900 font-black py-2.5 flex items-center justify-center gap-1.5">
                    <Truck className="h-4 w-4" /> Request transfer • North Fulton → you (1h)
                  </button>
                </div>

                <div className="rounded-2xl border border-zinc-200 p-4">
                  <div className="flex items-center gap-2 text-sm font-black"><Eye className="h-4 w-4" /> What the counter sees — live</div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-xl bg-zinc-50 border border-zinc-200 py-2">
                      <div className="font-mono font-black text-sm">3</div>
                      <div className="text-zinc-500 font-medium">Rooftops</div>
                    </div>
                    <div className="rounded-xl bg-zinc-900 text-white py-2">
                      <div className="font-mono font-black text-sm">10</div>
                      <div className="text-zinc-400 font-medium">Total on hand</div>
                    </div>
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 py-2">
                      <div className="font-mono font-black text-sm text-emerald-700">1h</div>
                      <div className="text-emerald-700 font-medium">Transfer</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-zinc-500"><LinkIcon className="h-3 w-3" /> No more “let me call the other store” — promise the customer now.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-medium text-zinc-500">
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900 text-white font-bold px-2.5 py-1">E8 Catalog + VIN</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2.5 py-1">F7 Matrix pricing</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2.5 py-1">F16 Transfers & backorder</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 text-black font-black px-2.5 py-1">Hero: cost × matrix, not list</span>
          <span className="ml-auto hidden sm:inline">AutoCore ERP • Parts Counter Demo • Tailwind + Motion + Phosphor • bento</span>
        </div>
      </div>
    </div>
  )
}
