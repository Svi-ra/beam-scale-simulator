/**
 * Whole-instrument elevation for the Detecto-style design: a clinical column scale in
 * light enamel with a dark platform, the beam assembly boxed at the top, and the height
 * rod folded against the column. The beam carries the live tilt from the solver.
 */
import { memo, useRef } from 'react'
import { useFrame } from '../../../sim/hooks'
import { CommonDefs } from '../../shared/CommonDefs'
import { ElevationDefs } from './elevationDefs'
import type { VisualProps } from '../../types'

const NS = 'dt-el'
const id = (n: string) => `${NS}-${n}`
const VB = { w: 132, h: 470 }

/** millimetres → SVG units */
const K = 0.255
const OX = 16
const OY = 448
const mx = (mm: number) => OX + mm * K
const my = (mm: number) => OY - mm * K

function DetectoElevationInner({ state: s }: VisualProps) {
  const beam = useRef<SVGGElement>(null)

  useFrame((m) => {
    beam.current?.setAttribute(
      'transform',
      `rotate(${((m.theta * 180) / Math.PI).toFixed(3)} ${mx(102)} ${my(1015)})`,
    )
  })

  const stack = Math.min(1, s.loadLb / s.layout.capacity) * 300

  return (
    <svg
      viewBox={`0 0 ${VB.w} ${VB.h}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Elevation of the whole scale: platform, column, beam assembly and height rod"
    >
      <defs>
        <CommonDefs ns={NS} />
        <ElevationDefs ns={NS} />
      </defs>

      {/* floor */}
      <line x1={mx(-70)} y1={my(0)} x2={mx(430)} y2={my(0)} stroke="#2f3b47" strokeWidth={1.6} />
      <g stroke="#222c36" strokeWidth={0.9}>
        {Array.from({ length: 14 }, (_, i) => (
          <line key={i} x1={mx(-60) + i * 11} y1={my(0)} x2={mx(-60) + i * 11 - 7} y2={my(0) + 8} />
        ))}
      </g>

      {/* low platform with a moulded deck */}
      <rect x={mx(22)} y={my(58)} width={312 * K} height={44 * K} rx={3} fill={`url(#${id('moulding')})`} stroke="#3a4046" strokeWidth={0.8} />
      <rect x={mx(14)} y={my(76)} width={328 * K} height={18 * K} rx={2} fill={`url(#${id('alu')})`} stroke="#69737a" strokeWidth={0.8} />
      <g stroke="#8d969d" strokeWidth={0.6} opacity={0.7}>
        {Array.from({ length: 11 }, (_, i) => (
          <line key={i} x1={mx(30 + i * 28)} y1={my(75)} x2={mx(30 + i * 28)} y2={my(59)} />
        ))}
      </g>

      {/* load standing on the platform */}
      {s.loadLb > 0 && (
        <g>
          <rect x={mx(140)} y={my(76 + stack)} width={120 * K} height={stack * K} rx={1.5} fill="#2a3742" stroke="#5a6874" strokeWidth={0.9} />
          <g stroke="#3c4a56" strokeWidth={0.7}>
            {Array.from({ length: Math.max(0, Math.round(stack / 50)) }, (_, i) => (
              <line key={i} x1={mx(140)} y1={my(76 + stack - (i + 1) * 50)} x2={mx(260)} y2={my(76 + stack - (i + 1) * 50)} />
            ))}
          </g>
        </g>
      )}

      {/* slim column, light enamel */}
      <rect x={mx(82)} y={my(1015)} width={40 * K} height={(1015 - 76) * K} fill={`url(#${id('alu')})`} stroke="#5e686f" strokeWidth={0.7} />
      <rect x={mx(82)} y={my(1015)} width={40 * K} height={(1015 - 76) * K} fill={`url(#${id('brushed')})`} opacity={0.5} />
      <rect x={mx(74)} y={my(140)} width={56 * K} height={16 * K} rx={2} fill={`url(#${id('moulding')})`} />

      {/* height rod, folded against the column */}
      <rect x={mx(126)} y={my(1660)} width={18 * K} height={(1660 - 1015) * K} fill={`url(#${id('alu')})`} stroke="#5e686f" strokeWidth={0.6} />
      <g stroke="#3a4147" strokeWidth={0.7}>
        {Array.from({ length: 22 }, (_, i) => (
          <line key={i} x1={mx(133)} y1={my(1090 + i * 26)} x2={mx(143)} y2={my(1090 + i * 26)} />
        ))}
      </g>
      <rect x={mx(120)} y={my(1500)} width={78 * K} height={9 * K} rx={2} fill={`url(#${id('moulding')})`} stroke="#4b5157" strokeWidth={0.6} />

      {/* beam assembly, boxed at the top */}
      <rect x={mx(50)} y={my(1050)} width={106 * K} height={40 * K} rx={3} fill={`url(#${id('moulding')})`} stroke="#3d4349" strokeWidth={0.8} />
      <g ref={beam}>
        {/* the frame in miniature: two rails and the window between them */}
        <rect x={mx(96)} y={my(1046)} width={238 * K} height={9 * K} rx={1} fill={`url(#${id('band')})`} stroke="#69737a" strokeWidth={0.5} />
        <rect x={mx(96)} y={my(1000)} width={238 * K} height={9 * K} rx={1} fill={`url(#${id('band')})`} stroke="#69737a" strokeWidth={0.5} />
        <rect x={mx(324)} y={my(1046)} width={10 * K} height={46 * K} fill={`url(#${id('alu')})`} stroke="#69737a" strokeWidth={0.5} />
        <rect x={mx(120)} y={my(1042)} width={22 * K} height={38 * K} rx={1.5} fill={`url(#${id('moulding')})`} />
        <rect x={mx(250)} y={my(1006)} width={26 * K} height={26 * K} rx={1.5} fill={`url(#${id('moulding')})`} />
      </g>
      {/* fixed index bracket at the free end */}
      <rect x={mx(336)} y={my(1040)} width={12 * K} height={34 * K} rx={1.5} fill="none" stroke="#7d8c99" strokeWidth={1.2} />
    </svg>
  )
}

export const DetectoElevation = memo(DetectoElevationInner)
