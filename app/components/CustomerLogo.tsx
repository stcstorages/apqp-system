/* eslint-disable @next/next/no-img-element */
import React from 'react'

export default function CustomerLogo({ customer }: { customer: string }) {
  const c = customer?.toLowerCase() || ''

  // 1. Map Customer Names to Filenames in 'public/logos'
  let logoSrc = ''
  if (c.includes('proton')) logoSrc = '/logos/proton.png'
  else if (c.includes('perodua')) logoSrc = '/logos/perodua.png'
  else if (c.includes('honda')) logoSrc = '/logos/honda.png'
  else if (c.includes('toyota')) logoSrc = '/logos/toyota.png'
  else if (c.includes('mitsubishi')) logoSrc = '/logos/mitsubishi.png'
  else if (c.includes('kayaba')) logoSrc = '/logos/kayaba.png'
  
  // 2. If a matching logo is found, show the IMAGE
  if (logoSrc) {
    return (
      <img 
        src={logoSrc} 
        alt={customer} 
        className="h-12 w-auto object-contain" 
      />
    )
  }

  // 3. Fallback: If no image found, show text
  return (
    <div className="h-12 px-4 border border-gray-300 flex items-center justify-center text-xs font-bold text-gray-400 uppercase">
      {customer || 'No Logo'}
    </div>
  )
}