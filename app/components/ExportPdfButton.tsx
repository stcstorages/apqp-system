'use client'

import { useState } from 'react'

export default function ExportPdfButton({ url }: { url: string }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = () => {
    setIsLoading(true)
    // Open in new tab
    window.open(url, '_blank')
    
    // Stop spinning after a short delay (since we can't track the new tab loading)
    setTimeout(() => setIsLoading(false), 2000)
  }

  return (
    <button 
      onClick={handleClick}
      disabled={isLoading}
      className={`inline-flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded text-sm font-medium transition ${isLoading ? 'opacity-75 cursor-wait' : 'hover:bg-gray-700'}`}
    >
      {isLoading ? (
        <svg className="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
        </svg>
      )}
      {isLoading ? 'Generating...' : 'Export to PDF'}
    </button>
  )
}