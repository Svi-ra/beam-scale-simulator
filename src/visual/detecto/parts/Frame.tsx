/**
 * The beam itself: the aluminium frame with its window, the two graduated bands, the
 * engraved balance index, and the zero-trim screw crossing the window at the left.
 *
 * Every silhouette here is the reference's own path. What this file adds is what the
 * reference draws as blank plate — the graduations. They are laid out from the
 * mechanism, not copied off the photograph: a tick is struck wherever the poise would
 * actually have to stand to read that many pounds, so the marks and the poise cannot
 * disagree. Their *style* — comb hanging from the top edge of the pound band, kilogram
 * comb rising from the bottom of the black one, a short tick at each pound notch and a
 * full-height rule at each kilogram one — follows the reference plate.
 */
import { memo } from 'react'
import { LB_PER_KG } from '../../../sim/spec'
import { barDivisions, barGraduations, buildKgTicks, labelled } from '../../ticks'
import { REF } from '../refPaths'
import { RefPart, RefShade } from './RefPart'
import {
  FRAME,
  L,
  LOWER_BAND,
  TRIM,
  UPPER_BAND,
  gid,
  tickX,
  type BandRect,
} from '../geometry'

/** The reference's own inks. */
const INK = '#231f20'
const REVERSED = '#f1f2f2'

/* --------------------------------------------------------------- the plate */

export const FramePlate = memo(function FramePlate() {
  return (
    <g>
      <RefPart shapes={REF.frame} filter={`url(#${gid('cast')})`} />
      <RefShade shapes={REF.frame} fill={`url(#${gid('lit')})`} opacity={0.32} />
      <RefPart shapes={REF.frameFillets} />
      <RefPart shapes={REF.screws} />
      <RefPart shapes={REF.leftNub} />
    </g>
  )
})

/** The engraved ▷ the beam is read against the fixed wire by. */
export const BalanceIndex = memo(function BalanceIndex() {
  return <RefPart shapes={REF.indexArrow} />
})

/**
 * The zero-trim screw. The rod is carried on a standard that can be raised or lowered,
 * which is the beam's sensitivity adjustment, so rod and nut travel together in y; the
 * nut travels along the rod in x.
 */
export const TrimScrew = memo(function TrimScrew({ dy }: { dy: number }) {
  // Inside the translated group, the frame's own rod line is back at `TRIM.y - dy`, so
  // the standards run from there to the rod.
  const from = Math.min(TRIM.y - dy, TRIM.y)
  return (
    <g transform={dy ? `translate(0 ${dy.toFixed(2)})` : undefined}>
      {/* The standards show only once the rod has been moved off its drawn height; at
          rest they have no height and the drawing is untouched. */}
      {Math.abs(dy) > 0.5 && (
        <g fill="#bcbec0" stroke={INK} strokeWidth={3} strokeMiterlimit={10}>
          <rect x={TRIM.rodFrom + 2} y={from} width={20} height={Math.abs(dy)} />
          <rect x={TRIM.rodTo - 22} y={from} width={20} height={Math.abs(dy)} />
        </g>
      )}
      <RefPart shapes={REF.thread} />
    </g>
  )
})

/* ------------------------------------------------------------------ bands */

function BandPlate({
  shapes,
  children,
}: {
  shapes: typeof REF.frame
  children?: React.ReactNode
}) {
  return (
    <g>
      <RefPart shapes={shapes} />
      <RefShade shapes={shapes} fill={`url(#${gid('band-lit')})`} opacity={0.34} />
      {children}
    </g>
  )
}

/**
 * The fine bar: graduated to a quarter of a pound, lettered every two, with a kilogram
 * row to a tenth of a kilogram beneath it.
 */
