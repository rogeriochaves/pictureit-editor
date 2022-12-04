function NoColor({ size }: { size: number }) {
  return (
    <svg height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        style={{
          stroke: "red",
          strokeWidth: 3,
          strokeDasharray: "none",
          strokeLinecap: "butt",
          strokeDashoffset: 0,
          strokeLinejoin: "miter",
          strokeMiterlimit: 4,
          fill: "#000",
          fillRule: "nonzero",
          opacity: 1,
        }}
        vectorEffect="non-scaling-stroke"
        d="m106.598 106.598-213.196-213.196"
        transform="matrix(-1 0 0 1 100.9 100.9)"
      />
    </svg>
  )
}

export default NoColor
