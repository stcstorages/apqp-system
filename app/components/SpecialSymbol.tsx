export default function SpecialSymbol({ code }: { code: string }) {
  const stroke = "currentColor"
  const fill = "none"
  const strokeWidth = 1.2 // Slightly thinner lines for the double symbol so it doesn't look blobby

  switch (code) {
    case 'circle_plus':
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4 mx-auto text-black">
          <circle cx="12" cy="12" r="9" stroke={stroke} fill={fill} strokeWidth={1.5} />
          <path d="M12 7v10M7 12h10" stroke={stroke} strokeWidth={1.5} />
        </svg>
      )
    case 'circle_double_plus':
      // Draws two smaller circles side-by-side: (⊕ ⊕)
      return (
        <svg viewBox="0 0 28 24" className="w-8 h-4 mx-auto text-black">
          {/* Left Circle */}
          <g>
            <circle cx="7" cy="12" r="6" stroke={stroke} fill={fill} strokeWidth={strokeWidth} />
            <path d="M7 8v8 M3 12h8" stroke={stroke} strokeWidth={strokeWidth} />
          </g>
          
          {/* Right Circle */}
          <g>
            <circle cx="21" cy="12" r="6" stroke={stroke} fill={fill} strokeWidth={strokeWidth} />
            <path d="M21 8v8 M17 12h8" stroke={stroke} strokeWidth={strokeWidth} />
          </g>
        </svg>
      )
    default:
      return null
  }
}
