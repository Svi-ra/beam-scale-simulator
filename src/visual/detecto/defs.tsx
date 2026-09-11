/**
 * Light for the Detecto design.
 *
 * The reference is a flat drawing: four greys, black outlines, no modelling. That
 * palette is kept exactly — it arrives with the artwork in `refPaths.ts` and is never
 * overridden. What is added here is only *light*: soft top-to-bottom washes that are
 * laid over a part's own silhouettes at low opacity, so a moulding reads as a solid
 * without a single edge moving.
 */
import { memo } from 'react'

export const DetectoDefs = memo(function DetectoDefs({ ns }: { ns: string }) {
  const id = (n: string) => `${ns}-${n}`
  return (
    <>
      {/* aluminium: bright along the top edge, shaded under the bottom */}
      <linearGradient id={id('lit')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
        <stop offset="18%" stopColor="#ffffff" stopOpacity="0.12" />
        <stop offset="62%" stopColor="#000000" stopOpacity="0.05" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
      </linearGradient>

      {/* moulded plastic: a soft sheen high up, falling away to a deep foot */}
      <linearGradient id={id('moulded')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
        <stop offset="26%" stopColor="#ffffff" stopOpacity="0.06" />
        <stop offset="70%" stopColor="#000000" stopOpacity="0.1" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0.32" />
      </linearGradient>

      {/* the printed bands sit slightly proud, so they catch a little more light */}
      <linearGradient id={id('band-lit')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
        <stop offset="40%" stopColor="#ffffff" stopOpacity="0" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0.14" />
      </linearGradient>

      <filter id={id('cast')} x="-6%" y="-14%" width="112%" height="136%">
        <feDropShadow dx="0" dy="7" stdDeviation="9" floodColor="#101418" floodOpacity="0.3" />
      </filter>

      <filter id={id('cast-sm')} x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#0d1014" floodOpacity="0.36" />
      </filter>
    </>
  )
})
