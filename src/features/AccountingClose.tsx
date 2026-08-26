import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  CheckCircle, Clock, WarningCircle, ArrowsClockwise, CurrencyDollar, FileText, SealCheck,
  Bank, Receipt, ArrowRight, TrendUp, ClipboardText, Buildings, CaretRight, X, MagnifyingGlass, Info
} from "@phosphor-icons/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"

const BASE_CHECKLIST = [
  { id:1, k:"Deals journal posted", owner:"System", note:"Real-time • 12 deals MTD" },
  { id:2, k:"ROs & parts POST to GL", owner:"System", note:"6 ROs • $18.4k" },
  { id:3, k:"Floorplan schedule reconciling", owner:"M. Rivera", note:"2 overdue • curtailment due" },
  { id:4, k:"CIT schedule — 7 deals funding", owner:"D. Alvarez", note:"$142k CIT • 2 conditioned" },
  { id:5, k:"Warranty AR — claims submitted", owner:"P. Singh", note:"4 paid, 1 pending" },
  { id:6, k:"AP/AR cash receipts matched", owner:"L. Chen", note:"Auto-reconcile 94%" },
  { id:7, k:"JE approvals — period Tier 2", owner:"D. Alvarez", note:"3 JEs await sign-off" },
  { id:8, k:"Payroll — flag + commission", owner:"System", note:"18 techs • $41k flag" },
  { id:9, k:"OEM statements — Toyota/Ford", owner:"D. Alvarez", note:"Draft • format OK" },
  { id:10, k:"Intercompany eliminations", owner:"System", note:"Vehicle/parts transfers auto" },
  { id:11, k:"Consolidated group composite", owner:"D. Alvarez", note:"Rollup 3 rooftops" },
  { id:12, k:"Period lock — May 2026", owner:"D. Alvarez", note:"After checklist 100%" },
]
const JES = [
  { id:"JE-20441", t:"CIT setup — D-1041 F-150 $48,200", by:"System • delivery 09:41", amt:"$48,200 Dr CIT / Cr Sales", status:"posted" },
  { id:"JE-20442", t:"Funding — D-1041 lender Wells", by:"System • fund 14:22", amt:"$46,800 Dr Cash / Cr CIT", status:"posted" },
  { id:"JE-20443", t:"Floorplan payoff — VIN 1FT...", by:"M. Rivera • manual", amt:"$38,200 Dr Floorplan / Cr Cash", status:"pending" },
]
const fmt = (n:number)=> new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n)
export default function AccountingClose(){
  const vehicles = useStore(s=> s.vehicles)
  const deals = useStore(s=> s.deals)
  const repairOrders = useStore(s=> s.repairOrders)
  const parts = useStore(s=> s.parts)
  const incentiveClaims = useStore(s=> s.incentiveClaims)
  const reconcileIncentiveClaim = useStore(s=> s.reconcileIncentiveClaim)
  const submitIncentiveClaim = useStore(s=> s.submitIncentiveClaim)
  const getGroupConsolidation = useStore(s=> s.getGroupConsolidation)
  const groupMeta = useStore(s=> s.groupMeta)
  const [active, setActive] = useState<number>(3)
  const [showConsolidated, setShowConsolidated] = useState(false)
  const [drillOpen, setDrillOpen] = useState(false)
  const [oemTab, setOemTab] = useState<"toyota"|"ford"|"honda">("toyota")
  const liveCit = deals.filter(d=> d.funding.status==="submitted").length
  const liveFunded = deals.filter(d=> d.funding.status==="funded" || d.glPosted).length
  const unsold = useMemo(()=> vehicles.filter(v=> v.status!=="sold"),[vehicles])
  const avgFloorplan = useMemo(()=>{
    const withAmt = vehicles.filter(v=> (v as unknown as {floorplanAmount?:number}).floorplanAmount)
    if(!withAmt.length) return 34800
    const sum = withAmt.reduce((s,v)=> s+ ((v as unknown as {floorplanAmount:number}).floorplanAmount||0),0)
    return Math.round(sum/withAmt.length)
  },[vehicles])
  const floorplanTotal = useMemo(()=> unsold.reduce((s,v)=> s+ ((v as unknown as {floorplanAmount?:number}).floorplanAmount ?? avgFloorplan),0),[unsold,avgFloorplan])
  const floorplanWarn = useMemo(()=> unsold.filter(v=> v.agingDays>45).length,[unsold])
  const floorplanExcNote = floorplanWarn>0 ? `${floorplanWarn} overdue curtailment • ${unsold.length} units` : `Reconciled • ${unsold.length} units`
  const citDeals = useMemo(()=> deals.filter(d=> d.funding.status==="submitted"),[deals])
  const citTotal = useMemo(()=> citDeals.reduce((s,d)=> s+ (d.funding.cit??0),0),[citDeals])
  const citWarn = citDeals.length>0 ? Math.min(2,citDeals.length) : 0
  const citNote = citDeals.length ? `CIT aging 4.2d avg • ${citDeals.length} open` : "All funded • CIT $0"
  const warrantyROs = useMemo(()=> repairOrders.filter(r=> r.type==="warranty"),[repairOrders])
  const warrantyTotal = useMemo(()=>{
    const sum = warrantyROs.reduce((s,r)=> s+ (r.total? r.total: 0),0)
    if(sum>0) return sum
    return warrantyROs.length * 5680
  },[warrantyROs])
  const warrantyWarn = useMemo(()=> warrantyROs.filter(r=> r.status!=="invoiced" && r.status!=="completed").length,[warrantyROs])
  const warrantyNote = warrantyROs.length ? `${warrantyROs.length} claims • ${warrantyWarn} pending OEM` : "No open warranty"
  const partsTotal = useMemo(()=> parts.reduce((s,p)=> s+ p.onHand * p.cost,0),[parts])
  const partsWarn = useMemo(()=> parts.filter(p=> p.onHand < p.minStock).length,[parts])
  const liveSchedules = useMemo(()=>[
    { name:"Floorplan", total: fmt(floorplanTotal), items: unsold.length, warn: floorplanWarn, note: floorplanExcNote, color: floorplanWarn>0?"amber":"emerald" as const, pct: floorplanWarn>0?78:96 },
    { name:"Contracts in Transit", total: fmt(citTotal || 142850), items: citDeals.length || 7, warn: citWarn, note: citNote, color: citWarn>0?"amber":"emerald" as const, pct: citWarn>0?62:96 },
    { name:"Warranty Receivable", total: fmt(warrantyTotal || 28400), items: warrantyROs.length || 5, warn: warrantyWarn, note: warrantyNote, color: warrantyWarn>0?"amber":"emerald" as const, pct: warrantyWarn>0?74:96 },
    { name:"Parts Inventory", total: fmt(partsTotal || 410200), items: parts.length, warn: partsWarn, note: partsWarn? `${partsWarn} below min • self-reconciling daily` : "Self-reconciling daily", color: partsWarn>0?"amber":"emerald" as const, pct: partsWarn?84:96 },
  ],[floorplanTotal,unsold.length,floorplanWarn,floorplanExcNote,citTotal,citDeals.length,citWarn,citNote,warrantyTotal,warrantyROs.length,warrantyWarn,warrantyNote,partsTotal,parts.length,partsWarn])
  const checklist = useMemo(()=>{
    return BASE_CHECKLIST.map(c=>{
      let status: "done"|"warn"|"progress"|"todo" = "todo"
      let note = c.note
      if(c.id===1){
        const hasDeals = deals.length>0
        status = hasDeals ? "done" : "todo"
        note = hasDeals ? `Real-time • ${deals.length} deals MTD • journal auto-posted <60s` : "No deals yet"
      } else if(c.id===2){
        const hasRO = repairOrders.length>0
        status = hasRO ? "done" : "todo"
        note = `${repairOrders.length} ROs • ${fmt(partsTotal)} parts inv • GL posted`
      } else if(c.id===3){
        if(floorplanWarn>0) { status="warn"; note=`${floorplanWarn} overdue • curtailment due • ${unsold.length} units • ${fmt(floorplanTotal)}` }
        else { status= unsold.length>0? "done":"todo"; note=`Reconciled • ${unsold.length} units • ${fmt(floorplanTotal)}` }
      } else if(c.id===4){
        if(citDeals.length>0){ status="warn"; note=`${fmt(citTotal)} CIT • ${citDeals.length} funding • 2 conditioned` }
        else { status="done"; note="CIT cleared • 0 open" }
      } else if(c.id===5){
        if(warrantyWarn>0){ status="warn"; note=`${warrantyROs.length} claims • ${warrantyWarn} pending OEM • ${fmt(warrantyTotal)}` }
        else { status= warrantyROs.length>0? "done":"progress"; note= warrantyROs.length? `${warrantyROs.length} paid • ${fmt(warrantyTotal)}` : "No warranty AR" }
      } else if(c.id===6){
        status="progress"; note="Auto-reconcile 94% • cash matched daily"
      } else if(c.id===7){
        status="todo"; note="3 JEs await sign-off • Tier 2"
      } else if(c.id===8){
        status="done"; note="18 techs • $41k flag • native payroll"
      } else if(c.id===9){
        status="progress"; note=`Draft • ${oemTab.toUpperCase()} format OK • per-store`
      } else if(c.id===10){
        const tCount = (vehicles as unknown as {transferHistory?:unknown[]}[]).reduce((a,v)=> a+ (((v as unknown as {transferHistory?:unknown[]}).transferHistory?.length)||0),0)
        status = "done"
        note = tCount>0? `Vehicle/parts transfers auto • ${tCount} eliminations` : "Vehicle/parts transfers auto"
      } else if(c.id===11){
        status= showConsolidated? "done":"progress"; note= showConsolidated? "Rollup built • 3 rooftops • eliminations applied" : "Rollup 3 rooftops • click Generate"
      } else if(c.id===12){
        status="todo"; note="After checklist 100% • progressive lock per store"
      }
      return { ...c, status, note }
    })
  },[deals.length, repairOrders.length, partsTotal, floorplanWarn, unsold.length, floorplanTotal, citDeals, citTotal, warrantyWarn, warrantyROs.length, warrantyTotal, oemTab, vehicles, showConsolidated])
  const done = checklist.filter(c=>c.status==="done").length
  const pct = Math.round(done / checklist.length * 100)
  const consolidation = useMemo(()=> getGroupConsolidation(),[getGroupConsolidation, vehicles, deals, repairOrders, parts, showConsolidated])
  const transferList = consolidation.transferDetails
  const incentiveSummary = useMemo(()=>{
    const submitted = incentiveClaims.filter(c=> c.status==="submitted").length
    const paid = incentiveClaims.filter(c=> c.status==="paid").length
    const mismatch = incentiveClaims.filter(c=> c.status==="mismatch").length
    const stacking = incentiveClaims.filter(c=> c.stackingConflict).length
    return { submitted, paid, mismatch, stacking, total: incentiveClaims.length }
  },[incentiveClaims])
  return (
    <div className="mx-auto max-w-[1440px] space-y-4 p-4 lg:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-[22px] font-[700] tracking-[-0.03em]">GL &amp; Close</h1><Badge variant="success" className="gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" /> LIVE POSTING</Badge><span className="hidden md:inline rounded-full bg-zinc-900 px-2 py-0.5 font-mono text-[10px] font-semibold text-white">E2 • Real-time • F8</span></div>
          <p className="mt-1 text-[12.5px] text-[var(--text-muted)]">Controller-grade close — continuous schedules, real-time posting, consolidated group. Reynolds-grade without the batch.</p>
        </div>
        <div className="flex items-center gap-2"><span className="rounded-full border border-[var(--border)] bg-white px-2.5 py-1 font-mono text-[11px]">Group: Sovereign • 3 stores</span><Badge variant="warning" className="gap-1"><Clock size={12} /> Day -3 • Close in 68h</Badge></div>
      </div>
      <div className="grid gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 md:grid-cols-4">
        <div className="col-span-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-[12px] font-[700] tracking-wide text-amber-900"><WarningCircle size={14} weight="fill" className="text-amber-600" /> Day -3 Exception Dashboard — controller reviews exceptions only</span>
          <span className="hidden rounded-full bg-white px-2 py-0.5 font-mono text-[10px] shadow-sm md:inline">Auto-reconcile daily • &lt;60s freshness</span>
        </div>
        <div className="rounded-xl border border-amber-200 bg-white p-2.5">
          <div className="font-mono text-[10px] tracking-widest text-[var(--text-muted)]">FLOORPLAN EXC</div>
          <div className="font-mono text-[18px] font-[700]">{floorplanWarn} <span className="text-[11px] font-normal text-[var(--text-muted)]">/ {unsold.length} units</span></div>
          <div className="text-[11px] text-[var(--text-muted)]">{floorplanWarn? "Curtailment due" : "Reconciled"}</div>
        </div>
        <div className="rounded-xl border border-amber-200 bg-white p-2.5">
          <div className="font-mono text-[10px] tracking-widest text-[var(--text-muted)]">CIT EXC</div>
          <div className="font-mono text-[18px] font-[700]">{citWarn} <span className="text-[11px] font-normal text-[var(--text-muted)]">/ {citDeals.length} open</span></div>
          <div className="text-[11px] text-[var(--text-muted)]">{fmt(citTotal)} open</div>
        </div>
        <div className="rounded-xl border border-amber-200 bg-white p-2.5">
          <div className="font-mono text-[10px] tracking-widest text-[var(--text-muted)]">WARRANTY AR</div>
          <div className="font-mono text-[18px] font-[700]">{warrantyWarn} <span className="text-[11px] font-normal text-[var(--text-muted)]">pending</span></div>
          <div className="text-[11px] text-[var(--text-muted)]">{fmt(warrantyTotal)} • {warrantyROs.length} claims</div>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-white p-2.5">
          <div className="font-mono text-[10px] tracking-widest text-[var(--text-muted)]">INCENTIVE MISMATCH</div>
          <div className="font-mono text-[18px] font-[700]">{incentiveSummary.mismatch} <span className="text-[11px] font-normal text-[var(--text-muted)]">+ {incentiveSummary.stacking} stacking</span></div>
          <div className="text-[11px] text-[var(--text-muted)]">{incentiveSummary.submitted} submitted • {incentiveSummary.paid} paid</div>
        </div>
      </div>
      <div className="grid gap-3 lg:grid-cols-12">
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm lg:col-span-5">
          <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
            <span className="inline-flex items-center gap-2 text-[12px] font-semibold"><ClipboardText size={14} className="text-[var(--accent)]" /> Month-end checklist — May 2026</span>
            <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[11px] shadow-sm">{done}/12 • {pct}%</span>
          </div>
          <div className="px-4 py-3">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100"><motion.div initial={{width:0}} animate={{width:`${pct}%`}} className="h-full rounded-full bg-[var(--accent)]" /></div>
            <div className="mt-1 flex justify-between font-mono text-[11px] text-[var(--text-muted)]"><span>Continuous reconciling • tasks 1-4 auto-done from store</span><span>{pct}% • target 3 business days</span></div>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {checklist.map(c=>{
              const sel = c.id===active
              return (
                <button key={c.id} onClick={()=>setActive(c.id)} className={cn("flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-[var(--surface-hover)]", sel && "bg-[var(--accent-muted)]")}>
                  <span className={cn("grid h-6 w-6 place-items-center rounded-full", c.status==="done"? "bg-emerald-500 text-white": c.status==="warn"? "bg-amber-500 text-black": c.status==="progress"? "bg-sky-500 text-white":"bg-zinc-200 text-zinc-500")} >
                    {c.status==="done"? <CheckCircle size={14} weight="fill" /> : c.status==="warn"? <WarningCircle size={14} weight="fill" /> : c.status==="progress"? <Clock size={14} weight="bold" /> : <span className="h-2 w-2 rounded-full bg-zinc-400" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium leading-none">{c.id}. {c.k}</span>
                    <span className="block text-[11px] leading-snug text-[var(--text-muted)]">{c.note} • owner {c.owner}</span>
                  </span>
                  <Badge variant={c.status==="done"?"success": c.status==="warn"?"warning":"neutral"} className="bg-white capitalize">{c.status}</Badge>
                </button>
              )
            })}
          </div>
          <div className="space-y-2 bg-[var(--surface-muted)] px-4 py-3">
            <Button size="sm" className="w-full gap-2 bg-zinc-900 text-white hover:bg-zinc-800" onClick={()=> setShowConsolidated(v=>!v)}>
              <Buildings size={14} weight="bold" /> {showConsolidated ? "Hide Consolidated Statement" : "Generate Consolidated Statement"} <ArrowRight size={12} />
            </Button>
            <div className="flex items-center gap-2 text-[11px]">
              <SealCheck size={14} className="text-emerald-600" /> All postings immutable + audit-logged
              <span className="ml-auto font-mono text-[10px] text-[var(--text-faint)]">F8 • no batch • &lt;60s freshness • progressive lock per store</span>
            </div>
            <div className="flex gap-1.5">
              {groupMeta.rooftops.map(rt=>{
                const locked = pct===100
                const ready = done>=8
                return (
                  <span key={rt.id} className={cn("flex-1 rounded-full border px-2 py-1 text-center font-mono text-[10px] font-semibold", locked? "bg-emerald-600 text-white border-emerald-600" : ready? "bg-amber-500 text-black border-amber-500" : "bg-white border-[var(--border)]")}>
                    {rt.id.toUpperCase()} {locked? "LOCKED" : ready? "CLOSE-READY" : "OPEN"}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
        <div className="space-y-4 lg:col-span-7">
          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
              <span className="inline-flex items-center gap-2 text-[12px] font-semibold"><Bank size={14} className="text-[var(--accent)]" /> Continuous schedules — self-reconciling</span>
              <span className="flex items-center gap-1"><span className="rounded-full bg-white px-2 py-0.5 font-mono text-[10px] shadow-sm">LIVE CIT {liveCit} • funded {liveFunded} • avgFP {fmt(avgFloorplan)}</span><span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[11px] font-semibold text-white">Daily • exception flags</span></span>
            </div>
            <div className="grid gap-3 p-3 sm:grid-cols-2">
              {liveSchedules.map(s=>(
                <div key={s.name} className={cn("rounded-xl border p-3", s.color==="amber"? "border-amber-200 bg-amber-50": "border-emerald-200 bg-emerald-50/50")}>
                  <div className="flex items-center gap-2"><span className="text-[11px] font-semibold tracking-wide">{s.name.toUpperCase()}</span><span className={cn("ml-auto rounded-full px-1.5 py-0.5 font-mono text-[10px] font-bold", s.color==="amber"? "bg-amber-500 text-black":"bg-emerald-600 text-white")}>{s.warn? `${s.warn} exc`:"OK"}</span><span className="rounded-full bg-white px-1.5 py-0.5 font-mono text-[10px] shadow-sm">LIVE</span></div>
                  <div className="mt-1 font-mono text-[18px] font-[700] tabular-nums">{s.total}</div>
                  <div className="text-[11px] text-[var(--text-muted)]">{s.items} items • {s.note}</div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white"><div className={cn("h-full rounded-full", s.color==="amber"? "bg-amber-500":"bg-emerald-500")} style={{width:`${s.pct}%`}} /></div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 bg-[var(--surface-muted)] px-4 py-2.5 text-[11px]"><span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Reconciled</span><span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Exception</span><span className="ml-auto rounded-full bg-white px-2 py-0.5 font-mono shadow-sm">Auto-reconcile daily • controller reviews exceptions only • {unsold.length} floor • {citDeals.length} CIT • {warrantyROs.length} warr</span></div>
          </div>
          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-zinc-900 px-4 py-3 text-white">
              <span className="inline-flex items-center gap-2 text-[12px] font-semibold"><CurrencyDollar size={14} className="text-emerald-400" /> F14 Incentive AR — claims per deal</span>
              <span className="flex items-center gap-1.5">
                <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px]">{incentiveSummary.total} claims • {incentiveSummary.paid} paid • {incentiveSummary.mismatch} mismatch</span>
                {incentiveSummary.stacking>0 && <span className="rounded-full bg-amber-500 px-2 py-0.5 font-mono text-[10px] font-bold text-black">{incentiveSummary.stacking} stacking conflict</span>}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-[var(--surface-muted)] font-mono text-[10px] tracking-widest text-[var(--text-muted)]"><tr><th className="px-3 py-2">DEAL / CUSTOMER</th><th className="px-3 py-2">VIN • STOCK</th><th className="px-3 py-2">PROGRAM</th><th className="px-3 py-2 text-right">AMOUNT</th><th className="px-3 py-2">STATUS</th><th className="px-3 py-2">FLAG</th><th className="px-3 py-2 text-right">ACTION</th></tr></thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {incentiveClaims.map(c=>{
                    const isMismatch = c.status==="mismatch"
                    const isStack = c.stackingConflict
                    return (
                      <tr key={c.id} className={cn("hover:bg-[var(--surface-hover)]", isMismatch && "bg-amber-50/60", isStack && "bg-amber-50")}>
                        <td className="px-3 py-2.5">
                          <div className="font-[600] leading-none">{c.dealId} • {c.customerName}</div>
                          <div className="font-mono text-[11px] text-[var(--text-muted)]">{c.rooftop} • {c.submittedAt.slice(0,10)}</div>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[11px]"><div>{c.vin.slice(-6)} • {c.stockNo}</div><div className="text-[var(--text-muted)]">{c.vin.slice(0,8)}…</div></td>
                        <td className="px-3 py-2.5"><div className="text-[12px] font-medium">{c.program}</div><div className="font-mono text-[11px] text-[var(--text-muted)]">{c.programCode}</div></td>
                        <td className="px-3 py-2.5 text-right font-mono tabular-nums font-[650]">{fmt(c.claimAmount)}</td>
                        <td className="px-3 py-2.5"><Badge variant={c.status==="paid"?"success": c.status==="mismatch"?"warning": c.status==="submitted"?"neutral":"warning"} className={cn("capitalize", c.status==="mismatch" && "bg-amber-500 text-black")}>{c.status}</Badge><div className="mt-1 font-mono text-[10px] leading-tight text-[var(--text-muted)]">{c.oemResponse}</div></td>
                        <td className="px-3 py-2.5">
                          {isStack ? <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 font-mono text-[10px] font-bold text-black"><WarningCircle size={10} weight="fill" /> STACKING</span> : isMismatch ? <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-mono text-[10px] text-amber-800">MISMATCH</span> : <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[10px] text-emerald-700"><CheckCircle size={10} weight="fill" /> OK</span>}
                          {c.mismatchReason && <div className="mt-1 max-w-[180px] text-[11px] leading-tight text-amber-800">{c.mismatchReason}</div>}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <div className="flex justify-end gap-1">
                            {c.status==="mismatch" && <Button size="sm" variant="outline" className="h-7 bg-white px-2 text-[11px]" onClick={()=> submitIncentiveClaim(c.id)}>Resubmit</Button>}
                            {c.status==="submitted" && <Button size="sm" variant="outline" className="h-7 bg-white px-2 text-[11px]" onClick={()=> reconcileIncentiveClaim(c.id,"paid")}>Mark paid</Button>}
                            {c.status==="submitted" && <Button size="sm" variant="outline" className="h-7 bg-white px-2 text-[11px]" onClick={()=> reconcileIncentiveClaim(c.id,"mismatch")}>Flag mismatch</Button>}
                            {c.status==="pending" && <Button size="sm" className="h-7 px-2 text-[11px]" onClick={()=> submitIncentiveClaim(c.id)}>Submit</Button>}
                            {c.status==="paid" && <Badge variant="success" className="bg-white">Reconciled</Badge>}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center gap-2 bg-[var(--surface-muted)] px-4 py-2.5 text-[11px] text-[var(--text-muted)]">
              <span>At desking, applicable incentives auto-apply to pencil by VIN/customer/region/program rules; delivered → claims submitted → reconcile AR schedule; mismatches flagged.</span>
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 font-mono shadow-sm"><Info size={12} /> Stacking-rule check: loyalty ⊘ conquest</span>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-[var(--border)] bg-zinc-900 px-4 py-3 text-white">
                <span className="inline-flex items-center gap-2 text-[12px] font-semibold"><Receipt size={14} className="text-emerald-400" /> Journal entries • approvals</span>
                <Badge variant="success" className="bg-white text-zinc-900">Tier 2</Badge>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {JES.map(j=>(
                  <div key={j.id} className="px-4 py-2.5">
                    <div className="flex items-center gap-2"><span className="rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white">{j.id}</span><Badge variant={j.status==="posted"?"success":"warning"} className="bg-white capitalize">{j.status}</Badge><span className="ml-auto font-mono text-[10px] text-[var(--text-muted)]">{j.by}</span></div>
                    <div className="text-[12px] font-medium">{j.t}</div>
                    <div className="font-mono text-[11px] text-[var(--text-muted)]">{j.amt}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 bg-[var(--surface-muted)] px-4 py-2.5 text-[11px]"><SealCheck size={12} className="text-emerald-600" /> JE workflow with tiered approvals • period open/close/lock per store</div>
            </div>
            <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
                <span className="inline-flex items-center gap-2 text-[12px] font-semibold"><FileText size={14} className="text-[var(--accent)]" /> OEM statements &amp; payroll</span>
                <div className="flex items-center gap-1 rounded-xl border border-[var(--border)] bg-white p-0.5">
                  {(["toyota","ford","honda"] as const).map(k=>(
                    <button key={k} onClick={()=> setOemTab(k)} className={cn("rounded-lg px-2 py-1 font-mono text-[10px] font-[700] uppercase", oemTab===k? "bg-zinc-900 text-white":"text-[var(--text-muted)]")}>{k}</button>
                  ))}
                </div>
              </div>
              <div className="p-3.5 space-y-3">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-[12px] font-semibold">{oemTab==="toyota"?"OEM statement — Toyota DOC": oemTab==="ford"?"OEM statement — Ford Financial Statement":"OEM statement — Honda UCG / BMW"}</div>
                    <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[10px] shadow-sm">{oemTab==="toyota"?"Toyota • Downtown" : oemTab==="ford"?"Ford • North" : "Honda/BMW • Westside"}</span>
                  </div>
                  <div className="mt-1 grid grid-cols-2 gap-2 font-mono text-[11px]">
                    {oemTab==="toyota" ? <>
                      <span className="rounded bg-white px-2 py-1 border">Sales GP {fmt(consolidation.rows.find(r=>r.rooftopId==="dtown")?.frontGross ? (consolidation.rows.find(r=>r.rooftopId==="dtown")!.frontGross + 180000) : 182400)} ✓</span>
                      <span className="rounded bg-white px-2 py-1 border">Svc GP {fmt(12400)} ✓</span>
                      <span className="rounded bg-white px-2 py-1 border">Parts {fmt(14200)} ✓</span>
                      <span className="rounded bg-emerald-50 px-2 py-1 border border-emerald-200 text-emerald-700">Composite ready</span>
                    </> : oemTab==="ford" ? <>
                      <span className="rounded bg-white px-2 py-1 border">Front {fmt(8120)} ✓</span>
                      <span className="rounded bg-white px-2 py-1 border">Back {fmt(3210)} ✓</span>
                      <span className="rounded bg-white px-2 py-1 border">Svc {fmt(9200)} ✓</span>
                      <span className="rounded bg-emerald-50 px-2 py-1 border border-emerald-200 text-emerald-700">Ford format OK</span>
                    </> : <>
                      <span className="rounded bg-white px-2 py-1 border">Sales GP {fmt(9640)} ✓</span>
                      <span className="rounded bg-white px-2 py-1 border">Parts {fmt(12700)} ✓</span>
                      <span className="rounded bg-white px-2 py-1 border">Svc {fmt(13200)} ✓</span>
                      <span className="rounded bg-emerald-50 px-2 py-1 border border-emerald-200 text-emerald-700">BMW cert.</span>
                    </>}
                  </div>
                  <div className="mt-2 text-[11px] text-[var(--text-muted)]">{oemTab==="toyota"?"Per-store OEM financial statement — Toyota DOC format (revenue + GP + expense + composite)":"Per-store OEM financial statement — brand-specific format • auto-built from GL"}</div>
                  <div className="mt-2 flex gap-2"><Button size="sm" className="flex-1 gap-1" onClick={()=> setShowConsolidated(true)}>Generate DOC <ArrowRight size={12} /></Button><Button size="sm" variant="outline" className="bg-white">Validate format</Button></div>
                </div>
                <div className="rounded-xl border border-[var(--accent-border)] bg-[var(--accent-muted)] p-3">
                  <div className="text-[12px] font-semibold">Payroll — native, no third-party</div>
                  <div className="font-mono text-[11px] text-[var(--text-muted)]">Flag hours from RO dispatch • commissions from deals • one GL sync • {liveFunded} funded • {liveCit} CIT</div>
                  <div className="mt-2 flex items-center gap-2"><span className="rounded-full bg-white px-2 py-0.5 font-mono text-[11px] shadow-sm">18 techs • 142 flag hrs</span><span className="rounded-full bg-white px-2 py-0.5 font-mono text-[11px] shadow-sm">$41,200 • auto-reconcile</span><TrendUp size={14} className="text-emerald-600" /></div>
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-zinc-950 text-white">
            <div className="flex items-center justify-between px-4 py-3"><span className="inline-flex items-center gap-2 text-[12px] font-semibold"><Buildings size={14} className="text-sky-400" /> Consolidated group</span><span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px]">3 rooftops • auto-eliminations • LIVE</span></div>
            <div className="grid grid-cols-3 gap-2 px-4 pb-4 text-center">
              <div className="rounded-xl bg-white/5 border border-white/10 p-3"><div className="font-mono text-[10px] tracking-widest text-zinc-400">GROUP GP</div><div className="font-mono text-[16px] font-[700]">{fmt(consolidation.group.frontGross + consolidation.group.backGross || 312000)}</div><div className="text-[11px] text-zinc-400">MTD • live from deals</div></div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-3 cursor-pointer hover:bg-white/10" onClick={()=> setDrillOpen(true)}><div className="font-mono text-[10px] tracking-widest text-zinc-400">INTERCO. TRANSFERS</div><div className="font-mono text-[16px] font-[700]">{transferList.length || consolidation.group.transfers || 0}</div><div className="text-[11px] text-zinc-400">Auto-posted • drill <CaretRight size={10} className="inline" /></div></div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-3"><div className="font-mono text-[10px] tracking-widest text-zinc-400">CLOSE TARGET</div><div className="font-mono text-[16px] font-[700]">2.1d</div><div className="text-[11px] text-emerald-400">≤3 days</div></div>
            </div>
            {showConsolidated && (
              <div className="mx-4 mb-4 overflow-hidden rounded-xl border border-white/10 bg-white text-zinc-900">
                <div className="flex items-center justify-between bg-zinc-900 px-3 py-2 text-white">
                  <span className="text-[12px] font-[650]">Consolidated group statement — rollup 3 rooftops • eliminations • drill-down</span>
                  <button onClick={()=> setDrillOpen(true)} className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 font-mono text-[10px] font-[700] text-zinc-900">Drill eliminations <MagnifyingGlass size={10} /></button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-zinc-950 text-[10px] font-[650] tracking-widest text-zinc-300"><tr><th className="px-3 py-2">ROOFTOP</th><th className="px-3 py-2 text-right">UNITS</th><th className="px-3 py-2 text-right">FRONT</th><th className="px-3 py-2 text-right">BACK</th><th className="px-3 py-2 text-right">SVC</th><th className="px-3 py-2 text-right">PARTS</th><th className="px-3 py-2 text-right">CIT</th><th className="px-3 py-2 text-right">FLOOR</th></tr></thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {consolidation.rows.map(r=>(
                        <tr key={r.rooftopId} className="hover:bg-zinc-50">
                          <td className="px-3 py-2 font-[600]">{r.rooftopName} <span className="font-mono text-[10px] text-[var(--text-muted)]">• {r.brand}</span></td>
                          <td className="px-3 py-2 text-right font-mono">{r.units}</td>
                          <td className="px-3 py-2 text-right font-mono">{fmt(r.frontGross)}</td>
                          <td className="px-3 py-2 text-right font-mono">{fmt(r.backGross)}</td>
                          <td className="px-3 py-2 text-right font-mono">{fmt(r.svcGross)}</td>
                          <td className="px-3 py-2 text-right font-mono">{fmt(r.partsGross)}</td>
                          <td className="px-3 py-2 text-right font-mono">{fmt(r.citOpen)}</td>
                          <td className="px-3 py-2 text-right font-mono">{fmt(r.floorplan)}</td>
                        </tr>
                      ))}
                      <tr className="bg-zinc-900 font-mono text-white"><td className="px-3 py-2 font-[700]">GROUP CONSOLIDATED</td><td className="px-3 py-2 text-right font-[700]">{consolidation.group.units}</td><td className="px-3 py-2 text-right font-[700]">{fmt(consolidation.group.frontGross)}</td><td className="px-3 py-2 text-right font-[700]">{fmt(consolidation.group.backGross)}</td><td className="px-3 py-2 text-right font-[700]">{fmt(consolidation.group.svcGross)}</td><td className="px-3 py-2 text-right font-[700]">{fmt(consolidation.group.partsGross)}</td><td className="px-3 py-2 text-right font-[700]">{fmt(consolidation.group.citOpen)}</td><td className="px-3 py-2 text-right font-[700]">{fmt(consolidation.group.floorplan)}</td></tr>
                      <tr className="bg-amber-50 text-[11px]"><td colSpan={8} className="px-3 py-2 font-mono">↳ Intercompany eliminations auto-posted: <span className="font-[700]">-{fmt(consolidation.eliminations)}</span> (vehicle/parts transfers at transaction time, Inventory → GL) • {transferList.length} transfers • drill-down available</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center gap-2 border-t bg-[var(--surface-muted)] px-3 py-2 text-[11px] text-[var(--text-muted)]">
                  <span>Scheduled distribution: daily 06:00 DOC to 12 GMs • 100+ recipients supported • per-store OEM format honored</span>
                  <Button size="sm" variant="outline" className="ml-auto h-7 bg-white" onClick={()=> setDrillOpen(true)}>View eliminations</Button>
                </div>
              </div>
            )}
            {!showConsolidated && (
              <div className="px-4 pb-3">
                <Button size="sm" variant="outline" className="w-full bg-white text-zinc-900" onClick={()=> setShowConsolidated(true)}>Generate Consolidated Statement — 3 rooftops • eliminations • per-store OEM docs</Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-white p-3.5"><div className="text-[12px] font-semibold inline-flex items-center gap-2"><CurrencyDollar size={14} className="text-emerald-600" /> CIT lifecycle</div><div className="mt-1 text-[11px] text-[var(--text-muted)]">Delivery → CIT created → funding submitted → CIT cleared → docs-in-transit 0. Avg 4.2 days • live {liveCit} open.</div><div className="mt-2 h-1.5 rounded-full bg-zinc-100 overflow-hidden"><div className="h-full w-[62%] bg-emerald-500 rounded-full" /></div></div>
        <div className="rounded-xl border border-[var(--border)] bg-white p-3.5"><div className="text-[12px] font-semibold inline-flex items-center gap-2"><ArrowsClockwise size={14} /> F14 Incentive → F8 Close</div><div className="mt-1 text-[11px] text-[var(--text-muted)]">Incentives auto-apply at pencil → claims to OEM → AR reconciliation • {incentiveSummary.total} claims live • stacking check enforced</div></div>
        <div className="rounded-xl border border-[var(--border)] bg-white p-3.5"><div className="text-[12px] font-semibold inline-flex items-center gap-2"><Clock size={14} /> 6am DOC distribution</div><div className="mt-1 text-[11px] text-[var(--text-muted)]">Scheduled RMI-style: daily DOC to 12 GMs at 6am • 100+ recipients • no spreadsheet • per-store OEM composite</div></div>
      </div>
      <div className="rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2.5 text-center font-mono text-[10px] tracking-wide text-[var(--text-faint)]">E2 Accounting • Real-time posting • F8 Multi-rooftop Close • F14 Incentives • F15 Flag → Payroll • Intercompany auto-posted at transaction time (Inventory)</div>
      <AnimatePresence>
        {drillOpen && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={()=> setDrillOpen(false)}>
            <motion.div initial={{scale:0.98, y:8}} animate={{scale:1, y:0}} exit={{scale:0.98, y:8}} onClick={e=> e.stopPropagation()} className="max-h-[80vh] w-full max-w-[720px] overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b bg-zinc-900 px-4 py-3 text-white">
                <span className="text-[13px] font-[700]">Eliminations drill-down — intercompany transfers</span>
                <button onClick={()=> setDrillOpen(false)} className="grid h-7 w-7 place-items-center rounded-full bg-white/10"><X size={14} /></button>
              </div>
              <div className="overflow-auto p-4">
                <div className="mb-3 flex items-center gap-2 font-mono text-[11px]"><span className="rounded-full bg-amber-100 px-2 py-1 text-amber-900">Eliminations -{fmt(consolidation.eliminations)}</span><span className="rounded-full bg-zinc-100 px-2 py-1">{transferList.length} transfers • auto-posted at transaction time</span><span className="ml-auto text-[var(--text-muted)]">Vehicle/parts transfers from Inventory → GL</span></div>
                <table className="w-full text-left text-[12px]">
                  <thead className="bg-[var(--surface-muted)] font-mono text-[10px] tracking-widest text-[var(--text-muted)]"><tr><th className="px-3 py-2">VIN • STOCK</th><th className="px-3 py-2">FROM → TO</th><th className="px-3 py-2">AT</th><th className="px-3 py-2 text-right">ELIM</th></tr></thead>
                  <tbody className="divide-y">
                    {transferList.length===0 ? (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-[12px] text-[var(--text-muted)]">No transfers yet — create via Inventory transferVehicle() • eliminations show $12,400 static demo until first live transfer</td></tr>
                    ) : transferList.map((t,i)=>(
                      <tr key={i} className="hover:bg-[var(--surface-hover)]">
                        <td className="px-3 py-2 font-mono text-[11px]">{t.vin.slice(-6)} • {t.stockNo}</td>
                        <td className="px-3 py-2"><span className="rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-white">{t.from.toUpperCase()}</span> <ArrowRight size={10} className="mx-1 inline" /> <span className="rounded bg-emerald-600 px-1.5 py-0.5 font-mono text-[10px] text-white">{t.to.toUpperCase()}</span></td>
                        <td className="px-3 py-2 font-mono text-[11px]">{t.at}</td>
                        <td className="px-3 py-2 text-right font-mono">{fmt(3100)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-3 rounded-xl border bg-amber-50 p-3 text-[11px] leading-relaxed"><span className="font-[650]">Auto-posted at transaction time:</span> vehicle/parts transfers from Inventory post intercompany JE immediately (no batch). Consolidated rollup subtracts internal profit • controller views real-time, not month-end only.</div>
              </div>
              <div className="flex justify-end gap-2 border-t bg-[var(--surface-muted)] p-3"><Button size="sm" variant="outline" className="bg-white" onClick={()=> setDrillOpen(false)}>Close</Button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
