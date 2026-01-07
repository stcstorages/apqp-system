export default function FlowSymbol({ type }: { type: string }) {
  const stroke = "currentColor"
  const fill = "none"
  const strokeWidth = 1.5

  switch (type) {
    case 'start': // Rounded Rectangle / Oval
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6 mx-auto text-black">
          <rect x="2" y="6" width="20" height="12" rx="6" stroke={stroke} fill={fill} strokeWidth={strokeWidth} />
        </svg>
      )
    case 'process': // Circle
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6 mx-auto text-black">
          <circle cx="12" cy="12" r="9" stroke={stroke} fill={fill} strokeWidth={strokeWidth} />
        </svg>
      )
    case 'inspection': // Diamond
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6 mx-auto text-black">
          <polygon points="12,2 22,12 12,22 2,12" stroke={stroke} fill={fill} strokeWidth={strokeWidth} />
        </svg>
      )
    case 'storage': // Triangle (Inverted)
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6 mx-auto text-black">
          <polygon points="2,4 22,4 12,22" stroke={stroke} fill={fill} strokeWidth={strokeWidth} />
        </svg>
      )
    case 'transport': // Arrow
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6 mx-auto text-black">
           <path d="M2 12h14M13 5l7 7-7 7" stroke={stroke} fill={fill} strokeWidth={strokeWidth} />
        </svg>
      )
    case 'delay': // D-Shape
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6 mx-auto text-black">
          <path d="M4 4h8a8 8 0 0 1 0 16H4V4z" stroke={stroke} fill={fill} strokeWidth={strokeWidth} />
        </svg>
      )
    default:
      // Default to Process (Circle) if unknown
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6 mx-auto text-black">
          <circle cx="12" cy="12" r="9" stroke={stroke} fill={fill} strokeWidth={strokeWidth} />
        </svg>
      )
  }
}
