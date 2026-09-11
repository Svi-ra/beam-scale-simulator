/**
 * The shell around whichever design is active.
 *
 * It knows the contract in `visual/types.ts` and nothing else — no design-specific
 * geometry, no design-specific styling. Swapping designs swaps the components and the
 * stage's aspect ratio; everything else here is unchanged.
 */
import { useSim } from '../sim/hooks'
import type { ScaleVisual } from '../visual/types'

export function ScaleStage({
  visual,
  showGhost,
}: {
  visual: ScaleVisual
  showGhost: boolean
}) {
  const state = useSim()
  const { BeamHead, plates, viewBox } = visual
  const narrow = plates.filter((p) => p.span === 'narrow')
  const wide = plates.filter((p) => p.span === 'wide')

  return (
    // One declaration here; every drawing below inherits it.
    <main className="stage-col" style={{ fontFamily: visual.typeface }}>
      <div
        className={`stage${visual.ground === 'light' ? ' stage-light' : ''}`}
        style={{ ['--stage-ar' as string]: `${viewBox.w} / ${viewBox.h}` }}
      >
        <BeamHead state={state} showGhost={showGhost} />
        <div className="stage-caption">{visual.caption}</div>
      </div>

      {/* The narrow-plate count goes out as a custom property rather than an inline grid
          template, so the narrow-screen rules can still collapse the row to one column. */}
      {plates.length > 0 && (
        <div className="plates" style={{ ['--narrow-plates' as string]: narrow.length }}>
          {[...narrow, ...wide].map((p) => (
            <div key={p.id} className={`plate${p.span === 'narrow' ? ' plate-narrow' : ''}`}>
              <p.Component state={state} showGhost={showGhost} />
              <span className="plate-label">{p.label}</span>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
