/**
 * Classic — a 19th-century Fairbanks-pattern steelyard drawn as a shop plate: chrome and
 * brass on a dark drawing board, the pointer carried on the short arm and swinging in a
 * trig loop on the pillar head.
 *
 * This file only composes parts and wires them to the shared interaction layer. It
 * writes to the simulation exactly where the shared handles do, and reads nothing from
 * it but `SimState`.
 */
import { memo } from 'react'
import { FAIRBANKS_LAYOUT as L } from '../../sim/layout'
import { lowerPoiseX, solvePoises, upperPoiseX } from '../../sim/physics'
import { CommonDefs, MONO } from '../shared/CommonDefs'
import { MetalDefs } from '../shared/MetalDefs'
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
import {
  BALL_RIG,
  BODY,
  LARGE_POISE,
  LOUPE,
  SMALL_POISE,
  TRIG,
  UPPER_BAR,
  VIEW_BOX,
  gid,
  projection,
} from './geometry'
import { BallRig, BeamCasting, LoadKnifeEdge, LowerScale, UpperAssembly } from './parts/Beam'
import { LargePoise, SmallPoise } from './parts/Poises'
import { BearingCap, HeadCasting, TrigLoop } from './parts/Pillar'
import { ClassicElevation } from './plates/ClassicElevation'
import { SteelyardRodNote } from './parts/RodNote'

const { x: sx, y: sy, u: su } = projection

/** Where this design draws each load-bearing part, for the force overlay. */
function anchors(state: VisualProps['state']): ForceAnchors {
  return {
    load: { x: sx(-L.loadArm), y: sy(0) },
    lower: { x: sx(lowerPoiseX(L, state.lowerLb)), y: sy(-0.05) },
    upper: { x: sx(upperPoiseX(L, state.upperLb)), y: sy(0.68) },
    ball: { x: sx(state.ballX), y: sy(state.ballHeight) },
    beamCg: { x: sx(-0.21), y: sy(-0.3) },
    span: { x0: sx(-L.pointerArm - 0.2), x1: sx(BODY.xTo + 0.3) },
    dimY: { load: sy(0.34), lower: sy(-0.78), upper: sy(1.22) },
  }
}

const BeamHead = memo(function ClassicBeamHead({ state, showGhost }: VisualProps) {
  const { svgRef, beamRef, handles } = useBeamInteraction(projection, L)
  const target = solvePoises(state)
  const ghost =
    showGhost &&
    !target.overCapacity &&
    (Math.abs(target.lowerLb - state.lowerLb) > 1e-6 ||
      Math.abs(target.upperLb - state.upperLb) > 1e-6)
  const a = anchors(state)

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEW_BOX.w} ${VIEW_BOX.h}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Classic steelyard beam head, with draggable poises"
    >
      <defs>
        <CommonDefs ns="cl" />
        <MetalDefs ns="cl" />
      </defs>

      <HeadCasting />

      <g ref={beamRef}>
        <BeamCasting />
        <LowerScale />
        <UpperAssembly />
        <LoadKnifeEdge />
        <BallRig ballX={state.ballX} height={state.ballHeight} handle={handles.ball} />

        {ghost && (
          <>
            <GhostMarker
              cx={sx(lowerPoiseX(L, target.lowerLb))}
              top={sy(LARGE_POISE.yTop)}
              bottom={sy(LARGE_POISE.yBottom)}
              width={su(LARGE_POISE.halfW * 1.76)}
            />
            <GhostMarker
              cx={sx(upperPoiseX(L, target.upperLb))}
              top={sy(SMALL_POISE.yTop)}
              bottom={sy(SMALL_POISE.yBottom)}
              width={su(SMALL_POISE.halfW * 2)}
            />
          </>
        )}

        <LargePoise
          xin={lowerPoiseX(L, state.lowerLb)}
          handle={handles.lower}
          active={state.dragging === 'lower'}
        />
        <SmallPoise xin={upperPoiseX(L, state.upperLb)} handle={handles.upper} />

        {state.xray && <ForceOverlay state={state} anchors={a} />}
      </g>

      <BearingCap />
      <TrigLoop />

      {state.xray && (
        <>
          <MomentArms state={state} proj={projection} anchors={a} />
          <SteelyardRodNote state={state} />
          <ForceHeader layout={L} />
        </>
      )}

      <Loupe
        ns="cl"
        targetId={gid('upper-assembly')}
        focus={{ x: sx(upperPoiseX(L, state.upperLb)), y: sy(0.68) }}
        cx={LOUPE.cx}
        cy={LOUPE.cy}
        r={LOUPE.r}
        k={LOUPE.k}
        label="UPPER BAR"
      />

      <Callouts
        items={[
          {
            at: { x: sx(TRIG.cx), y: sy(TRIG.cy) - su(TRIG.frameHalfH) },
            to: { x: sx(TRIG.cx) - 4, y: sy(TRIG.cy) - su(TRIG.frameHalfH) - 34 },
            text: 'POINTER · TRIG LOOP',
          },
          {
            at: { x: sx(lowerPoiseX(L, 140)), y: sy(BODY.yBottom) },
            to: { x: sx(lowerPoiseX(L, 140)), y: sy(-0.94) },
            text: 'LOWER POISE BAR — 50 LB NOTCHES',
          },
          {
            at: { x: sx(upperPoiseX(L, 34)), y: sy(UPPER_BAR.yTop) },
            to: { x: sx(upperPoiseX(L, 34)), y: sy(1.22) },
            text: 'UPPER POISE BAR — ¼ LB',
          },
          {
            at: { x: sx(BALL_RIG.standardX), y: sy(state.ballHeight) },
            to: { x: sx(BALL_RIG.standardX) - 16, y: sy(state.ballHeight) - 26 },
            text: 'BALANCE BALL',
            anchor: 'end',
          },
        ]}
      />
    </svg>
  )
})

export const ClassicVisual: ScaleVisual = {
  id: 'classic',
  name: 'Classic steelyard',
  subtitle: 'Fairbanks pattern · shop plate',
  caption: 'Beam head · drag the poises and the balance ball',
  about:
    'The 1832 Fairbanks arrangement drawn as a workshop plate: a notched steelyard arm in chrome and brass, the balance ball on its screw rod, and the pointer swinging on the short arm inside a trig loop on the pillar head.',
  layout: L,
  typeface: MONO,
  viewBox: VIEW_BOX,
  projection,
  // The pointer sits on the short arm, so a poise-heavy beam lifts it.
  pointerSense: 1,
  BeamHead,
  plates: [
    { id: 'elevation', label: 'Elevation', span: 'narrow', Component: ClassicElevation },
    {
      id: 'levers',
      label: 'Base cutaway · compound lever train',
      span: 'wide',
      Component: LeverTrainPlate,
    },
  ],
}
