import React from 'react'
import { CheckCircle } from 'lucide-react'

interface BenefitsProps {
  className?: string;
}

export function Benefits({ className }: BenefitsProps) {
  const benefits = [
    "We buy houses in any condition",
    "No obligation offer",
    "No fees",
    "Confidential",
    "No repairs necessary",
    "We pay closing costs"
  ]

  return (
    <div className={`max-w-3xl mx-auto my-16 px-4 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {benefits.map((benefit, index) => (
          <div key={index} className="flex items-center space-x-3 text-xl font-bold">
            <CheckCircle className="h-8 w-8 text-accent text-outline-white flex-shrink-0" />
            <span className="text-gray-700 text-xl font-bold text-outline-white">{benefit}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

