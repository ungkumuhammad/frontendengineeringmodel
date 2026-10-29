# CLAUDE.md

## Brand

This repository uses the Gentari brand. Before making any visual output (dashboard UI,
modules, decks, documents, charts), read [`brand/README.md`](./brand/README.md) and follow it:

- Gentari Purple `#60269E` and Gentari Cyan `#00C8E8` are the core colours.
- Logos are in `Dashboard/public/branding/`. Use the full lockup only on light backgrounds;
  on purple or dark backgrounds use the icon alone.
- If you change a brand rule, update `brand/README.md`, `brand/gentari-brand-guideline.html`
  and the rendered `brand/gentari-brand-guideline.png` together.

## Excel outputs (NH3 storage design)

When producing an Excel workbook for the NH3 storage design, every calculated figure must be an Excel formula linked back to the input cells,
so changing an input recalculates the workbook. Fill every formula cell that changes with the inputs in yellow (`FFFF99`); inputs are blue text.
See "Excel export" in [`Dashboard/docs/storage-economics.md`](./Dashboard/docs/storage-economics.md).
