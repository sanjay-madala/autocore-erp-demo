import { useState } from "react"
import { motion } from "motion/react"
import {
  ChartBar, CheckCircle, Clock, WarningCircle, ArrowsClockwise, CurrencyDollar, FileText, SealCheck,
  Bank, Receipt, ArrowRight, TrendUp, Calendar, ShieldCheck, ClipboardText
} from "@phosphor-icons/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"

const CHECKLIST = [
  { id:1, k:"Deals journal posted", owner:"System", status:"done", note:"Real-time • 12 deals MTD" },
  { id:2, k:"ROs & parts POST to GL", owner:"System", status:"done", note:"6 ROs • $18.4k" },
  { id:3, k:"Floorplan schedule reconciling", owner:"M. Rivera", status:"warn", note:"2 overdue • curtailment due" },
  { id:4, k:"CIT schedule — 7 deals funding", owner:"D. Alvarez", status:"warn", note:"$142k CIT • 2 conditioned" },
  { id:5, k:"Warranty AR — claims submitted", owner:"P. Singh", status:"done", note:"4 paid, 1 pending" },
  { id:6, k:"AP/AR cash receipts matched", owner:"L. Chen", status:"progress", note:"Auto-reconcile 94%" },
  { id:7, k:"JE approvals — period Tier 2", owner:"D. Alvarez", status:"todo", note:"3 JEs await sign-off" },
  { id:8, k:"Payroll — flag + commission", owner:"System", status:"done", note:"18 techs • $41k flag" },
  { id:9, k:"OEM statements — Toyota/Ford", owner:"D. Alvarez", status:"progress", note:"Draft • format OK" },
  { id:10, k:"Intercompany eliminations", owner:"System", status:"done", note:"Vehicle/parts transfers auto" },
  { id:11, k:"Consolidated group composite", owner:"D. Alvarez", status:"progress", note:"Rollup 3 rooftops" },
  { id:12, k:"Period lock — May 2026", owner:"D. Alvarez", status:"todo", note:"After checklist 100%" },
]
const SCHEDULES = [
  { name:"Floorplan", total:"$812,400", items:10, warn:2, note:"2 overdue curtailment • 10 units", color:"amber" },
  { name:"Contracts in Transit", total:"$142,850", items:7, warn:2, note:"CIT aging 4.2d avg", color:"amber" },
  { name:"Warranty Receivable", total:"$28,400", items:5, warn:1, note:"5 claims • 1 pending OEM", color:"emerald" },
  { name:"Parts Inventory", total:"$410,200", items:25, warn:0, note:"Self-reconciling daily", color:"emerald" },
]
const JES = [
  { id:"JE-20441", t:"CIT setup — D-1041 F-150 $48,200", by:"System • delivery 09:41", amt:"$48,200 Dr CIT / Cr Sales", status:"posted" },
  { id:"JE-20442", t:"Funding — D-1041 lender Wells", by:"System • fund 14:22", amt:"$46,800 Dr Cash / Cr CIT", status:"posted" },
  { id:"JE-20443", t:"Floorplan payoff — VIN 1FT...", by:"M. Rivera • manual", amt:"$38,200 Dr Floorplan / Cr Cash", status:"pending" },
]
export default function AccountingClose(){
  const live = useStore(s=> s.deals)
  const liveCit = live.filter(d=> d.funding.status==="submitted").length
  const liveFunded = live.filter(d=> d.funding.status==="funded" || d.glPosted).length
  const [active, setActive] = useState<number>(3)
  const done = CHECKLIST.filter(c=>c.status==="done").length
  const pct = Math.round(done / CHECKLIST.length * 100)
  return (
    <div className="mx-auto max-w-[1440px] space-y-4 p-4 lg:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-[22px] font-[700] tracking-[-0.03em]">GL &amp; Close</h1><Badge variant="success" className="gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" /> LIVE POSTING</Badge><span className="hidden md:inline rounded-full bg-zinc-900 px-2 py-0.5 font-mono text-[10px] font-semibold text-white">E2 • Real-time • F8</span></div>
          <p className="mt-1 text-[12.5px] text-[var(--text-muted)]">Controller-grade close — continuous schedules, real-time posting, consolidated group. Reynolds-grade without the batch.</p>
        </div>
        <div className="flex items-center gap-2"><span className="rounded-full border border-[var(--border)] bg-white px-2.5 py-1 font-mono text-[11px]">Group: Sovereign • 3 stores</span><Badge variant="warning" className="gap-1"><Clock size={12} /> Day -3 • Close in 68h</Badge></div>
      </div>

      <div className="grid gap-3 lg:grid-cols-12">
        {/* checklist */}
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm lg:col-span-5">
          <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
            <span className="inline-flex items-center gap-2 text-[12px] font-semibold"><ClipboardText size={14} className="text-[var(--accent)]" /> Month-end checklist — May 2026</span>
            <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[11px] shadow-sm">{done}/12 • {pct}%</span>
          </div>
          <div className="px-4 py-3">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100"><motion.div initial={{width:0}} animate={{width:`${pct}%`}} className="h-full rounded-full bg-[var(--accent)]" /></div>
            <div className="mt-1 flex justify-between font-mono text-[11px] text-[var(--text-muted)]"><span>Continuous reconciling</span><span>{pct}% • target 3 business days</span></div>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {CHECKLIST.map(c=>{
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
          <div className="flex items-center gap-2 bg-[var(--surface-muted)] px-4 py-2.5 text-[11px]">
            <SealCheck size={14} className="text-emerald-600" /> All postings immutable + audit-logged
            <span className="ml-auto font-mono text-[10px] text-[var(--text-faint)]">F8 • no batch • &lt;60s freshness</span>
          </div>
        </div>

        {/* schedules + JE */}
        <div className="space-y-4 lg:col-span-7">
          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
              <span className="inline-flex items-center gap-2 text-[12px] font-semibold"><Bank size={14} className="text-[var(--accent)]" /> Continuous schedules — self-reconciling</span>
              <span className="flex items-center gap-1"><span className="rounded-full bg-white px-2 py-0.5 font-mono text-[10px] shadow-sm">LIVE CIT {liveCit} • funded {liveFunded}</span><span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[11px] font-semibold text-white">Daily • exception flags</span></span>
            </div>
            <div className="grid gap-3 p-3 sm:grid-cols-2">
              {SCHEDULES.map(s=>(
                <div key={s.name} className={cn("rounded-xl border p-3", s.color==="amber"? "border-amber-200 bg-amber-50": "border-emerald-200 bg-emerald-50/50")}>
                  <div className="flex items-center gap-2"><span className="text-[11px] font-semibold tracking-wide">{s.name.toUpperCase()}</span><span className={cn("ml-auto rounded-full px-1.5 py-0.5 font-mono text-[10px] font-bold", s.color==="amber"? "bg-amber-500 text-black":"bg-emerald-600 text-white")}>{s.warn? `${s.warn} exc`:"OK"}</span></div>
                  <div className="mt-1 font-mono text-[18px] font-[700] tabular-nums">{s.total}</div>
                  <div className="text-[11px] text-[var(--text-muted)]">{s.items} items • {s.note}</div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white"><div className={cn("h-full rounded-full", s.color==="amber"? "bg-amber-500 w-[78%]":"bg-emerald-500 w-[96%]")} /></div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 bg-[var(--surface-muted)] px-4 py-2.5 text-[11px]"><span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Reconciled</span><span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Exception</span><span className="ml-auto rounded-full bg-white px-2 py-0.5 font-mono shadow-sm">Auto-reconcile daily • controller reviews exceptions only</span></div>
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
              <div className="flex items-center gap-2 bg-[var(--surface-muted)] px-4 py-2.5 text-[11px]"><ShieldCheck size={12} className="text-emerald-600" /> JE workflow with tiered approvals • period open/close/lock per store</div>
            </div>

            <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
                <span className="inline-flex items-center gap-2 text-[12px] font-semibold"><FileText size={14} className="text-[var(--accent)]" /> OEM statements &amp; payroll</span>
                <span className="rounded-full bg-zinc-900 px-2 py-0.5 font-mono text-[10px] font-semibold text-white">Toyota • Ford</span>
              </div>
              <div className="p-3.5 space-y-3">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
                  <div className="text-[12px] font-semibold">OEM statement — Toyota DOC</div>
                  <div className="mt-1 grid grid-cols-2 gap-2 font-mono text-[11px]"><span className="rounded bg-white px-2 py-1 border">Sales GP $182,400 ✓</span><span className="rounded bg-white px-2 py-1 border">Svc GP $94,200 ✓</span><span className="rounded bg-white px-2 py-1 border">Parts $41,100 ✓</span><span className="rounded bg-emerald-50 px-2 py-1 border border-emerald-200 text-emerald-700">Composite ready</span></div>
                  <div className="mt-2 flex gap-2"><Button size="sm" className="flex-1 gap-1">Generate DOC <ArrowRight size={12} /></Button><Button size="sm" variant="outline" className="bg-white">Validate format</Button></div>
                </div>
                <div className="rounded-xl border border-[var(--accent-border)] bg-[var(--accent-muted)] p-3">
                  <div className="text-[12px] font-semibold">Payroll — native, no third-party</div>
                  <div className="font-mono text-[11px] text-[var(--text-muted)]">Flag hours from RO dispatch • commissions from deals • one GL sync</div>
                  <div className="mt-2 flex items-center gap-2"><span className="rounded-full bg-white px-2 py-0.5 font-mono text-[11px] shadow-sm">18 techs • 142 flag hrs</span><span className="rounded-full bg-white px-2 py-0.5 font-mono text-[11px] shadow-sm">$41,200 • auto-reconcile</span><TrendUp size={14} className="text-emerald-600" /></div>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-zinc-950 text-white">
            <div className="flex items-center justify-between px-4 py-3"><span className="inline-flex items-center gap-2 text-[12px] font-semibold"><ChartBar size={14} className="text-sky-400" /> Consolidated group</span><span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px]">3 rooftops • auto-eliminations</span></div>
            <div className="grid grid-cols-3 gap-2 px-4 pb-4 text-center">
              <div className="rounded-xl bg-white/5 border border-white/10 p-3"><div className="font-mono text-[10px] tracking-widest text-zinc-400">GROUP GP</div><div className="font-mono text-[16px] font-[700]">$312k</div><div className="text-[11px] text-zinc-400">MTD</div></div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-3"><div className="font-mono text-[10px] tracking-widest text-zinc-400">INTERCO. TRANSFERS</div><div className="font-mono text-[16px] font-[700]">14</div><div className="text-[11px] text-zinc-400">Auto-posted</div></div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-3"><div className="font-mono text-[10px] tracking-widest text-zinc-400">CLOSE TARGET</div><div className="font-mono text-[16px] font-[700]">2.1d</div><div className="text-[11px] text-emerald-400">≤3 days</div></div>
            </div>
          </div>
        </div>
      </div>

      {/* footer flows */}
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-white p-3.5"><div className="text-[12px] font-semibold inline-flex items-center gap-2"><CurrencyDollar size={14} className="text-emerald-600" /> CIT lifecycle</div><div className="mt-1 text-[11px] text-[var(--text-muted)]">Delivery → CIT created → funding submitted → CIT cleared → docs-in-transit 0. Avg 4.2 days.</div><div className="mt-2 h-1.5 rounded-full bg-zinc-100 overflow-hidden"><div className="h-full w-[62%] bg-emerald-500 rounded-full" /></div></div>
        <div className="rounded-xl border border-[var(--border)] bg-white p-3.5"><div className="text-[12px] font-semibold inline-flex items-center gap-2"><ArrowsClockwise size={14} /> F14 Incentive → F8 Close</div><div className="mt-1 text-[11px] text-[var(--text-muted)]">Incentives auto-apply at pencil → claims to OEM → AR reconciliation • 14 variants live</div></div>
        <div className="rounded-xl border border-[var(--border)] bg-white p-3.5"><div className="text-[12px] font-semibold inline-flex items-center gap-2"><Calendar size={14} /> 6am DOC distribution</div><div className="mt-1 text-[11px] text-[var(--text-muted)]">Scheduled RMI-style: daily DOC to 12 GMs at 6am • 100+ recipients • no spreadsheet</div></div>
      </div>

      <div className="rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2.5 text-center font-mono text-[10px] tracking-wide text-[var(--text-faint)]">E2 Accounting • Real-time posting • F8 Multi-rooftop Close • F14 Incentives • F15 Flag → Payroll</div>
    </div>
  )
}
