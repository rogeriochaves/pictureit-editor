function VideoFrames({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" height={size} width={size}>
      <g>
        <path
          d="M5.5,8.68V5.32c0-.25.23-.4.41-.28L8.36,6.72a.35.35,0,0,1,0,.56L5.91,9C5.73,9.08,5.5,8.93,5.5,8.68Z"
          fill="none"
          stroke="#000000"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x={3}
          y={1.5}
          width={8}
          height={11}
          rx={1}
          fill="none"
          stroke="#000000"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1={0.5}
          y1={3}
          x2={0.5}
          y2={11}
          fill="none"
          stroke="#000000"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1={13.5}
          y1={3}
          x2={13.5}
          y2={11}
          fill="none"
          stroke="#000000"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}

export default VideoFrames