export const UpperBand = memo(function UpperBand() {
  const b = UPPER_BAND
  const x = (lb: number) => tickX(b, lb)
  const lbTicks = barGraduations(L.upper, 1, 2)
  const kgTicks = buildKgTicks(L.upper.capacity, 0.1)
  const kgMajor = buildKgTicks(L.upper.capacity, 1, 1)
  // Centre of the maker's marks on the reference plate.
  const plateX = 1704

  return (
    <g id={gid('upper-band')}>
      <BandPlate shapes={REF.upperBandWhite} />

      {/* pound comb, hanging from the top edge */}
      <g stroke={INK} strokeLinecap="butt">
        {lbTicks.map((t, i) => (
          <line
            key={i}
            x1={x(t.lb)}
            y1={b.top}
            x2={x(t.lb)}
            y2={b.top + (t.kind === 'minor' ? 11.05 : 16.9)}
            strokeWidth={t.kind === 'minor' ? 1.9 : 2.4}
          />
        ))}
      </g>
      <g fontSize={17} fontWeight={700} fill={INK} textAnchor="middle">
        {labelled(lbTicks)
          .filter((t) => t.lb > 0)
          .map((t) => (
            <text key={t.lb} x={x(t.lb)} y={b.mid - 1.2}>
              {t.lb}
            </text>
          ))}
      </g>

      <BandPlate shapes={REF.upperBandBlack} />

      {/* kilogram comb, rising from the bottom edge */}
      <g stroke={REVERSED} strokeLinecap="butt">
        {kgTicks.map((t, i) => {
          const major = Math.abs(t.kg - Math.round(t.kg)) < 1e-6
          return (
            <line
              key={i}
              x1={x(t.lb)}
              y1={b.bottom}
              x2={x(t.lb)}
              y2={b.bottom - (major ? 12.5 : 7.5)}
              strokeWidth={major ? 2.4 : 1.9}
            />
          )
        })}
      </g>
      <g fontSize={15} fontWeight={700} fill={REVERSED} textAnchor="middle">
        {kgMajor
          .filter((t) => t.lb <= L.upper.capacity)
          .map((t) => (
            <text key={t.kg} x={x(t.lb)} y={b.bottom - 14.5}>
              {Math.round(t.kg)}
            </text>
          ))}
      </g>

      <ZeroLegend band={b} side="left" lbSize={16} kgSize={15} zeroSize={19} />

      {/* maker's marks, out beyond the last graduation */}
      <text
        x={plateX}
        y={b.mid - 1.2}
        textAnchor="middle"
        fontSize={22}
        fontWeight={700}
        letterSpacing="0.5"
        fill={INK}
      >
        DETECTO
      </text>
      <text
        x={plateX}
        y={b.bottom - 8}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        letterSpacing="0.6"
        fill={REVERSED}
      >
        WEBB CITY, MO. U.S.A.
      </text>
    </g>
  )
})

/**
 * The notched bar. A short tick marks each pound notch and carries its numeral; a rule
 * the full depth of the pound band marks each kilogram notch and carries its own. The
 * two series are struck from the same zero but at different intervals, which is why
 * they drift apart along the bar — exactly as the notches cut into the beam's window
 * edge above them do.
 */
const LB_SIZE = 29

/**
 * The notched bar.
 *
 * A rule the full depth of the pound band is struck at every notch and the notch's
 * numeral set in the cell just beyond it, which is what lets the poise's window frame
 * the reading it is actually standing at — park it at zero and the window shows
 * `0 lb / kg`, exactly as the reference draws it, and at every other notch it shows
 * that notch's figure the same way.
 *
 * The kilogramme row keeps its own marks at its own interval underneath. The two series
 * are struck from one zero but 50 lb and 20 kg apart, so they drift past one another
 * along the bar — the reason the reference's own plate ends up lettered a little
 * unevenly, and the reason the kilogramme marks are kept to their own band here rather
 * than run up through the pound numerals.
 */
