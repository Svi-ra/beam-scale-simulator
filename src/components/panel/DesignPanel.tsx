/**
 * Design picker. Purely a view concern — the choice lives in the shell's own state, not
 * in the simulation, so switching designs cannot disturb the beam.
 */
import { VISUALS } from '../../visual/registry'
import type { ScaleVisual } from '../../visual/types'

export function DesignPanel({
  active,
  onPick,
}: {
  active: ScaleVisual
  onPick: (id: string) => void
}) {
  return (
    <section className="card">
      <header>Scale design</header>
      <div className="body" style={{ gap: 10 }}>
        <div className="designs">
          {VISUALS.map((v) => (
            <button
              key={v.id}
              className={`design${v.id === active.id ? ' active' : ''}`}
              onClick={() => onPick(v.id)}
              aria-pressed={v.id === active.id}
            >
              <span className="swatch" data-design={v.id} aria-hidden />
              <span className="text">
                <span className="name">{v.name}</span>
                <span className="sub">{v.subtitle}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="note">{active.about}</div>
      </div>
    </section>
  )
}
