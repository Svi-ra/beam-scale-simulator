/**
 * Generic graduation rendering. Given a table of divisions and a way to turn pounds
 * into an x coordinate, these draw the comb and the numerals — how long the ticks are,
 * which way they point and what colour they are is up to the caller.
 */
import { memo } from 'react'
import type { KgTick, Tick, TickKind } from '../ticks'

export interface TickScaleProps {
  ticks: Tick[]
  /** Pounds indicated → SVG x. */
  x: (lb: number) => number
  /** SVG y the ticks grow from. */
  baseline: number
  /** −1 grows them upward, +1 downward. */
  dir: 1 | -1
  lengths: Record<TickKind, number>
  widths?: Partial<Record<TickKind, number>>
  color?: string
  minorOpacity?: number
}

const DEFAULT_WIDTHS: Record<TickKind, number> = { minor: 0.7, unit: 1, major: 1.5 }

export const TickScale = memo(function TickScale({
  ticks,
  x,
  baseline,
  dir,
  lengths,
  widths,
  color = '#39454f',
  minorOpacity = 0.75,
}: TickScaleProps) {
  const w = { ...DEFAULT_WIDTHS, ...widths }
  return (
    <g stroke={color} strokeLinecap="butt">
      {ticks.map((t, i) => {
        const px = x(t.lb)
        return (
          <line
            key={i}
            x1={px}
            y1={baseline}
            x2={px}
            y2={baseline + dir * lengths[t.kind]}
            strokeWidth={w[t.kind]}
            opacity={t.kind === 'minor' ? minorOpacity : 1}
          />
        )
      })}
    </g>
  )
})

export interface TickLabelsProps {
  ticks: { lb: number; text: string }[]
  x: (lb: number) => number
  y: number
  fontSize: number
  fill: string
  fontWeight?: number
  letterSpacing?: string
  anchor?: 'start' | 'middle' | 'end'
  /** Nudge each label horizontally — Detecto letters sit just right of their tick. */
  dx?: number
  /** Draw a 1px light copy underneath so the type reads as engraved. */
  engraved?: boolean
}

export const TickLabels = memo(function TickLabels({
  ticks,
  x,
  y,
  fontSize,
  fill,
  fontWeight = 600,
  letterSpacing = '0.3',
  anchor = 'middle',
  dx = 0,
  engraved = false,
}: TickLabelsProps) {
  return (
    <g
      fontSize={fontSize}
      fontWeight={fontWeight}
      textAnchor={anchor}
      letterSpacing={letterSpacing}
    >
      {ticks.map((t, i) => (
        <g key={i}>
          {engraved && (
            <text x={x(t.lb) + dx} y={y + 0.9} fill="rgba(255,255,255,0.55)">
              {t.text}
            </text>
          )}
          <text x={x(t.lb) + dx} y={y} fill={fill}>
            {t.text}
          </text>
        </g>
      ))}
    </g>
  )
})

/** Turns a kilogram table into the label rows `TickLabels` wants. */
export const kgLabels = (ticks: KgTick[]) =>
  ticks.map((t) => ({ lb: t.lb, text: String(Math.round(t.kg)) }))

export const lbLabels = (ticks: Tick[]) =>
  ticks.map((t) => ({ lb: t.lb, text: String(Math.round(t.lb)) }))
