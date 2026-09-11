# Physician Beam Scale — interactive mechanical simulator

An interactive simulation of a mechanical physician beam scale: a Fairbanks-type
compound-lever platform steelyard with a dual graduated beam, two sliding poises, a
balance index, and a balance ball on a screw rod.

The beam is not animated — it is integrated. Every frame, the net torque about the
fulcrum knife-edge is summed from the actual weights at their actual positions, and the
beam's angle comes out of a damped rigid-body integrator. Drag a poise and the reading
changes because the moment changed.

It ships with **two scale designs over one simulation**, switchable at runtime:

| | |
| --- | --- |
| **Detecto** | A modern clinical beam head, rebuilt shape for shape from the reference drawing in `Docs references/`: one aluminium frame with a window through it, a bright pound band over a black kilogram band on each bar, matte poises that straddle them, a zero-trim nut on a threaded rod, and the balance index read against a fixed wire at the free end. Every outline on that stage is the drawing's own path in the drawing's own frame, so at rest the design *is* the reference. |
| **Classic steelyard** | The 1832 Fairbanks arrangement as a workshop plate: a notched steelyard arm in chrome and brass, the balance ball on its screw rod, the pointer on the short arm inside a trig loop. |

Both run on the same solver, but each brings its own *mechanism* as well as its own
drawing — the Detecto's bar scales, poise weights and fulcrum are measured off its
reference drawing, and are not the Fairbanks beam's. Switching designs switches both.

```bash
npm install
npm run dev        # http://localhost:5180
npm run build
```

---

## Where the mechanics come from

Both reference documents in `Docs references/Beam weight scale/` were used as the
primary source; nothing about the mechanism was invented where the references settle it.

### "Description of a Physician Beam Scale"

Fixes the architecture and the read-out convention:

| From the document | In the simulator |
| --- | --- |
| Lower poise bar, "large weight incrementations" | Notched every 50 lb; the poise physically cannot rest between notches. 0–450 lb on the Classic beam, 0–400 lb on the Detecto |
| Upper poise bar, "small weight incrementations" | 0–50 lb, graduated in ¼ lb, on both |
| Large and small poise weights with an index | Draggable brass poises, each with a red index hairline reading through an aperture |
| Balance pointer rising to the top, dropping to the bottom, or floating in the middle | The pointer's position in the trig loop drives the status: *pointer high*, *pointer low*, *in balance* |
| Balance window / trig loop, immovable | A fixed C-frame on the pillar head; its faces are the hard stops on beam travel |
| Pillar and pillar head | The head casting carries the bearing stanchions, the fulcrum V-bearing and the trig loop |
| Capacity read in pounds | Classic 450 + 50 = 500 lb; Detecto 400 + 50 = 450 lb. Kilograms shown as a secondary conversion on both |
| Column, platform base, hand post, height rod, wheels | Drawn in the elevation plate |

### Fairbanks, US Patent 120 (1832, reissued 1837) — *Mode of Constructing Steelyard-Balances*

Fixes the physics:

- **The compound platform lever train.** The load is divided twice before it reaches the
  beam. Drawn as a cutaway with its knife edges, its two fulcrums and its real distances;
  the stage ratios in the drawing produce the ×50 quoted in the panel, they are not
  asserted separately.
- **"The arm of the balance divided by notches for using a movable poise."** The lower bar
  is notched, and the poise steps notch to notch.
- **The balance ball.** "A cylindrical or other formed weight, to be moved horizontally on
  a line elevated above the edge of the pivot" — carried on a screw rod standing on the
  short arm, high enough "to allow the hook of the poise to pass under". Traversing it
  trims the zero.
- **The stability rule.** The patent's central observation is modelled directly:

  > too great an amount of material above the horizontal range of that edge will occasion
  > the beam to rise or fall indefinitely, while too great a weight of material below such
  > horizontal range tends to settle the beam into an unyielding horizontal position, and
  > to render it unsusceptible to the weight applied.

  Raise the balance ball with the *Mechanism → balance-ball height* slider: sensitivity
  climbs, the period lengthens, and past a height the panel names for whichever beam is
  loaded — ≈3.16 in on the Classic, ≈1.05 in on the Detecto, whose heavier trim block gets
  there sooner — the restoring stiffness goes negative and the beam runs to whichever stop
  it starts toward. Lower it and the beam becomes stiff and unresponsive. Both regimes are
  reachable on both designs, and the panel shows the stiffness crossing zero.

---

## The model

Units are inches, pounds-force and seconds. Because every mass is expressed as a weight
in lbf, *g* is already folded in; torques are lbf·in.

### Torque about the fulcrum

