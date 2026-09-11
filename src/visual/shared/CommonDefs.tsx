/**
 * SVG defs every design can use: light, shadow and surface noise. Anything that says
 * what a *particular* instrument is made of lives in that design's own defs file.
 *
 * Ids are namespaced so several stages can share a page without colliding.
 */
import { memo } from 'react'

export const MONO = "'IBM Plex Mono', ui-monospace, Menlo, monospace"
export const SANS = "'Inter', system-ui, -apple-system, Segoe UI, sans-serif"

export const CommonDefs = memo(function CommonDefs({ ns }: { ns: string }) {
  const id = (n: string) => `${ns}-${n}`
  return (
    <>
      {/* specular sweep laid over metal */}
      <linearGradient id={id('sheen')} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
        <stop offset="22%" stopColor="#ffffff" stopOpacity="0.42" />
        <stop offset="34%" stopColor="#ffffff" stopOpacity="0" />
        <stop offset="63%" stopColor="#ffffff" stopOpacity="0.26" />
        <stop offset="74%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>

      {/* brushed-metal grain, rendered once into a tile */}
      <filter id={id('grain-src')} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.02 1.4" numOctaves="3" seed="7" />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncA type="linear" slope="0.16" intercept="0" />
        </feComponentTransfer>
      </filter>
      <pattern id={id('grain')} width="140" height="60" patternUnits="userSpaceOnUse">
        <rect width="140" height="60" filter={`url(#${id('grain-src')})`} />
      </pattern>

      {/* finer, tighter grain for anodised aluminium */}
      <filter id={id('brushed-src')} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.006 2.4" numOctaves="2" seed="19" />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncA type="linear" slope="0.11" intercept="0" />
        </feComponentTransfer>
      </filter>
      <pattern id={id('brushed')} width="180" height="48" patternUnits="userSpaceOnUse">
        <rect width="180" height="48" filter={`url(#${id('brushed-src')})`} />
      </pattern>

      {/* matte plastic speckle */}
      <filter id={id('matte-src')} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3" />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncA type="linear" slope="0.07" intercept="0" />
        </feComponentTransfer>
      </filter>
      <pattern id={id('matte')} width="64" height="64" patternUnits="userSpaceOnUse">
        <rect width="64" height="64" filter={`url(#${id('matte-src')})`} />
      </pattern>

      {/* knurling */}
      <pattern id={id('knurl')} width="3.4" height="3.4" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
        <rect width="3.4" height="3.4" fill="none" />
        <path d="M0 0 H3.4" stroke="#2c1f08" strokeOpacity="0.34" strokeWidth="1.1" />
      </pattern>

      {/* shadows */}
      <filter id={id('drop')} x="-40%" y="-40%" width="180%" height="200%">
        <feDropShadow dx="0" dy="3" stdDeviation="3.2" floodColor="#000" floodOpacity="0.55" />
      </filter>
      <filter id={id('drop-sm')} x="-40%" y="-40%" width="180%" height="200%">
        <feDropShadow dx="0" dy="1.2" stdDeviation="1.3" floodColor="#000" floodOpacity="0.5" />
      </filter>
      <filter id={id('drop-lg')} x="-50%" y="-50%" width="200%" height="220%">
        <feDropShadow dx="1" dy="6" stdDeviation="7" floodColor="#000" floodOpacity="0.6" />
      </filter>
      <filter id={id('glow')} x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="4" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <radialGradient id={id('contact')} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="#000" stopOpacity="0.6" />
        <stop offset="60%" stopColor="#000" stopOpacity="0.24" />
        <stop offset="100%" stopColor="#000" stopOpacity="0" />
      </radialGradient>
    </>
  )
})
