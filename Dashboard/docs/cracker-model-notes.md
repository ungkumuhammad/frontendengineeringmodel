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
