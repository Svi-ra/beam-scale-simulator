/**
 * Detecto — a clinical beam head, rebuilt shape for shape from
 * `Docs references/Beam weight scale/Detecto-layout design.svg`.
 *
 * The drawing is the source of truth. Its 2048x1024 frame is this design's stage, its
 * paths are these parts, and every one of them is drawn where it draws them, so with
 * the scale at rest the screen is the reference. Nothing is redrawn by hand and nothing
 * is re-fitted; the artwork is lifted by `tools/extract-detecto-paths.mjs`.
 *
 * What a drawing cannot say is what moves. Three things do, and each is placed as a
 * *displacement* from where the reference puts it: the two poises slide along their
 * bars, the trim nut rides its screw, and the beam swings about a fulcrum inside the
 * fixed housing. The mechanism behind that — the two bars' very different scales, the
 * poise weights that follow from them, the low-slung large poise — is measured off this
 * same drawing and stated in `sim/layout.ts`, and `geometry.ts` checks in development
 * that the two still agree.
 *
 * The beam pivots at the CENTRE here and indicates at its right-hand end, so a
 * poise-heavy beam drops the index. That is what `pointerSense` records.
 */
import { memo } from 'react'
import { solvePoises } from '../../sim/physics'
import { CommonDefs } from '../shared/CommonDefs'
import { Loupe } from '../shared/Loupe'
import {
  Callouts,
  ForceHeader,
  ForceOverlay,
  GhostMarker,
  MomentArms,
} from '../shared/Annotations'
import { useBeamInteraction } from '../shared/useBeamInteraction'
import { LeverTrainPlate } from '../shared/plates/LeverTrainPlate'
import type { ForceAnchors, ScaleVisual, VisualProps } from '../types'
import { DetectoDefs } from './defs'
import { DETECTO_TYPEFACE } from './typography'
import {
  BASE,
  FULCRUM,
  HOUSING,
  INDEX,
  L,
  LOUPE,
  LOWER_BAND,
  LOWER_POISE,
  PX,
  TRIM,
  UPPER_BAND,
  UPPER_POISE,
  VIEW_BOX,
  gid,
  poiseShift,
  projection,
  tickX,
} from './geometry'
import {
  BalanceIndex,
  FramePlate,
  LowerBand,
  RowClips,
  TrimScrew,
  UpperBand,
} from './parts/Frame'
import { LowerPoise, TrimNut, UpperPoise, poiseBox } from './parts/Poises'
import { Base, Housing, IndicatorWire } from './parts/Fixtures'
import { DetectoElevation } from './plates/DetectoElevation'

const { x: sx, y: sy } = projection

/**
 * The drawing is 2048 units across where the shared drafting furniture was drawn for
 * about 1100, so its lines and lettering are stepped up to match.
 */
const DRAFT = 1.85

/** Where the nut stands, as a displacement from the rod position the reference draws. */
const nutShift = (state: VisualProps['state']) => ({
  dx: (state.ballX - L.ball.xNominal) * PX,
  dy: -(state.ballHeight - L.ball.height) * PX,
})

/**
 * Where this design draws each load-bearing part, so the force arrows land on the parts
 * as drawn while the magnitudes and moment arms stay the simulation's.
 */
function anchors(state: VisualProps['state']): ForceAnchors {
  const nut = nutShift(state)
  return {
    load: { x: sx(-L.loadArm), y: FULCRUM.y },
    lower: { x: tickX(LOWER_BAND, state.lowerLb) + 60, y: LOWER_POISE.yBottom - 40 },
    upper: { x: tickX(UPPER_BAND, state.upperLb) + 71, y: UPPER_POISE.yTop + 40 },
    ball: { x: (TRIM.nut.x0 + TRIM.nut.x1) / 2 + nut.dx, y: TRIM.y + nut.dy },
    beamCg: { x: sx(L.bodyCgX), y: sy(-L.body.cgDrop) },
    span: { x0: BASE.x0, x1: INDEX.tipX + 60 },
    dimY: { load: FULCRUM.y - 62, lower: 560, upper: 118 },
    len: { load: 96, lower: 120, upper: -104, ball: 118, beamCg: 150 },
  }
}

