/**
 * A general-purpose workshop palette — plated steel, cast iron, enamel, brass — used by
 * the drafting plates and by any design built from those materials. A design with its
 * own material language (anodised aluminium, moulded plastic) brings its own defs
 * instead of extending this one.
 */
import { memo } from 'react'

export const MetalDefs = memo(function MetalDefs({ ns }: { ns: string }) {
  const id = (n: string) => `${ns}-${n}`
  return (
    <>
      <linearGradient id={id('steel')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f4f7f9" />
        <stop offset="16%" stopColor="#d6dee5" />
        <stop offset="40%" stopColor="#9fadb9" />
        <stop offset="52%" stopColor="#7e8d9a" />
        <stop offset="72%" stopColor="#aebbc6" />
        <stop offset="100%" stopColor="#6d7c89" />
      </linearGradient>

      <linearGradient id={id('steel-soft')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#dfe7ed" />
        <stop offset="45%" stopColor="#a8b6c2" />
        <stop offset="100%" stopColor="#6e7d8a" />
      </linearGradient>

      {/* pale matte face, for engraving against */}
      <linearGradient id={id('dial')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fbfcfd" />
        <stop offset="35%" stopColor="#eaeff3" />
        <stop offset="65%" stopColor="#dae2e9" />
        <stop offset="100%" stopColor="#bcc7d1" />
      </linearGradient>

      <linearGradient id={id('brass')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f6dfa8" />
        <stop offset="18%" stopColor="#e0bb6f" />
        <stop offset="50%" stopColor="#b8862f" />
        <stop offset="78%" stopColor="#8d6420" />
        <stop offset="100%" stopColor="#c9993f" />
      </linearGradient>

      <linearGradient id={id('brass-2')} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#7d5617" />
        <stop offset="22%" stopColor="#d8ab55" />
        <stop offset="46%" stopColor="#f3dda3" />
        <stop offset="70%" stopColor="#bc8d33" />
        <stop offset="100%" stopColor="#6f4c13" />
      </linearGradient>

      <linearGradient id={id('enamel')} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#39444f" />
        <stop offset="18%" stopColor="#6c7b88" />
        <stop offset="34%" stopColor="#8d9ca8" />
        <stop offset="58%" stopColor="#5e6c78" />
        <stop offset="82%" stopColor="#38434e" />
        <stop offset="100%" stopColor="#252d36" />
      </linearGradient>

      <linearGradient id={id('iron')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#5a6674" />
        <stop offset="30%" stopColor="#3b4551" />
        <stop offset="100%" stopColor="#1b222a" />
      </linearGradient>

      <linearGradient id={id('head')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6d7b88" />
        <stop offset="14%" stopColor="#4b5763" />
        <stop offset="62%" stopColor="#333d48" />
        <stop offset="100%" stopColor="#1d242c" />
      </linearGradient>

      <linearGradient id={id('tread')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#8f9ea9" />
        <stop offset="45%" stopColor="#6a7883" />
        <stop offset="100%" stopColor="#4a5661" />
      </linearGradient>

      <linearGradient id={id('knife')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#c9d4dd" />
        <stop offset="55%" stopColor="#55616d" />
        <stop offset="100%" stopColor="#20272f" />
      </linearGradient>
    </>
  )
})
