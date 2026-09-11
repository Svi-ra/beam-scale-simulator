/**
 * Drafting furniture shared by every design: leader-line callouts, dimension lines,
 * force arrows and the equilibrium ghost marker.
 *
 * The force overlay is the interesting one. Magnitudes and moment arms come from the
 * simulation; the *positions* come from the anchors the active design hands over, so
 * the arrows land on the parts as that design draws them without the physics having to
 * know anything about the drawing.
 *
 * Everything here is measured in the drawing's own units, and designs are drawn at very
 * different scales — the Classic stage is 1060 units across, the Detecto one 2048 — so
 * a 1.6-unit arrow shaft is a confident line on one and a hairline on the other. Each
 * piece takes a `scale`, and a design passes whatever makes its drafting read at its
 * own size.
 */
import { memo } from 'react'
import { PLATFORM } from '../../sim/spec'
import { lowerPoiseX, upperPoiseX } from '../../sim/physics'
import type { BeamLayout } from '../../sim/layout'
import type { SimState } from '../../sim/engine'
import type { ForceAnchors } from '../types'
import type { Projection } from '../projection'

export const LOAD_INK = '#4cc3e0'
export const POISE_INK = '#e2a33f'
export const NEUTRAL_INK = '#8e9ca7'

/* ------------------------------------------------------------------ callouts */

export interface CalloutItem {
  /** Point on the drawing the leader line touches. */
  at: { x: number; y: number }
  /** Where the text sits. */
  to: { x: number; y: number }
  text: string
  anchor?: 'start' | 'middle' | 'end'
}

export const Callouts = memo(function Callouts({
  items,
  color = '#66747f',
  line = '#3c4855',
  fontSize = 8.5,
  scale = 1,
}: {
  items: CalloutItem[]
  color?: string
  line?: string
  fontSize?: number
  scale?: number
}) {
  return (
    <g style={{ pointerEvents: 'none' }}>
      {items.map((it) => {
        const anchor = it.anchor ?? 'middle'
        const hook = (anchor === 'end' ? 8 : anchor === 'start' ? -8 : 0) * scale
        return (
          <g key={it.text}>
            <path
              d={`M${it.at.x} ${it.at.y} L${it.to.x + hook} ${it.to.y + 6 * scale}`}
              stroke={line}
              strokeWidth={0.9 * scale}
              strokeDasharray={`${3 * scale} ${3 * scale}`}
              fill="none"
            />
            <circle cx={it.at.x} cy={it.at.y} r={1.8 * scale} fill={line} />
            <text
              x={it.to.x}
              y={it.to.y}
              textAnchor={anchor}
              fontSize={fontSize}
              letterSpacing={1.2 * scale}
              fill={color}
            >
              {it.text}
            </text>
          </g>
        )
      })}
    </g>
  )
})

/* ---------------------------------------------------------------- dimensions */

export function Dimension({
  x1,
  x2,
  y,
  label,
  color = NEUTRAL_INK,
  above,
  scale = 1,
}: {
  x1: number
  x2: number
  y: number
  label: string
  color?: string
  above?: boolean
  scale?: number
}) {
  const tick = 5 * scale
  return (
    <g stroke={color} strokeWidth={scale}>
      <line x1={x1} y1={y - tick} x2={x1} y2={y + tick} />
      <line x1={x2} y1={y - tick} x2={x2} y2={y + tick} />
      <line x1={x1} y1={y} x2={x2} y2={y} strokeDasharray={`${4 * scale} ${3 * scale}`} />
      <text
        x={(x1 + x2) / 2}
        y={above ? y - 8 * scale : y + 13 * scale}
        textAnchor="middle"
        fontSize={9.5 * scale}
        fill={color}
        stroke="none"
      >
        {label}
      </text>
    </g>
  )
}

export function ForceArrow({
  x,
  y,
  len,
  color,
  label,
  scale = 1,
}: {
  x: number
  y: number
  len: number
  color: string
  label: string
  scale?: number
}) {
  const dir = Math.sign(len) || 1
  const tip = y + len
  const neck = tip - dir * 9 * scale
  const half = 4.5 * scale
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={neck} stroke={color} strokeWidth={1.6 * scale} />
      <path d={`M${x - half} ${neck} L${x + half} ${neck} L${x} ${tip} Z`} fill={color} />
      <circle cx={x} cy={y} r={2.6 * scale} fill={color} />
      <text
        x={x}
        y={tip + (dir > 0 ? 12 : -6) * scale}
        textAnchor="middle"
        fontSize={9 * scale}
        fill={color}
      >
        {label}
      </text>
    </g>
  )
}

/* -------------------------------------------------------------- force overlay */

