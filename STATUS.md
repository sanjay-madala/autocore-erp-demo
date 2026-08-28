# AutoCore ERP Demo — STATUS (Freeze 2026-08-27)

**Live:** `https://github.com/sanjay-madala/autocore-erp-demo` `main` @ `f6a80c4` • **Netlify** `https://autocore-erp-demo.netlify.app` `6a8fce4` • **Local** `http://localhost:5175` (F1 Flow default)

## What’s Built — F1–F18 End-to-End Wired ✅

**Store** `src/lib/store.ts:1` Zustand single STAR model — one VIN / customer `masterId M-xxx` / deal `D-xxxx` / RO `RO-xxxx` / GL `JE-xxxxx` group-wide, no batch. Seeded `vehicles 20 (dtown/north/westside)`, `customers 16 (15 unique, M-008 dedup cluster)`, `deals 12`, `leads 20 (dedup 3→1)`, `service 7 appts / 6 ROs / 6 techs`, `parts 25 (matrixPrice vs listPrice)`, `migration` (CDK 98.4% etc), `selectedRooftop group/dtown/north/westside`, `systemHealth degraded RTO 1h RPO 15m`, `docRecipients 127`, `oemPrograms Toyota SmartPath`, `voiceTranscripts`, `complianceState 50-state`.

**10 Lazy Views** `src/components/Shell.tsx:30` `React.lazy` `19→24` chunks `≈55KB/route`:

| View | Route | Flows | Live Wires |
|---|---|---|---|
| F1 Flow | `/` default | **F1** 12-step | Single deal object `D-1041` `lead → pencil <500ms p95 42ms → desked → Dealertrack approved → GAP ✓ → CIT $48,200 → DELIVERED → POSTED` `CIT $0 • closed`, same `#8841` `Online 09:14 → Desk 09:22` + pause/resume `97%` fix |
| CommandCenter | Command Center | **E11/F8/F18** | Live KPIs `Group GP`, velocity 6 buckets from `deals.createdAt` (not static), `42s ago ≤60s` `p99`, `06:00 DOC 127` `RMI`, Metrics API + Warehouse CDC `1.2M rows 4.2GB`, degraded amber |
| Inventory | Vehicles | **F2/F17** | `Start Recon → RO-8842 → Complete +$1,240`, price sparkline live `setVehiclePrice 38,900`, transfer `GL 1300/1400` `transferVehicle` + `12→11` |
| Showroom/Desking | Showroom / F&I Desk | **F1/F3/F11** + OEM | `In-Store vs Online same #8841` trade firm `$17.6–18.8k` + photos, soft-pull `742 Good → 6.49%`, deposit `$500`, eSign stips, guard `VSC→GAP→Tire→Dent` audit JSON `PVR 42%`, `Vitu VIT-8841`, `50-state CA 7.25%`, `SmartPath $500` |
| CRM Inbox | CRM Inbox | **F6/F12/F5** | `Ingest Lead 11–53s <60s A` `58% dedup M-008 → merged`, `Convert → D-10xx • SLA 42s` `SOLD`, equity `+$4.2k` |
| Service Lane | Service Lane | **F4/F13/F15** + loaner/tire/voice | `Create RO` from appt, status `open→completed`, MPI per-item `Approve` matrix `$589`, `Service Copilot 4mm +$230`, `flag +2.5h`, loaner `6` + manifest + shuttle `3`, tire `225/60R18 $899 EV 47%`, voice `“Brake pads 4mm, labor 1.2h” → MPI 4mm $289` |
| Parts Counter | Parts Counter | **F7/F16** + tire | **Hero matrix** `$112.20` vs list `$125` `M2/M4`, `Sell 12→11` anim, `Short Sale 8→9` preserved, wholesale `Net20`, tire hub `EV 47%` |
| GL & Close | GL & Close | **F8/F14/F15** + vendor/warehouse | `LIVE CIT 0/1`, schedules `Floorplan 10*avg`, `CIT submitted sum` live, checklist 1-4 auto-done, rollup `3 rooftops + eliminations -$12,400` drill-down per `dtown/north/westside`, incentives `$1,500` stacking-flag, `Brex` `5` Pay→Paid, `Warehouse CDC 1.2M`, `06:00 DOC 127` `+10/-10` |
| Developer | Developer | **F9/E9** + E12 | `issk_live 200 STAR 42ms <15min`, Try-it `logAuditRead` + `bumpWebhookDeliveries`, `dealer_consent:dtown` `OAuth tok`, webhooks `active/paused`, marketplace `12` installs, `export <24h $0 ETA 89m`, Safeguards `7` controls `MFA 100% AES-256` + `SOC1/2` + `ISO 27001/27701` + `13 privacy` + `DR RPO 15m` |
| AI Agents | AI Agents | **F5/F6/F18 + T1** | `Receive Missed Call C-884` whisper `Marcus+Camry` `score 92` `67→75%`, `Simulate Degraded` `us-east-1→us-west-2 queued 12`, `T1` `Ask “Gross per tech?” → Rivera $18.4k + table + SQL` pills `Aged >45, CIT, Group GP $312k` |
| Mobile Apps | Mobile Apps | **E14** | `3` phones `390×844` zinc-950 `rounded-[36px]` (Salesperson lead+desk starter, Advisor VIN scan + MPI video `00:24` + voice `4mm`, Technician flag `02:14`), `OfflineBanner queued 3 • sync on reconnect` |
| Workbench | Workbench | **F10/E13** | `CDK 98.4%` anim `12→98.4`, `mapping 96.2→99.1%`, `verification $0.00 1,204 bins exact`, `parallel 9/14→10/14 GO`, `cutover <72h` + rollback |

