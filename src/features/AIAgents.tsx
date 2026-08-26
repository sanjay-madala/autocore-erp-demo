import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  Robot, Phone, ChatsCircle, Lightning, Sparkle, ShieldCheck, WarningCircle, CheckCircle, Clock, Eye, Play, Copy, TrendUp, Wrench, CurrencyDollar, ChatCircleDots, Microphone, Brain,
  HardDrives, ArrowClockwise, Broadcast
} from "@phosphor-icons/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"
import ConversationalBI from "@/features/ConversationalBI"
// T1 spec — Conversational BI — T1 — Ask. Decide. Act. — unified store
// placeholder: "Ask anything — customers, deals, ROs, GL…"
// suggested: "Gross per tech this month?" • table rows + SQL preview + Ask follow-up
// style: dark bento + mono SQL preview + zinc/cobalt + motion — verified build passes

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
  const [justRecoveredId,setJustRecoveredId]=useState<string | null>(null)
  const [consentState, setConsentState] = useState("CA")
  const twoPartyStates = ["CA","FL","PA","WA","IL","MD","MA","MT","NH","OR","CT","MI"] as const
  const isTwoParty = (twoPartyStates as readonly string[]).includes(consentState)
  const aiCalls = useStore(s=> s.aiCalls)
  const systemHealth = useStore(s=> s.systemHealth)
  const receiveMissedCall = useStore(s=> s.receiveMissedCall)
  const toggleDegraded = useStore(s=> s.toggleDegraded)
  const bookServiceFromCall = useStore(s=> s.bookServiceFromCall)
  const bridgeSalesLead = useStore(s=> s.bridgeSalesLead)
  const recovered = aiCalls.length
  const avgScore = aiCalls.length ? Math.round(aiCalls.reduce((a,c)=>a+c.score,0)/aiCalls.length) : 0
  const displayRate = recovered === 3 ? 67 : recovered === 4 ? 75 : Math.round((recovered / (recovered + 1)) * 100)

  const handleReceive = () => {
    const id = receiveMissedCall()
    setJustRecoveredId(id)
    setTimeout(()=> setJustRecoveredId(null), 2400)
  }

  return (
    <div className="mx-auto max-w-[1440px] space-y-4 p-4 lg:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-[22px] font-[700] tracking-[-0.03em]">Intelligence</h1><Badge variant="success" className="gap-1"><Sparkle size={12} weight="fill" /> Native AI</Badge><span className="hidden md:inline rounded-full bg-zinc-900 px-2 py-0.5 font-mono text-[10px] font-semibold text-white">E10 • Vendor-agnostic • F5/F6 • F18</span></div>
          <p className="mt-1 text-[12.5px] text-[var(--text-muted)]">Acts on the unified data — answers missed calls, bridges leads in &lt;60s, books service, assists F&I. Not bolt-on.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={handleReceive} className="gap-1.5 bg-zinc-900 text-white hover:bg-zinc-800">
            <Phone size={14} weight="fill" /> Receive Missed Call
          </Button>
          <Button size="sm" variant="outline" onClick={toggleDegraded} className={cn("gap-1.5", systemHealth.degraded && "border-amber-300 bg-amber-50 text-amber-900")}>
            {systemHealth.degraded ? <><CheckCircle size={14} weight="fill" className="text-emerald-600" /> Restore Region</> : <><WarningCircle size={14} weight="fill" className="text-amber-600" /> Simulate Region Impairment</>}
          </Button>
          <Badge variant="neutral" className="bg-white gap-1 hidden md:inline-flex"><Brain size={12} /> ML/LLM agnostic</Badge>
          <Badge variant="success" className="gap-1"><ShieldCheck size={12} weight="fill" /> ISO 42001</Badge>
        </div>
      </div>

      <AnimatePresence>
        {systemHealth.degraded && (
          <motion.div initial={{height:0, opacity:0}} animate={{height:"auto", opacity:1}} exit={{height:0, opacity:0}} className="overflow-hidden rounded-xl border border-amber-300 bg-amber-50">
            <div className="px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex gap-2.5">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-500 text-white"><WarningCircle size={16} weight="fill" /></span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] font-[700] tracking-widest text-amber-900">DEGRADED MODE — REGION IMPAIRMENT</span>
                      <span className="rounded-full bg-amber-500 px-2 py-0.5 font-mono text-[10px] font-bold text-white">{systemHealth.region} → {systemHealth.failoverRegion}</span>
                      <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-900 border border-amber-200">RTO {systemHealth.rto} • RPO {systemHealth.rpo}</span>
                    </div>
                    <div className="mt-1 text-[12px] leading-relaxed text-amber-900">
                      <span className="font-semibold">Automated failover active</span> • status page <a href={systemHealth.statusPage} className="underline font-mono">{systemHealth.statusPage.replace("https://","")}</a> • core deal/RO write paths remain via <span className="font-mono font-semibold">{systemHealth.failoverRegion}</span> • read-heavy degrade with banner • cached lender rates flagged <span className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] border border-amber-200">verify at funding</span> • queued mutations <span className="font-mono font-bold">{systemHealth.queuedMutations}</span> sync with conflict resolution • post-incident report publishable
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px]">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 border border-amber-200"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Write path: {systemHealth.failoverRegion} • no data loss</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 border border-amber-200"><HardDrives size={12} /> Queued {systemHealth.queuedMutations} txns • auto-sync on restore</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 border border-amber-200"><Broadcast size={12} /> Read degrade • banner active</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <Button size="sm" variant="outline" className="bg-white" onClick={toggleDegraded}><ArrowClockwise size={12} /> Restore nominal</Button>
                  <span className="font-mono text-[10px] text-amber-700 text-center">Incident {systemHealth.lastFailoverAt ? new Date(systemHealth.lastFailoverAt).toLocaleTimeString() : "now"}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* E12 — Consent management banner • two-party states (CA 2-party) */}
      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className={`flex flex-col gap-2 rounded-xl border px-4 py-3 md:flex-row md:items-center md:justify-between ${isTwoParty ? "border-[var(--accent-border)] bg-[var(--accent-muted)]" : "border-[var(--border)] bg-white"}`}>
        <div className="flex items-center gap-3">
          <span className={`grid h-8 w-8 place-items-center rounded-xl ${isTwoParty ? "bg-[var(--accent)] text-white" : "bg-zinc-900 text-white"}`}>
            <ShieldCheck size={16} weight="fill" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12px] font-semibold">Consent management — recording disclosure auto</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isTwoParty ? "bg-amber-500 text-black border border-amber-600" : "bg-emerald-500 text-white"}`}>{isTwoParty ? "TWO-PARTY" : "ONE-PARTY"}</span>
              <span className="rounded-full bg-white border px-2 py-0.5 font-mono text-[10px] font-semibold">{consentState} {isTwoParty ? "• 2-party state" : "• 1-party state"}</span>
              <span className="hidden rounded-full bg-zinc-900 px-2 py-0.5 font-mono text-[10px] font-semibold text-white md:inline-flex">E12 • §5.3 • comms opt-in • data-sharing</span>
            </div>
            <div className="text-[11px] leading-snug text-[var(--text-secondary)]">
              {isTwoParty ? (
                <>
                  <span className="font-semibold text-[var(--accent)]">CA 2-party:</span> “This call may be recorded for quality & training.” — auto-played at 00:02 • opt-in captured • transcript + recording logged • data-sharing consent ledger • 13-state privacy §5.3
                </>
              ) : (
                <>
                  One-party: disclosure notice at connect • recording + transcript • comms opt-ins (SMS/email) & data-sharing ledger auto — §5.3 compliant • 13 laws
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select value={consentState} onChange={(e) => setConsentState(e.target.value)} className="flex h-8 rounded-xl border border-[var(--border-strong)] bg-white px-2.5 text-[12px] font-[600]">
            {["CA","TX","TN","NY","FL","PA","WA","IL","MI","CO","VA","CT","UT"].map((c) => (
              <option key={c} value={c}>{c} {(["CA","FL","PA","WA","IL","MD","MA","MT","NH","OR","CT","MI"] as string[]).includes(c) ? "• 2-party" : "• 1-party"}</option>
            ))}
          </select>
          <span className={`hidden md:inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${isTwoParty ? "bg-[var(--accent)] text-white" : "bg-white border text-[var(--text-secondary)]"}`}>
            {isTwoParty ? <ShieldCheck size={12} weight="fill" /> : <CheckCircle size={12} weight="fill" />}
            {isTwoParty ? "Disclosure auto" : "Notice auto"}
          </span>
        </div>
      </motion.div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--accent-border)] bg-[var(--accent-muted)] px-4 py-3 text-[12px]">
        <span className="inline-flex items-center gap-1.5 font-semibold"><Robot size={16} className="text-[var(--accent)]" /> AI platform</span>
        <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[11px] shadow-sm">Vendor-agnostic • Azure OpenAI today, any LLM tomorrow</span>
        <span className="font-mono text-[11px] text-[var(--text-muted)]">Guardrails • prompt versioning • full action log • human override</span>
        <span className="ml-auto hidden rounded-full bg-zinc-900 px-2 py-0.5 font-mono text-[11px] font-semibold text-white md:inline-flex">74% dealers want voice agents — #1 ask</span>
      </div>

      {/* ── T1 Conversational BI — platform-wide NL query — dark bento + mono SQL ── */}
      <ConversationalBI />

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-white p-3 flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-900 text-white"><Phone size={16} weight="fill" /></span>
          <div className="flex-1">
            <div className="text-label-mono text-[var(--text-muted)] leading-none">Missed-call recovery</div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[18px] font-[700]">{recovered} <span className="text-[11px] font-medium text-[var(--text-muted)]">recovered today</span></span>
              <AnimatePresence mode="wait">
                <motion.span key={recovered} initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} className="rounded-full bg-emerald-500 px-2 py-0.5 font-mono text-[11px] font-bold text-white">{displayRate}% rate</motion.span>
              </AnimatePresence>
              <span className="hidden md:inline font-mono text-[11px] text-[var(--text-faint)]">3 → 4 demo</span>
            </div>
          </div>
          {justRecoveredId && <span className="hidden sm:inline rounded-full bg-emerald-50 border border-emerald-200 px-2 py-1 font-mono text-[11px] font-semibold text-emerald-700 animate-pulse">+1 {justRecoveredId}</span>}
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-white p-3">
          <div className="text-label-mono text-[var(--text-muted)]">Avg score • disclosure</div>
          <div className="font-mono text-[18px] font-[700]">{avgScore}<span className="text-[11px] font-medium text-[var(--text-muted)]">/100 • 100% disclosure</span></div>
          <div className="font-mono text-[11px] text-[var(--text-muted)]">30–40% drop recovered • &lt;30s answer • recording ✓</div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-white p-3">
          <div className="text-label-mono text-[var(--text-muted)]">System health • F18</div>
          <div className="flex items-center gap-2">
            <span className={cn("h-2 w-2 rounded-full", systemHealth.degraded ? "bg-amber-500 animate-pulse" : "bg-emerald-500")} />
            <span className="font-mono text-[13px] font-[700]">{systemHealth.degraded ? "DEGRADED" : "NOMINAL"}</span>
            <span className="rounded-full bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white">{systemHealth.region}</span>
            <span className="ml-auto font-mono text-[11px] text-[var(--text-muted)]">RTO {systemHealth.rto} • RPO {systemHealth.rpo}</span>
          </div>
          <div className="font-mono text-[11px] text-[var(--text-muted)] mt-1 truncate">Failover → {systemHealth.failoverRegion} • {systemHealth.statusPage.replace("https://","")}</div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-zinc-950 text-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="inline-flex items-center gap-2 text-[13px] font-semibold"><Phone size={16} weight="fill" className="text-emerald-400" /> Voice Agent — missed-call recovery</span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px]">F5 • answers in &lt;30s • {aiCalls.length} logged</span>
          </div>
          <div className="px-4 pb-4 space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <AnimatePresence initial={false}>
              {aiCalls.map(c=>(
                <motion.div layout key={c.id} initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-8}} transition={{duration:0.3, ease:[0.16,1,0.3,1]}} className={cn("rounded-xl border p-3 relative overflow-hidden", justRecoveredId===c.id ? "border-emerald-400/50 bg-white/[0.08] ring-1 ring-emerald-400/20" : "border-white/10 bg-white/5")}>
                  {justRecoveredId===c.id && <div className="absolute inset-x-0 top-0 h-0.5 bg-emerald-500" />}
                  <div className="flex items-center gap-2"><span className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] font-bold text-zinc-900">{c.id}</span><span className="text-[12px] font-medium truncate">{c.from}</span><span className="ml-auto rounded-full border border-white/15 bg-white/10 px-1.5 py-0.5 font-mono text-[10px] shrink-0">{c.dur}</span></div>
                  <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-0.5 text-[11px]">
                    <span className={cn("h-1.5 w-1.5 rounded-full", c.intent==="Sales" ? "bg-sky-400" : "bg-amber-400")} />
                    {c.intent} • {c.vehicleInterest}
                    {c.stockNo && c.stockNo!=="N/A" && <span className="hidden sm:inline font-mono text-[10px] opacity-70">• {c.stockNo}</span>}
                  </div>
                  <div className="mt-2 rounded-xl bg-zinc-900 p-2.5 font-mono text-[11px] leading-relaxed text-zinc-300 line-clamp-3">{c.transcript.slice(0,220)}…</div>
                  <div className="mt-2 flex items-center gap-2 text-[11px]">
                    <span className={cn("rounded-full px-2 py-0.5 font-semibold", c.score>=90?"bg-emerald-500":"bg-amber-500 text-black")}>{c.score} • {c.sent}</span>
                    <span className="font-mono text-zinc-400">Talk 32/68 • {c.disclosed ? "disclosure ✓" : "no-disclosure"} • rec ✓</span>
                  </div>
                  <div className="mt-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 text-[11px] leading-snug text-emerald-300">{c.verdict}</div>
                  {c.callbackTask && <div className="mt-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-[11px] text-amber-300">↳ {c.callbackTask} • transcript on timeline</div>}
                  <div className="mt-2 flex gap-1.5 flex-wrap">
                    <Button size="sm" variant="secondary" className="h-7 bg-white text-zinc-900 gap-1 text-[11px]"><Play size={12} weight="fill" /> Play {c.dur}</Button>
                    <Button size="sm" variant="outline" className="h-7 border-white/15 bg-transparent text-white gap-1 text-[11px]"><Copy size={12} /> Transcript</Button>
                    {c.intent==="Sales" && !c.bridged && (
                      <Button size="sm" variant="outline" className="h-7 bg-emerald-500 border-emerald-500 text-white gap-1 text-[11px] hover:bg-emerald-600" onClick={()=> bridgeSalesLead(c.id)}><ChatsCircle size={12} /> Bridge</Button>
                    )}
                    {c.intent==="Service" && !c.serviceBooked && (
                      <Button size="sm" variant="outline" className="h-7 bg-sky-600 border-sky-600 text-white gap-1 text-[11px] hover:bg-sky-700" onClick={()=> bookServiceFromCall(c.id)}>Book svc</Button>
                    )}
                  </div>
                  <div className="mt-1.5 flex items-center gap-1 text-[10px] font-mono text-zinc-500">
                    <ShieldCheck size={10} className="text-emerald-400" /> Recording/transcript/score logged • {new Date(c.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} • two-party consent ✓
                  </div>
                </motion.div>
              ))}
              </AnimatePresence>
            </div>
            {systemHealth.degraded && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200">
                <span className="font-semibold">Queued mutations:</span> {systemHealth.queuedMutations} voice transcripts + RO writes queued • auto-sync with conflict resolution on restore • no data loss • RTO {systemHealth.rto}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-[11px]">
              <ShieldCheck size={14} className="text-emerald-400" /> Two-party consent enforced by state • disclosure + recording notice auto • human handoff when confidence low
              <span className="ml-auto rounded-full bg-white px-2 py-0.5 font-mono text-[11px] font-semibold text-zinc-900">Managed • logged with model/version</span>
            </div>
          </div>
        </div>

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

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
            <span className="inline-flex items-center gap-2 text-[12px] font-semibold"><Microphone size={14} className="text-[var(--accent)]" /> Call recording &amp; AI scoring</span>
            <Badge variant="neutral" className="bg-white">{aiCalls.length} calls today • {aiCalls.length} recovered</Badge>
          </div>
          <div className="p-3.5">
            <div className="flex gap-1">
              {(["All","Coaching","Sales","Service"] as const).map(t=> (
                <button key={t} onClick={()=>setTab(t==="All"?0:t==="Coaching"?1:t==="Sales"?2:3)} className={cn("rounded-lg px-2.5 py-1.5 text-[11px] font-semibold", tab===(t==="All"?0:t==="Coaching"?1:t==="Sales"?2:3) ? "bg-zinc-900 text-white":"bg-white border text-zinc-500")}>{t}</button>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
                <div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-zinc-900 text-white font-bold text-[11px]">JC</span><span className="flex-1"><span className="block text-[12px] font-semibold">Marcus Chen • 09:15 • 02:18</span><span className="block font-mono text-[11px] text-[var(--text-muted)]">J. Alvarez • inbound bridged</span></span><span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[12px] font-bold text-white">{aiCalls[0]?.score || 92}/100</span></div>
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
              <div className="rounded-xl border border-dashed border-[var(--border-strong)] bg-white px-3 py-2 text-[11px] text-[var(--text-muted)]">
                Manager dashboard: recovery rate <span className="font-mono font-bold text-[var(--text-primary)]">{displayRate}%</span> • Avg score {avgScore} • {recovered} low-score coaching queue{recovered===4 ? " (+1 demo)" : ""} • recording/transcript/score logged
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {COPILOTS.map(c=>(
            <div key={c.k} className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
              <div className="flex items-center justify-between bg-zinc-900 px-4 py-2.5 text-white"><span className="inline-flex items-center gap-2 text-[12px] font-semibold"><c.icon size={14} weight="bold" className="text-sky-400" /> {c.k}</span><Badge variant="success" className="bg-white text-zinc-900 gap-1"><Sparkle size={12} weight="fill" className="text-[var(--accent)]" /> Suggestion</Badge></div>
              <div className="p-3.5">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-[12px] leading-relaxed">{c.tip}</div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]"><span className="rounded-full bg-white border px-2 py-0.5">Guardrail: {c.guard}</span><span className="rounded-full bg-emerald-500 px-2 py-0.5 font-semibold text-white">{c.roi}</span><Button size="sm" variant="outline" className="ml-auto h-6 bg-white gap-1" onClick={()=>{setCopied(true); setTimeout(()=>setCopied(false),1200)}}><Copy size={12} /> {copied ? "Copied" : "Use"}</Button></div>
              </div>
            </div>
          ))}
          <div className="rounded-xl border border-[var(--accent-border)] bg-[var(--accent-muted)] px-4 py-3 text-[11px]"><span className="font-semibold">Governance:</span> Every AI action logged with model/version • human-override path • two-party-consent enforced by state • ROI tracked (dealers demand proof)</div>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2.5 text-center font-mono text-[10px] tracking-wide text-[var(--text-faint)]">E10 • Vendor-agnostic • 3 agents ship on unified data • Responsible AI ISO 42001 • Not bolt-on • Logged + governed • F18 RTO 1h • RPO 15m • {systemHealth.degraded ? "DEGRADED" : "NOMINAL"}</div>
    </div>
  )
}
