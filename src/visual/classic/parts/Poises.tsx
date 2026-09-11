/**
 * The two sliding poises.
 *
 * The large poise is a brass saddle: it straddles the notched bar with a sprung pawl
 * that drops into each 50 lb notch, and the bulk of its metal hangs below the bar, which
 * is what keeps its centre of gravity just under the pivot edge (see LOWER.cgHeight).
 * The small poise is a light skeleton yoke on the raised bar, left open so the fine
 * graduations read through it.
 */
import { memo } from 'react'
import type { PartHandle } from '../../shared/useBeamInteraction'
import { LARGE_POISE, SMALL_POISE, gid, projection as P } from '../geometry'

const { x: sx, u: su } = P
const F = P.fulcrum
const PX = P.px

const INDEX = '#d94a4f'

interface PoiseProps {
  /** Position along the beam, in inches from the fulcrum — the simulation's number. */
  xin: number
  /** Drag/keyboard bindings from the shared interaction layer. */
  handle: PartHandle
  /** True while this poise is being dragged. */
  active: boolean
}

/** local y, in SVG units, from a beam-frame height in inches */
const ly = (yin: number) => -yin * PX

export const LargePoise = memo(function LargePoise({ xin, handle, active }: PoiseProps) {
  const g = LARGE_POISE
  const a = su(0.27)
  const b = su(g.halfW)
  const yTop = ly(g.yTop)
  const yShoulder = ly(0.09)
  const yWaist = ly(0.0)
  const yBot = ly(g.yBottom)
  const r = 5

  const outer = [
    `M${-a} ${yTop}`,
    `L${a} ${yTop}`,
    `L${a} ${yShoulder}`,
    `L${b} ${yWaist}`,
    `L${b} ${yBot - r}`,
    `Q${b} ${yBot} ${b - r} ${yBot}`,
    `L${-b + r} ${yBot}`,
    `Q${-b} ${yBot} ${-b} ${yBot - r}`,
    `L${-b} ${yWaist}`,
    `L${-a} ${yShoulder}`,
    'Z',
  ].join(' ')

  const w = g.window
  const wx = su(w.halfW)
  const wt = ly(w.yTop)
  const wb = ly(w.yBottom)
  const hole = `M${-wx} ${wt} L${wx} ${wt} L${wx} ${wb} L${-wx} ${wb} Z`

  return (
    <g transform={`translate(${sx(xin)} ${F.y})`} style={{ outline: 'none' }} {...handle}>
      {/* shadow cast onto the bar */}
      <ellipse cx={0} cy={ly(-0.58)} rx={b * 0.95} ry={4} fill={`url(#${gid('contact')})`} />

      {/* brass body with the reading aperture punched through */}
      <path
        d={`${outer} ${hole}`}
        fillRule="evenodd"
        fill={`url(#${gid('brass')})`}
        stroke="#5d3f10"
        strokeWidth={0.9}
        filter={`url(#${gid('drop-sm')})`}
      />
      <path d={`${outer} ${hole}`} fillRule="evenodd" fill={`url(#${gid('grain')})`} opacity={0.5} />

      {/* machined grip ribs on the thumb pad */}
      <g stroke="#6b4a12" strokeOpacity={0.75} strokeWidth={1}>
        {Array.from({ length: 7 }, (_, i) => {
          const gx = -a + 3 + i * ((2 * a - 6) / 6)
          return <line key={i} x1={gx} y1={yTop + 3} x2={gx} y2={yTop + su(0.17)} />
        })}
      </g>
      <line x1={-a} y1={yTop + su(0.2)} x2={a} y2={yTop + su(0.2)} stroke="#6b4a12" strokeOpacity={0.55} strokeWidth={0.9} />
      {/* parting line between the yoke and the ballast block */}
      <line x1={-b + 2} y1={ly(-0.06)} x2={b - 2} y2={ly(-0.06)} stroke="#7a5715" strokeOpacity={0.5} strokeWidth={0.9} />
      <line x1={-b + 2} y1={ly(-0.06) - 1.3} x2={b - 2} y2={ly(-0.06) - 1.3} stroke="#f3dda3" strokeOpacity={0.3} strokeWidth={0.8} />

      {/* specular sweep */}
      <path d={outer} fill={`url(#${gid('sheen')})`} opacity={0.5} style={{ pointerEvents: 'none' }} />

      {/* aperture surround + index hairline */}
      <rect
        x={-wx}
        y={wt}
        width={2 * wx}
        height={wb - wt}
        fill="none"
        stroke="#4a3110"
        strokeWidth={1.1}
      />
      <line x1={0} y1={wt - su(0.06)} x2={0} y2={wb + su(0.06)} stroke={INDEX} strokeWidth={1.3} />
      <path
        d={`M${-3.2} ${wt - su(0.06)} L${3.2} ${wt - su(0.06)} L0 ${wt - su(0.06) + 4.4} Z`}
        fill={INDEX}
      />

      {/* detent pawl seating in the notch */}
      <path
        d={`M${-su(0.075)} ${ly(0.02)} L0 ${ly(-0.095)} L${su(0.075)} ${ly(0.02)} Z`}
        fill="#3a2a0c"
        opacity={0.85}
      />

      <text
        x={0}
        y={yTop - 5}
        textAnchor="middle"
        fontSize={8}
        letterSpacing="1.1"
        fill={active ? '#e2a33f' : '#6f7d88'}
      >
        50 LB
      </text>

      {/* generous hit target */}
      <rect className="hit" x={-b - 8} y={yTop - 10} width={2 * b + 16} height={yBot - yTop + 20} />
    </g>
  )
})

