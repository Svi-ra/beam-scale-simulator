/**
 * The fixed half of the Classic design: the pillar head that carries the bearing, and
 * the trig loop the pointer swings in. None of it rotates with the beam.
 */
import { memo } from 'react'
import { FAIRBANKS_LAYOUT as L } from '../../../sim/layout'
import { useBalanceGlow } from '../../shared/useBeamInteraction'
import { HEAD, TRIG, VIEW_BOX, gid, projection as P } from '../geometry'
import { useRef } from 'react'

const { x: sx, y: sy, u: su } = P
const F = P.fulcrum

export const HeadCasting = memo(function HeadCasting() {
  const x0 = sx(HEAD.xFrom)
  const x1 = sx(HEAD.xTo)
  const yTop = sy(HEAD.yTop)
  const cx = (x0 + x1) / 2
  const colTop = yTop + HEAD.height - 4

  return (
    <g>
      {/* column, carrying the head */}
      <rect x={cx - 62} y={colTop} width={124} height={VIEW_BOX.h - colTop + 24} fill={`url(#${gid('enamel')})`} />
      <rect x={cx - 62} y={colTop} width={124} height={VIEW_BOX.h - colTop + 24} fill={`url(#${gid('grain')})`} opacity={0.28} />
      <rect x={cx - 68} y={colTop} width={136} height={11} rx={3} fill="#333e49" stroke="#4d5b67" strokeWidth={0.8} />

      {/* head casting */}
      <rect x={x0} y={yTop} width={x1 - x0} height={HEAD.height} rx={8} fill={`url(#${gid('head')})`} filter={`url(#${gid('drop')})`} />
      <rect x={x0} y={yTop} width={x1 - x0} height={HEAD.height} rx={8} fill={`url(#${gid('grain')})`} opacity={0.42} />
      <rect x={x0 - 5} y={yTop} width={x1 - x0 + 10} height={9} rx={3} fill="#4a5764" stroke="#63727f" strokeWidth={0.9} />
      <line x1={x0 - 3} y1={yTop + 1.4} x2={x1 + 3} y2={yTop + 1.4} stroke="#a3b2be" strokeOpacity={0.55} strokeWidth={1.4} />
      <rect x={x0 + 8} y={yTop + 16} width={x1 - x0 - 16} height={HEAD.height - 26} rx={5} fill="none" stroke="#5c6b78" strokeOpacity={0.35} strokeWidth={1} />

      {/* the beam's shadow falling on the head */}
      <ellipse cx={cx + 40} cy={yTop + 5} rx={190} ry={9} fill={`url(#${gid('contact')})`} opacity={0.85} />

      {HEAD.postX.map((px) => (
        <rect
          key={px}
          x={sx(px) - su(HEAD.postHalf)}
          y={sy(0.34)}
          width={su(HEAD.postHalf * 2)}
          height={yTop - sy(0.34) + 6}
          fill={`url(#${gid('steel-soft')})`}
          stroke="#4c5862"
          strokeWidth={0.7}
        />
      ))}

      {/* slot the steelyard rod passes down through */}
      <rect x={sx(-L.loadArm) - 5} y={yTop + 2} width={10} height={22} rx={2} fill="#080b0e" opacity={0.9} />
      <rect x={sx(-L.loadArm) - 2.2} y={sy(-0.82)} width={4.4} height={yTop - sy(-0.82) + 18} fill={`url(#${gid('steel-soft')})`} />

      {/* trig loop bracket */}
      <rect
        x={sx(TRIG.cx) - 18}
        y={sy(TRIG.cy) + su(TRIG.frameHalfH) - 5}
        width={36}
        height={yTop - sy(TRIG.cy) - su(TRIG.frameHalfH) + 12}
        rx={3}
        fill={`url(#${gid('iron')})`}
        stroke="#54636f"
        strokeWidth={1}
      />

      <rect x={x0 + 16} y={yTop + 44} width={104} height={24} rx={3} fill="#0d1218" stroke="#44525e" strokeWidth={0.9} />
      <text x={x0 + 68} y={yTop + 60} textAnchor="middle" fontSize={9.5} letterSpacing="1.5" fill="#8493a0">
        {L.capacity} LB CAP
      </text>

      {[x1 - 26, x1 - 62].map((bxp) => (
        <g key={bxp}>
          <circle cx={bxp} cy={yTop + 52} r={4.6} fill="#2b343d" stroke="#63727f" strokeWidth={0.9} />
          <line x1={bxp - 2.6} y1={yTop + 52} x2={bxp + 2.6} y2={yTop + 52} stroke="#131920" strokeWidth={1.3} />
        </g>
      ))}
    </g>
  )
})

export const BearingCap = memo(function BearingCap() {
  const x0 = sx(HEAD.postX[0]) - su(HEAD.postHalf)
  const x1 = sx(HEAD.postX[1]) + su(HEAD.postHalf)
  const yTop = sy(0.34)
  const yBot = sy(HEAD.capFrom)
  return (
    <g>
      <rect x={x0 - 4} y={yTop} width={x1 - x0 + 8} height={yBot - yTop} rx={3} fill={`url(#${gid('steel')})`} stroke="#4c5862" strokeWidth={0.9} />
      <path
        d={`M${F.x - su(0.13)} ${yBot} L${F.x} ${F.y + 1} L${F.x + su(0.13)} ${yBot} Z`}
        fill="#1a2028"
        stroke="#6f7d88"
        strokeWidth={1}
      />
      <circle cx={F.x} cy={F.y} r={2.1} fill="#e2a33f" opacity={0.9} />
    </g>
  )
})

/** C-shaped loop: the pointer trigs against its top and bottom faces. */
export function TrigLoop() {
  const lit = useRef<SVGGElement>(null)
  useBalanceGlow(lit)

  const cx = sx(TRIG.cx)
  const cy = sy(TRIG.cy)
  const iw = su(TRIG.innerHalfW)
  const ih = su(TRIG.innerHalfH)
  const fw = su(TRIG.frameHalfW)
  const fh = su(TRIG.frameHalfH)
  const t = fh - ih

  return (
    <g>
      <g fill={`url(#${gid('steel')})`} stroke="#4c5862" strokeWidth={0.9}>
        <rect x={cx - fw} y={cy - fh} width={2 * fw} height={t} rx={2} />
        <rect x={cx - fw} y={cy + ih} width={2 * fw} height={t} rx={2} />
        <rect x={cx - fw} y={cy - fh} width={t} height={2 * fh} rx={2} />
      </g>

      <line x1={cx - fw + t} y1={cy} x2={cx - fw + t + 7} y2={cy} stroke="#8e9ca7" strokeWidth={1.2} />
      <line x1={cx - iw + 2} y1={cy} x2={cx + iw} y2={cy} stroke="#e2a33f" strokeOpacity={0.22} strokeWidth={1} strokeDasharray="3 3" />

      <g ref={lit} opacity={0} style={{ transition: 'opacity .25s ease' }}>
        <rect x={cx - iw} y={cy - ih * 0.22} width={2 * iw} height={ih * 0.44} fill="#46d39a" opacity={0.22} />
        <rect
          x={cx - fw - 3}
          y={cy - fh - 3}
          width={2 * fw + 6}
          height={2 * fh + 6}
          rx={4}
          fill="none"
          stroke="#46d39a"
          strokeWidth={1.6}
          filter={`url(#${gid('glow')})`}
        />
      </g>

      <text x={cx} y={cy + fh + 15} textAnchor="middle" fontSize={8.5} letterSpacing="1.1" fill="#68767f">
        TRIG LOOP
      </text>
    </g>
  )
}
