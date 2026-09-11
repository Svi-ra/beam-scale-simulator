/**
 * Cutaway of the base, showing the compound lever train between the platform and the
 * steelyard — the subject of the Fairbanks patent.
 *
 * This is a drawing of the mechanism the simulation solves rather than of any one
 * maker's styling, so it is shared: every scale design can list it among its plates.
 *
 * The platform's load is divided twice before it reaches the beam, so a 500 lb patient
 * pulls the beam's short arm with only ten pounds. The same ratio works in reverse on
 * displacement: the rod at the top travels fifty times as far as the platform does,
 * which is why the deck barely moves. Lever deflections here are therefore drawn with
 * an exaggeration factor, stated on the plate.
 */
import { useRef } from 'react'
import { useFrame } from '../../../sim/hooks'
import { PLATFORM } from '../../../sim/spec'
import { CommonDefs } from '../CommonDefs'
import { MetalDefs } from '../MetalDefs'
import type { VisualProps } from '../../types'

const NS = 'lt'
const id = (n: string) => `${NS}-${n}`
const VB = { w: 1100, h: 344 }

/** base-local millimetres → SVG units */
const K = 1.72
const OX = 46
const OY = 292
const bx = (mm: number) => OX + mm * K
const by = (mm: number) => OY - mm * K

/** Geometry of the train, in base millimetres. Ratios follow from these distances. */
const G = {
  lever1: { fulcrum: 20, bearing: 84, output: 340, y: 60 },
  lever2: { fulcrum: 372, link: 340, output: 52, y: 26 },
  rearBearing: 456,
  deck: { from: 40, to: 510, top: 128, bottom: 114 },
}

/** Vertical exaggeration applied to the drawn deflections. */
const EXAGGERATION = 24

/**
 * Design-agnostic: this plate draws the simulation's own lever train, so every scale
 * design can include it unchanged.
 */
