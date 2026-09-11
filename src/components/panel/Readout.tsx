import { useRef } from 'react'
import { sim } from '../../sim/engine'
import { useFrame, useSim } from '../../sim/hooks'
import {
  indicatedLb,
  solvePoises,
  unbalanceLb,
  type BalanceStatus,
} from '../../sim/physics'
import { fmt, fmtLb, fmtSigned, toKg } from '../../lib/format'

/**
 * The simulation reports 'over' / 'under' — poises heavier or lighter than the load.
 * Which way that moves a pointer depends on where the active design puts it, so the
 * wording is composed from the design's `pointerSense` rather than baked in.
 */
function statusText(status: BalanceStatus, sense: 1 | -1) {
  if (status === 'balanced') return 'In balance'
  if (status === 'swinging') return 'Settling'
  if (status === 'runaway') return 'Unstable beam'
  // The index's direction is shown by the repeater beside the reading, so the pill
  // only has to say which way the setting is out.
  void sense
  return `Reading ${status}`
}

export function Readout({ pointerSense }: { pointerSense: 1 | -1 }) {
  const s = useSim()
  const reading = indicatedLb(s)
  const target = solvePoises(s)
  const over = target.overCapacity

  const marker = useRef<HTMLDivElement>(null)
  const unbalance = unbalanceLb(s)

  useFrame((m, st) => {
    if (marker.current) {
      const frac = Math.max(-1, Math.min(1, m.theta / st.layout.thetaMax))
      // theta > 0 lifts the pointer, so the marker rises.
      // A design whose index is on the long arm moves the opposite way.
      marker.current.style.transform = `translateY(${(-frac * pointerSense * 38).toFixed(2)}px)`
      marker.current.style.background =
        st.status === 'balanced' ? 'var(--good)' : st.status === 'runaway' ? 'var(--bad)' : 'var(--accent)'
    }
  })

  return (
    <section className="card">
      <div className="readout">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 8 }}>
              Beam reading
            </div>
            <div className="value">
              <span className="num">{fmtLb(reading)}</span>
              <span className="unit">lb</span>
            </div>
            <div className="alt mono">
              {fmt(toKg(reading), 2)} kg
              <span style={{ color: 'var(--ink-4)' }}> · {fmtLb(s.lowerLb)} + {fmtLb(s.upperLb)}</span>
            </div>
          </div>

          {/* trig-loop repeater: where the pointer is sitting right now */}
          <div style={{ width: 44, flex: 'none', textAlign: 'center' }}>
            <div
              style={{
                position: 'relative',
                height: 96,
                borderRadius: 7,
                border: '1px solid var(--line)',
                background: 'linear-gradient(180deg,#0c1116,#10161d)',
                overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', inset: '46% 4px', background: 'rgba(70,211,154,.16)', borderTop: '1px solid rgba(70,211,154,.35)', borderBottom: '1px solid rgba(70,211,154,.35)' }} />
              <div
                ref={marker}
                style={{
                  position: 'absolute',
                  left: 6,
                  right: 6,
                  top: 'calc(50% - 1.5px)',
                  height: 3,
                  borderRadius: 2,
                  background: 'var(--accent)',
                  boxShadow: '0 0 8px currentColor',
                  willChange: 'transform',
                }}
              />
            </div>
            <div style={{ fontSize: 9, letterSpacing: '0.08em', color: 'var(--ink-4)', marginTop: 5 }}>INDEX</div>
          </div>
        </div>

        <div className="row" style={{ marginTop: 12, justifyContent: 'space-between' }}>
          <span className={`pill ${over ? 'over' : s.status}`}>
            <span className="dot" />
            {over ? 'Over capacity' : statusText(s.status, pointerSense)}
          </span>
          <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
            {fmtSigned(unbalance, 2)} lb out
          </span>
        </div>
      </div>

      <div className="body" style={{ gap: 10 }}>
        {s.practice && !s.revealed ? (
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="hint" style={{ fontSize: 11.5, color: 'var(--ink-4)' }}>
              Load hidden — balance the beam, then check.
            </span>
            <button className="btn sm primary" onClick={() => sim.set({ revealed: true })}>
              Check reading
            </button>
          </div>
        ) : (
          <dl className="spec">
            <dt>True load on platform</dt>
            <dd>{fmt(s.loadLb, 1)} lb</dd>
            <dt>Error of this setting</dt>
            <dd style={{ color: Math.abs(reading - s.loadLb) < 0.26 ? 'var(--good)' : 'var(--ink-2)' }}>
              {fmtSigned(reading - s.loadLb, 2)} lb
            </dd>
            <dt>Capacity used</dt>
            <dd>{fmt((s.loadLb / s.layout.capacity) * 100, 0)}%</dd>
          </dl>
        )}
      </div>
    </section>
  )
}
