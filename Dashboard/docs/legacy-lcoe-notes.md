# Memory: Gas Power LCOE Calculator

> **Note:** This tool was consolidated into the Engineering Dashboard. The
> calculator now lives at `Dashboard/public/modules/gas-power-lcoe.html` and is
> served at the route `/modules/gas-power-lcoe`. These notes are retained as
> historical context for the calculator's internals.

Consolidated learnings from building `gas-power-lcoe-calculator.html` — an LCOE
calculator for gas engine / gas turbine power generation on hydrogen, ammonia,
natural gas, or NG–H₂ blends. Read this before making further changes.

## What the tool does

Single self-contained HTML file (dark/light theme, no external dependencies).
Inputs: prime mover (engine/turbine), fuel, firm power output, capacity factor,
redundancy scheme (N/N+1/N+2/2N), fuel prices, finance assumptions, CO₂ price.
Outputs: CapEx breakdown (ISBL/OSBL/Indirect with expandable equipment lists),
OpEx breakdown, LCOE build-up, energy/fuel/emissions balance, an Engine-vs-Turbine
comparison view, and a save-to-tray + multi-sheet Excel (.xlsx) export.

## Architecture decisions worth remembering

- **`computeCase(pm, params)`** is the single pure calculation function — no DOM
  reads inside it. Both the single-analysis view and the Engine-vs-Turbine
  compare view call it, so the two never drift out of sync. Any new metric
  must be added inside this function and returned in its result object, not
  computed separately in `render()`.
- **Installed vs. firm capacity are deliberately separate.** CapEx and fixed
  O&M scale with *installed* capacity (`installed_kW`, driven by unit rating +
  redundancy scheme); generation, fuel, and variable O&M scale with *firm*
  output (`P_MW`). Redundancy changes reserve margin, not energy output.
- **N+1 ≠ 2×.** Oversize = (N + spares)/N, so it depends entirely on unit size
  — many small engine units make redundancy cheap (~+7% at 500 MW/18.5 MW
  units), a single large unit makes it +100% (the case the user originally
  flagged). This distinction should stay explicit in any UI copy.
- **Fuel changes cascade:** switching fuel updates efficiency AND ISBL $/kW
  via `fuelDefaults(pm, fuel, blendVolPct)`, but only as *defaults* — user
  edits to those fields persist until the next fuel/prime-mover change.
  `applyFuelDefaults()` is the single choke point for this; don't set
  `#effPct`/`#isblPerKw` anywhere else.
- **The Excel export is a from-scratch OOXML/zip writer** (`buildXlsx`,
  `zipStore`, `crc32`) — no external library, works fully offline. Validated
  by round-tripping through `openpyxl` in Python. If this ever needs
  extending, keep entries STORED (uncompressed) for simplicity; don't add
  DEFLATE unless there's a real size problem.
- **Saved analyses live in `sessionStorage`** (cleared on tab close, per the
  user's "temporary" requirement); **theme preference lives in `localStorage`**
  (persistent). Don't conflate the two.

## Data sourcing — what's solid vs. estimated (important, hard-won lesson)

During this session I cited sources for H₂/NH₃ efficiency deltas and CapEx
premiums, but when the user asked me to show *exactly* where in each source
the claim appears, several didn't hold up:

- **Solid, directly quoted:** NG-baseline efficiencies (Jenbacher Type 4 44%,
  Baker Hughes LM6000 PF+ 40.8% / 8,357 Btu/kWh), Wärtsilä 50SG unit rating
  (~18.3–18.9 MW), Wärtsilä 25 Ammonia **power output** now matching W25DF
  (LNG dual-fuel) — this is an output-parity fact, not a stated efficiency-%
  parity.
- **Inferred, not directly stated:** H₂ efficiency ≈ NG efficiency is an
  inference from "same engine platform, proven technology" — none of the
  hydrogen-engine sources state a specific % for 100% H₂ operation.
  Ammonia's small efficiency penalty (43%/38% vs 45%/40% NG) is my own
  layered assumption on top of the output-parity fact, not a quoted number.
- **Overreached / wrong citation:** the H₂/NH₃ **ISBL CapEx premiums**
  (+14–19% H₂, +23–31% NH₃) were attributed to "Wood Mackenzie *Hydrogen
  costs 2024*," but that article (as retrieved) only discusses electrolyzer
  capital costs ($1,500–2,000/kW), not power-plant fuel-handling premiums.
  That citation should be corrected in-app to say "engineering estimate, no
  direct published source" rather than implying it traces to that article.

**Lesson for future edits to this file:** when adding a "Source:" note, only
cite a reference if the specific number/claim was actually read in that
source — not just that the source is topically related. If a figure is an
inference or engineering estimate, label it as such explicitly rather than
attaching a citation that doesn't really back it. The user caught this by
simply asking "where does the link show this" — assume that question will be
asked and pre-empt it.

## Environment notes

- Direct `WebFetch` to vendor/analyst sites (Wärtsilä, INNIO/Jenbacher, EIA,
  Lazard, Baker Hughes, Wood Mackenzie, etc.) returns **403** — blocked by
  this environment's egress policy. Don't retry; use `WebSearch` instead,
  which works and returns quoted snippets adequate for sourcing.
- Headless verification uses the pre-installed Chromium at
  `/opt/node22/lib/node_modules/playwright` (global install; local
  `node_modules` doesn't have it). Pattern: launch, drive via `page.fill`/
  `page.selectOption`/`page.click`, assert via `$$eval`/`textContent`,
  screenshot for visual review.
- `.xlsx` output was validated with Python `openpyxl` (`pip install openpyxl`
  is available in this environment) — parse the workbook and check sheet
  names, cell types, and a few known values (e.g., the LCOE total cell)
  rather than just checking the zip structure is well-formed.

## Open follow-up (not yet done)

The user was offered, but hasn't yet confirmed, a fix to relabel the
CapEx-premium source notes in the app as unsourced engineering estimates
rather than attributing them to Wood Mackenzie. Do this the next time the
file is touched, or if the user asks for a "sourcing cleanup."
