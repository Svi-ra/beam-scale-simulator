/**
 * Beam-frame inches → SVG user units.
 *
 * The simulation works in inches measured from the fulcrum knife-edge, with +x along
 * the arm carrying the graduated bars and +y up. Every design picks its own scale and
 * its own place on the canvas for the fulcrum; nothing else about a design leaks into
 * the numbers the physics uses.
 */
import type { Box, Point } from './types'

export interface Projection {
  /** SVG units per inch. */
  px: number
  /** Where the fulcrum sits on the canvas. */
  fulcrum: Point
  viewBox: Box
  /** Beam-frame x (inches) → SVG x. */
  x(inches: number): number
  /** Beam-frame y (inches, up-positive) → SVG y (down-positive). */
  y(inches: number): number
  /** A length in inches → a length in SVG units. */
  u(inches: number): number
  /** A beam-frame point → an SVG point. */
  pt(xin: number, yin: number): Point
  /** SVG x → beam-frame inches. */
  inverseX(svgX: number): number
}

export function createProjection(opts: {
  px: number
  fulcrum: Point
  viewBox: Box
}): Projection {
  const { px, fulcrum, viewBox } = opts
  const x = (inches: number) => fulcrum.x + inches * px
  const y = (inches: number) => fulcrum.y - inches * px
  return {
    px,
    fulcrum,
    viewBox,
    x,
    y,
    u: (inches: number) => inches * px,
    pt: (xin, yin) => ({ x: x(xin), y: y(yin) }),
    inverseX: (svgX: number) => (svgX - fulcrum.x) / px,
  }
}
