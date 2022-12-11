function Negative({ size, color = "#000" }: { size: number; color?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" height={size} width={size}>
      <g>
        <line x1={4} y1={7} x2={10} y2={7} fill="none" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" />
        <rect
          x={0.5}
          y={0.5}
          width={13}
          height={13}
          rx={3}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}

export default Negative
