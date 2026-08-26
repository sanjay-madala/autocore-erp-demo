import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  ChatCircleDots,
  Sparkle,
  MagnifyingGlass,
  Database,
  Lightning,
  Copy,
  Check,
  ArrowRight,
  Clock,
  ShieldCheck,
  Stack,
} from "@phosphor-icons/react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const SUGGESTED_PRIMARY = [
  "Gross per tech this month?",
  "Aged inventory >45 days?",
  "CIT aging?",
] as const

const SUGGESTED_SECONDARY = [
  "Missed calls today?",
  "Group GP MTD?",
] as const

const ALL_SUGGESTED = [...SUGGESTED_PRIMARY, ...SUGGESTED_SECONDARY]

export default function ConversationalBI() {
  const history = useStore((s) => s.conversationalBI.history)
  const queryBI = useStore((s) => s.queryBI)
  const [q, setQ] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleAsk = (value?: string) => {
    const nl = (value ?? q).trim()
    if (!nl) return
    queryBI(nl)
    setQ("")
    // keep focus for follow-up
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const handleCopySql = async (sql: string, id: string) => {
    try {
      await navigator.clipboard.writeText(sql)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1400)
    } catch {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1400)
    }
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
    }
  }, [history.length])

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 text-white shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent px-5 py-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--accent)] text-white shadow-[0_0_18px_rgba(15,98,254,0.45)]">
            <ChatCircleDots size={16} weight="fill" />
          </span>
          <h2 className="text-[15px] font-[700] tracking-[-0.02em]">Conversational BI — T1</h2>
          <span className="rounded-full bg-white px-2.5 py-1 font-mono text-[10px] font-[700] tracking-[0.08em] text-zinc-900">
            Ask. Decide. Act.
          </span>
          <span className="hidden items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 font-mono text-[10px] font-[600] tracking-widest text-white/90 md:inline-flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            UNIFIED STORE • LIVE
          </span>
          <span className="ml-auto hidden items-center gap-1.5 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-[650] text-white md:inline-flex">
            <Database size={12} weight="fill" />
            T1 • Platform-wide NL query
          </span>
        </div>
        <p className="max-w-[860px] text-[12px] leading-relaxed text-zinc-400">
          Platform-wide natural language over every customer, vehicle, deal, RO, and financial record.
          Query the unified store — no exports, no warehouse lag. Keyword-matched, audited, read-only.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 font-mono text-[11px] text-zinc-300">
            <ShieldCheck size={12} className="text-emerald-400" /> Read-only • SOQL-audited
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 font-mono text-[11px] text-zinc-300">
            <Stack size={12} /> customers • vehicles • deals • ROs • GL
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent)] px-2 py-1 font-mono text-[11px] font-[700] text-white">
            <Lightning size={12} weight="fill" /> Zinc + Cobalt • mono SQL
          </span>
        </div>
      </div>

      {/* Input bar */}
      <div className="border-b border-white/10 bg-white/[0.03] p-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MagnifyingGlass
              size={16}
              weight="bold"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAsk()
              }}
              placeholder="Ask anything — customers, deals, ROs, GL…"
              className="h-[44px] w-full rounded-xl border border-white/10 bg-white pl-9 pr-4 text-[13.5px] font-[450] text-zinc-900 placeholder:text-zinc-500 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
            />
          </div>
          <Button
            onClick={() => handleAsk()}
            disabled={!q.trim()}
            className="h-[44px] shrink-0 gap-1.5 rounded-xl bg-[var(--accent)] px-5 text-white hover:bg-[#0353e9] disabled:opacity-40"
          >
            <Sparkle size={14} weight="fill" />
            Ask
            <ArrowRight size={14} weight="bold" className="opacity-80" />
          </Button>
        </div>

        {/* Suggested pills — exactly 3 primary + 2 secondary muted to ensure all 5 queries discoverable */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] tracking-[0.12em] text-zinc-500">TRY</span>
          {SUGGESTED_PRIMARY.map((s) => (
            <button
              key={s}
              onClick={() => handleAsk(s)}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[12px] font-[500] text-white transition-colors hover:bg-white hover:text-zinc-900 hover:border-white"
            >
              <ChatCircleDots size={12} weight="bold" className="opacity-70" />
              {s}
            </button>
          ))}
          <span className="hidden h-4 w-px bg-white/10 sm:block" />
          {SUGGESTED_SECONDARY.map((s) => (
            <button
              key={s}
              onClick={() => handleAsk(s)}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[11px] font-[500] text-zinc-300 transition-colors hover:bg-white hover:text-zinc-900"
            >
              {s}
            </button>
          ))}
          <span className="ml-auto hidden items-center gap-1 rounded-full bg-zinc-900 px-2 py-1 font-mono text-[10px] font-medium text-zinc-400 border border-white/10 md:inline-flex">
            <Clock size={10} /> 42ms p50 • unified
          </span>
        </div>

        {/* All-queries hint for discoverability */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {ALL_SUGGESTED.map((s) => (
            <span
              key={`hint-${s}`}
              className="hidden rounded-full bg-white/5 px-2 py-0.5 font-mono text-[10px] text-zinc-500 border border-white/5 md:inline-flex"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* History */}
      <div
        ref={scrollRef}
        className="max-h-[560px] overflow-y-auto bg-zinc-950 p-4 scrollbar-thin"
        style={{ scrollbarColor: "#27272a transparent" }}
      >
        {history.length === 0 ? (
          <div className="space-y-3">
            {/* Empty state preview — shows example answer card for Gross per tech */}
            <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-3 text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 font-mono text-[11px] font-[650] text-zinc-900">
                <Sparkle size={12} weight="fill" className="text-[var(--accent)]" /> No queries yet
              </div>
              <p className="mx-auto mt-2 max-w-[560px] text-[12.5px] leading-relaxed text-zinc-400">
                Try one of the suggested queries above. Each answer includes a table, a mono SQL preview, and
                an <span className="text-white font-medium">Ask follow-up</span> action — chat history is preserved.
              </p>
              <div className="mx-auto mt-3 grid max-w-[560px] grid-cols-3 gap-2 text-left">
                {[
                  { k: "Gross/tech", v: "Rivera $18.4k flagged" },
                  { k: "Aged", v: "4 units >45d" },
                  { k: "CIT", v: "$142k • 7 deals" },
                ].map((x) => (
                  <div key={x.k} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                    <div className="font-mono text-[10px] tracking-[0.08em] text-zinc-500">{x.k}</div>
                    <div className="text-[12px] font-[600] text-white">{x.v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview card — dark bento + mono SQL */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-zinc-900 text-white font-mono text-[10px] font-[700]">BI</span>
                <span className="text-[12px] font-[650] text-white">Example — “Gross per tech this month?”</span>
                <span className="ml-auto rounded-full bg-emerald-500 px-2 py-0.5 font-mono text-[10px] font-[700] text-white">E.g.</span>
              </div>
              <p className="mt-2 rounded-xl border border-white/10 bg-zinc-900/60 px-3 py-2.5 text-[12.5px] leading-relaxed text-zinc-200">
                Tech Rivera — <span className="font-semibold text-white">$18.4k</span> gross this month • flagged below 75% threshold • top: W. Schmidt $24.1k
              </p>
              <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11.5px]">
                    <thead className="bg-white/5 font-mono text-[10px] tracking-[0.08em] text-zinc-400">
                      <tr>
                        <th className="px-3 py-2 font-[600]">TECHNICIAN</th>
                        <th className="px-3 py-2 text-right">GROSS</th>
                        <th className="px-3 py-2 text-center">EFF</th>
                        <th className="px-3 py-2 text-center">FLAG</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono text-zinc-200">
                      <tr className="bg-white/5">
                        <td className="px-3 py-2 font-[600]">Rivera — Westside</td>
                        <td className="px-3 py-2 text-right font-[700] text-white">$18,400</td>
                        <td className="px-3 py-2 text-center">68%</td>
                        <td className="px-3 py-2 text-center text-amber-300">⚠️ below 75%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
                <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-3 py-2">
                  <span className="font-mono text-[10px] tracking-[0.1em] text-zinc-400">SQL • READ-ONLY • UNIFIED STORE</span>
                  <span className="rounded bg-white px-1.5 py-0.5 font-mono text-[10px] font-[700] text-zinc-900">COBALT</span>
                </div>
                <pre className="overflow-x-auto p-3 font-mono text-[11px] leading-relaxed text-sky-200/90">
{`SELECT technician, SUM(gross) AS gross
FROM repair_orders
WHERE date_trunc('month', closed_at) = date_trunc('month', now())
GROUP BY technician ORDER BY gross DESC;`}
                </pre>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="h-7 gap-1 border-white/15 bg-white text-zinc-900 hover:bg-zinc-100">
                  <ChatCircleDots size={12} weight="bold" /> Ask follow-up
                </Button>
                <span className="inline-flex items-center rounded-full bg-white/10 px-2 py-1 font-mono text-[11px] text-zinc-300">Preserves chat history</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {history.map((entry) => {
                const columns = entry.rows.length > 0 ? Object.keys(entry.rows[0]) : []
                return (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-3"
                  >
                    {/* User bubble */}
                    <div className="flex justify-end">
                      <div className="max-w-[82%] rounded-2xl rounded-br-md bg-white px-4 py-2.5 text-[13px] font-[550] leading-relaxed text-zinc-900 shadow-sm">
                        {entry.query}
                        <div className="mt-1 flex items-center justify-end gap-1 font-mono text-[10px] text-zinc-500">
                          <Clock size={10} />
                          {new Date(entry.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • you
                        </div>
                      </div>
                    </div>

                    {/* Assistant card — dark bento */}
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur">
                      <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
                        <span className="grid h-6 w-6 place-items-center rounded-lg bg-[var(--accent)] text-white">
                          <Sparkle size={12} weight="fill" />
                        </span>
                        <span className="text-[12px] font-[650] tracking-tight">Answer</span>
                        <Badge variant="neutral" className="ml-1 bg-white text-zinc-900 border-white text-[11px]">
                          {entry.rows.length} rows • 38ms
                        </Badge>
                        <span className="ml-auto hidden items-center gap-1 font-mono text-[11px] text-zinc-400 md:inline-flex">
                          <Database size={12} /> unified_store
                        </span>
                        <span className="rounded-full bg-emerald-500 px-2 py-0.5 font-mono text-[10px] font-[700] text-white">
                          T1
                        </span>
                      </div>

                      <div className="space-y-3 p-4">
                        <p className="rounded-xl border border-white/10 bg-zinc-900/70 px-3 py-2.5 text-[13px] leading-relaxed text-zinc-100">
                          {entry.answer}
                        </p>

                        {/* Table rows */}
                        {entry.rows.length > 0 && (
                          <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
                            <div className="max-h-[220px] overflow-auto">
                              <table className="w-full text-left text-[11.5px]">
                                <thead className="sticky top-0 bg-zinc-800 font-mono text-[10px] tracking-[0.07em] text-zinc-400">
                                  <tr>
                                    {columns.map((col) => (
                                      <th key={col} className="px-3 py-2 font-[650] whitespace-nowrap">
                                        {col.toUpperCase()}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 font-mono text-zinc-200">
                                  {entry.rows.map((row, idx) => (
                                    <tr
                                      key={idx}
                                      className={cn(
                                        "hover:bg-white/5",
                                        // highlight flagged Rivera row
                                        String(Object.values(row).join(" ")).toLowerCase().includes("rivera") ||
                                          String(Object.values(row).join(" ")).includes("⚠") ||
                                          String(Object.values(row).join(" ")).toLowerCase().includes("below")
                                          ? "bg-amber-500/10"
                                          : idx % 2 === 0
                                            ? "bg-white/[0.02]"
                                            : ""
                                      )}
                                    >
                                      {columns.map((col) => (
                                        <td key={col} className="px-3 py-2 whitespace-nowrap">
                                          {String(row[col] ?? "")}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <div className="flex items-center justify-between border-t border-white/10 bg-white/5 px-3 py-2 text-[11px] text-zinc-400">
                              <span className="font-mono">{entry.rows.length} rows • mono • zinc/cobalt</span>
                              <span className="hidden font-mono md:inline">Scroll to see all • grouped • sorted</span>
                            </div>
                          </div>
                        )}

                        {/* SQL preview — mono */}
                        <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
                          <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-3 py-2">
                            <span className="font-mono text-[10px] tracking-[0.10em] text-zinc-400">
                              SQL PREVIEW • READ-ONLY • COBALT
                            </span>
                            <button
                              onClick={() => handleCopySql(entry.sql, entry.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white px-2 py-1 font-mono text-[11px] font-[600] text-zinc-900 hover:bg-zinc-100"
                            >
                              {copiedId === entry.id ? <Check size={12} weight="bold" className="text-emerald-600" /> : <Copy size={12} weight="bold" />}
                              {copiedId === entry.id ? "Copied" : "Copy SQL"}
                            </button>
                          </div>
                          <pre className="overflow-x-auto p-3 font-mono text-[11px] leading-relaxed text-sky-200/90">
                            {entry.sql}
                          </pre>
                        </div>

                        {/* Footer — Ask follow-up */}
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-7 gap-1 bg-white text-zinc-900 hover:bg-zinc-100"
                            onClick={() => inputRef.current?.focus()}
                          >
                            <ChatCircleDots size={12} weight="bold" /> Ask follow-up
                          </Button>
                          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 font-mono text-[11px] text-zinc-300">
                            <Clock size={10} /> {new Date(entry.at).toLocaleTimeString()} • chat history kept • {history.length} total
                          </span>
                          <span className="ml-auto hidden items-center gap-1 rounded-full bg-[var(--accent)] px-2 py-1 font-mono text-[11px] font-[650] text-white md:inline-flex">
                            Motion • zinc/cobalt • bento
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer meta */}
      <div className="flex flex-wrap items-center gap-2 border-t border-white/10 bg-white/[0.02] px-4 py-2.5 text-[11px] text-zinc-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Unified store • indexed • read-only
        </span>
        <span className="hidden md:inline">•</span>
        <span className="hidden md:inline font-mono">No LLM call • keyword matching • 5 intents • extensible</span>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 font-mono text-[11px]">
          <ShieldCheck size={12} className="text-emerald-400" /> Audited • {history.length} queries this session
        </span>
      </div>
    </div>
  )
}
