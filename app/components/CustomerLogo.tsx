/* eslint-disable @next/next/no-img-element */
import React from 'react'

type Props = {
  customer: string
  logoUrl?: string | null // Fixed: Added optional logoUrl prop
}

export default function CustomerLogo({ customer, logoUrl }: Props) {
  const c = customer?.toLowerCase() || ''

  // 1. Priority: Use Database URL if available
  if (logoUrl) {
    return (
      <img 
        src={logoUrl} 
        alt={customer} 
        className="h-12 w-auto object-contain" 
        onError={(e) => { e.currentTarget.style.display = 'none' }}
      />
    )
  }

  // 2. Fallback: Hardcoded mapping (Backwards compatibility)
  let hardcodedSrc = ''
  if (c.includes('proton')) hardcodedSrc = '/logos/proton.png'
  else if (c.includes('perodua')) hardcodedSrc = '/logos/perodua.png'
  else if (c.includes('honda')) hardcodedSrc = '/logos/honda.png'
  else if (c.includes('toyota')) hardcodedSrc = '/logos/toyota.png'
  else if (c.includes('mitsubishi')) hardcodedSrc = '/logos/mitsubishi.png'
  else if (c.includes('kayaba')) hardcodedSrc = '/logos/kayaba.png'
  
  if (hardcodedSrc) {
    return (
      <img 
        src={hardcodedSrc} 
        alt={customer} 
        className="h-12 w-auto object-contain" 
        onError={(e) => { e.currentTarget.style.display = 'none' }}
      />
    )
  }

  // 3. Final Fallback: Text
  return (
    <div className="h-12 px-4 border border-gray-300 border-dashed flex items-center justify-center text-xs font-bold text-gray-400 uppercase">
      {customer || 'Logo'}
    </div>
  )
}