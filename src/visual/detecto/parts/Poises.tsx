/**
 * The two poises and the zero-trim nut.
 *
 * Each is the reference's own moulding, drawn where the reference draws it and then
 * displaced along the beam by however far the simulation says it has travelled. At the
 * default setting the displacement is zero, so what is on screen is the drawing.
 *
 * The drag target is the moulding's own outline rather than a box around it, so the
 * cursor changes exactly where the part is.
 */
import { memo } from 'react'
import { REF } from '../refPaths'
import { RefPart, RefShade } from './RefPart'
import { LOWER_BAND, UPPER_BAND, gid, poiseShift } from '../geometry'
import type { PartHandle } from '../../shared/useBeamInteraction'
import type { PoiseGeom } from '../geometry'

function Moulding({
  shapes,
  dx,
  dy = 0,
  handle,
}: {
  shapes: typeof REF.lowerPoise
  dx: number
  dy?: number
  handle?: PartHandle
}) {
  return (
    <g transform={`translate(${dx.toFixed(2)} ${dy.toFixed(2)})`} {...handle}>
      <RefPart shapes={shapes} filter={`url(#${gid('cast-sm')})`} />
      <RefShade shapes={shapes} fill={`url(#${gid('moulded')})`} opacity={0.55} />
    </g>
  )
}

export const UpperPoise = memo(function UpperPoise({
  lb,
  handle,
}: {
  lb: number
  handle: PartHandle
}) {
  return <Moulding shapes={REF.upperPoise} dx={poiseShift(UPPER_BAND, lb)} handle={handle} />
})

export const LowerPoise = memo(function LowerPoise({
  lb,
  handle,
}: {
  lb: number
  handle: PartHandle
}) {
  return <Moulding shapes={REF.lowerPoise} dx={poiseShift(LOWER_BAND, lb)} handle={handle} />
})

/** The nut on the zero-trim screw. It rides the rod, so it takes the rod's height too. */
export const TrimNut = memo(function TrimNut({
  dx,
  dy,
  handle,
}: {
  dx: number
  dy: number
  handle: PartHandle
}) {
  return <Moulding shapes={REF.trimNut} dx={dx} dy={dy} handle={handle} />
})

/** Bounding boxes, for the equilibrium ghost outlines. */
export const poiseBox = (g: PoiseGeom, dx: number) => ({
  x: g.x0 + dx,
  y: g.yTop,
  width: g.x1 - g.x0,
  height: g.yBottom - g.yTop,
})
