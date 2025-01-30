export function gaussRng(μ = 0, σ = 1) {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * σ + μ;
}

export const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;

export const clamp = (min: number, max: number, v: number) =>
  Math.max(Math.min(max, v), min);
