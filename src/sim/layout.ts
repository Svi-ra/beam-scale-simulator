/**
 * The mechanical arrangement of a beam — the part of the machine a *design* decides.
 *
 * The physics in `physics.ts` is the same for every scale: weights hung at distances
 * from a knife-edge. What differs between a 19th-century Fairbanks steelyard and a
 * modern clinical beam head is where the knife-edge sits relative to the bars, how long
 * each bar's graduated travel is, how heavy each poise is, and how far above or below
 * the pivot edge each mass rides. All of that lives here, so a new design can bring its
 * own mechanism as well as its own drawing without touching the solver.
 *
 * A layout is pure data and is read, never written. The engine holds the active one;
 * a `ScaleVisual` names which layout it draws.
 *
 * UNITS: inches, pounds-force (lbf), seconds. +x runs along the arm carrying the
 * graduated bars, −x toward the load knife-edge, +y up from the pivot edge.
 */

import { PLATFORM } from './spec'

/** One graduated poise bar. */
export interface BarSpec {
  /** Greatest reading the bar carries, lb. */
  capacity: number
  /** Interval the poise can actually rest at, lb. A notched bar steps; a plain one is
   * graduated to its finest mark and the poise slides. */
  step: number
  /** Finest graduation cut into the bar, lb. */
  minor: number
  /**
   * Where the poise's centre of gravity sits when the bar reads zero, in.
   * This is a *mechanical* quantity, not a drawn one: it can fall on either side of the
   * fulcrum, because only the change in moment as the poise travels is what the
   * graduations measure. Whatever constant moment the parked poise contributes is
   * counterpoised by the beam casting.
   */
  zero: number
  /** Length of graduated travel from zero to capacity, in. */
  travel: number
  /** Height of the poise's centre of gravity above the pivot edge, in (negative = below). */
  cgHeight: number
}

/** The screw-borne trim weight — Fairbanks' "balance ball". */
export interface BallSpec {
  weight: number
  /** Position along the beam when the scale is trimmed to true zero, in. */
  xNominal: number
  /** Travel each way along the screw rod, in. */
  xTravel: number
  /** Height of the screw rod above the pivot edge, in. */
  height: number
  /** How far the rod's standard can be raised or lowered, in. */
  heightRange: readonly [number, number]
}

export interface BodySpec {
  weight: number
  /** Drop of the beam's own centre of gravity below the pivot edge, in. */
  cgDrop: number
  /** Radius of gyration about the fulcrum, in. */
  radiusOfGyration: number
}

export interface BeamLayoutSpec {
  id: string
  /** Fulcrum knife-edge to load knife-edge, in. The short arm. */
  loadArm: number
  /** Fulcrum to the tip of the balance index, in. */
  pointerArm: number
  /** Half-travel of the index inside its loop or bracket, degrees. */
  trigLoopHalfAngle: number
  lower: BarSpec
  upper: BarSpec
  ball: BallSpec
  body: BodySpec
}

/** A layout with everything the solver needs already worked out. */
export interface BeamLayout extends BeamLayoutSpec {
  /** Moment produced at the beam by one pound on the platform, lbf·in/lb. */
  momentPerLb: number
  /** Weight of each poise, lbf. Not a free parameter: it follows from the bar. */
  lowerPoiseWeight: number
  upperPoiseWeight: number
  /** Inches of poise travel per pound indicated. */
  lowerInPerLb: number
  upperInPerLb: number
  /** Where the beam's own centre of gravity must sit for the graduations to read true. */
  bodyCgX: number
  /** Rotational inertia about the fulcrum, lbf·in·s². */
  inertia: number
  capacity: number
  ballXMin: number
  ballXMax: number
  thetaMax: number
}

const G_IN_S2 = 386.088 // standard gravity, in/s²

/**
 * Fills in everything that follows from a layout rather than being chosen.
 *
 * A poise's weight is fixed by its bar: to move the reading by one pound the poise must
 * travel `travel / capacity` inches and produce `loadArm / ratio` lbf·in there, so
 * `w = capacity · momentPerLb / travel`. Making the weight derived rather than declared
 * is what keeps a design's graduations from being able to lie about its mechanism.
 *
 * The beam casting's centre of gravity is then placed to counterpoise the two parked
 * poises and the trim weight, which is what puts the zero of both bars at a true zero.
 */
