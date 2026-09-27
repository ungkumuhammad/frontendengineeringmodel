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
| PGS 12 tank & levels | Section through a full-containment tank with the liquid levels to scale, level schedule per tank, live PGS 12 check of the design, open items and sources |
| CAPEX & tariff | CAPEX from the reference cost curve, break-even storage tariff, market check against registered offers |
| Optimum size | Repeats the sizing for MGC / LGC / VLAC / Other and picks the lowest storage + utilities + freight cost per tonne |
| Economics register | Vopak tariffs, TEPSA quote, Project Titan benchmark, open questions, decision log — all editable, derived values live |

## Sizing method

```
daily send-out  q = throughput ÷ 365          (or ÷ operating days)
density         = PGS 12:2025 Tabel 7 at the storage temperature (681.6 kg/m³ at −33.0 °C), or manual
parcel          = ship capacity m³ × fill % × density
net capacity    = parcel + buffer days × q, rounded up to the step
tank area       = see level basis below
nominal volume  = area × inner shell height
```

### Liquid levels

Two level bases, selectable under **Tank geometry & levels**.

**PGS 12 level stack (default).** From the top of the inner shell down:

| Level | Set as | Source |
|---|---|---|
| MDLL — max design liquid level | shell top − freeboard (≥ 0.5 m) − extra freeboard | PGS 12 (1999) §6.4.1.6; not restated in 2025, NEN-EN 14620 governs (not held) |
| LAHH — independent overfill trip | MDLL − unloading rise rate × trip-to-shut time | PGS 12:2025 M18; 1999 §6.5.4.1 |
| LAH — high-level alarm = max working level | LAHH − rise rate × operator response time | PGS 12:2025 M17; 1999 §6.5.4.1 |
| LAL — low-level alarm = min working level | LALL + send-out fall rate × response time | operating margin, not PGS 12 |
| LALL — pump trip, heel | input | in-tank pumps (M10), no connections below liquid level (M30) — pump vendor |

The time-based margins depend on the tank area, which depends on the margins, so the
area is solved in one step:

```
A × (H − freeboard − extra − LALL) = V_net + Q_in × (t_trip + t_alarm) + Q_out × t_low
Q_in  = unloading rate ÷ density   (full rate into one tank)
Q_out = send-out ÷ 24 ÷ density    (full send-out from one tank)
```

Response times and the heel are **placeholders**: PGS 12 requires the functions but sets
no values. Take them from the HAZOP / SIL study and the pump vendor.

**Lumped margins.** Area = net m³ ÷ (H − heel − top margin). Heel 1.5 m + top margin 3.1 m
reproduce TEPSA's 84.3 % net/nominal ratio; the split is a calibration, not a disclosed
level schedule. **Load TEPSA check case** switches to this basis and to 682 kg/m³.

### PGS 12 checks

Evaluated live on the PGS 12 tab and exported to Excel: construction form (M10/M12), design
code (M9), capacity per tank against the ≈60–70 kt practical ceiling (§1 Opmerking 2), an
illustrative bottom-course plate thickness against 40 mm, freeboard, fill degree (Tabel 9's
80 vol% is pressurized-only, M109), overfill protection (M17/M18), level measurement (M16),
pump heel (M10/M30), density (Tabel 7), incoming temperature −33.0 to −32.0 °C, design
pressure 100–500 mbar (≈250 practical), minimum size, tank spacing (1999 §6.2.4), design life
and in-service inspection (M116), low-cycle fatigue, BOG (M27/M28), O₂/N₂ (M88/M89) and
setbacks (M6/M8). The optimum-size search excludes any tank above ≈70 kt.

Source files are in the `taurusgentari` repository under `PGS-12/` (PGS 12:2025 v1.1 raw
text, the 1999/2005 edition, and the PGS 12 Tank Anatomy sheet the section drawing is
adapted from).

Buffer rules (selectable):

| Rule | Buffer days |
|---|---|
| Recommended — outage + one ship-timing event | no send-out + max(early, late + port closure) + strategic |
| Conservative — all events at once | no send-out + early + late + port closure + strategic |
| Lean — largest single event | max(no send-out, early, late + port closure) + strategic |

TEPSA check (lumped level basis, 682 kg/m³): 30,000 t + (5 + 2) d × 1,425 t/d = 39,975 → 40,000 t; Ø55.0 m × 29.3 m;
69,574 m³ nominal (datasheet 69,557 m³).

## Voyage & fleet

The arrival interval at the terminal is set by demand (parcel ÷ send-out). Distance and
speed set each vessel's round trip, which decides the fleet size and the freight cost:

```
round trip  = 2 × distance ÷ (speed × 24) × (1 + sea margin) + load port + discharge + canal/waiting
vessels     = cargoes per year ÷ ((365 − off-hire) ÷ round trip), rounded up
freight €/t = voyage share:   (hire × round trip + fuel + port costs) ÷ parcel ÷ FX
              dedicated fleet: (vessels × hire × 365 + fuel & port per voyage × cargoes) ÷ throughput ÷ FX
```

Freight can also be entered manually per ship class. Default distance (5,000 nm), hire, fuel
and port costs are placeholders.

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
| 2026-09-27 | Tank levels follow PGS 12 (freeboard ≥ 0.5 m, overfill trip, alarms, pump heel); density from PGS 12:2025 Tabel 7 |
| 2026-09-27 | Buffer rule default: outage + one ship-timing event (reproduces TEPSA 40,000 t) |
| 2026-09-27 | Freight calculated from voyage; fleet sized from round trip vs arrival interval |
