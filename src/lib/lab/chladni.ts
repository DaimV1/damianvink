/**
 * Chladni figures: the nodal-line patterns sand forms on a vibrating plate,
 * because grains bounce off the moving antinodes and come to rest only
 * where the plate stays still. This models a square plate with the classic
 * two-mode combination used across interactive Chladni demos —
 * U(x,y) = cos(nπx)cos(mπy) − cos(mπx)cos(nπy) — a geometric approximation
 * of the real eigenmodes, not a solved plate-vibration PDE.
 * See https://en.wikipedia.org/wiki/Chladni_figure
 *
 * Sand is simulated as particles in the unit square [0,1]×[0,1] that drift
 * down the gradient of U² (away from antinodes, toward nodal lines) and
 * jitter in proportion to the local amplitude |U| — the same rule of thumb
 * used to explain why real sand collects exactly on the nodes: agitation is
 * strongest where the plate moves most, and vanishes where it doesn't.
 */

export type Mode = { n: number; m: number };
export type Particle = { x: number; y: number; vx: number; vy: number };

export const MODE_RANGE = { min: 1, max: 9 };
export const PARTICLE_COUNT = 2800;
export const DEFAULT_MODE: Mode = { n: 3, m: 5 };

/** Every distinct (n, m) pair in range — swapping n and m only flips U's sign, so n < m avoids duplicates. */
export const CHLADNI_PRESETS: Mode[] = (() => {
  const modes: Mode[] = [];
  for (let n = MODE_RANGE.min; n <= MODE_RANGE.max; n++) {
    for (let m = n + 1; m <= MODE_RANGE.max; m++) modes.push({ n, m });
  }
  return modes.sort((a, b) => a.n + a.m - (b.n + b.m) || a.n - b.n);
})();

/** Small deterministic LCG so particle scatter and settling are reproducible in tests. */
export function randomSource(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (Math.imul(1664525, value) + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

export function chladniValue(n: number, m: number, x: number, y: number): number {
  const nx = n * Math.PI * x;
  const my = m * Math.PI * y;
  const mx = m * Math.PI * x;
  const ny = n * Math.PI * y;
  return Math.cos(nx) * Math.cos(my) - Math.cos(mx) * Math.cos(ny);
}

export function chladniGradient(n: number, m: number, x: number, y: number): [number, number] {
  const npi = n * Math.PI;
  const mpi = m * Math.PI;
  const snx = Math.sin(npi * x);
  const cny = Math.cos(npi * y);
  const sny = Math.sin(npi * y);
  const cnx = Math.cos(npi * x);
  const smx = Math.sin(mpi * x);
  const cmy = Math.cos(mpi * y);
  const smy = Math.sin(mpi * y);
  const cmx = Math.cos(mpi * x);
  const dx = -npi * snx * cmy + mpi * smx * cny;
  const dy = -mpi * cnx * smy + npi * cmx * sny;
  return [dx, dy];
}

export function makeParticles(count: number, seed = 1): Particle[] {
  const random = randomSource(seed);
  return Array.from({ length: count }, () => ({ x: random(), y: random(), vx: 0, vy: 0 }));
}

const DRIFT = 5.5;
const JITTER = 0.5;
const DAMPING_RATE = 5;
/** Caps per-step displacement so high mode numbers (steep gradients) can't fling a grain across the plate in one frame. */
const MAX_SPEED = 3;

export function stepParticle(
  p: Particle,
  n: number,
  m: number,
  dt: number,
  random: () => number,
): Particle {
  const u = chladniValue(n, m, p.x, p.y);
  const [gx, gy] = chladniGradient(n, m, p.x, p.y);
  // Gradient magnitude grows with n + m; divide it back out so drift strength feels the same at every mode.
  const scale = 1 / (n + m);
  let vx = p.vx - DRIFT * u * gx * scale * dt;
  let vy = p.vy - DRIFT * u * gy * scale * dt;
  const amplitude = Math.abs(u);
  vx += (random() - 0.5) * JITTER * amplitude;
  vy += (random() - 0.5) * JITTER * amplitude;
  const damping = Math.exp(-DAMPING_RATE * dt);
  vx *= damping;
  vy *= damping;
  const speed = Math.hypot(vx, vy);
  if (speed > MAX_SPEED) {
    vx = (vx / speed) * MAX_SPEED;
    vy = (vy / speed) * MAX_SPEED;
  }
  let x = p.x + vx * dt;
  let y = p.y + vy * dt;
  if (x < 0) {
    x = -x;
    vx = -vx;
  } else if (x > 1) {
    x = 2 - x;
    vx = -vx;
  }
  if (y < 0) {
    y = -y;
    vy = -vy;
  } else if (y > 1) {
    y = 2 - y;
    vy = -vy;
  }
  return { x, y, vx, vy };
}

export function stepParticles(
  particles: Particle[],
  n: number,
  m: number,
  dt: number,
  random: () => number,
): Particle[] {
  return particles.map((p) => stepParticle(p, n, m, dt, random));
}

/** Mean |U| across a particle set — falls as sand settles onto the nodal lines. */
export function meanAmplitude(particles: Particle[], n: number, m: number): number {
  const total = particles.reduce((sum, p) => sum + Math.abs(chladniValue(n, m, p.x, p.y)), 0);
  return total / particles.length;
}