export const LowerBand = memo(function LowerBand() {
  const b = LOWER_BAND
  const x = (lb: number) => tickX(b, lb)
  const notches = barDivisions(L.lower)
  const kgTicks = buildKgTicks(L.lower.capacity, 20)
  // Set hard against the outboard end of the band, where the reference has it, so it
  // cannot crowd the last notch however the numerals fall.
  const capX = b.x1 - 11
  const capKg = Math.round(L.capacity / LB_PER_KG)

  return (
    <g id={gid('lower-band')}>
      <BandPlate shapes={REF.lowerBandWhite} />

      {/* a rule the full depth of the band at every notch */}
      <g stroke={INK} strokeWidth={4.4}>
        {notches.map((t) => (
          <line key={t.lb} x1={x(t.lb)} y1={b.top} x2={x(t.lb)} y2={b.mid} />
        ))}
      </g>
      <g fontSize={LB_SIZE} fontWeight={700} fill={INK} textAnchor="start">
        {notches
          .filter((t) => t.lb > 0)
          .map((t) => (
            <text key={t.lb} x={x(t.lb) + 7} y={b.mid - 4}>
              {t.lb}
            </text>
          ))}
      </g>

      <BandPlate shapes={REF.lowerBandBlack} />

      <g stroke={REVERSED} strokeWidth={4.4}>
        {kgTicks.map((t) => (
          <line key={t.kg} x1={x(t.lb)} y1={b.mid} x2={x(t.lb)} y2={b.mid + 10} />
        ))}
      </g>
      <g fontSize={26} fontWeight={700} fill={REVERSED} textAnchor="middle">
        {kgTicks
          .filter((t) => t.kg > 0)
          .map((t) => (
            <text key={t.kg} x={x(t.lb)} y={b.bottom - 7}>
              {t.kg}
            </text>
          ))}
      </g>

      <ZeroLegend band={b} side="right" lbSize={22} kgSize={21} zeroSize={27} />

      {/* capacity, stated from the mechanism rather than copied off the plate */}
      <text x={capX} y={b.mid - 4} textAnchor="end" fontSize={23} fontWeight={700} fill={INK}>
        CAP.-{L.capacity}lb.x{Math.round(L.upper.minor * 16)}oz
      </text>
      <text
        x={capX}
        y={b.bottom - 7}
        textAnchor="end"
        fontSize={23}
        fontWeight={700}
        fill={REVERSED}
      >
        CAP.-{capKg}kgx100g
      </text>
    </g>
  )
})

/**
 * The `0 lb / kg` legend struck at a bar's zero. On the fine bar it is set outboard of
 * the zero mark, where the parked poise leaves it showing; on the notched bar it is set
 * inboard, where the parked poise frames it in its window. Both follow the reference.
 */
function ZeroLegend({
  band,
  side,
  lbSize,
  kgSize,
  zeroSize,
}: {
  band: BandRect
  side: 'left' | 'right'
  lbSize: number
  kgSize: number
  zeroSize: number
}) {
  const zx = band.zeroX + (side === 'left' ? -3 : 7)
  const tagX = side === 'left' ? zx - zeroSize * 0.72 : zx + zeroSize * 0.72
  const anchor = side === 'left' ? 'end' : 'start'
  return (
    <g fontWeight={700}>
      <text
        x={zx}
        y={band.mid + zeroSize * 0.34}
        textAnchor={side === 'left' ? 'end' : 'start'}
        fontSize={zeroSize}
        fill={INK}
        // The numeral straddles both rows, so the half over the black band is reversed
        // out by the clip below rather than being drawn twice.
        clipPath={`url(#${gid('white-row')})`}
      >
        0
      </text>
      <text
        x={zx}
        y={band.mid + zeroSize * 0.34}
        textAnchor={side === 'left' ? 'end' : 'start'}
        fontSize={zeroSize}
        fill={REVERSED}
        clipPath={`url(#${gid('black-row')})`}
      >
        0
      </text>
      <text x={tagX} y={band.mid - 2} textAnchor={anchor} fontSize={lbSize} fill={INK}>
        lb.
      </text>
      <text
        x={tagX}
        y={band.bottom - 7}
        textAnchor={anchor}
        fontSize={kgSize}
        fill={REVERSED}
      >
        kg
      </text>
    </g>
  )
}

/** Clips that let a numeral straddle the two rows and change colour at the boundary. */
export const RowClips = memo(function RowClips() {
  return (
    <>
      <clipPath id={gid('white-row')}>
        <rect
          x={FRAME.x0}
          y={FRAME.yTop}
          width={FRAME.x1 - FRAME.x0}
          height={UPPER_BAND.mid - FRAME.yTop}
        />
        <rect
          x={FRAME.x0}
          y={LOWER_BAND.top}
          width={FRAME.x1 - FRAME.x0}
          height={LOWER_BAND.mid - LOWER_BAND.top}
        />
      </clipPath>
      <clipPath id={gid('black-row')}>
        <rect
          x={FRAME.x0}
          y={UPPER_BAND.mid}
          width={FRAME.x1 - FRAME.x0}
          height={UPPER_BAND.bottom - UPPER_BAND.mid}
        />
        <rect
          x={FRAME.x0}
          y={LOWER_BAND.mid}
          width={FRAME.x1 - FRAME.x0}
          height={LOWER_BAND.bottom - LOWER_BAND.mid}
        />
      </clipPath>
    </>
  )
})

