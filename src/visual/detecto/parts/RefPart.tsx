/**
 * Draws a group of reference paths exactly as the drawing has them.
 *
 * Fill, stroke and stroke width come straight from the reference's own stylesheet, so
 * this is the one place the artwork is turned into SVG and there is nowhere for a shape
 * to be quietly adjusted. `stroke-miterlimit` is the reference's 10; the drawing has
 * sharp corners that would otherwise be bevelled off by the SVG default of 4.
 */
import { memo } from 'react'
import type { SVGProps } from 'react'
import type { RefShape } from '../refPaths'

export const RefPart = memo(function RefPart({
  shapes,
  ...rest
}: { shapes: RefShape[] } & SVGProps<SVGGElement>) {
  return (
    <g strokeMiterlimit={10} {...rest}>
      {shapes.map((s, i) => (
        <path
          key={i}
          d={s.d}
          fill={s.fill}
          stroke={s.stroke ?? 'none'}
          strokeWidth={s.strokeWidth}
        />
      ))}
    </g>
  )
})

/**
 * The same silhouettes again, filled with one paint instead of their own. Laid over a
 * part at low opacity it shades the moulding without touching its outline, which is how
 * this design gets any modelling at all without departing from a flat reference.
 */
export const RefShade = memo(function RefShade({
  shapes,
  fill,
  opacity,
}: {
  shapes: RefShape[]
  fill: string
  opacity: number
}) {
  return (
    <g fill={fill} opacity={opacity} style={{ pointerEvents: 'none' }}>
      {shapes.map((s, i) => (
        <path key={i} d={s.d} />
      ))}
    </g>
  )
})
