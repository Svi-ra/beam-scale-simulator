import type { ReactNode } from 'react'
import { sim } from '../../sim/engine'
import { useSim } from '../../sim/hooks'
import { solvePoises } from '../../sim/physics'
import { clamp } from '../../lib/math'
import { fmt, fmtLb, toKg } from '../../lib/format'

/** A range input that paints its own filled track. */
function Slider({
  value,
  min,
  max,
  step,
  onChange,
  ...rest
}: {
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  'aria-label'?: string
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <input
      type="range"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      style={{ ['--fill' as string]: `${pct}%` }}
      {...rest}
    />
  )
}

function Field({ label, value, children, hint }: { label: string; value?: ReactNode; children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="field">
      <div className="label">
        <span>{label}</span>
        <span className="spacer" />
        {value != null && <span className="val">{value}</span>}
      </div>
      {children}
      {hint && <div className="hint">{hint}</div>}
    </div>
  )
}

const PRESETS = [0, 28, 65, 124, 168, 212, 305, 440]

export function LoadControl() {
  const s = useSim()
  const hidden = s.practice && !s.revealed

  const setLoad = (lb: number) =>
    sim.set({ loadLb: clamp(lb, 0, 540), revealed: !s.practice, auto: null })

  return (
    <section className="card">
      <header>
        Load on the platform
        <span className="spacer" />
        <button
          className={`btn sm${s.practice ? ' on' : ''}`}
          onClick={() =>
            sim.set({ practice: !s.practice, revealed: s.practice })
          }
          title="Hide the load and read the scale the way an operator would"
        >
          Practice
        </button>
      </header>
      <div className="body">
        <Field
          label="Weight"
          value={hidden ? '— — —' : `${fmt(s.loadLb, 1)} lb · ${fmt(toKg(s.loadLb), 1)} kg`}
        >
          <Slider
            aria-label="Load on the platform, pounds"
            value={s.loadLb}
            min={0}
            max={540}
            step={0.5}
            onChange={setLoad}
          />
        </Field>

        {!hidden && (
          <div className="chips">
            {PRESETS.map((p) => (
              <button
                key={p}
                className={`chip${Math.abs(s.loadLb - p) < 0.01 ? ' active' : ''}`}
                onClick={() => setLoad(p)}
              >
                {p} lb
              </button>
            ))}
          </div>
        )}

        <div className="row wrap">
          <button
            className="btn sm"
            onClick={() =>
              sim.set({
                loadLb: Math.round((30 + Math.random() * 420) * 4) / 4,
                revealed: !s.practice,
                auto: null,
              })
            }
          >
            Random subject
          </button>
          <button className="btn sm" onClick={() => setLoad(0)}>
            Clear platform
          </button>
          <button className="btn sm" onClick={() => sim.nudge()} title="Set the beam swinging">
            Tap beam
          </button>
        </div>

        {s.loadLb > s.layout.capacity && (
          <div className="alert">
            <span>⚠</span>
            <span>
              {fmt(s.loadLb, 0)} lb exceeds the {s.layout.capacity} lb capacity — the poises cannot
              reach a balancing position and the beam stays hard against its stop.
            </span>
          </div>
        )}
      </div>
    </section>
  )
}

export function PoiseControl() {
  const s = useSim()
  const target = solvePoises(s)

  const bump = (d: number) =>
    sim.set({
      lowerLb: clamp(
        Math.round((s.lowerLb + d) / s.layout.lower.step) * s.layout.lower.step,
        0,
        s.layout.lower.capacity,
      ),
      auto: null,
    })

  return (
    <section className="card">
      <header>Poises</header>
      <div className="body">
        <Field label="Large poise — lower bar" value={`${Math.round(s.lowerLb)} lb`} hint={`Notched every ${s.layout.lower.step} lb. Drag it on the beam, or step it here.`}>
          <div className="stepper">
            <button onClick={() => bump(-s.layout.lower.step)} aria-label="Move large poise inward">
              −
            </button>
            <div className="num">{Math.round(s.lowerLb)} lb</div>
            <button onClick={() => bump(s.layout.lower.step)} aria-label="Move large poise outward">
              +
            </button>
          </div>
        </Field>

        <Field label="Small poise — upper bar" value={`${fmtLb(s.upperLb)} lb`} hint={`Graduated in ${s.layout.upper.minor === 0.25 ? "¼" : s.layout.upper.minor} lb over ${s.layout.upper.capacity} lb of travel.`}>
          <Slider
            aria-label="Small poise, pounds"
            value={s.upperLb}
            min={0}
            max={s.layout.upper.capacity}
            step={s.layout.upper.step}
            onChange={(v) => sim.set({ upperLb: Math.round(v / s.layout.upper.step) * s.layout.upper.step, auto: null })}
          />
        </Field>

        <div className="row">
          <button
            className="btn primary"
            style={{ flex: 1 }}
            disabled={target.overCapacity}
            onClick={() => sim.set({ auto: { lowerLb: target.lowerLb, upperLb: target.upperLb } })}
          >
            Balance the beam
          </button>
          <button className="btn" onClick={() => sim.set({ lowerLb: 0, upperLb: 0, auto: null })}>
            Zero poises
          </button>
        </div>
      </div>
    </section>
  )
}

export function ZeroControl() {
  const s = useSim()
  const offset = (s.layout.ball.weight * (s.ballX - s.layout.ball.xNominal)) / s.layout.momentPerLb

  return (
    <section className="card">
      <header>Balance ball — zero trim</header>
      <div className="body">
        <Field
          label="Position on the screw rod"
          value={`${fmt(s.ballX, 3)} in`}
          hint={
            <>
              Traversing the ball shifts the zero by{' '}
              <b style={{ color: 'var(--ink-2)' }}>{fmt(-offset, 2)} lb</b>. With the platform
              empty and both poises at zero, the index should float in the middle of its
              window.
            </>
          }
        >
          <Slider
            aria-label="Balance ball position"
            value={s.ballX}
            min={s.layout.ballXMin}
            max={s.layout.ballXMax}
            step={0.002}
            onChange={(v) => sim.set({ ballX: v })}
          />
        </Field>

        <div className="row">
          <button
            className="btn sm"
            onClick={() =>
              sim.set({
                tareErrorLb: (Math.random() * 2 - 1) * 1.4,
                loadLb: 0,
                lowerLb: 0,
                upperLb: 0,
                auto: null,
              })
            }
          >
            Knock the zero off
          </button>
          <button
            className="btn sm"
            onClick={() => sim.set({ ballX: s.layout.ball.xNominal, tareErrorLb: 0 })}
          >
            Restore factory zero
          </button>
        </div>
      </div>
    </section>
  )
}
