# NH₃ Storage Design module

Module: [`public/modules/nh3-storage-design.html`](../public/modules/nh3-storage-design.html)
(slug `nh3-storage-design`, registered in `lib/modules.ts`).

A self-contained calculator for a refrigerated ammonia import terminal. Every input
is editable and every output recalculates live. The default project is the
HAROPA Port, Le Havre case: 40 kt net tank, validated against TEPSA's Scenario D
datasheet. All registered figures are indicative and non-binding.

## Scope — receiving (import) terminal only

This calculator models an **import / receiving terminal**: ships arrive, discharge into the
tank, and the tank is drawn down by **downstream demand** (send-out to the consumer, e.g. the
cracker). Buffer days, send-out rate, ship interval and the low-alarm margin are all driven
by demand.

**Not yet built: an export terminal** fed by a **production plant**. There the tank fills
continuously at the plant's production rate and empties in batches when ships load, so the
sizing logic inverts: buffer for plant output while no ship is alongside (ship late, port
closure), loading rate instead of unloading rate, the level rise driven by production and the
fall by ship loading, and the plant — not the consumer — as the outage case. Build it as a
separate module (or a terminal-type switch) rather than reusing the demand-driven formulas.

## Tabs

| Tab | What it does |
|---|---|
| Tank sizing | Required net from parcel + buffer rule, gross storage size rounded up or down, tank diameter/volumes, max fill vs loadable volume section to scale, throughput sensitivity of storage size (± 5 × 100 ktpa), nominal inventory cycle, shipping and jetty checks. Every panel folds from its header |
| PGS 12 tank & levels | Section through a full-containment tank with the liquid levels to scale, level schedule per tank, live PGS 12 check of the design, open items and sources |
| CAPEX & tariff | CAPEX from the reference cost curve, break-even storage tariff, throughput sensitivity of CAPEX and tariff (± 5 × 100 ktpa), market check against registered offers |
| Optimum size | Repeats the sizing for MGC / LGC / VLAC / Other and picks the lowest storage + utilities + freight cost per tonne |
| Economics register | Vopak tariffs, TEPSA quote, Project Titan benchmark, open questions, decision log — all editable, derived values live |

## Sizing method

```
daily send-out  q = throughput ÷ 365          (or ÷ operating days)
density         = PGS 12:2025 Tabel 7 at the storage temperature (681.6 kg/m³ at −33.0 °C), or manual
parcel          = ship capacity m³ × fill % × density
required net    = parcel + buffer days × q
                  buffer days = safety stock (late ship + port closure + strategic)
                              + ullage reserve (rest of the rule's days: outage, early ship) — ullage can be excluded
required area   = area whose working range holds the required net (see level basis below)
required gross  = required area × inner shell height × density   (net + top margin + bottom heel + freeboard)
design gross    = required gross rounded down or up to the step (user's choice; 0 = no rounding)
design area     = design gross ÷ (inner shell height × density)
net capacity    = design area × (max working level − min working level) × density
nominal volume  = design area × inner shell height
```

Rounding the gross size (not the net) means the step applies to the tank that gets built. Rounding
down can leave the net below the required net; the module then flags the shortfall and the buffer
days actually covered. The TEPSA check case uses no rounding, because TEPSA quotes 40,000 t net.

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

### Plot area

```
plot required (ha) = reference plot × design net capacity ÷ reference tank size
reference          = 3.7 ha for a 60 kt tank, including the jetty; jetty 500 m from the tank
units              = ha, m², sq ft (1 ft = 0.3048 m), acres (1 acre = 4,046.8564224 m²)
```

Shown on the Tank sizing tab (KPI + plot table), the PGS 12 tab and the Optimum size tab,
and exported to Excel. The scaling is linear by instruction, so it also scales the jetty and
the 500 m jetty-to-tank corridor, which do not grow with tank size. Whether the 60 kt
reference is net or gross is not stated.

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

The round trip of one vessel is entered directly, in days, all-in (sea legs, load port, discharge,
canal and waiting). Distance, speed and sea margin are no longer inputs. Off-hire, hire, fuel,
port costs, bunker price and FX are unchanged.

```
round trip      = input (days)
vessels         = chartered fleet (default) or, in "size from demand" mode,
                  cargoes per year ÷ ((365 − off-hire) ÷ round trip), rounded up
freight €/t     = voyage share:   (hire × round trip + fuel + port costs) ÷ parcel ÷ FX
                  dedicated fleet: (vessels × hire × 365 + fuel & port per voyage × cargoes) ÷ delivered tonnes ÷ FX
fuel split      = port days = load port + discharge (one berth stay at each end); sea days = round trip − port days
```

