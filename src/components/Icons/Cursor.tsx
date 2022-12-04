function Cursor({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" height={size} width={size}>
      <polygon
        points="8.5 13.5 13.5 0.5 0.5 5.5 6.5 7.5 8.5 13.5"
        fill="none"
        stroke="#000000"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default Cursor
