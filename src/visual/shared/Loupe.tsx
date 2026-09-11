/**
 * A magnifier over part of the drawing.
 *
 * Both designs divide the fine bar to a quarter of a pound, which at working scale is a
 * few pixels — authentic, but hard to read. The loupe re-renders a referenced group at
 * magnification with a hairline on the poise's index, so the exact graduation can be
 * read without inflating the bar.
 */
import { memo } from 'react'

export const Loupe = memo(function Loupe({
  ns,
  /** Id of the `<g>` to magnify. Referenced with `<use>`, so it renders unrotated. */
  targetId,
  /** Point in the target's own coordinates to centre on. */
  focus,
  cx,
  cy,
  r,
  k,
  label,
  faceColor = '#e3e9ee',
}: {
  ns: string
  targetId: string
  focus: { x: number; y: number }
  cx: number
  cy: number
  r: number
  k: number
  label: string
  faceColor?: string
}) {
  const clip = `${ns}-loupe-clip`
  return (
    <g style={{ pointerEvents: 'none' }}>
      <defs>
        <clipPath id={clip}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={r + 7} fill="#0d1218" opacity={0.92} />
      <g clipPath={`url(#${clip})`}>
        <rect x={cx - r} y={cy - r} width={2 * r} height={2 * r} fill={faceColor} />
        <g transform={`translate(${cx} ${cy}) scale(${k}) translate(${-focus.x} ${-focus.y})`}>
          <use href={`#${targetId}`} />
        </g>
        <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="#d94a4f" strokeWidth={1.6} />
      </g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#3d4a56" strokeWidth={3} />
      <circle cx={cx} cy={cy} r={r + 6} fill="none" stroke="#222c36" strokeWidth={2} />
      <text
        x={cx}
        y={cy + r + 22}
        textAnchor="middle"
        fontSize={9}
        letterSpacing="1.2"
        fill="#68767f"
      >
        {label} ×{k}
      </text>
    </g>
  )
})
