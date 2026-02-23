'use client'

import { useState } from 'react'

export default function PrintControls() {
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape')

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      {/* 
          Dynamic Style Injection 
          We use dangerouslySetInnerHTML to avoid TypeScript errors with 'jsx' attributes
      */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: ${orientation}; margin: 5mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-break { break-inside: avoid; }
        }
      `}} />

      {/* Control Panel (Hidden when printing via Tailwind 'print:hidden' class) */}
      <div className="fixed top-4 right-4 bg-gray-800 text-white p-3 rounded shadow-lg flex items-center gap-4 z-50 print:hidden">
        <div className="flex flex-col">
          <label className="text-[10px] uppercase font-bold text-gray-400">Orientation</label>
          <div className="flex bg-gray-700 rounded mt-1">
            <button 
              onClick={() => setOrientation('portrait')}
              className={`px-3 py-1 text-xs rounded ${orientation === 'portrait' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'}`}
            >
              Portrait
            </button>
            <button 
              onClick={() => setOrientation('landscape')}
              className={`px-3 py-1 text-xs rounded ${orientation === 'landscape' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'}`}
            >
              Landscape
            </button>
          </div>
        </div>

        <button 
          onClick={handlePrint}
          className="bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-2 rounded text-sm h-full flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
          Print Now
        </button>
      </div>
    </>
  )
}