/**
 * The rotating half of the Classic design: the beam casting with its pointer blade, the
 * notched lower bar, the raised upper bar, the load knife-edge and the balance-ball rig.
 */
import { memo } from 'react'
// Poise positions come from the simulation, never from the drawing.
import { lowerPoiseX as lowerPos, upperPoiseX as upperPos } from '../../../sim/physics'
import { FAIRBANKS_LAYOUT as L } from '../../../sim/layout'
import { barDivisions, barGraduations, labelled } from '../../ticks'
import { TickLabels, TickScale, lbLabels } from '../../shared/Graduations'
import type { PartHandle } from '../../shared/useBeamInteraction'
import { BALL_RIG, BODY, UPPER_BAR, gid, projection as P } from '../geometry'

const { x: sx, y: sy, u: su } = P
const F = P.fulcrum
const ENGRAVE = '#39454f'
const LOWER_DIVISIONS = barDivisions(L.lower)
const UPPER_TICKS = barGraduations(L.upper, 1, 5)

export const BeamCasting = memo(function BeamCasting() {
  const x0 = sx(BODY.xFrom)
  const x1 = sx(BODY.xTo)
  const yTop = sy(BODY.yTop)
  const yBot = sy(BODY.yBottom)
  const h = yBot - yTop
  const tip = sx(-L.pointerArm)

  return (
    <g>
      {/* balance pointer — a tapered blade continuing the beam past the fulcrum */}
      <path
        d={`M${x0} ${sy(-0.1)} L${tip} ${sy(-0.272)} L${tip} ${sy(-0.328)} L${x0} ${sy(-0.5)} Z`}
        fill={`url(#${gid('steel')})`}
        stroke="#5a6772"
        strokeWidth={0.8}
      />
      <path
        d={`M${tip} ${sy(-0.272)} L${tip + 16} ${sy(-0.2745)} L${tip + 16} ${sy(-0.3255)} L${tip} ${sy(-0.328)} Z`}
        fill="#20272e"
      />

      {/* main bar */}
      <rect x={x0} y={yTop} width={x1 - x0} height={h} rx={2} fill={`url(#${gid('dial')})`} />
      <rect x={x0} y={yTop} width={x1 - x0} height={h} rx={2} fill={`url(#${gid('grain')})`} opacity={0.35} />
      <rect x={x0} y={yTop} width={x1 - x0} height={4.5} fill={`url(#${gid('steel-soft')})`} />
      <rect x={x0} y={yBot - 5} width={x1 - x0} height={5} fill={`url(#${gid('steel-soft')})`} opacity={0.9} />
      <line x1={x0} y1={yTop + 0.6} x2={x1} y2={yTop + 0.6} stroke="#ffffff" strokeOpacity={0.6} strokeWidth={1} />
      <line x1={x0} y1={yBot - 0.6} x2={x1} y2={yBot - 0.6} stroke="#0d1116" strokeOpacity={0.5} strokeWidth={1.2} />
      <rect x={x0} y={yTop} width={x1 - x0} height={h} rx={2} fill="none" stroke="#6c7a85" strokeWidth={0.9} />
      <rect x={x1 - 9} y={yTop} width={9} height={h} fill={`url(#${gid('steel')})`} stroke="#5a6772" strokeWidth={0.7} />

      {/* fulcrum knife edge, seated flush in the top land */}
      <path
        d={`M${F.x - su(0.12)} ${F.y + su(0.1)} L${F.x} ${F.y} L${F.x + su(0.12)} ${F.y + su(0.1)} Z`}
        fill={`url(#${gid('knife')})`}
        stroke="#161c22"
        strokeWidth={0.8}
      />
    </g>
  )
})

/** V-notches and engraved numerals on the main bar. */
export const LowerScale = memo(function LowerScale() {
  const top = sy(0)
  const w = su(0.105)
  const d = su(0.17)
  return (
    <g>
      <g>
        {LOWER_DIVISIONS.map(({ lb }: { lb: number }) => {
          const x = sx(lowerPos(L, lb))
          return (
            <g key={lb}>
              <path d={`M${x - w} ${top} L${x} ${top + d} L${x + w} ${top} Z`} fill="#10161c" />
              <path d={`M${x - w} ${top} L${x} ${top + d}`} stroke="#0a0e12" strokeWidth={1.4} fill="none" />
              <path d={`M${x} ${top + d} L${x + w} ${top}`} stroke="#c9d5de" strokeWidth={1.2} fill="none" />
            </g>
          )
        })}
      </g>
      <TickLabels
        ticks={lbLabels(LOWER_DIVISIONS)}
        x={(lb) => sx(lowerPos(L, lb))}
        y={sy(-0.33)}
        fontSize={13}
        fill={ENGRAVE}
        letterSpacing="0.5"
        engraved
      />
      <text
        x={sx(lowerPos(L, L.lower.capacity) + 0.55)}
        y={sy(-0.33)}
        fill="#6d7b86"
        fontSize={11}
        textAnchor="middle"
        letterSpacing="1"
      >
        LB
      </text>
    </g>
  )
})

