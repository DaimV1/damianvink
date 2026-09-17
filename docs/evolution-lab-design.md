# Interactive showcase research: Evolution Lab

Research date: 17 September 2026.

## Existing site and the opportunity

The live `/ai-lab` and its source contain six experiments: an exploded bearing assembly, globe, solar system, cursor-reactive particles, parametric bracket and communicating vessels. They primarily involve inspecting scenes and adjusting physical or visual parameters. The new experience gives visitors authorship over a problem and shows an algorithm responding to it.

## Patterns investigated

The assessment below is a design judgment for this portfolio, not a ranking of the reference projects. These sources were reviewed for interaction patterns; no source implementation or assets were copied.

| Direction | Primary reference | Interaction pattern | Fit for a seventh showcase |
| --- | --- | --- | --- |
| Algorithm exploration | [Red Blob Games: A*](https://www.redblobgames.com/pathfinding/a-star/introduction.html) | Edit inputs directly; inspect a changing result; step through decisions. | Strong: makes invisible computation understandable and gives edits a clear consequence. |
| Machine-learning playground | [TensorFlow Playground](https://playground.tensorflow.org/) | Modify data/model controls; inspect live training and loss. | Strong learning loop, but a network editor would introduce many concepts before a casual visitor could experiment confidently. |
| Creative music tools | [Chrome Music Lab](https://musiclab.chromeexperiments.com/Experiments) | Compose and receive immediate audible feedback, without an account. | Distinct and playful; sound would add friction for visitors browsing silently. |
| Emergent visual simulation | [Karl Sims: reaction-diffusion](https://www.karlsims.com/rd.html) | Change system parameters and observe patterns emerging from simple rules. | Visually compelling, but closer to the lab's existing particle and fluid experiences. |
| Evolutionary search | [The Nature of Code: evolutionary computing](https://natureofcode.com/genetic-algorithms/) | Candidate solutions compete, combine and mutate over generations. | Chosen: a simple objective, visible progress, editable problem and a real algorithm running locally. |

## The chosen experience

**Evolution Lab** explores a closed route through visitor-controlled stops. The goal—visit each stop and return while reducing total distance—is understandable before explaining genetic algorithms.

The interaction loop:

1. Open a ready-to-use 18-stop map or choose scatter, clusters or ring.
2. Add, drag or remove stops to create a different problem.
3. Evolve a population, pause, or advance one generation.
4. Compare the current best tour with the best tour from generation zero.
5. Change mutation probability or restart the same seeded experiment to compare outcomes.

Visible evidence includes generation count, best distance, percentage reduction, an improvement history and optional alternative routes. The three short explanations connect selection, crossover and mutation with what the visitor sees.

## Implementation and deliberate limits

- A population of 160 permutations, tournament selection, order crossover, inversion mutation and two unchanged elites.
- Distance uses a closed Euclidean tour in abstract map units, including the return edge. No real-world road or travel-time claim.
- Percentage reduction compares with the best member of the initial population, not an arbitrarily poor route.
- This is a stochastic optimization heuristic. The interface says **best**, not **optimal**; no claim of globally shortest distance.
- Seeded initialization makes restarts reproducible. Preset maps also use deterministic coordinates.
- Manual start, pause and single-step controls; no autoplay. Work pauses in hidden documents and stops after 1,000 generations.
- Four to 32 stops bounds computation. Changing the map resets the search and pauses it rather than mixing incompatible histories.
- SVG rendering, native pointer capture and existing React UI primitives; no new runtime dependency, remote inference, account or API key.
- Touch dragging, keyboard arrow-key movement, Delete/Backspace removal and an explicit Add stop button.
- Dutch and English copy use the existing locale provider. Surrounding UI follows the site's theme.
- Published entry point: `/ai-lab#evolution`; the other six demos remain available.

Pointer interaction reference: [MDN: setPointerCapture](https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture).

## Verification scope

Tests cover closing-edge distance, valid tours at minimum/maximum map sizes, exact candidate fitness, elite preservation, repeatable seeds and improvement on the default map. UI verification covers starting/pausing/stepping, editing, reset, mutation, comparison controls, presets, responsive layout and switching between demos. The production site should be checked after its normal Git/Vercel deployment finishes.
