/* eslint-disable @next/next/no-img-element */
import React from 'react'

type Props = {
  customer: string
  logoUrl?: string | null
}

export default function CustomerLogo({ customer, logoUrl }: Props) {
  // 1. If DB has a specific URL, use it
  if (logoUrl) {
    return (
      <img 
        src={logoUrl} 
        alt={customer} 
        className="h-12 w-auto object-contain" 
        onError={(e) => {
          e.currentTarget.style.display = 'none'
        }}
      />
    )
  }

  // 2. Default Fallback Text
  return (
    <div className="h-12 px-4 border border-gray-300 border-dashed flex items-center justify-center text-xs font-bold text-gray-400 uppercase">
      {customer || 'Logo'}
    </div>
  )
}