/**
 * Rigid-body model of the beam.
 *
 * Geometry convention:
 *   - The fulcrum knife-edge sits in the pillar head at the origin.
 *   - +x runs along the beam away from the load: the LONG arm, carrying the two
 *     graduated poise bars. Readings increase with x.
 *   - -x is the SHORT arm: the load knife-edge, where the steelyard rod from the
 *     platform lever train pulls down.
 *   - +y is up, measured from the pivot edge.
 *   - theta > 0 rotates the bar end DOWN and the short arm UP, i.e. the poises outweigh
 *     the load.
 *
 * Torque about the fulcrum, positive in the direction of increasing theta, of a weight
 * w at beam-frame position (x, y):   tau = w * (x*cos(theta) + y*sin(theta))
 *
 * The y*sin(theta) part is the whole of the Fairbanks stability argument: weight above
 * the pivot edge (y > 0) produces a torque that grows with the tilt and so drives the
 * beam further over, while weight below it (y < 0) pulls the beam back.
 *
 * Nothing here knows which design is on screen. Everything that varies between beams
 * arrives as a `BeamLayout`, so a new mechanism is a new layout, not a new solver.
 */

import { PLATFORM } from './spec'
import type { BarSpec, BeamLayout } from './layout'

export interface Mechanism {
  /** Load standing on the platform, lb. */
  loadLb: number
  /** Lower (large) poise setting, lb. */
  lowerLb: number
  /** Upper (small) poise setting, lb. */
  upperLb: number
  /** Balance-ball position along its screw rod, in. */
  ballX: number
  /** Height of the screw rod above the pivot edge, in. */
  ballHeight: number
  /** A deliberate calibration error, expressed in pounds of false reading. */
  tareErrorLb: number
  /** The beam this mechanism is part of. */
  layout: BeamLayout
}

export interface TorqueTerm {
  id: string
  label: string
  /** Weight, lbf. */
  w: number
  /** Beam-frame position, in. */
  x: number
  y: number
}

/** Where a poise's centre of gravity stands when its bar reads `lb`, in. */
export const poiseX = (bar: BarSpec, lb: number, inPerLb: number) =>
  bar.zero + lb * inPerLb

/** Distance of the large poise from the fulcrum, in. */
export const lowerPoiseX = (L: BeamLayout, lb: number) =>
  poiseX(L.lower, lb, L.lowerInPerLb)

/** Distance of the small poise from the fulcrum, in. */
export const upperPoiseX = (L: BeamLayout, lb: number) =>
  poiseX(L.upper, lb, L.upperInPerLb)

/** The reading a poise standing `xin` inches from the fulcrum is showing, lb. */
export const lowerLbAt = (L: BeamLayout, xin: number) =>
  (xin - L.lower.zero) / L.lowerInPerLb
export const upperLbAt = (L: BeamLayout, xin: number) =>
  (xin - L.upper.zero) / L.upperInPerLb

/** Every weight acting on the beam, in beam-frame coordinates. */
export function torqueTerms(m: Mechanism): TorqueTerm[] {
  const L = m.layout
  return [
    {
      id: 'lower',
      label: 'Large poise',
      w: L.lowerPoiseWeight,
      x: lowerPoiseX(L, m.lowerLb),
      y: L.lower.cgHeight,
    },
    {
      id: 'upper',
      label: 'Small poise',
      w: L.upperPoiseWeight,
      x: upperPoiseX(L, m.upperLb),
      y: L.upper.cgHeight,
    },
    { id: 'ball', label: 'Balance ball', w: L.ball.weight, x: m.ballX, y: m.ballHeight },
    {
      id: 'body',
      label: 'Beam casting',
      w: L.body.weight,
      x: L.bodyCgX,
      y: -L.body.cgDrop,
    },
    {
      id: 'tare',
      label: 'Calibration error',
      w: m.tareErrorLb * L.momentPerLb,
      x: 1,
      y: 0,
    },
    {
      id: 'load',
      label: 'Platform pull',
      w: m.loadLb / PLATFORM.ratio,
      x: -L.loadArm,
      y: 0,
    },
  ]
}

/** Net torque on the beam at tilt `theta`, lbf·in. */
export function netTorque(m: Mechanism, theta: number): number {
  const c = Math.cos(theta)
  const s = Math.sin(theta)
  let t = 0
  for (const term of torqueTerms(m)) t += term.w * (term.x * c + term.y * s)
  return t
}

/**
 * Restoring stiffness about the horizontal, lbf·in/rad (positive = stable).
 * k = W_beam·h  −  Σ (weights carried above the pivot edge)·(their height)
 */
