/**
 * Proportions of the Classic design: a 19th-century Fairbanks-pattern steelyard, with
 * the pointer carried on the short arm inside a trig loop on the pillar head.
 *
 * All of it is beam-frame inches. Nothing here is known to the simulation — change any
 * of these and the weighing behaviour is untouched.
 */
import { FAIRBANKS_LAYOUT } from '../../sim/layout'
import { createProjection } from '../projection'

export const VIEW_BOX = { w: 1060, h: 430 }

export const projection = createProjection({
  px: 68,
  fulcrum: { x: 310, y: 300 },
  viewBox: VIEW_BOX,
})

/** The beam casting. Its top edge carries the fulcrum knife-edge and the notches. */
export const BODY = { xFrom: -1.4, xTo: 9.95, yTop: 0, yBottom: -0.6 }

/** The raised upper poise bar and the standards that carry it. */
export const UPPER_BAR = {
  xFrom: 0.32,
  xTo: 9.9,
  yBottom: 0.5,
  yTop: 0.86,
  standards: [0.45, 9.78],
}

/** Balance-ball standard and screw rod. */
export const BALL_RIG = { standardX: -1.15, rodFrom: -1.15, rodTo: -0.32 }

/** Fixed structure: the pillar head and its bearing stanchions. */
export const HEAD = {
  xFrom: -3.62,
  xTo: 1.05,
  yTop: -0.9,
  height: 82,
  postX: [-0.34, 0.34],
  postHalf: 0.07,
  capFrom: 0.14,
}

export const TRIG = {
  cx: -FAIRBANKS_LAYOUT.pointerArm,
  cy: -0.3,
  innerHalfW: 0.43,
  innerHalfH: 0.18,
  frameHalfW: 0.57,
  frameHalfH: 0.33,
}

export const LARGE_POISE = {
  halfW: 0.5,
  yTop: 0.34,
  yBottom: -0.56,
  /** Aperture the engraved numeral on the bar face reads through. */
  window: { halfW: 0.37, yTop: -0.13, yBottom: -0.47 },
}

export const SMALL_POISE = {
  halfW: 0.2,
  yTop: 1.02,
  yBottom: 0.38,
  window: { halfW: 0.13, yTop: 0.84, yBottom: 0.56 },
}

export const LOUPE = { cx: 900, cy: 92, r: 66, k: 3.4 }

export const NS = 'cl'
export const gid = (n: string) => `${NS}-${n}`
