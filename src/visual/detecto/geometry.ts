/**
 * The Detecto design's coordinate system — the reference drawing's own.
 *
 * `Docs references/Beam weight scale/Detecto-layout design.svg` is the source of truth
 * for every shape, proportion, position and spacing in this design, so rather than
 * re-draw it at some convenient scale, this design *adopts its frame*: the stage is the
 * drawing's 2048x1024 viewBox and every part is the drawing's own path, drawn where the
 * drawing puts it. Nothing is re-fitted, so at rest the design is the reference.
 *
 * What has to be added is the one thing a static drawing cannot state: where the beam
 * pivots, and how far along the bars a pound is worth. Both are recorded here, and both
 * are stated twice over — once as a measurement off the drawing, and once in the
 * mechanism (`sim/layout.ts`) in inches. `assertConsistent` below checks that the two
 * still agree, so the drawing and the physics cannot drift apart silently.
 *
 * THE PIVOT. The black block carrying the maker's bird is not part of the beam: it and
 * the indicator wire both stop dead at y 615.70, which is exactly the top edge of the
 * base. They stand on the base; the beam swings in the block. So the fulcrum is inside
 * it, and is taken at its centre line, on the datum the balance index is struck about.
 *
 * THE SCALE. Measured off the graduations of the reference photograph traced underneath
 * the artwork: the fine bar is divided every 27.95 units to the pound, the notched bar
 * every 2.12 — which is why the large poise has to be about thirteen times the weight of
 * the small one on this beam. The notches cut into the lower edge of the beam's window
 * confirm it: they fall in two interleaved series, 105 units apart for the 50 lb marks
 * and 93 apart for the 20 kg ones, a ratio of 1.13 that is exactly 50 lb / 20 kg.
 */
import { DETECTO_LAYOUT } from '../../sim/layout'
import { createProjection } from '../projection'
import { REF_VIEW_BOX } from './refPaths'

export const NS = 'dt'
export const gid = (n: string) => `${NS}-${n}`

export const VIEW_BOX = REF_VIEW_BOX

/** Drawing units to the inch. Fixes how the mechanism's inches land on the artwork. */
export const PX = 140

/** Centre of the fixed bearing housing, on the datum of the balance index. */
export const FULCRUM = { x: 613.6, y: 315.64 }

export const projection = createProjection({
  px: PX,
  fulcrum: FULCRUM,
  viewBox: VIEW_BOX,
})

export const L = DETECTO_LAYOUT

/* ------------------------------------------------------------------- bars */

/** A graduated bar: a bright pound band over a black kilogram band. */
export interface BandRect {
  x0: number
  x1: number
  /** Top of the pound band. */
  top: number
  /** Boundary between the two bands. */
  mid: number
  /** Bottom of the kilogram band. */
  bottom: number
  /** Where the zero graduation is struck. */
  zeroX: number
  /** Drawing units per pound along this bar. */
  unitsPerLb: number
}

export const UPPER_BAND: BandRect = {
  x0: 113.04,
  x1: 1853.96,
  top: 133.22,
  mid: 166.17,
  bottom: 199.13,
  // The fine poise is drawn parked at zero, so the zero mark is where its aperture
  // opens. Striking the bar anywhere else would move the poise off the reference.
  zeroX: 173.75,
  unitsPerLb: L.upperInPerLb * PX,
}

export const LOWER_BAND: BandRect = {
  x0: 761.79,
  x1: 1877.5,
  top: 427.45,
  mid: 465.11,
  bottom: 502.77,
  zeroX: 790.68,
  unitsPerLb: L.lowerInPerLb * PX,
}

/** Where a reading falls along a bar, in drawing units. */
export const tickX = (band: BandRect, lb: number) => band.zeroX + lb * band.unitsPerLb

/**
 * How far a poise has travelled from where the reference draws it, in drawing units.
 * Every moving part is placed this way — as a displacement from its reference position
 * — so the design at rest is the reference exactly, with nothing to round.
 */
export const poiseShift = (band: BandRect, lb: number) => lb * band.unitsPerLb

/* ----------------------------------------------------------------- poises */

