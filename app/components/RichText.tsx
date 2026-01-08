import SpecialSymbol from './SpecialSymbol'

export default function RichText({ content }: { content: string | null }) {
  if (!content) return null

  // Split the text by new lines
  const lines = content.split('\n')

  return (
    <div className="text-left w-full">
      {lines.map((line, index) => {
        let symbolCode = null
        let cleanLine = line

        // Check for Shortcodes (Case insensitive)
        // [S] = Safety, [F] or [C] = Fitment/Function
        if (line.toUpperCase().includes('[S]')) {
          symbolCode = 'circle_double_plus'
          cleanLine = line.replace(/\[S\]/i, '').trim()
        } else if (line.toUpperCase().includes('[F]') || line.toUpperCase().includes('[C]')) {
          symbolCode = 'circle_plus'
          cleanLine = line.replace(/\[(F|C)\]/i, '').trim()
        }

        return (
          // CHANGED: Removed 'justify-between', added 'justify-start'
          <div key={index} className="flex items-start justify-start gap-2 min-h-[14px]">
            
            {/* 1. The Text: Removed 'flex-1' so it doesn't push the symbol away */}
            <span className="whitespace-pre-wrap">{cleanLine}</span>
            
            {/* 2. The Symbol: Appears immediately after the text */}
            {symbolCode && (
              <div className="flex-shrink-0 mt-[1px]">
                <SpecialSymbol code={symbolCode} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