For a weight `w` at beam-frame position `(x, y)` with the beam tilted by `θ`:

```
τ = w · (x·cos θ + y·sin θ)
```

The `y·sin θ` term is the whole of the stability argument. Weight above the pivot edge
(`y > 0`) produces a torque that grows with the tilt and drives the beam further over;
weight below it pulls the beam back. Summing over the two poises, the balance ball, the
beam casting and the platform pull gives the net torque, and

```
I·θ̈ = τ(θ) − c·θ̇
```

is integrated at a fixed 1/480 s step, with the trig loop as inelastic stops at ±2.5°.

The platform pull is the one term entered at `y = 0` regardless of where the knife edge
is drawn: the steelyard rod hangs, so its line of action stays vertical through the knife
edge and contributes no `y·sin θ`. The poises and the ball are bolted to the beam and
rotate with it, so their heights matter — which is why the large poise is drawn as a
saddle with its brass hanging below the bar, putting its centre of gravity just under the
pivot edge instead of well above it.

### The graduations are derived, not drawn by eye

Both bars follow from the same constant. One pound on the platform produces

```
a / R = 0.5 in / 50 = 0.010 lbf·in
```

at the beam, so a poise of weight `m` travelling `L` inches spans `m·L / 0.010` pounds.
Turned around, that is how each poise's weight is *computed* rather than declared:
`makeLayout()` in `src/sim/layout.ts` takes each bar's capacity and travel and derives the
weight that makes them true, so a design's graduations cannot lie about its mechanism.

| Fairbanks (Classic) | poise weight | travel | span |
| --- | --- | --- | --- |
| Lower bar | 0.5000 lbf | 9.00 in | **450 lb** |
| Upper bar | 0.0556 lbf | 9.00 in | **50 lb** |

| Detecto | poise weight | travel | span |
| --- | --- | --- | --- |
| Notched bar | 0.6604 lbf | 6.06 in | **400 lb** |
| Fine bar | 0.0501 lbf | 9.98 in | **50 lb** |

The Detecto numbers are not chosen — they are measured off its reference drawing, where
the fine bar is divided every 27.95 units to the pound and the notched bar every 2.12.
That ratio is what makes its large poise about thirteen times the weight of its small one,
where on the Fairbanks beam it is nine.

### Zero

The beam casting's centre of gravity is offset toward the short arm by exactly enough to
counterpoise both poises parked at their zero graduation together with the balance ball at
its nominal place — so the derived zero offset is 0.000 lb at the factory setting, and any
deviation the user introduces has to be trimmed back out with the ball.

### A beam belongs to a design, not to the simulator

Where the knife-edge sits relative to the bars, how long each bar is, how heavy each poise
is, how far above or below the pivot edge each mass rides — all of that differs between a
19th-century shop steelyard and a modern clinical head, so it belongs to the design. A
`BeamLayout` (`src/sim/layout.ts`) carries it; a `ScaleVisual` names the layout it draws;
and selecting a design hands that layout to the engine, so the beam being solved is always
the beam on screen. `physics.ts` takes the layout as an argument and knows nothing else
about any instrument.

Two consequences in the Detecto layout, both forced by its drawing:

- Its two bars are struck from **different zeros** and given very different travels. The
  fine bar's zero falls *behind* the fulcrum, on the short-arm side — which is perfectly
  sound, because only the *change* in moment as a poise travels is what the graduations
  measure, and whatever constant moment the parked poise contributes is counterpoised by
  the beam casting.
- Its large poise is a deep moulding that hangs most of its mass below the bar, so its
  centre of gravity is 0.81 in *under* the pivot edge. That is what stiffens this beam,
  and it is why its trim weight has to be a substantial block rather than the patent's
  small brass ball to be able to soften it again.

### Displacement

Force is divided by 50 between platform and beam, so displacement is multiplied by 50 in
the other direction: the steelyard rod travels fifty times as far as the platform deck.
That is why the deck is effectively motionless and why the lever deflections in the
cutaway are drawn with a stated exaggeration factor rather than at true scale.

---

## Interacting with it

- **Drag the poises along the beam.** The large one snaps to its notches; the small one to
  ¼ lb. Arrow keys work too when a poise has focus (Shift for coarse steps).
- **Drag the balance ball** along its screw rod to trim the zero. *Knock the zero off*
  introduces a calibration error to correct.
- **Equilibrium marks** ghost the positions the poises must reach for the beam to rest.
- **Force view** overlays the live force arrows, moment arms and the lever ratio.
- **Practice** hides the load so you have to read the scale, then checks your answer.
- **Mechanism** exposes the balance-ball height, the damping and the time scale, with the
  resulting stiffness, natural period and sensitivity computed live.

