import { useEffect, useState } from 'react'
import { sim } from './sim/engine'
import { useSim } from './sim/hooks'
import { ScaleStage } from './components/ScaleStage'
import { Readout } from './components/panel/Readout'
import { LoadControl, PoiseControl, ZeroControl } from './components/panel/Controls'
import { DesignPanel } from './components/panel/DesignPanel'
import { GuidePanel, MechanismPanel, SourcesPanel } from './components/panel/Mechanism'
import { DEFAULT_VISUAL_ID, getVisual } from './visual/registry'

const STORAGE_KEY = 'beam-scale:design'

function storedDesignId() {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_VISUAL_ID
  } catch {
    return DEFAULT_VISUAL_ID
  }
}

// Picking a design picks a mechanism as well as a drawing — they are the same machine
// seen from two sides. The engine is told once here, before the first render, so the
// beam being solved is never briefly a different beam from the one on screen.
sim.setLayout(getVisual(storedDesignId()).layout)

export default function App() {
  const s = useSim()
  const [showGhost, setShowGhost] = useState(true)

  // Which design is on screen is a view preference, not simulation state — keeping it
  // out of the engine is what lets designs be swapped without touching the beam.
  const [designId, setDesignId] = useState(storedDesignId)
  const visual = getVisual(designId)

  const pickDesign = (id: string) => {
    setDesignId(id)
    sim.setLayout(getVisual(id).layout)
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {
      /* storage unavailable — the choice just will not persist */
    }
  }

  useEffect(() => {
    sim.start()
    return () => sim.stop()
  }, [])

  return (
    <div className="app">
      <header className="masthead">
        <span className="mark" aria-hidden>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M8 2v11M3 5h10M3 5 1 10h4L3 5Zm10 0-2 5h4l-2-5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
            <path d="M5 14h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </span>
        <div>
          <h1>Physician Beam Scale</h1>
          <div className="sub">Compound-lever steelyard · interactive simulation</div>
        </div>
        <span className="spacer" />
        <div className="row">
          <button
            className={`btn sm${showGhost ? ' on' : ''}`}
            onClick={() => setShowGhost((v) => !v)}
            title="Mark where the poises must sit for the beam to rest"
          >
            Equilibrium marks
          </button>
          <button
            className={`btn sm${s.xray ? ' on' : ''}`}
            onClick={() => sim.set({ xray: !s.xray })}
            title="Show forces, moment arms and the lever ratio"
          >
            Force view
          </button>
          <button className="btn sm" onClick={() => sim.reset()}>
            Reset
          </button>
        </div>
      </header>

      <div className="workspace">
        <ScaleStage visual={visual} showGhost={showGhost} />

        <aside className="sidebar">
          <Readout pointerSense={visual.pointerSense} />
          <LoadControl />
          <PoiseControl />
          <DesignPanel active={visual} onPick={pickDesign} />
          <ZeroControl />
          <MechanismPanel />
          <GuidePanel />
          <SourcesPanel />
        </aside>
      </div>
    </div>
  )
}
