# AutoCore ERP — End-to-End Demo
Cloud-native Automotive Retail ERP demo • Sovereign Auto Group (3 rooftops)

**Live flows:** 18 user flows F1–F18 • 14 epics E1–E14 • 12 personas

## Run
```bash
cd /Users/sanjaymadala/code/automotive_erp/demo
npm install
npm run dev     # http://localhost:5175
npm run build   # production
```

## Structure
- `src/components/Shell.tsx` — Top bar (group + rooftop segmented), Sidebar (OPERATE/INVENTORY/FIXED OPS/MONEY/PLATFORM/INTELLIGENCE/MIGRATION), resilience 99.95% SLA
- `src/features/` — 9 views:
  - `CommandCenter.tsx` — E11 analytics + F8 group close + F18 degraded mode (Bloomberg-dense)
  - `Inventory.tsx` — E3 + F2 + F17 (appraisal → recon → aging → cross-rooftop transfer)
  - `Desking.tsx` — E4/E5 + F1/F3/F11 (live <500ms pencil, 3 pencils, docuPAD F&I menu + eSign)
  - `CRMInbox.tsx` — E6 + F5/F6/F12 (dedup M-008, 42s speed-to-lead, unified timeline, equity mining)
  - `ServiceLane.tsx` — E7 + F4/F13/F15 (capacity board → video MPI per-item approve → pay-by-link → flag → payroll)
  - `PartsCounter.tsx` — E8 + F7/F16 — **HERO: matrix pricing** list vs matrix (Tekion bug fix), short-sale integrity, wholesale
  - `AccountingClose.tsx` — E2 + F8/F14/F15 (continuous schedules, JE tiers, OEM DOC, consolidated)
  - `DeveloperPortal.tsx` — E9 + F9 (4-step <15min: register → sandbox → first 200 → dealer consent, STAR payloads, audit log, marketplace 12 apps)
  - `AIAgents.tsx` — E10 + F5/F6 (voice recovery 30s, <60s bridge, scoring, F&I/service copilots)
  - `MigrationWorkbench.tsx` — E13 + F10 (CDK/Reynolds extractors 98.4%, mapping 99.2% bins, 14d parallel, <72h cutover)
- `src/data/` — 11 typed datasets (vehicles, customers, deals, leads, service, parts with matrixPrice vs listPrice, accounting, platform, ai, analytics)

## Design — Taste Skill
Reading: B2B enterprise SaaS for 5–150 rooftop groups, trust-first, Linear-clean + Bloomberg density, leaning Tailwind v4 + Geist + zinc/cobalt.
- **Accent:** single Cobalt #0F62FE • Zinc neutrals • off-black zinc-950 • mono tabular for numbers
- **Dials:** VARIANCE 6 / MOTION 4 / DENSITY 5 • rounded-xl lock • no purple glows • staggered Motion
- **Verified:** `npm run build` ✓ 5552 modules, 1.36MB (357KB gzip)

## Flows Map
F1 lead→desk→F&I→delivery→GL • F2 appraisal→recon • F3 online checkout • F4 service AI→MPI→pay • F5 missed-call AI • F6 <60s • F7 matrix • F8 close • F9 $0 API • F10 migration • F11 menu • F12 equity • F13 warranty • F14 incentive • F15 flag→payroll • F16 wholesale • F17 transfer • F18 degraded-mode

## Vault Specs
`~/obsidian/sanjay_obsidian/AutoCore - Automotive ERP/` — Product Specification v1.0 (14 epics, 142 tasks)
