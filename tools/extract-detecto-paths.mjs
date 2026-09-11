/**
 * Lifts the Detecto beam-head artwork out of the reference drawing and writes it as a
 * TypeScript module.
 *
 *   node tools/extract-detecto-paths.mjs
 *
 * The reference is the single source of truth for every shape, proportion and position
 * in the Detecto design, so the path data is copied verbatim rather than re-drawn: the
 * `d` strings below are byte-for-byte the ones Illustrator exported, still in the
 * drawing's own 2048x1024 frame. Nothing here is rounded, simplified or re-fitted.
 *
 * What this script *does* decide is only how the ~93 loose paths are grouped into the
 * named parts the simulation needs to move independently, and which of them ride the
 * beam rather than standing still. That grouping is the manifest below; it is stated by
 * element index because the drawing has no layer names to go on.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const SRC = join(here, '..', 'Docs references', 'Beam weight scale', 'Detecto-layout design.svg')
const OUT = join(here, '..', 'src', 'visual', 'detecto', 'refPaths.ts')

/** Element index ranges → part name. Indices count <path>/<polygon>/<image> in document order. */
const MANIFEST = [
  // The zero-trim screw. Eighteen crests, then seventeen shadowed flanks drawn as an
  // unfilled black ring with a light face laid into it.
  ['thread', 0, 51],
  ['frame', 52, 52],
  ['frameFillets', 53, 53],
  ['upperBandWhite', 54, 54],
  ['upperBandBlack', 55, 55],
  ['lowerBandWhite', 56, 56],
  ['lowerBandBlack', 57, 57],
  ['lowerPoise', 58, 61],
  ['upperPoise', 62, 65],
  ['screws', 66, 68],
  ['leftNub', 69, 69],
  ['trimNut', 70, 70],
  // 71 is the hidden tracing photograph; 73 is a zero-area stray point.
  ['wire', 72, 72],
  ['base', 74, 74],
  ['indexArrow', 75, 75],
  ['housing', 76, 76],
  ['logo', 77, 92],
]

const SKIP = new Set([71, 73])

const svg = readFileSync(SRC, 'utf8')

// ---- the drawing's own stylesheet ----------------------------------------
const css = /<style>([\s\S]*?)<\/style>/.exec(svg)[1]
const classes = {}
for (const [, sel, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  const props = {}
  for (const kv of body.split(';')) {
    const i = kv.indexOf(':')
    if (i > 0) props[kv.slice(0, i).trim()] = kv.slice(i + 1).trim()
  }
  for (const s of sel.split(',')) {
    const c = s.trim()
    if (c.startsWith('.')) Object.assign((classes[c.slice(1)] ??= {}), props)
  }
}

// ---- elements in document order ------------------------------------------
const body = svg.slice(svg.indexOf('</defs>'))
const els = [...body.matchAll(/<(path|polygon|image)\b([^>]*?)\/?>/g)].map(([, tag, attrs]) => {
  const cls = /class="([^"]*)"/.exec(attrs)?.[1]?.split(/\s+/) ?? []
  const style = Object.assign({}, ...cls.map((c) => classes[c] ?? {}))
  const d = /\sd="([^"]*)"/.exec(attrs)?.[1]
  const points = /points="([^"]*)"/.exec(attrs)?.[1]
  return { tag, cls, style, d, points }
})

const viewBox = /viewBox="([^"]*)"/.exec(svg)[1].split(/\s+/).map(Number)

/** A polygon's points become a closed path, so every part is one kind of thing downstream. */
const toPath = (el) => {
  if (el.d) return el.d
  const n = el.points.trim().split(/[\s,]+/).map(Number)
  let out = ''
  for (let i = 0; i < n.length; i += 2) out += `${i ? 'L' : 'M'}${n[i]},${n[i + 1]}`
  return out + 'Z'
}

const shape = (el) => {
  const s = { d: toPath(el) }
  // An Illustrator export leaves `fill` unset on a black shape; SVG's own default is
  // black, and the thread flanks rely on it.
  s.fill = el.style.fill ?? '#000000'
  if (el.style.stroke && el.style.stroke !== 'none') {
    s.stroke = el.style.stroke
    s.strokeWidth = parseFloat(el.style['stroke-width'] ?? '1')
  }
  return s
}

const parts = {}
for (const [name, from, to] of MANIFEST) {
  const out = []
  for (let i = from; i <= to; i++) {
    if (SKIP.has(i)) continue
    const el = els[i]
    if (!el || el.tag === 'image') continue
    out.push(shape(el))
  }
  parts[name] = out
}

const covered = new Set(MANIFEST.flatMap(([, a, b]) => Array.from({ length: b - a + 1 }, (_, k) => a + k)))
const missed = els.map((_, i) => i).filter((i) => !covered.has(i) && !SKIP.has(i))
if (missed.length) throw new Error(`unassigned elements: ${missed.join(', ')}`)

const lit = (v) => JSON.stringify(v)
const partSrc = Object.entries(parts)
  .map(([name, shapes]) => {
    const body = shapes
      .map((s) => `    { d: ${lit(s.d)}${s.fill ? `, fill: ${lit(s.fill)}` : ''}${s.stroke ? `, stroke: ${lit(s.stroke)}, strokeWidth: ${s.strokeWidth}` : ''} },`)
      .join('\n')
    return `  ${name}: [\n${body}\n  ],`
  })
  .join('\n')

writeFileSync(
  OUT,
  `/**
 * Detecto beam-head artwork, lifted verbatim from
 * \`Docs references/Beam weight scale/Detecto-layout design.svg\`.
 *
 * GENERATED — do not edit. Run \`npm run extract:detecto\` to rebuild it.
 *
 * Coordinates are the drawing's own: a ${viewBox[2]}x${viewBox[3]} frame, y down. Every part is
 * drawn exactly where the reference puts it, so the design at rest is the reference.
 * Parts that move (the two poises and the zero-trim nut) are drawn at their reference
 * position and displaced from there by the simulation.
 */

export interface RefShape {
  d: string
  fill: string
  stroke?: string
  strokeWidth?: number
}

export const REF_VIEW_BOX = { w: ${viewBox[2]}, h: ${viewBox[3]} }

export const REF: Record<string, RefShape[]> = {
${partSrc}
}
`,
  'utf8',
)

console.log(`wrote ${OUT}`)
for (const [k, v] of Object.entries(parts)) console.log(`  ${k}: ${v.length} shape(s)`)
