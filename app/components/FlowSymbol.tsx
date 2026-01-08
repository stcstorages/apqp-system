export default function FlowSymbol({ type }: { type: string }) {
  const stroke = "currentColor"
  const fill = "none"
  const strokeWidth = 1.5

  switch (type) {
    case 'start': // Inverted Triangle (Based on your image)
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6 mx-auto text-black">
          <polygon points="2,4 22,4 12,22" stroke={stroke} fill={fill} strokeWidth={strokeWidth} />
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
    case 'inprocess': // Diamond INSIDE Circle (New)
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6 mx-auto text-black">
          {/* Outer Circle */}
          <circle cx="12" cy="12" r="10" stroke={stroke} fill={fill} strokeWidth={strokeWidth} />
          {/* Inner Diamond (slightly smaller) */}
          <polygon points="12,4 20,12 12,20 4,12" stroke={stroke} fill={fill} strokeWidth={strokeWidth} />
        </svg>
      )
    case 'storage': // Square (Based on your image)
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6 mx-auto text-black">
          <rect x="4" y="4" width="16" height="16" stroke={stroke} fill={fill} strokeWidth={strokeWidth} />
        </svg>
      )
    case 'delivery': // Pentagon Down / Document shape
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6 mx-auto text-black">
          <path d="M4 2 h16 v12 l-8 8 l-8 -8 z" stroke={stroke} fill={fill} strokeWidth={strokeWidth} />
        </svg>
      )
    default:
      // Default to Process
      return (
        <svg viewBox="0 0 24 24" className="w-6 h-6 mx-auto text-black">
          <circle cx="12" cy="12" r="9" stroke={stroke} fill={fill} strokeWidth={strokeWidth} />
        </svg>
      )
  }
}
