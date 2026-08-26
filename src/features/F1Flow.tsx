import { useStore } from "@/lib/store"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "motion/react"
import { CheckCircle, Clock, ArrowRight, Lightning, ShieldCheck, Bank, FileText, CaretRight, WarningCircle } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

const STEPS = [
  { id:"lead", label:"1 Lead ingress", detail:"Website VIN → dedup <5s • assign J. Alvarez • alert" },
  { id:"appointment", label:"2 AI bridge <60s", detail:"AI SMS 20s → warm bridge 47s • whisper context • appt Thu 10:30" },
  { id:"pencil", label:"3-4 Mobile open & test drive", detail:"Same customer/deal record on mobile — no re-keying • test drive logged" },
  { id:"desked", label:"5 Desked", detail:"Real lender rates • taxes/fees • counter-offers • customer accepts" },
  { id:"credit", label:"6-7 Trade + Credit", detail:"ACV $18.2k / payoff $14.1k → Dealertrack submit" },
  { id:"menu", label:"8 F&I Menu", detail:"docuPAD — VSC/GAP/Tire • disclosures logged • audit E12" },
  { id:"contract", label:"9 eContract", detail:"eSign in-store/remote → lender submitted • funding tracked → CIT" },
  { id:"delivered", label:"10-12 Deliver → GL → Lifecycle", detail:"Floorplan payoff • CIT cleared • commission • Vitu title • welcome campaign" },
]