/** The window a poise reads the bar through, and the block that carries it. */
export interface PoiseGeom {
  /** Bounding box of the moulding as drawn. */
  x0: number
  x1: number
  yTop: number
  yBottom: number
  /** The aperture, whose inboard edge is the reading index. */
  aperture: { x0: number; x1: number; yTop: number; yBottom: number }
}

export const UPPER_POISE: PoiseGeom = {
  x0: 173.75,
  x1: 315.86,
  yTop: 77.58,
  yBottom: 256.02,
  aperture: { x0: 173.75, x1: 224.95, yTop: 132.0, yBottom: 201.29 },
}

export const LOWER_POISE: PoiseGeom = {
  x0: 790.68,
  x1: 998.97,
  yTop: 284.34,
  yBottom: 580.05,
  aperture: { x0: 790.68, x1: 852.19, yTop: 414.26, yBottom: 496.95 },
}

/* ------------------------------------------------------- zero-trim screw */

/** The threaded rod and the nut that rides it, as drawn. */
export const TRIM = {
  rodFrom: 118.16,
  rodTo: 433.08,
  /** Axis of the screw rod. */
  y: 366.41,
  nut: { x0: 220.1, x1: 373.72, yTop: 284.34, yBottom: 448.44 },
}

/* ------------------------------------------------------------- furniture */

export const FRAME = { x0: 23.1, x1: 2038.48, yTop: 87.38, yBottom: 512.0 }
export const HOUSING = { x0: 461.52, x1: 765.67, yTop: 254.15, yBottom: 615.7 }
export const BASE = { x0: 64.82, x1: 1991.13, yTop: 615.7, yBottom: 930.01 }
/** Tip and base of the engraved balance index. */
export const INDEX = { tipX: 1942.18, baseX: 1874.17, y: 315.64 }

/**
 * The magnifier sits on the blank face of the base, clear of the slope at both ends:
 * the base is a shallow trapezoid running from (64.8, 615.7) down to (110.9, 829.3) on
 * the left and (1956.2, 827.2) on the right.
 */
export const LOUPE = { cx: 1636, cy: 748, r: 98, k: 3.4 }

/* ---------------------------------------------------------------- checks */

/**
 * The drawing and the mechanism describe the same beam in different units. If an edit to
 * either one breaks that, the poises would still slide but would no longer be pointing
 * at the marks they are calibrated to, which is the kind of error a screenshot does not
 * show. Cheap to check, so check it.
 */
function assertConsistent() {
  const problems: string[] = []
  const near = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol

  // The graduated travel must land inside the band it is struck on.
  const upperEnd = tickX(UPPER_BAND, L.upper.capacity)
  if (upperEnd > UPPER_BAND.x1)
    problems.push(`fine bar runs to ${upperEnd.toFixed(0)}, past the band at ${UPPER_BAND.x1}`)
  const lowerEnd = tickX(LOWER_BAND, L.lower.capacity)
  if (lowerEnd > LOWER_BAND.x1)
    problems.push(`notched bar runs to ${lowerEnd.toFixed(0)}, past the band at ${LOWER_BAND.x1}`)

  // The poise cg the mechanism uses has to be the cg of the moulding as drawn — the
  // reference centroids, in drawing units, are 260.46 / 910.87 across and 166.90 /
  // 429.35 down.
  const checks: [string, number, number][] = [
    ['fine poise cg x', projection.x(L.upper.zero), 260.46],
    ['fine poise cg y', projection.y(L.upper.cgHeight), 166.9],
    ['notched poise cg x', projection.x(L.lower.zero), 910.87],
    ['notched poise cg y', projection.y(L.lower.cgHeight), 429.35],
    ['trim nut cg x', projection.x(L.ball.xNominal), 296.91],
    ['trim nut cg y', projection.y(L.ball.height), TRIM.y],
    ['index tip', projection.x(L.pointerArm), INDEX.tipX],
  ]
  for (const [what, got, want] of checks) {
    if (!near(got, want, 0.6))
      problems.push(`${what}: mechanism puts it at ${got.toFixed(2)}, drawing at ${want}`)
  }

  if (problems.length) {
    console.error(
      '[detecto] the drawing and the mechanism disagree:\n  ' + problems.join('\n  '),
    )
  }
}

if (import.meta.env.DEV) assertConsistent()
