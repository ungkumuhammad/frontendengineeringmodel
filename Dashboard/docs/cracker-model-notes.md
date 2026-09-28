# NH₃ Cracker Design module — data provenance

The `nh3-cracker-design.html` module (`/modules/nh3-cracker-design.html`,
registered in `lib/modules.ts` under the "Cracker Design" category) imports
licensor KPI figures from the `Gentari-ammoniacracker` repository's ammonia
cracking technology workstream, specifically:

- `Licensor/kbr/kbr-johor-hub.md` (KBR H2ACT®, Rev 0, 23 Dec 2025)
- `Licensor/Casale/Casale_Ammonia_Cracker__JohorHub.md` (Casale MACH2™, Rev.00, 05 Dec 2025)
- `Licensor/duiker/duiker-johor-hub.md` (Duiker AHC, 05 Dec 2025, Budgetary Proposal 122380)
- `Licensor/technip/technip-nippon-sanso-lbc-tolling.md` (Technip Energies / Nippon Sanso tolling)
- `tools/cracker_model/data.py` (that repo's single source-of-truth dataset, with
  per-figure citations and an explicit no-fabrication rule)
- `tcoedatabase/WIP_Ammonia_Cracker_Database.md` (chemistry, RFNBO/KEEI framework summary)

Every quantitative figure shown in the module (NH₃:H₂ mass ratio, energy
efficiency, H₂ purity, direct carbon intensity) is carried over verbatim from
those sources and is not independently derived or estimated. Where a
licensor's package is technical-only (Casale: no CAPEX/OPEX disclosed), the
module says so rather than filling in a placeholder.

## Link to storage model

The cracker module writes `localStorage["gentari.link.crackerToStorage.v1"]`
(`{ throughputKtpa, h2OutputKtpa, licensor, fuelMode, ts }`) when the user
clicks "🔗 Link model to storage". Because both modules are served from the
same origin (`/modules/*.html`, embedded via `<iframe>` with
`allow-same-origin`), `nh3-storage-design.html` reads that key on load and
offers to apply the required NH₃ feed as its `demand.throughputKtpa` input —
i.e. the cracker is treated as the demand-side offtaker of the storage/
receiving terminal. The key is cleared once applied or dismissed so a stale
link doesn't resurface on a later visit.

## Follow-ups / not yet modeled

- CAPEX/OPEX, LCOH and tolling-fee figures from the source repo (e.g. KBR's
  three ammonia-price-point OPEX/LCOH table, Duiker's €2.7M construction +
  €8.50/t H₂ operation license fee) are not yet surfaced in this module —
  only the sizing/KPI figures needed to compute the storage demand link.
- Capacity is currently a discrete licensor "case" (matching the source
  dataset's dataset points) rather than a continuous capacity curve; the
  NH₃:H₂ ratio is applied to whatever H₂ ktpa the user enters, which is a
  reasonable approximation but not itself sourced for capacities between
  the dataset points.
