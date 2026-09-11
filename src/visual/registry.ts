/**
 * The catalogue of scale designs.
 *
 * Adding one means writing a folder that exports a `ScaleVisual` and adding it to this
 * array — `HospitalVisual`, `CustomVisual` and so on drop in the same way. Nothing in
 * `src/sim` changes, and neither does the shell: the picker, the stage and the plate row
 * are all driven from whatever is registered here.
 */
import type { ScaleVisual } from './types'
import { ClassicVisual } from './classic/ClassicVisual'
import { DetectoVisual } from './detecto/DetectoVisual'

export const VISUALS: ScaleVisual[] = [DetectoVisual, ClassicVisual]

export const DEFAULT_VISUAL_ID = DetectoVisual.id

export function getVisual(id: string | null | undefined): ScaleVisual {
  return VISUALS.find((v) => v.id === id) ?? VISUALS[0]
}
