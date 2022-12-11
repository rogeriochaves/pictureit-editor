function Negative({ size, color = "#000" }: { size: number, color?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 48 48"
    >
      <circle
        r="40"
        fill="none"
        stroke={color}
        strokeWidth="6"
        transform="matrix(.54 0 0 .54 23.81 24.04)"
      ></circle>
      <path
        stroke={color}
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeWidth="3"
        d="M-9.333 0.167L9.333 -0.167"
        transform="translate(24 24.17)"
      ></path>
    </svg>
  );
}

export default Negative;
