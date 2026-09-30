# NH₃ Cracker Design module — data provenance

`public/modules/nh3-cracker-design.html` sizes an ammonia cracker from a
required H₂ capacity and returns technical sizing, CAPEX, OPEX and LCOH. All
source figures come from the `Gentari-ammoniacracker` repository:

- `Licensor/kbr/kbr-johor-hub.md` and `Licensor/kbr/I.E_GENTARIFeed__Product_ALL_Rev0.md`
  (KBR H2ACT®, Rev 0, 23 Dec 2025)
- `Licensor/duiker/duiker-johor-hub.md` (Duiker AHC, Budgetary Proposal 122380, 05 Dec 2025)
- `Licensor/Casale/…` (process description, used for the flow diagram checks only)
- `tolling/vopak/…`, `tolling/vtti/…` (tolling route)

## Technology bases

| Basis | Fuel modes | Notes |
|---|---|---|
| KBR H2ACT® | NG100, NG50, CF100 | Interpolated between 12/24/68/80 ktpa data points; held at the end values outside that range |
| Duiker AHC | NH₃-fired, NG-fired | Single 12 ktpa data point |
| Custom | 100 % clean fuel (7.2), natural gas (6.5), maximum NG (5.7) | Gentari basis: 5.66 kg NH₃ per kg H₂ to product, 1.54 kg NH₃-eq of firing. Maximum NG needs a double PSA; CAPEX uplift is an input (default 10 %) |

Casale is excluded from the cost model (technical-only package).

## CAPEX curves

CAPEX = a × (H₂ ktpa)^b, least-squares fit in log space, computed at runtime.

- **KBR ISBL** — stated points (§4.1): 78 / 110 / 191 / 209 MM USD. b ≈ 0.52.
- **KBR total installed** — 120.9 MM USD at 12 ktpa is stated (§4.2). 24/68/80 ktpa
  are derived from KBR's own LCOH: (LCOH × H₂ − OPEX) ÷ CRF(8 %, 25 yr), averaged over
  the price points and fuel modes (≈ 164 / 258 / 281 MM USD). This method reproduces
  the stated 120.9 at 12 ktpa. b ≈ 0.44. Implied OSBL falls from 55 % to ≈ 35 % of ISBL,
  consistent with KBR's note that OSBL "reduces for larger capacity".
- **Duiker** — €47M at 12 ktpa (lump-sum turnkey incl. buildings, civil, EPC and the
  construction licence fee, Table 8), converted at the FX input. Only one point, so the
  exponent is borrowed from the KBR total fit (editable).

## OPEX

Ammonia is split into two cost lines: cracked to product H₂ and used as fuel. The product
share uses 5.63 t/t for KBR (KBR §4.2: 33.8 MM$ "ammonia cracked for product" at 500 USD/t,
12 ktpa) and 5.66 t/t for Duiker and Custom (Duiker Table 1: 5.66/7.03). KBR's KPI ratio of
6.40 t/t at 12 ktpa NG100 exceeds the 6.35 its OPEX split implies, so the model's NH₃-fuel
line reads 4.6 MM$ against KBR's 4.3 MM$.

Bottom-up: quantities × user prices (NH₃ USD/t, electricity USD/MWh, NG USD/MWh LHV),
plus reference-specific lines:

- KBR other consumables: 0.4 MM USD/yr at 12 ktpa → 33.3 USD/t H₂.
- KBR fixed O&M: 6.9 MM USD at 12 ktpa (stated); 24/68/80 ktpa derived from the OPEX
  slope between KBR's NH₃ price points, less NG, power and consumables (≈ 8.3–8.9 MM USD).
  Fitted power law, exponent ≈ 0.11.
- Duiker: catalyst €0.2M/yr (variable), labour + maintenance €0.5M/yr (fixed, scaled with
  the KBR fixed-cost exponent), operation licence fee €8.50/t H₂.

LCOH = (CAPEX × CRF + OPEX) ÷ H₂. On KBR's basis at 12 ktpa NG100 the model gives
4.94 USD/kg against KBR's published 4.90 (+0.9 %).

## Flagged discrepancies

- Duiker NH₃-fired ratio: Tables 1 and 7 say 7.03 t/t, §3 text says 7.05. The module uses
  7.03; `tools/cracker_model/data.py` in the cracker repo uses 7.05.