export function makeLayout(spec: BeamLayoutSpec): BeamLayout {
  const momentPerLb = spec.loadArm / PLATFORM.ratio
  const lowerPoiseWeight = (spec.lower.capacity * momentPerLb) / spec.lower.travel
  const upperPoiseWeight = (spec.upper.capacity * momentPerLb) / spec.upper.travel
  const parked =
    lowerPoiseWeight * spec.lower.zero +
    upperPoiseWeight * spec.upper.zero +
    spec.ball.weight * spec.ball.xNominal

  return {
    ...spec,
    momentPerLb,
    lowerPoiseWeight,
    upperPoiseWeight,
    lowerInPerLb: spec.lower.travel / spec.lower.capacity,
    upperInPerLb: spec.upper.travel / spec.upper.capacity,
    bodyCgX: -parked / spec.body.weight,
    inertia: (spec.body.weight / G_IN_S2) * spec.body.radiusOfGyration ** 2,
    capacity: spec.lower.capacity + spec.upper.capacity,
    ballXMin: spec.ball.xNominal - spec.ball.xTravel,
    ballXMax: spec.ball.xNominal + spec.ball.xTravel,
    thetaMax: (spec.trigLoopHalfAngle * Math.PI) / 180,
  }
}

/**
 * Fairbanks-pattern shop steelyard, as the Classic design draws it: both bars struck
 * from the same zero a little outboard of the fulcrum and given the same travel, the
 * large poise a saddle whose brass hangs just under the pivot edge, the small poise
 * riding a raised bar well above it.
 */
export const FAIRBANKS_LAYOUT = makeLayout({
  id: 'fairbanks',
  loadArm: 0.5,
  pointerArm: 2.9,
  trigLoopHalfAngle: 2.5,
  lower: { capacity: 450, step: 50, minor: 50, zero: 0.6, travel: 9.0, cgHeight: -0.05 },
  upper: { capacity: 50, step: 0.25, minor: 0.25, zero: 0.6, travel: 9.0, cgHeight: 0.68 },
  ball: {
    weight: 0.11,
    xNominal: -0.7,
    xTravel: 0.2,
    height: 1.1,
    heightRange: [0, 3.6],
  },
  body: { weight: 1.2, cgDrop: 0.3, radiusOfGyration: 4.0 },
})

/**
 * The clinical beam head of the Detecto reference drawing.
 *
 * Every number here is measured off that drawing and divided by its scale of 140 units
 * to the inch, with the fulcrum taken at the centre of the fixed bearing housing — the
 * black block that stands on the base and that the beam swings in. See
 * `visual/detecto/geometry.ts`, which works the same measurements the other way, from
 * inches back to the drawing's own frame.
 *
 * Two things about it are unlike the Fairbanks beam and are the reason a layout has to
 * be a per-design thing at all:
 *
 *  - The two bars are struck from different zeros and given very different travels. The
 *    fine bar runs nearly the whole length of the beam and its zero falls *behind* the
 *    fulcrum, on the short-arm side; the notched bar is much more compressed and starts
 *    well out on the long arm. That makes the large poise about thirteen times the
 *    weight of the small one, where on the Fairbanks beam it is nine.
 *  - The large poise is a deep moulding that hangs most of its mass below the bar, so
 *    its centre of gravity is a long way under the pivot edge. That is what stiffens
 *    this beam, and it is why the trim weight has to be substantial to be able to soften
 *    it again.
 */
export const DETECTO_LAYOUT = makeLayout({
  id: 'detecto',
  loadArm: 0.5,
  // Index tip at drawing x 1942.18.
  pointerArm: 9.48986,
  trigLoopHalfAngle: 2.5,
  lower: {
    capacity: 400,
    step: 50,
    minor: 50,
    // Poise centroid at drawing x 910.87 with the poise parked at the bar's zero.
    zero: 2.12338,
    // 400 lb at 2.12 drawing units to the pound.
    travel: 6.057143,
    cgHeight: -0.8122,
  },
  upper: {
    capacity: 50,
    step: 0.25,
    minor: 0.25,
    // Poise centroid at drawing x 260.46 — behind the fulcrum at 613.60.
    zero: -2.52246,
    // 50 lb at 27.95 drawing units to the pound.
    travel: 9.982143,
    cgHeight: 1.0624,
  },
  ball: {
    // A solid block 1.1 in square on the drawing, not the small brass ball of the patent.
    weight: 0.8,
    // Nut centroid at drawing x 296.91.
    xNominal: -2.26207,
    xTravel: 0.45,
    // The screw rod runs at drawing y 366.41, just under the pivot edge at 315.64.
    height: -0.3625,
    heightRange: [-0.5, 1.5],
  },
  body: { weight: 1.2, cgDrop: 0.3, radiusOfGyration: 4.0 },
})

export const LAYOUTS: Record<string, BeamLayout> = {
  [FAIRBANKS_LAYOUT.id]: FAIRBANKS_LAYOUT,
  [DETECTO_LAYOUT.id]: DETECTO_LAYOUT,
}
