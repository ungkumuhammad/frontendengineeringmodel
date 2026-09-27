# Storage economics register

Data: [`public/data/storage-economics.json`](../public/data/storage-economics.json)
(served at `/data/storage-economics.json` so the storage design module can fetch it).

Reference case: one 40 kt (net) refrigerated ammonia tank at HAROPA Port, Le Havre,
for 300 and 550 ktpa take-or-pay throughput. All figures are indicative and non-binding.

## Contents

| Section | What it holds |
|---|---|
| `sharedAssumptions` | Financial basis for all back-calculations |
| `utilities` | Pass-through utility fee, applied to every HAROPA offer |
| `offers` | Vopak tariff indication, TEPSA CAPEX + fees + technical sheet |
| `benchmarks` | Non-European reference costs (Project Titan, Kakinada) |

## Method

**Vopak – CAPEX from tariff.** The tariff is treated as a fixed annual charge
(revenue is ~flat between 300 and 550 ktpa). CAPEX is the value that makes the
15-year, CPI-indexed, post-tax cash flow NPV zero at the hurdle rate:
revenue − fixed OPEX (% of CAPEX, CPI-indexed) − 25 % tax on (revenue − OPEX −
20-yr straight-line depreciation), no residual value. "Including financing" is CAPEX at
start of operations; "before financing" divides by the IDC factor of a 3-year,
30/40/30 build compounded at the hurdle rate (1.141 at 9 %).

**TEPSA – IRR from fee.** Same cash-flow model, solved for the rate that recovers
the quoted EUR 205M.

**Titan – normalisation.** USD → EUR at the registered FX rate, scaled to 40 kt with
a 0.6 capacity exponent; compared with TEPSA's full-terminal EUR 205M.

## Registered decisions

| Date | Decision |
|---|---|
| 2026-09-27 | Base assumptions: 9 % hurdle, 2.5 % CPI, 25 % tax / 20-yr SL, 2.5 % OPEX, 15-yr full recovery |
| 2026-09-27 | Reference tank changed from 60 kt to 40 kt; throughputs 300 and 550 ktpa |
| 2026-09-27 | Vopak utilities = TEPSA basis: EUR 1.7/t (pass-through, +10 % admin, EUR 150/MWh) |
| 2026-09-27 | Project Titan USD 87M is full-terminal scope; FX 1.10 USD/EUR |
