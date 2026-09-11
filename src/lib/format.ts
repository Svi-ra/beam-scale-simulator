import { LB_PER_KG } from '../sim/spec'

export const toKg = (lb: number) => lb / LB_PER_KG

export function fmt(n: number, dp = 2) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  })
}

/** Pounds shown the way the bars are graduated: whole numbers plus quarters. */
export function fmtLb(lb: number) {
  const rounded = Math.round(lb * 4) / 4
  return rounded.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function fmtSigned(n: number, dp = 2) {
  const s = fmt(Math.abs(n), dp)
  return `${n < 0 ? '−' : n > 0 ? '+' : ''}${s}`
}
