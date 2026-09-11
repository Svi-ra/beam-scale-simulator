import { sim } from '../../sim/engine'
import { useSim } from '../../sim/hooks'
import {
  dampingRatio,
  lowerPoiseX,
  naturalPeriod,
  netTorque,
  stiffness,
  upperPoiseX,
} from '../../sim/physics'
import { PLATFORM } from '../../sim/spec'

import { fmt, fmtSigned } from '../../lib/format'

function Slider({
  value,
  min,
  max,
  step,
  onChange,
  label,
}: {
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  label: string
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <input
      type="range"
      aria-label={label}
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      style={{ ['--fill' as string]: `${pct}%` }}
    />
  )
}

export function MechanismPanel() {
  const s = useSim()
  const L = s.layout
  const k = stiffness(s)
  const T = naturalPeriod(s)
  const zeta = dampingRatio(s, s.damping)
  const tau = netTorque(s, 0)
  const perQuarter = k > 0 ? ((0.25 * L.momentPerLb) / k / L.thetaMax) * 100 : Infinity
  const unstable = k <= 0

  return (
    <details className="card" open>
      <summary>
        Mechanism
        <span className="chev">›</span>
      </summary>
      <div className="body">
        <dl className="spec">
          <dt>Platform lever train</dt>
          <dd>
            ×{PLATFORM.stage1} · ×{PLATFORM.stage2} = ×{PLATFORM.ratio}
          </dd>
          <dt>Load arm a (fulcrum → load knife)</dt>
          <dd>{fmt(L.loadArm, 3)} in</dd>
          <dt>Moment per pound of load</dt>
          <dd>{fmt(L.momentPerLb, 3)} lbf·in</dd>
          <dt>Large poise / travel</dt>
          <dd>
            {fmt(L.lowerPoiseWeight, 3)} lbf / {fmt(L.lower.travel, 1)} in
          </dd>
          <dt>Small poise / travel</dt>
          <dd>
            {fmt(L.upperPoiseWeight, 4)} lbf / {fmt(L.upper.travel, 1)} in
          </dd>
          <dt>Capacity</dt>
          <dd>
            {L.lower.capacity} + {L.upper.capacity} = {L.capacity} lb
          </dd>
        </dl>

        <div className="equation">
          <div>
            <span className="m">ΣM =</span> <span className="k">{fmt(L.lowerPoiseWeight, 3)}</span>·
            {fmt(lowerPoiseX(L, s.lowerLb), 3)} <span className="m">+</span>{' '}
            <span className="k">{fmt(L.upperPoiseWeight, 4)}</span>·{fmt(upperPoiseX(L, s.upperLb), 3)}
          </div>
          <div>
            <span className="m">&nbsp;&nbsp;&nbsp;&nbsp;+</span>{' '}
            <span className="k">{fmt(L.ball.weight, 3)}</span>·{fmt(s.ballX, 3)}{' '}
            <span className="m">+</span> <span className="g">{fmt(L.body.weight, 2)}</span>·
            {fmt(L.bodyCgX, 3)}
          </div>
          <div>
            <span className="m">&nbsp;&nbsp;&nbsp;&nbsp;−</span>{' '}
            <span className="c">
              {fmt(s.loadLb, 1)}/{PLATFORM.ratio}
            </span>
            ·{fmt(L.loadArm, 2)}
          </div>
          <div style={{ borderTop: '1px solid var(--line-soft)', marginTop: 5, paddingTop: 5 }}>
            <span className="m">=</span> {fmtSigned(tau, 4)} lbf·in{' '}
            <span className="m">=</span> {fmtSigned(tau / L.momentPerLb, 2)} lb out of balance
          </div>
        </div>

        <div className="field">
          <div className="label">
            <span>Balance-ball height above the pivot</span>
            <span className="spacer" />
            <span className="val">{fmt(s.ballHeight, 2)} in</span>
          </div>
          <Slider
            label="Balance ball height"
            value={s.ballHeight}
            min={L.ball.heightRange[0]}
            max={L.ball.heightRange[1]}
            step={0.02}
            onChange={(v) => sim.set({ ballHeight: v })}
          />
          <div className="hint">
            Raising the ball cancels more of the beam's restoring moment, so the beam
            answers to smaller differences but takes longer to settle. Lower it and the
            beam becomes, in the patent's words, unyielding.
          </div>
        </div>

        <div className="field">
          <div className="label">
            <span>Damping at the knife edges</span>
            <span className="spacer" />
            <span className="val">ζ = {unstable ? '—' : fmt(zeta, 2)}</span>
          </div>
          <Slider
            label="Damping"
            value={s.damping}
            min={0.004}
            max={0.28}
            step={0.002}
            onChange={(v) => sim.set({ damping: v })}
          />
        </div>

        <div className="field">
          <div className="label">
            <span>Beam response</span>
          </div>
          <div className="seg">
            {[
              ['Real time', 1],
              ['2.5×', 2.5],
              ['5×', 5],
            ].map(([label, v]) => (
              <button
                key={label as string}
                className={s.timeScale === v ? 'active' : ''}
                onClick={() => sim.set({ timeScale: v as number })}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="hint">
            A real beam of this inertia swings with a period of about{' '}
            {Number.isFinite(T) ? fmt(T, 1) : '∞'} s — slow enough that an operator waits
            for it. The multiplier only speeds up simulated time.
          </div>
        </div>

        <dl className="spec">
          <dt>Restoring stiffness</dt>
          <dd style={{ color: unstable ? 'var(--bad)' : undefined }}>{fmt(k, 4)} lbf·in/rad</dd>
          <dt>Rotational inertia</dt>
          <dd>{fmt(L.inertia, 4)} lbf·in·s²</dd>
          <dt>Natural period</dt>
          <dd>{Number.isFinite(T) ? `${fmt(T, 2)} s` : '—'}</dd>
          <dt>Index move per ¼ lb</dt>
          <dd>{Number.isFinite(perQuarter) ? `${fmt(perQuarter, 0)}% of travel` : '—'}</dd>
        </dl>

        {unstable && (
          <div className="alert">
            <span>⚠</span>
            <span>
              There is now more weight above the pivot edge than the beam's own centre of
              gravity can hold down. The beam has no equilibrium: it runs to whichever stop
              it starts toward — Fairbanks's warning that too much material above the pivot
              edge "will occasion the beam to rise or fall indefinitely". Lower the ball
              below{' '}
              {fmt(
                (L.body.weight * L.body.cgDrop -
                  L.lowerPoiseWeight * L.lower.cgHeight -
                  L.upperPoiseWeight * L.upper.cgHeight) /
                  L.ball.weight,
                2,
              )}{' '}
              in
              to bring it back.
            </span>
          </div>
        )}
      </div>
    </details>
  )
}

export function GuidePanel() {
  return (
    <details className="card">
      <summary>
        How to weigh
        <span className="chev">›</span>
      </summary>
      <div className="body" style={{ gap: 10 }}>
        <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, lineHeight: 1.65, color: 'var(--ink-2)' }}>
          <li>With the platform empty and both poises at zero, the balance index should float in the middle of its window. If it does not, traverse the balance ball until it does.</li>
          <li>Put the load on the platform. The index runs hard against one end: the poises are reading under the load.</li>
          <li>Slide the large poise outward notch by notch until the index flies to the other end, then bring it back one notch.</li>
          <li>Slide the small poise along the upper bar until the index floats in the middle again.</li>
          <li>Read the weight as the large poise's notch plus the small poise's graduation.</li>
        </ol>
        <div className="note">
          <b>Why it reads true:</b> both bars are graduated from the same constant — poise
          weight × distance = pounds × a ÷ {PLATFORM.ratio} — so a pound on the upper bar
          and a pound on the lower bar mean exactly the same moment at the fulcrum.
        </div>
      </div>
    </details>
  )
}

export function SourcesPanel() {
  return (
    <details className="card">
      <summary>
        References
        <span className="chev">›</span>
      </summary>
      <div className="body" style={{ gap: 9 }}>
        <div className="note">
          <b>Description of a Physician Beam Scale</b> — the dual-beam layout, the lower bar
          with large increments and the upper bar with small ones, the sliding poises, the
          balance pointer and trig loop, the pillar head and column, and a capacity read in
          pounds. The Classic design is laid out from it.
        </div>
        <div className="note">
          <b>Detecto-layout design.svg</b> — the clinical beam head the Detecto design is
          built from: every outline on that stage is a path lifted from this drawing, and
          its fulcrum, bar scales and poise weights are measured off it.
        </div>
        <div className="note">
          <b>E. &amp; T. Fairbanks, US Patent 120 (1832; reissued 1837), “Mode of Constructing
          Steelyard-Balances.”</b> — the compound platform lever train, the arm "divided by
          notches for using a movable poise", and the ball on a screw rod "moved horizontally
          on a line elevated above the edge of the pivot", for the "double purpose" of
          counterpoising the platform and putting the beam into equilibrium. The stability
          model here — and the runaway warning — comes straight from that passage.
        </div>
      </div>
    </details>
  )
}
