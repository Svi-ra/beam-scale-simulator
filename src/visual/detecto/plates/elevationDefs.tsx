/**
 * Materials for the elevation plate.
 *
 * The beam head on the stage takes its colours from the reference drawing and needs no
 * gradients at all. The elevation is a different drawing — the whole instrument in its
 * enamel and aluminium, at a twentieth the size — so it carries its own.
 */
import { memo } from 'react'

export const ElevationDefs = memo(function ElevationDefs({ ns }: { ns: string }) {
  const id = (n: string) => `${ns}-${n}`
  return (
    <>
      <linearGradient id={id('alu')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#e9edf0" />
        <stop offset="10%" stopColor="#ccd3d8" />
        <stop offset="46%" stopColor="#aab3ba" />
        <stop offset="54%" stopColor="#9aa4ab" />
        <stop offset="88%" stopColor="#b9c1c7" />
        <stop offset="100%" stopColor="#8b959d" />
      </linearGradient>

      <linearGradient id={id('band')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f4f6f8" />
        <stop offset="30%" stopColor="#e2e7ea" />
        <stop offset="72%" stopColor="#ccd3d8" />
        <stop offset="100%" stopColor="#b3bcc3" />
      </linearGradient>

      <linearGradient id={id('moulding')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#45494d" />
        <stop offset="8%" stopColor="#303337" />
        <stop offset="55%" stopColor="#1e2124" />
        <stop offset="100%" stopColor="#121416" />
      </linearGradient>
    </>
  )
})