export function LeverTrainPlate({ state: s }: VisualProps) {
  const lever1 = useRef<SVGGElement>(null)
  const lever2 = useRef<SVGGElement>(null)
  const rod = useRef<SVGGElement>(null)
  const deck = useRef<SVGGElement>(null)
  const rear = useRef<SVGGElement>(null)

  useFrame((m, st) => {
    // Rod travel at the beam's short arm, in inches → base millimetres, exaggerated.
    const rodUp = st.layout.loadArm * Math.sin(m.theta) * 25.4 * EXAGGERATION
    const linkUp = rodUp / PLATFORM.stage2
    const deckUp = rodUp / PLATFORM.ratio
    const a1 = (Math.atan2(-linkUp, G.lever1.output - G.lever1.fulcrum) * 180) / Math.PI
    const a2 = (Math.atan2(rodUp, G.lever2.fulcrum - G.lever2.output) * 180) / Math.PI

    rod.current?.setAttribute('transform', `translate(0 ${(-rodUp * K).toFixed(3)})`)
    deck.current?.setAttribute('transform', `translate(0 ${(-deckUp * K).toFixed(3)})`)
    lever1.current?.setAttribute('transform', `rotate(${a1.toFixed(4)} ${bx(G.lever1.fulcrum)} ${by(G.lever1.y - 2)})`)
    // The rear lever mirrors stage one about its own fulcrum at the far end.
    rear.current?.setAttribute('transform', `rotate(${(-a1).toFixed(4)} ${bx(508)} ${by(G.lever1.y - 2)})`)
    lever2.current?.setAttribute('transform', `rotate(${a2.toFixed(4)} ${bx(G.lever2.fulcrum)} ${by(G.lever2.y - 2)})`)
  })

  const f1 = s.loadLb / PLATFORM.stage1
  const f2 = s.loadLb / PLATFORM.ratio

  return (
    <svg viewBox={`0 0 ${VB.w} ${VB.h}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Base cutaway showing the compound lever train">
      <defs>
        <CommonDefs ns={NS} />
        <MetalDefs ns={NS} />
      </defs>

      {/* ---- column and rod, standing behind the platform ---- */}
      <g>
        <rect x={bx(22)} y={6} width={66 * K} height={by(0) - 6} fill="#161d25" />
        <rect x={bx(22)} y={6} width={66 * K} height={by(0) - 6} fill="none" stroke="#2f3b47" strokeWidth={1} strokeDasharray="7 5" />
        <text x={bx(55)} y={20} textAnchor="middle" fontSize={8.5} fill="#55636f" letterSpacing="1.2">
          COLUMN
        </text>
      </g>
      <g ref={rod}>
        <rect x={bx(G.lever2.output - 2)} y={8} width={4 * K} height={by(G.lever2.y) - 8} fill={`url(#${id('steel-soft')})`} stroke="#46535e" strokeWidth={0.8} />
        <path d={`M${bx(G.lever2.output - 5)} 14 L${bx(G.lever2.output + 5)} 14`} stroke="#9dabb6" strokeWidth={3} />
      </g>

      {/* ---- base shell, cut away at the front ---- */}
      <rect x={bx(0)} y={by(130)} width={520 * K} height={130 * K} fill="#0f151b" stroke="#3b4956" strokeWidth={1.6} />
      <line x1={bx(0)} y1={by(0)} x2={bx(520)} y2={by(0)} stroke="#4d5c69" strokeWidth={3.5} />
      <g stroke="#222d38" strokeWidth={0.9}>
        {Array.from({ length: 16 }, (_, i) => (
          <line key={i} x1={bx(0) + i * 62} y1={by(0) + 3} x2={bx(0) + i * 62 - 9} y2={by(0) + 14} />
        ))}
      </g>

      {/* ---- platform deck ---- */}
      <g ref={deck}>
        <rect x={bx(G.deck.from)} y={by(G.deck.top)} width={(G.deck.to - G.deck.from) * K} height={14 * K} rx={2} fill={`url(#${id('tread')})`} stroke="#3e4b57" strokeWidth={1} />
        <g stroke="#3b4853" strokeWidth={1} opacity={0.75}>
          {Array.from({ length: 21 }, (_, i) => (
            <line key={i} x1={bx(54 + i * 21)} y1={by(G.deck.top - 2)} x2={bx(54 + i * 21)} y2={by(G.deck.bottom + 2)} />
          ))}
        </g>
        <rect x={bx(G.lever1.bearing - 4)} y={by(G.deck.bottom)} width={8 * K} height={(G.deck.bottom - G.lever1.y - 2) * K} fill={`url(#${id('steel-soft')})`} stroke="#47545f" strokeWidth={0.8} />
        <rect x={bx(G.rearBearing - 4)} y={by(G.deck.bottom)} width={8 * K} height={(G.deck.bottom - G.lever1.y - 2) * K} fill="#1b232b" stroke="#39464f" strokeWidth={0.8} strokeDasharray="4 3" />
      </g>

      {/* ---- rear lever, ghosted: in plan it lies beside the front lever ---- */}
      <g opacity={0.38} ref={rear}>
        <rect x={bx(390)} y={by(G.lever1.y)} width={120 * K} height={5 * K} fill="#3c4a56" stroke="#4c5b68" strokeWidth={0.8} strokeDasharray="6 4" />
        <text x={bx(450)} y={by(G.lever1.y) + 24} textAnchor="middle" fontSize={8} fill="#63717d" letterSpacing="0.8">
          REAR LEVER (BEHIND)
        </text>
      </g>

      {/* ---- stage one: the main lever ---- */}
      <g ref={lever1}>
        <rect x={bx(6)} y={by(G.lever1.y)} width={352 * K} height={5 * K} rx={1.5} fill={`url(#${id('steel')})`} stroke="#4b5a67" strokeWidth={0.9} />
        <KnifeUp x={bx(G.lever1.bearing)} y={by(G.lever1.y)} />
        <KnifeDown x={bx(G.lever1.output)} y={by(G.lever1.y - 5)} />
      </g>
      <Pivot x={bx(G.lever1.fulcrum)} y={by(G.lever1.y - 2)} label="F1" />

      {/* ---- connecting link ---- */}
      <rect x={bx(G.lever1.output - 2)} y={by(G.lever1.y - 4)} width={4 * K} height={(G.lever1.y - G.lever2.y) * K} fill={`url(#${id('steel-soft')})`} stroke="#47545f" strokeWidth={0.8} />

      {/* ---- stage two: the extension lever ---- */}
      <g ref={lever2}>
        <rect x={bx(40)} y={by(G.lever2.y)} width={346 * K} height={4.5 * K} rx={1.5} fill={`url(#${id('steel')})`} stroke="#4b5a67" strokeWidth={0.9} />
        <KnifeUp x={bx(G.lever2.link)} y={by(G.lever2.y)} />
        <KnifeUp x={bx(G.lever2.output)} y={by(G.lever2.y)} />
      </g>
      <Pivot x={bx(G.lever2.fulcrum)} y={by(G.lever2.y - 2)} label="F2" />

      {/* ---- force annotations ---- */}
      <g>
        <Arrow x={bx(G.lever1.bearing)} y={by(G.deck.top) - 40} len={34} color="#4cc3e0" />
        <text x={bx(G.lever1.bearing) + 12} y={by(G.deck.top) - 30} fontSize={11} fill="#4cc3e0">
          W = {s.loadLb.toFixed(1)} lb
        </text>
        <text x={bx(212)} y={by(G.lever1.y) + 30} fontSize={10.5} fill="#e2a33f" textAnchor="middle">
          ÷{PLATFORM.stage1} → {f1.toFixed(2)} lbf in the link
        </text>
        <text x={bx(196)} y={by(G.lever2.y) + 30} fontSize={10.5} fill="#e2a33f" textAnchor="middle">
          ÷{PLATFORM.stage2} → {f2.toFixed(2)} lbf at the beam's knife edge
        </text>
      </g>

      <Dim x1={bx(G.lever1.fulcrum)} x2={bx(G.lever1.bearing)} y={by(G.lever1.y) - 22} label="64" />
      <Dim x1={bx(G.lever1.fulcrum)} x2={bx(G.lever1.output)} y={by(G.lever1.y) - 40} label="320 mm" />
      <Dim x1={bx(G.lever2.link)} x2={bx(G.lever2.fulcrum)} y={by(G.lever2.y) + 46} label="32" />
      <Dim x1={bx(G.lever2.output)} x2={bx(G.lever2.fulcrum)} y={by(G.lever2.y) + 62} label="320 mm" />

      <g fontSize={9.5} letterSpacing="0.8">
        <text x={bx(520) + 14} y={by(122)} fill="#66747f">STAGE 1 ×{PLATFORM.stage1}</text>
        <text x={bx(520) + 14} y={by(122) + 15} fill="#66747f">STAGE 2 ×{PLATFORM.stage2}</text>
        <text x={bx(520) + 14} y={by(122) + 32} fill="#e2a33f">TOTAL ×{PLATFORM.ratio}</text>
        <text x={bx(520) + 14} y={by(122) + 58} fill="#46525e" fontSize={8.5}>DEFLECTION</text>
        <text x={bx(520) + 14} y={by(122) + 70} fill="#46525e" fontSize={8.5}>SHOWN ×{EXAGGERATION}</text>
      </g>
    </svg>
  )
}

/* -------------------------------------------------------------- helpers */

function Pivot({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g>
      <path d={`M${x - 10} ${y + 26} L${x} ${y} L${x + 10} ${y + 26} Z`} fill="#28323c" stroke="#5b6a76" strokeWidth={1} />
      <rect x={x - 16} y={y + 26} width={32} height={5} rx={1.5} fill="#3a4550" stroke="#5b6a76" strokeWidth={0.7} />
      <circle cx={x} cy={y} r={2.6} fill="#e2a33f" />
      <text x={x} y={y + 43} textAnchor="middle" fontSize={9} fill="#6e7d8c">
        {label}
      </text>
    </g>
  )
}

const KnifeUp = ({ x, y }: { x: number; y: number }) => (
  <path d={`M${x - 6} ${y} L${x} ${y - 9} L${x + 6} ${y} Z`} fill="#61707c" stroke="#93a3af" strokeWidth={0.7} />
)
const KnifeDown = ({ x, y }: { x: number; y: number }) => (
  <path d={`M${x - 6} ${y + 9} L${x} ${y} L${x + 6} ${y + 9} Z`} fill="#61707c" stroke="#93a3af" strokeWidth={0.7} />
)

function Arrow({ x, y, len, color }: { x: number; y: number; len: number; color: string }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={y + len - 8} stroke={color} strokeWidth={1.7} />
      <path d={`M${x - 4.6} ${y + len - 9} L${x + 4.6} ${y + len - 9} L${x} ${y + len} Z`} fill={color} />
    </g>
  )
}

function Dim({ x1, x2, y, label }: { x1: number; x2: number; y: number; label: string }) {
  return (
    <g stroke="#3d4a56" strokeWidth={0.9}>
      <line x1={x1} y1={y - 4} x2={x1} y2={y + 4} />
      <line x1={x2} y1={y - 4} x2={x2} y2={y + 4} />
      <line x1={x1} y1={y} x2={x2} y2={y} strokeDasharray="4 3" />
      <text x={(x1 + x2) / 2} y={y - 5} textAnchor="middle" fontSize={8.5} fill="#5e6c78" stroke="none">
        {label}
      </text>
    </g>
  )
}
