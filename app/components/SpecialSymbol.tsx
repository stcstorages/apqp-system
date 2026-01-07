export default function SpecialSymbol({ code }: { code: string }) {
  const stroke = "currentColor"
  const fill = "none"
  const strokeWidth = 1.5

  switch (code) {
    case 'circle_plus':
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4 mx-auto text-black">
          <circle cx="12" cy="12" r="9" stroke={stroke} fill={fill} strokeWidth={strokeWidth} />
          <path d="M12 7v10M7 12h10" stroke={stroke} strokeWidth={strokeWidth} />
        </svg>
      )
    case 'circle_double_plus':
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4 mx-auto text-black">
          <circle cx="12" cy="12" r="9" stroke={stroke} fill={fill} strokeWidth={strokeWidth} />
          {/* Two plus signs side by side or one big one? Usually double plus means cross */}
          {/* Let's draw two small pluses */}
          <path d="M9 9v6M6 12h6" stroke={stroke} strokeWidth={strokeWidth} transform="translate(-2, 0)" />
          <path d="M18 9v6M15 12h6" stroke={stroke} strokeWidth={strokeWidth} transform="translate(-2, 0)" />
        </svg>
      )
    default:
      return null
  }
}
