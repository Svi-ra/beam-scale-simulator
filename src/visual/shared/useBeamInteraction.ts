/**
 * Everything a scale design needs in order to be *interactive*, independent of how it
 * looks: the beam's live rotation, and drag/keyboard handles for the two poises and the
 * balance ball.
 *
 * A design supplies only its projection. The hook maps pointer travel onto the beam's
 * own axis (which is tilted, so the mapping has to follow the current angle), snaps to
 * the graduations the simulation defines, and writes the result back to the engine.
 * Nothing here knows what any part looks like.
 */
import { useRef } from 'react'
import { sim } from '../../sim/engine'
import { useAxisDrag, useFrame, useSim } from '../../sim/hooks'
import {
  lowerLbAt,
  lowerPoiseX,
  upperLbAt,
  upperPoiseX,
} from '../../sim/physics'
import type { BeamLayout } from '../../sim/layout'
import { clamp, DEG, quantize } from '../../lib/math'
import type { Projection } from '../projection'

export type PartId = 'lower' | 'upper' | 'ball'

/** Spread onto the `<g>` that draws a draggable part. */
export interface PartHandle {
  className: string
  tabIndex: number
  role: 'slider'
  'aria-label': string
  'aria-valuenow': number
  'aria-valuemin': number
  'aria-valuemax': number
  onPointerDown: (e: React.PointerEvent<SVGGElement>) => void
  onKeyDown: (e: React.KeyboardEvent<SVGGElement>) => void
}

export interface BeamInteraction {
  /** Attach to the `<svg>` root. */
  svgRef: React.RefObject<SVGSVGElement>
  /** Attach to the `<g>` holding everything that rotates with the beam. */
  beamRef: React.RefObject<SVGGElement>
  handles: Record<PartId, PartHandle>
}

export function useBeamInteraction(
  proj: Projection,
  L: BeamLayout,
): BeamInteraction {
  const state = useSim()
  const svgRef = useRef<SVGSVGElement>(null)
  const beamRef = useRef<SVGGElement>(null)
  const thetaRef = useRef(0)
  const dragStart = useRef(0)

  useFrame((m) => {
    thetaRef.current = m.theta
    beamRef.current?.setAttribute(
      'transform',
      `rotate(${(m.theta * DEG).toFixed(4)} ${proj.fulcrum.x} ${proj.fulcrum.y})`,
    )
  })

  // The beam is tilted, so a drag has to be resolved along its axis, not the screen's.
  const axis = () => ({ x: Math.cos(thetaRef.current), y: Math.sin(thetaRef.current) })
  const common = { svg: () => svgRef.current, axis }

  const lowerDrag = useAxisDrag({
    ...common,
    onStart: () => {
      dragStart.current = lowerPoiseX(L, sim.state.lowerLb)
      sim.set({ dragging: 'lower', auto: null })
    },
    onMove: (d) => {
      const lb = lowerLbAt(L, dragStart.current + d / proj.px)
      sim.set({ lowerLb: clamp(quantize(lb, L.lower.step), 0, L.lower.capacity) })
    },
    onEnd: () => sim.set({ dragging: null }),
  })

  const upperDrag = useAxisDrag({
    ...common,
    onStart: () => {
      dragStart.current = upperPoiseX(L, sim.state.upperLb)
      sim.set({ dragging: 'upper', auto: null })
    },
    onMove: (d) => {
      const lb = upperLbAt(L, dragStart.current + d / proj.px)
      sim.set({ upperLb: clamp(quantize(lb, L.upper.step), 0, L.upper.capacity) })
    },
    onEnd: () => sim.set({ dragging: null }),
  })

  const ballDrag = useAxisDrag({
    ...common,
    onStart: () => {
      dragStart.current = sim.state.ballX
      sim.set({ dragging: 'ball' })
    },
    onMove: (d) =>
      sim.set({ ballX: clamp(dragStart.current + d / proj.px, L.ballXMin, L.ballXMax) }),
    onEnd: () => sim.set({ dragging: null }),
  })

  const keys = (part: PartId) => (e: React.KeyboardEvent<SVGGElement>) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!dir) return
    e.preventDefault()
    const coarse = e.shiftKey
    if (part === 'lower') {
      sim.set({
        lowerLb: clamp(
          quantize(sim.state.lowerLb + dir * L.lower.step, L.lower.step),
          0,
          L.lower.capacity,
        ),
        auto: null,
      })
    } else if (part === 'upper') {
      sim.set({
        upperLb: clamp(
          quantize(sim.state.upperLb + dir * L.upper.step * (coarse ? 4 : 1), L.upper.step),
          0,
          L.upper.capacity,
        ),
        auto: null,
      })
    } else {
      sim.set({
        ballX: clamp(sim.state.ballX + dir * 0.01, L.ballXMin, L.ballXMax),
      })
    }
  }

  const handle = (
    part: PartId,
    label: string,
    value: number,
    min: number,
    max: number,
    onPointerDown: PartHandle['onPointerDown'],
  ): PartHandle => ({
    className: `grab${state.dragging === part ? ' dragging' : ''}`,
    tabIndex: 0,
    role: 'slider',
    'aria-label': label,
    'aria-valuenow': Math.round(value * 100) / 100,
    'aria-valuemin': min,
    'aria-valuemax': max,
    onPointerDown,
    onKeyDown: keys(part),
  })

  return {
    svgRef,
    beamRef,
    handles: {
      lower: handle('lower', 'Large poise, lower bar (lb)', state.lowerLb, 0, L.lower.capacity, lowerDrag),
      upper: handle('upper', 'Small poise, upper bar (lb)', state.upperLb, 0, L.upper.capacity, upperDrag),
      ball: handle('ball', 'Balance ball — zero trim (in)', state.ballX, L.ballXMin, L.ballXMax, ballDrag),
    },
  }
}

/** Fades an element in and out as the beam enters and leaves balance. */
export function useBalanceGlow(ref: React.RefObject<SVGGElement>) {
  useFrame((_, st) => {
    const el = ref.current
    if (!el) return
    const lit = st.status === 'balanced' ? '1' : '0'
    if (el.getAttribute('data-lit') !== lit) {
      el.setAttribute('data-lit', lit)
      el.setAttribute('opacity', lit === '1' ? '1' : '0')
    }
  })
}
