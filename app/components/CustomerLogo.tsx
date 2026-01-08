/* eslint-disable @next/next/no-img-element */
import React from 'react'

export default function CustomerLogo({ customer }: { customer: string }) {
  const c = customer?.toLowerCase() || ''

  // Logic to find the right logo filename
  let logoSrc = ''
  if (c.includes('proton')) logoSrc = '/logos/proton.png'
  else if (c.includes('perodua')) logoSrc = '/logos/perodua.png'
  else if (c.includes('honda')) logoSrc = '/logos/honda.png'
  else if (c.includes('toyota')) logoSrc = '/logos/toyota.png'
  else if (c.includes('mitsubishi')) logoSrc = '/logos/mitsubishi.png'
  else if (c.includes('kayaba')) logoSrc = '/logos/kayaba.png'
  
  // If we have a match, show the image. Otherwise show text.
  if (logoSrc) {
    // UNCOMMENT THIS LINE WHEN YOU HAVE REAL IMAGES IN public/logos/ folder
    // return <img src={logoSrc} alt={customer} className="h-12 w-auto object-contain" />
    
    // Placeholder until you have images:
    return (
      <div className="h-12 px-4 border-2 border-gray-300 border-dashed flex items-center justify-center text-xs font-bold text-gray-400 uppercase">
        {customer} Logo
      </div>
    )
  }

  return <span className="text-sm font-bold">{customer}</span>
}
