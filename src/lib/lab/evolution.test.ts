import assert from "node:assert/strict";
import test from "node:test";
import { evolve, makeLayout, POPULATION, routeDistance, startEvolution } from "./evolution.ts";

test("distance includes the closing edge", () => {
  assert.equal(
    routeDistance(
      [
        { x: 0, y: 0 },
        { x: 3, y: 0 },
        { x: 3, y: 4 },
        { x: 0, y: 4 },
      ],
      [0, 1, 2, 3],
    ),
    14,
  );
});
test("search keeps valid tours, exact fitness and a non-increasing best distance", () => {
  for (const mutation of [0, 0.25, 1]) {
    const stops = makeLayout("scatter");
    let state = startEvolution(stops);
    const initial = state.initial.distance;
    for (let generation = 0; generation < 150; generation++) {
      const previous = state.population[0].distance;
      state = evolve(state, stops, mutation);
      assert.equal(state.population.length, POPULATION);
      assert.ok(state.population[0].distance <= previous);
      for (const candidate of state.population) {
        assert.deepEqual(
          [...candidate.order].sort((a, b) => a - b),
          Array.from({ length: stops.length }, (_, i) => i),
        );
        assert.equal(candidate.distance, routeDistance(stops, candidate.order));
      }
    }
    assert.ok(state.population[0].distance < initial * 0.85);
    assert.equal(state.history.length, state.generation + 1);
  }
});
test("restart reproduces the search and presets remain inside the editable map", () => {
  for (const layout of ["scatter", "clusters", "ring"] as const) {
    const stops = makeLayout(layout);
    assert.ok(stops.every((p) => p.x >= 30 && p.x <= 770 && p.y >= 35 && p.y <= 485));
    assert.deepEqual(
      evolve(startEvolution(stops), stops, 0.25),
      evolve(startEvolution(stops), stops, 0.25),
    );
  }
});
test("four stops and the maximum 32 stops remain valid", () => {
  for (const count of [4, 32]) {
    const stops = Array.from({ length: count }, (_, i) => ({
      x: 80 + i * 20,
      y: 80 + (i % 7) * 45,
    }));
    let state = startEvolution(stops);
    for (let i = 0; i < 20; i++) state = evolve(state, stops, 1);
    assert.equal(new Set(state.population[0].order).size, count);
    assert.ok(Number.isFinite(state.population[0].distance));
  }
});