export const SmallPoise = memo(function SmallPoise({ xin, handle }: Omit<PoiseProps, 'active'>) {
  const g = SMALL_POISE
  const b = su(g.halfW)
  const yTop = ly(g.yTop)
  const yBot = ly(g.yBottom)
  const w = g.window
  const wx = su(w.halfW)
  const wt = ly(w.yTop)
  const wb = ly(w.yBottom)

  const outer = `M${-b} ${yTop + 3} Q${-b} ${yTop} ${-b + 3} ${yTop} L${b - 3} ${yTop} Q${b} ${yTop} ${b} ${yTop + 3} L${b} ${yBot - 3} Q${b} ${yBot} ${b - 3} ${yBot} L${-b + 3} ${yBot} Q${-b} ${yBot} ${-b} ${yBot - 3} Z`
  const hole = `M${-wx} ${wt} L${wx} ${wt} L${wx} ${wb} L${-wx} ${wb} Z`

  return (
    <g transform={`translate(${sx(xin)} ${F.y})`} style={{ outline: 'none' }} {...handle}>
      <path
        d={`${outer} ${hole}`}
        fillRule="evenodd"
        fill={`url(#${gid('brass')})`}
        stroke="#5d3f10"
        strokeWidth={0.8}
        filter={`url(#${gid('drop-sm')})`}
      />
      <path d={`${outer} ${hole}`} fillRule="evenodd" fill={`url(#${gid('grain')})`} opacity={0.45} />
      <path d={outer} fill={`url(#${gid('sheen')})`} opacity={0.45} style={{ pointerEvents: 'none' }} />

      {/* knurled cap */}
      <rect x={-b + 1} y={yTop + 1.5} width={2 * (b - 1)} height={5} rx={1.5} fill={`url(#${gid('knurl')})`} opacity={0.8} />

      {/* index hairline reaching down across the fine graduations */}
      <line x1={0} y1={wt} x2={0} y2={ly(0.4)} stroke={INDEX} strokeWidth={1.15} />
      <path d={`M${-2.8} ${ly(0.4)} L${2.8} ${ly(0.4)} L0 ${ly(0.4) - 4} Z`} fill={INDEX} />

      <rect className="hit" x={-b - 9} y={yTop - 9} width={2 * b + 18} height={yBot - yTop + 18} />
    </g>
  )
})