## Design — Taste
`VARIANCE 6 / MOTION 4 / DENSITY 5` — `Geist` + mono tabular, `Cobalt #0F62FE` single, Zinc `50/200/950`, `rounded-xl` lock, `motion/react` stagger `0.16,1,0.3,1`, `prefers-reduced-motion`, no purple. `src/index.css:1` `@import "tailwindcss"` + `@theme inline`.

## Perf & Tests
- **Build** `5564` modules `✓` `tsc -b && vite build` `~500ms` — `vite.config.ts:21` `manualChunks` vendor splits + `React.lazy` → `1.52MB → 19→24` chunks `F1 11.8KB + Inventory 41KB … data 84KB` `≈55KB/route` `77KB CSS → 92KB` `✓`
- **Playwright** `5 passed` `36s` — `tests/f1.spec.ts:4` F1 9 steps `lead → delivered → Vehicles sold → GL LIVE CIT` (native setter for range, `div hasText` to avoid hidden `<option>`, `force:true` + `evaluate` click) + `tests/flows.spec.ts:4` `F2` inventory, `F4` RO→MPI→flag, `F7` matrix hero, `F6` dedup `M-008` `→ D-10xx` — `npx playwright test` `✓` `playwright.config.ts:1` `webServer 5175`
- **A11y** `100` — fixed `color-contrast` `2→0` (`--text-faint #71717a→#64646e`, `amber-600→700`), `button-name` + `select-name` `aria-label`, `best-practices 100`, `CLS 0`, `LCP 124s dev` (HMR, prod `~90`)

## Docs — Freeze
- `docs/AutoCore_Process_Flows_Deck.docx` `62KB` `119 paras` `43 tables` — Cover + TOC + Vision 8 principles + `P1–P12` + `E1–E14` + STAR model + **F1–F18** (header bar + steps table `#/Step/Actor-System/Epic` + alts) + critical path + NFR `99.95% RTO 1h` + demo map 10 views — `SPEC §3` verbatim.
- `docs/AutoCore_Demo_Script.docx` `43KB` `98 paras` — Setup `Alex Morgan Group COO`, **5-min executive** 10 clicks `0:00→5:00` with talk tracks per step, **20-min deep dive** per flow `F2` `+ $1,240` / `F3` resume / `F4` `+ $230` / `F7` matrix / `F8` `127` / `F9` `200` / `F10` `98.4%` etc, Q&A 5, Appendix links.
- Both `python-docx 1.2.0` + required `theme1.xml`/`webSettings.xml`/`Normal+DefaultParagraphFont`, `w:sz≥2`, `w:space="0"`, `w:color="auto"` — `~/bin/fix-docx ... OK` (no fixes needed) + `Document(...)` parse `tables 43/1`.

## How to Pick Up
```bash
cd /Users/sanjaymadala/code/automotive_erp/demo
npm install          # node 20, vite 8.2.2
npm run dev          # http://localhost:5175 — lands F1 Flow default
npm run build        # tsc -b && vite build → 24 chunks
npx playwright test  # 5 passed (F1 + F2/F4/F7/F6)
npm run preview      # prod preview for Lighthouse ~90
```

**Vault:** `~/obsidian/sanjay_obsidian/Brainstorming/AutoCore-Demo-Tracker.md` — auto-updated `F1–F18` matrix + `E11/E14` live notes + Final Metrics + Handoff (14 epics → file mapping) + 5-min script.

**GitHub** `sanjay-madala/autocore-erp-demo` `main` — 13 commits `afa0638 → f6a80c4` (last `polish: F3 resume…`), **Netlify** `autocore-erp-demo` `6a8fce4` prod (23 assets, `6a8fc4df…`).

## Next (Optional, No P0 Blockers)
- Expand E2E to `F3/F8/F9/F5` full (currently `F1` + `F2/F4/F7/F6` covered)
- `Lighthouse prod` `vite preview` (`~90` vs `27` dev) — `npm run lighthouse` script present
- `100-rooftop` virtual scale stress (store already supports `transferHistory`, group rollup 3→100)

## Freeze Note
2026-08-27 freeze — demo ready to present. All flows click-ready from `F1 Flow` default, no `lighthouse` run in freeze (skipped per request). Docs in `demo/docs/` + `~/Downloads/` open directly in Word Mac.

Generated: 2026-08-27 16:50 UTC • Muse Spark (Opencode)
