export const clamp = (v: number, lo: number, hi: number) =>
  v < lo ? lo : v > hi ? hi : v

/** Snap to a graduation, keeping binary float error out of the reading. */
export const quantize = (v: number, step: number) => Math.round(v / step) * step

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export const DEG = 180 / Math.PI
