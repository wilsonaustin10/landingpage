import React from 'react'
import { CheckCircle } from 'lucide-react'

export function Benefits() {
  const Benefits = [
    "We buy houses in any condition",
    "No obligation offer",
    "No fees",
    "Confidential",
    "No repairs necessary",
    "We pay closing costs"
  ]

  return (
    <div className="max-w-3xl mx-auto my-16 px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {Benefits.map((benefit, index) => (
          <div key={index} className="flex items-center space-x-3 text-lg">
            <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
            <span className="text-muted-foreground">{benefit}</span>
          </div>
        ))}
      </div>
    </div>
  )
}