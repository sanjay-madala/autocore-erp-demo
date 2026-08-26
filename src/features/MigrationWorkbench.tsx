import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  HardDrives, CheckCircle, Clock, WarningCircle, ShieldCheck, Database, ArrowsLeftRight, ClipboardText,
  ArrowRight, DownloadSimple, FileText, CaretRight, Users, Bank, Package, Wrench, Play, Eye, LockKey
} from "@phosphor-icons/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const STAGES = [
  { n:1, k:"Kickoff", d:"Legal runbook + AZ HB 2418", pct:100 },
  { n:2, k:"Extract", d:"CDK / Reynolds / Tekion", pct:100 },
  { n:3, k:"Map", d:"COA + bins + roles", pct:92 },
  { n:4, k:"Test Load", d:"Staging verification", pct:88 },
  { n:5, k:"Training", d:"Role cert gating", pct:74 },
  { n:6, k:"Parallel Run", d:"14-day daily parity", pct:62 },
  { n:7, k:"Cutover", d:"<72h weekend", pct:18 },
]
const EXTRACTORS = [
  { name:"CDK Drive", src:"CDK", status:"done", coverage:"GL history • customers • vehicles • bins/on-order • open ROs/deals • employees • 15k rooftops", pct:98.4, note:"15,000 rooftops post-outage" },
  { name:"Reynolds ERA-IGNITE", src:"Reynolds", status:"progress", coverage:"Same domains • ERA formats • 10k rooftops", pct:87, note:"Mapping workbench • RCI bypass" },
  { name:"Tekion ARC", src:"Tekion", status:"queued", coverage:"Defensive churn capture", pct:12, note:"Queued • after CDK/Reynolds" },
]
const MAPPING = [
  { field:"Customers", source:"CDK CRM", target:"M-xxx shared file", score:"98.4%", issues:3, status:"ok" },
  { field:"Vehicles", source:"CDK Inventory", target:"VIN master", score:"99.1%", issues:1, status:"ok" },
  { field:"Chart of Accounts", source:"CDK GL", target:"OEM-mapped COA", score:"96.2%", issues:7, status:"warn" },
  { field:"Parts bins/on-hand", source:"CDK Parts", target:"Bin location matrix", score:"99.2%", issues:0, status:"ok" },
  { field:"Open ROs", source:"CDK Service", target:"RO state machine", score:"97.8%", issues:2, status:"warn" },
  { field:"Open deals / CIT", source:"CDK Deals", target:"Deal object", score:"98.9%", issues:1, status:"ok" },
]