export const ForceOverlay = memo(function ForceOverlay({
  state,
  anchors,
  scale = 1,
}: {
  state: SimState
  anchors: ForceAnchors
  scale?: number
}) {
  const L = state.layout
  const len = {
    load: 78,
    lower: 96,
    upper: 60,
    ball: 44,
    beamCg: 52,
    ...anchors.len,
  }
  return (
    <g style={{ pointerEvents: 'none' }}>
      <line
        x1={anchors.span.x0}
        y1={anchors.load.y}
        x2={anchors.span.x1}
        y2={anchors.load.y}
        stroke={LOAD_INK}
        strokeOpacity={0.3}
        strokeWidth={scale}
        strokeDasharray={`${7 * scale} ${5 * scale}`}
      />

      <ForceArrow
        {...anchors.load}
        len={len.load}
        color={LOAD_INK}
        scale={scale}
        label={`${(state.loadLb / PLATFORM.ratio).toFixed(2)} lbf`}
      />
      <ForceArrow
        {...anchors.lower}
        len={len.lower}
        color={POISE_INK}
        scale={scale}
        label={`${L.lowerPoiseWeight.toFixed(2)} lbf`}
      />
      <ForceArrow
        {...anchors.upper}
        len={len.upper}
        color={POISE_INK}
        scale={scale}
        label={`${L.upperPoiseWeight.toFixed(3)} lbf`}
      />
      <ForceArrow
        {...anchors.ball}
        len={len.ball}
        color={POISE_INK}
        scale={scale}
        label={`${L.ball.weight.toFixed(2)} lbf`}
      />
      <ForceArrow
        {...anchors.beamCg}
        len={len.beamCg}
        color={NEUTRAL_INK}
        scale={scale}
        label={`${L.body.weight.toFixed(1)} lbf`}
      />
    </g>
  )
})

/** Moment arms, drawn from the simulation's own distances. */
export const MomentArms = memo(function MomentArms({
  state,
  proj,
  anchors,
  scale = 1,
}: {
  state: SimState
  proj: Projection
  anchors: ForceAnchors
  scale?: number
}) {
  const L = state.layout
  const f = proj.fulcrum.x
  return (
    <g style={{ pointerEvents: 'none' }}>
      <Dimension
        x1={proj.x(-L.loadArm)}
        x2={f}
        y={anchors.dimY.load}
        label={`a = ${L.loadArm}"`}
        color={LOAD_INK}
        scale={scale}
        above
      />
      <Dimension
        x1={f}
        x2={proj.x(lowerPoiseX(L, state.lowerLb))}
        y={anchors.dimY.lower}
        label={`${lowerPoiseX(L, state.lowerLb).toFixed(2)}"`}
        color={POISE_INK}
        scale={scale}
      />
      <Dimension
        x1={f}
        x2={proj.x(upperPoiseX(L, state.upperLb))}
        y={anchors.dimY.upper}
        label={`${upperPoiseX(L, state.upperLb).toFixed(2)}"`}
        color={POISE_INK}
        scale={scale}
      />
    </g>
  )
})

/** The header lines the force view prints on the stage. */
export const ForceHeader = memo(function ForceHeader({
  layout,
  x = 26,
  y = 78,
  scale = 1,
}: {
  layout: BeamLayout
  x?: number
  y?: number
  scale?: number
}) {
  return (
    <g style={{ pointerEvents: 'none' }}>
      <text x={x} y={y} fontSize={10.5 * scale} fill={LOAD_INK} letterSpacing={scale}>
        MOMENT SCALE · 1 lb on the platform = {layout.momentPerLb.toFixed(3)} lbf·in at
        the beam
      </text>
      <text
        x={x}
        y={y + 16 * scale}
        fontSize={10.5 * scale}
        fill="#6e7d8c"
        letterSpacing={0.6 * scale}
      >
        beam travel ±{layout.trigLoopHalfAngle.toFixed(1)}° against the stops
      </text>
    </g>
  )
})

/* --------------------------------------------------------------- ghost marker */

/** Outline showing where a poise must sit for the beam to rest. */
export const GhostMarker = memo(function GhostMarker({
  cx,
  top,
  bottom,
  width,
  color = POISE_INK,
  scale = 1,
}: {
  cx: number
  top: number
  bottom: number
  width: number
  color?: string
  scale?: number
}) {
  return (
    <g style={{ pointerEvents: 'none' }}>
      <rect
        x={cx - width / 2}
        y={top}
        width={width}
        height={bottom - top}
        rx={3 * scale}
        fill="none"
        stroke={color}
        strokeWidth={1.3 * scale}
        strokeDasharray={`${4 * scale} ${3 * scale}`}
        opacity={0.75}
      />
      <path
        d={`M${cx - 5 * scale} ${top - 7 * scale} L${cx + 5 * scale} ${top - 7 * scale} L${cx} ${top - scale} Z`}
        fill={color}
        opacity={0.85}
      />
    </g>
  )
})