/** The raised bar, its standards and its fine graduations. */
export const UpperAssembly = memo(function UpperAssembly() {
  const x0 = sx(UPPER_BAR.xFrom)
  const x1 = sx(UPPER_BAR.xTo)
  const yTop = sy(UPPER_BAR.yTop)
  const yBot = sy(UPPER_BAR.yBottom)
  return (
    <g>
      {UPPER_BAR.standards.map((x) => (
        <rect
          key={x}
          x={sx(x) - su(0.05)}
          y={yBot - 2}
          width={su(0.1)}
          height={sy(0) - yBot + 4}
          fill={`url(#${gid('steel')})`}
          stroke="#5a6772"
          strokeWidth={0.6}
        />
      ))}
      <g id={gid('upper-assembly')}>
        <rect x={x0} y={yTop} width={x1 - x0} height={yBot - yTop} rx={1.5} fill={`url(#${gid('dial')})`} />
        <rect x={x0} y={yTop} width={x1 - x0} height={2.5} fill={`url(#${gid('steel-soft')})`} />
        <rect x={x0} y={yTop} width={x1 - x0} height={yBot - yTop} rx={1.5} fill="none" stroke="#6c7a85" strokeWidth={0.8} />
        <TickScale
          ticks={UPPER_TICKS}
          x={(lb) => sx(upperPos(L, lb))}
          baseline={yBot - su(0.035)}
          dir={-1}
          lengths={{ minor: su(0.06), unit: su(0.105), major: su(0.155) }}
          color="#4a5761"
        />
        <TickLabels
          ticks={lbLabels(labelled(UPPER_TICKS))}
          x={(lb) => sx(upperPos(L, lb))}
          y={sy(0.74)}
          fontSize={10.5}
          fill={ENGRAVE}
        />
        <text
          x={sx(upperPos(L, L.upper.capacity) + 0.42)}
          y={sy(0.74)}
          fill="#6d7b86"
          fontSize={8.5}
          textAnchor="middle"
          letterSpacing="0.8"
        >
          LB
        </text>
      </g>
    </g>
  )
})

export const LoadKnifeEdge = memo(function LoadKnifeEdge() {
  const x = sx(-L.loadArm)
  const yb = sy(BODY.yBottom)
  return (
    <g>
      <path
        d={`M${x - su(0.11)} ${yb} L${x} ${yb + su(0.12)} L${x + su(0.11)} ${yb} Z`}
        fill={`url(#${gid('knife')})`}
        stroke="#161c22"
        strokeWidth={0.7}
      />
      <path
        d={`M${x - su(0.15)} ${yb + su(0.1)} A${su(0.15)} ${su(0.15)} 0 0 0 ${x + su(0.15)} ${yb + su(0.1)} L${x + su(0.15)} ${yb + su(0.22)} L${x - su(0.15)} ${yb + su(0.22)} Z`}
        fill="none"
        stroke="#8d9aa5"
        strokeWidth={2.4}
      />
    </g>
  )
})

export function BallRig({
  ballX,
  height,
  handle,
}: {
  ballX: number
  height: number
  handle: PartHandle
}) {
  const yRod = sy(height)
  const xs = sx(BALL_RIG.standardX)
  const r = su(0.17)
  return (
    <g>
      <rect x={xs - su(0.045)} y={yRod} width={su(0.09)} height={sy(0) - yRod} fill={`url(#${gid('steel')})`} stroke="#59666f" strokeWidth={0.6} />
      <line x1={sx(BALL_RIG.rodFrom)} y1={yRod} x2={sx(BALL_RIG.rodTo)} y2={yRod} stroke="#9fadb8" strokeWidth={4.4} strokeLinecap="round" />
      <g stroke="#5d6a74" strokeWidth={0.7} opacity={0.75}>
        {Array.from({ length: 26 }, (_, i) => {
          const x = sx(BALL_RIG.rodFrom) + 2 + i * 2.1
          return x < sx(BALL_RIG.rodTo) ? <line key={i} x1={x} y1={yRod - 2.2} x2={x + 1.4} y2={yRod + 2.2} /> : null
        })}
      </g>
      <g {...handle} style={{ outline: 'none' }}>
        <circle cx={sx(ballX)} cy={yRod} r={r} fill={`url(#${gid('brass-2')})`} stroke="#5d3f10" strokeWidth={0.9} filter={`url(#${gid('drop-sm')})`} />
        <circle cx={sx(ballX) - r * 0.32} cy={yRod - r * 0.38} r={r * 0.26} fill="#fff3cf" opacity={0.55} />
        <line x1={sx(ballX)} y1={yRod - r} x2={sx(ballX)} y2={yRod + r} stroke="#4a3110" strokeWidth={0.8} opacity={0.6} />
        <circle className="hit" cx={sx(ballX)} cy={yRod} r={r + 9} />
      </g>
    </g>
  )
}