- Duiker construction licence fee: Table 8 and §4.2 include it in the €47M; `data.py`
  treats the €2.7M as additive.
- Custom natural-gas and clean-fuel tail gas of 0.84 kg NH₃-eq implies 87.1 % PSA recovery,
  not the 88 % given in the earlier Gentari description.
- 5.66 kg NH₃/kg H₂ uses rounded molar masses; the exact value is 5.63.

## Link to storage model

"🔗 Link model to storage" writes `localStorage["gentari.link.crackerToStorage.v1"]`
(`{ throughputKtpa, h2OutputKtpa, licensor, fuelMode, ts }`). The storage module reads
the key on load and offers to apply the NH₃ throughput as `demand.throughputKtpa`, then
clears it.

## Natural gas price unit (added 2026-09-30)

The NG price input has a unit dropdown, USD/MWh or USD/MMBtu. The model works in USD/MWh
(LHV energy); MMBtu input is converted with 1 MWh = 3.6 GJ ÷ 1.055056 GJ/MMBtu = 3.4121 MMBtu.
This is an energy-unit conversion only. Gas quoted per MMBtu is usually on an HHV basis while the
model consumes LHV energy, so adjust the price if you need that basis. Switching the unit keeps
the same price and re-expresses it.

## Custom fuel mode (added 2026-09-30)

With basis = Custom, the Fuel mode list has a fourth option, "Custom — enter your own numbers".
Inputs: NH₃ drawn from storage (t/t H₂), NH₃ cracked (t/t H₂), natural-gas firing (kg NH₃-eq/kg H₂),
single or double PSA. Derived as for the three preset pathways: tail gas = cracked − 5.66, direct NH₃ =
feed − cracked, NG CO₂ from the KBR I.E emission factor. Cracked is clamped to ≥ 5.66 and feed to
≥ cracked, with a flag shown. Defaults equal the 100 % clean-fuel pathway. CAPEX, power and fixed
O&M follow the chosen reference curve; double PSA applies the CAPEX uplift input. Not licensor-quoted.

## OSBL equipment tab (added 2026-09-30)

Lists KBR's OSBL equipment (I.H, Units 101–114, 40 items) sized for the H₂ capacity entered, plus a
scaling curve of any one item versus H₂ output. Port of `tools/kbr_osbl_workbook.py` in
Gentari-ammoniacracker (its 12 / 24 / 80 / 160 ktpa results are reproduced exactly: genset
1,080 / 1,929 / 6,121 / 12,241 kWe). Between 12, 24 and 80 ktpa, power, NG, NH₃ feed and H₂ are
interpolated linearly from I.E; above 80 and below 12 ktpa they scale proportionally. All I.F
utility maxima scale linearly from 12 ktpa. 160 ktpa is extrapolated. Six items are TBD (fire water,
flare KO drum heater, off-spec tank, oil-water package, ammoniacal drain drum and pumps). The list is
KBR's, so for Duiker or Custom it is only an indicative OSBL reference. Assumptions A1–A14 are editable
on the tab; emergency power keeps the repo owner's ×2 load allowance and flags KBR I.F Note 9 (0.3 MW).

## Footprint and CO₂ mass balance (added 2026-09-30)

Technical sizing now shows **plot footprint, ISBL + OSBL**. ISBL comes from licensor plot data: KBR §3.6
(power-law fit, 1,225.8 × ktpa^0.41 m²) or Duiker §3.10 (two-point fit, 162.6 × ktpa^0.69 m²). No OSBL
area exists in the KBR, Duiker or Casale packages, so OSBL is an input, **% of ISBL, default 50 %, an
assumption to replace with a site layout**. KBR ISBL excludes offsites and utilities; Duiker excludes NH₃
storage and H₂ compression above 50 barg.

Technical sizing also shows **direct CO₂ from a carbon balance** next to the licensor figure: NG burned ×
carbon fraction × 44.01/12.011. NG composition is KBR I.A §5 (MW 16.95, 75.1 wt % C) giving 2.752 kg CO₂/kg NG,
identical to KBR I.E (1,150 kg/h ÷ 417.9 kg/h). It reproduces KBR's 0.81 / 0.45 / 0.00. For Duiker NG-fired
the NG energy implied by its 90.6 % efficiency gives ≈0.24 vs Duiker's stated 0.21 (flagged). CO₂ only; N₂O and
CH₄ slip are not in any source, so CO₂e = CO₂.
