/** Force-view annotation tracing the steelyard rod down into the column. */
import { memo } from 'react'
import { PLATFORM } from '../../../sim/spec'
import { FAIRBANKS_LAYOUT as L } from '../../../sim/layout'
import type { SimState } from '../../../sim/engine'
import { LOAD_INK } from '../../shared/Annotations'
import { HEAD, VIEW_BOX, projection as P } from '../geometry'

const { x: sx, y: sy } = P

export const SteelyardRodNote = memo(function SteelyardRodNote({ state }: { state: SimState }) {
  const x = sx(-L.loadArm)
  const yTop = sy(HEAD.yTop)
  return (
    <g style={{ pointerEvents: 'none' }}>
      <line x1={x} y1={yTop + 12} x2={x} y2={VIEW_BOX.h - 18} stroke={LOAD_INK} strokeWidth={1.4} strokeDasharray="5 4" />
      <line x1={x} y1={VIEW_BOX.h - 18} x2={sx(1.6)} y2={VIEW_BOX.h - 18} stroke={LOAD_INK} strokeWidth={1.4} strokeDasharray="5 4" />
      <text x={sx(1.75)} y={VIEW_BOX.h - 28} fontSize={10.5} fill={LOAD_INK}>
        steelyard rod — from the platform levers ×{PLATFORM.ratio}
      </text>
      <text x={sx(1.75)} y={VIEW_BOX.h - 13} fontSize={10.5} fill="#7d8b96">
        {state.loadLb.toFixed(1)} lb ÷ {PLATFORM.ratio} ={' '}
        {(state.loadLb / PLATFORM.ratio).toFixed(2)} lbf at the load knife edge
      </text>
    </g>
  )
})
