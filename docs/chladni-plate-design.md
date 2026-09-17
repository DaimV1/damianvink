# Interactive showcase research: Chladni Plate

Research date: 17 September 2026.

## Existing site and the opportunity

The live `/ai-lab` holds seven experiments: an exploded bearing assembly, globe, solar system, cursor-reactive particles, parametric bracket, communicating vessels and Evolution Lab. Six run through a shared three.js scene pipeline; Evolution Lab is a self-contained, pointer-driven component because its interaction (editing a map, stepping generations) didn't fit that pipeline. The eighth showcase needed to add real visual novelty rather than another variation on "inspect a 3D scene" or "edit a 2D layout."

## Patterns investigated

The assessment below is a design judgment for this portfolio, not a ranking of the reference concepts.

| Direction | Interaction pattern | Fit for an eighth showcase |
| --- | --- | --- |
| Truss / bridge load lab | Build a structure, apply a load, a statics solver color-codes tension/compression. | Strong domain fit (Damian's field is mechanical/machine building) and real algorithmic substance, but closer in spirit to the existing parametric bracket. |
| Thermal diffusion plate | Paint heat sources, a GPU heat-equation solver spreads a glowing map. | Low implementation risk — reuses the ping-pong shader technique already built for the vessels' water surface — but the "paint and watch it spread" loop resembles the ripple simulation visitors already see. |
| Suspension ride simulator | Tune spring/damper/mass, watch a chassis settle over a bump, read a live graph. | Solid vibrations narrative, but the strongest payoff is a line graph, not a visual departure from the rest of the lab. |
| Chladni plate | Choose two wave numbers; a real-time particle simulation shows sand finding the standing-wave pattern, live. | Chosen: a genuinely different visual class (glowing particles forming geometric figures on a dark plate, no 3D camera), an understandable premise before explaining any physics, and every parameter change produces an immediately different, often startling result. |

## The chosen experience

**Chladni Plate** shows the classic demonstration of standing waves: sand on a vibrating plate migrates away from the moving antinodes and collects on the still nodal lines, tracing out the plate's vibration mode. The two wave numbers a visitor picks are understandable as sliders before any explanation of eigenmodes.

The interaction loop:

1. Watch roughly 2,800 grains scatter and settle into the default mode's figure.
2. Move the two mode sliders (n, m) — the pattern reforms live, out of the currently-settled grains rather than a fresh scatter, so one figure visibly dissolves into the next.
3. Step through all 36 distinct patterns with "Next pattern," or let "Cycle through every pattern automatically" run as an ambient demo.
4. Drag across the plate to disturb the sand locally and watch it find its way back.
5. "Scatter the sand again" replays the chaos-to-order moment from full randomness.

## Implementation and deliberate limits

- The pattern is the widely used square-plate approximation `U(x,y) = cos(nπx)cos(mπy) − cos(mπx)cos(nπy)` for `x, y ∈ [0,1]` — a geometric model that reproduces recognizable Chladni figures, not a solved plate-vibration PDE. There is no audio component and no claim about an actual excitation frequency.
- Each grain drifts down the analytic gradient of `U²` (away from antinodes) and jitters in proportion to `|U|` (more agitation where the plate moves more); both vanish together on a nodal line, so grains settle on their own without an explicit "stop" rule.
- Gradient force is scaled by `1/(n+m)` and speed is clamped, so all 36 mode pairs — including the steepest, at the top of the 1–9 range — stay numerically stable.
- Swapping n and m only flips the sign of U, which doesn't change where it's zero, so the preset list only offers n < m to avoid showing the same figure twice.
- Rendering is a plain 2D canvas (glow via `lighter` composite), not WebGL — this is fundamentally a top-down phenomenon, and it keeps the demo free of any new runtime dependency, matching the rest of the lab.
- `prefers-reduced-motion` visitors get the settled figure directly (500 simulation steps computed synchronously, no visible animation) instead of the live swirl, and mode changes jump straight to the new figure rather than animating into it.
- Touch dragging and pointer capture follow the same approach already used for Evolution Lab's stops.
- Published entry point: `/ai-lab#chladni`; the other seven demos remain available.

Reference: [Wikipedia — Chladni figure](https://en.wikipedia.org/wiki/Chladni_figure).

## Verification scope

Tests cover: `U` is exactly zero at both plate corners and along the whole diagonal for any mode (both are algebraic identities of the formula, not floating-point approximations); the analytic gradient matches a finite-difference estimate; the preset list has no duplicate or out-of-order pairs; mean particle amplitude drops well below its starting value after settling; particles stay inside the plate and keep finite velocity even at the steepest mode pair; and settling is deterministic for a given seed. UI verification (headless Chromium against the dev server) covered: the default pattern settling from scatter, switching patterns, dragging to disturb the plate and watching it recover, the scatter-and-resettle loop, and layout at both desktop and mobile widths in both locales. `npm test`, `tsc --noEmit`, `eslint .` and a full `vite build` all pass. The production site should be checked after its normal Git/Vercel deployment finishes.
