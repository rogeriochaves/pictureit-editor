function Boomerang({ size, fill }: { size: number; fill?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" width={size} height={size}>
      <path
        d="M5,10.43A2.37,2.37,0,0,1,3.5,11a2.75,2.75,0,0,1-3-3,2.75,2.75,0,0,1,3-3c2.75,0,4.25,6,7,6a2.75,2.75,0,0,0,3-3,2.75,2.75,0,0,0-3-3h-2l2-2"
        fill="none"
        stroke={fill || "#000"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default Boomerang
