/**
 * Graduation tables.
 *
 * The *divisions* are the mechanism's — a bar is divided to its notch interval or its
 * finest mark because that is what the poise weight and the load arm make it. How often
 * a design chooses to letter them, and whether it carries a second kilogram row, is the
 * design's business, so both are parameters here.
 */
import { LB_PER_KG } from '../sim/spec'
import type { BarSpec } from '../sim/layout'

export type TickKind = 'minor' | 'unit' | 'major'

export interface Tick {
  /** Position along the bar, in pounds indicated. */
  lb: number
  kind: TickKind
}

export interface KgTick {
  /** Where this kilogram mark falls, in pounds indicated. */
  lb: number
  kg: number
}

const near = (v: number, step: number) => {
  const r = Math.abs(v / step - Math.round(v / step))
  return r < 1e-6
}

export function buildTicks(opts: {
  to: number
  /** Finest division actually cut into the bar. */
  minor: number
  /** Interval of the medium ticks. */
  unit: number
  /** Interval of the long, lettered ticks. */
  major: number
  from?: number
}): Tick[] {
  const { to, minor, unit, major, from = 0 } = opts
  const out: Tick[] = []
  const n = Math.round((to - from) / minor)
  for (let i = 0; i <= n; i++) {
    const lb = from + i * minor
    out.push({
      lb,
      kind: near(lb, major) ? 'major' : near(lb, unit) ? 'unit' : 'minor',
    })
  }
  return out
}

/**
 * Kilogram marks laid out on a bar graduated in pounds: each one sits at the pound
 * position that corresponds to it, which is why the two rows do not line up.
 */
export function buildKgTicks(maxLb: number, stepKg: number, from = 0): KgTick[] {
  const out: KgTick[] = []
  for (let kg = from; kg * LB_PER_KG <= maxLb + 1e-9; kg += stepKg) {
    out.push({ kg, lb: kg * LB_PER_KG })
  }
  return out
}

/** The notches actually cut into a stepped bar. */
export const barDivisions = (bar: BarSpec) =>
  buildTicks({ to: bar.capacity, minor: bar.step, unit: bar.step, major: bar.step })

/** A sliding bar's comb, lettered every `majorEvery` pounds. */
export const barGraduations = (bar: BarSpec, unit: number, majorEvery: number) =>
  buildTicks({ to: bar.capacity, minor: bar.minor, unit, major: majorEvery })

export const labelled = (ticks: Tick[]) => ticks.filter((t) => t.kind === 'major')
