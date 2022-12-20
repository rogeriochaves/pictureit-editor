function FilledCircle({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" height={size} width={size}>
      <circle cx={7} cy={7} r={6.5} fill="#000" stroke="#999" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default FilledCircle
