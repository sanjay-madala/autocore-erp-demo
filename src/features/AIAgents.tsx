import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  Robot, Phone, ChatsCircle, Lightning, Sparkle, ShieldCheck, WarningCircle, CheckCircle, Clock, Eye, Play, Copy, TrendUp, Wrench, CurrencyDollar, ChatCircleDots, Microphone, Brain
} from "@phosphor-icons/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const CALLS = [
  { id:"C-881", from:"248-555-0143 Marcus Chen", intent:"Sales • 2024 Camry", transcript:"AI: Hi Marcus, thanks for calling Sovereign Toyota... Are you looking for sales or service? Customer: Sales, the Camry online... AI: Still available, want 2pm today? I can bridge you now. Customer: Yes please.", dur:"00:47", score:92, sent:"positive", verdict:"Bridged to J. Alvarez — whisper: Marcus + Camry + prior RAV4" },
  { id:"C-882", from:"248-555-0311 Amara Okafor", intent:"Service • Recall", transcript:"AI: Hi Amara, I see your RAV4 has an open recall — want Tuesday 10? Customer: Yes. AI: Booked. Confirmation sent.", dur:"01:12", score:88, sent:"neutral", verdict:"Booked appt Tue 10 • capacity-aware • SMS conf" },
]
const SPEED = [
  { t:"0s", label:"Lead ingress", desc:"OEM/Website API inbound", color:"bg-zinc-900" },
  { t:"<5s", label:"Dedup + assign", desc:"M-008 cluster • J. Alvarez", color:"bg-emerald-600" },
  { t:"22s", label:"AI first SMS", desc:"'Hi — Camry still here, 2pm or 4pm?'", color:"bg-[var(--accent)]" },
  { t:"47s", label:"Bridge human", desc:"Warm transfer • whispered context", color:"bg-sky-600" },
]
const COPILOTS = [
  { k:"F&I Copilot", icon:CurrencyDollar, tip:"Deal D-1041: bump rate 6.49 → 6.99 + add GAP → PVR +$620, payment +$11, still within guardrail. Accept?", guard:"Menu cap $3,200", roi:"+$620 PVR" },
  { k:"Service Copilot", icon:Wrench, tip:"RAV4 67k: deferred brake front (yellow, 4mm) from last RO-8812 • mileage since 11k → surface now. Tech: add to MPI.", guard:"Prev decline", roi:"+$230 avg RO" },
  { k:"Conversational BI", icon:ChatCircleDots, tip:"Ask: 'Gross per tech this month?' → Tech Rivera $18.4k flag • sorted. Ask anything — customers, deals, ROs, GL.", guard:"T1 • NL query", roi:"Natural language" },
]