### Fleet basis: chartered fleet (default) or size from demand

`Fleet` under Voyage & fleet has two modes. **Number of ships chartered** (default) makes the
fleet an input, so vessel size, round trip and fleet together set the loadable volume:

```
calls per year  = ships chartered × (365 − off-hire) ÷ round trip
arrival interval = 365 ÷ calls per year
parcel per call = min( full cargo , average send-out × arrival interval )
required net    = parcel per call + buffer days × send-out          (buffer rule unchanged)
deliverable     = calls per year × full cargo   (flagged if below throughput)
```

More ships or a shorter round trip → shorter interval → smaller parcel per call → smaller tank and
CAPEX, at the cost of more hire. Too few ships → the fleet cannot deliver the throughput (error
shown; storage is then sized on a full cargo every interval). Applies to the selected ship class
only; the Optimum size tab uses the same round trip but sizes every class from demand.
**Size from demand** makes the number of vessels an output: parcel ÷ send-out sets the arrival
interval and the round trip sets how many vessels keep that rhythm. The TEPSA check case switches
to this mode. The buffer days (ship late, port closure) are still inputs and are not derived from
the round trip. Default round trip (33 d) and hire, fuel and port costs are placeholders.

## Economics method

- **CAPEX** = tanks × reference storage CAPEX × (loadable volume per tank ÷ reference loadable
  volume)^exponent × location factor + (jetty/marine + ship-class adder + other) × location factor.
  Loadable volume is the working range between the low and high alarms, in the gross tank size
  chosen (rounded up or down) under Required storage.
  Default reference: TEPSA €185M storage + €20M jetty for its 40,000 t loadable tank
  (58,651 m³ × 682 kg/m³; 69,557 m³ nominal).
- **Break-even tariff**: post-tax NPV = 0 at the operator return over the contract term;
  CPI-indexed revenue and fixed OPEX, straight-line tax depreciation, optional residual value;
  CAPEX capitalised to start of operations over the build spend profile.
- **Vopak** implied CAPEX and **TEPSA** implied return use the same model.

## Excel export

**⬇ Excel** offers *Results only* (Results + Sensitivity) or *Full workbook* (every sheet below). It writes a styled workbook with ExcelJS (cdnjs), in the module's colours (purple
`#7030A0` headings, blue `#0070C0` key values, status colours from the PGS 12 checks), Arial
throughout, gridlines off, frozen table headers and landscape/portrait print setup.

| Sheet | Content |
|---|---|
| Results | Results only: headline (net capacity, tank size, plot, CAPEX, tariffs, landed cost) highlighted, then storage, levels, plot, shipping, economics, optimum ship class, PGS 12 check sorted worst-first, and the model's flags |
| Sensitivity | Storage size, required gross and loadable volume, total CAPEX and break-even tariff at the current throughput ± 5 × 100 ktpa, as charts (images) with the data tables. Written in both export options |
| Inputs | Every input grouped by section, with units and placeholder notes; ship classes |
| Sizing | Capacity build-up, tank dimensions vs TEPSA, plot area, operations, voyage and freight |
| PGS 12 Levels | Level schedule per tank and the full PGS 12 check with coloured status |
| CAPEX & Tariff | CAPEX, tariff build-up, financial assumptions, market check |
| Ship Options | All ship classes; lowest-cost row in green |
| Register | Vopak, TEPSA, Titan benchmark, open questions, decision log |

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
| 2026-09-27 | Plot required scales linearly from 3.7 ha at 60 kt (incl. jetty, jetty 500 m from tank), shown in ha, m², sq ft and acres |
| 2026-09-27 | Tank levels follow PGS 12 (freeboard ≥ 0.5 m, overfill trip, alarms, pump heel); density from PGS 12:2025 Tabel 7 |
| 2026-09-27 | Buffer rule default: outage + one ship-timing event (reproduces TEPSA 40,000 t) |
| 2026-09-27 | Freight calculated from voyage; fleet sized from round trip vs arrival interval |
| 2026-09-30 | Fleet basis switch: number of chartered ships can be an input; interval = round trip ÷ ships sets the parcel and loadable volume (selected ship class only) |
