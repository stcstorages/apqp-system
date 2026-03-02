/* eslint-disable @next/next/no-img-element */
import React from 'react'

export default function CustomerLogo({ customer }: { customer: string }) {
  const c = customer?.toLowerCase() || ''

  // HARDCODED MAPPING: Name -> File in public/logos/
  let logoSrc = ''
  if (c.includes('proton')) logoSrc = '/logos/proton.png'
  else if (c.includes('perodua')) logoSrc = '/logos/perodua.png'
  else if (c.includes('honda')) logoSrc = '/logos/honda.png'
  else if (c.includes('toyota')) logoSrc = '/logos/toyota.png'
  else if (c.includes('mitsubishi')) logoSrc = '/logos/mitsubishi.png'
  else if (c.includes('kayaba')) logoSrc = '/logos/kayaba.png'
  else if (c.includes('sib')) logoSrc = '/logos/sib.png' // Add your default here if needed
  
  if (logoSrc) {
    return (
      <img 
        src={logoSrc} 
        alt={customer} 
        className="h-12 w-auto object-contain" 
        onError={(e) => { e.currentTarget.style.display = 'none' }}
      />
    )
  }

  return (
    <div className="h-12 px-4 border border-gray-300 border-dashed flex items-center justify-center text-xs font-bold text-gray-400 uppercase">
      {customer || 'Logo'}
    </div>
  )
}