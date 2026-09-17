/** A seeded, permutation-based genetic search for a closed Euclidean tour.
 * Order crossover, tournament selection, inversion mutation and two elites.
 * This is a heuristic: the best tour found is not a proven optimum.
 */
export type Stop = { x: number; y: number };
export type Candidate = { order: number[]; distance: number };
export type Evolution = {
  population: Candidate[];
  generation: number;
  initial: Candidate;
  history: number[];
  seed: number;
};
export const POPULATION = 160;
export const MAX_STOPS = 32;
export const MAX_GENERATIONS = 1000;
export type Layout = "scatter" | "clusters" | "ring";
export function randomSource(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (Math.imul(1664525, value) + 1013904223) >>> 0;
    return value / 4294967296;
  };
}
export function makeLayout(layout: Layout, seed = 42): Stop[] {
  const random = randomSource(seed);
  return Array.from({ length: 18 }, (_, i) => {
    if (layout === "ring") {
      const angle = (i * Math.PI * 2) / 18;
      return { x: 400 + Math.cos(angle) * 310, y: 260 + Math.sin(angle) * 190 };
    }
    if (layout === "clusters") {
      const centers = [
        [170, 150],
        [620, 180],
        [400, 390],
      ];
      const [x, y] = centers[i % 3];
      return { x: x + (random() - 0.5) * 170, y: y + (random() - 0.5) * 120 };
    }
    return { x: 65 + random() * 670, y: 65 + random() * 390 };
  });
}
export function routeDistance(stops: Stop[], order: number[]): number {
  return order.reduce((total, index, i) => {
    const a = stops[index];
    const b = stops[order[(i + 1) % order.length]];
    return total + Math.hypot(a.x - b.x, a.y - b.y);
  }, 0);
}
function shuffled(size: number, random: () => number) {
  const order = Array.from({ length: size }, (_, i) => i);
  for (let i = size - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}
export function startEvolution(stops: Stop[], seed = 917): Evolution {
  const random = randomSource(seed);
  const population = Array.from({ length: POPULATION }, () => {
    const order = shuffled(stops.length, random);
    return { order, distance: routeDistance(stops, order) };
  }).sort((a, b) => a.distance - b.distance);
  return {
    population,
    generation: 0,
    initial: population[0],
    history: [population[0].distance],
    seed,
  };
}
export function evolve(state: Evolution, stops: Stop[], mutation: number): Evolution {
  const random = randomSource(state.seed + (state.generation + 1) * 7919);
  const candidate = (order: number[]) => ({ order, distance: routeDistance(stops, order) });
  const select = () => {
    let best = state.population[Math.floor(random() * POPULATION)];
    for (let i = 0; i < 3; i++) {
      const next = state.population[Math.floor(random() * POPULATION)];
      if (next.distance < best.distance) best = next;
    }
    return best.order;
  };
  const population = state.population.slice(0, 2);
  while (population.length < POPULATION) {
    const a = select();
    const b = select();
    let left = Math.floor(random() * a.length);
    let right = Math.floor(random() * a.length);
    if (left > right) [left, right] = [right, left];
    const section = a.slice(left, right + 1);
    const used = new Set(section);
    const rest = b.filter((value) => !used.has(value));
    const order = [...rest.slice(0, left), ...section, ...rest.slice(left)];
    if (random() < mutation) {
      left = Math.floor(random() * order.length);
      right = Math.floor(random() * order.length);
      if (left > right) [left, right] = [right, left];
      const reversed = order.slice(left, right + 1).reverse();
      order.splice(left, reversed.length, ...reversed);
    }
    population.push(candidate(order));
  }
  population.sort((a, b) => a.distance - b.distance);
  return {
    ...state,
    population,
    generation: state.generation + 1,
    history: [...state.history, population[0].distance],
  };
}
