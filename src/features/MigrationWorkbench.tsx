import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  HardDrives, CheckCircle, Clock, WarningCircle, ShieldCheck, Database, ArrowsLeftRight, ClipboardText,
  ArrowRight, FileText, Users, Bank, Package, Wrench, Play, Eye, LockKey, X, Check, SpinnerGap
} from "@phosphor-icons/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"

const STAGES = [
  { n:1, k:"Kickoff", d:"Legal runbook + AZ HB 2418", pct:100 },
  { n:2, k:"Extract", d:"CDK / Reynolds / Tekion", pct:100 },
  { n:3, k:"Map", d:"COA + bins + roles", pct:92 },
  { n:4, k:"Test Load", d:"Staging verification", pct:88 },
  { n:5, k:"Training", d:"Role cert gating", pct:74 },
  { n:6, k:"Parallel Run", d:"14-day daily parity", pct:62 },
  { n:7, k:"Cutover", d:"<72h weekend", pct:18 },
]

export default function MigrationWorkbench(){
  const migration = useStore(s=>s.migration)
  const runExtractor = useStore(s=>s.runExtractor)
  const fixMapping = useStore(s=>s.fixMapping)
  const verifyLoad = useStore(s=>s.verifyLoad)
  const advanceParallelDay = useStore(s=>s.advanceParallelDay)
  const executeCutover = useStore(s=>s.executeCutover)
  const rollback = useStore(s=>s.rollback)
  const vehicles = useStore(s=>s.vehicles)

  const [stage,setStage]=useState(5) // 0-indexed 5 = Parallel Run
  const [ext,setExt]=useState(0)
  const [toast,setToast]=useState<string|null>(null)
  const [showRollback,setShowRollback]=useState(false)
  const [verifying,setVerifying]=useState(false)

  // auto-dismiss toast
  useEffect(()=>{
    if(!toast) return
    const t = setTimeout(()=> setToast(null), 2200)
    return ()=> clearTimeout(t)
  },[toast])

  const extractors = migration.extractors
  const mappingRows = migration.mappingRows
  const verification = migration.verification
  const parallel = migration.parallelRun
  const cutover = migration.cutover
  const currentDay = parallel.currentDay
  const isGo = currentDay >= 14
  const isLive = cutover.status === "live"
  const isRolledBack = cutover.status === "rolled_back"

  const handleRunExtractor = (id:string)=>{
    runExtractor(id)
    const e = extractors.find(x=>x.id===id)
    if(e?.status==="done"){
      setToast(`${e.name} already completed 98.4%`)
    } else {
      setToast(`Running ${e?.name ?? id} extractor… 12% → 87% → 98.4%`)
    }
  }
  const handleFix = (field:string)=>{
    fixMapping(field)
    setToast(`Remediated ${field} → 99.1% • 0 issues`)
  }
  const handleVerify = ()=>{
    setVerifying(true)
    setToast("Verifying staging load… trial balance + bins")
    setTimeout(()=>{
      verifyLoad()
      setVerifying(false)
      setToast("Verification PASS • $0.00 variance • 1,204 SKUs by-bin exact")
    }, 750)
  }
  const handleAdvance = ()=>{
    if(currentDay>=14){
      setToast("Parallel run complete • GO for cutover")
      return
    }
    advanceParallelDay()
    setToast(`Advanced to Day ${currentDay+1}/14 • parity 100%`)
  }
  const handleCutover = ()=>{
    executeCutover()
    setToast("Cutover EXECUTED • vehicles migrated • status LIVE")
  }
  const handleRollback = ()=>{
    rollback()
    setShowRollback(false)
    setToast("Rollback completed • cutover reverted • CDK still authoritative")
  }

  // derived counts
  const unmapped = mappingRows.filter(r=>r.status==="warn").length
  const cutoverVehicles = vehicles.filter(v=> ((v as unknown as { transferHistory?: {from:string;to:string;at:string}[] }).transferHistory||[]).some(t=>t.from==="CDK" && t.to==="AutoCore"))

  return (
    <div className="mx-auto max-w-[1440px] space-y-4 p-4 lg:p-6">
      {/* toast */}
      <div className="pointer-events-none fixed top-4 right-4 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toast && (
            <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} className="pointer-events-auto rounded-xl border border-zinc-200 bg-zinc-900 px-4 py-2.5 text-[12px] font-medium text-white shadow-xl flex items-center gap-2 max-w-[360px]">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-white"><Check size={12} weight="bold" /></span>
              <span className="leading-snug">{toast}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* rollback modal */}
      <AnimatePresence>
        {showRollback && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm" onClick={()=>setShowRollback(false)}>
            <motion.div initial={{scale:0.96,y:8}} animate={{scale:1,y:0}} exit={{scale:0.96,y:8}} onClick={e=>e.stopPropagation()} className="w-full max-w-[520px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-900 px-5 py-4 text-white">
                <span className="flex items-center gap-2 text-[13px] font-semibold"><ShieldCheck size={16} className="text-sky-400" /> Rollback plan — documented</span>
                <button onClick={()=>setShowRollback(false)} className="grid h-7 w-7 place-items-center rounded-full bg-white/10 hover:bg-white/15"><X size={14} /></button>
              </div>
              <div className="space-y-3 p-5 text-[12px] leading-relaxed">
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <div className="font-semibold text-amber-800">Cutover status: {cutover.status.toUpperCase()} {cutover.executedAt && <span className="font-mono text-[11px]">• {new Date(cutover.executedAt).toLocaleString()}</span>}</div>
                  <div className="text-[11px] text-amber-700">If live cutover fails verification, execute rollback within 72h window. CDK remains authoritative until AutoCore parity confirmed.</div>
                </div>
                <div className="grid gap-2">
                  <div className="rounded-lg border bg-zinc-50 p-3">
                    <div className="font-semibold">1. Freeze revert</div>
                    <div className="text-[11px] text-zinc-600">Re-enable CDK GL posting • unlock DMS • revert transferHistory timestamps</div>
                  </div>
                  <div className="rounded-lg border bg-zinc-50 p-3">
                    <div className="font-semibold">2. Delta discard</div>
                    <div className="text-[11px] text-zinc-600">Drop staging delta extract • keep audit log • notify 4 pilot stores</div>
                  </div>
                  <div className="rounded-lg border bg-zinc-50 p-3">
                    <div className="font-semibold">3. Verification</div>
                    <div className="text-[11px] text-zinc-600">Trial balance back to CDK • bins 1,204 exact • parity report 100%</div>
                  </div>
                </div>
                {cutoverVehicles.length>0 && (
                  <div className="rounded-lg border border-zinc-200 bg-white p-2.5">
                    <div className="text-[11px] font-semibold text-zinc-700">Vehicles with cutover timestamp ({cutoverVehicles.length})</div>
                    <div className="mt-1 max-h-20 overflow-auto space-y-1 font-mono text-[10px] text-zinc-600">
                      {cutoverVehicles.slice(0,3).map(v=> {
                        const th = (v as unknown as { transferHistory?: {from:string;to:string;at:string}[] }).transferHistory?.find(t=>t.from==="CDK" && t.to==="AutoCore")
                        return <div key={v.vin} className="flex justify-between"><span>{v.stockNo} • {v.vin.slice(-6)}</span><span>{th ? new Date(th.at).toLocaleTimeString() : ""}</span></div>
                      })}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" className="flex-1" onClick={()=>setShowRollback(false)}>Close</Button>
                  <Button size="sm" className="flex-1 bg-amber-600 hover:bg-amber-700 text-white" onClick={handleRollback}>Execute Rollback</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-[22px] font-[700] tracking-[-0.03em]">Migration Workbench</h1><Badge variant="success" className="gap-1"><ShieldCheck size={12} weight="fill" /> As-a-product</Badge><span className="hidden md:inline rounded-full bg-zinc-900 px-2 py-0.5 font-mono text-[10px] font-semibold text-white">E13 • F10 • CDK → AutoCore</span></div>
          <p className="mt-1 text-[12.5px] text-[var(--text-muted)]">Migration is our first product impression — automated extractors, mapping workbench, parallel run, cutover SLA. Crush the 6–18 month fear.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isLive ? "success" : isRolledBack ? "danger" : "warning"} className="gap-1">{isLive ? <><CheckCircle size={12} weight="fill" /> LIVE • Cutover executed</> : isRolledBack ? <><WarningCircle size={12} weight="fill" /> Rolled back</> : <><Clock size={12} /> 68% • Parallel Run</>}</Badge>
          <span className="rounded-full border border-[var(--border)] bg-white px-2.5 py-1 font-mono text-[11px]">Pilot: 4 stores • Asbury precedent</span>
        </div>
      </div>

      {/* legal runbook */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px]">
        <span className="inline-flex items-center gap-1.5 font-semibold"><LockKey size={14} className="text-amber-700" /> Legal runbook</span>
        <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[11px] border">AZ HB 2418</span><span className="rounded-full bg-white px-2 py-0.5 font-mono text-[11px] border">MT SB 411</span><span className="rounded-full bg-white px-2 py-0.5 font-mono text-[11px] border">OR data law</span>
        <span className="text-amber-800">Georgia injunction precedent — if incumbent withholds data, automated request package cites dealer-data law.</span>
        <span className="ml-auto rounded-full bg-zinc-900 px-2 py-0.5 font-mono text-[11px] font-semibold text-white">Dealer data is dealer&apos;s</span>
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
              {stage===5 && <span><span className="font-semibold">6 — Parallel Run:</span> Store operates CDK for accounting while transactions mirrored into AutoCore • daily parity report (deals/ROs/receipts) • go/no-go after ≥14 days parity. Currently Day {currentDay}/14 • {isGo ? "GO" : "No-go"}.</span>}
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
            <motion.div initial="hidden" animate="visible" variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.08 } } }} className="divide-y divide-[var(--border)]">
              {extractors.map((e,i)=>(
                <motion.div key={e.id} variants={{ hidden:{opacity:0,y:6}, visible:{opacity:1,y:0} }} className={cn("flex w-full items-start gap-3 px-4 py-3 text-left", ext===i && "bg-[var(--accent-muted)]")}>
                  <button onClick={()=>setExt(i)} className={cn("mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl text-white", e.status==="done"? "bg-emerald-600": e.status==="progress"? "bg-amber-500 text-black":"bg-zinc-300 text-zinc-600")}>
                    {e.status==="done"? <CheckCircle size={16} weight="fill" />: e.status==="progress"? <Clock size={16} weight="bold" />: <Database size={16} />}
                  </button>
                  <button onClick={()=>setExt(i)} className="min-w-0 flex-1 text-left">
                    <span className="flex items-center gap-2"><span className="text-[13px] font-semibold">{e.name}</span><span className="rounded-full bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-white">{e.src}</span><span className={cn("ml-auto rounded-full px-1.5 py-0.5 font-mono text-[11px] font-bold", e.status==="done"? "bg-emerald-50 text-emerald-700 border border-emerald-200": e.status==="progress"?"bg-amber-50 text-amber-800 border border-amber-200":"bg-zinc-100 text-zinc-500")}>{e.pct}%</span></span>
                    <span className="block text-[11px] leading-snug text-[var(--text-muted)]">{e.coverage}</span>
                    <span className="mt-1 block font-mono text-[11px] text-[var(--text-faint)]">{e.note}</span>
                    <span className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-full bg-zinc-100"><motion.span layout className={cn("block h-full rounded-full", e.status==="done"? "bg-emerald-500": e.status==="progress"?"bg-amber-500":"bg-zinc-300")} style={{width:`${e.pct}%`}} transition={{ duration:0.6, ease:"easeOut" }} /></span>
                  </button>
                  <div className="ml-2 flex shrink-0 flex-col gap-1">
                    <Button size="sm" variant={e.status==="done" ? "outline" : "default"} className={cn("h-7 gap-1 px-2.5 text-[11px]", e.status==="done" && "bg-white")} onClick={()=>handleRunExtractor(e.id)} disabled={e.status==="done" && e.pct>=98.4}>
                      {e.status==="progress" ? <SpinnerGap size={12} className="animate-spin" /> : <Play size={12} weight="fill" />}
                      {e.status==="done" ? "Re-run" : e.status==="progress" ? "Running…" : "Run Extractor"}
                    </Button>
                    {e.status==="done" && <span className="text-center font-mono text-[10px] font-bold text-emerald-600">✓ done</span>}
                  </div>
                </motion.div>
              ))}
            </motion.div>
            <div className="flex items-center gap-2 bg-[var(--surface-muted)] px-4 py-2.5 text-[11px]"><Database size={12} /> Staging area • field-mapping workbench • load pipelines • verification-report framework<span className="ml-auto rounded-full bg-white px-2 py-0.5 font-mono shadow-sm">E13-T01</span></div>
          </div>

          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{ delay:0.15 }} className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
              <span className="inline-flex items-center gap-2 text-[12px] font-semibold"><ArrowsLeftRight size={14} className="text-[var(--accent)]" /> Mapping workbench — data-quality scoring</span>
              <Badge variant={unmapped>0 ? "warning" : "success"} className={unmapped>0 ? "bg-white" : ""}>{unmapped>0 ? `${unmapped} unmapped` : "All mapped"}</Badge>
            </div>
            <motion.div initial="hidden" animate="visible" variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.06 }}} } className="divide-y divide-[var(--border)]">
              {mappingRows.map(m=>(
                <motion.div key={m.field} variants={{ hidden:{opacity:0,x:-6}, visible:{opacity:1,x:0} }} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--surface-hover)]">
                  <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full", m.status==="ok"? "bg-emerald-500 text-white":"bg-amber-500 text-black")}>{m.status==="ok"? <CheckCircle size={12} weight="fill" />: <WarningCircle size={12} weight="fill" />}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] font-medium leading-none">{m.field}</span>
                    <span className="block font-mono text-[11px] text-[var(--text-muted)]">{m.source} → {m.target}</span>
                  </span>
                  <span className="text-right"><span className={cn("rounded-full px-2 py-0.5 font-mono text-[11px] font-bold", m.status==="ok"? "bg-emerald-50 text-emerald-700 border border-emerald-200":"bg-amber-50 text-amber-800 border border-amber-200")}>{m.score}</span><span className="block font-mono text-[10px] text-[var(--text-faint)]">{m.issues} issues</span></span>
                  <Button size="sm" variant={m.status==="warn" ? "default" : "outline"} className={cn("ml-2 h-7 gap-1 px-2.5 text-[11px] shrink-0", m.status==="ok" && "bg-white text-zinc-600 border") } onClick={()=>handleFix(m.field)} disabled={m.status==="ok"}>
                    {m.status==="warn" ? "Remediate" : <><Check size={12} weight="bold" /> Fixed</>}
                  </Button>
                </motion.div>
              ))}
            </motion.div>
            <div className="flex gap-2 bg-[var(--surface-muted)] p-3"><Button size="sm" className="flex-1 gap-1" onClick={()=>setToast("Opening mapping workbench…")}><Eye size={12} /> Open workbench</Button><Button size="sm" variant="outline" className="bg-white gap-1 flex-1" onClick={()=>setToast(`Remediation list • ${unmapped} fields pending`)}>Remediation list</Button></div>
          </motion.div>
        </div>

        {/* right: verification + parallel run + cutover */}
        <div className="space-y-4">
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{ delay:0.2 }} className="overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50/50 shadow-sm">
            <div className="flex items-center justify-between bg-emerald-600 px-4 py-3 text-white">
              <span className="inline-flex items-center gap-2 text-[12px] font-semibold"><ShieldCheck size={14} weight="fill" /> Verification — penny &amp; bin exact</span>
              <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-700">{verification.status}</span>
            </div>
            <div className="space-y-3 p-4">
              <div className="rounded-xl border border-emerald-200 bg-white p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[12px] font-semibold"><Bank size={14} className="text-emerald-600" /> Trial balance — GL</div>
                  <Button size="sm" variant="outline" className="h-7 gap-1 bg-white text-[11px]" onClick={handleVerify} disabled={verifying}>
                    {verifying ? <SpinnerGap size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                    {verifying ? "Verifying…" : "Verify"}
                  </Button>
                </div>
                <div className="mt-1 flex items-baseline gap-2"><span className="font-mono text-[18px] font-[700]">${verification.trialBalance.toFixed(2)}</span><span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[11px] font-bold text-white">variance</span><span className="font-mono text-[11px] text-[var(--text-muted)]">Matches source to penny • {verification.jeValidated}</span></div>
                <div className="mt-1 h-1.5 rounded-full bg-zinc-100 overflow-hidden"><div className="h-full w-full bg-emerald-500" /></div>
                {verification.verifiedAt && <div className="mt-1 font-mono text-[10px] text-[var(--text-faint)]">Verified {new Date(verification.verifiedAt).toLocaleString()}</div>}
              </div>
              <div className="rounded-xl border border-emerald-200 bg-white p-3">
                <div className="flex items-center gap-2 text-[12px] font-semibold"><Package size={14} className="text-emerald-600" /> Parts on-hand by bin</div>
                <div className="mt-1 flex items-baseline gap-2"><span className="font-mono text-[18px] font-[700]">{verification.binsExact.toLocaleString()}</span><span className="font-mono text-[12px]">SKUs •</span><span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[11px] font-bold text-white">by-bin exact</span><span className="ml-auto"><Button size="sm" variant="outline" className="h-7 gap-1 bg-white text-[11px]" onClick={handleVerify}><Package size={12} /> Re-verify</Button></span></div>
                <div className="font-mono text-[11px] text-[var(--text-muted)]">On-hand {verification.binsExact.toLocaleString()} • Allocated 18 • On-order 42 • no double-count (Tekion lesson)</div>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-white p-3">
                <div className="flex items-center gap-2 text-[12px] font-semibold"><Wrench size={14} className="text-emerald-600" /> Open ROs &amp; CIT</div>
                <div className="mt-1 font-mono text-[12px]">6 ROs • 7 CIT • totals match • parity 100%</div>
                <div className="text-[11px] text-[var(--text-muted)]">Verification report framework • per-domain scoring</div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{ delay:0.25 }} className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
              <span className="inline-flex items-center gap-2 text-[12px] font-semibold"><Clock size={14} className="text-[var(--accent)]" /> Parallel run — daily parity 14d</span>
              <span className={cn("rounded-full px-2 py-0.5 font-mono text-[11px] shadow-sm border", isGo ? "bg-emerald-500 text-white border-emerald-600" : "bg-white")}>
                Day {currentDay}/14 • {isGo ? "GO ✅" : "go/no-go pending"}
              </span>
            </div>
            <div className="p-4">
              <div className="flex items-end gap-[3px]">
                {parallel.days.map((d)=>{
                  const active = d.parity===100 && d.day <= currentDay
                  return (
                    <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                      <span className={cn("text-[10px] font-mono font-bold min-h-[12px]", active? "text-emerald-700":"text-zinc-400")}>{active? "100%":""}</span>
                      <motion.div layout transition={{ type:"spring", stiffness:300, damping:28 }} className={cn("w-full rounded-t-[4px]", active?"bg-emerald-500":"bg-zinc-200")} style={{height:`${d.height ? d.height*0.6 : 8}px`}} title={active? "parity 100%":"pending"} />
                      <span className="font-mono text-[10px] text-[var(--text-faint)]">{d.day}</span>
                    </div>
                  )
                })}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 border border-emerald-200 font-medium">Deals 12/12</span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 border border-emerald-200 font-medium">ROs 6/6</span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 border border-emerald-200 font-medium">Receipts matched</span>
                <span className={cn("ml-auto rounded-full px-2 py-0.5 font-mono text-[10px] font-bold", isGo ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-500 border")}>{isGo ? "GO" : "NO-GO"}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" className="flex-1 gap-1" onClick={handleAdvance} disabled={currentDay>=14}>
                  <Clock size={12} /> Advance Day — {currentDay}/14 → {Math.min(14,currentDay+1)}/14
                </Button>
                <Badge variant={isGo ? "success" : "warning"} className="px-2.5">{isGo ? "GO ✅" : "No-go"}</Badge>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{ delay:0.3 }} className="overflow-hidden rounded-xl border border-zinc-900 bg-zinc-900 text-white">
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 text-[12px] font-semibold"><Clock size={14} className="text-sky-400" /> Cutover runbook — &lt;72h weekend</div>
              <div className="mt-1 text-[11px] text-zinc-400">Fri 18:00 freeze → delta extract → load → verify → Mon 08:00 open on AutoCore. {isLive ? "Status LIVE • " + (cutover.executedAt ? new Date(cutover.executedAt).toLocaleString() : "") : isRolledBack ? "Rolled back • CDK authoritative" : "Rollback documented."}</div>
              {isLive && cutoverVehicles.length>0 && <div className="mt-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/20 px-2.5 py-1.5 font-mono text-[10px] text-emerald-300">vehicles transferHistory shows cutover • {cutoverVehicles.length} vehicles • {cutover.executedAt?.slice(0,10)} • live</div>}
            </div>
            <div className="mx-3 mb-3 flex items-center gap-1 rounded-xl bg-white/5 border border-white/10 p-2 text-[11px]">
              <span className="flex-1 text-center"><span className="block font-semibold">Fri 18:00</span><span className="font-mono text-zinc-400">Freeze</span></span>
              <ArrowRight size={12} className="text-zinc-500" />
              <span className="flex-1 text-center"><span className="block font-semibold">Sat 02:00</span><span className="font-mono text-zinc-400">Delta</span></span>
              <ArrowRight size={12} className="text-zinc-500" />
              <span className="flex-1 text-center"><span className="block font-semibold">Sat 10:00</span><span className="font-mono text-zinc-400">Verify</span></span>
              <ArrowRight size={12} className="text-zinc-500" />
              <span className={cn("flex-1 text-center rounded-full py-1 font-bold", isLive ? "bg-emerald-500" : "bg-emerald-500/80")}>Mon 08:00 Open {isLive && "✓"}</span>
            </div>
            <div className="mx-3 mb-3 flex gap-2">
              <Button size="sm" variant="secondary" className="flex-1 bg-white text-zinc-900 gap-1 text-[11px] hover:bg-zinc-100" onClick={handleCutover} disabled={isLive}>
                <Play size={12} weight="fill" /> {isLive ? "Cutover LIVE" : "Execute Cutover"}
              </Button>
              <Button size="sm" variant="outline" className="border-white/15 bg-transparent text-white gap-1 text-[11px] hover:bg-white/10" onClick={()=>setShowRollback(true)}><FileText size={12} /> Rollback plan</Button>
            </div>
          </motion.div>

          <div className="rounded-xl border border-[var(--border)] bg-white p-3.5">
            <div className="flex items-center gap-2 text-[12px] font-semibold"><Users size={14} /> Training &amp; certification gating</div>
            <div className="mt-1 text-[11px] text-[var(--text-muted)]">Role courses + sandbox practice tenants • no go-live until certified. 24 staff • 18 certified • 6 in-progress.</div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100"><div className="h-full w-[75%] bg-[var(--accent)] rounded-full" /></div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2.5 text-center font-mono text-[10px] tracking-wide text-[var(--text-faint)]">
        E13 • Migration-as-a-product • 68% pilot • Legal runbook • Extractors {extractors.find(e=>e.id==="cdk")?.pct}% • Mapping 99.2% bins • Parallel {currentDay}/14 • Cutover {isLive ? "LIVE <72h" : "<72h"} • Asbury 12% higher performance
        {cutover.executedAt && <span className="ml-1">• cutover {new Date(cutover.executedAt).toLocaleDateString()}</span>}
      </div>
    </div>
  )
}
function Calendar({ size, className }: { size:number; className?:string }){
  return <Clock size={size} className={className} />
}
