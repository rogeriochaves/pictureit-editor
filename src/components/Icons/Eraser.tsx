function Eraser({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" height={size} width={size}>
      <g>
        <line
          x1={3.5}
          y1={13.5}
          x2={13.5}
          y2={13.5}
          fill="none"
          stroke="#000000"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.32,6.21a.94.94,0,0,0,0-1.35L8.25.78a1,1,0,0,0-1.36,0L.78,6.89a1,1,0,0,0,0,1.36l2.44,2.43a.92.92,0,0,0,.67.29H7.17a.92.92,0,0,0,.68-.29Z"
          fill="none"
          stroke="#000000"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}

export default Eraser
