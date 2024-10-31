'use client'

import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleStartCounting = () => {
    document.getElementById('CountingSection')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/HeroBG.svg)' }}
      >
        {/* Modern gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60" />
      </div>

      {/* Content Container */}
      <div className="relative h-full flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
        <div 
          className={`max-w-4xl text-center transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extralight text-white mb-6 tracking-tight">
            Smart <span className="font-bold">CCTV Analytics</span>
          </h1>

          {/* Modern Separator */}
          <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-red-600 mx-auto mb-8 rounded-full" />

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-200 mb-12 leading-relaxed font-light max-w-3xl mx-auto">
            Monitor and analyze vehicle movement at intersections in real-time with cutting-edge AI technology.
          </p>

          {/* Modern CTA Button */}
          <button
            onClick={handleStartCounting}
            className="group relative inline-flex items-center justify-center px-8 py-4 bg-red-600 text-white text-lg font-medium rounded-md
                     hover:bg-red-700 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Counting
              <ChevronDown className="w-5 h-5 transition-transform duration-300 group-hover:translate-y-1" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>

        {/* Modern Scroll Indicator */}
        <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-all duration-1000 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="animate-bounce bg-white/10 p-2 rounded-full">
            <ChevronDown className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  )
}