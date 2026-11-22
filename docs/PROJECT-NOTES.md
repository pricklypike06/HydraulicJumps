# Project notes — version 1

## Provenance
Jeff provided `Hydraulic Jumps - Sania.html` and `Hydraulic Jumps - Praapti.html`. Their SHA-256 hashes match: `42afc43f5c86d2969fce835f5481b1a66cbcc8fe730f670d3eeb720bef73eb40`. Both are preserved unmodified under examples. The filenames identify the supplied files, not independently verified authorship or model identity.

The conversation supplied a teammate's Muse prompt: “Explain hydralic jumps and create a website based explaining the following. make sure it includes an animation of an experiment done in a rectangular channel with an input box for values that we might have to change.” The exact underlying Muse model/version has not been established.

Codex implemented version 1 using HTML/CSS/JavaScript after Jeff approved the scope. Do not count this record alone as a completed comparison between two identified models. Obtain the exact model names and implementation evidence from teammates.

## Decisions and corrections
- Use browser-native Canvas and SVG instead of Blender or a server application, following the user's preference for a website with immediate slider updates.
- Retain the ideal Bélanger depth relation, continuity, Froude number and specific-energy-loss calculation, separated into a testable calculation module.
- Replace manually drawn theory curves with generated curves. Current input values appear on the graphs.
- Remove invented experimental measurements, a claimed universal bias, the unsupported 0.968 correction and an unverified fitted R². Actual data can be added once its source and measurement procedure are available.
- Do not claim dimensional analysis derives the exact conjugate-depth equation. It supplies dimensionless dependencies; momentum and continuity supply the ideal relation.
- Show undular waves without a developed turbulent roller. Keep bulk downstream flow pointing downstream.
- Do not predict jump location/length or claim the user controls tailwater. Assume matching sequent tailwater; label the animation illustrative and not to scale.
- Validate numeric input, support subcritical/critical conditions, and respect reduced-motion preferences.

## Model
Water: rho=1000 kg/m³; g=9.81 m/s². Upstream depth y1, velocity V1, width B. q=y1 V1; Q=Bq; Fr1=V1/sqrt(g y1). If Fr1>1, r=(sqrt(1+8 Fr1²)-1)/2; y2=r y1; V2=q/y2; E=y+V²/(2g); loss=(y2-y1)³/(4y1 y2); dissipated power=rho g Q loss. Fr1<=1 gives no finite free-jump prediction.

Assume a horizontal constant-width channel, hydrostatic pressures at far end sections, velocity correction factors equal to one and negligible external drag. The sequent depth is conditional on a suitable downstream boundary. Real air entrainment, viscous/roughness/sidewall effects and nonuniform velocities are outside this model. The animation is constructed geometry and tracers, not a solution to turbulent free-surface flow.

## Remaining submission work
- Record exact AI models, original prompts and outputs, second-model critique, and justified decisions.
- Compare actual implementations from at least two different models as required by the supplied rubric.
- Verify each member's contributions with the group; no contribution allocations have been invented.
- Add presentation YouTube link and a viewable verbatim auto-generated transcript.
- Follow the rubric's practice-transcript and AI-critique comments instructions.
- Confirm final presentation/documentation, engineering content, sources and public hosting.

## References
- USBR, Engineering Monograph 25: https://www.usbr.gov/tsc/techreferences/hydraulics_lab/pubs/EM/EM25.pdf
- FHWA, HEC-14: https://www.fhwa.dot.gov/engineering/hydraulics/pubs/hec/hec14si.pdf

The supplied screenshots of the professor's example and CivilGEO diagram informed the requested controls/illustration direction. No reference-site image was copied into this version.
