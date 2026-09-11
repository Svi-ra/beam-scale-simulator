import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'
import { sim, type FrameCallback, type SimState } from './engine'

export function useSim(): SimState {
  return useSyncExternalStore(sim.subscribe, sim.getSnapshot, sim.getSnapshot)
}

/** Register a per-frame callback. The callback identity may change freely. */
export function useFrame(cb: FrameCallback) {
  const ref = useRef(cb)
  ref.current = cb
  useEffect(() => sim.onFrame((m, s, dt) => ref.current(m, s, dt)), [])
}

/** Values that change every frame but only need to reach the DOM as text. */
export function useFrameText(
  compute: (motion: { theta: number; omega: number }, state: SimState) => string,
) {
  const node = useRef<HTMLElement | null>(null)
  const last = useRef('')
  const computeRef = useRef(compute)
  computeRef.current = compute
  useEffect(
    () =>
      sim.onFrame((m, s) => {
        if (!node.current) return
        const next = computeRef.current(m, s)
        if (next !== last.current) {
          last.current = next
          node.current.textContent = next
        }
      }),
    [],
  )
  return node
}

/**
 * Drag along an arbitrary straight axis in SVG user space.
 * `onMove` receives the signed distance travelled along the axis, in user units.
 */
export function useAxisDrag(opts: {
  svg: () => SVGSVGElement | null
  /** Unit vector of the drag axis in SVG user space. */
  axis: () => { x: number; y: number }
  onStart?: () => void
  onMove: (delta: number) => void
  onEnd?: () => void
}) {
  const o = useRef(opts)
  o.current = opts

  return useCallback((e: React.PointerEvent<SVGGElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const svg = o.current.svg()
    if (!svg) return
    const target = e.currentTarget
    // Pointer capture keeps the drag alive if the cursor leaves the part, but it is not
    // available for every synthetic pointer; the window listeners below are the fallback.
    try {
      target.setPointerCapture(e.pointerId)
    } catch {
      /* no capture available — window listeners still track the drag */
    }

    const toUser = (clientX: number, clientY: number) => {
      const pt = svg.createSVGPoint()
      pt.x = clientX
      pt.y = clientY
      const m = svg.getScreenCTM()
      return m ? pt.matrixTransform(m.inverse()) : { x: clientX, y: clientY }
    }

    const start = toUser(e.clientX, e.clientY)
    o.current.onStart?.()

    const move = (ev: PointerEvent) => {
      const p = toUser(ev.clientX, ev.clientY)
      const ax = o.current.axis()
      o.current.onMove((p.x - start.x) * ax.x + (p.y - start.y) * ax.y)
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      o.current.onEnd?.()
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }, [])
}
