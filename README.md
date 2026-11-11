# Hydraulic Jumps — Interactive Flow Lab

Version 1 of the Fluid Mechanics educational website. Open **index.html** in a browser to use it. No installation or build is required; keep `styles.css`, `hydraulics.js` and `app.js` beside it.

## What works
- Synchronized sliders and numeric inputs for upstream depth, velocity and channel width.
- Six preset flow regimes, animated side-view flume, pause/slow motion, reduced-motion support.
- Ideal sequent-depth, continuity, energy-head-loss and dissipated-power calculations.
- Live depth-ratio and specific-energy graphs, plus CSV export of current calculated values.
- Responsive layout, theory, assumptions, references and an unfinished-submission checklist.

This is an ideal hydraulic-jump calculation with an illustrative animation, not CFD or a gate/tailwater solver. No experimental measurements are claimed. Main-channel flow is left to right, with local surface recirculation illustrated inside a developed roller.

## Local preview
Double-click `index.html`, or open it from File Explorer using your browser. Optional local server: `python -m http.server 8000` then visit http://localhost:8000.

## Verification
With Node installed: `node --test tests/hydraulics.test.js`. The tests check known analytical values, continuity, momentum and energy balance across the supported input grid, invalid inputs and regime boundaries. Syntax: `node --check app.js` and `node --check hydraulics.js`.

## Collaboration and publishing
Work is on `hydraulic-jumps-v1`, descended from the original `test-hydraulic-jumps` branch. Save locally, commit, then push to share changes. Teammates pull the same branch to obtain them. `main` is unchanged.

GitHub Pages has not been enabled by this change. The repository owner can select the version branch and `/ (root)` under repository Settings → Pages to publish this static site, or merge an approved version into the intended publishing branch. The source branch URL is not a running website.

See [project notes](docs/PROJECT-NOTES.md) for provenance, model boundaries and remaining rubric work. The files under `examples/` are unchanged AI-generated reference examples and can contain errors; they are not the reviewed website.