export function stiffness(m: Mechanism): number {
  let k = 0
  for (const term of torqueTerms(m)) k -= term.w * term.y
  return k
}

/** Undamped natural period of the beam, seconds. Infinite when the beam is unstable. */
export function naturalPeriod(m: Mechanism): number {
  const k = stiffness(m)
  if (k <= 0) return Infinity
  return 2 * Math.PI * Math.sqrt(m.layout.inertia / k)
}

export function dampingRatio(m: Mechanism, c: number): number {
  const k = stiffness(m)
  if (k <= 0) return 0
  return c / (2 * Math.sqrt(k * m.layout.inertia))
}

/**
 * The reading the poises are showing, in pounds — this is what the operator reads off
 * the bars, whether or not the beam is actually in balance.
 */
export const indicatedLb = (m: Mechanism) => m.lowerLb + m.upperLb

/**
 * Pounds by which the poise side outweighs the load side (positive = the beam's bar end
 * goes down). Derived from the static torque, so it folds in the balance ball and any
 * zero error.
 */
export const unbalanceLb = (m: Mechanism) => netTorque(m, 0) / m.layout.momentPerLb

/**
 * How far the zero is off, in pounds: the reading the poises must show for a load that
 * is truly zero. Everything that is not the load and not the poises — the beam casting,
 * the balance ball, any calibration error — lands here. This is what traversing the
 * balance ball is for.
 */
export function zeroOffsetLb(m: Mechanism): number {
  const standing = netTorque({ ...m, loadLb: 0, lowerLb: 0, upperLb: 0 }, 0)
  return -standing / m.layout.momentPerLb
}

/** Poise settings that bring the beam to rest for the present load. */
export function solvePoises(m: Mechanism): {
  total: number
  lowerLb: number
  upperLb: number
  overCapacity: boolean
} {
  const L = m.layout
  const total = m.loadLb + zeroOffsetLb(m)
  const clamped = Math.max(0, Math.min(L.capacity, total))
  let lowerLb = Math.floor(clamped / L.lower.step) * L.lower.step
  if (lowerLb > L.lower.capacity) lowerLb = L.lower.capacity
  let upperLb = clamped - lowerLb
  if (upperLb > L.upper.capacity) {
    lowerLb = Math.min(L.lower.capacity, lowerLb + L.lower.step)
    upperLb = clamped - lowerLb
  }
  upperLb = Math.max(0, Math.round(upperLb / L.upper.minor) * L.upper.minor)
  return {
    total,
    lowerLb,
    upperLb,
    overCapacity: total > L.capacity + 1e-9,
  }
}

export interface Motion {
  theta: number
  omega: number
}

/**
 * One fixed-step integration of the beam. Semi-implicit Euler is stable and cheap at
 * the sub-millisecond step we run it at, and it preserves the slow, heavy character of
 * the real beam better than smoothing the angle toward its target would.
 */
export function integrate(
  motion: Motion,
  m: Mechanism,
  damping: number,
  dt: number,
): void {
  const tau = netTorque(m, motion.theta) - damping * motion.omega
  motion.omega += (tau / m.layout.inertia) * dt
  motion.theta += motion.omega * dt

  // Trig loop — the index runs into the top or bottom of the balance window.
  const max = m.layout.thetaMax
  if (motion.theta > max) {
    motion.theta = max
    if (motion.omega > 0) motion.omega *= -0.12
  } else if (motion.theta < -max) {
    motion.theta = -max
    if (motion.omega < 0) motion.omega *= -0.12
  }
}

/**
 * Layout-neutral: 'over' means the poises outweigh the load (positive beam angle) and
 * 'under' the reverse. Which way that moves a *pointer* depends on where a given scale
 * design puts the pointer relative to the fulcrum, so that mapping belongs to the
 * visual layer, not here.
 */
export type BalanceStatus = 'balanced' | 'over' | 'under' | 'swinging' | 'runaway'

/**
 * What the operator would say about the beam right now. The threshold on angular rate
 * is the point at which the index stops visibly creeping — a few pixels a second at the
 * index tip — not true zero, which a damped beam only reaches asymptotically.
 */
export function balanceStatus(m: Mechanism, motion: Motion): BalanceStatus {
  if (stiffness(m) <= 0) return 'runaway'
  if (Math.abs(motion.omega) > 0.02) return 'swinging'
  const frac = motion.theta / m.layout.thetaMax
  // The trig loop's centre band is the operator's "floating in the middle" target.
  if (Math.abs(frac) < 0.22) return 'balanced'
  return frac > 0 ? 'over' : 'under'
}