A real beam of this inertia has a natural period near three seconds, which is why an
operator waits for it. The response control scales simulated time; it does not change the
physics.

---

## Architecture

Two layers with one seam between them. `src/sim` imports nothing from `src/visual`; the
dependency runs one way only.

```
src/
  sim/                        the simulation. Knows nothing about any drawing.
    spec.ts                   what every scale here shares: platform train, damping, units
    layout.ts                 BeamLayout — the mechanism a *design* brings with it
    physics.ts                torque, stiffness, stability, integrator, equilibrium solver
    engine.ts                 simulation loop + a minimal external store
    hooks.ts                  React bindings, including drag along the (rotating) beam axis

  visual/                     the visual layer
    types.ts                  the ScaleVisual contract — the whole seam
    projection.ts             beam-frame inches → SVG units, per design
    ticks.ts                  graduation tables derived from the spec (pounds and kilograms)
    registry.ts               id → ScaleVisual; the picker and the stage read from here
    shared/                   design-agnostic building blocks
      useBeamInteraction.ts   beam rotation + drag/keyboard handles for the poises and ball
      Graduations.tsx         TickScale / TickLabels, driven by a tick table
      Annotations.tsx         callouts, dimensions, force overlay, ghost markers
      Loupe.tsx               magnifier over any referenced group
      CommonDefs, MetalDefs   light, shadow, noise; a general workshop palette
      plates/LeverTrainPlate  base cutaway — a drawing of the mechanism, so it is shared
    classic/                  geometry.ts · parts/ · plates/ · ClassicVisual.tsx
    detecto/                  refPaths.ts (generated) · geometry.ts · defs.tsx
                              typography.ts · parts/ · plates/ · DetectoVisual.tsx

tools/
  extract-detecto-paths.mjs   lifts the reference drawing into detecto/refPaths.ts

  components/
    ScaleStage.tsx            renders whichever design is active; knows only the contract
    panel/                    readout, controls, design picker, mechanism, references
```

### The contract

A design is one object:

```ts
interface ScaleVisual {
  id, name, subtitle, caption, about
  typeface: string              // the face this instrument is lettered in
  layout: BeamLayout            // its own mechanism — handed to the engine on selection
  viewBox: Box                  // its own drawing surface
  projection: Projection        // its own inches-to-pixels and fulcrum placement
  ground?: 'dark' | 'light'     // the stage ground this instrument is drawn on
  pointerSense: 1 | -1          // does a poise-heavy beam raise or drop its index?
  BeamHead: ComponentType<VisualProps>
  plates: PlateDef[]            // supplementary drawings shown under the stage
}
```

Typography is a design property, not a per-part one. `ScaleStage` sets `typeface` once on
the stage column and every SVG `<text>` below it inherits — so no part names a font, and
a new design changes its lettering with a single string. Classic is set in IBM Plex Mono;
Detecto in Roboto Condensed, the bold condensed grotesque its reference plate uses — it has
to be a real lowercase, because the plate reads `lb.`, `kg` and `CAP.-450lb.x4oz`.

`VisualProps` is `{ state: SimState, showGhost: boolean }` — read-only. A design writes to
the simulation only through the handles `useBeamInteraction` gives it, and that is also
where snapping to the graduations lives, so a new design cannot get the notch interval or
the quarter-pound division wrong.

### Three rules that keep the layers apart

**Positions come from the physics.** Both designs call `lowerPoiseX()` and `upperPoiseX()`
from `sim/physics.ts` rather than working out poise positions themselves. A design decides
how big a poise looks, never where it sits.

**Divisions come from the mechanism; lettering is the design's.** `visual/ticks.ts` builds
the tick tables from a `BarSpec`'s own `step` and `minor`. Classic letters the fine bar every 5 lb;
Detecto letters it every 2 lb and carries a kilogram row underneath, its marks placed at
the pound positions they correspond to. Same divisions, different plate.

**The physics stays layout-neutral.** The simulation reports `'over'` / `'under'` — poises
heavier or lighter than the load — not `'high'` / `'low'`, because which way that moves an
index depends on where a design puts it. The Classic pointer is on the short arm and rises
(`pointerSense: 1`); the Detecto index is on the far end of the long arm and drops
(`pointerSense: -1`). That one number is the entire difference, and the readout's repeater
uses it so the gauge always moves the same way as the thing on screen.

Force arrows are the one place a design gets a say in the overlay. It supplies
`ForceAnchors` — where it has drawn each load-bearing part — while the magnitudes and the
moment arms printed on them stay the simulation's. That lets a design put its rails
wherever they look right without the arrows floating off the parts or the numbers drifting
from the model.

