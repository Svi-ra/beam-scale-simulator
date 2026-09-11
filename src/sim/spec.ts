/**
 * What every scale in this simulator has in common.
 *
 * Sources (see `Docs references/Beam weight scale/`):
 *  - "Description of a Physician Beam Scale" — dual-beam layout (lower poise bar with
 *    large increments, upper poise bar with small increments), sliding poises, balance
 *    pointer swinging inside a fixed trig loop, pillar head carrying the fulcrum.
 *  - Fairbanks, US Patent 120 (1832, reissued 1837), "Mode of Constructing
 *    Steelyard-Balances" — compound platform-lever steelyard; a movable poise on a
 *    notched arm; and a "cylindrical or other formed weight ... moved horizontally on a
 *    line elevated above the edge of the pivot", serving the "double purpose" of
 *    counterpoising the platform and putting the beam itself into equilibrium. The
 *    patent states the stability rule this simulator models directly: mass too far
 *    above the pivot edge makes the beam "rise or fall indefinitely", while too much
 *    below settles it "into an unyielding horizontal position".
 *  - "Detecto-layout design.svg" — the clinical beam head the Detecto design is built
 *    from, shape for shape.
 *
 * The *beam* itself differs from design to design: where its knife-edge sits relative
 * to the bars, how long each bar is, how heavy each poise is. That belongs to the
 * design, and lives in `layout.ts`. What is left here is the platform under it, the
 * damping, and the units.
 *
 * UNITS: inches, pounds-force (lbf), seconds. Every "mass" here is expressed as a
 * weight in lbf, so g is already folded in. Torques are lbf·in; rotational inertia is
 * lbf·in·s² (mass = lbf / 386.1 in·s⁻²).
 *
 * COORDINATES: the fulcrum knife-edge is the origin. +x runs along the LONG arm that
 * carries the graduated bars; −x is the SHORT arm holding the load knife-edge. +y is up
 * from the pivot edge.
 */

/** Compound lever train under the platform (Fairbanks-type). */
export const PLATFORM = {
  /** Total multiplication: load on the platform → pull at the beam's load knife-edge. */
  ratio: 50,
  /** The train is built as two stages whose product is `ratio`. */
  stage1: 5,
  stage2: 10,
} as const

/** Viscous damping at the knife edges plus air resistance, lbf·in·s/rad. */
export const DAMPING_DEFAULT = 0.095

export const LB_PER_KG = 2.2046226218