export default function F1Flow(){
  const { deals, activeDealId, setActiveDeal, updatePencil, acceptDeal, submitCredit, toggleFi, submitContract, deliverDeal, vehicles } = useStore()
  const deal = deals.find(d=>d.id===activeDealId) || deals[0]
  const [down,setDown]=useState(3000)

  const pencilCalc = () => {
    const price = deal.pencil?.price || 48200
    const rate = 6.49/100/12, n=72, pv = price - down
    const m = Math.round(pv * rate / (1 - Math.pow(1+rate,-n)))
    return { monthly: m, gross: 2410 + Math.round(down/100) }
  }

  return (
    <div className="mx-auto max-w-[1440px] space-y-4 p-4 lg:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-[22px] font-[700] tracking-[-0.03em]">F1 — New Vehicle Sale</h1><Badge variant="success" className="gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-700 animate-pulse" /> LIVE OBJECT</Badge><span className="hidden md:inline rounded-full bg-zinc-900 px-2 py-0.5 font-mono text-[10px] font-semibold text-white">lead → desk → F&I → delivery → GL</span></div>
          <p className="mt-1 text-[12.5px] text-[var(--text-muted)]">One deal object through 12 steps — same record from website to showroom, no re-keying (97% fix). Mutations post to GL real-time.</p>
        </div>
        <select aria-label="Deal selector" value={deal.id} onChange={e=>setActiveDeal(e.target.value)} className="rounded-xl border border-[var(--border)] bg-white px-3 py-1.5 font-mono text-[12px]">
          {deals.map(d=> <option key={d.id} value={d.id}>{d.id} • {d.customerName} • {d.vehicleLabel} • {d.stage}</option>)}
        </select>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
            <div className="bg-zinc-900 px-4 py-3 text-white text-[12px] font-semibold">Deal object — single source</div>
            <div className="p-3.5 space-y-2 text-[12px]">
              <div className="flex justify-between"><span className="font-mono text-[11px] text-[var(--text-muted)]">DEAL</span><span className="font-mono font-bold">{deal.id} • {deal.stockNo}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-muted)]">Customer</span><span className="font-medium">{deal.customerName}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-muted)]">Vehicle</span><span className="font-medium truncate max-w-[160px]">{deal.vehicleLabel}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-muted)]">VIN</span><span className="font-mono text-[11px]">{deal.vin.slice(-6)}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-muted)]">Rooftop</span><Badge variant="neutral" className="bg-white">{deal.rooftop}</Badge></div>
              <div className="flex justify-between items-center"><span className="text-[var(--text-muted)]">Stage</span><Badge variant={deal.stage==="delivered"?"success": deal.stage==="lead"?"warning":"neutral"} className="capitalize">{deal.stage}</Badge></div>
              <div className="rounded-xl bg-[var(--surface-muted)] p-2.5 font-mono text-[11px] leading-relaxed">{deal.timeline.slice(-1)[0]?.label || "—"}</div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
            <div className="px-4 py-2.5 text-[12px] font-semibold border-b bg-[var(--surface-muted)]">F1 Steps — click to advance</div>
            <div className="divide-y">
              {STEPS.map((s,i)=>{
                const idx = STEPS.findIndex(x=> x.id===deal.stage || (deal.stage==="pencil" && s.id==="pencil") || (deal.stage==="credit" && s.id==="credit"))
                const done = ["lead","appointment","pencil","desked","credit","menu","contract","delivered"].indexOf(deal.stage) >= i
                const cur = deal.stage === s.id || (s.id==="pencil" && deal.stage==="pencil")
                return (
                  <div key={s.id} className={cn("flex gap-3 px-3 py-2.5", cur && "bg-[var(--accent-muted)]")}>
                    <span className={cn("mt-0.5 grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold", done? "bg-emerald-700 text-white": cur? "bg-[var(--accent)] text-white":"bg-zinc-200 text-zinc-600")}>{done? <CheckCircle size={14} weight="fill" />: i+1}</span>
                    <span className="min-w-0 flex-1"><span className="block text-[12px] font-medium leading-none">{s.label}</span><span className="block text-[11px] leading-snug text-[var(--text-muted)]">{s.detail}</span></span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* live controls */}
          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b bg-[var(--surface-muted)] px-4 py-3"><span className="text-[12px] font-semibold inline-flex items-center gap-2"><Lightning size={14} className="text-amber-700" /> Live pencil — &lt;500ms</span><span className="rounded-full bg-emerald-700 px-2 py-0.5 text-[11px] font-bold text-white">p95 42ms</span></div>
            <div className="p-4 grid gap-3 md:grid-cols-3">
              <label className="text-[11px]">Down<input type="range" min={0} max={12000} step={500} value={down} onChange={e=>setDown(Number(e.target.value))} className="w-full" /><span className="font-mono font-bold">${down.toLocaleString()}</span></label>
              <div className="rounded-xl bg-zinc-900 p-3 text-white text-center"><div className="font-mono text-[10px] tracking-widest text-zinc-400">MONTHLY</div><div className="font-mono text-[20px] font-[700]">${pencilCalc().monthly}/mo</div><div className="text-[11px] text-zinc-400">72m • 6.49%</div></div>
              <div className="rounded-xl bg-[var(--accent-muted)] border border-[var(--accent-border)] p-3 text-center"><div className="font-mono text-[10px] tracking-widest text-[var(--text-muted)]">GROSS</div><div className="font-mono text-[20px] font-[700]">${pencilCalc().gross}</div><Button size="sm" className="mt-1 w-full gap-1" onClick={()=>{updatePencil(deal.id, { price:48200, rate:6.49, term:72, down, tax:1890, fees:489, monthly:pencilCalc().monthly, gross:pencilCalc().gross })}}>Update pencil <ArrowRight size={12} /></Button></div>
            </div>
            <div className="px-4 pb-4 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={()=>acceptDeal(deal.id)} disabled={deal.stage==="desked" || deal.stage==="delivered"}>Customer accepts → Desked <CheckCircle size={12} weight="fill" /></Button>
              <Button size="sm" variant="outline" onClick={()=>submitCredit(deal.id)} disabled={deal.stage==="credit" || deal.stage==="delivered"}>Submit Dealertrack → Approved <Bank size={12} /></Button>
              <div className="flex gap-1">
                {["VSC","GAP","Tire","Dent"].map(p=>(
                  <button key={p} onClick={()=>toggleFi(deal.id,p)} className={cn("rounded-full border px-2.5 py-1 text-[11px] font-medium", deal.fiMenu[p]? "bg-emerald-700 text-white border-emerald-700":"bg-white border-zinc-300 text-zinc-700")}>{p} {deal.fiMenu[p]? "✓":"+"}</button>
                ))}
              </div>
              <Button size="sm" variant="outline" onClick={()=>submitContract(deal.id)} disabled={deal.stage==="contract" || deal.stage==="delivered"}>eContract submit → CIT <FileText size={12} /></Button>
              <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 gap-1 text-white" onClick={()=>deliverDeal(deal.id)} disabled={deal.stage==="delivered"}>DELIVER → GL post <ShieldCheck size={12} weight="fill" /></Button>
            </div>
          </div>

          {/* GL live posting */}
          <AnimatePresence mode="wait">
            <motion.div key={deal.stage+String(deal.glPosted)} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} className={cn("overflow-hidden rounded-xl border shadow-sm", deal.glPosted? "border-emerald-200 bg-emerald-50/60":"border-amber-200 bg-amber-50/50")}>
              <div className={cn("flex items-center justify-between px-4 py-3 text-white", deal.glPosted? "bg-emerald-700":"bg-amber-700 text-white")}><span className="inline-flex items-center gap-2 text-[12px] font-semibold"><Bank size={14} weight="fill" /> GL posting — E2 real-time</span><Badge variant="neutral" className="bg-white text-zinc-900">{deal.glPosted? "POSTED • 0.8s":"PENDING"}</Badge></div>
              <div className="p-4 grid gap-2 text-[12px]">
                <div className="rounded-xl bg-white border p-3 font-mono text-[11px]">DELIVERY → floorplan payoff queued • CIT {deal.funding.cit? `$${deal.funding.cit.toLocaleString()}`:"—"} {deal.glPosted? "→ CLEARED • commission accrued":"• pending"} {deal.glPosted? "• 0 variance":""}</div>
                <div className="flex flex-wrap gap-1.5 text-[11px]"><span className="rounded-full bg-white border px-2 py-0.5">JE-20441 Dr CIT / Cr Sales</span><span className="rounded-full bg-white border px-2 py-0.5">Schedules self-reconcile</span><span className={cn("rounded-full px-2 py-0.5 font-bold", deal.glPosted? "bg-emerald-700 text-white":"bg-zinc-900 text-white")}>{deal.glPosted? "CIT $0 • closed":"CIT $48,200 • funding"}</span></div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* timeline */}
          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
            <div className="px-4 py-3 text-[12px] font-semibold border-b bg-[var(--surface-muted)]">Audit timeline — every mutation logged (Safeguards)</div>
            <div className="divide-y max-h-[220px] overflow-auto">
              {deal.timeline.map((t,i)=>(
                <div key={i} className="flex gap-2.5 px-4 py-2"><span className="font-mono text-[11px] text-[var(--text-muted)]">{t.t}</span><span className="h-1.5 w-1.5 mt-1.5 rounded-full bg-[var(--accent)]" /><span className="text-[12px] leading-snug">{t.label}</span></div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-dashed bg-[var(--surface-muted)] px-4 py-2.5 text-center font-mono text-[10px] tracking-wide text-[var(--text-faint)]">F1 wired — single deal object, no re-keying • Inventory sold lock • Accounting CIT live • 12 steps auditable</div>
        </div>
      </div>
    </div>
  )
}
