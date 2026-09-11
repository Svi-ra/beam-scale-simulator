/**
 * Simulation engine + minimal external store.
 *
 * The beam angle changes every frame, so it never goes through React state: components
 * register a frame callback and write transforms straight onto their SVG nodes. Only
 * discrete things an operator would actually read — poise settings, load, balance
 * status — live in the store and trigger renders.
 */

import { DAMPING_DEFAULT } from './spec'
import { DETECTO_LAYOUT, type BeamLayout } from './layout'
import {
  balanceStatus,
  integrate,
  type BalanceStatus,
  type Mechanism,
  type Motion,
} from './physics'

export interface SimState extends Mechanism {
  damping: number
  /** Simulated seconds per real second. The real beam is deliberately slow. */
  timeScale: number
  status: BalanceStatus
  units: 'lb' | 'kg'
  xray: boolean
  /** Practice mode hides the load until the operator commits to a reading. */
  practice: boolean
  revealed: boolean
  dragging: 'lower' | 'upper' | 'ball' | null
  /** Target the poises animate toward when auto-balancing; null when idle. */
  auto: { lowerLb: number; upperLb: number } | null
}

const initial: SimState = {
  loadLb: 0,
  lowerLb: 0,
  upperLb: 0,
  layout: DETECTO_LAYOUT,
  ballX: DETECTO_LAYOUT.ball.xNominal,
  ballHeight: DETECTO_LAYOUT.ball.height,
  tareErrorLb: 0,
  damping: DAMPING_DEFAULT,
  timeScale: 2.5,
  status: 'balanced',
  units: 'lb',
  xray: false,
  practice: false,
  revealed: true,
  dragging: null,
  auto: null,
}

export type FrameCallback = (motion: Motion, state: SimState, dt: number) => void

class Engine {
  state: SimState = { ...initial }
  motion: Motion = { theta: 0, omega: 0 }

  private listeners = new Set<() => void>()
  private frameCbs = new Set<FrameCallback>()
  private accumulator = 0
  private last = 0
  private raf = 0

  // -- store -------------------------------------------------------------
  subscribe = (fn: () => void) => {
    this.listeners.add(fn)
    return () => {
      this.listeners.delete(fn)
    }
  }

  getSnapshot = () => this.state

  set(patch: Partial<SimState>) {
    let changed = false
    for (const k of Object.keys(patch) as (keyof SimState)[]) {
      if (!Object.is(this.state[k], patch[k])) {
        changed = true
        break
      }
    }
    if (!changed) return
    this.state = { ...this.state, ...patch }
    for (const fn of this.listeners) fn()
  }

  onFrame = (cb: FrameCallback) => {
    this.frameCbs.add(cb)
    return () => {
      this.frameCbs.delete(cb)
    }
  }

  // -- loop --------------------------------------------------------------
  start() {
    if (this.raf) return
    this.last = performance.now()
    const loop = (now: number) => {
      this.raf = requestAnimationFrame(loop)
      const realDt = Math.min(0.05, (now - this.last) / 1000)
      this.last = now
      this.advance(realDt)
    }
    this.raf = requestAnimationFrame(loop)
  }

  stop() {
    cancelAnimationFrame(this.raf)
    this.raf = 0
  }

  private advance(realDt: number) {
    const s = this.state
    if (s.auto) this.stepAuto(realDt)

    const simDt = realDt * s.timeScale
    this.accumulator = Math.min(this.accumulator + simDt, 0.25)
    const step = 1 / 480
    while (this.accumulator >= step) {
      integrate(this.motion, s, s.damping, step)
      this.accumulator -= step
    }

    const status = balanceStatus(s, this.motion)
    if (status !== s.status) this.set({ status })

    for (const cb of this.frameCbs) cb(this.motion, this.state, realDt)
  }

  /**
   * Swap in another design's mechanism. The readings carry over where the new beam can
   * show them; the trim weight goes back to its own nominal place, because "trimmed to
   * zero" means something different on a different beam.
   */
  setLayout(layout: BeamLayout) {
    if (this.state.layout === layout) return
    this.set({
      layout,
      lowerLb: Math.min(this.state.lowerLb, layout.lower.capacity),
      upperLb: Math.min(this.state.upperLb, layout.upper.capacity),
      ballX: layout.ball.xNominal,
      ballHeight: layout.ball.height,
      auto: null,
    })
  }

  private notchTimer = 0

  /**
   * Drives the poises to the target the way a hand would: the large poise steps notch
   * by notch — it physically cannot rest between them — while the small poise slides.
   */
  private stepAuto(dt: number) {
    const s = this.state
    if (!s.auto) return

    let lowerLb = s.lowerLb
    this.notchTimer += dt
    const perNotch = 0.09 // seconds spent moving one 50 lb notch
    while (this.notchTimer >= perNotch && lowerLb !== s.auto.lowerLb) {
      this.notchTimer -= perNotch
      lowerLb += Math.sign(s.auto.lowerLb - lowerLb) * s.layout.lower.step
    }
    if (lowerLb === s.auto.lowerLb) this.notchTimer = 0

    // Hold the small poise until the notch is settled, as an operator would.
    const upperLb =
      lowerLb === s.auto.lowerLb
        ? quantize(
            approach(s.upperLb, s.auto.upperLb, s.layout.upper.capacity * 1.4 * dt),
            s.layout.upper.minor,
          )
        : s.upperLb

    const done = lowerLb === s.auto.lowerLb && upperLb === s.auto.upperLb
    this.set({ lowerLb, upperLb, auto: done ? null : s.auto })
  }

  reset() {
    const layout = this.state.layout
    this.set({
      ...initial,
      layout,
      ballX: layout.ball.xNominal,
      ballHeight: layout.ball.height,
    })
    this.motion.theta = 0
    this.motion.omega = 0
  }

  /** A small nudge, as though the beam had been tapped. */
  nudge(strength = 0.9) {
    this.motion.omega += strength * (Math.random() > 0.5 ? 1 : -1)
  }
}

function approach(from: number, to: number, maxStep: number) {
  const d = to - from
  if (Math.abs(d) <= maxStep) return to
  return from + Math.sign(d) * maxStep
}

/** Snap to a graduation, keeping binary float error out of the reading. */
function quantize(v: number, step: number) {
  return Math.round(v / step) * step
}

export const sim = new Engine()
