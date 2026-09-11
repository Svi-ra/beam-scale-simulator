/**
 * The seam between the simulation and everything that draws it.
 *
 * A `ScaleVisual` is a complete look for the instrument: its own proportions, materials
 * and part shapes. It is handed the simulation state and gives back SVG. It may not
 * write to the simulation except through the interaction handles the shared layer
 * provides, and the simulation knows nothing about any of it — `src/sim` imports
 * nothing from here.
 *
 * Adding a design means adding a folder under `src/visual/` that exports one of these
 * and registering it. No simulation code changes.
 */
import type { ComponentType, ReactNode } from 'react'
import type { SimState } from '../sim/engine'
import type { BeamLayout } from '../sim/layout'
import type { Projection } from './projection'

export interface Box {
  w: number
  h: number
}

export interface Point {
  x: number
  y: number
}

/** What every drawable part of a visual receives. */
export interface VisualProps {
  /** Read-only simulation state. Mutating it is the interaction layer's job. */
  state: SimState
  /** Whether to mark where the poises must sit for the beam to rest. */
  showGhost: boolean
}

/**
 * Where a visual has chosen to draw each load-bearing part, in its own SVG units.
 *
 * The force overlay uses these as arrow origins so the arrows land on the parts as
 * drawn, while the magnitudes and the moment arms it prints come from the simulation.
 * A design is free to place a rail wherever it looks right; the physics keeps its own
 * centre-of-gravity heights either way.
 */
export interface ForceAnchors {
  load: Point
  lower: Point
  upper: Point
  ball: Point
  beamCg: Point
  /** Horizontal datum through the fulcrum, drawn from x0 to x1. */
  span: { x0: number; x1: number }
  /** y of each dimension row. */
  dimY: { load: number; lower: number; upper: number }
  /** Arrow lengths, so each design can steer them clear of its own parts. */
  len?: Partial<Record<'load' | 'lower' | 'upper' | 'ball' | 'beamCg', number>>
}

export interface PlateDef {
  id: string
  label: string
  /** `narrow` plates get a fixed slim column; `wide` takes the rest of the row. */
  span: 'narrow' | 'wide'
  Component: ComponentType<VisualProps>
}

export interface ScaleVisual {
  id: string
  /** Shown in the design picker. */
  name: string
  /** One line under the name in the picker. */
  subtitle: string
  /** Caption printed on the stage. */
  caption: string
  /** Longer note for the design panel. */
  about: ReactNode

  /**
   * The face this instrument is lettered in. Set once on the stage; every SVG text in
   * the design and its plates inherits it, so no part has to name a font.
   */
  typeface: string

  /**
   * The mechanism this design draws: where its knife-edge sits relative to its bars,
   * how long each bar is, how heavy each poise is. Selecting the design hands this to
   * the engine, so the beam on screen is the beam being solved.
   */
  layout: BeamLayout

  /**
   * The ground the stage is drawn on. A design taken off a light-ground drawing needs
   * one, or its black bands vanish into the dark chrome. Defaults to dark.
   */
  ground?: 'dark' | 'light'

  /** Drawing surface for the beam-head stage. */
  viewBox: Box
  /** Beam-frame inches → SVG units for this design. */
  projection: Projection

  /**
   * +1 when a positive beam angle (poises outweighing the load) lifts this design's
   * balance pointer, −1 when it drops it. A classic steelyard carries its pointer on
   * the short arm and reads +1; a Detecto-style beam indicates at the free end of the
   * long arm and reads −1. The readout uses this so its repeater always moves the same
   * way as the thing on screen.
   */
  pointerSense: 1 | -1

  /** The interactive beam head. */
  BeamHead: ComponentType<VisualProps>
  /** Supplementary drawings shown under the stage. */
  plates: PlateDef[]
}