export default function MigrationWorkbench(){
  const [stage,setStage]=useState(5) // 0-indexed 5 = Parallel Run
  const [ext,setExt]=useState(0)
  return (
    <div className="mx-auto max-w-[1440px] space-y-4 p-4 lg:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-[22px] font-[700] tracking-[-0.03em]">Migration Workbench</h1><Badge variant="success" className="gap-1"><ShieldCheck size={12} weight="fill" /> As-a-product</Badge><span className="hidden md:inline rounded-full bg-zinc-900 px-2 py-0.5 font-mono text-[10px] font-semibold text-white">E13 • F10 • CDK → AutoCore</span></div>
          <p className="mt-1 text-[12.5px] text-[var(--text-muted)]">Migration is our first product impression — automated extractors, mapping workbench, parallel run, cutover SLA. Crush the 6–18 month fear.</p>
        </div>
        <div className="flex items-center gap-2"><Badge variant="warning" className="gap-1"><Clock size={12} /> 68% • Parallel Run</Badge><span className="rounded-full border border-[var(--border)] bg-white px-2.5 py-1 font-mono text-[11px]">Pilot: 4 stores • Asbury precedent</span></div>
      </div>

      {/* legal runbook */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px]">
        <span className="inline-flex items-center gap-1.5 font-semibold"><LockKey size={14} className="text-amber-700" /> Legal runbook</span>
        <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[11px] border">AZ HB 2418</span><span className="rounded-full bg-white px-2 py-0.5 font-mono text-[11px] border">MT SB 411</span><span className="rounded-full bg-white px-2 py-0.5 font-mono text-[11px] border">OR data law</span>
        <span className="text-amber-800">Georgia injunction precedent — if incumbent withholds data, automated request package cites dealer-data law.</span>
        <span className="ml-auto rounded-full bg-zinc-900 px-2 py-0.5 font-mono text-[11px] font-semibold text-white">Dealer data is dealer's</span>
      </div>

      {/* stepper */}
      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
          <span className="inline-flex items-center gap-2 text-[12px] font-semibold"><ClipboardText size={14} className="text-[var(--accent)]" /> 7 stages — pilot-store playbook</span>
          <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[11px] shadow-sm">4-store pilot • 2–4 wk parallel</span>
        </div>
        <div className="p-4">
          <div className="relative">
            <div className="absolute left-[18px] right-[18px] top-[18px] h-1 rounded-full bg-zinc-200" />
            <div className="absolute left-[18px] top-[18px] h-1 rounded-full bg-[var(--accent)] transition-all" style={{ width: `calc(${(stage / 6) * 100}% - 36px)` }} />
            <div className="relative grid grid-cols-7 gap-1">
              {STAGES.map(s=>{
                const active = stage >= s.n-1, cur = stage === s.n-1
                return (
                  <button key={s.n} onClick={()=>setStage(s.n-1)} className={cn("flex flex-col items-center gap-1.5 rounded-xl border p-2 text-center", cur?"border-[var(--accent-border)] bg-[var(--accent-muted)]": active?"border-emerald-200 bg-emerald-50":"border-[var(--border)] bg-white hover:bg-[var(--surface-hover)]")}>
                    <span className={cn("grid h-7 w-7 place-items-center rounded-full text-[11px] font-[700]", active?"bg-[var(--accent)] text-white":"bg-white border text-[var(--text-muted)]")}>{active? <CheckCircle size={14} weight="fill" />: s.n}</span>
                    <span className={cn("text-[11px] font-semibold leading-none", cur?"text-[var(--accent)]": active?"text-emerald-800":"text-[var(--text-primary)]")}>{s.n}. {s.k}</span>
                    <span className="hidden text-[10px] leading-snug text-[var(--text-muted)] md:block">{s.d}</span>
                    {cur && <span className="rounded-full bg-[var(--accent)] px-1.5 py-0.5 text-[9px] font-bold text-white">NOW</span>}
                  </button>
                )
              })}
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={stage} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-[12px]">
              {stage===5 && <span><span className="font-semibold">6 — Parallel Run:</span> Store operates CDK for accounting while transactions mirrored into AutoCore • daily parity report (deals/ROs/receipts) • go/no-go after ≥14 days parity. Currently Day 9/14.</span>}
              {stage!==5 && <span><span className="font-semibold">{STAGES[stage].k}:</span> {STAGES[stage].d} • {STAGES[stage].pct}% • documentation &amp; sign-off per runbook.</span>}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        {/* left: extractors + mapping */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-zinc-900 px-4 py-3 text-white">
              <span className="inline-flex items-center gap-2 text-[12px] font-semibold"><HardDrives size={14} className="text-sky-400" /> Extractors — 3 rails</span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px]">CDK first • 15k rooftops</span>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {EXTRACTORS.map((e,i)=>(
                <button key={e.name} onClick={()=>setExt(i)} className={cn("flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-[var(--surface-hover)]", ext===i && "bg-[var(--accent-muted)]")}>
                  <span className={cn("mt-0.5 grid h-8 w-8 place-items-center rounded-xl text-white", e.status==="done"? "bg-emerald-600": e.status==="progress"? "bg-amber-500 text-black":"bg-zinc-300 text-zinc-600")}>{e.status==="done"? <CheckCircle size={16} weight="fill" />: e.status==="progress"? <Clock size={16} weight="bold" />: <Database size={16} />}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2"><span className="text-[13px] font-semibold">{e.name}</span><span className="rounded-full bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-white">{e.src}</span><span className={cn("ml-auto rounded-full px-1.5 py-0.5 font-mono text-[11px] font-bold", e.status==="done"? "bg-emerald-50 text-emerald-700 border border-emerald-200": e.status==="progress"?"bg-amber-50 text-amber-800 border border-amber-200":"bg-zinc-100 text-zinc-500")}>{e.pct}%</span></span>
                    <span className="block text-[11px] leading-snug text-[var(--text-muted)]">{e.coverage}</span>
                    <span className="mt-1 block font-mono text-[11px] text-[var(--text-faint)]">{e.note}</span>
                    <span className="mt-1 block h-1.5 w-full overflow-hidden rounded-full bg-zinc-100"><span className={cn("block h-full rounded-full", e.status==="done"? "bg-emerald-500": e.status==="progress"?"bg-amber-500":"bg-zinc-300")} style={{width:`${e.pct}%`}} /></span>
                  </span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 bg-[var(--surface-muted)] px-4 py-2.5 text-[11px]"><Database size={12} /> Staging area • field-mapping workbench • load pipelines • verification-report framework<span className="ml-auto rounded-full bg-white px-2 py-0.5 font-mono shadow-sm">E13-T01</span></div>
          </div>

          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
              <span className="inline-flex items-center gap-2 text-[12px] font-semibold"><ArrowsLeftRight size={14} className="text-[var(--accent)]" /> Mapping workbench — data-quality scoring</span>
              <Badge variant="warning" className="bg-white">7 unmapped</Badge>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {MAPPING.map(m=>(
                <div key={m.field} className="flex items-center gap-3 px-4 py-2.5">
                  <span className={cn("grid h-6 w-6 place-items-center rounded-full", m.status==="ok"? "bg-emerald-500 text-white":"bg-amber-500 text-black")}>{m.status==="ok"? <CheckCircle size={12} weight="fill" />: <WarningCircle size={12} weight="fill" />}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] font-medium leading-none">{m.field}</span>
                    <span className="block font-mono text-[11px] text-[var(--text-muted)]">{m.source} → {m.target}</span>
                  </span>
                  <span className="text-right"><span className={cn("rounded-full px-2 py-0.5 font-mono text-[11px] font-bold", m.status==="ok"? "bg-emerald-50 text-emerald-700 border border-emerald-200":"bg-amber-50 text-amber-800 border border-amber-200")}>{m.score}</span><span className="block font-mono text-[10px] text-[var(--text-faint)]">{m.issues} issues</span></span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 bg-[var(--surface-muted)] p-3"><Button size="sm" className="flex-1 gap-1"><Eye size={12} /> Open workbench</Button><Button size="sm" variant="outline" className="bg-white gap-1 flex-1">Remediation list</Button></div>
          </div>
        </div>

        {/* right: verification + parallel run + cutover */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50/50 shadow-sm">
            <div className="flex items-center justify-between bg-emerald-600 px-4 py-3 text-white">
              <span className="inline-flex items-center gap-2 text-[12px] font-semibold"><ShieldCheck size={14} weight="fill" /> Verification — penny &amp; bin exact</span>
              <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-700">PASS</span>
            </div>
            <div className="space-y-3 p-4">
              <div className="rounded-xl border border-emerald-200 bg-white p-3">
                <div className="flex items-center gap-2 text-[12px] font-semibold"><Bank size={14} className="text-emerald-600" /> Trial balance — GL</div>
                <div className="mt-1 flex items-baseline gap-2"><span className="font-mono text-[18px] font-[700]">$0.00</span><span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[11px] font-bold text-white">variance</span><span className="font-mono text-[11px] text-[var(--text-muted)]">Matches source to penny • JE-20441 validated</span></div>
                <div className="mt-1 h-1.5 rounded-full bg-zinc-100 overflow-hidden"><div className="h-full w-full bg-emerald-500" /></div>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-white p-3">
                <div className="flex items-center gap-2 text-[12px] font-semibold"><Package size={14} className="text-emerald-600" /> Parts on-hand by bin</div>
                <div className="mt-1 flex items-baseline gap-2"><span className="font-mono text-[18px] font-[700]">1,204</span><span className="font-mono text-[12px]">SKUs •</span><span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[11px] font-bold text-white">by-bin exact</span></div>
                <div className="font-mono text-[11px] text-[var(--text-muted)]">On-hand 1,204 • Allocated 18 • On-order 42 • no double-count (Tekion lesson)</div>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-white p-3">
                <div className="flex items-center gap-2 text-[12px] font-semibold"><Wrench size={14} className="text-emerald-600" /> Open ROs &amp; CIT</div>
                <div className="mt-1 font-mono text-[12px]">6 ROs • 7 CIT • totals match • parity 100%</div>
                <div className="text-[11px] text-[var(--text-muted)]">Verification report framework • per-domain scoring</div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
              <span className="inline-flex items-center gap-2 text-[12px] font-semibold"><Clock size={14} className="text-[var(--accent)]" /> Parallel run — daily parity 14d</span>
              <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[11px] shadow-sm">Day 9/14 • go/no-go pending</span>
            </div>
            <div className="p-4">
              <div className="flex items-end gap-[3px]">
                {Array.from({length:14}).map((_,i)=>{
                  const h = [62,58,71,68,75,80,77,82,69,74,78,85,0,0][i]
                  const active = i<9
                  return (
                    <div key={i} className="flex flex-1 flex-col items-center gap-1">
                      <span className={cn("text-[10px] font-mono", active? "text-emerald-700":"text-zinc-400")}>{active? "100%":""}</span>
                      <div className={cn("w-full rounded-t-[4px]", active?"bg-emerald-500":"bg-zinc-200")} style={{height:`${h? h*0.6: 8}px`}} title={active? "parity 100%":"pending"} />
                      <span className="font-mono text-[10px] text-[var(--text-faint)]">{i+1}</span>
                    </div>
                  )
                })}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 border border-emerald-200 font-medium">Deals 12/12</span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 border border-emerald-200 font-medium">ROs 6/6</span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 border border-emerald-200 font-medium">Receipts matched</span>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-zinc-900 bg-zinc-900 text-white">
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 text-[12px] font-semibold"><Calendar size={14} className="text-sky-400" /> Cutover runbook — &lt;72h weekend</div>
              <div className="mt-1 text-[11px] text-zinc-400">Fri 18:00 freeze → delta extract → load → verify → Mon 08:00 open on AutoCore. Rollback documented.</div>
            </div>
            <div className="mx-3 mb-3 flex items-center gap-1 rounded-xl bg-white/5 border border-white/10 p-2 text-[11px]">
              <span className="flex-1 text-center"><span className="block font-semibold">Fri 18:00</span><span className="font-mono text-zinc-400">Freeze</span></span>
              <ArrowRight size={12} className="text-zinc-500" />
              <span className="flex-1 text-center"><span className="block font-semibold">Sat 02:00</span><span className="font-mono text-zinc-400">Delta</span></span>
              <ArrowRight size={12} className="text-zinc-500" />
              <span className="flex-1 text-center"><span className="block font-semibold">Sat 10:00</span><span className="font-mono text-zinc-400">Verify</span></span>
              <ArrowRight size={12} className="text-zinc-500" />
              <span className="flex-1 text-center rounded-full bg-emerald-500 py-1 font-bold">Mon 08:00 Open</span>
            </div>
            <div className="mx-3 mb-3 flex gap-2">
              <Button size="sm" variant="secondary" className="flex-1 bg-white text-zinc-900 gap-1 text-[11px]"><Play size={12} weight="fill" /> Run cutover</Button>
              <Button size="sm" variant="outline" className="border-white/15 bg-transparent text-white gap-1 text-[11px]"><FileText size={12} /> Rollback plan</Button>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-white p-3.5">
            <div className="flex items-center gap-2 text-[12px] font-semibold"><Users size={14} /> Training &amp; certification gating</div>
            <div className="mt-1 text-[11px] text-[var(--text-muted)]">Role courses + sandbox practice tenants • no go-live until certified. 24 staff • 18 certified • 6 in-progress.</div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100"><div className="h-full w-[75%] bg-[var(--accent)] rounded-full" /></div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2.5 text-center font-mono text-[10px] tracking-wide text-[var(--text-faint)]">E13 • Migration-as-a-product • 68% pilot • Legal runbook • Extractors 98.4% • Mapping 99.2% bins • Parallel 9/14 • Cutover &lt;72h • Asbury 12% higher performance</div>
    </div>
  )
}
function Calendar({ size, className }: { size:number; className?:string }){
  return <Clock size={size} className={className} />
}
