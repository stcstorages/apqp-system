import SpecialSymbol from './SpecialSymbol'

export default function RichText({ content }: { content: string | null }) {
  if (!content) return null

  // Split the text by new lines
  const lines = content.split('\n')

  return (
    <div className="text-left">
      {lines.map((line, index) => {
        let symbolCode = null
        let cleanLine = line

        // Check for Shortcodes
        if (line.trim().startsWith('[S]')) {
          symbolCode = 'circle_double_plus'
          cleanLine = line.replace('[S]', '').trim()
        } else if (line.trim().startsWith('[F]') || line.trim().startsWith('[C]')) {
          symbolCode = 'circle_plus'
          cleanLine = line.replace(/\[(F|C)\]/, '').trim()
        }

        return (
          <div key={index} className="flex items-start gap-2 min-h-[14px]">
            {/* Render Symbol if found, otherwise empty spacer to keep alignment if needed */}
            {symbolCode && (
              <div className="flex-shrink-0 mt-[2px]">
                <SpecialSymbol code={symbolCode} />
              </div>
            )}
            {/* The Text */}
            <span className="whitespace-pre-wrap">{cleanLine}</span>
          </div>
        )
      })}
    </div>
  )
}
