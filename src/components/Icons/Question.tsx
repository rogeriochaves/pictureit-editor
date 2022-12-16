function Question({ size, variant = "black" }: { size: number; variant?: "black" | "white" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" height={size} width={size}>
      <g>
        <circle
          cx={7}
          cy={7}
          r={6.5}
          fill={variant == "black" ? "#333" : "#FFF"}
          stroke="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.5,5.5A1.5,1.5,0,1,1,7,7V8"
          fill="none"
          stroke={variant == "black" ? "#FFF" : "#333"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M7,9.5a.75.75,0,1,0,.75.75A.76.76,0,0,0,7,9.5Z" fill={variant == "black" ? "#FFF" : "#333"} />
      </g>
    </svg>
  )
}

export default Question
