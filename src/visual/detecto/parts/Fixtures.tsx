/**
 * Everything that does not swing: the base, the bearing housing with the maker's bird
 * on it, and the indicator wire the balance index is read against.
 *
 * These are the reason the pivot can be placed at all. The housing and the wire both
 * stop at exactly the top edge of the base, which is what says they stand on it rather
 * than hang from the beam — so the beam swings in the housing, and the wire holds still
 * while the index crosses it.
 */
import { memo } from 'react'
import { REF } from '../refPaths'
import { RefPart, RefShade } from './RefPart'
import { gid } from '../geometry'

/** The plinth the whole head stands on. Drawn behind everything. */
export const Base = memo(function Base() {
  return (
    <g>
      <RefPart shapes={REF.base} />
      <RefShade shapes={REF.base} fill={`url(#${gid('lit')})`} opacity={0.28} />
    </g>
  )
})

/** The bearing housing, and the maker's badge struck on its face. */
export const Housing = memo(function Housing() {
  return (
    <g>
      <RefPart shapes={REF.housing} filter={`url(#${gid('cast')})`} />
      <RefShade shapes={REF.housing} fill={`url(#${gid('moulded')})`} opacity={0.5} />
      <RefPart shapes={REF.logo} />
    </g>
  )
})

/** The fixed indicator wire. Drawn over the beam, as the reference has it. */
export const IndicatorWire = memo(function IndicatorWire() {
  return <RefPart shapes={REF.wire} />
})
