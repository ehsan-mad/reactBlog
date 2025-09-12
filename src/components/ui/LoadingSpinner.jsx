import React from 'react'

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }
  
  return (
    <div className={`animate-spin ${sizes[size]} ${className}`}>
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4" 
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
        />
      </svg>
    </div>
  )
}

export const LoadingPage = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center min-h-64 py-12">
    <LoadingSpinner size="lg" className="text-gray-700 mb-4" />
    <p className="text-gray-600 text-lg">{message}</p>
  </div>
)

export const LoadingCard = () => (
  <div className="card animate-pulse">
    <div className="aspect-video bg-gray-300 rounded-t-lg"></div>
    <div className="p-6">
      <div className="h-4 bg-gray-300 rounded mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
    </div>
  </div>
)

export const SkeletonCard = () => {
  return (
    <article className="card bg-white overflow-hidden relative">
      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 w-full h-full">
        <div className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      </div>
      
      {/* Image skeleton */}
      <div className="aspect-video bg-gray-200 relative">
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300"></div>
      </div>
      
      {/* Content skeleton */}
      <div className="p-6">
        {/* Category badge skeleton */}
        <div className="mb-3">
          <div className="inline-block bg-gray-200 h-5 w-20 rounded-none"></div>
        </div>
        
        {/* Title skeleton */}
        <div className="space-y-2 mb-3">
          <div className="h-6 bg-gray-200 rounded w-full"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        </div>
        
        {/* Excerpt skeleton */}
        <div className="space-y-1.5 mb-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        
        {/* Meta information skeleton */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="flex space-x-4">
            <div className="h-4 bg-gray-200 rounded w-12"></div>
            <div className="h-4 bg-gray-200 rounded w-12"></div>
          </div>
        </div>
      </div>
    </article>
  )
}

export default LoadingSpinner