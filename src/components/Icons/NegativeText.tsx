function NegativeText({ size, color = "#000" }: { size: number; color?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" height={size} width={size}>
      <g>
        <line
          x1={6.24}
          y1={6.24}
          x2={4}
          y2={13.5}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1={1.5}
          y1={13.5}
          x2={6.5}
          y2={13.5}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M5,.5h7.5a1,1,0,0,1,1,1V3" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
        <line
          x1={0.5}
          y1={0.5}
          x2={13.5}
          y2={13.5}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1={8}
          y1={0.5}
          x2={7.23}
          y2={3}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}

export default NegativeText