### Adding a design

Create `src/visual/<name>/`, export a `ScaleVisual`, add it to `VISUALS` in `registry.ts`.
Nothing in `src/sim` changes and neither does the shell — the picker, the stage and the
plate row are all driven from the registry, so `HospitalVisual`, `CustomVisual` and the
rest drop in the same way. Reuse `LeverTrainPlate`, the graduation components and the
annotation furniture; bring your own `defs` if the instrument is made of something the
workshop palette does not cover.

### The Detecto design *is* the reference drawing

`Docs references/Beam weight scale/Detecto-layout design.svg` is the source of truth for
every shape, proportion, position and spacing in that design, so it is not re-drawn — it is
*adopted*. `tools/extract-detecto-paths.mjs` lifts the artwork's ~90 paths verbatim into
`src/visual/detecto/refPaths.ts`, grouped into the parts the simulation needs to move, and
the stage is the drawing's own 2048 × 1024 frame. Nothing is rounded, simplified or
re-fitted; with the scale at rest, the screen *is* the reference. Re-run the lift with
`npm run extract:detecto`.

Three things move, and each is placed as a **displacement from where the reference puts
it**, never as an absolute — which is what makes the rest state exact by construction: the
two poises slide along their bars, the trim nut rides its screw, and the beam swings about
a fulcrum inside the fixed bearing housing.

The one thing a static drawing cannot state is where that fulcrum is. The black block
carrying the maker's bird is not part of the beam: it and the indicator wire both stop dead
at y 615.70, which is exactly the top edge of the base, so they stand on it and the beam
swings in the block. The fulcrum is therefore taken at the block's centre line, on the
datum the balance index is struck about. The scale — 140 drawing units to the inch — and
the two bar scales come from the graduations of the photograph traced under the artwork.

Because those numbers are recorded twice, once in `detecto/geometry.ts` as drawing units
and once in `sim/layout.ts` as inches, `assertConsistent()` checks in development that each
poise's centre of gravity, the trim rod's height and the index tip still land where the
drawing puts them. Otherwise the poises would go on sliding perfectly while pointing at the
wrong marks — the kind of error a screenshot does not show.

What the reference leaves blank is the graduations, so those are drawn from the mechanism:
a mark is struck wherever a poise would actually have to stand to read that figure. Their
*style* follows the plate — a quarter-pound comb hanging from the top edge of the fine
bar's pound band, a tenth-of-a-kilogramme comb rising from the bottom of its black one, and
on the notched bar a rule the full depth of the pound band at every notch with the figure
set in the cell beyond it, so the poise's window frames the reading it is standing at.

### Why it is drawn this way

**Vector, not raster or 3D.** The thing that has to be legible here is a scale divided to
a quarter of a pound; SVG keeps the graduations crisp at any size, makes the poise
positions exact rather than approximate, and gives precise hit targets for dragging. A
3D renderer would have bought lighting at the cost of the readability that is the
instrument's entire point.

**The beam angle never passes through React.** It changes every frame, so the simulation
loop writes the rotation straight onto the SVG group and the plates' transforms through
refs. React renders only what an operator would actually read — poise settings, load,
status — so a frame costs a handful of attribute writes.

**No runtime dependencies beyond React, and no generated image assets.** Every candidate
library was either heavier than the code it would replace (drag handling is about twenty
lines against the SVG CTM) or solved a problem this project does not have. The Classic
design's brushed aluminium and matte mouldings are gradients, a tiled noise filter and
text. The Detecto design keeps the reference's flat palette exactly as the drawing states
it and adds only *light* — soft washes laid over each part's own silhouettes at low
opacity, so a moulding reads as a solid without a single edge moving.

**Lettering follows the reference.** The Detecto design reproduces the plate's own
markings — the maker's block at the outboard end of the fine bar, the `lb.`/`kg` unit tags,
the `0` that straddles both rows at each bar's zero, and the capacity block — set in the
bold condensed grotesque the drawing uses. The maker's bird badge is not lettering at all:
it is artwork, so it is lifted as paths with the rest of the drawing.

The one figure that is *not* copied is the capacity. The reference plate reads
`CAP.-440lb.x4oz`, but that beam's own notches do not add up to it — its lettering is
decorative, and its two label rows disagree with each other and with the notches cut into
its window edge. So the block is printed from this scale's own mechanism instead:
`CAP.-450lb.x4oz` / `CAP.-204kgx100g`, being the 400 lb its notched bar reaches plus the
50 lb of its fine bar. Printing the drawing's figure would have put a plate on the scale
that contradicts the bar it is engraved on.
