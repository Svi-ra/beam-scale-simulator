/**
 * Whole-instrument elevation for the Classic design, to scale.
 *
 * The sub-parts follow the reference description: platform base, column with head,
 * hand post, height measuring rod, and wheels at the base. The beam at the top carries
 * the live tilt from the solver, so this plate stays in step with the detail view.
 */
import { memo, useRef } from 'react'
import { useFrame } from '../../../sim/hooks'
import { CommonDefs } from '../../shared/CommonDefs'
import { MetalDefs } from '../../shared/MetalDefs'
import type { VisualProps } from '../../types'

const NS = 'cl-el'
const id = (n: string) => `${NS}-${n}`
const VB = { w: 132, h: 470 }

/** millimetres → SVG units */
const K = 0.255
const OX = 16
const OY = 448
const mx = (mm: number) => OX + mm * K
const my = (mm: number) => OY - mm * K

const ClassicElevationInner = function ClassicElevation({ state: s }: VisualProps) {
  const beam = useRef<SVGGElement>(null)

  useFrame((m) => {
    beam.current?.setAttribute(
      'transform',
      `rotate(${((m.theta * 180) / Math.PI).toFixed(3)} ${mx(120)} ${my(1012)})`,
    )
  })

  // The stack of test weights grows with the load, to capacity.
  const stack = Math.min(1, s.loadLb / s.layout.capacity) * 300

  return (
    <svg viewBox={`0 0 ${VB.w} ${VB.h}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Elevation of the whole scale: platform base with wheels, column, beam head, hand post and height measuring rod">
      <defs>
        <CommonDefs ns={NS} />
        <MetalDefs ns={NS} />
      </defs>

      {/* floor */}
      <line x1={mx(-70)} y1={my(0)} x2={mx(430)} y2={my(0)} stroke="#2f3b47" strokeWidth={1.6} />
      <g stroke="#222c36" strokeWidth={0.9}>
        {Array.from({ length: 14 }, (_, i) => (
          <line key={i} x1={mx(-60) + i * 11} y1={my(0)} x2={mx(-60) + i * 11 - 7} y2={my(0) + 8} />
        ))}
      </g>

      {/* base with platform deck */}
      <rect x={mx(26)} y={my(74)} width={308 * K} height={56 * K} rx={2} fill={`url(#${id('iron')})`} stroke="#44525e" strokeWidth={0.8} />
      <rect x={mx(16)} y={my(92)} width={328 * K} height={18 * K} rx={1.5} fill={`url(#${id('tread')})`} stroke="#44525e" strokeWidth={0.8} />
      <circle cx={mx(44)} cy={my(16)} r={15 * K} fill="#222b34" stroke="#4e5c68" strokeWidth={0.9} />
      <circle cx={mx(316)} cy={my(16)} r={15 * K} fill="#222b34" stroke="#4e5c68" strokeWidth={0.9} />

      {/* load standing on the platform */}
      {s.loadLb > 0 && (
        <g>
          <rect
            x={mx(150)}
            y={my(92 + stack)}
            width={120 * K}
            height={stack * K}
            rx={1.5}
            fill="#2a3742"
            stroke="#5a6874"
            strokeWidth={0.9}
          />
          <g stroke="#3c4a56" strokeWidth={0.7}>
            {Array.from({ length: Math.max(0, Math.round(stack / 50)) }, (_, i) => (
              <line key={i} x1={mx(150)} y1={my(92 + stack - (i + 1) * 50)} x2={mx(270)} y2={my(92 + stack - (i + 1) * 50)} />
            ))}
          </g>
        </g>
      )}

      {/* column */}
      <rect x={mx(96)} y={my(1012)} width={48 * K} height={(1012 - 92) * K} fill={`url(#${id('enamel')})`} stroke="#2f3a44" strokeWidth={0.7} />
      <rect x={mx(88)} y={my(150)} width={64 * K} height={16 * K} rx={2} fill="#39444f" stroke="#4a5762" strokeWidth={0.7} />

      {/* hand post */}
      <rect x={mx(300)} y={my(580)} width={9 * K} height={(580 - 92) * K} fill="#39444f" stroke="#4a5762" strokeWidth={0.6} />
      <rect x={mx(210)} y={my(590)} width={99 * K} height={9 * K} rx={4} fill="#4c5a67" />

      {/* height measuring rod with its sliding headpiece */}
      <rect x={mx(108)} y={my(1690)} width={24 * K} height={(1690 - 1012) * K} fill="#48555f" stroke="#2f3a44" strokeWidth={0.6} />
      <g stroke="#8fa0ac" strokeWidth={0.7}>
        {Array.from({ length: 24 }, (_, i) => (
          <line key={i} x1={mx(120)} y1={my(1080 + i * 25)} x2={mx(131)} y2={my(1080 + i * 25)} />
        ))}
      </g>
      <rect x={mx(100)} y={my(1508)} width={86 * K} height={9 * K} rx={2} fill="#6d7d8c" stroke="#8b9caa" strokeWidth={0.6} />

      {/* head, with the live beam */}
      <rect x={mx(38)} y={my(1052)} width={186 * K} height={44 * K} rx={2.5} fill={`url(#${id('head')})`} stroke="#4e5c68" strokeWidth={0.8} />
      <g ref={beam}>
        <rect x={mx(44)} y={my(1018)} width={250 * K} height={11 * K} rx={1} fill={`url(#${id('steel')})`} />
        <rect x={mx(66)} y={my(1034)} width={214 * K} height={6 * K} rx={1} fill={`url(#${id('steel-soft')})`} />
        <rect x={mx(20)} y={my(1015)} width={26 * K} height={5 * K} fill={`url(#${id('steel-soft')})`} />
      </g>
      <rect x={mx(24)} y={my(1024)} width={22 * K} height={20 * K} rx={1.5} fill="none" stroke="#7d8c99" strokeWidth={1.2} />

    </svg>
  )
}

export const ClassicElevation = memo(ClassicElevationInner)