const BeamHead = memo(function DetectoBeamHead({ state, showGhost }: VisualProps) {
  const { svgRef, beamRef, handles } = useBeamInteraction(projection, L)
  const target = solvePoises(state)
  const ghost =
    showGhost &&
    !target.overCapacity &&
    (Math.abs(target.lowerLb - state.lowerLb) > 1e-6 ||
      Math.abs(target.upperLb - state.upperLb) > 1e-6)
  const a = anchors(state)
  const nut = nutShift(state)

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEW_BOX.w} ${VIEW_BOX.h}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Detecto beam head, with draggable poises and zero-trim weight"
    >
      <defs>
        <CommonDefs ns="dt" />
        <DetectoDefs ns="dt" />
        <RowClips />
      </defs>

      <Base />

      {/* Everything that swings.
          The reference draws the trim screw behind the frame, where it shows through the
          window; here it goes in just after. At its drawn height the two are identical,
          because the screw lies wholly inside the window — but raise the rod on its
          standards and it stays in sight instead of vanishing behind the plate. The bands
          still read over it either way, as the reference has them. */}
      <g ref={beamRef}>
        <FramePlate />
        <TrimScrew dy={nut.dy} />
        <UpperBand />
        <LowerBand />
        <BalanceIndex />

        {ghost && (
          <>
            <GhostMarker
              {...ghostArgs(LOWER_POISE, poiseShift(LOWER_BAND, target.lowerLb))}
              scale={DRAFT}
            />
            <GhostMarker
              {...ghostArgs(UPPER_POISE, poiseShift(UPPER_BAND, target.upperLb))}
              scale={DRAFT}
            />
          </>
        )}

        <LowerPoise lb={state.lowerLb} handle={handles.lower} />
        <UpperPoise lb={state.upperLb} handle={handles.upper} />
        <TrimNut dx={nut.dx} dy={nut.dy} handle={handles.ball} />

        {state.xray && <ForceOverlay state={state} anchors={a} scale={DRAFT} />}
      </g>

      <Housing />
      <IndicatorWire />

      {state.xray && (
        <>
          <MomentArms state={state} proj={projection} anchors={a} scale={DRAFT} />
          <ForceHeader layout={L} x={120} y={690} scale={DRAFT} />
        </>
      )}

      <Loupe
        ns="dt"
        targetId={gid('upper-band')}
        focus={{
          x: tickX(UPPER_BAND, state.upperLb) + 26,
          y: (UPPER_BAND.top + UPPER_BAND.bottom) / 2,
        }}
        cx={LOUPE.cx}
        cy={LOUPE.cy}
        r={LOUPE.r}
        k={LOUPE.k}
        label="FINE BAR"
        faceColor="#e9edef"
      />

      <Callouts
        fontSize={15}
        scale={DRAFT}
        items={[
          {
            at: { x: tickX(UPPER_BAND, 14), y: UPPER_BAND.top },
            to: { x: tickX(UPPER_BAND, 14), y: UPPER_BAND.top - 22 },
            text: 'FINE BAR — ¼ LB · lb OVER kg',
          },
          {
            at: { x: tickX(LOWER_BAND, 250), y: LOWER_BAND.bottom },
            to: { x: tickX(LOWER_BAND, 250), y: LOWER_BAND.bottom + 34 },
            text: 'NOTCHED BAR — 50 LB',
          },
          {
            at: { x: (HOUSING.x0 + HOUSING.x1) / 2, y: HOUSING.yBottom },
            to: { x: (HOUSING.x0 + HOUSING.x1) / 2, y: HOUSING.yBottom + 46 },
            text: 'BEARING HOUSING — FULCRUM',
          },
          {
            at: { x: TRIM.nut.x0 + nut.dx, y: TRIM.y + nut.dy },
            to: { x: 330, y: 560 },
            text: 'ZERO TRIM',
          },
          {
            at: { x: INDEX.tipX, y: INDEX.y },
            to: { x: INDEX.tipX + 40, y: 190 },
            text: 'INDEX',
            anchor: 'end',
          },
        ]}
      />
    </svg>
  )
})

function ghostArgs(g: typeof UPPER_POISE, dx: number) {
  const box = poiseBox(g, dx)
  return {
    cx: box.x + box.width / 2,
    top: box.y,
    bottom: box.y + box.height,
    width: box.width,
  }
}

export const DetectoVisual: ScaleVisual = {
  id: 'detecto',
  name: 'Detecto',
  subtitle: 'Clinical beam head · dual lb/kg',
  caption: 'Beam head · drag the poises and the zero-trim nut',
  about:
    "Rebuilt shape for shape from the Detecto layout drawing in the reference folder: one aluminium frame with a window through it, a bright pound band over a black kilogram band on each bar, matte poises that straddle them, a zero-trim nut on a threaded rod, and the balance index read against a fixed wire at the free end. Every outline on the stage is the drawing's own path in the drawing's own frame, so at rest the design is the reference. The mechanism behind it — the two bars' scales, the poise weights that follow, the fulcrum inside the bearing housing — is measured off that same drawing.",
  typeface: DETECTO_TYPEFACE,
  layout: L,
  viewBox: VIEW_BOX,
  projection,
  ground: 'light',
  // The index is on the far end of the long arm, so a poise-heavy beam drops it.
  pointerSense: -1,
  BeamHead,
  plates: [
    { id: 'elevation', label: 'Elevation', span: 'narrow', Component: DetectoElevation },
    {
      id: 'levers',
      label: 'Base cutaway · compound lever train',
      span: 'wide',
      Component: LeverTrainPlate,
    },
  ],
}
