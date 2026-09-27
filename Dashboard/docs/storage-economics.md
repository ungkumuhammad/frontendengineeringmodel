# NH₃ Storage Design module

Module: [`public/modules/nh3-storage-design.html`](../public/modules/nh3-storage-design.html)
(slug `nh3-storage-design`, registered in `lib/modules.ts`).

A self-contained calculator for a refrigerated ammonia import terminal. Every input
is editable and every output recalculates live. The default project is the
HAROPA Port, Le Havre case: 40 kt net tank, validated against TEPSA's Scenario D
datasheet. All registered figures are indicative and non-binding.

## Tabs

| Tab | What it does |
|---|---|
| Tank sizing | Net working capacity from parcel + buffer rule, tank diameter/volumes, nominal inventory cycle, shipping and jetty checks |
| CAPEX & tariff | CAPEX from the reference cost curve, break-even storage tariff, market check against registered offers |
| Optimum size | Repeats the sizing for MGC / LGC / VLAC / Other and picks the lowest storage + utilities + freight cost per tonne |
| Economics register | Vopak tariffs, TEPSA quote, Project Titan benchmark, open questions, decision log — all editable, derived values live |

## Sizing method

```
daily send-out  q = throughput ÷ 365          (or ÷ operating days)
parcel          = ship capacity m³ × fill % × density
net capacity    = parcel + buffer days × q, rounded up to the step
tank area       = net m³ ÷ (inner height − heel − top margin)
nominal volume  = area × inner height
```

Buffer rules (selectable):

| Rule | Buffer days |
|---|---|
| Recommended — outage + one ship-timing event | no send-out + max(early, late + port closure) + strategic |
| Conservative — all events at once | no send-out + early + late + port closure + strategic |
| Lean — largest single event | max(no send-out, early, late + port closure) + strategic |

TEPSA check: 30,000 t + (5 + 2) d × 1,425 t/d = 39,975 → 40,000 t; Ø55.0 m × 29.3 m;
69,574 m³ nominal (datasheet 69,557 m³).

## Economics method

- **CAPEX** = tanks × reference storage CAPEX × (net per tank ÷ reference size)^exponent ×
  location factor + (jetty/marine + ship-class adder + other) × location factor.
  Default reference: TEPSA €185M storage at 40,000 t + €20M jetty.
- **Break-even tariff**: post-tax NPV = 0 at the operator return over the contract term;
  CPI-indexed revenue and fixed OPEX, straight-line tax depreciation, optional residual value;
  CAPEX capitalised to start of operations over the build spend profile.
- **Vopak** implied CAPEX and **TEPSA** implied return use the same model.

## Reusing for a new project

1. Copy `nh3-storage-design.html` into the new repo (it has no dependencies beyond the
   SheetJS CDN used for Excel export).
2. Click **Export project** here to save a `.storage.json` file, or start from defaults.
3. In the new repo, open the module, **Import project**, and edit inputs and the register.

## Decision log

| Date | Decision |
|---|---|
| 2026-09-27 | Base assumptions: 9 % return, 2.5 % CPI, 25 % tax / 20-yr SL, 2.5 % OPEX, 15-yr full recovery |
| 2026-09-27 | Reference tank 40 kt net; reference throughputs 300 and 550 ktpa |
| 2026-09-27 | Vopak utilities = TEPSA basis: €1.7/t (pass-through, +10 % admin, €150/MWh) |
| 2026-09-27 | Project Titan USD 87M is full-terminal scope; FX 1.10 USD/EUR |
| 2026-09-27 | Buffer rule default: outage + one ship-timing event (reproduces TEPSA 40,000 t) |
