function GenerationIcon({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 128 128">
      <path
        fill="none"
        stroke="#000"
        strokeWidth="6"
        d="M.003-16.173v32.348"
        transform="matrix(1.25 0 0 .96 20.7 20.2)"
      ></path>
      <path
        fill="none"
        stroke="#000"
        strokeWidth="8"
        d="M-49.09-19.296v69.243h98.176V-49.95h-68.804"
        transform="translate(70.01 68.8)"
      ></path>
      <path stroke="#000" strokeWidth="6" d="M-14.441 0L14.441 0" transform="matrix(1.05 0 0 1.05 20.64 19.1)"></path>
    </svg>
  )
}

export default GenerationIcon