export default function AIAgents(){
  const [tab,setTab]=useState(0)
  const [copied,setCopied]=useState(false)
  const [playing,setPlaying]=useState(false)
  return (
    <div className="mx-auto max-w-[1440px] space-y-4 p-4 lg:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-[22px] font-[700] tracking-[-0.03em]">Intelligence</h1><Badge variant="success" className="gap-1"><Sparkle size={12} weight="fill" /> Native AI</Badge><span className="hidden md:inline rounded-full bg-zinc-900 px-2 py-0.5 font-mono text-[10px] font-semibold text-white">E10 • Vendor-agnostic • F5/F6</span></div>
          <p className="mt-1 text-[12.5px] text-[var(--text-muted)]">Acts on the unified data — answers missed calls, bridges leads in &lt;60s, books service, assists F&I. Not bolt-on.</p>
        </div>
        <div className="flex items-center gap-2"><Badge variant="neutral" className="bg-white gap-1"><Brain size={12} /> ML/LLM agnostic</Badge><Badge variant="success" className="gap-1"><ShieldCheck size={12} weight="fill" /> ISO 42001</Badge></div>
      </div>

      {/* top agnostic banner */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--accent-border)] bg-[var(--accent-muted)] px-4 py-3 text-[12px]">
        <span className="inline-flex items-center gap-1.5 font-semibold"><Robot size={16} className="text-[var(--accent)]" /> AI platform</span>
        <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[11px] shadow-sm">Vendor-agnostic • Azure OpenAI today, any LLM tomorrow</span>
        <span className="font-mono text-[11px] text-[var(--text-muted)]">Guardrails • prompt versioning • full action log • human override</span>
        <span className="ml-auto hidden rounded-full bg-zinc-900 px-2 py-0.5 font-mono text-[11px] font-semibold text-white md:inline-flex">74% dealers want voice agents — #1 ask</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Voice Agent */}
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-zinc-950 text-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between px-4 py-3"><span className="inline-flex items-center gap-2 text-[13px] font-semibold"><Phone size={16} weight="fill" className="text-emerald-400" /> Voice Agent — missed-call recovery</span><span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px]">F5 • answers in &lt;30s</span></div>
          <div className="px-4 pb-4 space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              {CALLS.map(c=>(
                <div key={c.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center gap-2"><span className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] font-bold text-zinc-900">{c.id}</span><span className="text-[12px] font-medium">{c.from}</span><span className="ml-auto rounded-full border border-white/15 bg-white/10 px-1.5 py-0.5 font-mono text-[10px]">{c.dur}</span></div>
                  <div className="mt-1 inline-flex rounded-full bg-white/10 px-2 py-0.5 text-[11px]">{c.intent}</div>
                  <div className="mt-2 rounded-xl bg-zinc-900 p-2.5 font-mono text-[11px] leading-relaxed text-zinc-300">{c.transcript.slice(0,160)}…</div>
                  <div className="mt-2 flex items-center gap-2 text-[11px]">
                    <span className={cn("rounded-full px-2 py-0.5 font-semibold", c.score>=90?"bg-emerald-500":"bg-amber-500 text-black")}>{c.score} • {c.sent}</span>
                    <span className="font-mono text-zinc-400">Talk ratio 32/68 • compliance ✓</span>
                  </div>
                  <div className="mt-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 text-[11px] leading-snug text-emerald-300">{c.verdict}</div>
                  <div className="mt-2 flex gap-1.5"><Button size="sm" variant="secondary" className="h-7 bg-white text-zinc-900 gap-1 text-[11px]"><Play size={12} weight="fill" /> Play {c.dur}</Button><Button size="sm" variant="outline" className="h-7 border-white/15 bg-transparent text-white gap-1 text-[11px]"><Copy size={12} /> Transcript</Button></div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-[11px]">
              <ShieldCheck size={14} className="text-emerald-400" /> Two-party consent enforced by state • disclosure + recording notice auto • human handoff when confidence low
              <span className="ml-auto rounded-full bg-white px-2 py-0.5 font-mono text-[11px] font-semibold text-zinc-900">Managed • logged with model/version</span>
            </div>
          </div>
        </div>

        {/* Speed-to-lead dial */}
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
            <span className="inline-flex items-center gap-2 text-[12px] font-semibold"><Lightning size={14} className="text-amber-500" /> Speed-to-lead — &lt;60s SLA</span>
            <Badge variant="success" className="bg-white">F6 • 42s avg</Badge>
          </div>
          <div className="p-4">
            <div className="relative">
              <div className="absolute left-[14px] top-[8px] bottom-[8px] w-px bg-[var(--border-strong)]" />
              {SPEED.map((s,i)=>(
                <div key={s.t} className="relative flex gap-3 py-2">
                  <span className={cn("relative z-10 grid h-7 w-7 place-items-center rounded-full text-white font-mono text-[11px] font-bold", s.color)}>{i+1}</span>
                  <div className="min-w-0 rounded-xl border border-[var(--border)] bg-white px-3 py-2">
                    <div className="flex items-baseline gap-2"><span className="rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-[11px] font-bold text-white">{s.t}</span><span className="text-[12px] font-semibold">{s.label}</span></div>
                    <div className="text-[11px] leading-snug text-[var(--text-muted)]">{s.desc}</div>
                  </div>
                </div>
              ))}
              <div className="mt-2 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-[11px]"><CheckCircle size={14} weight="fill" className="text-emerald-600" /> SLA met • 47s to bridge • 24/7 even after hours — AI handles to appointment</div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-zinc-900 p-2.5 text-white"><div className="font-mono text-[16px] font-[700]">22s</div><div className="text-[10px] tracking-widest text-zinc-400">AI SMS</div></div>
              <div className="rounded-xl bg-zinc-900 p-2.5 text-white"><div className="font-mono text-[16px] font-[700]">47s</div><div className="text-[10px] tracking-widest text-zinc-400">BRIDGE</div></div>
              <div className="rounded-xl bg-emerald-600 p-2.5 text-white"><div className="font-mono text-[16px] font-[700]">&lt;60s</div><div className="text-[10px] tracking-widest text-white/80">SLA</div></div>
            </div>
          </div>
        </div>
      </div>

      {/* scoring + copilots */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
            <span className="inline-flex items-center gap-2 text-[12px] font-semibold"><Microphone size={14} className="text-[var(--accent)]" /> Call recording &amp; AI scoring</span>
            <Badge variant="neutral" className="bg-white">8 calls today</Badge>
          </div>
          <div className="p-3.5">
            <div className="flex gap-1">
              {(["All","Coaching","Sales","Service"] as const).map(t=> (
                <button key={t} onClick={()=>setTab(t==="All"?0:t==="Coaching"?1:t==="Sales"?2:3)} className={cn("rounded-lg px-2.5 py-1.5 text-[11px] font-semibold", tab===(t==="All"?0:t==="Coaching"?1:t==="Sales"?2:3) ? "bg-zinc-900 text-white":"bg-white border text-zinc-500")}>{t}</button>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
                <div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-zinc-900 text-white font-bold text-[11px]">JC</span><span className="flex-1"><span className="block text-[12px] font-semibold">Marcus Chen • 09:15 • 02:18</span><span className="block font-mono text-[11px] text-[var(--text-muted)]">J. Alvarez • inbound bridged</span></span><span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[12px] font-bold text-white">92/100</span></div>
                <div className="mt-2 grid grid-cols-3 gap-1.5 text-center font-mono text-[11px]"><span className="rounded-full bg-white py-1 border">Sentiment +</span><span className="rounded-full bg-white py-1 border">Talk 32/68</span><span className="rounded-full bg-emerald-50 py-1 border border-emerald-200 text-emerald-700">Compliance 100</span></div>
                <div className="mt-2 flex gap-1.5">
                  <Button size="sm" className="gap-1 flex-1" onClick={()=>setPlaying(!playing)}>{playing? <><Clock size={12} className="animate-spin" /> Playing 02:18</>:<><Play size={12} weight="fill" /> Play</>}</Button>
                  <Button size="sm" variant="outline" className="bg-white gap-1"><Eye size={12} /> Transcript</Button>
                  <Button size="sm" variant="outline" className="bg-white gap-1"><TrendUp size={12} /> Coach</Button>
                </div>
                <AnimatePresence>
                  {playing && (
                    <motion.div initial={{height:0, opacity:0}} animate={{height:"auto", opacity:1}} exit={{height:0, opacity:0}} className="mt-2 overflow-hidden rounded-xl border border-[var(--border)] bg-white p-2.5 font-mono text-[11px] leading-relaxed text-[var(--text-secondary)]">AI: Hi Marcus... Customer: Sales... AI: Still available... [00:42] Bridge whisper: Marcus Chen, Camry XSE, prior RAV4 service — J. Alvarez now connected. Full transcript logged • scoring drives manager dashboard • missed-call recovery rate ↑</motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="rounded-xl border border-dashed border-[var(--border-strong)] bg-white px-3 py-2 text-[11px] text-[var(--text-muted)]">Manager dashboard: recovery rate 67% • Avg score 84 • 3 low-score coaching queue</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {COPILOTS.map(c=>(
            <div key={c.k} className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
              <div className="flex items-center justify-between bg-zinc-900 px-4 py-2.5 text-white"><span className="inline-flex items-center gap-2 text-[12px] font-semibold"><c.icon size={14} weight="bold" className="text-sky-400" /> {c.k}</span><Badge variant="success" className="bg-white text-zinc-900 gap-1"><Sparkle size={12} weight="fill" className="text-[var(--accent)]" /> Suggestion</Badge></div>
              <div className="p-3.5">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-[12px] leading-relaxed">{c.tip}</div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]"><span className="rounded-full bg-white border px-2 py-0.5">Guardrail: {c.guard}</span><span className="rounded-full bg-emerald-500 px-2 py-0.5 font-semibold text-white">{c.roi}</span><Button size="sm" variant="outline" className="ml-auto h-6 bg-white gap-1" onClick={()=>{setCopied(true); setTimeout(()=>setCopied(false),1200)}}><Copy size={12} /> Use</Button></div>
              </div>
            </div>
          ))}
          <div className="rounded-xl border border-[var(--accent-border)] bg-[var(--accent-muted)] px-4 py-3 text-[11px]"><span className="font-semibold">Governance:</span> Every AI action logged with model/version • human-override path • two-party-consent enforced by state • ROI tracked (dealers demand proof)</div>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2.5 text-center font-mono text-[10px] tracking-wide text-[var(--text-faint)]">E10 • Vendor-agnostic • 3 agents ship on unified data • Responsible AI ISO 42001 • Not bolt-on • Logged + governed</div>
    </div>
  )
}
