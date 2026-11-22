# Hydraulic Jumps V1 Implementation Plan

> Execute inline in the current session using the approved design and verification workflow.

**Goal:** Build a shareable teaching demo with a live rectangular-channel animation and quantitative graphs.
**Architecture:** Pure calculation module shared between browser and Node tests; separate UI/animation module and stylesheet; static index.html without build dependencies.
**Tech Stack:** HTML, CSS, JavaScript, Canvas, SVG, Node built-in test runner.
**Spec:** ../specs/2026-11-11-hydraulic-jumps-design.md

## Constraints
Keep main unchanged. Preserve both source examples. No fabricated experimental results or contribution claims. Site works by opening index.html. Commit and push the approved version branch; no automatic public deployment.

## Review focus
Critical/subcritical inputs must suppress jump outputs. Reject nonfinite/nonpositive model inputs. Synchronize numeric and slider ranges. Animation must pause and respect reduced motion. Graph scales must accommodate the full input range and mark the current calculation.

## Tasks
- [x] Add numerical tests: known Fr=2 conjugate ratio, continuity, momentum and energy balance across a parameter grid, no-jump boundary and invalid inputs. Run them red before implementation.
- [x] Implement hydraulics.js with calculateJump({depth,velocity,width}) and classifyJump(fr), then run tests green.
- [x] Build index.html, styles.css and app.js: controls, responsive animation, preset cases, two live SVG plots, export current calculated values as CSV, explanations and project checklist. Check browser interactions and narrow viewport.
- [x] Preserve original examples and record provenance and remaining rubric tasks in project documentation. Check source syntax, tests and Git diff.
- [x] Transfer files to the approved local checkout; rename the test branch, commit, push and verify the remote head. Retire the empty old test ref only after the replacement is confirmed and unchanged.

## Verification record
Numerical tests: 5/5 pass, including a 60-case input grid. JavaScript syntax checks pass. Browser checks: default, subcritical and strong presets; slider/number synchronization; invalid value rejection; pause/slow motion; CSV download content; 390px viewport without horizontal overflow. No console warnings/errors. Independent review found only a native numeric step mismatch, corrected with step=any. Screenshot saved outside the published source. Publishing remains pending.
